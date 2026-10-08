import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, Bookmark, Trash2, ArrowUpRight, HelpCircle } from 'lucide-react';
import { askDocumentQuestion } from '../services/aiService';
import { UI_TRANSLATIONS } from '../data/translations';

export default function AskDocumentChat({
  documentText,
  language,
  onLocateClauseQuote,
  onShowToast
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your contract assistant. Ask me anything about this document. Every answer is strictly verified and cited directly from the text.',
      sourceQuote: null,
      isMentioned: true
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const quickQuestions = language === 'ta' ? [
    'அறிவிப்பின்றி உரிமையாளர் நுழைய முடியுமா?',
    'முன்பணம் திரும்பப் பெறுவதற்கான விதி என்ன?',
    'கூரை பழுதுபார்ப்பு பொறுப்பு யாருடையது?',
    'வாடகை தாமதக் கட்டணம் எவ்வளவு?'
  ] : language === 'hi' ? [
    'क्या मकान मालिक बिना सूचना के आ सकता है?',
    'सुरक्षा जमा राशि की वापसी का क्या नियम है?',
    'छत की मरम्मत की जिम्मेदारी किसकी है?',
    'विलंब किराया जुर्माना कितना है?'
  ] : [
    'Can the landlord enter without notice?',
    'How is the security deposit refunded?',
    'Who is responsible for major roof repairs?',
    'What is the penalty for late rent?'
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText = inputQuery) => {
    const text = queryText.trim();
    if (!text || isLoading || !documentText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      sourceQuote: null
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askDocumentQuestion(documentText, text, messages, language);

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        sourceQuote: response.source_quote,
        isMentioned: response.is_mentioned
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Error processing question. Please try again.',
          sourceQuote: null,
          isMentioned: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Chat history cleared. What else would you like to know about this agreement?',
        sourceQuote: null,
        isMentioned: true
      }
    ]);
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={20} color="var(--accent-primary)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t.chat.title}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.chat.subtitle}</p>
          </div>
        </div>

        <button
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '5px 10px' }}
          onClick={handleClearChat}
          title={t.chat.clearChat}
        >
          <Trash2 size={13} />
          <span>{t.chat.clearChat}</span>
        </button>
      </div>

      {/* Suggested Starter Questions */}
      <div className="suggested-chips-wrapper">
        <div className="suggested-chips-title">{t.chat.suggestedQuestions}</div>
        <div className="suggested-chips-row">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              className="chip-btn"
              onClick={() => handleSendMessage(q)}
            >
              <HelpCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="chat-messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            <div>{msg.text}</div>

            {/* If Not Mentioned Alert */}
            {msg.sender === 'ai' && msg.isMentioned === false && msg.id !== 'welcome' && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--risk-medium)' }}>
                <AlertCircle size={14} />
                <span>{t.chat.notMentionedSub}</span>
              </div>
            )}

            {/* Supporting Source Quote Badge (Stage 5 Requirement) */}
            {msg.sourceQuote && (
              <div
                className="source-quote-card"
                onClick={() => {
                  onLocateClauseQuote(msg.sourceQuote);
                  if (onShowToast) onShowToast(t.chat.clickToHighlight);
                }}
                title={t.chat.clickToHighlight}
              >
                <div className="source-quote-header">
                  <span>{t.chat.sourceQuote}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Locate <ArrowUpRight size={12} />
                  </span>
                </div>
                <div className="source-quote-text">
                  "{msg.sourceQuote}"
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} className="spin" color="var(--accent-primary)" />
            <span>{t.chat.aiThinking}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Box */}
      <div className="chat-input-bar">
        <input
          type="text"
          className="chat-input-field"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={t.chat.placeholder}
          disabled={isLoading || !documentText.trim()}
        />
        <button
          className="btn-primary-analyze"
          style={{ padding: '10px 18px', fontSize: '0.9rem' }}
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputQuery.trim() || !documentText.trim()}
        >
          <Send size={16} />
          <span>{t.chat.send}</span>
        </button>
      </div>
    </div>
  );
}
