import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Flame, Activity } from 'lucide-react';

export default function RiskGaugeCard({ riskScore = 7, riskVerdict, overallRiskScore = 'High' }) {
  const score = Math.max(1, Math.min(10, riskScore));
  const isHigh = score >= 7;
  const isMedium = score >= 4 && score < 7;
  const isLow = score < 4;

  const scoreColor = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';
  const scoreGlow = isHigh ? 'rgba(239, 68, 68, 0.4)' : isMedium ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)';
  const gaugePercent = (score / 10) * 100;

  // SVG circular calculation for 3D dial
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

  return (
    <div
      className="glass-panel risk-gauge-3d-card"
      style={{
        borderLeft: `5px solid ${scoreColor}`,
        background: `linear-gradient(135deg, ${scoreColor}14 0%, rgba(19, 27, 46, 0.92) 100%)`
      }}
    >
      <div className="gauge-3d-wrapper">
        {/* Left Side: 3D Radial Dial */}
        <div className="gauge-dial-container">
          <svg className="gauge-svg-meter" width="104" height="104" viewBox="0 0 104 104">
            {/* Background track circle */}
            <circle
              cx="52"
              cy="52"
              r={radius}
              className="gauge-track-circle"
            />
            {/* Animated progress circle */}
            <circle
              cx="52"
              cy="52"
              r={radius}
              className="gauge-progress-circle"
              style={{
                stroke: scoreColor,
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                filter: `drop-shadow(0 0 8px ${scoreGlow})`
              }}
            />
          </svg>

          {/* 3D Floating Score Medallion in the center */}
          <div className="gauge-center-badge">
            <span className="gauge-number" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="gauge-max">/10</span>
          </div>
        </div>

        {/* Right Side: Score Classification & Dynamic Verdict */}
        <div className="gauge-info-content">
          <div className="gauge-header-row">
            <div>
              <div className="gauge-category-tag">
                <Activity size={12} style={{ marginRight: 4 }} />
                AI Risk Assessment
              </div>
              <h3 className="gauge-title" style={{ color: 'var(--text-primary)' }}>
                {overallRiskScore.toUpperCase()} RISK PROFILE
              </h3>
            </div>

            {/* 3D Status Pill */}
            <div
              className="badge-3d"
              style={{
                background: `${scoreColor}22`,
                borderColor: `${scoreColor}66`,
                color: scoreColor,
                boxShadow: `0 4px 14px ${scoreGlow}`
              }}
            >
              {isHigh ? <Flame size={14} /> : isMedium ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              <span>{isHigh ? 'CRITICAL HAZARDS' : isMedium ? 'MODERATE CLAUSES' : 'FAIR / SAFE TERMS'}</span>
            </div>
          </div>

          {/* 3D Segmented Linear Bar */}
          <div className="gauge-linear-track">
            <div
              className="gauge-linear-fill"
              style={{
                width: `${gaugePercent}%`,
                background: `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)`,
                boxShadow: `0 0 12px ${scoreGlow}`
              }}
            />
          </div>

          {/* Verdict Box with 3D inset border */}
          <div className="gauge-verdict-box">
            <strong style={{ color: scoreColor, marginRight: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.8rem' }}>
              Summary Verdict:
            </strong>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.45 }}>
              {riskVerdict || 'Contains unilateral and high liability provisions that should be clarified before execution.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
