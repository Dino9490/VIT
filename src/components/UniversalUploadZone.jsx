import React, { useState, useRef } from 'react';
import { FileUp, FileText, Camera, Upload, Check, AlertCircle, Trash2, RefreshCw, FileCode, Layers } from 'lucide-react';
import { parseUploadedDocument, ACCEPTED_EXTENSIONS } from '../services/documentParserService';
import { fileToDataUrl } from '../services/ocrService';

export default function UniversalUploadZone({
  onDocumentExtracted,
  onShowToast,
  uploadedDoc,
  setUploadedDoc
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    setUploadError(null);

    try {
      setIsProcessing(true);
      setUploadProgress(15);
      setStatusMessage(`Reading ${file.name}...`);

      const fileExt = file.name.split('.').pop()?.toUpperCase() || 'DOC';
      let dataUrl = null;

      if (file.type.startsWith('image/')) {
        try {
          dataUrl = await fileToDataUrl(file);
        } catch (e) {
          // continue
        }
      }

      setUploadedDoc({
        name: file.name,
        size: Math.round(file.size / 1024),
        type: fileExt,
        dataUrl
      });

      const result = await parseUploadedDocument(file, ({ status, progress }) => {
        setUploadProgress(progress || 50);
        if (status === 'reading_pdf') setStatusMessage('Parsing PDF pages...');
        if (status === 'extracting_pdf_pages') setStatusMessage('Extracting PDF text layer...');
        if (status === 'recognizing_text') setStatusMessage('Running OCR scan on image...');
        if (status === 'analyzing_with_ai') setStatusMessage('Processing document with AI...');
      });

      setUploadProgress(100);
      setStatusMessage('Document parsed successfully!');

      if (onShowToast) {
        onShowToast(`Uploaded ${file.name}! Analyzing now...`);
      }

      // Automatically trigger analysis on the extracted text!
      onDocumentExtracted(result.text, file.name);
    } catch (err) {
      console.error('File parsing error:', err);
      setUploadedDoc(null);
      setUploadError(err.message || 'Image of a person or character should not be uploaded.');
      if (onShowToast) {
        onShowToast(err.message || 'Image of a person or character should not be uploaded.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setUploadedDoc(null);
    setUploadProgress(0);
  };

  return (
    <div style={{ marginTop: 14 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Uploaded File Preview Box */}
      {uploadedDoc ? (
        <div
          className="glass-panel"
          style={{
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            background: 'rgba(99, 102, 241, 0.06)',
            borderColor: 'var(--accent-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {uploadedDoc.dataUrl ? (
              <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-medium)', flexShrink: 0 }}>
                <img src={uploadedDoc.dataUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  background: uploadedDoc.type === 'PDF' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  color: uploadedDoc.type === 'PDF' ? 'var(--risk-high)' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              >
                {uploadedDoc.type}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{uploadedDoc.name}</strong>
                <span className="badge badge-low" style={{ fontSize: '0.72rem' }}>
                  {uploadedDoc.type} • {uploadedDoc.size} KB
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} /> Text parsed and analysis results generated below.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <RefreshCw size={13} />
              <span>Upload Another File</span>
            </button>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px', color: 'var(--risk-high)' }}
              onClick={handleRemove}
            >
              <Trash2 size={13} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Universal Zone */
        <div
          className={`glass-panel ${isDragging ? 'drag-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '24px 20px',
            textAlign: 'center',
            border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            background: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-primary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--risk-high)' }}>
              <FileText size={22} />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Camera size={22} />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <FileUp size={22} />
            </div>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
            Drag & drop ANY document here, or click to browse
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Supports <strong>PDF</strong> (.pdf), <strong>Photos/Scans</strong> (.jpg, .png, .webp), and <strong>Text</strong> (.txt, .md)
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-primary-analyze"
              style={{ fontSize: '0.88rem', padding: '8px 20px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Browse PDF / Image / Text Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload & Parsing Progress Bar */}
      {isProcessing && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{statusMessage}</span>
            <span style={{ color: 'var(--text-muted)' }}>{uploadProgress}%</span>
          </div>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Person / Character / Non-Document Upload Warning Alert */}
      {uploadError && (
        <div
          className="glass-panel"
          style={{
            marginTop: 14,
            padding: '14px 18px',
            background: 'rgba(239, 68, 68, 0.12)',
            borderColor: 'var(--risk-high)',
            borderLeft: '5px solid var(--risk-high)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--risk-high)',
                flexShrink: 0
              }}
            >
              <AlertCircle size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.94rem', color: '#fca5a5', marginBottom: 2 }}>
                ⚠️ Image of a person or character should not be uploaded
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Please upload a clear photo or scan of an actual legal agreement, contract, medical consent, or government notice.
              </span>
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '5px 12px', flexShrink: 0 }}
            onClick={() => setUploadError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
