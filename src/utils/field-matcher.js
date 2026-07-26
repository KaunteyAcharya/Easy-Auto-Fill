var EasyAutoFill = EasyAutoFill || {};

EasyAutoFill.FieldMatcher = {

  // HTML autocomplete attribute → profile key (highest confidence, standardized by spec)
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
    'tel-national':         'phone',
    'tel-local':            'phone',
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
    'photo':                'photo',
    'language':             'languages',
  },

  // Semantic concept groups: each profile key → all natural language ways people refer to it
  SEMANTIC_MAP: {
    // Identity
    name:           ['name', 'full name', 'your name', 'applicant name', 'candidate name', 'legal name', 'complete name', 'display name'],
    first_name:     ['first name', 'given name', 'given names', 'forename', 'christian name', 'first', 'fname', 'nombre'],
    middle_name:    ['middle name', 'middle initial', 'middle', 'second name'],
    last_name:      ['last name', 'family name', 'surname', 'last', 'lname', 'apellido'],
    prefix:         ['prefix', 'title', 'salutation', 'mr mrs ms dr', 'honorific'],
    nickname:       ['nickname', 'preferred name', 'known as', 'goes by', 'alias', 'display name'],
    gender:         ['gender', 'sex', 'male female', 'identity'],
    date_of_birth:  ['date of birth', 'dob', 'birthday', 'birth date', 'born on'],
    nationality:    ['nationality', 'citizenship', 'national origin'],

    // Contact
    email:          ['email', 'e mail', 'email address', 'mail', 'your email', 'contact email', 'primary email', 'work email', 'personal email'],
    phone:          ['phone', 'telephone', 'tel', 'mobile', 'cell', 'contact number', 'phone number', 'mobile number', 'cellular', 'mobile phone', 'cell phone', 'primary phone', 'home phone', 'work phone', 'daytime phone'],
    phone_extension:['phone extension', 'ext', 'extension', 'telephone extension'],

    // Address
    address:        ['address', 'street', 'street address', 'address line 1', 'address line1', 'mailing address', 'residential address', 'home address', 'current address', 'permanent address', 'line 1'],
    address_line_2: ['address line 2', 'address line2', 'line 2', 'apt', 'apartment', 'suite', 'unit', 'floor', 'building'],
    city:           ['city', 'town', 'municipality', 'locality', 'village', 'district', 'metro'],
    state:          ['state', 'province', 'region', 'county', 'territory', 'prefecture', 'department'],
    zip:            ['zip', 'zipcode', 'zip code', 'postal code', 'postcode', 'pin code', 'pincode', 'postal'],
    country:        ['country', 'nation', 'country region', 'location country'],
    location:       ['location', 'current location', 'city state', 'where are you based', 'based in', 'residing in'],

    // Professional
    company:        ['company', 'employer', 'organization', 'organisation', 'current company', 'company name', 'current employer', 'firm', 'workplace', 'employer name', 'most recent employer'],
    current_title:  ['job title', 'title', 'position', 'role', 'designation', 'current title', 'current role', 'current position', 'position title', 'professional title', 'what is your role'],
    current_role:   ['current role', 'present role', 'latest role', 'most recent role', 'most recent position'],
    work_experience:['experience', 'work experience', 'professional experience', 'employment history', 'work history', 'career history', 'relevant experience', 'previous experience', 'past employment', 'employment details'],
    experience_years:['years of experience', 'experience years', 'total experience', 'how many years', 'years in field', 'yoe'],
    professional_summary: ['summary', 'professional summary', 'about', 'about me', 'bio', 'biography', 'objective', 'profile summary', 'career objective', 'personal statement', 'career summary', 'introduction', 'tell us about yourself', 'describe yourself', 'about you', 'brief description', 'professional profile', 'executive summary', 'overview'],
    cover_letter:   ['cover letter', 'coverletter', 'motivation', 'motivation letter', 'letter of motivation', 'why this role', 'why are you interested', 'message to hiring', 'message to the hiring team', 'why do you want', 'additional information', 'letter of interest', 'personal message', 'note to recruiter', 'why should we hire', 'what interests you'],
    notice_period:  ['notice period', 'notice', 'how soon can you start', 'earliest start date', 'when can you start', 'when can you join', 'joining date'],
    availability:   ['availability', 'start date', 'available from', 'available date', 'earliest start', 'when available', 'date available'],

    // Education
    education:      ['education', 'qualification', 'academic', 'academic background', 'educational background', 'educational history', 'academic history', 'schooling'],
    degree:         ['degree', 'highest degree', 'qualification name', 'level of education', 'education level', 'major degree', 'field of study', 'course', 'program', 'major'],
    university:     ['university', 'college', 'school', 'institution', 'alma mater', 'school name', 'college name', 'university name', 'institution name', 'where did you study'],
    graduation_year:['graduation year', 'grad year', 'year of graduation', 'graduation date', 'year completed', 'completion year', 'pass out year', 'batch'],
    gpa:            ['gpa', 'grade', 'cgpa', 'marks', 'score', 'percentage', 'grade point', 'academic score'],

    // Online presence
    linkedin:       ['linkedin', 'linkedin url', 'linkedin profile', 'linkedin link', 'linked in'],
    github:         ['github', 'github url', 'github profile', 'github link', 'git hub'],
    website:        ['website', 'portfolio', 'personal website', 'url', 'homepage', 'personal url', 'portfolio url', 'portfolio link', 'blog', 'web page', 'personal site', 'online portfolio'],
    medium:         ['medium', 'medium profile', 'blog url', 'blog link', 'writing portfolio'],
    twitter:        ['twitter', 'twitter url', 'x profile', 'x handle', 'x fka twitter', 'x formerly twitter', 'x twitter'],
    facebook:       ['facebook', 'facebook url', 'facebook profile', 'fb'],
    instagram:      ['instagram', 'instagram url', 'instagram profile', 'ig'],

    // Skills & qualifications
    skills:         ['skills', 'technical skills', 'key skills', 'competencies', 'expertise', 'technologies', 'tech stack', 'core skills', 'areas of expertise', 'strengths', 'proficiencies', 'capabilities'],
    technical_skills:['technical skills', 'tech skills', 'it skills', 'programming skills', 'hard skills'],
    programming_languages: ['programming languages', 'coding languages', 'languages known', 'tech languages'],
    tools:          ['tools', 'software', 'applications', 'platforms', 'frameworks', 'tools used', 'software proficiency'],
    certifications: ['certifications', 'certificates', 'licenses', 'accreditations', 'professional certifications', 'credentials'],

    // Compensation & logistics
    salary:         ['salary', 'expected salary', 'salary expectation', 'compensation', 'desired salary', 'pay expectation', 'expected ctc', 'current ctc', 'expected compensation', 'annual salary', 'pay rate', 'rate', 'hourly rate'],
    visa:           ['visa', 'work authorization', 'visa status', 'sponsorship', 'right to work', 'work permit', 'authorized to work', 'legally authorized', 'require sponsorship', 'immigration status', 'work eligibility'],

    // Other
    references:     ['references', 'referees', 'reference contact', 'professional references'],
    languages:      ['languages', 'language skills', 'spoken languages', 'language proficiency', 'languages spoken', 'fluent in', 'linguistic skills'],
    publications:   ['publications', 'research papers', 'papers', 'journal articles', 'published work', 'research publications'],
    awards:         ['awards', 'honors', 'achievements', 'recognitions', 'accomplishments', 'scholarships', 'prizes'],
    hobbies:        ['hobbies', 'interests', 'extracurricular', 'activities', 'pastimes', 'personal interests', 'leisure activities', 'outside interests'],
  },

  // Input type → profile key
  TYPE_MAP: {
    'email': 'email',
    'tel':   'phone',
    'url':   'website',
  },

  // Semantic word groups for NLP-style understanding
  WORD_SYNONYMS: {
    'given':     ['first', 'fore', 'christian'],
    'family':    ['last', 'sur'],
    'phone':     ['tel', 'telephone', 'mobile', 'cell', 'cellular', 'contact'],
    'mail':      ['email', 'e-mail'],
    'company':   ['employer', 'organization', 'organisation', 'firm', 'workplace'],
    'school':    ['university', 'college', 'institution'],
    'degree':    ['major', 'qualification', 'course', 'program'],
    'address':   ['street', 'residence', 'mailing'],
    'zip':       ['postal', 'postcode', 'pincode'],
    'city':      ['town', 'municipality', 'locality'],
    'resume':    ['cv', 'curriculum vitae'],
    'summary':   ['objective', 'bio', 'about', 'overview', 'introduction', 'profile'],
    'cover':     ['motivation', 'interest'],
    'job':       ['position', 'role', 'designation'],
    'website':   ['portfolio', 'homepage', 'url', 'blog', 'site'],
    'linkedin':  ['linked in'],
    'twitter':   ['x'],
    'experience':['history', 'background', 'employment'],
    'skills':    ['competencies', 'expertise', 'proficiencies', 'capabilities', 'strengths'],
    'salary':    ['compensation', 'pay', 'ctc', 'remuneration', 'wage'],
    'notice':    ['notice period', 'joining'],
    'visa':      ['authorization', 'sponsorship', 'permit', 'eligibility'],
    'award':     ['honor', 'achievement', 'scholarship', 'prize', 'recognition'],
    'hobby':     ['interest', 'pastime', 'activity'],
    'publication':['paper', 'article', 'journal', 'research'],
    'language':  ['linguistic', 'tongue'],
  },

  // === Main matching pipeline ===

  matchField(fieldInfo, profileData) {
    if (!profileData || !fieldInfo) return null;

    // 1. Autocomplete attribute (highest priority, browser-standard)
    const autoMatch = this.matchByAutocomplete(fieldInfo, profileData);
    if (autoMatch) return autoMatch;

    // 2. Input type
    const typeMatch = this.matchByInputType(fieldInfo, profileData);
    if (typeMatch) return typeMatch;

    const searchText = this.buildSearchText(fieldInfo);
    const tokens = this.tokenize(searchText);

    // 3. Semantic keyword matching (expanded NLP synonyms)
    const semanticMatch = this.matchBySemantic(tokens, searchText, profileData);
    if (semanticMatch) return semanticMatch;

    // 4. Token overlap with profile keys
    const tokenMatch = this.matchByTokenOverlap(tokens, profileData);
    if (tokenMatch) return tokenMatch;

    // 5. Fuzzy matching (Levenshtein + synonyms)
    const fuzzyMatch = this.matchByFuzzy(tokens, profileData);
    if (fuzzyMatch) return fuzzyMatch;

    return null;
  },

  buildSearchText(fieldInfo) {
    const parts = [
      fieldInfo.label || '',
      fieldInfo.name || '',
      fieldInfo.id || '',
      fieldInfo.placeholder || '',
      fieldInfo.ariaLabel || '',
    ];
    return parts.join(' ').toLowerCase()
      .replace(/\(s\)/g, 's')       // "Name(s)" → "Names"
      .replace(/\*/g, '')            // Remove required markers
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  tokenize(text) {
    return text.split(' ').filter(w => w.length > 1);
  },

  // === Strategy 1: Autocomplete attribute ===
  matchByAutocomplete(fieldInfo, profileData) {
    const ac = (fieldInfo.autocomplete || '').toLowerCase().trim();
    if (!ac || ac === 'off' || ac === 'on') return null;

    const tokens = ac.split(/\s+/);
    const lastToken = tokens[tokens.length - 1];

    const profileKey = this.AUTOCOMPLETE_MAP[lastToken] || this.AUTOCOMPLETE_MAP[ac];
    if (profileKey && profileData[profileKey]) {
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
    if (profileKey && profileData[profileKey]) {
      return {
        profileKey,
        value: profileData[profileKey],
        confidence: 0.95,
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
          bestScore = score;
          bestMatch = {
            profileKey,
            value: profileData[profileKey],
            confidence: Math.min(0.96, 0.55 + score * 0.42),
            method: 'semantic'
          };
        }
      }

      // Also check using word synonym expansion
      const expandedScore = this.synonymExpandedScore(tokens, profileKey);
      if (expandedScore > bestScore) {
        bestScore = expandedScore;
        bestMatch = {
          profileKey,
          value: profileData[profileKey],
          confidence: Math.min(0.92, 0.55 + expandedScore * 0.38),
          method: 'synonym'
        };
      }
    }

    return bestMatch && bestMatch.confidence >= 0.65 ? bestMatch : null;
  },

  semanticScore(tokens, searchText, phrase) {
    // Exact full phrase match
    if (searchText === phrase) return 1.0;
    if (searchText.includes(phrase)) return 0.95;

    // Token-level matching
    const phraseTokens = phrase.split(' ');

    // All phrase tokens found in search tokens
    const allFound = phraseTokens.every(pt =>
      tokens.some(st => st === pt || st.includes(pt) || pt.includes(st))
    );
    if (allFound && phraseTokens.length > 1) return 0.9;

    // Partial token overlap
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
    // Expand search tokens using synonym groups and check against profile key
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
        // Check direct match and synonym-expanded match
        const synonyms = this.WORD_SYNONYMS[kt] || [];
        const variants = [kt, ...synonyms];

        if (tokens.some(st => variants.some(v => st === v || (st.length > 3 && v.length > 3 && (st.startsWith(v) || v.startsWith(st)))))) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const score = matchCount / keyTokens.length;
        if (score > bestScore && score >= 0.5) {
          bestScore = score;
          bestMatch = {
            profileKey,
            value: profileData[profileKey],
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

      // Compare each search token against each key token
      for (const st of tokens) {
        if (st.length < 3) continue;

        for (const kt of keyTokens) {
          if (kt.length < 3) continue;

          const dist = this.levenshtein(st, kt);
          const maxLen = Math.max(st.length, kt.length);
          const similarity = 1 - dist / maxLen;

          if (similarity > 0.7 && similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestMatch = {
              profileKey,
              value: profileData[profileKey],
              confidence: 0.35 + similarity * 0.3,
              method: 'fuzzy'
            };
          }
        }
      }

      // Also try full string comparison
      const searchJoined = tokens.join(' ');
      const dist = this.levenshtein(searchJoined, keyNorm);
      const maxLen = Math.max(searchJoined.length, keyNorm.length);
      const similarity = 1 - dist / maxLen;

      if (similarity > 0.6 && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = {
          profileKey,
          value: profileData[profileKey],
          confidence: 0.4 + similarity * 0.35,
          method: 'fuzzy'
        };
      }
    }

    return bestMatch && bestMatch.confidence >= 0.5 ? bestMatch : null;
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
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  },

  // === Aggregate matching for all fields ===

  matchAllFields(fields, profileData) {
    const results = [];

    for (const field of fields) {
      const match = this.matchField(field, profileData);
      results.push({
        field,
        match,
        status: match
          ? (match.confidence >= 0.75 ? 'matched' : 'ambiguous')
          : 'unmatched'
      });
    }

    // Deduplicate: if multiple fields match the same profile key, keep highest confidence
    const usedKeys = new Set();
    const deduped = [];

    results
      .sort((a, b) => (b.match?.confidence || 0) - (a.match?.confidence || 0))
      .forEach(result => {
        if (result.match && usedKeys.has(result.match.profileKey)) {
          const alternatives = Object.keys(profileData).filter(k => !usedKeys.has(k));
          const altMatch = this.findAlternativeMatch(result.field, alternatives, profileData);
          if (altMatch) {
            result.match = altMatch;
            result.status = altMatch.confidence >= 0.75 ? 'matched' : 'ambiguous';
          } else {
            result.match = null;
            result.status = 'unmatched';
          }
        }
        if (result.match) usedKeys.add(result.match.profileKey);
        deduped.push(result);
      });

    return deduped;
  },

  findAlternativeMatch(fieldInfo, availableKeys, profileData) {
    const subset = {};
    for (const key of availableKeys) {
      subset[key] = profileData[key];
    }
    return this.matchField(fieldInfo, subset);
  }
};
