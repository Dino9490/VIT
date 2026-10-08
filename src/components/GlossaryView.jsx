import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, HelpCircle, Check } from 'lucide-react';
import { KEY_TERMS_GLOSSARY } from '../data/glossary';

export default function GlossaryView({ detectedTerms = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'Legal', 'Medical', 'Government', 'Real Estate'

  const allTerms = Object.values(KEY_TERMS_GLOSSARY);

  const filteredTerms = allTerms.filter((item) => {
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detailed.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedTab === 'all' || item.category.toLowerCase().includes(selectedTab.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Card */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={22} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Key Legal & Medical Jargon Glossary</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Plain-English explanations for complex legal clauses, medical billing terms, and government notices.
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search jargon term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                padding: '8px 12px 8px 32px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {['all', 'Legal', 'Medical', 'Government', 'Real Estate'].map((cat) => (
            <button
              key={cat}
              className={`filter-pill-btn ${selectedTab === cat ? 'active' : ''}`}
              onClick={() => setSelectedTab(cat)}
            >
              {cat === 'all' ? 'All Jargon Terms' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Glossary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filteredTerms.map((item, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {item.term}
                </h4>
                <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                  {item.category}
                </span>
              </div>

              {/* Simple 5th-Grader Explanation */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  marginBottom: 8,
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                  color: 'var(--text-primary)'
                }}
              >
                <strong style={{ color: 'var(--accent-primary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  👶 Simple Meaning:
                </strong>
                {item.simple}
              </div>

              {/* Formal Legal Meaning */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  ⚖️ Formal Definition:
                </strong>
                {item.detailed}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
