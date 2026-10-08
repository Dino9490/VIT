/**
 * Text Highlighter Utility
 * Accurately locates clause quotes in raw document text, handles normalization,
 * prevents overlaps, skips non-matching quotes safely, and splits text into renderable chunks.
 */

// Normalize string for fuzzy substring search
function cleanText(str) {
  return (str || '')
    .replace(/\r\n/g, '\n')
    .replace(/[“”"']/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds exact or normalized character indices of a search quote within full text.
 */
export function findQuoteRange(fullText, quote) {
  if (!fullText || !quote) return null;

  const rawQuote = quote.trim();
  if (!rawQuote) return null;

  // 1. Direct exact match
  const exactIndex = fullText.indexOf(rawQuote);
  if (exactIndex !== -1) {
    return {
      startIndex: exactIndex,
      endIndex: exactIndex + rawQuote.length,
      matchedText: fullText.substring(exactIndex, exactIndex + rawQuote.length)
    };
  }

  // 2. Case-insensitive exact match
  const lowerFull = fullText.toLowerCase();
  const lowerQuote = rawQuote.toLowerCase();
  const lowerIndex = lowerFull.indexOf(lowerQuote);
  if (lowerIndex !== -1) {
    return {
      startIndex: lowerIndex,
      endIndex: lowerIndex + rawQuote.length,
      matchedText: fullText.substring(lowerIndex, lowerIndex + rawQuote.length)
    };
  }

  // 3. Normalized whitespace & punctuation matching
  const cleanedFull = cleanText(fullText);
  const cleanedQuote = cleanText(rawQuote);
  const normIndex = cleanedFull.toLowerCase().indexOf(cleanedQuote.toLowerCase());

  if (normIndex !== -1 && cleanedQuote.length > 8) {
    // Re-map back to original fullText using token anchor
    const firstWord = cleanedQuote.split(' ').slice(0, 4).join(' ');
    const firstWordIdx = lowerFull.indexOf(firstWord.toLowerCase());
    
    if (firstWordIdx !== -1) {
      const lastWord = cleanedQuote.split(' ').slice(-4).join(' ');
      const lastWordIdx = lowerFull.indexOf(lastWord.toLowerCase(), firstWordIdx);
      
      if (lastWordIdx !== -1) {
        const endIndex = Math.min(fullText.length, lastWordIdx + lastWord.length);
        return {
          startIndex: firstWordIdx,
          endIndex: endIndex,
          matchedText: fullText.substring(firstWordIdx, endIndex)
        };
      }
    }
  }

  // 4. If quote is not found in the text, skip it (as per Stage 2 spec)
  return null;
}

/**
 * Builds non-overlapping highlighted segments from document text and list of risky clauses.
 */
export function buildHighlightedSegments(documentText, riskyClauses = [], activeHighlightId = null) {
  if (!documentText) return [];
  if (!Array.isArray(riskyClauses) || riskyClauses.length === 0) {
    return [{ type: 'text', content: documentText, key: 'text-0' }];
  }

  // Collect matching intervals
  const intervals = [];

  riskyClauses.forEach((clause, idx) => {
    if (!clause || !clause.quote) return;
    
    const range = findQuoteRange(documentText, clause.quote);
    if (!range) {
      // Stage 2 requirement: If a quote is not found in the text, skip it.
      return;
    }

    intervals.push({
      startIndex: range.startIndex,
      endIndex: range.endIndex,
      riskLevel: clause.risk_level || 'medium',
      reason: clause.reason || '',
      quote: clause.quote,
      clauseId: clause.id || `clause-${idx}`,
      clauseIndex: idx,
      isActive: activeHighlightId === (clause.id || `clause-${idx}`)
    });
  });

  if (intervals.length === 0) {
    return [{ type: 'text', content: documentText, key: 'text-0' }];
  }

  // Sort intervals by start index; if overlapping, keep the longest or higher risk
  intervals.sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex);

  // Filter overlapping intervals
  const nonOverlapping = [];
  let lastEnd = -1;

  for (const item of intervals) {
    if (item.startIndex >= lastEnd) {
      nonOverlapping.push(item);
      lastEnd = item.endIndex;
    }
  }

  // Construct segments
  const segments = [];
  let cursor = 0;

  nonOverlapping.forEach((interval, i) => {
    // Non-highlighted text before interval
    if (interval.startIndex > cursor) {
      segments.push({
        type: 'text',
        content: documentText.substring(cursor, interval.startIndex),
        key: `text-${cursor}`
      });
    }

    // Highlighted segment
    segments.push({
      type: 'highlight',
      content: documentText.substring(interval.startIndex, interval.endIndex),
      riskLevel: interval.riskLevel.toLowerCase(),
      reason: interval.reason,
      quote: interval.quote,
      clauseId: interval.clauseId,
      clauseIndex: interval.clauseIndex,
      isActive: interval.isActive,
      key: `hl-${interval.clauseId}-${interval.startIndex}`
    });

    cursor = interval.endIndex;
  });

  // Remaining tail text
  if (cursor < documentText.length) {
    segments.push({
      type: 'text',
      content: documentText.substring(cursor),
      key: `text-${cursor}`
    });
  }

  return segments;
}

/**
 * Smoothly scrolls an element into view and applies a temporary pulse animation
 */
export function scrollAndFlashElement(elementId) {
  if (!elementId) return false;
  
  const target = document.getElementById(elementId);
  if (!target) {
    // Try by querySelector with data attribute
    const fallback = document.querySelector(`[data-clause-id="${elementId}"]`);
    if (fallback) {
      fallback.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fallback.classList.remove('pulse-flash');
      void fallback.offsetWidth; // trigger reflow
      fallback.classList.add('pulse-flash');
      return true;
    }
    return false;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.remove('pulse-flash');
  void target.offsetWidth; // trigger reflow
  target.classList.add('pulse-flash');
  return true;
}
