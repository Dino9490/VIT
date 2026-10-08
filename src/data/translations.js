export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' }
];

export const UI_TRANSLATIONS = {
  en: {
    appTitle: 'Jargon Breaker',
    tagline: 'AI Legal & Contract Clarity Engine',
    subtitle: 'Demystify fine print, expose dangerous clauses in Red, verify normal terms in Green, and generate negotiation playbooks.',
    stages: {
      s1: 'Stage 1: Plain Summary',
      s2: 'Stage 2: Clause Risks',
      s3: 'Stage 3: Action Checklist',
      s4: 'Stage 4: Multilingual',
      s5: 'Stage 5: Document Q&A'
    },
    input: {
      title: 'Paste Document or Upload Photo',
      placeholder: 'Paste legal text, lease agreement, medical consent, or upload document photo (JPG / PNG)...',
      tryExample: 'Try Example',
      uploadPhoto: 'Upload Photo (JPG / PNG)',
      dragDropText: 'Drop JPG or PNG photo of document here, or click to browse',
      supportedFormats: 'Supports JPG, JPEG, PNG, WEBP document photos',
      extractingText: 'Extracting text from photo with OCR...',
      ocrSuccess: 'Text successfully extracted from photo!',
      photoAttached: 'Photo Attached',
      clear: 'Clear',
      analyze: 'Analyze Document',
      analyzing: 'Analyzing Document...',
      charCount: 'chars',
      wordCount: 'words',
      selectExampleTitle: 'Select an Example Contract',
      tabText: '✍️ Paste Text',
      tabPhoto: '📸 Upload Photo (JPG / PNG)'
    },
    tabs: {
      dashboard: 'Executive Dashboard',
      summary: 'Plain Summary',
      clauses: 'Risky Clauses',
      actionPlan: 'Action Plan',
      glossary: 'Jargon Glossary',
      chat: 'Ask Document (Q&A)'
    },
    summary: {
      title: 'Plain-Language Summary',
      badge: 'Executive Briefing',
      riskScore: 'Overall Contract Risk',
      keyFindings: 'Critical Takeaways',
      financials: 'Financial Obligations & Penalties',
      parties: 'Parties & Scope',
      riskHigh: 'High Risk Profile',
      riskMedium: 'Moderate Risk Profile',
      riskLow: 'Low / Standard Risk'
    },
    clauses: {
      title: 'Document with Interactive Clause Highlights',
      subtitle: 'Click highlighted clauses in the document to inspect potential legal hazards (Red) or standard terms (Green).',
      filterAll: 'All Clauses',
      filterHigh: 'High Risk',
      filterMedium: 'Medium Risk',
      filterLow: 'Low Risk',
      filterRisky: 'Risky (Red)',
      filterNormal: 'Normal (Green)',
      legendRisky: 'Risky (Red)',
      legendNormal: 'Normal (Green)',
      riskBadge: 'Risky (Red)',
      normalBadge: 'Normal (Green)',
      noRisks: 'No clauses flagged.',
      jumpToText: 'Locate in Document',
      clauseReason: 'Why this is risky',
      normalReason: 'Why this is standard / safe',
      originalQuote: 'Original Clause Quote',
      copiedQuote: 'Quote copied to clipboard',
      severity: 'Risk Level',
      clickToInspect: 'Click to inspect details'
    },
    actionPlan: {
      title: 'Negotiation & Action Checklist',
      subtitle: 'Step-by-step tasks and ready-to-send questions for your landlord or counterparty.',
      progress: 'Action Progress',
      completed: 'completed',
      allDone: 'All negotiation steps completed!',
      copyQuestion: 'Copy Question',
      questionCopied: 'Question copied to clipboard!',
      scrollToClause: 'View Clause in Text',
      whyTitle: 'Why it matters:',
      askTitle: 'Recommended counter-proposal / question:'
    },
    chat: {
      title: 'Ask About This Document',
      subtitle: 'Interrogate this agreement. Answers are strictly verified against the text with supporting citations.',
      placeholder: 'Ask a question (e.g. Can landlord enter without notice?)...',
      send: 'Ask AI',
      sourceQuote: '📌 Source Quote from Document',
      clickToHighlight: 'Click to locate quote in document',
      notMentioned: 'Not mentioned in this document',
      notMentionedSub: 'The provided document does not contain any provisions or references regarding this question.',
      suggestedQuestions: 'Quick Questions to Ask:',
      clearChat: 'Clear History',
      aiThinking: 'Scanning document text...'
    },
    loading: {
      step1: 'Scanning legal syntax and structure...',
      step2: 'Evaluating liabilities and hidden penalties...',
      step3: 'Synthesizing plain-language summary...',
      step4: 'Formulating negotiation counter-proposals...',
      step5: 'Translating into selected language...'
    },
    footer: {
      disclaimerTitle: 'Legal Disclaimer',
      disclaimerText: 'Jargon Breaker is an artificial intelligence assistance tool designed for informational, educational, and preliminary document review purposes only. It does not provide formal legal advice, establish an attorney-client relationship, or substitute for consultation with a licensed legal practitioner. Always consult a qualified attorney before executing binding contracts.',
      allRights: 'Built for precision, safety, and empowerment.'
    },
    apiKeyModal: {
      title: 'Gemini AI Configuration',
      subtitle: 'Provide your Google Gemini API Key for live AI responses, or use our smart built-in analyzer.',
      label: 'Google Gemini API Key (Optional)',
      placeholder: 'AIzaSy...',
      save: 'Save Key',
      clear: 'Use Built-in Engine',
      activeStatus: 'Custom API Key Active (Gemini 2.5/1.5 Flash)',
      defaultStatus: 'Smart Built-in Offline Engine Active (No API Key Required)'
    }
  },
  ta: {
    appTitle: 'ஜோர்கன் பிரேக்கர் (Jargon Breaker)',
    tagline: 'AI சட்ட ஆவண விளக்கக் கருவி',
    subtitle: 'கடினமான சட்ட விதிமுறைகளை எளிய தமிழில் புரிந்து கொள்ளுங்கள், அபாயகரமான விதிகளை சிவப்பிலும் இயல்பான விதிகளை பச்சையிலும் காண்க.',
    stages: {
      s1: 'நிலை 1: எளிய சுருக்கம்',
      s2: 'நிலை 2: அபாயகரமான பிரிவுகள்',
      s3: 'நிலை 3: செயல் திட்டம்',
      s4: 'நிலை 4: பன்மொழி ஆதரவு',
      s5: 'நிலை 5: ஆவண கேள்வி-பதில்'
    },
    input: {
      title: 'ஆவணத்தை ஒட்டவும் அல்லது புகைப்படத்தைப் பதிவேற்றவும் (JPG / PNG)',
      placeholder: 'வாடகை ஒப்பந்தம், வேலைவாய்ப்பு ஒப்பந்தம் ஆகியவற்றை உள்ளிடவும் அல்லது புகைப்படத்தைப் (JPG / PNG) பதிவேற்றவும்...',
      tryExample: 'மாதிரி ஆவணம்',
      uploadPhoto: 'புகைப்படம் பதிவேற்று (JPG / PNG)',
      dragDropText: 'ஆவண புகைப்படத்தை (JPG / PNG) இங்கே இழுத்து விடவும் அல்லது கிளிக் செய்யவும்',
      supportedFormats: 'JPG, JPEG, PNG, WEBP வடிவங்களை ஆதரிக்கிறது',
      extractingText: 'புகைப்படத்திலிருந்து எழுத்துக்கள் எடுக்கப்படுகின்றன...',
      ocrSuccess: 'புகைப்படத்திலிருந்து உரை வெற்றிகரமாக எடுக்கப்பட்டது!',
      photoAttached: 'புகைப்படம் இணைக்கப்பட்டது',
      clear: 'அழி',
      analyze: 'ஆவணத்தை ஆய்வு செய்',
      analyzing: 'ஆய்வு செய்யப்படுகிறது...',
      charCount: 'எழுத்துக்கள்',
      wordCount: 'சொற்கள்',
      selectExampleTitle: 'மாதிரி ஒப்பந்தத்தைத் தேர்ந்தெடுக்கவும்',
      tabText: '✍️ உரையை ஒட்டவும்',
      tabPhoto: '📸 புகைப்படம் பதிவேற்றவும் (JPG / PNG)'
    },
    tabs: {
      dashboard: 'நிர்வாக டாஷ்போர்டு',
      summary: 'எளிய சுருக்கம்',
      clauses: 'அபாயகரமான பிரிவுகள்',
      actionPlan: 'செயல் திட்டம்',
      glossary: 'சட்டக் கலைச்சொல் அகராதி',
      chat: 'ஆவணத்தைப் பற்றிக் கேள் (Q&A)'
    },
    summary: {
      title: 'எளிய மொழி சுருக்கம்',
      badge: 'முக்கிய விபரம்',
      riskScore: 'ஒட்டுமொத்த ஒப்பந்த அபாய நிலை',
      keyFindings: 'முக்கிய முடிவுகள்',
      financials: 'நிதிப் பொறுப்புகள் & அபராதங்கள்',
      parties: 'ஒப்பந்தத் தரப்பினர் & எல்லை',
      riskHigh: 'அதிக அபாய நிலை (High Risk)',
      riskMedium: 'மிதமான அபாய நிலை (Moderate Risk)',
      riskLow: 'குறைந்த / இயல்பான நிலை'
    },
    clauses: {
      title: 'வண்ணக் குறியீடுகளுடன் கூடிய ஆவணம்',
      subtitle: 'ஆவணத்தில் சிவப்பு (அபாயம்) மற்றும் பச்சை (இயல்பானது) வண்ணமிட்ட பகுதிகளைக் கிளிக் செய்து விபரம் காண்க.',
      filterAll: 'அனைத்து பிரிவுகள்',
      filterHigh: 'அதிக அபாயம்',
      filterMedium: 'நடுத்தர அபாயம்',
      filterLow: 'குறைந்த அபாயம்',
      filterRisky: 'அபாயகரமானது (சிவப்பு)',
      filterNormal: 'இயல்பானது (பச்சை)',
      legendRisky: 'அபாயம் (சிவப்பு)',
      legendNormal: 'இயல்பானது (பச்சை)',
      riskBadge: 'அபாயம் (சிவப்பு)',
      normalBadge: 'இயல்பானது (பச்சை)',
      noRisks: 'குறிப்பிட்ட பிரிவுகள் எதுவும் இல்லை.',
      jumpToText: 'ஆவணத்தில் காண்க',
      clauseReason: 'ஏன் இது அபாயகரமானது',
      normalReason: 'ஏன் இது இயல்பானது / பாதுகாப்பானது',
      originalQuote: 'மூல ஆவணத்தின் வாசகம்',
      copiedQuote: 'வாசகம் நகலெடுக்கப்பட்டது',
      severity: 'அபாய அளவு',
      clickToInspect: 'விவரங்களைக் காண கிளிக் செய்க'
    },
    actionPlan: {
      title: 'பேச்சுவார்த்தை மற்றும் செயல் திட்டம்',
      subtitle: 'வீட்டு உரிமையாளர் அல்லது எதிர் தரப்பினருக்கு அனுப்ப வேண்டிய ஆயத்த கேள்விகள்.',
      progress: 'செயல் முன்னேற்றம்',
      completed: 'முடிந்தது',
      allDone: 'அனைத்து பேச்சுவார்த்தை பணிகளும் நிறைவடைந்தன!',
      copyQuestion: 'கேள்வியை நகலெடு',
      questionCopied: 'கேள்வி நகலெடுக்கப்பட்டது! அனுப்பத் தயாராக உள்ளது.',
      scrollToClause: 'ஆவணத்தில் இப்பிரிவைக் காண்க',
      whyTitle: 'ஏன் இது முக்கியம்:',
      askTitle: 'பரிந்துரைக்கப்பட்ட மாற்று கேள்வி / கோரிக்கை:'
    },
    chat: {
      title: 'ஆவணத்தைப் பற்றிக் கேளுங்கள்',
      subtitle: 'இந்த ஆவணத்தைப் பற்றி ஏதேனும் கேள்வி கேளுங்கள். பதில்கள் மூல ஆவணத்தை மட்டுமே அடிப்படையாகக் கொண்டவை.',
      placeholder: 'கேள்வி கேளுங்கள் (எ.கா: அறிவிப்பின்றி உரிமையாளர் வர முடியுமா?)...',
      send: 'கேள்',
      sourceQuote: '📌 ஆவணத்திலிருந்து பெறப்பட்ட ஆதாரம்',
      clickToHighlight: 'ஆவணத்தில் இந்த வரியைக் காண கிளிக் செய்க',
      notMentioned: 'இந்த ஆவணத்தில் குறிப்பிடப்படவில்லை (Not mentioned in this document)',
      notMentionedSub: 'நீங்கள் கேட்ட தகவல் இந்த ஆவணத்தில் எந்த இடத்திலும் குறிப்பிடப்படவில்லை.',
      suggestedQuestions: 'பரிந்துரைக்கப்பட்ட விரைவு கேள்விகள்:',
      clearChat: 'வரலாற்றை அழி',
      aiThinking: 'ஆவணம் ஆராயப்படுகிறது...'
    },
    loading: {
      step1: 'சட்ட அமைப்பைப் பகுப்பாய்வு செய்கிறது...',
      step2: 'மறைக்கப்பட்ட அபராதங்களை மதிப்பிடுகிறது...',
      step3: 'எளிய தமிழ் சுருக்கத்தை உருவாக்குகிறது...',
      step4: 'பேச்சுவார்த்தை கேள்விகளைத் தயாரிக்கும் பணி...',
      step5: 'பன்மொழி மாற்றத்தை ஒருங்கிணைக்கிறது...'
    },
    footer: {
      disclaimerTitle: 'சட்ட மறுப்புரை (Legal Disclaimer)',
      disclaimerText: 'ஜோர்கன் பிரேக்கர் (Jargon Breaker) என்பது தகவல் மற்றும் பகுப்பாய்வு நோக்கங்களுக்காக மட்டுமே உருவாக்கப்பட்ட செயற்கை நுண்ணறிவு கருவியாகும். இது முறையான சட்ட ஆலோசனை அல்ல. சட்டபூர்வ ஆவணங்களில் கையெழுத்திடுவதற்கு முன்பு உரிமம் பெற்ற வழக்கறிஞரை அணுகவும்.',
      allRights: 'துல்லியமான மற்றும் பாதுகாப்பான ஆவண புரிதலுக்காக.'
    },
    apiKeyModal: {
      title: 'Gemini AI உள்ளமைவு',
      subtitle: 'நேரடி AI பதில்களுக்கு உங்கள் Google Gemini API விசையை உள்ளிடவும் அல்லது உள்ளமைக்கப்பட்ட எஞ்சினைப் பயன்படுத்தவும்.',
      label: 'Google Gemini API Key (விருப்பமானது)',
      placeholder: 'AIzaSy...',
      save: 'விசையைச் சேமி',
      clear: 'உள்ளமைக்கப்பட்ட எஞ்சின் பயன்படுத்து',
      activeStatus: 'தனிப்பயன் API விசை செயலில் உள்ளது (Gemini 2.5/1.5 Flash)',
      defaultStatus: 'ஸ்மார்ட் ஆஃப்லைன் எஞ்சின் செயலில் உள்ளது'
    }
  },
  hi: {
    appTitle: 'जार্গন ব্রেকার (Jargon Breaker)',
    tagline: 'AI कानूनी एवं अनुबंध विश्लेषक',
    subtitle: 'कठिन कानूनी शब्दों को सरल भाषा में समझें, जोखिम भरे नियमों को लाल और सामान्य नियमों को हरे रंग में देखें।',
    stages: {
      s1: 'चरण 1: सरल सारांश',
      s2: 'चरण 2: जोखिम भरे खंड',
      s3: 'चरण 3: कार्य योजना',
      s4: 'चरण 4: बहुभाषी समर्थन',
      s5: 'चरण 5: दस्तावेज़ प्रश्नोत्तरी'
    },
    input: {
      title: 'दस्तावेज़ चिपकाएँ या फ़ोटो अपलोड करें (JPG / PNG)',
      placeholder: 'किराया अनुबंध यहाँ पेस्ट करें, या दस्तावेज़ की फ़ोटो (JPG / PNG) अपलोड करें...',
      tryExample: 'उदाहरण देखें',
      uploadPhoto: 'फ़ोटो अपलोड करें (JPG / PNG)',
      dragDropText: 'दस्तावेज़ की JPG या PNG फ़ोटो यहाँ खींचें और छोड़ें, या ब्राउज़ करें',
      supportedFormats: 'JPG, JPEG, PNG, WEBP फ़ोटो प्रारूप समर्थित हैं',
      extractingText: 'फ़ोटो से टेक्स्ट निकाला जा रहा है...',
      ocrSuccess: 'फ़ोटो से टेक्स्ट सफलतापूर्वक निकाल लिया गया!',
      photoAttached: 'फ़ोटो संलग्न',
      clear: 'साफ़ करें',
      analyze: 'दस्तावेज़ का विश्लेषण करें',
      analyzing: 'विश्लेषण जारी है...',
      charCount: 'अक्षर',
      wordCount: 'शब्द',
      selectExampleTitle: 'एक उदाहरण अनुबंध चुनें',
      tabText: '✍️ टेक्स्ट पेस्ट करें',
      tabPhoto: '📸 फ़ोटो अपलोड करें (JPG / PNG)'
    },
    tabs: {
      dashboard: 'कार्यकारी डैशबोर्ड',
      summary: 'सरल सारांश',
      clauses: 'जोखिम भरे नियम',
      actionPlan: 'कार्य योजना',
      glossary: 'शब्दावली (Glossary)',
      chat: 'दस्तावेज़ से पूछें (Q&A)'
    },
    summary: {
      title: 'सरल भाषा में सारांश',
      badge: 'कार्यकारी विवरण',
      riskScore: 'कुल अनुबंध जोखिम',
      keyFindings: 'मुख्य निष्कर्ष',
      financials: 'वित्तीय देनदारियां और जुर्माना',
      parties: 'पक्ष और कार्यक्षेत्र',
      riskHigh: 'उच्च जोखिम (High Risk)',
      riskMedium: 'मध्यम जोखिम (Moderate Risk)',
      riskLow: 'निम्न / सामान्य जोखिम'
    },
    clauses: {
      title: 'रंग-कोडित हाइलाइट्स के साथ दस्तावेज़',
      subtitle: 'कानूनी जोखिम (लाल) और सामान्य/मानक नियमों (हरा) की जाँच करने के लिए हाइलाइट की गई पंक्तियों पर क्लिक करें।',
      filterAll: 'सभी खंड',
      filterHigh: 'उच्च जोखिम',
      filterMedium: 'मध्यम जोखिम',
      filterLow: 'निम्न जोखिम',
      filterRisky: 'जोखिम भरा (लाल)',
      filterNormal: 'सामान्य नियम (हरा)',
      legendRisky: 'जोखिम (लाल)',
      legendNormal: 'सामान्य (हरा)',
      riskBadge: 'जोखिम भरा (लाल)',
      normalBadge: 'सामान्य (हरा)',
      noRisks: 'कोई विशिष्ट नियम नहीं मिला।',
      jumpToText: 'दस्तावेज़ में देखें',
      clauseReason: 'यह जोखिम भरा क्यों है',
      normalReason: 'यह मानक / सुरक्षित क्यों है',
      originalQuote: 'मूल अनुबंध का अंश',
      copiedQuote: 'अंश क्लिपबोर्ड पर कॉपी किया गया',
      severity: 'जोखिम स्तर',
      clickToInspect: 'विवरण देखने के लिए क्लिक करें'
    },
    actionPlan: {
      title: 'बातचीत और कार्य योजना चेकलिस्ट',
      subtitle: 'मकान मालिक या दूसरी पार्टी को भेजने के लिए तैयार किए गए स्पष्ट प्रश्न और कार्य।',
      progress: 'कार्य प्रगति',
      completed: 'पूर्ण',
      allDone: 'सभी बातचीत के कदम पूरे हो गए!',
      copyQuestion: 'प्रश्न कॉपी करें',
      questionCopied: 'प्रश्न क्लिपबोर्ड पर कॉपी किया गया! भेजने के लिए तैयार है।',
      scrollToClause: 'दस्तावेज़ में यह खंड देखें',
      whyTitle: 'यह क्यों महत्वपूर्ण है:',
      askTitle: 'सुझाया गया प्रश्न / प्रस्ताव:'
    },
    chat: {
      title: 'दस्तावेज़ के बारे में पूछें',
      subtitle: 'इस अनुबंध के बारे में कोई भी प्रश्न पूछें। उत्तर केवल दस्तावेज़ पर आधारित होंगे और सटीक उद्धरण देंगे।',
      placeholder: 'प्रश्न पूछें (उदा. क्या मकान मालिक बिना सूचना के आ सकता है?)...',
      send: 'पूछें',
      sourceQuote: '📌 दस्तावेज़ से प्रमाणिक उद्धरण',
      clickToHighlight: 'दस्तावेज़ में इस पंक्ति पर जाने के लिए क्लिक करें',
      notMentioned: 'इस दस्तावेज़ में उल्लेख नहीं है (Not mentioned in this document)',
      notMentionedSub: 'प्रदान किए गए दस्तावेज़ में आपके प्रश्न के संबंध में कोई जानकारी या नियम मौजूद नहीं है।',
      suggestedQuestions: 'सुझाए गए त्वरित प्रश्न:',
      clearChat: 'इतिहास साफ़ करें',
      aiThinking: 'दस्तावेज़ का विश्लेषण हो रहा है...'
    },
    loading: {
      step1: 'कानूनी संरचना की जाँच हो रही है...',
      step2: 'छिपे हुए जुर्माने और जोखिमों का मूल्यांकन...',
      step3: 'सरल हिंदी सारांश तैयार किया जा रहा है...',
      step4: 'बातचीत के लिए कार्य योजना बनाई जा रही है...',
      step5: 'भाषा अनुसार अनुवाद पूरा किया जा रहा है...'
    },
    footer: {
      disclaimerTitle: 'कानूनी अस्वीकरण (Legal Disclaimer)',
      disclaimerText: 'जार্গন ब्रेकर (Jargon Breaker) केवल सूचनात्मक और विश्लेषणात्मक उद्देश्यों के लिए बनाया गया एक कृत्रिम बुद्धिमत्ता (AI) उपकरण है। यह औपचारिक कानूनी सलाह नहीं है। बाध्यकारी अनुबंधों पर हस्ताक्षर करने से पहले हमेशा किसी योग्य वकील से परामर्श करें।',
      allRights: 'सटीक, सुरक्षित और सशक्त अनुबंध समझ के लिए।'
    },
    apiKeyModal: {
      title: 'Gemini AI सेटिंग्स',
      subtitle: 'लाइव AI विश्लेषण के लिए अपनी Google Gemini API कुंजी दर्ज करें या हमारे इन-बिल्ट इंजन का उपयोग करें।',
      label: 'Google Gemini API Key (वैकल्पिक)',
      placeholder: 'AIzaSy...',
      save: 'कुंजी सहेजें',
      clear: 'इन-बिल्ट इंजन का प्रयोग करें',
      activeStatus: 'कस्टम API कुंजी सक्रिय है (Gemini 2.5/1.5 Flash)',
      defaultStatus: 'स्मार्ट ऑफ़लाइन इंजन सक्रिय है (कुंजी आवश्यक नहीं)'
    }
  }
};
