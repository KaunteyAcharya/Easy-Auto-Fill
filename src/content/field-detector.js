var EasyAutoFill = EasyAutoFill || {};

EasyAutoFill.FieldDetector = {

  IGNORED_TYPES: new Set([
    'hidden', 'submit', 'button', 'reset', 'image', 'file', 'range', 'color'
  ]),

  detectFields() {
    const fields = [];
    const seen = new Set();

    const inputs = document.querySelectorAll('input, textarea, select, [contenteditable="true"]');

    for (const el of inputs) {
      if (el.tagName === 'INPUT' && this.IGNORED_TYPES.has(el.type)) continue;
      if (el.offsetParent === null && el.type !== 'hidden') continue;
      if (el.disabled || el.readOnly) continue;

      const uid = this.elementId(el);
      if (seen.has(uid)) continue;
      seen.add(uid);

      const info = this.getFieldInfo(el);
      if (info) fields.push(info);
    }

    return fields;
  },

  getFieldInfo(el) {
    const label = this.findLabel(el);
    const rect = el.getBoundingClientRect();

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
      index: Array.from(document.querySelectorAll('input, textarea, select')).indexOf(el)
    };
  },

  findLabel(el) {
    if (el.id) {
      const labelEl = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
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
    if (fieldInfo.id) {
      const el = document.getElementById(fieldInfo.id);
      if (el) return el;
    }

    if (fieldInfo.name) {
      const el = document.querySelector('[name="' + CSS.escape(fieldInfo.name) + '"]');
      if (el) return el;
    }

    if (fieldInfo.xpath) {
      const result = document.evaluate(
        fieldInfo.xpath, document, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null
      );
      if (result.singleNodeValue) return result.singleNodeValue;
    }

    return null;
  }
};
