import React, { useState } from 'react';
import { Key, ShieldCheck, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey } from '../services/aiService';
import { UI_TRANSLATIONS } from '../data/translations';

export default function ApiKeyModal({ isOpen, onClose, language, onKeyUpdated, onShowToast }) {
  if (!isOpen) return null;

  const [keyValue, setKeyValue] = useState(getStoredApiKey());
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const handleSave = () => {
    saveStoredApiKey(keyValue);
    if (onKeyUpdated) onKeyUpdated(!!keyValue.trim());
    if (onShowToast) onShowToast(keyValue.trim() ? 'Gemini API Key Saved!' : 'Using Built-in Smart Engine');
    onClose();
  };

  const handleClear = () => {
    setKeyValue('');
    saveStoredApiKey('');
    if (onKeyUpdated) onKeyUpdated(false);
    if (onShowToast) onShowToast('Using Built-in Smart Offline Engine');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.apiKeyModal.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 18, lineHeight: 1.5 }}>
          {t.apiKeyModal.subtitle}
        </p>

        {/* Status Indicator */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: getStoredApiKey() ? 'var(--success-bg)' : 'rgba(99, 102, 241, 0.1)',
            border: `1px solid ${getStoredApiKey() ? 'var(--success-border)' : 'rgba(99, 102, 241, 0.3)'}`,
            fontSize: '0.82rem',
            color: getStoredApiKey() ? 'var(--success)' : 'var(--accent-primary)',
            fontWeight: 600,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <ShieldCheck size={16} />
          <span>{getStoredApiKey() ? t.apiKeyModal.activeStatus : t.apiKeyModal.defaultStatus}</span>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            {t.apiKeyModal.label}
          </label>
          <input
            type="password"
            className="document-textarea"
            style={{ minHeight: 'auto', padding: '10px 14px', height: '44px' }}
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder={t.apiKeyModal.placeholder}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>🔒 Your API key is stored locally in your browser only.</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 3 }}
            >
              Get Gemini Key <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn-secondary" onClick={handleClear}>
            <Trash2 size={14} />
            <span>{t.apiKeyModal.clear}</span>
          </button>
          <button className="btn-primary-analyze" style={{ padding: '10px 20px', fontSize: '0.9rem' }} onClick={handleSave}>
            <Check size={16} />
            <span>{t.apiKeyModal.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
