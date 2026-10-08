import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trash2, Camera, FileCode, ChevronDown, FileText, Check, FileUp } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/examples';
import { UI_TRANSLATIONS } from '../data/translations';
import UniversalUploadZone from './UniversalUploadZone';

export default function DocumentInput({
  documentText,
  setDocumentText,
  onAnalyze,
  isAnalyzing,
  language,
  onShowToast,
  uploadedDoc,
  setUploadedDoc,
  docTypeCategory,
  setDocTypeCategory
}) {
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'upload'
  const [docTypeDropdownOpen, setDocTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const docTypeOptions = [
    { id: 'legal', label: 'Rental / Legal Agreement', icon: '⚖️' },
    { id: 'medical', label: 'Medical Report / Consent / Bill', icon: '🏥' },
    { id: 'government', label: 'Government Notice / Tax / Fine', icon: '🏛️' }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDocTypeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTryExample = () => {
    const matchingDoc = SAMPLE_DOCUMENTS.find(d => d.docType === docTypeCategory) || SAMPLE_DOCUMENTS[0];
    setDocumentText(matchingDoc.text);
    setUploadedDoc(null);
    if (onShowToast) onShowToast(`Loaded "${matchingDoc.title}"! Analyzing...`);
    if (onAnalyze) {
      onAnalyze(matchingDoc.text, docTypeCategory);
    }
  };

  const handleDocumentExtracted = (extractedText, fileName) => {
    setDocumentText(extractedText);
    // Automatically trigger analysis on ANY uploaded document!
    if (onAnalyze) {
      onAnalyze(extractedText, docTypeCategory);
    }
  };

  const currentDocTypeLabel = docTypeOptions.find(o => o.id === docTypeCategory) || docTypeOptions[0];
  const wordCount = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;
  const charCount = documentText.length;

  return (
    <div className="glass-panel input-section-card">
      <div className="input-header">
        <div className="input-title-group">
          <h2>Upload Document or Paste Text</h2>
          <p>Analyze any legal contract, medical bill/consent, or government notice (PDF, Photos, Text).</p>
        </div>

        <div className="input-actions-bar">
          {/* Document Type Dropdown */}
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              className="dropdown-trigger-btn"
              onClick={() => setDocTypeDropdownOpen(!docTypeDropdownOpen)}
              title="Select document category"
            >
              <span>{currentDocTypeLabel.icon}</span>
              <span>{currentDocTypeLabel.label}</span>
              <ChevronDown size={14} style={{ transform: docTypeDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {docTypeDropdownOpen && (
              <div className="dropdown-menu" style={{ width: 280 }}>
                {docTypeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className="dropdown-item"
                    onClick={() => {
                      setDocTypeCategory(opt.id);
                      setDocTypeDropdownOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {opt.icon} {opt.label}
                      </span>
                      {docTypeCategory === opt.id && <Check size={14} color="var(--accent-primary)" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Try Example Button */}
          <button
            className="btn-secondary"
            onClick={handleTryExample}
            title={`Load sample ${currentDocTypeLabel.label}`}
          >
            <FileText size={15} />
            <span>Try Example</span>
          </button>

          {/* Mode Selector Tabs (Paste Text / Upload Document) */}
          <div className="lang-selector-group">
            <button
              className={`lang-btn ${inputMode === 'text' ? 'active' : ''}`}
              onClick={() => setInputMode('text')}
              style={{ fontSize: '0.82rem', padding: '5px 10px' }}
            >
              <FileCode size={14} />
              <span>✍️ Paste Text</span>
            </button>
            <button
              className={`lang-btn ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}
              style={{ fontSize: '0.82rem', padding: '5px 10px' }}
            >
              <FileUp size={14} />
              <span>📁 Upload File (PDF / Image)</span>
            </button>
          </div>

          {/* Clear Button */}
          {(documentText || uploadedDoc) && (
            <button
              className="btn-secondary"
              onClick={() => {
                setDocumentText('');
                setUploadedDoc(null);
              }}
              title="Clear text"
            >
              <Trash2 size={15} />
              <span>Clear</span>
            </button>
          )}

          {/* Analyze Document CTA */}
          <button
            className="btn-primary-analyze"
            onClick={() => onAnalyze(documentText, docTypeCategory)}
            disabled={!documentText.trim() || isAnalyzing}
          >
            <Sparkles size={18} />
            <span>{isAnalyzing ? 'Analyzing Document...' : 'Analyze Document'}</span>
          </button>
        </div>
      </div>

      {/* Universal Upload Zone (PDF, Images, Text) */}
      {inputMode === 'upload' && (
        <UniversalUploadZone
          onDocumentExtracted={handleDocumentExtracted}
          onShowToast={onShowToast}
          uploadedDoc={uploadedDoc}
          setUploadedDoc={setUploadedDoc}
        />
      )}

      {/* Textarea Input (Always available for viewing and editing extracted/pasted text) */}
      <div className="textarea-wrapper" style={{ marginTop: inputMode === 'upload' ? 16 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {uploadedDoc ? `📝 Document Content (Parsed from ${uploadedDoc.name}):` : `📝 Paste ${currentDocTypeLabel.label} Text:`}
          </label>
          {uploadedDoc && (
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
              ✓ Document Attached ({uploadedDoc.type})
            </span>
          )}
        </div>
        <textarea
          className="document-textarea"
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder={`Paste ${currentDocTypeLabel.label.toLowerCase()} text here, or switch to upload tab to upload any PDF, JPG, or PNG...`}
          rows={inputMode === 'upload' ? 5 : 7}
        />
      </div>

      {/* Textarea Footer Stats */}
      <div className="textarea-footer">
        <div>
          <span>{charCount.toLocaleString()} chars</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>{wordCount.toLocaleString()} words</span>
        </div>
        <div>
          <span>💡 Uploading any PDF, image, or text automatically analyzes it and displays the results below.</span>
        </div>
      </div>
    </div>
  );
}
