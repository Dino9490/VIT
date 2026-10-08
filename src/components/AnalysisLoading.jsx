import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/translations';

export default function AnalysisLoading({ language }) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const steps = [
    t.loading.step1,
    t.loading.step2,
    t.loading.step3,
    t.loading.step4,
    t.loading.step5
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="glass-panel loading-card">
      <div className="loader-spinner-container">
        <div className="loader-pulse-ring"></div>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }} className="shimmer-text">
        {t.input.analyzing}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Deconstructing legal clauses and evaluating fairness benchmarks...
      </p>

      <div className="loading-steps-list">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={idx}
              className={`loading-step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              {isDone ? (
                <CheckCircle2 size={16} color="var(--success)" />
              ) : isActive ? (
                <Loader2 size={16} className="spin" color="var(--accent-primary)" />
              ) : (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
