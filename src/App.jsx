import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DocumentInput from './components/DocumentInput';
import AnalysisLoading from './components/AnalysisLoading';
import SummaryView from './components/SummaryView';
import DocumentViewer from './components/DocumentViewer';
import RiskyClausesList from './components/RiskyClausesList';
import ActionPlanView from './components/ActionPlanView';
import AskDocumentChat from './components/AskDocumentChat';
import DisclaimerFooter from './components/DisclaimerFooter';
import Toast from './components/Toast';

import ExecutiveDashboard from './components/ExecutiveDashboard';

import { SAMPLE_DOCUMENTS } from './data/examples';
import { UI_TRANSLATIONS } from './data/translations';
import { analyzeDocument } from './services/aiService';
import { scrollAndFlashElement } from './utils/textHighlighter';

import { LayoutDashboard, FileText, AlertTriangle, CheckSquare, MessageSquare } from 'lucide-react';
import './App.css';

export default function App() {
  // Theme & Language State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('en'); // 'en', 'ta', 'hi'

  // Document, Category & Analysis State
  const [docTypeCategory, setDocTypeCategory] = useState('legal'); // 'legal', 'medical', 'government'
  const [documentText, setDocumentText] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState(null); // { name, size, type: 'PDF'|'JPG'|'PNG'|'TXT', dataUrl }
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'summary', 'clauses', 'actionPlan', 'glossary', 'chat'
  const [activeClauseId, setActiveClauseId] = useState(null);

  // Toast State
  const [toasts, setToasts] = useState([]);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  // Sync dark/light theme to body class
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    document.body.setAttribute('data-lang', language);
  }, [isDarkMode, language]);

  // When language changes, update analysis if we have an existing result
  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    if (analysisResult && documentText.trim()) {
      handleRunAnalysis(documentText, newLang, docTypeCategory);
    }
  };

  // Run Analysis Engine: Results appear dynamically for ANY document
  const handleRunAnalysis = async (textToAnalyze = documentText, targetLang = language, category = docTypeCategory) => {
    if (!textToAnalyze.trim()) {
      showToast('Please paste a document or upload a file first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeDocument(textToAnalyze, targetLang, category);
      setAnalysisResult(result);
      setActiveTab('dashboard');
      showToast('Document analyzed successfully! Results ready below.');
    } catch (err) {
      console.error('Analysis error:', err);
      showToast('Error analyzing document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toast Notification Trigger
  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Jump to and locate clause in document text
  const handleLocateClause = (clauseId) => {
    setActiveClauseId(clauseId);
    setActiveTab('clauses');

    setTimeout(() => {
      const success = scrollAndFlashElement(`doc-clause-${clauseId}`);
      if (!success) {
        const target = document.querySelector(`[data-clause-id="${clauseId}"]`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('pulse-flash');
        }
      }
    }, 100);
  };

  // Jump to and locate quote string in document text
  const handleLocateQuote = (quoteText) => {
    if (!quoteText) return;

    const matchingClause = analysisResult?.risky_clauses?.find(
      (c) => c.quote && (c.quote.includes(quoteText) || quoteText.includes(c.quote))
    );

    if (matchingClause) {
      handleLocateClause(matchingClause.id);
    } else {
      setActiveTab('clauses');
      setTimeout(() => {
        const marks = document.querySelectorAll('.clause-highlight, .doc-text-render');
        let matchedElem = null;
        for (const el of marks) {
          if (el.textContent.includes(quoteText.slice(0, 30))) {
            matchedElem = el;
            break;
          }
        }
        if (matchedElem) {
          matchedElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          matchedElem.classList.remove('pulse-flash');
          void matchedElem.offsetWidth;
          matchedElem.classList.add('pulse-flash');
        }
      }, 100);
    }
  };

  const documentTitle = uploadedDoc?.name || (docTypeCategory === 'medical'
    ? 'Hospital Surgical Consent'
    : docTypeCategory === 'government'
    ? 'Government Assessment Notice'
    : 'Residential Rental Lease');

  return (
    <div className="app-container">
      {/* 3D Ambient Glowing Mesh Background */}
      <div className="ambient-background" aria-hidden="true">
        <div className="orb orb-primary" />
        <div className="orb orb-secondary" />
        <div className="orb orb-accent" />
        <div className="mesh-grid" />
      </div>

      {/* Top Navigation Bar */}
      <Header
        language={language}
        setLanguage={handleLanguageChange}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Content Workspace */}
      <main className="main-content">
        {/* Document Type Dropdown, "Try Example" Button, Paste Box & Universal Upload (PDF / Images / Text) */}
        <DocumentInput
          documentText={documentText}
          setDocumentText={setDocumentText}
          onAnalyze={(text, cat) => handleRunAnalysis(text || documentText, language, cat || docTypeCategory)}
          isAnalyzing={isAnalyzing}
          language={language}
          onShowToast={showToast}
          uploadedDoc={uploadedDoc}
          setUploadedDoc={setUploadedDoc}
          docTypeCategory={docTypeCategory}
          setDocTypeCategory={(cat) => {
            setDocTypeCategory(cat);
            const matchingDoc = SAMPLE_DOCUMENTS.find(d => d.docType === cat);
            if (matchingDoc) {
              setDocumentText(matchingDoc.text);
              handleRunAnalysis(matchingDoc.text, language, cat);
            }
          }}
        />

        {/* Loading State Animation while analyzing */}
        {isAnalyzing && <AnalysisLoading language={language} />}

        {/* Analysis Results Viewports: Appear automatically after analyzing ANY document */}
        {!isAnalyzing && analysisResult && (
          <div>
            {/* Viewport Navigation Tabs */}
            <div className="tabs-navigation">
              <button
                className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={16} />
                <span>{t.tabs?.dashboard || 'Executive Dashboard'}</span>
                <span className="brand-badge" style={{ fontSize: '0.62rem', background: 'rgba(99, 102, 241, 0.25)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>HUD</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                <FileText size={16} />
                <span>{t.tabs?.summary || 'Plain Summary'}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'clauses' ? 'active' : ''}`}
                onClick={() => setActiveTab('clauses')}
              >
                <AlertTriangle size={16} />
                <span>{t.tabs?.clauses || 'Risky Clauses'}</span>
                {analysisResult.risky_clauses?.length > 0 && (
                  <span className="tab-count-pill">{analysisResult.risky_clauses.length}</span>
                )}
              </button>

              <button
                className={`tab-btn ${activeTab === 'actionPlan' ? 'active' : ''}`}
                onClick={() => setActiveTab('actionPlan')}
              >
                <CheckSquare size={16} />
                <span>{t.tabs?.actionPlan || 'Action Plan'}</span>
                {analysisResult.action_plan?.length > 0 && (
                  <span className="tab-count-pill">{analysisResult.action_plan.length}</span>
                )}
              </button>

              <button
                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={16} />
                <span>{t.tabs?.chat || 'Ask Document (Q&A)'}</span>
                <span className="brand-badge" style={{ fontSize: '0.65rem' }}>Strict Citations</span>
              </button>
            </div>

            {/* Tab 0: Executive Command Dashboard (3D Tiles, Risk Dial, Clause Breakdown & Matrix) */}
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                analysisResult={analysisResult}
                language={language}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onLocateClause={handleLocateClause}
                documentTitle={documentTitle}
                onShowToast={showToast}
              />
            )}

            {/* Tab 1: Plain Summary (With Risk Gauge, Deadlines & PDF Export) */}
            {activeTab === 'summary' && (
              <SummaryView
                analysisResult={analysisResult}
                language={language}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                uploadedPhoto={uploadedDoc}
                documentTitle={documentTitle}
                onShowToast={showToast}
              />
            )}

            {/* Tab 2: Risky Clauses & Interactive Document Viewer */}
            {activeTab === 'clauses' && (
              <div className="split-workspace-grid">
                <DocumentViewer
                  documentText={documentText}
                  riskyClauses={analysisResult.risky_clauses || []}
                  activeClauseId={activeClauseId}
                  onSelectClause={(id) => setActiveClauseId(id)}
                  language={language}
                  onShowToast={showToast}
                  uploadedPhoto={uploadedDoc}
                />

                <RiskyClausesList
                  riskyClauses={analysisResult.risky_clauses || []}
                  activeClauseId={activeClauseId}
                  onSelectClause={(id) => setActiveClauseId(id)}
                  onLocateClause={handleLocateClause}
                  language={language}
                  onShowToast={showToast}
                />
              </div>
            )}

            {/* Tab 3: Action Plan & Negotiation Checklist */}
            {activeTab === 'actionPlan' && (
              <div className="split-workspace-grid">
                <DocumentViewer
                  documentText={documentText}
                  riskyClauses={analysisResult.risky_clauses || []}
                  activeClauseId={activeClauseId}
                  onSelectClause={(id) => setActiveClauseId(id)}
                  language={language}
                  onShowToast={showToast}
                  uploadedPhoto={uploadedDoc}
                />

                <ActionPlanView
                  actionPlan={analysisResult.action_plan || []}
                  onLocateClauseQuote={handleLocateQuote}
                  language={language}
                  onShowToast={showToast}
                />
              </div>
            )}

            {/* Tab 4: Strict Grounded Document Q&A Chat */}
            {activeTab === 'chat' && (
              <div className="split-workspace-grid">
                <DocumentViewer
                  documentText={documentText}
                  riskyClauses={analysisResult.risky_clauses || []}
                  activeClauseId={activeClauseId}
                  onSelectClause={(id) => setActiveClauseId(id)}
                  language={language}
                  onShowToast={showToast}
                  uploadedPhoto={uploadedDoc}
                />

                <AskDocumentChat
                  documentText={documentText}
                  language={language}
                  onLocateClauseQuote={handleLocateQuote}
                  onShowToast={showToast}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Simplified Disclaimer Footer */}
      <DisclaimerFooter language={language} />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} />
    </div>
  );
}
