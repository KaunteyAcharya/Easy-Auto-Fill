var EasyAutoFill = EasyAutoFill || {};

EasyAutoFill.FieldDetector = {

  IGNORED_TYPES: new Set([
    'hidden', 'submit', 'button', 'reset', 'image', 'file', 'range', 'color'
  ]),

  detectFields() {
    const fields = [];
    const seen = new Set();

    this.searchDocument(document, fields, seen);

    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) this.searchDocument(iframeDoc, fields, seen);
      } catch (e) {
        // Cross-origin iframe — handled by all_frames in manifest
      }
    }

    return fields;
  },

  isVisible(el) {
    if (el.type === 'hidden') return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (el.offsetWidth === 0 && el.offsetHeight === 0) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
    }
    return true;
  },

  searchDocument(doc, fields, seen) {
    let inputs;
    try {
      inputs = doc.querySelectorAll('input, textarea, select, [contenteditable="true"]');
    } catch (e) {
      return;
    }

    for (const el of inputs) {
      if (el.tagName === 'INPUT' && this.IGNORED_TYPES.has(el.type)) continue;
      if (!this.isVisible(el)) continue;
      if (el.disabled || el.readOnly) continue;

      const uid = this.elementId(el);
      if (seen.has(uid)) continue;
      seen.add(uid);

      const info = this.getFieldInfo(el);
      if (info) fields.push(info);
    }
  },

  getFieldInfo(el) {
    const label = this.findLabel(el);
    const rect = el.getBoundingClientRect();
    const sectionInfo = this.findSectionContext(el);

    return {
      tagName: el.tagName,
      type: el.type || (el.tagName === 'TEXTAREA' ? 'textarea' : el.tagName === 'SELECT' ? 'select' : 'text'),
      id: el.id || '',
      name: el.name || '',
      label: label,
      placeholder: el.placeholder || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      required: el.required || el.getAttribute('aria-required') === 'true',
      currentValue: el.value || el.textContent || '',
      autocomplete: el.autocomplete || '',
      maxLength: el.maxLength > 0 ? el.maxLength : null,
      pattern: el.pattern || '',
      options: el.tagName === 'SELECT' ? this.getSelectOptions(el) : [],
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      xpath: this.getXPath(el),
      index: Array.from((el.ownerDocument || document).querySelectorAll('input, textarea, select')).indexOf(el),
      sectionType: sectionInfo.type,
      sectionIndex: sectionInfo.index
    };
  },

  // Detect repeating section containers (Work Experience 1, Work Experience 2, Education 1, etc.)
  findSectionContext(el) {
    const SECTION_PATTERNS = [
      { regex: /work\s*experience\s*(\d+)?/i, type: 'work' },
      { regex: /employment\s*(\d+)?/i, type: 'work' },
      { regex: /position\s*(\d+)?/i, type: 'work' },
      { regex: /job\s*(\d+)?/i, type: 'work' },
      { regex: /education\s*(\d+)?/i, type: 'education' },
      { regex: /school\s*(\d+)?/i, type: 'education' },
      { regex: /degree\s*(\d+)?/i, type: 'education' },
    ];

    let current = el.parentElement;
    let depth = 0;

    while (current && depth < 15) {
      // Check for heading elements or legend within this container
      const headings = current.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > legend, :scope > [class*="title"], :scope > [class*="header"], :scope > [class*="heading"]');

      for (const heading of headings) {
        const text = heading.textContent.trim();
        for (const pattern of SECTION_PATTERNS) {
          const match = text.match(pattern.regex);
          if (match) {
            // Extract index: "Work Experience 2" → 1 (0-based), no number → 0
            const num = match[1] ? parseInt(match[1], 10) - 1 : 0;
            return { type: pattern.type, index: Math.max(0, num) };
          }
        }
      }

      // Also check data attributes and class names on the container itself
      const containerText = (current.getAttribute('data-automation-id') || '') +
                           ' ' + (current.getAttribute('aria-label') || '') +
                           ' ' + (current.className || '');
      for (const pattern of SECTION_PATTERNS) {
        const match = containerText.match(pattern.regex);
        if (match) {
          const num = match[1] ? parseInt(match[1], 10) - 1 : 0;
          return { type: pattern.type, index: Math.max(0, num) };
        }
      }

      current = current.parentElement;
      depth++;
    }

    return { type: null, index: 0 };
  },

  findLabel(el) {
    const doc = el.ownerDocument || document;
    if (el.id) {
      const labelEl = doc.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (labelEl) return labelEl.textContent.trim();
    }

    const parentLabel = el.closest('label');
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true);
      const inputs = clone.querySelectorAll('input, textarea, select');
      inputs.forEach(i => i.remove());
      const text = clone.textContent.trim();
      if (text) return text;
    }

    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(/\s+/);
      const texts = ids.map(id => {
        const ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean);
      if (texts.length) return texts.join(' ');
    }

    if (el.getAttribute('aria-label')) {
      return el.getAttribute('aria-label');
    }

    const prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'P')) {
      const text = prev.textContent.trim();
      if (text.length < 100) return text;
    }

    const parent = el.parentElement;
    if (parent) {
      const spans = parent.querySelectorAll(':scope > label, :scope > span, :scope > div > label');
      for (const span of spans) {
        const text = span.textContent.trim();
        if (text && text.length < 80 && !span.querySelector('input, textarea, select')) {
          return text;
        }
      }
    }

    const wrapper = el.closest('[class*="field"], [class*="form-group"], [class*="input"], [class*="control"]');
    if (wrapper) {
      const lbl = wrapper.querySelector('label, .label, [class*="label"]');
      if (lbl) {
        const text = lbl.textContent.trim();
        if (text.length < 100) return text;
      }
    }

    if (el.placeholder) return el.placeholder;
    if (el.name) return el.name.replace(/[_-]/g, ' ');
    if (el.id) return el.id.replace(/[_-]/g, ' ');

    return '';
  },

  getSelectOptions(el) {
    return Array.from(el.options).map(opt => ({
      value: opt.value,
      text: opt.textContent.trim(),
      selected: opt.selected
    }));
  },

  getXPath(el) {
    const parts = [];
    let current = el;
    while (current && current.nodeType === 1) {
      let index = 1;
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) index++;
        sibling = sibling.previousElementSibling;
      }
      parts.unshift(current.tagName.toLowerCase() + '[' + index + ']');
      current = current.parentElement;
    }
    return '/' + parts.join('/');
  },

  elementId(el) {
    if (el.id) return 'id:' + el.id;
    if (el.name) return 'name:' + el.name;
    return 'xpath:' + this.getXPath(el);
  },

  getElementByFieldInfo(fieldInfo) {
    const docs = [document];
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) docs.push(iframeDoc);
      } catch (e) {}
    }

    for (const doc of docs) {
      if (fieldInfo.id) {
        const el = doc.getElementById(fieldInfo.id);
        if (el) return el;
      }

      if (fieldInfo.name) {
        const el = doc.querySelector('[name="' + CSS.escape(fieldInfo.name) + '"]');
        if (el) return el;
      }

      if (fieldInfo.xpath) {
        try {
          const result = doc.evaluate(
            fieldInfo.xpath, doc, null,
            XPathResult.FIRST_ORDERED_NODE_TYPE, null
          );
          if (result.singleNodeValue) return result.singleNodeValue;
        } catch (e) {}
      }
    }

    return null;
  }
};
