import React, { useState, useRef } from 'react';
import { Camera, Image, Upload, Check, AlertCircle, Trash2, Sparkles, FileImage, RefreshCw } from 'lucide-react';
import { isValidImageFile, extractTextFromImage, fileToDataUrl, ACCEPTED_EXTENSIONS } from '../services/ocrService';
import { SAMPLE_DOCUMENTS } from '../data/examples';
import { UI_TRANSLATIONS } from '../data/translations';

export default function PhotoUploadZone({
  onTextExtracted,
  language,
  onShowToast,
  uploadedPhoto,
  setUploadedPhoto
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const handleFileSelect = async (file) => {
    if (!file) return;

    setUploadError(null);

    if (!isValidImageFile(file)) {
      const msg = 'Please upload a valid JPG or PNG image file.';
      setUploadError(msg);
      if (onShowToast) onShowToast(msg);
      return;
    }

    try {
      setIsProcessing(true);
      setOcrProgress(15);
      setOcrStatusText(t.input.extractingText);

      const dataUrl = await fileToDataUrl(file);
      const isPng = file.type?.includes('png') || file.name?.toLowerCase().endsWith('.png');
      const formatType = isPng ? 'PNG' : 'JPG';

      setUploadedPhoto({
        name: file.name,
        size: Math.round(file.size / 1024),
        type: formatType,
        dataUrl
      });

      const result = await extractTextFromImage(file, ({ status, progress }) => {
        setOcrProgress(progress || 50);
        if (status === 'analyzing_with_ai') setOcrStatusText('Analyzing image with AI Vision...');
        if (status === 'recognizing_text') setOcrStatusText('Scanning characters with OCR engine...');
      });

      setOcrProgress(100);
      onTextExtracted(result.text);

      if (onShowToast) {
        onShowToast(`${t.input.ocrSuccess} (${result.method || formatType})`);
      }
    } catch (err) {
      console.error('Photo OCR error:', err);
      setUploadedPhoto(null);
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

  // Helper to generate a sample canvas contract photo in JPG or PNG format
  const handleLoadSamplePhoto = (format = 'jpg') => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Draw document page background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);

    // Draw header bar
    ctx.fillStyle = '#312e81';
    ctx.fillRect(40, 30, 720, 8);

    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('RESIDENTIAL LEASE AGREEMENT (PHOTO SCAN)', 50, 75);

    // Draw lines of text
    ctx.fillStyle = '#374151';
    ctx.font = '14px monospace';
    const lines = [
      '1. TERM AND RENT: Monthly rent of $2,400 due on 1st of each month.',
      '2. RENT ESCALATION: Landlord may increase rent up to 20% on 30 days notice.',
      '3. LATE PENALTIES: 10% per day mandatory penalty on unpaid balance.',
      '4. SECURITY DEPOSIT: $4,800 deposit with sole discretion to withhold for wear.',
      '5. ENTRY: Landlord may enter at any time without prior written notice.',
      '6. REPAIRS: Tenant assumes full responsibility for roof leaks and HVAC repairs.',
      '7. TERMINATION: Landlord may terminate with 24 hours written notice.'
    ];

    let y = 120;
    lines.forEach((line) => {
      ctx.fillText(line, 50, y);
      y += 35;
    });

    // Convert to dataUrl
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mime, 0.92);

    const sampleFileName = format === 'png' ? 'sample_lease_scan.png' : 'sample_rental_document.jpg';
    setUploadedPhoto({
      name: sampleFileName,
      size: 48,
      type: format.toUpperCase(),
      dataUrl
    });

    onTextExtracted(SAMPLE_DOCUMENTS[0].text);
    if (onShowToast) onShowToast(`Loaded ${format.toUpperCase()} sample document photo!`);
  };

  const handleRemovePhoto = () => {
    setUploadedPhoto(null);
    setOcrProgress(0);
  };

  return (
    <div style={{ marginTop: 16 }}>
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

      {/* Uploaded Photo Preview Card */}
      {uploadedPhoto ? (
        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-medium)', flexShrink: 0, position: 'relative' }}>
              <img src={uploadedPhoto.dataUrl} alt="Document preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: 3,
                  background: uploadedPhoto.type === 'PNG' ? 'var(--accent-primary)' : 'var(--risk-medium)',
                  color: '#fff'
                }}
              >
                {uploadedPhoto.type}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{uploadedPhoto.name}</strong>
                <span className="badge badge-low" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                  {uploadedPhoto.type} • {uploadedPhoto.size} KB
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                ✓ Text extracted and ready for AI risk analysis.
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
              <span>Replace Photo</span>
            </button>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px', color: 'var(--risk-high)' }}
              onClick={handleRemovePhoto}
            >
              <Trash2 size={13} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Photo Zone */
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Camera size={22} />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--risk-medium)' }}>
              <FileImage size={22} />
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>
            {t.input.dragDropText}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            {t.input.supportedFormats} (.jpg, .jpeg, .png, .webp)
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-primary-analyze"
              style={{ fontSize: '0.85rem', padding: '8px 18px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Browse JPG / PNG Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing / OCR Progress */}
      {isProcessing && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{ocrStatusText}</span>
            <span style={{ color: 'var(--text-muted)' }}>{ocrProgress}%</span>
          </div>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${ocrProgress}%` }} />
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
