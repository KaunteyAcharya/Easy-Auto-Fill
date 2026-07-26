var EasyAutoFill = EasyAutoFill || {};

EasyAutoFill.FileParser = {

  async parseFile(file) {
    const text = await file.text();
    const ext = file.name.split('.').pop().toLowerCase();

    let result;
    switch (ext) {
      case 'json':
        result = this.parseJSON(text);
        break;
      case 'md':
      case 'markdown':
        result = this.parseMarkdown(text);
        break;
      case 'txt':
        result = this.parseTXT(text);
        break;
      case 'csv':
        result = this.parseCSV(text);
        break;
      default:
        throw new Error('Unsupported file format: .' + ext + '. Use .json, .md, .txt, or .csv');
    }

    result.sourceFile = file.name;
    result.parsedAt = Date.now();
    return result;
  },

  parseJSON(text) {
    const obj = JSON.parse(text);
    const data = this.flattenObject(obj);
    return { data, sections: obj, raw: text };
  },

  parseMarkdown(text) {
    const data = {};
    const sections = {};
    const lines = text.split('\n');

    let currentH2 = null;
    let currentH3 = null;
    let currentH3Obj = null;
    let freeTextBuffer = [];

    const flushFreeText = () => {
      const content = freeTextBuffer.join('\n').trim();
      if (!content) return;

      if (currentH3 && currentH3Obj) {
        currentH3Obj.description = (currentH3Obj.description || '') + content;
      } else if (currentH2) {
        const key = this.normalizeKey(currentH2);
        data[key] = data[key] ? data[key] + '\n' + content : content;
      }
      freeTextBuffer = [];
    };

    const saveH3 = () => {
      if (!currentH3 || !currentH3Obj || !currentH2) return;
      if (!sections[currentH2]) sections[currentH2] = [];
      if (Array.isArray(sections[currentH2])) {
        sections[currentH2].push(currentH3Obj);
      }
      currentH3Obj = null;
      currentH3 = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      const h1 = line.match(/^#\s+(.+)/);
      if (h1) {
        flushFreeText();
        data._profileName = h1[1].trim();
        continue;
      }

      const h2 = line.match(/^##\s+(.+)/);
      if (h2) {
        flushFreeText();
        saveH3();
        currentH2 = h2[1].trim();
        currentH3 = null;
        if (!sections[currentH2]) sections[currentH2] = {};
        continue;
      }

      const h3 = line.match(/^###\s+(.+)/);
      if (h3) {
        flushFreeText();
        saveH3();
        currentH3 = h3[1].trim();
        currentH3Obj = { title: currentH3 };
        if (!Array.isArray(sections[currentH2])) {
          sections[currentH2] = [];
        }
        continue;
      }

      const boldKV = line.match(/^\*\*(.+?):\*\*\s*(.+)/);
      if (boldKV) {
        const key = boldKV[1].trim();
        const value = boldKV[2].trim();
        const normKey = this.normalizeKey(key);
        if (currentH3Obj) {
          currentH3Obj[normKey] = value;
        }
        // Only set in flat data if not already set (keep first/most-recent value)
        if (!data[normKey]) data[normKey] = value;
        if (currentH2 && !Array.isArray(sections[currentH2])) {
          sections[currentH2][key] = value;
        }
        continue;
      }

      const listKV = line.match(/^[-*]\s+(.+?):\s+(.+)/);
      if (listKV) {
        const key = listKV[1].trim();
        const value = listKV[2].trim();
        data[this.normalizeKey(key)] = value;
        if (currentH2 && !Array.isArray(sections[currentH2])) {
          if (!sections[currentH2]) sections[currentH2] = {};
          sections[currentH2][key] = value;
        }
        this.extractSpecialFields(key, value, data);
        continue;
      }

      const pipeList = line.match(/^[-*]\s+(.+?\|.+)/);
      if (pipeList) {
        const parts = pipeList[1].split('|').map(s => s.trim());
        if (currentH2) {
          const sectionKey = this.normalizeKey(currentH2);
          const existing = data[sectionKey];
          data[sectionKey] = existing ? existing + '\n' + parts.join(' | ') : parts.join(' | ');

          if (parts.length >= 2) {
            if (!data.degree) data.degree = parts[0];
            if (!data.university) data.university = parts[1];
          }
        }
        continue;
      }

      if (line.trim() && !line.match(/^---/)) {
        freeTextBuffer.push(line.trim());
      } else if (line.trim() === '' && freeTextBuffer.length > 0) {
        flushFreeText();
      }
    }

    flushFreeText();
    saveH3();

    this.buildCompositeFields(data, sections);

    return { data, sections, raw: text };
  },

  parseTXT(text) {
    const data = {};
    const sections = {};
    let currentSection = 'General';

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;

      const sectionMatch = line.match(/^\[(.+)]$/) || line.match(/^={3,}\s*(.+?)\s*={3,}$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1].trim();
        continue;
      }

      const kvColon = line.match(/^(.+?):\s+(.+)/);
      const kvEquals = line.match(/^(.+?)\s*=\s*(.+)/);
      const match = kvColon || kvEquals;

      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        data[this.normalizeKey(key)] = value;
        if (!sections[currentSection]) sections[currentSection] = {};
        sections[currentSection][key] = value;
      }
    }

    return { data, sections, raw: text };
  },

  parseCSV(text) {
    const rows = this.parseCSVRows(text);
    if (rows.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = rows[0];
    const data = {};
    const sections = { 'CSV Data': {} };

    const values = rows[1];
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i].trim();
      const value = (values[i] || '').trim();
      if (key && value) {
        data[this.normalizeKey(key)] = value;
        sections['CSV Data'][key] = value;
      }
    }

    return { data, sections, raw: text };
  },

  parseCSVRows(text) {
    const rows = [];
    let current = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          field += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          current.push(field);
          field = '';
        } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
          current.push(field);
          field = '';
          if (current.some(c => c.trim())) rows.push(current);
          current = [];
          if (ch === '\r') i++;
        } else {
          field += ch;
        }
      }
    }

    current.push(field);
    if (current.some(c => c.trim())) rows.push(current);

    return rows;
  },

  normalizeKey(key) {
    return key
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '');
  },

  flattenObject(obj, prefix) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? prefix + '_' + key : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        result[this.normalizeKey(newKey)] = value.map(v =>
          typeof v === 'object' ? JSON.stringify(v) : String(v)
        ).join(', ');
      } else {
        result[this.normalizeKey(newKey)] = String(value);
      }
    }
    return result;
  },

  extractSpecialFields(key, value, data) {
    const lower = key.toLowerCase();
    if (lower.includes('linkedin') && value.includes('linkedin.com')) {
      data.linkedin = value;
    } else if (lower.includes('github') && value.includes('github.com')) {
      data.github = value;
    } else if (lower.includes('portfolio') || lower.includes('website')) {
      data.website = value;
    }
  },

  buildCompositeFields(data, sections) {
    if (sections['Work Experience'] && Array.isArray(sections['Work Experience'])) {
      const entries = sections['Work Experience'];
      const workText = entries.map(e => {
        let s = e.title || '';
        if (e.company) s += ' at ' + e.company;
        if (e.duration) s += ' (' + e.duration + ')';
        if (e.description) s += '\n' + e.description;
        return s;
      }).join('\n\n');
      if (!data.work_experience) data.work_experience = workText;

      const latest = entries[0];
      if (latest) {
        if (!data.current_title && latest.title) data.current_title = latest.title;
        if (!data.current_company && latest.company) data.current_company = latest.company;
      }
    }

    if (sections['Education'] && typeof sections['Education'] === 'object') {
      const eduData = sections['Education'];
      if (!Array.isArray(eduData)) {
        const values = Object.values(eduData);
        if (values.length && !data.education) {
          data.education = values.join('\n');
        }
      }
    }

    if (data.name && !data.first_name) {
      const parts = data.name.split(/\s+/);
      if (parts.length >= 2) {
        data.first_name = parts[0];
        data.last_name = parts.slice(1).join(' ');
      }
    }
  }
};
