import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle, DollarSign, Users, FileCheck, ShieldAlert,
  Camera, Download, Sparkles, Sliders, ArrowRight
} from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/translations';
import RiskGaugeCard from './RiskGaugeCard';
import DeadlineDetectorCard from './DeadlineDetectorCard';
import { exportAnalysisToPdf } from '../utils/pdfExport';

export default function SummaryView({
  analysisResult,
  language,
  onNavigateToTab,
  uploadedPhoto,
  documentTitle = 'Legal Document',
  onShowToast
}) {
  if (!analysisResult) return null;

  const [explainSimpler, setExplainSimpler] = useState(false);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const handleExportPdf = () => {
    exportAnalysisToPdf(analysisResult, documentTitle);
    if (onShowToast) onShowToast('PDF Briefing downloaded successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Controls: Explain Simpler Toggle & Export PDF Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* Simple vs Detailed Complexity Slider / Toggle */}
        <div className="lang-selector-group">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: 8 }}>
            Complexity:
          </span>
          <button
            className={`lang-btn ${!explainSimpler ? 'active' : ''}`}
            onClick={() => setExplainSimpler(false)}
            style={{ fontSize: '0.82rem', padding: '5px 12px' }}
          >
            <span>⚖️ Professional</span>
          </button>
          <button
            className={`lang-btn ${explainSimpler ? 'active' : ''}`}
            onClick={() => setExplainSimpler(true)}
            style={{ fontSize: '0.82rem', padding: '5px 12px' }}
          >
            <span>👶 5th Grader Simple</span>
          </button>
        </div>

        {/* Export to PDF Button */}
        <button
          className="btn-primary-analyze"
          onClick={handleExportPdf}
          style={{ fontSize: '0.85rem', padding: '8px 18px' }}
          title="Download full analysis as a formatted PDF report"
        >
          <Download size={15} />
          <span>Export as PDF Report</span>
        </button>
      </div>

      {/* Risk Score Gauge Meter (Risk: 7/10 or 8/10 + Verdict) */}
      <RiskGaugeCard
        riskScore={analysisResult.risk_score_numeric || (analysisResult.overall_risk_score === 'High' ? 8 : 5)}
        riskVerdict={analysisResult.risk_verdict}
        overallRiskScore={analysisResult.overall_risk_score}
      />

      {/* Deadline Detector & Relative Calculation (if deadline found) */}
      {analysisResult.deadline_detected && (
        <DeadlineDetectorCard
          deadlineText={analysisResult.deadline_detected}
          deadlineDays={analysisResult.deadline_days || 30}
          documentTitle={documentTitle}
          onShowToast={onShowToast}
        />
      )}

      {/* Plain-Language Summary Box */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileCheck size={22} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {explainSimpler ? '👶 Ultra-Simple Summary' : t.summary.title}
            </h3>
          </div>

          {uploadedPhoto && (
            <span className="badge badge-success" style={{ fontSize: '0.78rem' }}>
              <Camera size={12} />
              <span>Extracted from: {uploadedPhoto.name}</span>
            </span>
          )}
        </div>

        {/* Dynamic Summary Paragraph (3-4 Sentences) */}
        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 18 }}>
          {explainSimpler
            ? (analysisResult.simple_summary || analysisResult.summary)
            : analysisResult.summary}
        </p>

        {/* Quick Navigation CTAs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={() => onNavigateToTab('clauses')}
            style={{ fontSize: '0.85rem', padding: '7px 14px' }}
          >
            <AlertTriangle size={14} color="var(--risk-high)" />
            <span>Inspect {analysisResult.risky_clauses?.length || 0} Risky Clauses</span>
            <ArrowRight size={13} />
          </button>
          <button
            className="btn-secondary"
            onClick={() => onNavigateToTab('actionPlan')}
            style={{ fontSize: '0.85rem', padding: '7px 14px' }}
          >
            <CheckCircle size={14} color="var(--accent-primary)" />
            <span>View {analysisResult.action_plan?.length || 0} Action Checklist Items</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Grid of Key Info Cards (Parties & Financials) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {/* Parties / Agency */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Users size={18} color="var(--accent-primary)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{t.summary.parties}</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {analysisResult.parties_detected || 'Parties identified in document preamble.'}
          </p>
        </div>

        {/* Financial Commitments & Penalties */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <DollarSign size={18} color="var(--risk-medium)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{t.summary.financials}</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {analysisResult.financial_commitments || 'Monetary figures and obligations found in text.'}
          </p>
        </div>
      </div>

      {/* Critical Takeaways List */}
      {analysisResult.key_findings && analysisResult.key_findings.length > 0 && (
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <AlertTriangle size={18} color="var(--risk-high)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t.summary.keyFindings}</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysisResult.key_findings.map((finding, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '9px 12px',
                  background: 'var(--bg-primary)',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', marginTop: 7, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
