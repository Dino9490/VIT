import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Copy, Check, Crosshair, Sparkles, PartyPopper, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UI_TRANSLATIONS } from '../data/translations';

export default function ActionPlanView({
  actionPlan = [],
  onLocateClauseQuote,
  language,
  onShowToast
}) {
  const [completedTasks, setCompletedTasks] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const totalTasks = actionPlan.length;
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Trigger confetti when hitting 100%
  useEffect(() => {
    if (progressPercent === 100 && totalTasks > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [progressPercent, totalTasks]);

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleCopyAsk = (idx, askText) => {
    navigator.clipboard.writeText(askText);
    setCopiedIndex(idx);
    if (onShowToast) {
      onShowToast(t.actionPlan.questionCopied);
    }
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="action-plan-wrapper">
      {/* Header & Dynamic Progress Bar */}
      <div className="progress-card">
        <div className="progress-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckSquare size={20} color="var(--accent-primary)" />
            <h3 className="progress-title">{t.actionPlan.title}</h3>
          </div>
          <div className="progress-pct">
            {completedCount} / {totalTasks} {t.actionPlan.completed} ({progressPercent}%)
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {progressPercent === 100 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
            <PartyPopper size={18} />
            <span>{t.actionPlan.allDone}</span>
          </div>
        )}
      </div>

      {/* Task Checklist Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {actionPlan.map((item, idx) => {
          const isDone = !!completedTasks[item.id || idx];
          const isHighPriority = (item.priority || '').toLowerCase() === 'high';
          const isMediumPriority = (item.priority || '').toLowerCase() === 'medium';

          return (
            <div
              key={item.id || idx}
              className={`action-task-card ${isDone ? 'task-completed' : ''}`}
            >
              <div className="task-top-row">
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={isDone}
                  onChange={() => toggleTask(item.id || idx)}
                />

                <div className="task-title-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span
                      className={`badge ${
                        isHighPriority ? 'badge-high' : isMediumPriority ? 'badge-medium' : 'badge-low'
                      }`}
                    >
                      {item.priority?.toUpperCase()} PRIORITY
                    </span>

                    {item.clause_quote && (
                      <button
                        className="btn-jump"
                        onClick={() => onLocateClauseQuote(item.clause_quote)}
                        title={t.actionPlan.scrollToClause}
                      >
                        <Crosshair size={13} />
                        <span>{t.actionPlan.scrollToClause}</span>
                      </button>
                    )}
                  </div>

                  <h4 className="task-title">{item.task}</h4>
                </div>
              </div>

              {/* Task Details (Why & Counter-Proposal Question) */}
              <div className="task-details-box">
                {/* Why it matters */}
                <div className="task-why-row">
                  <strong style={{ color: 'var(--text-primary)', marginRight: 6 }}>
                    {t.actionPlan.whyTitle}
                  </strong>
                  {item.why}
                </div>

                {/* Ready-to-Send Ask */}
                <div className="task-ask-box">
                  <div className="ask-label">
                    {t.actionPlan.askTitle}
                  </div>
                  <div className="ask-text">
                    "{item.ask}"
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="task-footer-actions">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Step #{idx + 1}
                </span>

                <button
                  className="btn-copy-question"
                  onClick={() => handleCopyAsk(idx, item.ask)}
                  title="Copy formatted question for landlord or counterparty"
                >
                  {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedIndex === idx ? 'Copied to Clipboard!' : t.actionPlan.copyQuestion}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
