import React from 'react';
import { CheckCircle2, Sparkles, Info } from 'lucide-react';

export default function Toast({ toasts = [] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          <CheckCircle2 size={18} color="var(--accent-primary)" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
