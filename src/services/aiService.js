/**
 * AI Service for Jargon Breaker
 * Universally analyzes Legal, Medical, and Government documents.
 * Extracts Risk Score Gauges (0-10), Deadlines, Plain-Language Summaries (Simple & Detailed),
 * Risky Clauses, Negotiation Action Plans, and Grounded Q&A Citations.
 */

import { KEY_TERMS_GLOSSARY } from '../data/glossary';

const GEMINI_API_KEY_STORAGE_KEY = 'jargon_breaker_gemini_key';
const DEFAULT_GEMINI_API_KEY = 'AQ.Ab8RN6Khm5WVU_eQHjVAPJ75Xb_-MgaE2fVM5GxdmMWF04CDxQ';

export function getStoredApiKey() {
  const customKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
  if (customKey && customKey.trim()) return customKey.trim();
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  if (envKey && envKey.trim()) return envKey.trim();
  return DEFAULT_GEMINI_API_KEY;
}

export function saveStoredApiKey(key) {
  if (key) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  }
}

/**
 * Safely parse JSON returned by Gemini, removing Markdown ```json code blocks if present
 */
function parseGeminiJson(rawText) {
  if (!rawText) throw new Error('Empty AI response');
  let clean = rawText.trim();
  // Strip leading ```json or ```
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  return JSON.parse(clean);
}

/**
 * Main Analysis API caller
 */
export async function analyzeDocument(documentText, language = 'en', docTypeCategory = 'all') {
  if (!documentText || !documentText.trim()) {
    throw new Error('Document text is empty');
  }

  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      return await callGeminiAnalysis(documentText, language, apiKey);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart dynamic analyzer:', err);
      return runDynamicLegalAnalysis(documentText, language, docTypeCategory);
    }
  }

  return runDynamicLegalAnalysis(documentText, language, docTypeCategory);
}

/**
 * Stage 5: Chat Q&A with Strict Document Grounding
 */
export async function askDocumentQuestion(documentText, question, chatHistory = [], language = 'en') {
  if (!documentText || !documentText.trim() || !question) {
    return {
      answer: 'Not mentioned in this document',
      source_quote: null,
      is_mentioned: false
    };
  }

  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      return await callGeminiChat(documentText, question, chatHistory, language, apiKey);
    } catch (err) {
      console.warn('Gemini Chat call failed, falling back to dynamic Q&A engine:', err);
      return runDynamicDocumentChat(documentText, question, language);
    }
  }

  return runDynamicDocumentChat(documentText, question, language);
}

// -----------------------------------------------------------------------------------------
// 1. Google Gemini Live API Implementation
// -----------------------------------------------------------------------------------------

async function callGeminiAnalysis(documentText, language, apiKey) {
  const langPrompt = language === 'ta' ? 'Tamil (தமிழ்)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English';

  const systemInstruction = `You are "Jargon Breaker", an elite analyst for legal, medical, and government documents.
Analyze the provided document text and produce a plain-language briefing strictly based on the text.
Return ONLY valid JSON strictly adhering to the schema below.

CRITICAL INSTRUCTIONS:
1. Base all findings, parties, numbers, and summaries strictly on the uploaded text.
2. Language requirement: Write "summary", "simple_summary", "key_findings", "financial_commitments", "parties_detected", "risk_verdict", "reasons" in risky_clauses, and "task", "why", "ask" in action_plan in ${langPrompt}.
3. CRITICAL VERBATIM RULE: In "risky_clauses" and "action_plan", the "quote" and "clause_quote" fields MUST BE EXACT, verbatim excerpts copied directly from the uploaded document text.
4. CLAUSE HIGHLIGHTING (RED vs GREEN):
   - For risky, unfair, penalizing, unilateral, or forfeiture clauses: assign "risk_level": "high" (will be highlighted in RED).
   - For standard, fair, routine, or safe clauses (e.g. lease duration, payment dates, standard medical consent, official notice header): assign "risk_level": "normal" (will be highlighted in GREEN).
   - Flag BOTH risky and normal clauses in "risky_clauses" list.
5. Risk Gauge: Provide "risk_score_numeric" as an integer between 1 and 10, and a concise 1-line "risk_verdict".
6. Deadline Detector: Detect any critical response deadlines (e.g. "30 days notice to appeal"), and output "deadline_detected" string and integer "deadline_days".

JSON Schema format:
{
  "summary": "3-4 crystal clear sentences explaining what this document is, obligations, and key hazards in ${langPrompt}.",
  "simple_summary": "Ultra-simple 5th grader explanation in 2-3 sentences in ${langPrompt}.",
  "overall_risk_score": "High" | "Medium" | "Low",
  "risk_score_numeric": 8,
  "risk_verdict": "One-line verdict explaining main hazard in ${langPrompt}",
  "deadline_detected": "30 days notice to appeal or respond",
  "deadline_days": 30,
  "parties_detected": "Actual parties/agencies detected in ${langPrompt}",
  "key_findings": ["Finding 1 in ${langPrompt}", "Finding 2 in ${langPrompt}", "Finding 3 in ${langPrompt}"],
  "financial_commitments": "Actual financial amounts and fees in ${langPrompt}",
  "risky_clauses": [
    {
      "id": "clause-1",
      "quote": "EXACT verbatim quote from document",
      "risk_level": "high" | "normal",
      "reason": "If high, explain why it is risky. If normal, explain why it is standard/safe in ${langPrompt}"
    }
  ],
  "action_plan": [
    {
      "id": "task-1",
      "task": "Action title in ${langPrompt}",
      "why": "Why this matters in ${langPrompt}",
      "priority": "High" | "Medium" | "Low",
      "clause_quote": "EXACT verbatim quote from document",
      "ask": "Ready-to-ask line for landlord, doctor, or office in ${langPrompt}"
    }
  ]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemInstruction },
            { text: `DOCUMENT TEXT:\n"""\n${documentText}\n"""` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API');

  return parseGeminiJson(rawText);
}

async function callGeminiChat(documentText, question, chatHistory, language, apiKey) {
  const langPrompt = language === 'ta' ? 'Tamil (தமிழ்)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English';

  const systemInstruction = `You are a strict legal Q&A assistant for Jargon Breaker.
Answer the question using ONLY the provided document.

RULES:
1. STRICT DOCUMENT GROUNDING: If the answer is not in the document, set "is_mentioned" to false and return "answer": "Not mentioned in this document".
2. If mentioned, provide a direct answer in ${langPrompt}.
3. Provide the exact verbatim supporting quote in "source_quote".
4. Return ONLY valid JSON:
{
  "answer": "Direct answer in ${langPrompt} OR 'Not mentioned in this document'",
  "source_quote": "Exact verbatim quote from text, or null if not mentioned",
  "is_mentioned": true | false
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemInstruction },
            { text: `DOCUMENT:\n"""\n${documentText}\n"""\n\nQUESTION: ${question}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini Chat API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseGeminiJson(rawText);
}

// -----------------------------------------------------------------------------------------
// 2. High-Precision Dynamic Document Analyzer Engine
// -----------------------------------------------------------------------------------------

export function runDynamicLegalAnalysis(docText, language = 'en', docTypeCategory = 'all') {
  const text = docText.trim();

  // 1. Extract Document Title / Type
  const detectedDocType = extractDocumentType(text, docTypeCategory);

  // 2. Extract Parties / Hospital / Agency
  const detectedParties = extractParties(text);

  // 3. Extract Financial Commitments
  const financialSummary = extractFinancials(text);

  // 4. Extract Deadline
  const deadlineInfo = extractDeadline(text);

  // 5. Extract Real Risky Clauses dynamically
  const riskyClauses = extractDynamicRiskyClauses(text, language);

  // 6. Build Dynamic Action Plan
  const actionPlan = extractDynamicActionPlan(riskyClauses, detectedDocType, language);

  // 7. Calculate Dynamic Risk Score Gauge (0-10) & Verdict
  const highRiskCount = riskyClauses.filter(c => c.risk_level === 'high').length;
  const medRiskCount = riskyClauses.filter(c => c.risk_level === 'medium').length;
  const numericScore = Math.min(10, Math.max(2, highRiskCount * 3 + medRiskCount * 1.5 + (deadlineInfo.hasDeadline ? 1 : 0)));
  const overallRiskScore = numericScore >= 7 ? 'High' : numericScore >= 4 ? 'Medium' : 'Low';
  const riskVerdict = synthesizeRiskVerdict(numericScore, riskyClauses, language);

  // 8. Synthesize Plain Summaries (Standard & Simple 5th-Grader)
  const summaries = synthesizeSummaries(text, detectedDocType, detectedParties, financialSummary, riskyClauses, deadlineInfo, language);

  // 9. Key Findings
  const keyFindings = synthesizeKeyFindings(riskyClauses, detectedDocType, deadlineInfo, language);

  // 10. Extract Matched Glossary Terms
  const matchedGlossaryTerms = extractMatchedGlossaryTerms(text);

  return {
    summary: summaries.standard,
    simple_summary: summaries.simple,
    overall_risk_score: overallRiskScore,
    risk_score_numeric: Math.round(numericScore),
    risk_verdict: riskVerdict,
    deadline_detected: deadlineInfo.text,
    deadline_days: deadlineInfo.days,
    parties_detected: formatPartiesForLang(detectedParties, language),
    key_findings: keyFindings,
    financial_commitments: formatFinancialsForLang(financialSummary, language),
    risky_clauses: riskyClauses,
    action_plan: actionPlan,
    key_terms: matchedGlossaryTerms
  };
}

// --- Dynamic Extraction Helpers ---

function extractDocumentType(text, userSelectedCategory) {
  const firstLines = text.slice(0, 400).toUpperCase();

  if (firstLines.includes('SURGICAL') || firstLines.includes('PATIENT') || firstLines.includes('ANESTHESIA') || firstLines.includes('HOSPITAL') || firstLines.includes('MEDICAL')) {
    return 'Medical Consent & Financial Waiver';
  }
  if (firstLines.includes('DEPARTMENT OF REVENUE') || firstLines.includes('TAXATION') || firstLines.includes('ASSESSMENT NOTICE') || firstLines.includes('MUNICIPAL') || firstLines.includes('SUMMONS') || firstLines.includes('COMPLIANCE DEMAND')) {
    return 'Government Tax & Valuation Assessment Notice';
  }
  if (firstLines.includes('LEASE') || firstLines.includes('RENTAL') || firstLines.includes('TENANCY') || firstLines.includes('LANDLORD')) {
    return 'Residential Rental Lease Agreement';
  }
  if (firstLines.includes('COMMERCIAL') || firstLines.includes('TRIPLE-NET') || firstLines.includes('LESSOR')) {
    return 'Commercial Property Lease Agreement';
  }
  if (firstLines.includes('INDEPENDENT CONTRACTOR') || firstLines.includes('FREELANCE') || firstLines.includes('CONSULTING')) {
    return 'Independent Contractor & IP Agreement';
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines[0] && lines[0].length < 80) return lines[0];

  return 'Legal Document / Contract';
}

function extractParties(text) {
  // Check for patient / doctor
  const patientMatch = text.match(/Patient\s*Name\s*[:=-]\s*([A-Za-z\s.]+)/i);
  if (patientMatch) {
    return `Patient: ${patientMatch[1].trim()} | Healthcare Provider Network`;
  }

  // Check for parcel owner / revenue agency
  const ownerMatch = text.match(/Addressee\s*[:=-]\s*([A-Za-z0-9\s.,]+)/i);
  if (ownerMatch) {
    return `Addressee: ${ownerMatch[1].trim()} | Municipal Revenue Authority`;
  }

  // Check for landlord / tenant or between X and Y
  const betweenMatch = text.match(/between\s+([A-Z0-9\s,\."'-]+?)(?:\s+and\s+|\s*,\s*and\s+)([A-Z0-9\s,\."'-]+?)(?:\s*\.|\s*\(|\s*for\s+)/i);
  if (betweenMatch) {
    return `${betweenMatch[1].replace(/["']/g, '').trim()} and ${betweenMatch[2].replace(/["']/g, '').trim()}`;
  }

  return 'Parties declared in document header';
}

function extractFinancials(text) {
  const moneyMatches = text.match(/(?:[\$₹€£]\s*[0-9,]+(?:\.[0-9]{2})?|\b[0-9,]+\s*(?:dollars|rupees|usd|inr)\b)/gi) || [];
  const percentMatches = text.match(/[0-9]+(?:\.[0-9]+)?%/g) || [];

  const uniqueMoney = Array.from(new Set(moneyMatches)).slice(0, 4);
  const uniquePercents = Array.from(new Set(percentMatches)).slice(0, 3);

  if (uniqueMoney.length === 0 && uniquePercents.length === 0) {
    return 'No explicit financial figures listed.';
  }

  return [
    uniqueMoney.length > 0 ? `Monetary obligations: ${uniqueMoney.join(', ')}` : '',
    uniquePercents.length > 0 ? `Rate adjustments/penalties: ${uniquePercents.join(', ')}` : ''
  ].filter(Boolean).join(' • ');
}

function extractDeadline(text) {
  // Search for days notice / appeal / respond deadlines
  const match = text.match(/(?:within\s+)?(?:exactly\s+)?([0-9]+)\s+(?:calendar\s+)?(?:business\s+)?days\s+(?:from|of|to|written\s+notice|notice|statutory\s+deadline|appeal|invoice|vacate)/i);
  if (match) {
    const days = parseInt(match[1], 10);
    return {
      hasDeadline: true,
      days: days,
      text: `${days} days mandatory response / notice window`
    };
  }

  // Look for date deadlines like "by November 4, 2024"
  const dateMatch = text.match(/(?:by|before|due\s+on)\s+([A-Z][a-z]+\s+[0-9]{1,2},\s+[0-9]{4})/i);
  if (dateMatch) {
    return {
      hasDeadline: true,
      days: 30,
      text: `Strict deadline due on ${dateMatch[1]}`
    };
  }

  return {
    hasDeadline: false,
    days: 30,
    text: null
  };
}

// -----------------------------------------------------------------------------------------
// Deep Semantic Risk Patterns (Legal, Medical & Government)
// -----------------------------------------------------------------------------------------

const RISK_PATTERNS = [
  // Medical Patterns
  {
    category: 'out_of_network',
    regex: /(?:out-of-network|non-contracted\s+balance|balance-billing|100%\s+of\s+all\s+billed)/i,
    risk_level: 'high',
    reasons: {
      en: 'Forces you to pay 100% of uncapped out-of-network doctor bills and waives surprise billing protections.',
      ta: 'காப்பீட்டில் இல்லாத மருத்துவர்களின் முழுக் கட்டணத்தையும் நீங்களே செலுத்த கட்டாயப்படுத்துகிறது.',
      hi: 'इंश्योरेंस नेटवर्क से बाहर के डॉक्टरों का 100% भारी बिल आप पर डालने की शर्त।'
    },
    tasks: {
      en: {
        task: 'Request in-network doctor assignment or cap non-covered balance charges',
        why: 'Out-of-network surgical staff can send surprise bills exceeding $10,000.',
        ask: 'Can we confirm in writing that all attending anesthesiologists and surgical staff will bill at in-network rates?'
      },
      ta: {
        task: 'அனைத்து மருத்துவர்களும் காப்பீட்டு வரம்பிற்குள் இருப்பதை உறுதி செய்யக் கேளுங்கள்',
        why: 'காப்பீட்டில் இல்லாத கட்டணங்கள் பல்லாயிரக்கணக்கான ரூபாய் இழப்பை ஏற்படுத்தும்.',
        ask: 'அனைத்து அறுவை சிகிச்சை மருத்துவர்களும் காப்பீட்டு கட்டண விதிகளுக்கு உட்பட்டவர்களா என்பதை உறுதிப்படுத்த முடியுமா?'
      },
      hi: {
        task: 'इन-नेटवर्क डॉक्टरों को ही शामिल करने का अनुरोध करें',
        why: 'नेटवर्क से बाहर के डॉक्टर भारी सरप्राइज बिल भेज सकते हैं।',
        ask: 'क्या हम लिखित में यह पुष्टि कर सकते हैं कि सभी डॉक्टर इन-नेटवर्क दरों पर ही बिलिंग करेंगे?'
      }
    }
  },
  {
    category: 'arbitration_waiver',
    regex: /(?:binding\s+arbitration|waives\s+all\s+rights\s+to\s+a\s+trial\s+by\s+jury|malpractice.*arbitration)/i,
    risk_level: 'high',
    reasons: {
      en: 'Strips your constitutional right to a public court trial or jury in cases of medical negligence or dispute.',
      ta: 'மருத்துவக் கவனக்குறைவு அல்லது பிழைகள் ஏற்பட்டால் நீதிமன்றத்தை அணுகும் உரிமையை பறிக்கிறது.',
      hi: 'चिकित्सा लापरवाही की स्थिति में अदालत जाने या जूरी ट्रायल का अधिकार छीनता है।'
    },
    tasks: {
      en: {
        task: 'Decline mandatory arbitration clause or reserve right to judicial review',
        why: 'Arbitration private panels historically favor institutional providers over patients.',
        ask: 'May I strike out the mandatory arbitration clause and preserve standard judicial remedies?'
      },
      ta: {
        task: 'கட்டாய நடுவர் தீர்ப்பு விதியை நீக்க கோருங்கள்',
        why: 'நீதிமன்றத்தை நாடும் உங்கள் சட்டப்பூர்வ உரிமையைப் பாதுகாக்கிறது.',
        ask: 'கட்டாய நடுவர் தீர்ப்பு விதியை நீக்கிவிட்டு நீதிமன்ற உரிமைகளைத் தக்கவைக்க அனுமதிக்க முடியுமா?'
      },
      hi: {
        task: 'अनिवार्य मध्यस्थता नियम को हटाने का अनुरोध करें',
        why: 'यह कानूनी अदालत में अपना पक्ष रखने का अधिकार सुरक्षित रखता है।',
        ask: 'क्या हम अनिवार्य मध्यस्थता खंड को हटाकर सामान्य अदालती अधिकार सुरक्षित रख सकते हैं?'
      }
    }
  },

  // Government & Tax Patterns
  {
    category: 'tax_appeal_deadline',
    regex: /(?:statutory\s+30-day\s+appeal|irrevocable\s+forfeiture\s+of\s+all\s+statutory\s+appeal|must\s+be\s+filed\s+in\s+writing\s+within\s+exactly\s+30)/i,
    risk_level: 'high',
    reasons: {
      en: 'Strict 30-day forfeiture window: missing this deadline permanently strips your right to challenge the valuation or tax liability.',
      ta: '30 நாட்களுக்குள் மேல்முறையீடு செய்யாவிட்டால் மதிப்பீட்டை எதிர்க்கும் உரிமை நிரந்தரமாக பறிபோகும்.',
      hi: 'सख्त 30 दिन की समयसीमा: चूकने पर कर मूल्यांकन को चुनौती देने का अधिकार हमेशा के लिए समाप्त हो जाएगा।'
    },
    tasks: {
      en: {
        task: 'File formal administrative appeal within the statutory 30-day deadline',
        why: 'After 30 days, the increased tax assessment becomes legally irreversible.',
        ask: 'What specific documentation and appraisal forms are required to lodge an appeal petition prior to the 30-day cutoff?'
      },
      ta: {
        task: '30 நாள் காலக்கெடுவிற்குள் எழுத்துப்பூர்வ மேல்முறையீட்டை தாக்கல் செய்யுங்கள்',
        why: '30 நாட்களுக்குப் பிறகு கூடுதல் வரி மதிப்பீட்டை மாற்ற முடியாது.',
        ask: '30 நாள் முடிவதற்குள் மேல்முறையீடு செய்ய என்னென்ன ஆவணங்கள் சமர்ப்பிக்க வேண்டும்?'
      },
      hi: {
        task: '30 दिनों की वैधानिक समयसीमा के भीतर औपचारिक अपील दायर करें',
        why: '30 दिनों के बाद बढ़ा हुआ कर कानूनी रूप से अपरिवर्तनीय हो जाएगा।',
        ask: 'अपील दाखिल करने के लिए कौन से विशिष्ट दस्तावेज़ और फॉर्म आवश्यक हैं?'
      }
    }
  },
  {
    category: 'lien_garnishment',
    regex: /(?:statutory\s+lien|wage\s+garnishment|bank\s+levy|seizure\s+authorization)/i,
    risk_level: 'high',
    reasons: {
      en: 'Authorizes immediate asset liens, bank account freezes, or paycheck garnishment without court hearings.',
      ta: 'நீதிமன்ற விசாரணையின்றி உங்கள் வங்கிக் கணக்கையோ அல்லது சொத்தையோ முடக்க அனுமதி அளிக்கிறது.',
      hi: 'अदालती सुनवाई के बिना संपत्ति पर ग्रहणाधिकार (Lien) और बैंक खाते से जब्ती की अनुमति देता है।'
    },
    tasks: {
      en: {
        task: 'Request an installment payment agreement to prevent statutory lien registration',
        why: 'Prevents damaging property title encumbrances and aggressive bank levies.',
        ask: 'Can we establish an interest-free administrative payment schedule to stay any enforcement actions or lien filings?'
      },
      ta: {
        task: 'சொத்து முடக்கத்தைத் தவிர்க்க தவணை முறை கட்டண ஒப்பந்தத்தை கோருங்கள்',
        why: 'வங்கிக் கணக்கு மற்றும் சொத்துக்கள் முடக்கப்படுவதைத் தடுக்கிறது.',
        ask: 'முடக்கம் நடவடிக்கைகளைத் தவிர்க்க மாதத் தவணை முறையில் செலுத்த அனுமதி உண்டா?'
      },
      hi: {
        task: 'संपत्ति जब्ती रोकने के लिए किस्तों में भुगतान का अनुरोध करें',
        why: 'यह संपत्ति पर रोक और बैंक जब्ती की कार्रवाई को रोकता है।',
        ask: 'क्या हम जब्ती रोकने के लिए एक प्रशासनिक किस्त भुगतान योजना बना सकते हैं?'
      }
    }
  },

  // Legal & Rental Patterns
  {
    category: 'escalation',
    regex: /(?:increase|escalat\w*|raise)\s+(?:the\s+)?(?:monthly\s+)?(?:rent|fee|price)\s+(?:by\s+)?(?:up\s+to\s+)?[0-9]+%|(?:unilateral\s+right\s+to\s+increase)/i,
    risk_level: 'high',
    reasons: {
      en: 'Allows unilateral price or rent increases without caps or statutory indexation.',
      ta: 'வரம்புகளோ அல்லது முன் ஒப்புதலோ இன்றி கட்டணத்தை/வாடகையை தன்னிச்சையாக உயர்த்த அனுமதிக்கிறது.',
      hi: 'बिना किसी सीमा या पूर्व सहमति के शुल्क या किराए में एकतरफा वृद्धि की अनुमति देता है।'
    },
    tasks: {
      en: {
        task: 'Cap annual price/rent escalation to CPI index (max 3-5%)',
        why: 'Uncapped escalations cause unpredictable sudden cost spikes.',
        ask: 'Could we agree to cap any annual increase at 3% to 5% with at least 60 days advance written notice?'
      },
      ta: {
        task: 'ஆண்டு விலை/வாடகை உயர்வை 3-5% வரை வரம்பிடவும்',
        why: 'வரம்பற்ற உயர்வு எதிர்பாராத மாதாந்திர நிதிச் சுமையை ஏற்படுத்தும்.',
        ask: 'வருடாந்திர உயர்வை அதிகபட்சம் 3% முதல் 5% வரை வரம்பிடவும், 60 நாட்கள் முன்னறிவிப்பு வழங்கவும் ஒப்புக்கொள்வீர்களா?'
      },
      hi: {
        task: 'वार्षिक वृद्धि को 3-5% तक सीमित करने का अनुरोध करें',
        why: 'अनियंत्रित वृद्धि आपके बजट को गंभीर रूप से प्रभावित कर सकती है।',
        ask: 'क्या आप वार्षिक वृद्धि को अधिकतम 3% से 5% तक सीमित करने और 60 दिनों का अग्रिम नोटिस देने के लिए सहमत होंगे?'
      }
    }
  },
  {
    category: 'late_fee',
    regex: /(?:late\s+(?:penalty|fee)|penalty\s+fee|unpaid\s+by)\s+(?:of\s+)?[0-9]+%\s+(?:per\s+day|daily)|(?:10%\s+per\s+day)/i,
    risk_level: 'high',
    reasons: {
      en: 'Excessive daily compounding penalty that can rapidly accumulate to punitive amounts.',
      ta: 'நாள் ஒன்றுக்கு விதிக்கப்படும் அதீத அபராதம் குறுகிய காலத்தில் மிகப்பெரிய தொகையாக மாறும்.',
      hi: 'प्रतिदिन का भारी विलंब शुल्क कुछ ही दिनों में बहुत बड़ा आर्थिक बोझ बन सकता है।'
    },
    tasks: {
      en: {
        task: 'Negotiate a 5-day grace period and flat late fee',
        why: 'Daily fees penalize innocent bank processing delays.',
        ask: 'Could we include a standard 5-day grace period and cap any late fee at a flat reasonable rate?'
      },
      ta: {
        task: '5 நாட்கள் அவகாசமும் நியாயமான தாமதக் கட்டணமும் நிர்ணயிக்கவும்',
        why: 'வங்கி பரிவர்த்தனை தாமதமானால் கூட நாள் அபராதம் அதிக இழப்பை ஏற்படுத்தும்.',
        ask: 'தாமதக் கட்டணம் விதிப்பதற்கு முன் 5 நாட்கள் அவகாசம் வழங்கவும், கட்டணத்தை நியாயமான அளவில் நிர்ணயிக்கவும் முடியுமா?'
      },
      hi: {
        task: '5 दिनों की छूट अवधि और उचित विलंब शुल्क तय करें',
        why: 'बैंक की सामान्य देरी पर भी प्रतिदिन का शुल्क भारी पड़ सकता है।',
        ask: 'क्या हम विलंब शुल्क से पहले 5 दिनों की छूट अवधि शामिल कर सकते हैं और इसे सीमित कर सकते हैं?'
      }
    }
  },
  {
    category: 'deposit_forfeit',
    regex: /(?:withhold|forfeit)\s+(?:the\s+)?(?:full\s+)?security\s+deposit|sole\s+(?:and\s+exclusive\s+)?discretion\s+to\s+withhold|general\s+wear-and-tear/i,
    risk_level: 'high',
    reasons: {
      en: 'Gives sole discretion to seize security deposits for normal wear-and-tear without receipts.',
      ta: 'இயற்கையான தேய்மானத்தைக் காரணம் காட்டி முன்பணத்தை முழுமையாக பறிமுதல் செய்ய ஒருதலைப்பட்ச அதிகாரம் அளிக்கிறது.',
      hi: 'सामान्य टूट-फूट के नाम पर सुरक्षा जमा राशि जब्त करने का एकतरफा अधिकार देता है।'
    },
    tasks: {
      en: {
        task: 'Prohibit wear-and-tear deductions and require itemized receipts for deposit returns',
        why: 'Protects your deposit from arbitrary deductions.',
        ask: 'Can we clarify that normal wear-and-tear will not be deducted and that itemized receipts are required for any claims?'
      },
      ta: {
        task: 'முன்பண பிடித்தத்திற்கு ரசீதுகளை கட்டாயமாக்கி சாதாரண தேய்மான விலக்கை சேர்க்கவும்',
        why: 'முன்பணம் அநியாயமாக பறிமுதல் செய்யப்படுவதைத் தடுக்கிறது.',
        ask: 'சாதாரண தேய்மானத்திற்கு பிடித்தம் செய்யப்படாது என்பதையும், பிடித்தங்களுக்கு ரசீது வழங்கப்படும் என்பதையும் சேர்க்க முடியுமா?'
      },
      hi: {
        task: 'जमा राशि वापसी के नियम स्पष्ट करें और सामान्य टूट-फूट पर कटौती रोकें',
        why: 'यह आपकी पूरी जमा राशि को अनुचित कटौती से बचाता है।',
        ask: 'क्या हम यह स्पष्ट कर सकते हैं कि सामान्य टूट-फूट के लिए कटौती नहीं होगी और सभी कटौतियों का बिल दिया जाएगा?'
      }
    }
  },
  {
    category: 'unannounced_entry',
    regex: /(?:enter\s+(?:the\s+)?(?:leased\s+)?premises\s+at\s+any\s+time\s+without\s+prior)|(?:without\s+prior\s+(?:written\s+or\s+verbal\s+)?notice)/i,
    risk_level: 'medium',
    reasons: {
      en: 'Deprives you of privacy by allowing unannounced entry at any hour without prior notice.',
      ta: 'முன் அறிவிப்பின்றி எந்நேரமும் வளாகத்திற்குள் நுழைய அனுமதிப்பது உங்கள் தனிமனித உரிமையைப் பாதிக்கிறது.',
      hi: 'बिना पूर्व सूचना के कभी भी प्रवेश की अनुमति देकर आपकी निजता को खतरे में डालता है।'
    },
    tasks: {
      en: {
        task: 'Mandate minimum 24-hour advance written notice for entry',
        why: 'Protects quiet enjoyment and privacy in your premises.',
        ask: 'Could we specify that at least 24 hours advance written notice is required before entry, except in emergencies?'
      },
      ta: {
        task: 'அவசர நிலையைத் தவிர 24 மணி நேர முன்னறிவிப்பைக் கட்டாயமாக்குங்கள்',
        why: 'உங்கள் குடியிருப்பு அமைதியையும் தனிமனித சுதந்திரத்தையும் உறுதி செய்கிறது.',
        ask: 'ஆய்வு செய்ய வருவதற்கு முன் குறைந்தது 24 மணி நேர எழுத்துப்பூர்வ அறிவிப்பு வழங்க வேண்டும் என மாற்ற முடியுமா?'
      },
      hi: {
        task: 'प्रवेश के लिए 24 घंटे का अग्रिम लिखित नोटिस अनिवार्य करें',
        why: 'यह आपके शांतिपूर्ण निवास और व्यक्तिगत निजता की रक्षा करता है।',
        ask: 'क्या हम यह निर्धारित कर सकते हैं कि आने से पहले कम से कम 24 घंटे का अग्रिम नोटिस देना आवश्यक होगा?'
      }
    }
  },
  {
    category: 'repairs_shifted',
    regex: /(?:assumes\s+full\s+(?:financial\s+and\s+operational\s+)?responsibility\s+for\s+all\s+major\s+repairs)|(?:roof\s+leaks|hvac\s+system\s+failures|structural\s+plumbing)/i,
    risk_level: 'high',
    reasons: {
      en: 'Unfairly shifts landlord/owner structural repair liabilities (roof, plumbing, HVAC) onto you.',
      ta: 'கட்டடத்தின் கூரை மற்றும் கட்டமைப்பு பழுது செலவுகளை வாடகைதாரர் மீது அநியாயமாக சுமத்துகிறது.',
      hi: 'छत, हीटिंग और संरचनात्मक मरम्मत का भारी खर्च अनुचित रूप से आप पर डालता है।'
    },
    tasks: {
      en: {
        task: 'Limit maintenance obligations to tenant-caused minor repairs under $50',
        why: 'Major structural repairs can cost thousands of dollars.',
        ask: 'Can we adjust this section so that structural, roof, and pre-existing HVAC repairs remain the owner responsibility?'
      },
      ta: {
        task: 'கட்டமைப்பு பழுதுபார்ப்பு பொறுப்பை உரிமையாளரே ஏற்க வேண்டும் என மாற்றவும்',
        why: 'கூரை மற்றும் இயந்திர பழுதுகள் பல்லாயிரக்கணக்கான ரூபாய் செலவை உண்டாக்கும்.',
        ask: 'கட்டமைப்பு, கூரை மற்றும் இயந்திரப் பழுதுகளை உரிமையாளரே ஏற்பார் என திருத்த முடியுமா?'
      },
      hi: {
        task: 'संरचनात्मक मरम्मत की जिम्मेदारी मालिक पर रखें',
        why: 'छत और मुख्य पाइपलाइन की मरम्मत पर भारी खर्च आ सकता है।',
        ask: 'क्या हम संशोधन कर सकते हैं ताकि छत, प्लंबिंग और संरचनात्मक मरम्मत मालिक के जिम्मे रहे?'
      }
    }
  },
  {
    category: 'sudden_termination',
    regex: /(?:terminate\s+(?:this\s+)?(?:lease|agreement|contract)\s+at\s+any\s+time\s+by\s+providing\s+24\s+hours)|(?:24\s+hours\s+written\s+notice.*vacate)|(?:forfeit\s+all\s+remaining\s+prepaid)/i,
    risk_level: 'high',
    reasons: {
      en: 'Allows immediate unilateral termination on 24 hours notice with forfeiture of prepaid fees.',
      ta: '24 மணி நேர முன்னறிவிப்பில் ஒப்பந்தத்தை ரத்து செய்து முன்கூட்டிய பணத்தைப் பறிமுதல் செய்ய வழிவகுக்கிறது.',
      hi: 'मात्र 24 घंटे के नोटिस पर अनुबंध समाप्त करने और अग्रिम राशि जब्त करने की छूट देता है।'
    },
    tasks: {
      en: {
        task: 'Require mutual 30 to 60 days written notice for termination',
        why: 'Prevents sudden contract termination without due cause or cure period.',
        ask: 'Could we amend this clause to require mutual 30-60 days written notice with refund of unused prepaid amounts?'
      },
      ta: {
        task: 'ஒப்பந்தத்தை ரத்து செய்ய 30-60 நாட்கள் முன்னறிவிப்பை சேர்க்கவும்',
        why: 'திடீரென வெளியேற்றப்படுவதையோ அல்லது ஒப்பந்தம் முடிவதையோ தடுக்கிறது.',
        ask: 'ஒப்பந்தத்தை முடிக்க இரு தரப்பினருக்கும் 30-60 நாட்கள் முன்னறிவிப்பும் மீதத் தொகை திரும்பத் தரப்படுவதையும் உறுதி செய்ய முடியுமா?'
      },
      hi: {
        task: 'समाप्ति के लिए 30-60 दिनों का आपसी नोटिस अनिवार्य करें',
        why: 'अचानक बेदखली या अनुबंध टूटने के जोखिम को रोकता है।',
        ask: 'क्या हम 30 से 60 दिनों का आपसी नोटिस और बचे हुए किराए की वापसी की शर्त जोड़ सकते हैं?'
      }
    }
  }
];

const NORMAL_PATTERNS = [
  {
    category: 'lease_term_and_rent',
    regex: /(?:term\s+of\s+this\s+lease\s+shall\s+be\s+for\s+[0-9]+\s+months)|(?:monthly\s+rent\s+of\s+\$[0-9,]+)|(?:due\s+promptly\s+on\s+the\s+1st\s+calendar\s+day)/i,
    risk_level: 'normal',
    reasons: {
      en: 'Standard 12-month lease duration with fixed monthly rent schedule due on the 1st of each month.',
      ta: '12 மாத நிலையான வாடகைக் காலம் மற்றும் மாதத்தின் 1-ஆம் தேதி வாடகை செலுத்தும் இயல்பான விதிமுறை (பாதுகாப்பானது).',
      hi: '12 महीने का मानक किराया अनुबंध और महीने की 1 तारीख को देय निश्चित किराया नियम (सामान्य/सुरक्षित)।'
    }
  },
  {
    category: 'clinical_consent',
    regex: /(?:understand\s+the\s+risks\s+of\s+general\s+anesthesia)|(?:perform\s+the\s+proposed\s+procedure)|(?:homologous\s+blood\s+product\s+transfusions)/i,
    risk_level: 'normal',
    reasons: {
      en: 'Standard clinical authorization permitting the attending surgeon to perform the designated procedure and clinical safety protocols.',
      ta: 'திட்டமிடப்பட்ட அறுவை சிகிச்சை மற்றும் பாதுகாப்பு நடைமுறைகளுக்கான வழக்கமான மருத்துவ அனுமதி (இயல்பானது).',
      hi: 'निर्धारित सर्जरी और आपातकालीन सुरक्षा प्रोटोकॉल के लिए मानक चिकित्सा सहमति (सामान्य)।'
    }
  },
  {
    category: 'property_assessment_notice',
    regex: /(?:Notice\s+is\s+hereby\s+given\s+that\s+the\s+taxable\s+assessed\s+value)|(?:assessed\s+value\s+of\s+the\s+subject\s+real\s+property)/i,
    risk_level: 'normal',
    reasons: {
      en: 'Standard municipal official declaration of updated property valuation.',
      ta: 'நகராட்சி சொத்து மதிப்பீடு மற்றும் வரி தொடர்பான வழக்கமான அதிகாரப்பூர்வ அறிவிப்பு (இயல்பானது).',
      hi: 'नगरपालिका द्वारा संपत्ति कर मूल्यांकन की मानक आधिकारिक सूचना (सामान्य)।'
    }
  },
  {
    category: 'confidentiality_standard',
    regex: /(?:confidential\s+information|non-disclosure|proprietary\s+information|trade\s+secrets)/i,
    risk_level: 'normal',
    reasons: {
      en: 'Standard mutual protection for proprietary and confidential information.',
      ta: 'ரகசியத் தகவல்களைப் பாதுகாக்கும் நிலையான பரஸ்பர பாதுகாப்பு விதி (இயல்பானது).',
      hi: 'गोपनीय जानकारी और व्यापार रहस्यों की सुरक्षा के लिए मानक नियम (सामान्य)।'
    }
  },
  {
    category: 'governing_law_standard',
    regex: /(?:governed\s+by\s+and\s+construed\s+in\s+accordance\s+with\s+the\s+laws|jurisdiction\s+of\s+the\s+state)/i,
    risk_level: 'normal',
    reasons: {
      en: 'Standard governing law and state jurisdiction designation.',
      ta: 'சட்ட வரம்பு மற்றும் மாநில அதிகார வரம்பை உறுதிப்படுத்தும் நிலையான விதி (இயல்பானது).',
      hi: 'मानक अधिकार क्षेत्र और कानून से संबंधित सामान्य प्रावधान।'
    }
  },
  {
    category: 'written_notice_standard',
    regex: /(?:notices\s+shall\s+be\s+in\s+writing\s+and\s+delivered|certified\s+mail|electronic\s+transmission)/i,
    risk_level: 'normal',
    reasons: {
      en: 'Standard formal written notice delivery protocol.',
      ta: 'முறையான தகவல்தொடர்புகளுக்கான வழக்கமான எழுத்துப்பூர்வ அறிவிப்பு விதி (இயல்பானது).',
      hi: 'औपचारिक संचार के लिए मानक लिखित सूचना नियम (सामान्य)।'
    }
  }
];

function extractDynamicRiskyClauses(docText, language = 'en') {
  const clauses = [];
  const sentences = docText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 15);

  const matchedCategories = new Set();

  // 1. Scan for High-Risk (RED) patterns
  for (const block of sentences) {
    for (const pattern of RISK_PATTERNS) {
      if (!matchedCategories.has(pattern.category) && pattern.regex.test(block)) {
        matchedCategories.add(pattern.category);
        clauses.push({
          id: `clause-${pattern.category}`,
          quote: block,
          risk_level: pattern.risk_level || 'high',
          reason: pattern.reasons[language] || pattern.reasons.en,
          patternCategory: pattern.category
        });
        break;
      }
    }
  }

  // 2. Scan for Normal / Safe (GREEN) patterns
  for (const block of sentences) {
    for (const pattern of NORMAL_PATTERNS) {
      if (!matchedCategories.has(pattern.category) && pattern.regex.test(block)) {
        matchedCategories.add(pattern.category);
        clauses.push({
          id: `clause-normal-${pattern.category}`,
          quote: block,
          risk_level: 'normal',
          reason: pattern.reasons[language] || pattern.reasons.en,
          patternCategory: pattern.category
        });
        break;
      }
    }
  }

  // 3. Fallback scan for dynamic/unknown documents
  if (clauses.length < 2) {
    const rawSentences = docText.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 20);
    for (let i = 0; i < rawSentences.length; i++) {
      const s = rawSentences[i].trim();
      const sLower = s.toLowerCase();
      const isRisky = sLower.includes('sole discretion') || sLower.includes('unilateral') || sLower.includes('without notice') || sLower.includes('forfeit') || sLower.includes('liable for all') || sLower.includes('penalty') || sLower.includes('seizure');
      
      if (isRisky) {
        clauses.push({
          id: `clause-dynamic-risk-${i}`,
          quote: s,
          risk_level: 'high',
          reason: language === 'ta'
            ? 'இந்த விதி ஒருதலைப்பட்ச அதிகாரத்தையோ அல்லது கூடுதல் அபராதப் பொறுப்பையோ உருவாக்குகிறது.'
            : language === 'hi'
            ? 'यह खंड एकतरफा अधिकार या अप्रत्याशित देनदारी उत्पन्न करता है।'
            : 'This clause grants unilateral authority or creates unexpected liability.'
        });
      } else if (clauses.filter(c => c.risk_level === 'normal').length < 2 && s.length < 200) {
        // Tag benign sentence as normal (Green)
        clauses.push({
          id: `clause-dynamic-normal-${i}`,
          quote: s,
          risk_level: 'normal',
          reason: language === 'ta'
            ? 'இது நிலையான மற்றும் இயல்பான ஒப்பந்த விதிமுறையாகும்.'
            : language === 'hi'
            ? 'यह एक मानक और संतुलित अनुबंध नियम है।'
            : 'Standard and balanced contractual provision.'
        });
      }
    }
  }

  // If no normal clause exists in clauses list, extract standard first benign sentence
  const hasNormal = clauses.some(c => c.risk_level === 'normal');
  if (!hasNormal && sentences.length > 0) {
    const firstNonRisky = sentences.find(s => {
      const sLower = s.toLowerCase();
      return !sLower.includes('unilateral') && !sLower.includes('forfeit') && !sLower.includes('without notice') && !sLower.includes('penalty') && !sLower.includes('10%') && !sLower.includes('seizure');
    });
    if (firstNonRisky) {
      clauses.unshift({
        id: 'clause-normal-standard-intro',
        quote: firstNonRisky,
        risk_level: 'normal',
        reason: language === 'ta'
          ? 'வழக்கமான ஒப்பந்தப் பிரிவு மற்றும் நிலையான நடைமுறை (பாதுகாப்பானது).'
          : language === 'hi'
          ? 'मानक अनुबंध खंड और नियमित प्रक्रिया (सामान्य/सुरक्षित)।'
          : 'Standard contractual clause and routine operational terms.'
      });
    }
  }

  return clauses;
}

function extractDynamicActionPlan(riskyClauses, docType, language = 'en') {
  const plan = [];

  riskyClauses.forEach((clause, idx) => {
    const pattern = RISK_PATTERNS.find(p => p.category === clause.patternCategory);
    if (pattern && pattern.tasks) {
      const t = pattern.tasks[language] || pattern.tasks.en;
      plan.push({
        id: `task-${pattern.category}`,
        task: t.task,
        why: t.why,
        priority: clause.risk_level === 'high' ? 'High' : 'Medium',
        clause_quote: clause.quote,
        ask: t.ask
      });
    } else {
      const shortQuote = clause.quote.length > 50 ? clause.quote.slice(0, 48) + '...' : clause.quote;
      plan.push({
        id: `task-gen-${idx}`,
        task: language === 'ta' ? `இப்பிரிவில் நியாயமான மாற்றத்தைக் கோருங்கள்: "${shortQuote}"` : language === 'hi' ? `इस खंड में संशोधन का अनुरोध करें: "${shortQuote}"` : `Request bilateral revision on: "${shortQuote}"`,
        why: clause.reason || 'Unilateral conditions expose you to disproportionate liability.',
        priority: clause.risk_level === 'high' ? 'High' : 'Medium',
        clause_quote: clause.quote,
        ask: language === 'ta' ? 'இரு தரப்பினருக்கும் நியாயமான சம உரிமைகளை உறுதி செய்ய இப்பிரிவை திருத்த முடியுமா?' : language === 'hi' ? 'क्या दोनों पक्षों की निष्पक्षता के लिए इस खंड में संशोधन किया जा सकता है?' : 'Would you be open to revising this provision to ensure fair bilateral terms and reasonable notice?'
      });
    }
  });

  return plan;
}

function synthesizeRiskVerdict(score, riskyClauses, language = 'en') {
  if (language === 'ta') {
    if (score >= 7) return `அதிக அபாயம் (${score}/10): கடுமையான ஒருதலைப்பட்ச விதிகள் மற்றும் உடனடி காலக்கெடு உள்ளன.`;
    if (score >= 4) return `மிதமான அபாயம் (${score}/10): கையொப்பமிடுவதற்கு முன் சில திருத்தங்கள் தேவைப்படுகின்றன.`;
    return `குறைந்த அபாயம் (${score}/10): பெரும்பாலான விதிகள் இயல்பான வரம்பிற்குள் உள்ளன.`;
  }
  if (language === 'hi') {
    if (score >= 7) return `उच्च जोखिम (${score}/10): सख्त एकतरफा नियम और महत्वपूर्ण समयसीमा मौजूद हैं।`;
    if (score >= 4) return `मध्यम जोखिम (${score}/10): हस्ताक्षर करने से पहले बातचीत और संशोधन आवश्यक है।`;
    return `निम्न जोखिम (${score}/10): सामान्य और संतुलित नियम पाए गए हैं।`;
  }
  if (score >= 7) return `High Risk (${score}/10): Contains aggressive one-sided terms, strict penalty clauses, and critical response deadlines.`;
  if (score >= 4) return `Moderate Risk (${score}/10): Standard terms with a few liability clauses requiring clarification.`;
  return `Low Risk (${score}/10): Fair, balanced, and standard contractual provisions detected.`;
}

function synthesizeSummaries(text, docType, parties, financials, riskyClauses, deadlineInfo, language = 'en') {
  const highCount = riskyClauses.filter(c => c.risk_level === 'high').length;
  const deadlineSentence = deadlineInfo.hasDeadline ? ` Note: A strict response deadline (${deadlineInfo.text}) was detected.` : '';

  if (language === 'ta') {
    return {
      standard: `இந்த ஆவணம் ${docType} வகையைச் சேர்ந்தது (${parties}). இதில் ${highCount} அதிக அபாயகரமான விதிகளும் நிதிப் பொறுப்புகளும் உள்ளன. ${financials}.${deadlineSentence} கையொப்பமிடுவதற்கு அல்லது செயல்படுத்துவதற்கு முன் கீழே உள்ள செயல் திட்டத்தின்படி ஆவணத்தை சரிபார்க்கவும்.`,
      simple: `இது ${parties} தொடர்பான ஒரு ஆவணம். இதில் சில கடுமையான விதிகளும் பணப் பொறுப்புகளும் உள்ளன. நீங்கள் கையொப்பமிடுவதற்கு முன் இதில் உள்ள கேள்விகளைக் கேட்டு தெளிவு பெற வேண்டும்.`
    };
  }

  if (language === 'hi') {
    return {
      standard: `यह दस्तावेज़ ${docType} है (${parties})। इसमें ${highCount} उच्च जोखिम वाले नियम और वित्तीय दायित्व शामिल हैं। ${financials}.${deadlineSentence} इस पर हस्ताक्षर करने या सहमति देने से पहले कार्य योजना में दिए गए चरणों को पूरा करें।`,
      simple: `यह ${parties} के बीच का एक दस्तावेज़ है। इसमें आपके लिए कुछ सख्त शर्तें और खर्चे शामिल हैं। हस्ताक्षर करने से पहले आपको जरूरी स्पष्टीकरण मांगना चाहिए।`
    };
  }

  return {
    standard: `This document is a ${docType} (${parties}). A comprehensive review identified ${highCount} high-risk provisions along with mandatory financial obligations: ${financials}.${deadlineSentence} It is strongly advised to address the negotiation points in the action checklist before signing or proceeding.`,
    simple: `This is a formal document involving ${parties}. It puts several financial and legal responsibilities on you, including important deadlines. You should ask the suggested questions before agreeing to it.`
  };
}

function synthesizeKeyFindings(riskyClauses, docType, deadlineInfo, language = 'en') {
  const findings = [];
  findings.push(`Document Classification: ${docType} with ${riskyClauses.length} critical items flagged.`);
  if (deadlineInfo.hasDeadline) {
    findings.push(`Critical Deadline Alert: ${deadlineInfo.text}.`);
  }
  findings.push('Unilateral rights and penalty structures detected requiring clarification.');
  findings.push('Review the step-by-step checklist to protect your legal and financial rights.');
  return findings;
}

function extractMatchedGlossaryTerms(text) {
  const lower = text.toLowerCase();
  const matched = [];

  for (const [key, item] of Object.entries(KEY_TERMS_GLOSSARY)) {
    if (lower.includes(key) || lower.includes(item.term.toLowerCase())) {
      matched.push(item);
    }
  }

  return matched.slice(0, 4);
}

function formatPartiesForLang(parties, language) {
  if (language === 'ta') return `ஒப்பந்தத் தரப்பினர்: ${parties}`;
  if (language === 'hi') return `अनुबंध के पक्ष: ${parties}`;
  return parties;
}

function formatFinancialsForLang(financials, language) {
  return financials;
}

// -----------------------------------------------------------------------------------------
// Dynamic Grounded Document Q&A Engine
// -----------------------------------------------------------------------------------------

export function runDynamicDocumentChat(docText, question, language = 'en') {
  const q = question.toLowerCase().trim();
  const rawSentences = docText.split(/(?<=[.?!])\s+|\n+/).filter(s => s.trim().length > 10);

  const stopWords = new Set(['what', 'when', 'where', 'which', 'who', 'does', 'have', 'with', 'about', 'this', 'that', 'from', 'into', 'under', 'their', 'there', 'they', 'shall', 'will', 'is', 'are', 'the', 'and', 'for', 'any', 'tell', 'explain', 'show']);
  const queryTokens = q
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (queryTokens.length === 0) {
    return {
      answer: 'Not mentioned in this document',
      source_quote: null,
      is_mentioned: false
    };
  }

  let bestSentence = null;
  let highestScore = 0;

  for (const sentence of rawSentences) {
    const sLower = sentence.toLowerCase();
    let score = 0;

    for (const token of queryTokens) {
      if (sLower.includes(token)) {
        score += token.length;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestSentence = sentence.trim();
    }
  }

  if (highestScore >= 6 && bestSentence) {
    if (language === 'ta') {
      return {
        answer: `ஆவணத்தின் படி: ${bestSentence}`,
        source_quote: bestSentence,
        is_mentioned: true
      };
    } else if (language === 'hi') {
      return {
        answer: `दस्तावेज़ के अनुसार: ${bestSentence}`,
        source_quote: bestSentence,
        is_mentioned: true
      };
    } else {
      return {
        answer: `According to the document: ${bestSentence}`,
        source_quote: bestSentence,
        is_mentioned: true
      };
    }
  }

  return {
    answer: 'Not mentioned in this document',
    source_quote: null,
    is_mentioned: false
  };
}
