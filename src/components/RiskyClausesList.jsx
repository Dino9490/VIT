import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Crosshair, Copy, Check, Filter } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/translations';

export default function RiskyClausesList({
  riskyClauses = [],
  activeClauseId,
  onSelectClause,
  onLocateClause,
  language,
  onShowToast
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'risky', 'normal'
  const [copiedId, setCopiedId] = useState(null);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const isClauseRisky = (c) => ['high', 'medium', 'risky'].includes((c.risk_level || '').toLowerCase());
  const isClauseNormal = (c) => ['normal', 'safe', 'low'].includes((c.risk_level || '').toLowerCase());

  const riskyList = riskyClauses.filter(isClauseRisky);
  const normalList = riskyClauses.filter(isClauseNormal);

  const filteredClauses = riskyClauses.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'risky') return isClauseRisky(c);
    if (filter === 'normal') return isClauseNormal(c);
    return true;
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) onShowToast(t.clauses.copiedQuote);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="risks-panel">
      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="filter-bar">
          <Filter size={14} color="var(--text-muted)" style={{ marginRight: 4 }} />
          <button
            className={`filter-pill-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t.clauses.filterAll} ({riskyClauses.length})
          </button>
          <button
            className={`filter-pill-btn ${filter === 'risky' ? 'active active-risky' : ''}`}
            onClick={() => setFilter('risky')}
          >
            🔴 {t.clauses.filterRisky || 'Risky (Red)'} ({riskyList.length})
          </button>
          <button
            className={`filter-pill-btn ${filter === 'normal' ? 'active active-normal' : ''}`}
            onClick={() => setFilter('normal')}
          >
            🟢 {t.clauses.filterNormal || 'Normal (Green)'} ({normalList.length})
          </button>
        </div>
      </div>

      {/* Clauses Cards */}
      {filteredClauses.length === 0 ? (
        <div className="glass-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>{t.clauses.noRisks}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredClauses.map((clause, idx) => {
            const isRisky = isClauseRisky(clause);
            const isActive = activeClauseId === clause.id;

            return (
              <div
                key={clause.id || idx}
                id={`clause-card-${clause.id}`}
                className={`risk-clause-card ${isRisky ? 'card-high' : 'card-normal'} ${
                  isActive ? 'pulse-flash' : ''
                }`}
                onClick={() => onSelectClause(clause.id)}
              >
                <div className="clause-card-header">
                  <span className={`badge ${isRisky ? 'badge-high' : 'badge-success'}`}>
                    {isRisky ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                    {isRisky ? (t.clauses.riskBadge || '🔴 Risky (Red)') : (t.clauses.normalBadge || '🟢 Normal (Green)')}
                  </span>

                  <button
                    className="btn-jump"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLocateClause(clause.id);
                    }}
                    title={t.clauses.jumpToText}
                  >
                    <Crosshair size={14} />
                    <span>{t.clauses.jumpToText}</span>
                  </button>
                </div>

                {/* Reason in Selected Language */}
                <div className="clause-card-reason">
                  <strong style={{ color: isRisky ? 'var(--risk-high)' : 'var(--success)', display: 'block', marginBottom: 4 }}>
                    {isRisky ? t.clauses.clauseReason : (t.clauses.normalReason || 'Why this is standard / safe')}:
                  </strong>
                  {clause.reason}
                </div>

                {/* Original Quote Box */}
                <div
                  className="clause-quote-box"
                  style={{
                    borderLeft: `3px solid ${isRisky ? 'var(--risk-high)' : 'var(--success)'}`
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>
                    {t.clauses.originalQuote}:
                  </div>
                  "{clause.quote}"
                </div>

                {/* Card Actions */}
                <div className="clause-card-actions">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Clause #{idx + 1}
                  </span>

                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(clause.id, clause.quote);
                    }}
                  >
                    {copiedId === clause.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    <span>{copiedId === clause.id ? 'Copied' : 'Copy Quote'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
