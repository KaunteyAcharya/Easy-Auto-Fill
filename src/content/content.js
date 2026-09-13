var EasyAutoFill = EasyAutoFill || {};

(function() {
  'use strict';

  const FieldDetector = EasyAutoFill.FieldDetector;
  const FieldMatcher = EasyAutoFill.FieldMatcher;

  function setNativeValue(el, value) {
    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, value);
    } else {
      el.value = value;
    }
  }

  function dispatchEvents(el) {
    el.dispatchEvent(new Event('focus', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function fillField(el, value, fieldInfo) {
    if (!el || value === undefined || value === null) return false;

    const tag = el.tagName;
    const type = (el.type || '').toLowerCase();

    if (tag === 'SELECT') {
      return fillSelect(el, value);
    }

    if (type === 'checkbox' || type === 'radio') {
      return fillCheckboxRadio(el, value);
    }

    if (el.getAttribute('contenteditable') === 'true') {
      el.focus();
      el.textContent = String(value);
      dispatchEvents(el);
      return true;
    }

    if (type === 'date') {
      return fillDate(el, value);
    }

    el.focus();
    setNativeValue(el, String(value));
    dispatchEvents(el);
    return true;
  }

  function fillSelect(el, value) {
    const valLower = String(value).toLowerCase().trim();
    let matched = false;
    let bestScore = 0;
    let bestOption = null;

    for (const opt of el.options) {
      if (!opt.value && !opt.textContent.trim()) continue; // Skip empty placeholder options

      const optText = opt.textContent.trim().toLowerCase();
      const optVal = opt.value.toLowerCase();

      // Exact match
      if (optVal === valLower || optText === valLower) {
        bestOption = opt;
        bestScore = 1.0;
        break;
      }

      // Substring match
      if (optText.includes(valLower) || valLower.includes(optText)) {
        const score = 0.9;
        if (score > bestScore) { bestScore = score; bestOption = opt; }
        continue;
      }

      // Fuzzy match using Levenshtein for dropdown options
      if (valLower.length > 2 && optText.length > 2) {
        const dist = levenshteinDistance(valLower, optText);
        const maxLen = Math.max(valLower.length, optText.length);
        const similarity = 1 - dist / maxLen;
        if (similarity > 0.7 && similarity > bestScore) {
          bestScore = similarity;
          bestOption = opt;
        }
      }

      // Word-level matching (e.g. "India" matches "India (+91)")
      const valWords = valLower.split(/\s+/);
      const optWords = optText.split(/\s+/);
      const commonWords = valWords.filter(w => w.length > 2 && optWords.some(ow => ow.includes(w) || w.includes(ow)));
      if (commonWords.length > 0) {
        const score = 0.6 + (commonWords.length / Math.max(valWords.length, optWords.length)) * 0.3;
        if (score > bestScore) { bestScore = score; bestOption = opt; }
      }
    }

    if (bestOption && bestScore >= 0.6) {
      el.value = bestOption.value;
      matched = true;
    }

    if (matched) {
      dispatchEvents(el);
    }
    return matched;
  }

  function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function fillCheckboxRadio(el, value) {
    const truthy = ['true', 'yes', '1', 'on'];
    const shouldCheck = truthy.includes(String(value).toLowerCase()) || value === true;
    if (el.checked !== shouldCheck) {
      el.checked = shouldCheck;
      dispatchEvents(el);
    }
    return true;
  }

  function fillDate(el, value) {
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/,
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      /^(\d{2})-(\d{2})-(\d{4})$/,
    ];

    let dateStr = String(value);
    for (const fmt of formats) {
      const m = dateStr.match(fmt);
      if (m) {
        if (m[3] && m[3].length === 4) {
          dateStr = m[3] + '-' + m[1] + '-' + m[2];
        }
        break;
      }
    }

    el.focus();
    setNativeValue(el, dateStr);
    dispatchEvents(el);
    return true;
  }

  function highlightField(el, status) {
    el.classList.remove('eaf-field-matched', 'eaf-field-unmatched', 'eaf-field-filled', 'eaf-field-error');
    if (status === 'filled') {
      el.classList.add('eaf-field-filled');
    } else if (status === 'error') {
      el.classList.add('eaf-field-error');
    } else if (status === 'matched') {
      el.classList.add('eaf-field-matched');
    } else if (status === 'unmatched') {
      el.classList.add('eaf-field-unmatched');
    }
  }

  function clearHighlights() {
    document.querySelectorAll('.eaf-field-matched, .eaf-field-unmatched, .eaf-field-filled, .eaf-field-error, .eaf-field-highlight')
      .forEach(el => {
        el.classList.remove('eaf-field-matched', 'eaf-field-unmatched', 'eaf-field-filled', 'eaf-field-error', 'eaf-field-highlight');
      });
    document.querySelectorAll('.eaf-badge').forEach(b => b.remove());
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {

      case 'detectFields': {
        const fields = FieldDetector.detectFields();
        sendResponse({ fields });
        break;
      }

      case 'previewFill': {
        clearHighlights();
        const fields = FieldDetector.detectFields();
        const matches = FieldMatcher.matchAllFields(fields, message.profileData, message.sections);

        for (const result of matches) {
          const el = FieldDetector.getElementByFieldInfo(result.field);
          if (!el) continue;
          highlightField(el, result.match ? 'matched' : 'unmatched');
        }

        sendResponse({ matches: matches.map(r => ({
          field: {
            label: r.field.label,
            name: r.field.name,
            id: r.field.id,
            type: r.field.type,
            placeholder: r.field.placeholder,
            xpath: r.field.xpath,
            sectionType: r.field.sectionType,
            sectionIndex: r.field.sectionIndex
          },
          match: r.match,
          status: r.status
        }))});
        break;
      }

      case 'fillFields': {
        clearHighlights();
        const fields = FieldDetector.detectFields();
        const matches = FieldMatcher.matchAllFields(fields, message.profileData, message.sections);
        const overrides = message.overrides || {};
        const skipFields = new Set(message.profileData._skipFields || []);

        let filled = 0;
        let failed = 0;
        const results = [];

        for (const result of matches) {
          const el = FieldDetector.getElementByFieldInfo(result.field);
          if (!el) continue;

          const fieldId = result.field.id || result.field.name || result.field.xpath;

          // Skip fields marked by sensitive field filter
          if (skipFields.has(fieldId)) {
            highlightField(el, 'unmatched');
            results.push({ field: result.field.label || result.field.name, status: 'skipped_sensitive' });
            continue;
          }

          const override = overrides[fieldId];

          let value = override !== undefined
            ? message.profileData[override]
            : (result.match ? result.match.value : null);

          if (value === null || value === undefined) {
            highlightField(el, 'unmatched');
            results.push({ field: result.field.label || result.field.name, status: 'skipped' });
            continue;
          }

          const success = fillField(el, value, result.field);
          if (success) {
            filled++;
            highlightField(el, 'filled');
            results.push({ field: result.field.label || result.field.name, status: 'filled', value: String(value).substring(0, 50) });
          } else {
            failed++;
            highlightField(el, 'error');
            results.push({ field: result.field.label || result.field.name, status: 'failed' });
          }
        }

        sendResponse({ filled, failed, total: matches.length, results });
        break;
      }

      case 'clearHighlights': {
        clearHighlights();
        sendResponse({ success: true });
        break;
      }

      case 'fillSingleField': {
        const el = FieldDetector.getElementByFieldInfo(message.fieldInfo);
        if (el) {
          const success = fillField(el, message.value, message.fieldInfo);
          highlightField(el, success ? 'filled' : 'error');
          sendResponse({ success });
        } else {
          sendResponse({ success: false, error: 'Element not found' });
        }
        break;
      }

      default:
        sendResponse({ error: 'Unknown action: ' + message.action });
    }

    return true;
  });

})();
