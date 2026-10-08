import React, { useState, useRef } from 'react';
import { FileText, Copy, Check, Info, ShieldAlert, CheckCircle2, X, Camera } from 'lucide-react';
import { buildHighlightedSegments } from '../utils/textHighlighter';
import { UI_TRANSLATIONS } from '../data/translations';

export default function DocumentViewer({
  documentText,
  riskyClauses = [],
  activeClauseId,
  onSelectClause,
  language,
  onShowToast,
  uploadedPhoto
}) {
  const [popoverState, setPopoverState] = useState(null); // { x, y, clause }
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const containerRef = useRef(null);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  // Build segments with non-overlapping highlighted spans
  const segments = buildHighlightedSegments(documentText, riskyClauses, activeClauseId);

  const handleHighlightClick = (event, segment) => {
    event.stopPropagation();
    onSelectClause(segment.clauseId);

    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

    setPopoverState({
      x: Math.min(rect.left - containerRect.left, 280),
      y: rect.bottom - containerRect.top + 8,
      clause: segment
    });
  };

  const handleCopyQuote = (quoteText) => {
    navigator.clipboard.writeText(quoteText);
    setCopiedQuote(true);
    if (onShowToast) {
      onShowToast(t.clauses.copiedQuote);
    }
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div
      className="glass-panel doc-viewer-card"
      ref={containerRef}
      onClick={() => setPopoverState(null)}
      style={{ position: 'relative' }}
    >
      <div className="doc-viewer-header">
        <div className="doc-viewer-title">
          <FileText size={18} color="var(--accent-primary)" />
          <span>{t.clauses.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {uploadedPhoto && (
            <button
              className="btn-secondary"
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoPreview(!showPhotoPreview);
              }}
              title="Toggle original photo view"
            >
              <Camera size={12} />
              <span>{showPhotoPreview ? 'Hide Photo' : `View ${uploadedPhoto.type}`}</span>
            </button>
          )}
          <span className="badge badge-high" style={{ fontSize: '0.72rem', cursor: 'default' }}>
            🔴 {t.clauses.legendRisky || 'Risky (Red)'}
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.72rem', cursor: 'default' }}>
            🟢 {t.clauses.legendNormal || 'Normal (Green)'}
          </span>
        </div>
      </div>

      {/* Optional Side-by-Side Original Document Photo Drawer */}
      {uploadedPhoto && showPhotoPreview && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              📸 Original Uploaded Photo ({uploadedPhoto.name} - {uploadedPhoto.type}):
            </span>
            <button
              onClick={() => setShowPhotoPreview(false)}
              style={{ background: 'transparent', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ maxHeight: 220, overflow: 'auto', borderRadius: 6, textAlign: 'center' }}>
            <img
              src={uploadedPhoto.dataUrl}
              alt="Uploaded agreement photo"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }}
            />
          </div>
        </div>
      )}

      {/* Floating Popover when clicking a highlighted clause in the document */}
      {popoverState && (
        <div
          className="clause-popover"
          style={{
            top: `${popoverState.y}px`,
            left: `${Math.max(10, popoverState.x)}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const isRisky = ['high', 'medium', 'risky'].includes((popoverState.clause.riskLevel || '').toLowerCase());
            return (
              <>
                <div className="popover-header">
                  <span className={`badge ${isRisky ? 'badge-high' : 'badge-success'}`}>
                    {isRisky ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                    {isRisky ? (t.clauses.riskBadge || '🔴 RISKY CLAUSE (RED)') : (t.clauses.normalBadge || '🟢 NORMAL CLAUSE (GREEN)')}
                  </span>
                  <button
                    onClick={() => setPopoverState(null)}
                    style={{ background: 'transparent', color: 'var(--text-muted)' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>
                  {isRisky ? t.clauses.clauseReason : (t.clauses.normalReason || 'Why this is standard / safe')}:
                </div>
                <div className="popover-reason">
                  {popoverState.clause.reason}
                </div>

                <div className="popover-actions">
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                    onClick={() => handleCopyQuote(popoverState.clause.content)}
                  >
                    {copiedQuote ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    <span>{copiedQuote ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Rendered Document Text with Highlight Spans */}
      <div className="doc-text-render">
        {segments.map((seg) => {
          if (seg.type === 'text') {
            return <span key={seg.key}>{seg.content}</span>;
          }

          const isRisky = ['high', 'medium', 'risky'].includes((seg.riskLevel || '').toLowerCase());
          const isActive = activeClauseId === seg.clauseId;

          return (
            <mark
              key={seg.key}
              id={`doc-clause-${seg.clauseId}`}
              data-clause-id={seg.clauseId}
              className={`clause-highlight ${isRisky ? 'risk-high' : 'risk-normal'} ${
                isActive ? 'pulse-flash' : ''
              }`}
              onClick={(e) => handleHighlightClick(e, seg)}
              title={`${t.clauses.severity}: ${isRisky ? '🔴 RISKY (RED)' : '🟢 NORMAL (GREEN)'} - ${t.clauses.clickToInspect}`}
            >
              {seg.content}
            </mark>
          );
        })}
      </div>
    </div>
  );
}
