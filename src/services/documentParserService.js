/**
 * Universal Document Parser Service
 * Supports PDF (.pdf), Photos (.jpg, .jpeg, .png, .webp, .bmp), and Text documents (.txt, .md, .rtf).
 * Extracts text and triggers real-time analysis.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromImage, fileToDataUrl, isValidImageFile } from './ocrService';

// Set worker path for pdfjs
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'text/plain',
  'text/markdown',
  'application/rtf'
];

export const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.bmp,.txt,.md,.rtf';

/**
 * Extracts text from ANY uploaded document (PDF, Image, or Text file)
 */
export async function parseUploadedDocument(file, onProgress) {
  if (!file) {
    throw new Error('No file selected');
  }

  const fileName = file.name || 'Document';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  // 1. PDF Document Parsing
  if (file.type === 'application/pdf' || fileExt === 'pdf') {
    if (onProgress) onProgress({ status: 'reading_pdf', progress: 20 });
    return await extractTextFromPdf(file, onProgress);
  }

  // 2. Image / Photo Document Parsing (JPG, PNG, WEBP, BMP)
  if (isValidImageFile(file)) {
    return await extractTextFromImage(file, onProgress);
  }

  // 3. Plain Text / Markdown / RTF Parsing
  if (file.type.startsWith('text/') || ['txt', 'md', 'rtf'].includes(fileExt)) {
    if (onProgress) onProgress({ status: 'reading_text', progress: 50 });
    const text = await readTextFile(file);
    if (onProgress) onProgress({ status: 'done', progress: 100 });
    return {
      text,
      dataUrl: null,
      method: 'Text File Reader'
    };
  }

  // Generic fallback: attempt text read
  try {
    const text = await readTextFile(file);
    if (text && text.trim().length > 10) {
      return { text, dataUrl: null, method: 'Generic Text Reader' };
    }
  } catch (e) {
    // continue
  }

  throw new Error(`Unsupported file format (.${fileExt}). Please upload a PDF, JPG, PNG, or TXT file.`);
}

/**
 * Extracts text from PDF files across all pages
 */
async function extractTextFromPdf(file, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress({
          status: 'extracting_pdf_pages',
          progress: Math.round(20 + (pageNum / numPages) * 70)
        });
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');

      if (pageText.trim()) {
        fullText += `--- PAGE ${pageNum} ---\n${pageText}\n\n`;
      }
    }

    if (onProgress) onProgress({ status: 'done', progress: 100 });

    const trimmed = fullText.trim();
    if (!trimmed || trimmed.length < 15) {
      // If PDF contains only scanned images with no embedded text layer, run image OCR
      throw new Error('This PDF appears to be a scanned image without embedded text. Please upload the document as a JPG or PNG photo for OCR processing.');
    }

    return {
      text: trimmed,
      dataUrl: null,
      method: `PDF Parser (${numPages} page${numPages > 1 ? 's' : ''})`
    };
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
}

/**
 * Reads plain text file
 */
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
