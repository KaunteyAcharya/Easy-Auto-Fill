var EasyAutoFill = EasyAutoFill || {};

EasyAutoFill.FieldMatcher = {

  AUTOCOMPLETE_MAP: {
    'name':                 'name',
    'honorific-prefix':     'prefix',
    'given-name':           'first_name',
    'additional-name':      'middle_name',
    'family-name':          'last_name',
    'honorific-suffix':     'suffix',
    'nickname':             'nickname',
    'email':                'email',
    'username':             'email',
    'tel':                  'phone',
    'tel-national':         'phone_number',
    'tel-local':            'phone_number',
    'tel-country-code':     'phone_country_code',
    'tel-extension':        'phone_extension',
    'organization':         'company',
    'organization-title':   'current_title',
    'street-address':       'address',
    'address-line1':        'address',
    'address-line2':        'address_line_2',
    'address-level2':       'city',
    'address-level1':       'state',
    'postal-code':          'zip',
    'country':              'country',
    'country-name':         'country',
    'bday':                 'date_of_birth',
    'sex':                  'gender',
    'url':                  'website',
    'language':             'languages',
  },

  SEMANTIC_MAP: {
    name:           ['name', 'full name', 'your name', 'applicant name', 'candidate name', 'legal name', 'complete name', 'display name'],
    first_name:     ['first name', 'given name', 'given names', 'forename', 'christian name', 'first', 'fname', 'local given name', 'local given names'],
    middle_name:    ['middle name', 'middle initial', 'middle', 'second name'],
    last_name:      ['last name', 'family name', 'surname', 'last', 'lname', 'local family name'],
    prefix:         ['prefix', 'salutation', 'mr mrs ms dr', 'honorific'],
    nickname:       ['nickname', 'preferred name', 'known as', 'goes by', 'alias'],
    gender:         ['gender', 'sex', 'male female', 'identity'],
    date_of_birth:  ['date of birth', 'dob', 'birthday', 'birth date', 'born on'],
    nationality:    ['nationality', 'citizenship', 'national origin'],

    email:          ['email', 'e mail', 'email address', 'mail', 'your email', 'contact email', 'primary email', 'work email', 'personal email'],
    phone:          ['phone', 'telephone', 'tel', 'mobile', 'cell', 'contact number', 'phone number', 'mobile number', 'cellular', 'mobile phone', 'cell phone', 'primary phone', 'home phone', 'work phone', 'daytime phone'],
    phone_number:   ['phone number', 'mobile number', 'telephone number', 'contact number', 'cell number'],
    phone_country_code: ['country phone code', 'country code', 'phone code', 'dialing code', 'isd code', 'calling code'],
    phone_extension:['phone extension', 'ext', 'extension', 'telephone extension'],

    address:        ['address', 'street', 'street address', 'address line 1', 'address line1', 'mailing address', 'residential address', 'home address', 'current address', 'permanent address'],
    address_line_2: ['address line 2', 'address line2', 'apt', 'apartment', 'suite', 'unit', 'floor', 'building'],
    city:           ['city', 'town', 'municipality', 'locality', 'village', 'district', 'metro'],
    state:          ['state', 'province', 'region', 'county', 'territory', 'prefecture'],
    zip:            ['zip', 'zipcode', 'zip code', 'postal code', 'postcode', 'pin code', 'pincode', 'postal'],
    country:        ['country', 'nation', 'country region', 'location country'],
    location:       ['location', 'current location', 'city state', 'where are you based', 'based in'],

    company:        ['company', 'employer', 'organization', 'organisation', 'current company', 'company name', 'current employer', 'firm', 'workplace', 'employer name', 'most recent employer'],
    current_title:  ['job title', 'position', 'role', 'designation', 'current title', 'current role', 'current position', 'position title', 'professional title'],
    current_role:   ['current role', 'present role', 'latest role', 'most recent role'],
    work_experience:['experience', 'work experience', 'professional experience', 'employment history', 'work history', 'career history', 'relevant experience'],
    experience_years:['years of experience', 'experience years', 'total experience', 'how many years', 'yoe'],
    professional_summary: ['summary', 'professional summary', 'about', 'about me', 'bio', 'biography', 'objective', 'profile summary', 'career objective', 'personal statement', 'career summary', 'tell us about yourself', 'describe yourself', 'professional profile', 'executive summary', 'overview'],
    cover_letter:   ['cover letter', 'motivation', 'motivation letter', 'why this role', 'why are you interested', 'message to hiring', 'message to the hiring team', 'why do you want', 'additional information', 'letter of interest', 'personal message', 'note to recruiter'],
    role_description: ['role description', 'job description', 'responsibilities', 'duties', 'description', 'what did you do', 'describe your role', 'key responsibilities', 'job responsibilities'],
    start_date:     ['from', 'start date', 'from date', 'date from', 'started', 'joining date', 'start month'],
    end_date:       ['to', 'end date', 'to date', 'date to', 'ended', 'leaving date', 'end month', 'last day'],
    notice_period:  ['notice period', 'how soon can you start', 'earliest start date', 'when can you start', 'when can you join'],
    availability:   ['availability', 'available from', 'available date', 'earliest start', 'when available', 'date available'],

    education:      ['education', 'qualification', 'academic background', 'educational background', 'educational history'],
    degree:         ['degree', 'highest degree', 'qualification name', 'level of education', 'education level', 'field of study', 'course', 'program', 'major'],
    university:     ['university', 'college', 'school', 'institution', 'alma mater', 'school name', 'college name', 'university name'],
    graduation_year:['graduation year', 'grad year', 'year of graduation', 'graduation date', 'completion year'],
    gpa:            ['gpa', 'grade', 'cgpa', 'marks', 'score', 'percentage', 'grade point'],

    linkedin:       ['linkedin', 'linkedin url', 'linkedin profile', 'linked in'],
    github:         ['github', 'github url', 'github profile', 'git hub'],
    website:        ['website', 'portfolio', 'personal website', 'homepage', 'portfolio url', 'blog', 'personal site', 'online portfolio'],
    medium:         ['medium', 'medium profile', 'blog url', 'writing portfolio'],
    twitter:        ['twitter', 'x profile', 'x handle', 'x fka twitter', 'x formerly twitter', 'x twitter'],
    facebook:       ['facebook', 'facebook url', 'facebook profile', 'fb'],
    instagram:      ['instagram', 'instagram url', 'ig'],

    skills:         ['skills', 'technical skills', 'key skills', 'competencies', 'expertise', 'technologies', 'tech stack', 'core skills', 'proficiencies'],
    technical_skills:['technical skills', 'tech skills', 'it skills', 'programming skills', 'hard skills'],
    programming_languages: ['programming languages', 'coding languages', 'tech languages'],
    tools:          ['tools', 'software', 'applications', 'platforms', 'frameworks'],
    certifications: ['certifications', 'certificates', 'licenses', 'accreditations'],

    salary:         ['salary', 'expected salary', 'salary expectation', 'compensation', 'desired salary', 'expected ctc', 'current ctc', 'pay rate', 'hourly rate'],
    visa:           ['visa', 'work authorization', 'visa status', 'sponsorship', 'right to work', 'work permit', 'authorized to work', 'require sponsorship'],

    references:     ['references', 'referees', 'reference contact', 'professional references'],
    languages:      ['languages', 'language skills', 'spoken languages', 'language proficiency', 'languages spoken'],
    publications:   ['publications', 'research papers', 'papers', 'journal articles', 'published work'],
    awards:         ['awards', 'honors', 'achievements', 'recognitions', 'accomplishments', 'scholarships'],
    hobbies:        ['hobbies', 'interests', 'extracurricular', 'activities', 'pastimes', 'personal interests'],
  },

  TYPE_MAP: {
    'email': 'email',
    'tel':   'phone',
    'url':   'website',
  },

  WORD_SYNONYMS: {
    'given':     ['first', 'fore', 'christian'],
    'family':    ['last', 'sur'],
    'local':     [],
    'phone':     ['tel', 'telephone', 'mobile', 'cell', 'cellular', 'contact'],
    'mail':      ['email'],
    'company':   ['employer', 'organization', 'organisation', 'firm', 'workplace'],
    'school':    ['university', 'college', 'institution'],
    'degree':    ['major', 'qualification', 'course', 'program'],
    'address':   ['street', 'residence', 'mailing'],
    'zip':       ['postal', 'postcode', 'pincode'],
    'city':      ['town', 'municipality', 'locality'],
    'summary':   ['objective', 'bio', 'about', 'overview', 'introduction', 'profile'],
    'cover':     ['motivation', 'interest'],
    'job':       ['position', 'role', 'designation'],
    'website':   ['portfolio', 'homepage', 'blog', 'site'],
    'linkedin':  ['linked in'],
    'twitter':   ['x'],
    'experience':['history', 'background', 'employment'],
    'skills':    ['competencies', 'expertise', 'proficiencies', 'capabilities', 'strengths'],
    'salary':    ['compensation', 'pay', 'ctc', 'remuneration', 'wage'],
    'visa':      ['authorization', 'sponsorship', 'permit', 'eligibility'],
    'award':     ['honor', 'achievement', 'scholarship', 'prize', 'recognition'],
    'hobby':     ['interest', 'pastime', 'activity'],
    'publication':['paper', 'article', 'journal', 'research'],
    'language':  ['linguistic', 'tongue'],
  },

  // Fields that should ONLY contain URL values
  URL_FIELDS: new Set(['linkedin', 'github', 'website', 'medium', 'twitter', 'facebook', 'instagram', 'portfolio']),

  // Fields that should NEVER contain URL values
  NON_URL_FIELDS: new Set(['name', 'first_name', 'last_name', 'middle_name', 'address', 'address_line_2', 'city', 'state', 'zip', 'country', 'phone', 'phone_number', 'phone_country_code', 'email', 'company', 'current_title', 'degree', 'university', 'salary', 'gpa']),

  // Month name → number mapping for date parsing
  MONTH_MAP: {
    'jan': '01', 'january': '01', 'feb': '02', 'february': '02',
    'mar': '03', 'march': '03', 'apr': '04', 'april': '04',
    'may': '05', 'jun': '06', 'june': '06', 'jul': '07', 'july': '07',
    'aug': '08', 'august': '08', 'sep': '09', 'sept': '09', 'september': '09',
    'oct': '10', 'october': '10', 'nov': '11', 'november': '11',
    'dec': '12', 'december': '12',
  },

  // Parse a date string like "Dec 2025" or "August 2024" into MM/YYYY
  parseDateToMMYYYY(dateStr) {
    if (!dateStr) return null;
    const str = dateStr.trim().toLowerCase();
    if (str === 'present' || str === 'current') return null; // Leave "present" unfilled

    // Try "Month YYYY" format
    const monthYear = str.match(/^([a-z]+)\s+(\d{4})$/);
    if (monthYear) {
      const month = this.MONTH_MAP[monthYear[1]];
      if (month) return month + '/' + monthYear[2];
    }

    // Try "MM/YYYY" already
    const mmyyyy = str.match(/^(\d{1,2})\/(\d{4})$/);
    if (mmyyyy) return mmyyyy[1].padStart(2, '0') + '/' + mmyyyy[2];

    // Try "YYYY-MM"
    const isoMonth = str.match(/^(\d{4})-(\d{1,2})$/);
    if (isoMonth) return isoMonth[2].padStart(2, '0') + '/' + isoMonth[1];

    return null;
  },

  // === Pre-process profile to add derived fields ===

  preprocessProfile(profileData, sections) {
    const data = { ...profileData };

    // Parse phone number into parts
    if (data.phone) {
      const phoneMatch = data.phone.match(/^(\+\d{1,3})[\s.-]?(.+)/);
      if (phoneMatch) {
        if (!data.phone_country_code) data.phone_country_code = phoneMatch[1];
        if (!data.phone_number) data.phone_number = phoneMatch[2].replace(/[\s.-]/g, '');
      } else {
        if (!data.phone_number) data.phone_number = data.phone.replace(/[\s.-]/g, '');
      }
    }

    // Split name if not already split
    if (data.name && !data.first_name) {
      const parts = data.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        data.first_name = parts[0];
        data.last_name = parts.slice(1).join(' ');
      }
    }

    // Expand work experience entries into indexed fields
    if (sections && sections['Work Experience'] && Array.isArray(sections['Work Experience'])) {
      const entries = sections['Work Experience'];
      data._workEntries = entries.length;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const prefix = 'work_' + i + '_';

        if (entry.title) data[prefix + 'title'] = entry.title;
        if (entry.company) data[prefix + 'company'] = entry.company;
        if (entry.location) data[prefix + 'location'] = entry.location;
        if (entry.description) data[prefix + 'description'] = entry.description;

        // Parse duration "Dec 2025 - Present" → from/to dates
        if (entry.duration) {
          const parts = entry.duration.split(/\s*[-–—]\s*/);
          if (parts.length >= 1) {
            const from = this.parseDateToMMYYYY(parts[0]);
            if (from) data[prefix + 'from'] = from;
          }
          if (parts.length >= 2) {
            const to = this.parseDateToMMYYYY(parts[1]);
            if (to) data[prefix + 'to'] = to;
          }
        }
      }
    }

    // Expand education entries into indexed fields
    if (sections && sections['Education'] && Array.isArray(sections['Education'])) {
      const entries = sections['Education'];
      data._eduEntries = entries.length;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const prefix = 'edu_' + i + '_';

        if (entry.title) data[prefix + 'degree'] = entry.title;
        if (entry.degree) data[prefix + 'degree'] = entry.degree;
        if (entry.institution) data[prefix + 'university'] = entry.institution;
        if (entry.university) data[prefix + 'university'] = entry.university;
        if (entry.school) data[prefix + 'university'] = entry.school;
        if (entry.field_of_study) data[prefix + 'field_of_study'] = entry.field_of_study;

        if (entry.duration) {
          const parts = entry.duration.split(/\s*[-–—]\s*/);
          if (parts.length >= 1) {
            const from = this.parseDateToMMYYYY(parts[0]);
            if (from) data[prefix + 'from'] = from;
          }
          if (parts.length >= 2) {
            const to = this.parseDateToMMYYYY(parts[1]);
            if (to) data[prefix + 'to'] = to;
          }
        }
      }
    }

    return data;
  },

  // === Main matching pipeline ===

  matchField(fieldInfo, profileData) {
    if (!profileData || !fieldInfo) return null;

    if (fieldInfo.type === 'checkbox' || fieldInfo.type === 'radio') {
      return null;
    }

    // 1. Autocomplete attribute (browser standard, most reliable)
    const autoMatch = this.matchByAutocomplete(fieldInfo, profileData);
    if (autoMatch) return autoMatch;

    // 2. Input type
    const typeMatch = this.matchByInputType(fieldInfo, profileData);
    if (typeMatch) return typeMatch;

    // 3. Try matching on LABEL + PLACEHOLDER only first (clean human-readable text)
    const primaryText = this.cleanText([fieldInfo.label, fieldInfo.placeholder, fieldInfo.ariaLabel].join(' '));
    const primaryTokens = this.tokenize(primaryText);

    if (primaryTokens.length > 0) {
      const labelMatch = this.runSemanticPipeline(primaryTokens, primaryText, profileData);
      if (labelMatch && labelMatch.confidence >= 0.70) return labelMatch;
    }

    // 4. Fall back to including name/id attributes (often contain framework junk)
    const fullText = this.cleanText([fieldInfo.label, fieldInfo.placeholder, fieldInfo.ariaLabel, fieldInfo.name, fieldInfo.id].join(' '));
    const fullTokens = this.tokenize(fullText);

    const fullMatch = this.runSemanticPipeline(fullTokens, fullText, profileData);
    if (fullMatch) return fullMatch;

    return null;
  },

  runSemanticPipeline(tokens, searchText, profileData) {
    const semanticMatch = this.matchBySemantic(tokens, searchText, profileData);
    if (semanticMatch) return semanticMatch;

    const tokenMatch = this.matchByTokenOverlap(tokens, profileData);
    if (tokenMatch) return tokenMatch;

    const fuzzyMatch = this.matchByFuzzy(tokens, profileData);
    if (fuzzyMatch) return fuzzyMatch;

    return null;
  },

  cleanText(text) {
    return text.toLowerCase()
      .replace(/\(s\)/gi, 's')
      .replace(/\*/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  tokenize(text) {
    return text.split(' ').filter(w => w.length > 1);
  },

  // === Validation: ensure value makes sense for the field ===

  validateMatch(profileKey, value, fieldInfo) {
    if (!value) return false;
    const strValue = String(value);
    const isURL = /^https?:\/\//.test(strValue) || /^www\./.test(strValue);

    // URL values should not go into non-URL fields
    if (isURL && this.NON_URL_FIELDS.has(profileKey)) return false;

    // Non-URL values should not go into URL-expected fields based on field label
    const searchText = this.cleanText([fieldInfo.label, fieldInfo.placeholder, fieldInfo.ariaLabel, fieldInfo.name, fieldInfo.id].join(' '));
    if (!isURL && this.URL_FIELDS.has(profileKey)) {
      // This is fine — we matched a URL field key but the value isn't a URL
      // Only block if the field clearly expects a URL
    }

    // Address fields should not get URL values
    if (isURL && (searchText.includes('address') || searchText.includes('street') || searchText.includes('city'))) {
      return false;
    }

    // Name fields should not get long text
    if ((profileKey === 'first_name' || profileKey === 'last_name' || profileKey === 'middle_name') && strValue.length > 50) {
      return false;
    }

    // Phone fields should not get non-numeric (except + and spaces)
    if (profileKey.startsWith('phone') && !/^[\d\s+()-]+$/.test(strValue)) {
      return false;
    }

    return true;
  },

  // === Strategy 1: Autocomplete ===
  matchByAutocomplete(fieldInfo, profileData) {
    const ac = (fieldInfo.autocomplete || '').toLowerCase().trim();
    if (!ac || ac === 'off' || ac === 'on') return null;

    const tokens = ac.split(/\s+/);
    const lastToken = tokens[tokens.length - 1];

    const profileKey = this.AUTOCOMPLETE_MAP[lastToken] || this.AUTOCOMPLETE_MAP[ac];
    if (profileKey && profileData[profileKey] && this.validateMatch(profileKey, profileData[profileKey], fieldInfo)) {
      return {
        profileKey,
        value: profileData[profileKey],
        confidence: 0.98,
        method: 'autocomplete'
      };
    }
    return null;
  },

  // === Strategy 2: Input type ===
  matchByInputType(fieldInfo, profileData) {
    const profileKey = this.TYPE_MAP[fieldInfo.type];
    if (profileKey && profileData[profileKey] && this.validateMatch(profileKey, profileData[profileKey], fieldInfo)) {
      return {
        profileKey,
        value: profileData[profileKey],
        confidence: 0.90,
        method: 'type'
      };
    }
    return null;
  },

  // === Strategy 3: Semantic matching ===
  matchBySemantic(tokens, searchText, profileData) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [profileKey, phrases] of Object.entries(this.SEMANTIC_MAP)) {
      if (!(profileKey in profileData)) continue;

      for (const phrase of phrases) {
        const score = this.semanticScore(tokens, searchText, phrase);
        if (score > bestScore) {
          const value = profileData[profileKey];
          if (!this.validateMatch(profileKey, value, { label: searchText })) continue;

          bestScore = score;
          bestMatch = {
            profileKey,
            value,
            confidence: Math.min(0.96, 0.55 + score * 0.42),
            method: 'semantic'
          };
        }
      }

      const expandedScore = this.synonymExpandedScore(tokens, profileKey);
      if (expandedScore > bestScore) {
        const value = profileData[profileKey];
        if (!this.validateMatch(profileKey, value, { label: searchText })) continue;

        bestScore = expandedScore;
        bestMatch = {
          profileKey,
          value,
          confidence: Math.min(0.92, 0.55 + expandedScore * 0.38),
          method: 'synonym'
        };
      }
    }

    return bestMatch && bestMatch.confidence >= 0.65 ? bestMatch : null;
  },

  semanticScore(tokens, searchText, phrase) {
    if (searchText === phrase) return 1.0;
    if (searchText.includes(phrase)) return 0.95;

    const phraseTokens = phrase.split(' ');

    const allFound = phraseTokens.every(pt =>
      tokens.some(st => st === pt || st.includes(pt) || pt.includes(st))
    );
    if (allFound && phraseTokens.length > 1) return 0.9;

    // Single-word phrase exact match in tokens
    if (phraseTokens.length === 1) {
      if (tokens.includes(phraseTokens[0])) return 0.85;
    }

    const matchCount = phraseTokens.filter(pt =>
      tokens.some(st => st === pt || (st.length > 3 && pt.length > 3 && (st.includes(pt) || pt.includes(st))))
    ).length;

    if (matchCount > 0) {
      const coverage = matchCount / phraseTokens.length;
      const relevance = matchCount / Math.max(tokens.length, 1);
      return Math.max(coverage * 0.7, relevance * 0.6);
    }

    return 0;
  },

  synonymExpandedScore(tokens, profileKey) {
    const keyTokens = profileKey.split('_');
    let matchedKeyTokens = 0;

    for (const kt of keyTokens) {
      const synonymGroup = this.WORD_SYNONYMS[kt] || [];
      const allVariants = [kt, ...synonymGroup];

      const found = tokens.some(st =>
        allVariants.some(variant =>
          st === variant ||
          (st.length > 3 && variant.length > 3 && (st.includes(variant) || variant.includes(st)))
        )
      );

      if (found) matchedKeyTokens++;
    }

    if (matchedKeyTokens === 0) return 0;
    return matchedKeyTokens / keyTokens.length;
  },

  // === Strategy 4: Token overlap ===
  matchByTokenOverlap(tokens, profileData) {
    let bestMatch = null;
    let bestScore = 0;

    for (const profileKey of Object.keys(profileData)) {
      const keyTokens = profileKey.split('_').filter(t => t.length > 1);
      if (keyTokens.length === 0) continue;

      let matchCount = 0;
      for (const kt of keyTokens) {
        const synonyms = this.WORD_SYNONYMS[kt] || [];
        const variants = [kt, ...synonyms];

        if (tokens.some(st => variants.some(v => st === v || (st.length > 3 && v.length > 3 && (st.startsWith(v) || v.startsWith(st)))))) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const score = matchCount / keyTokens.length;
        if (score > bestScore && score >= 0.5) {
          const value = profileData[profileKey];
          if (!this.validateMatch(profileKey, value, { label: tokens.join(' ') })) continue;

          bestScore = score;
          bestMatch = {
            profileKey,
            value,
            confidence: 0.5 + score * 0.3,
            method: 'token'
          };
        }
      }
    }

    return bestMatch && bestMatch.confidence >= 0.6 ? bestMatch : null;
  },

  // === Strategy 5: Fuzzy matching ===
  matchByFuzzy(tokens, profileData) {
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const profileKey of Object.keys(profileData)) {
      const keyNorm = profileKey.replace(/_/g, ' ');
      const keyTokens = keyNorm.split(' ');

      for (const st of tokens) {
        if (st.length < 3) continue;

        for (const kt of keyTokens) {
          if (kt.length < 3) continue;

          const dist = this.levenshtein(st, kt);
          const maxLen = Math.max(st.length, kt.length);
          const similarity = 1 - dist / maxLen;

          if (similarity > 0.75 && similarity > bestSimilarity) {
            const value = profileData[profileKey];
            if (!this.validateMatch(profileKey, value, { label: tokens.join(' ') })) continue;

            bestSimilarity = similarity;
            bestMatch = {
              profileKey,
              value,
              confidence: 0.35 + similarity * 0.3,
              method: 'fuzzy'
            };
          }
        }
      }
    }

    return bestMatch && bestMatch.confidence >= 0.55 ? bestMatch : null;
  },

  levenshtein(a, b) {
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
  },

  // Build a section-scoped profile subset for grouped fields
  buildSectionProfile(enriched, sectionType, sectionIndex) {
    const subset = {};
    const prefix = (sectionType === 'work' ? 'work_' : 'edu_') + sectionIndex + '_';

    // Add all indexed fields for this section entry
    for (const [key, value] of Object.entries(enriched)) {
      if (key.startsWith(prefix)) {
        // Map "work_0_title" → "current_title", "work_0_company" → "company", etc.
        const fieldName = key.substring(prefix.length);
        const mapped = this.SECTION_FIELD_MAP[fieldName];
        if (mapped) subset[mapped] = value;
        subset[key] = value; // Keep the raw indexed key too
      }
    }

    return subset;
  },

  // Maps section sub-field names to profile keys for semantic matching
  SECTION_FIELD_MAP: {
    'title': 'current_title',
    'company': 'company',
    'location': 'location',
    'description': 'role_description',
    'from': 'start_date',
    'to': 'end_date',
    'degree': 'degree',
    'university': 'university',
    'field_of_study': 'degree',
  },

  // === Aggregate matching ===

  matchAllFields(fields, profileData, sections) {
    // Enrich profile with derived fields (phone parts, name parts, indexed work entries)
    const enriched = this.preprocessProfile(profileData, sections);

    // Apply domain-specific overrides if provided
    const domainOverrides = profileData._domainOverrides || {};

    const results = [];
    for (const field of fields) {
      const fieldId = field.id || field.name || field.xpath;

      // Check domain override first
      if (domainOverrides[fieldId]) {
        const overrideKey = domainOverrides[fieldId];
        if (enriched[overrideKey] !== undefined) {
          results.push({
            field,
            match: {
              profileKey: overrideKey,
              value: enriched[overrideKey],
              confidence: 0.99,
              method: 'domain_override'
            },
            status: 'matched'
          });
          continue;
        }
      }

      // Section-aware matching: if field is in a repeating section, match against that entry
      if (field.sectionType && enriched._workEntries) {
        const sectionProfile = this.buildSectionProfile(enriched, field.sectionType, field.sectionIndex);

        if (Object.keys(sectionProfile).length > 0) {
          // Try matching against section-specific data first
          const sectionMatch = this.matchField(field, sectionProfile);
          if (sectionMatch && sectionMatch.confidence >= 0.65) {
            results.push({
              field,
              match: sectionMatch,
              status: sectionMatch.confidence >= 0.75 ? 'matched' : 'ambiguous'
            });
            continue;
          }
        }
      }

      // Regular matching against full profile
      const match = this.matchField(field, enriched);
      results.push({
        field,
        match,
        status: match
          ? (match.confidence >= 0.75 ? 'matched' : 'ambiguous')
          : 'unmatched'
      });
    }

    // Dedup: allow reuse of same key if BOTH matches are high confidence
    // Only force alternative if one is clearly weaker
    const keyUsage = new Map(); // profileKey → [{ result, confidence }]

    // First pass: group by profile key
    for (const result of results) {
      if (!result.match) continue;
      const key = result.match.profileKey;
      if (!keyUsage.has(key)) keyUsage.set(key, []);
      keyUsage.get(key).push(result);
    }

    // Second pass: for keys used multiple times, allow reuse if both are >= 0.80
    // Otherwise, keep highest confidence and try alternatives for the rest
    for (const [key, usages] of keyUsage) {
      if (usages.length <= 1) continue;

      // Sort by confidence descending
      usages.sort((a, b) => b.match.confidence - a.match.confidence);

      const best = usages[0];
      for (let i = 1; i < usages.length; i++) {
        const current = usages[i];
        // Allow reuse if both matches are strong
        if (current.match.confidence >= 0.80 && best.match.confidence >= 0.80) {
          continue; // Both keep the same key
        }

        // Try to find alternative — but with HIGH threshold
        const altKeys = Object.keys(enriched).filter(k => {
          // Check this key isn't the primary match for another high-confidence result
          const primaryUsers = keyUsage.get(k);
          if (!primaryUsers) return true;
          return primaryUsers.every(u => u.match.confidence < current.match.confidence);
        });

        const altMatch = this.findAlternativeMatch(current.field, altKeys, enriched);
        if (altMatch && altMatch.confidence >= 0.75) {
          current.match = altMatch;
          current.status = altMatch.confidence >= 0.75 ? 'matched' : 'ambiguous';
        } else {
          // No good alternative — leave as unmatched rather than forcing a bad match
          current.match = null;
          current.status = 'unmatched';
        }
      }
    }

    // Apply confidence threshold — drop matches below user's minimum
    const threshold = profileData._confidenceThreshold || 0.60;
    for (const result of results) {
      if (result.match && result.match.method !== 'domain_override' && result.match.confidence < threshold) {
        result.match = null;
        result.status = 'unmatched';
      }
    }

    return results;
  },

  findAlternativeMatch(fieldInfo, availableKeys, profileData) {
    const subset = {};
    for (const key of availableKeys) {
      if (profileData[key] !== undefined) {
        subset[key] = profileData[key];
      }
    }
    return this.matchField(fieldInfo, subset);
  }
};
