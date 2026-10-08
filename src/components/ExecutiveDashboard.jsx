import React, { useState } from 'react';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, DollarSign, Users,
  Download, ArrowRight, Sparkles, Activity, FileText, CheckSquare,
  MessageSquare, BookOpen, Layers, Zap, Scale, FileCheck, Copy, Check
} from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/translations';
import { exportAnalysisToPdf } from '../utils/pdfExport';
import DeadlineDetectorCard from './DeadlineDetectorCard';

export default function ExecutiveDashboard({
  analysisResult,
  language,
  onNavigateToTab,
  onLocateClause,
  documentTitle = 'Legal Agreement',
  onShowToast
}) {
  if (!analysisResult) return null;

  const [explainSimpler, setExplainSimpler] = useState(false);
  const [copiedQuoteId, setCopiedQuoteId] = useState(null);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  // Numeric risk score & severities
  const score = analysisResult.risk_score_numeric || (analysisResult.overall_risk_score === 'High' ? 8 : 5);
  const isHigh = score >= 7;
  const isMedium = score >= 4 && score < 7;
  const scoreColor = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';
  const scoreGlow = isHigh ? 'rgba(239, 68, 68, 0.4)' : isMedium ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)';

  const riskyClauses = analysisResult.risky_clauses || [];
  const riskyCount = riskyClauses.filter(c => ['high', 'medium', 'risky'].includes((c.risk_level || '').toLowerCase())).length;
  const normalCount = riskyClauses.filter(c => ['normal', 'safe', 'low'].includes((c.risk_level || '').toLowerCase())).length;
  const totalClauses = Math.max(1, riskyCount + normalCount);
  const riskyRatioPct = Math.round((riskyCount / totalClauses) * 100);

  const actionPlan = analysisResult.action_plan || [];
  const highPriorityTasks = actionPlan.filter(item => (item.priority || '').toLowerCase() === 'high');

  // SVG circular calculation for 3D dial
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const gaugePercent = (score / 10) * 100;
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedQuoteId(id);
    if (onShowToast) onShowToast(t.clauses.copiedQuote);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  const handleExportPdf = () => {
    exportAnalysisToPdf(analysisResult, documentTitle);
    if (onShowToast) onShowToast('Executive PDF Dossier downloaded successfully!');
  };

  return (
    <div className="executive-dashboard-container">
      {/* 1. Live Telemetry & Intelligence Command Header */}
      <div className="glass-panel dashboard-hud-banner">
        <div className="hud-left-group">
          <div className="hud-pulse-node">
            <span className="live-dot" />
            <span className="live-text">AI Neural Radar Active</span>
          </div>
          <div className="hud-meta-divider" />
          <div className="hud-doc-info">
            <span className="hud-label">Document Under Review:</span>
            <strong className="hud-value">{documentTitle}</strong>
          </div>
        </div>

        <div className="hud-right-actions">
          {/* Complexity Mode Switch */}
          <div className="lang-selector-group" style={{ padding: '2px 4px' }}>
            <button
              className={`lang-btn ${!explainSimpler ? 'active' : ''}`}
              onClick={() => setExplainSimpler(false)}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              ⚖️ Executive
            </button>
            <button
              className={`lang-btn ${explainSimpler ? 'active' : ''}`}
              onClick={() => setExplainSimpler(true)}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              👶 Simple (5th Grader)
            </button>
          </div>

          {/* Export PDF Dossier Action */}
          <button
            className="btn-primary-analyze"
            onClick={handleExportPdf}
            style={{ fontSize: '0.82rem', padding: '7px 16px' }}
          >
            <Download size={14} />
            <span>Export Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Holographic Executive KPI Grid (3D Depth Tiles) */}
      <div className="dashboard-kpi-grid">
        {/* KPI 1: 3D Radial Risk Severity Meter */}
        <div
          className="glass-panel kpi-card kpi-risk-tile"
          style={{
            borderLeft: `5px solid ${scoreColor}`,
            background: `linear-gradient(135deg, ${scoreColor}12 0%, rgba(18, 26, 44, 0.9) 100%)`
          }}
        >
          <div className="kpi-card-header">
            <span className="kpi-tag">Risk Assessment Gauge</span>
            <span
              className="badge-3d"
              style={{
                background: `${scoreColor}22`,
                borderColor: `${scoreColor}55`,
                color: scoreColor,
                fontSize: '0.72rem',
                padding: '3px 9px'
              }}
            >
              {isHigh ? '🔴 HIGH HAZARD' : isMedium ? '🟡 MODERATE' : '🟢 SAFE / BALANCED'}
            </span>
          </div>

          <div className="kpi-dial-flex">
            <div className="kpi-svg-dial">
              <svg width="86" height="86" viewBox="0 0 86 86" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="43" cy="43" r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle
                  cx="43"
                  cy="43"
                  r={radius}
                  fill="transparent"
                  stroke={scoreColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ filter: `drop-shadow(0 0 6px ${scoreGlow})`, transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="kpi-dial-center">
                <span className="kpi-score-val" style={{ color: scoreColor }}>{score}</span>
                <span className="kpi-score-max">/10</span>
              </div>
            </div>

            <div className="kpi-dial-text">
              <div className="kpi-verdict-title">{analysisResult.overall_risk_score} Risk Profile</div>
              <p className="kpi-verdict-sub">
                {analysisResult.risk_verdict || 'Contains multiple aggressive provisions requiring negotiation.'}
              </p>
            </div>
          </div>
        </div>

        {/* KPI 2: Risky vs Normal Clause Ratio Radar */}
        <div
          className="glass-panel kpi-card kpi-clauses-tile"
          onClick={() => onNavigateToTab('clauses')}
          title="Click to open Clause Inspector"
        >
          <div className="kpi-card-header">
            <span className="kpi-tag">Clause Breakdown Radar</span>
            <ArrowRight size={14} color="var(--accent-primary)" />
          </div>

          <div className="kpi-clause-stats-row">
            <div className="kpi-stat-box red-stat">
              <span className="stat-number" style={{ color: 'var(--risk-high)' }}>{riskyCount}</span>
              <span className="stat-label">🔴 Risky (Red)</span>
            </div>
            <div className="kpi-stat-box green-stat">
              <span className="stat-number" style={{ color: 'var(--success)' }}>{normalCount}</span>
              <span className="stat-label">🟢 Normal (Green)</span>
            </div>
          </div>

          <div className="kpi-ratio-bar-wrapper">
            <div className="kpi-ratio-bar">
              <div className="ratio-red" style={{ width: `${riskyRatioPct}%` }} />
              <div className="ratio-green" style={{ width: `${100 - riskyRatioPct}%` }} />
            </div>
            <div className="kpi-ratio-labels">
              <span>{riskyRatioPct}% Risky Clauses</span>
              <span>{100 - riskyRatioPct}% Standard Terms</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Response Timeline & Deadline Alert */}
        <div className="glass-panel kpi-card kpi-deadline-tile">
          <div className="kpi-card-header">
            <span className="kpi-tag">Critical Response Timeline</span>
            <Clock size={16} color={analysisResult.deadline_detected ? 'var(--risk-medium)' : 'var(--text-muted)'} />
          </div>

          {analysisResult.deadline_detected ? (
            <div>
              <div className="kpi-deadline-days" style={{ color: 'var(--risk-medium)' }}>
                ⏳ {analysisResult.deadline_days || 30} Days Notice
              </div>
              <p className="kpi-deadline-sub">{analysisResult.deadline_detected}</p>
              <div className="kpi-deadline-badge">
                <span>⚠️ Strict forfeiture cutoff if missed</span>
              </div>
            </div>
          ) : (
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
                ✓ No Strict Forfeiture Window
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Standard statutory notification terms apply without accelerated penalty deadlines.
              </p>
            </div>
          )}
        </div>

        {/* KPI 4: Financial Obligations & Penalties */}
        <div className="glass-panel kpi-card kpi-financials-tile">
          <div className="kpi-card-header">
            <span className="kpi-tag">Financial Exposure & Fees</span>
            <DollarSign size={16} color="var(--risk-medium)" />
          </div>

          <div className="kpi-financial-body">
            <p className="kpi-financial-text">
              {analysisResult.financial_commitments || 'Monetary liabilities and scheduled payment obligations.'}
            </p>
            <div className="kpi-parties-sub">
              <Users size={12} style={{ marginRight: 4 }} />
              <span>{analysisResult.parties_detected || 'Parties declared in agreement'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Executive Summary Briefing Card */}
      <div className="glass-panel dashboard-briefing-card">
        <div className="briefing-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="briefing-icon-box">
              <FileCheck size={20} />
            </div>
            <div>
              <h3 className="briefing-title">
                {explainSimpler ? '👶 Ultra-Simple 5th-Grader Briefing' : '📑 Executive Plain-Language Briefing'}
              </h3>
              <p className="briefing-sub">AI synthesis of contractual obligations, risks, and recommended actions.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => onNavigateToTab('clauses')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Layers size={13} color="var(--accent-primary)" />
              <span>Inspect Document Highlights</span>
            </button>
          </div>
        </div>

        <div className="briefing-content-box">
          <p className="briefing-paragraph">
            {explainSimpler
              ? (analysisResult.simple_summary || analysisResult.summary)
              : analysisResult.summary}
          </p>
        </div>

        {/* Key Takeaways Chips */}
        {analysisResult.key_findings && analysisResult.key_findings.length > 0 && (
          <div className="briefing-takeaways-grid">
            {analysisResult.key_findings.map((item, idx) => (
              <div key={idx} className="takeaway-chip">
                <div className="takeaway-bullet" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Two-Column Intelligence Matrix: Top Risky Clauses & Immediate Action Plan */}
      <div className="dashboard-matrix-grid">
        {/* Left Column: Top Risky Clauses Flagged (Red) */}
        <div className="glass-panel matrix-column-card">
          <div className="matrix-column-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="var(--risk-high)" />
              <h4 className="matrix-title">High Hazard Clauses ({riskyCount})</h4>
            </div>
            <button
              className="matrix-view-all-btn"
              onClick={() => onNavigateToTab('clauses')}
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="matrix-items-list">
            {riskyClauses.filter(c => ['high', 'medium', 'risky'].includes((c.risk_level || '').toLowerCase())).slice(0, 3).map((clause, idx) => (
              <div
                key={clause.id || idx}
                className="matrix-clause-item red-highlight-item"
                onClick={() => {
                  onNavigateToTab('clauses');
                  if (onLocateClause) onLocateClause(clause.id);
                }}
              >
                <div className="matrix-item-top">
                  <span className="badge badge-high" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    🔴 Risky Clause #{idx + 1}
                  </span>
                  <button
                    className="btn-copy-tiny"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(clause.id, clause.quote);
                    }}
                    title="Copy verbatim quote"
                  >
                    {copiedQuoteId === clause.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  </button>
                </div>

                <div className="matrix-reason-text">{clause.reason}</div>
                <div className="matrix-quote-snippet">"{clause.quote.slice(0, 110)}..."</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Immediate Negotiation Playbook & Questions */}
        <div className="glass-panel matrix-column-card">
          <div className="matrix-column-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="var(--accent-primary)" />
              <h4 className="matrix-title">Negotiation Playbook ({actionPlan.length} Steps)</h4>
            </div>
            <button
              className="matrix-view-all-btn"
              onClick={() => onNavigateToTab('actionPlan')}
            >
              <span>Full Checklist</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="matrix-items-list">
            {actionPlan.slice(0, 3).map((task, idx) => (
              <div
                key={task.id || idx}
                className="matrix-task-item"
                onClick={() => onNavigateToTab('actionPlan')}
              >
                <div className="matrix-item-top">
                  <span className={`badge ${task.priority === 'High' ? 'badge-high' : 'badge-medium'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    {task.priority || 'High'} Priority
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Step #{idx + 1}</span>
                </div>

                <div className="matrix-task-title">{task.task}</div>
                {task.ask && (
                  <div className="matrix-ask-preview">
                    <strong>Ask:</strong> "{task.ask}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Optional Deadline Detector Card if deadline present */}
      {analysisResult.deadline_detected && (
        <DeadlineDetectorCard
          deadlineText={analysisResult.deadline_detected}
          deadlineDays={analysisResult.deadline_days || 30}
          documentTitle={documentTitle}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
}
