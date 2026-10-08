/**
 * OCR & Image Processing Service
 * Supports JPG, PNG, WEBP document photos with both Gemini Vision and Tesseract.js client-side OCR.
 * Detects and rejects images of persons, selfies, or characters.
 */

import { createWorker } from 'tesseract.js';
import { getStoredApiKey } from './aiService';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/jpg'];
export const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.bmp';

export const PERSON_OR_CHARACTER_ERROR_MSG = 'Image of a person or character should not be uploaded. Please upload a clear photo or scan of a document (e.g., rental agreement, contract, medical consent, or notice).';

/**
 * Validates whether a file is an accepted image format (JPG, PNG, etc.)
 */
export function isValidImageFile(file) {
  if (!file) return false;
  return (
    ACCEPTED_IMAGE_TYPES.includes(file.type) ||
    /\.(jpe?g|png|webp|bmp)$/i.test(file.name)
  );
}

/**
 * Converts File object to Base64 data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts text from an image file (JPG, PNG, etc.)
 * Calls Gemini Vision if API key is stored, otherwise uses client-side Tesseract.js.
 * Rejects images of persons, characters, or non-documents.
 */
export async function extractTextFromImage(file, onProgress) {
  if (!isValidImageFile(file)) {
    throw new Error('Unsupported image format. Please upload a JPG or PNG photo.');
  }

  const fileNameLower = (file.name || '').toLowerCase();
  const personKeywords = [
    'person', 'character', 'avatar', 'selfie', 'portrait', 'face', 'profile',
    'girl', 'boy', 'man', 'woman', 'anime', 'hero', 'cartoon', 'photo', 'picture',
    'human', 'actor', 'model', 'waifu', 'superman', 'batman', 'spiderman', 'naruto', 'goku'
  ];
  const hasPersonFilename = personKeywords.some(kw => fileNameLower.includes(kw));

  const apiKey = getStoredApiKey();
  const dataUrl = await fileToDataUrl(file);

  // If Gemini API Key exists, use Gemini Vision for ultra-fast, high-precision legal OCR & validation
  if (apiKey) {
    try {
      if (onProgress) onProgress({ status: 'analyzing_with_ai', progress: 50 });
      const text = await extractTextWithGeminiVision(dataUrl, file.type || 'image/jpeg', apiKey);
      if (onProgress) onProgress({ status: 'done', progress: 100 });
      return { text, dataUrl, method: 'Gemini Vision AI' };
    } catch (err) {
      // If Gemini explicitly detected a person or character, propagate the error directly
      if (err.message && err.message.includes('Image of a person')) {
        throw err;
      }
      console.warn('Gemini Vision OCR failed, falling back to Tesseract.js:', err);
    }
  }

  // If filename clearly indicates a person/character and Gemini is unavailable, reject immediately
  if (hasPersonFilename) {
    throw new Error(PERSON_OR_CHARACTER_ERROR_MSG);
  }

  // Fallback to client-side Tesseract.js OCR
  try {
    if (onProgress) onProgress({ status: 'initializing_ocr', progress: 10 });

    const worker = await createWorker('eng');

    if (onProgress) {
      onProgress({ status: 'recognizing_text', progress: 40 });
    }

    const ret = await worker.recognize(dataUrl);
    await worker.terminate();

    if (onProgress) onProgress({ status: 'done', progress: 100 });

    const extractedText = ret.data.text ? ret.data.text.trim() : '';

    // If OCR returned empty or very sparse text, this is likely a photo of a person/character or non-document
    if (!extractedText || extractedText.length < 25) {
      throw new Error(PERSON_OR_CHARACTER_ERROR_MSG);
    }

    // Check if the extracted text has common document or agreement words
    const legalDocPatterns = /(agreement|contract|lease|tenant|landlord|party|parties|section|clause|terms|condition|shall|payment|rent|doctor|patient|medical|hospital|notice|hereby|signature|witness|dated|amount|penalty|deposit|consent|government|law|tax|court|property|premises|liability|warrant|indemnif|amendment)/i;
    
    if (!legalDocPatterns.test(extractedText) && extractedText.length < 120) {
      throw new Error(PERSON_OR_CHARACTER_ERROR_MSG);
    }

    return {
      text: extractedText,
      dataUrl,
      method: 'Tesseract OCR'
    };
  } catch (ocrErr) {
    console.error('OCR error:', ocrErr);
    if (ocrErr.message && ocrErr.message.includes('Image of a person')) {
      throw ocrErr;
    }
    throw new Error(ocrErr.message || PERSON_OR_CHARACTER_ERROR_MSG);
  }
}

/**
 * High-accuracy OCR & Image Classification using Google Gemini Vision API
 */
async function extractTextWithGeminiVision(dataUrl, mimeType, apiKey) {
  const base64Data = dataUrl.split(',')[1];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const visionPrompt = `You are an AI document verification and high-precision OCR engine for legal, medical, and government documents.

CRITICAL CLASSIFICATION & OCR RULES:
1. Examine this image carefully:
   - If this image depicts a PERSON, HUMAN FACE, PORTRAIT, SELFIE, CHARACTER (such as an anime character, cartoon, fictional character, superhero, avatar, game character), CELEBRITY, ANIMAL, NATURE, OR NON-DOCUMENT PICTURE with no substantive legal contract, rental agreement, medical record/consent, or government notice:
     You MUST respond with EXACTLY:
     INVALID_IMAGE:PERSON_OR_CHARACTER

2. If this image IS an authentic document, contract, agreement, policy, medical report, or official notice:
   - Transcribe all headings, numbers, clauses, terms, and conditions verbatim.
   - Return ONLY the raw extracted document text without markdown commentary.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: visionPrompt },
            {
              inline_data: {
                mime_type: mimeType.includes('png') ? 'image/png' : 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Vision error: ${errText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text returned from Gemini Vision');

  const trimmedText = text.trim();

  // Check if Gemini detected a person or character
  if (
    trimmedText.includes('INVALID_IMAGE:PERSON_OR_CHARACTER') ||
    trimmedText.includes('INVALID_IMAGE') ||
    /^(this is a photo of a (person|character|man|woman|girl|boy|face)|an image of a (person|character))/i.test(trimmedText)
  ) {
    throw new Error(PERSON_OR_CHARACTER_ERROR_MSG);
  }

  return trimmedText;
}
