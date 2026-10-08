import { jsPDF } from 'jspdf';

// Helper to sanitize non-Latin characters for standard PDF fonts
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/[“”"']/g, '"')
    .replace(/[—–]/g, '-')
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Transliterate or fallback common symbols safely
      if (char === '₹') return 'INR ';
      if (char === '€') return 'EUR ';
      if (char === '£') return 'GBP ';
      if (char === '•') return '*';
      if (char === '⏰') return '[DEADLINE] ';
      if (char === '⚠️') return '[WARNING] ';
      if (char === '✓' || char === '✅') return '[DONE] ';
      return '';
    });
}

export function exportAnalysisToPdf(analysisResult, documentTitle = 'Document Analysis') {
  if (!analysisResult) return;

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;

    // Header Banner
    doc.setFillColor(30, 41, 69);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('JARGON BREAKER', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Document Clarity, Risk Assessment & Action Plan', 14, 20);

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    doc.text(`Generated: ${dateStr}`, pageWidth - 50, 20);

    y = 38;

    // Document Overview & Risk Score
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Document Briefing: ${sanitizeText(documentTitle)}`, 14, y);
    y += 8;

    // Risk Score Gauge Box
    const score = analysisResult.risk_score_numeric || (analysisResult.overall_risk_score === 'High' ? 8 : analysisResult.overall_risk_score === 'Medium' ? 5 : 2);
    const isHigh = score >= 7;

    doc.setFillColor(isHigh ? 239 : 245, isHigh ? 68 : 158, isHigh ? 68 : 11);
    doc.roundedRect(14, y, 42, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`RISK SCORE: ${score}/10`, 17, y + 6.5);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const verdict = sanitizeText(analysisResult.risk_verdict || (isHigh ? 'High Risk: Action items strongly recommended.' : 'Moderate terms detected.'));
    const verdictLines = doc.splitTextToSize(verdict, pageWidth - 70);
    doc.text(verdictLines, 62, y + 6.5);

    y += 16;

    // 1. Plain-Language Summary
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. PLAIN-LANGUAGE SUMMARY', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const cleanSummary = sanitizeText(analysisResult.summary || 'Summary unavailable.');
    const summaryLines = doc.splitTextToSize(cleanSummary, pageWidth - 28);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 5 + 6;

    // Deadline Alert
    if (analysisResult.deadline_detected) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(14, y, pageWidth - 28, 11, 2, 2, 'F');
      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const cleanDeadline = sanitizeText(`DEADLINE DETECTED: ${analysisResult.deadline_detected}`);
      doc.text(cleanDeadline, 18, y + 7);
      y += 16;
    }

    // 2. Risky Clauses
    if (analysisResult.risky_clauses && analysisResult.risky_clauses.length > 0) {
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. CRITICAL RISKY CLAUSES IDENTIFIED', 14, y);
      y += 6;

      analysisResult.risky_clauses.slice(0, 4).forEach((clause, idx) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(clause.risk_level === 'high' ? 220 : 180, 38, 38);
        doc.text(`[${clause.risk_level?.toUpperCase()} RISK] Clause #${idx + 1}`, 14, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const cleanReason = sanitizeText(`Why it is risky: ${clause.reason}`);
        const reasonLines = doc.splitTextToSize(cleanReason, pageWidth - 28);
        doc.text(reasonLines, 14, y);
        y += reasonLines.length * 4 + 2;

        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        const cleanQuote = sanitizeText(`"${clause.quote.slice(0, 160)}..."`);
        const quoteLines = doc.splitTextToSize(cleanQuote, pageWidth - 28);
        doc.text(quoteLines, 14, y);
        y += quoteLines.length * 4 + 4;
      });
    }

    // 3. Action Checklist & Questions
    if (analysisResult.action_plan && analysisResult.action_plan.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('3. ACTION PLAN & READY-TO-ASK QUESTIONS', 14, y);
      y += 6;

      analysisResult.action_plan.slice(0, 4).forEach((item, idx) => {
        if (y > 255) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 69);
        const cleanTask = sanitizeText(`[ ] Step ${idx + 1}: ${item.task}`);
        doc.text(cleanTask, 14, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(79, 70, 229);
        const cleanAsk = sanitizeText(`Recommended Ask: "${item.ask}"`);
        const askLines = doc.splitTextToSize(cleanAsk, pageWidth - 28);
        doc.text(askLines, 18, y);
        y += askLines.length * 4 + 4;
      });
    }

    // Footer Disclaimer
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('Disclaimer: Simplified explanation for educational use; not formal legal or medical advice.', 14, 288);

    // Save and trigger automatic download in user's browser
    const cleanFileName = `jargon-breaker-report-${documentTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}.pdf`;
    doc.save(cleanFileName);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
}
