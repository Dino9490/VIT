import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerFooter({ language }) {
  return (
    <footer className="footer-container">
      {/* Required Disclaimer Footer */}
      <div className="disclaimer-box">
        <ShieldAlert className="disclaimer-icon" />
        <div className="disclaimer-content">
          <h4>⚖️ Simplified explanation, not legal or medical advice</h4>
          <p>
            Jargon Breaker is an AI assistance tool for informational and educational purposes only. It does not provide formal legal representation, medical advice, or establish a professional client relationship. Always consult a licensed attorney, doctor, or certified professional before executing binding contracts or making healthcare decisions.
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Jargon Breaker • Built for clarity, protection, and legal empowerment.
      </p>
    </footer>
  );
}
