var EasyAutoFill = EasyAutoFill || {};

EasyAutoFill.FieldMatcher = {

  KEYWORD_MAP: {
    name:         ['name', 'full name', 'your name', 'applicant name', 'candidate name', 'fullname', 'full_name'],
    first_name:   ['first name', 'firstname', 'fname', 'given name', 'first', 'givenname', 'given_name'],
    last_name:    ['last name', 'lastname', 'lname', 'surname', 'family name', 'last', 'familyname', 'family_name'],
    email:        ['email', 'e-mail', 'email address', 'mail', 'your email', 'emailaddress', 'email_address'],
    phone:        ['phone', 'telephone', 'tel', 'mobile', 'cell', 'contact number', 'phone number', 'mobile number', 'phonenumber'],
    address:      ['address', 'street', 'street address', 'mailing address', 'residential address'],
    city:         ['city', 'town', 'municipality'],
    state:        ['state', 'province', 'region', 'county'],
    zip:          ['zip', 'zipcode', 'zip code', 'postal', 'postal code', 'postcode', 'pin code', 'pincode'],
    country:      ['country', 'nation', 'nationality'],
    company:      ['company', 'employer', 'organization', 'organisation', 'current company', 'company name', 'current employer'],
    current_title:['title', 'job title', 'position', 'role', 'designation', 'current title', 'current role', 'current position'],
    work_experience: ['experience', 'work experience', 'professional experience', 'employment history'],
    professional_summary: ['summary', 'professional summary', 'about', 'about me', 'bio', 'biography', 'objective', 'profile summary', 'career objective', 'personal statement'],
    cover_letter: ['cover letter', 'coverletter', 'cover', 'motivation', 'motivation letter', 'letter of motivation', 'why this role'],
    education:    ['education', 'qualification', 'academic', 'academic background', 'educational background'],
    degree:       ['degree', 'highest degree', 'qualification name'],
    university:   ['university', 'college', 'school', 'institution', 'alma mater'],
    graduation_year: ['graduation year', 'grad year', 'year of graduation', 'graduation date'],
    gpa:          ['gpa', 'grade', 'cgpa', 'marks', 'score', 'percentage'],
    linkedin:     ['linkedin', 'linkedin url', 'linkedin profile', 'linkedin link'],
    github:       ['github', 'github url', 'github profile', 'github link'],
    website:      ['website', 'portfolio', 'personal website', 'url', 'homepage', 'personal url', 'portfolio url', 'portfolio link', 'blog'],
    twitter:      ['twitter', 'twitter url', 'x profile', 'x handle'],
    skills:       ['skills', 'technical skills', 'key skills', 'competencies', 'expertise', 'technologies', 'tech stack'],
    salary:       ['salary', 'expected salary', 'salary expectation', 'compensation', 'desired salary', 'pay expectation'],
    availability: ['availability', 'start date', 'available from', 'notice period', 'available date', 'earliest start'],
    visa:         ['visa', 'work authorization', 'visa status', 'sponsorship', 'right to work', 'work permit'],
    references:   ['references', 'referees', 'reference contact'],
    languages:    ['languages', 'language skills', 'spoken languages', 'language proficiency'],
    certifications: ['certifications', 'certificates', 'licenses', 'accreditations', 'professional certifications'],
    publications: ['publications', 'research papers', 'papers', 'journal articles'],
    awards:       ['awards', 'honors', 'achievements', 'recognitions', 'accomplishments'],
    hobbies:      ['hobbies', 'interests', 'extracurricular', 'activities', 'pastimes'],
  },

  TYPE_MAP: {
    'email': 'email',
    'tel':   'phone',
    'url':   'website',
  },

  matchField(fieldInfo, profileData) {
    if (!profileData || !fieldInfo) return null;

    const searchTokens = this.buildSearchText(fieldInfo);

    const typeMatch = this.matchByInputType(fieldInfo, profileData);
    if (typeMatch) return typeMatch;

    const keywordMatch = this.matchByKeywords(searchTokens, profileData);
    if (keywordMatch) return keywordMatch;

    const directMatch = this.matchByDirectKey(searchTokens, profileData);
    if (directMatch) return directMatch;

    const fuzzyMatch = this.matchByFuzzy(searchTokens, profileData);
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
    return parts.join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  },

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

  matchByKeywords(searchText, profileData) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [profileKey, keywords] of Object.entries(this.KEYWORD_MAP)) {
      if (!(profileKey in profileData)) continue;

      for (const keyword of keywords) {
        const score = this.keywordScore(searchText, keyword);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            profileKey,
            value: profileData[profileKey],
            confidence: Math.min(0.95, 0.6 + score * 0.35),
            method: 'keyword'
          };
        }
      }
    }

    return bestMatch && bestMatch.confidence >= 0.7 ? bestMatch : null;
  },

  keywordScore(searchText, keyword) {
    if (searchText === keyword) return 1.0;

    const words = searchText.split(' ');
    if (words.includes(keyword)) return 0.95;

    const kwWords = keyword.split(' ');
    if (kwWords.length > 1 && searchText.includes(keyword)) return 0.9;

    if (kwWords.length === 1) {
      for (const word of words) {
        if (word.includes(keyword) || keyword.includes(word)) {
          const overlap = Math.min(word.length, keyword.length) / Math.max(word.length, keyword.length);
          if (overlap > 0.7) return 0.7 * overlap;
        }
      }
    }

    return 0;
  },

  matchByDirectKey(searchText, profileData) {
    const searchWords = searchText.split(' ').filter(w => w.length > 2);

    for (const profileKey of Object.keys(profileData)) {
      const keyWords = profileKey.split('_');

      const overlap = keyWords.filter(kw => searchWords.some(sw =>
        sw === kw || (sw.length > 3 && kw.length > 3 && (sw.includes(kw) || kw.includes(sw)))
      ));

      if (overlap.length > 0 && overlap.length >= keyWords.length * 0.5) {
        return {
          profileKey,
          value: profileData[profileKey],
          confidence: 0.6 + (overlap.length / keyWords.length) * 0.2,
          method: 'direct'
        };
      }
    }

    return null;
  },

  matchByFuzzy(searchText, profileData) {
    let bestMatch = null;
    let bestDist = Infinity;
    const searchWords = searchText.split(' ').filter(w => w.length > 2);

    for (const profileKey of Object.keys(profileData)) {
      const keyNorm = profileKey.replace(/_/g, ' ');

      for (const word of searchWords) {
        const dist = this.levenshtein(word, keyNorm);
        const maxLen = Math.max(word.length, keyNorm.length);
        const similarity = 1 - dist / maxLen;

        if (similarity > 0.65 && dist < bestDist) {
          bestDist = dist;
          bestMatch = {
            profileKey,
            value: profileData[profileKey],
            confidence: 0.3 + similarity * 0.3,
            method: 'fuzzy'
          };
        }
      }
    }

    return bestMatch && bestMatch.confidence >= 0.5 ? bestMatch : null;
  },

  levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
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

  matchAllFields(fields, profileData) {
    const results = [];

    for (const field of fields) {
      const match = this.matchField(field, profileData);
      results.push({
        field,
        match,
        status: match
          ? (match.confidence >= 0.8 ? 'matched' : 'ambiguous')
          : 'unmatched'
      });
    }

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
            result.status = altMatch.confidence >= 0.8 ? 'matched' : 'ambiguous';
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
