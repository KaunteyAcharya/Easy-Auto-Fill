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
    // === Personal / Identity ===
    name:           ['name', 'full name', 'your name', 'applicant name', 'candidate name', 'legal name', 'complete name', 'display name'],
    first_name:     ['first name', 'given name', 'given names', 'forename', 'christian name', 'first', 'fname', 'local given name', 'local given names'],
    middle_name:    ['middle name', 'middle initial', 'middle', 'second name'],
    last_name:      ['last name', 'family name', 'surname', 'last', 'lname', 'local family name'],
    prefix:         ['prefix', 'salutation', 'mr mrs ms dr', 'honorific'],
    nickname:       ['nickname', 'preferred name', 'known as', 'goes by', 'alias'],
    pronouns:       ['pronouns', 'preferred pronouns', 'your pronouns', 'gender pronouns'],
    gender:         ['gender', 'sex', 'male female'],
    date_of_birth:  ['date of birth', 'dob', 'birthday', 'birth date', 'born on'],
    place_of_birth: ['place of birth', 'birth place', 'city of birth', 'born in', 'birth city'],
    nationality:    ['nationality', 'citizenship', 'national origin'],
    marital_status: ['marital status', 'married single', 'relationship status'],
    blood_group:    ['blood group', 'blood type'],
    religion:       ['religion', 'faith', 'religious affiliation'],
    category:       ['category', 'caste', 'social category', 'reservation category', 'obc sc st general'],

    // === Family ===
    father_name:    ['father name', 'fathers name', 'father s name', 'name of father', 'father full name', 'paternal name'],
    mother_name:    ['mother name', 'mothers name', 'mother s name', 'name of mother', 'mother full name', 'maternal name'],
    spouse_name:    ['spouse name', 'husband name', 'wife name', 'partner name', 'spouse s name'],
    guardian_name:  ['guardian name', 'guardian s name', 'name of guardian', 'local guardian'],

    // === Contact ===
    email:          ['email', 'e mail', 'email address', 'mail', 'your email', 'contact email', 'primary email', 'work email', 'personal email'],
    phone:          ['phone', 'telephone', 'tel', 'mobile', 'cell', 'contact number', 'phone number', 'mobile number', 'cellular', 'mobile phone', 'cell phone', 'primary phone', 'home phone', 'work phone', 'daytime phone'],
    phone_number:   ['phone number', 'mobile number', 'telephone number', 'contact number', 'cell number'],
    phone_country_code: ['country phone code', 'country code', 'phone code', 'dialing code', 'isd code', 'calling code'],
    phone_extension:['phone extension', 'ext', 'extension', 'telephone extension'],
    alternate_phone:['alternate phone', 'secondary phone', 'other phone', 'landline', 'alternate contact', 'alternate mobile'],
    alternate_email:['alternate email', 'secondary email', 'other email', 'backup email'],
    emergency_contact_name:  ['emergency contact', 'emergency contact name', 'emergency person', 'in case of emergency'],
    emergency_contact_phone: ['emergency phone', 'emergency contact number', 'emergency number', 'emergency tel'],
    emergency_contact_relation: ['emergency relation', 'relationship to emergency', 'emergency contact relationship'],

    // === Address ===
    address:        ['address', 'street', 'street address', 'address line 1', 'address line1', 'mailing address', 'residential address', 'home address', 'current address'],
    permanent_address: ['permanent address', 'permanent residential address', 'home town address'],
    correspondence_address: ['correspondence address', 'communication address', 'mailing address', 'postal address'],
    address_line_2: ['address line 2', 'address line2', 'apt', 'apartment', 'suite', 'unit', 'floor', 'building'],
    city:           ['city', 'town', 'municipality', 'locality', 'village', 'district', 'metro'],
    state:          ['state', 'province', 'region', 'county', 'territory', 'prefecture'],
    zip:            ['zip', 'zipcode', 'zip code', 'postal code', 'postcode', 'pin code', 'pincode', 'postal'],
    country:        ['country', 'nation', 'country region', 'location country'],
    location:       ['location', 'current location', 'city state', 'where are you based', 'based in'],

    // === Identity Documents (SENSITIVE) ===
    aadhaar:        ['aadhaar', 'aadhar', 'aadhaar number', 'aadhar number', 'uid', 'aadhaar card', 'uidai'],
    pan:            ['pan', 'pan number', 'pan card', 'permanent account number', 'income tax pan'],
    passport_number:['passport', 'passport number', 'passport no', 'travel document number'],
    passport_expiry:['passport expiry', 'passport expiry date', 'passport valid till', 'passport validity'],
    passport_issue_date: ['passport issue date', 'date of issue', 'passport issued on'],
    passport_issue_place:['passport issue place', 'place of issue', 'issuing authority', 'issued at'],
    voter_id:       ['voter id', 'voter card', 'election id', 'epic number', 'voter identity'],
    driving_license:['driving license', 'drivers license', 'dl number', 'driving licence', 'license number'],
    ssn:            ['ssn', 'social security', 'social security number', 'social insurance number', 'sin'],

    // === Financial (SENSITIVE) ===
    bank_name:      ['bank name', 'name of bank', 'bank'],
    account_number: ['account number', 'bank account', 'account no', 'a c number', 'savings account'],
    ifsc_code:      ['ifsc', 'ifsc code', 'bank ifsc', 'branch code', 'routing number', 'sort code', 'swift code'],
    annual_income:  ['annual income', 'yearly income', 'total income', 'income per annum', 'gross income'],
    income_source:  ['income source', 'source of income', 'source of funds', 'occupation income'],

    // === Work ===
    company:        ['company', 'employer', 'organization', 'organisation', 'current company', 'company name', 'current employer', 'firm', 'workplace', 'employer name', 'most recent employer'],
    current_title:  ['job title', 'position', 'role', 'designation', 'current title', 'current role', 'current position', 'position title', 'professional title'],
    current_role:   ['current role', 'present role', 'latest role', 'most recent role'],
    occupation:     ['occupation', 'profession', 'type of employment', 'employment type', 'nature of work'],
    work_experience:['experience', 'work experience', 'professional experience', 'employment history', 'work history', 'career history', 'relevant experience'],
    experience_years:['years of experience', 'experience years', 'total experience', 'how many years', 'yoe'],
    professional_summary: ['summary', 'professional summary', 'about', 'about me', 'bio', 'biography', 'objective', 'profile summary', 'career objective', 'personal statement', 'career summary', 'tell us about yourself', 'describe yourself', 'professional profile', 'executive summary', 'overview'],
    cover_letter:   ['cover letter', 'motivation', 'motivation letter', 'why this role', 'why are you interested', 'message to hiring', 'message to the hiring team', 'why do you want', 'additional information', 'letter of interest', 'personal message', 'note to recruiter'],
    role_description: ['role description', 'job description', 'responsibilities', 'duties', 'description', 'what did you do', 'describe your role', 'key responsibilities', 'job responsibilities'],
    start_date:     ['from', 'start date', 'from date', 'date from', 'started', 'joining date', 'start month'],
    end_date:       ['to', 'end date', 'to date', 'date to', 'ended', 'leaving date', 'end month', 'last day'],
    notice_period:  ['notice period', 'how soon can you start', 'earliest start date', 'when can you start', 'when can you join'],
    availability:   ['availability', 'available from', 'available date', 'earliest start', 'when available', 'date available'],
    salary:         ['salary', 'expected salary', 'salary expectation', 'compensation', 'desired salary', 'expected ctc', 'current ctc', 'pay rate', 'hourly rate'],

    // === Education ===
    education:      ['education', 'qualification', 'academic background', 'educational background', 'educational history'],
    degree:         ['degree', 'highest degree', 'qualification name', 'level of education', 'education level', 'field of study', 'course', 'program', 'major'],
    university:     ['university', 'college', 'school', 'institution', 'alma mater', 'school name', 'college name', 'university name'],
    graduation_year:['graduation year', 'grad year', 'year of graduation', 'graduation date', 'completion year'],
    gpa:            ['gpa', 'grade', 'cgpa', 'marks', 'score', 'percentage', 'grade point'],
    board:          ['board', 'education board', 'cbse', 'icse', 'state board', 'board of education'],
    medium_of_instruction: ['medium of instruction', 'medium', 'language of instruction'],
    enrollment_number: ['enrollment number', 'enrollment no', 'roll number', 'roll no', 'student id', 'registration number', 'prn'],

    // === References ===
    reference_1_name:  ['reference name', 'referee name', 'reference 1 name', 'first reference'],
    reference_1_phone: ['reference phone', 'referee phone', 'reference 1 phone', 'reference contact'],
    reference_1_email: ['reference email', 'referee email', 'reference 1 email'],
    reference_1_relation: ['reference relationship', 'referee relationship', 'relation to reference', 'how do you know'],
    reference_2_name:  ['reference 2 name', 'second reference', 'another reference'],
    reference_2_phone: ['reference 2 phone', 'second reference phone'],
    reference_2_email: ['reference 2 email', 'second reference email'],

    // === Rental / Property ===
    current_rent:      ['current rent', 'monthly rent', 'rent amount', 'how much rent'],
    landlord_name:     ['landlord name', 'property owner', 'owner name', 'lessor name'],
    landlord_phone:    ['landlord phone', 'landlord contact', 'owner phone', 'owner contact'],
    previous_address:  ['previous address', 'prior address', 'last address', 'former address'],
    move_in_date:      ['move in date', 'desired move in', 'when to move', 'lease start'],
    lease_duration:    ['lease duration', 'lease term', 'how long', 'tenancy period'],
    number_of_occupants: ['number of occupants', 'how many people', 'occupants', 'tenants', 'household size'],
    pets:              ['pets', 'do you have pets', 'pet details', 'animals'],

    // === Links ===
    linkedin:       ['linkedin', 'linkedin url', 'linkedin profile', 'linked in', 'linkedin link', 'linkedin page', 'linkedin account', 'your linkedin'],
    github:         ['github', 'github url', 'github profile', 'git hub', 'github link', 'github page', 'github account', 'your github'],
    website:        ['website', 'portfolio', 'personal website', 'homepage', 'portfolio url', 'blog', 'personal site', 'online portfolio', 'url', 'personal url', 'website url', 'website link', 'your website', 'your url'],
    medium:         ['medium', 'medium profile', 'blog url', 'writing portfolio'],
    twitter:        ['twitter', 'x profile', 'x handle', 'x fka twitter', 'x formerly twitter', 'x twitter', 'twitter url', 'twitter link', 'x url', 'x link'],
    facebook:       ['facebook', 'facebook url', 'facebook profile', 'fb'],
    instagram:      ['instagram', 'instagram url', 'ig'],

    // === Skills & Misc ===
    skills:         ['skills', 'technical skills', 'key skills', 'competencies', 'expertise', 'technologies', 'tech stack', 'core skills', 'proficiencies'],
    technical_skills:['technical skills', 'tech skills', 'it skills', 'programming skills', 'hard skills'],
    programming_languages: ['programming languages', 'coding languages', 'tech languages'],
    tools:          ['tools', 'software', 'applications', 'platforms', 'frameworks'],
    certifications: ['certifications', 'certificates', 'licenses', 'accreditations'],
    visa:           ['visa', 'work authorization', 'visa status', 'sponsorship', 'right to work', 'work permit', 'authorized to work', 'require sponsorship'],
    references:     ['references', 'referees', 'reference contact', 'professional references'],
    languages:      ['languages', 'language skills', 'spoken languages', 'language proficiency', 'languages spoken'],
    publications:   ['publications', 'research papers', 'papers', 'journal articles', 'published work'],
    awards:         ['awards', 'honors', 'achievements', 'recognitions', 'accomplishments', 'scholarships'],
    hobbies:        ['hobbies', 'interests', 'extracurricular', 'activities', 'pastimes', 'personal interests'],

    // === Nominee (Insurance/Banking) ===
    nominee_name:   ['nominee', 'nominee name', 'beneficiary', 'beneficiary name'],
    nominee_relation: ['nominee relation', 'relationship with nominee', 'nominee relationship', 'beneficiary relation'],
    guarantor_name: ['guarantor', 'guarantor name', 'co applicant', 'co signer'],
  },

  TYPE_MAP: {
    'email': 'email',
    'tel':   'phone',
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

  STOPWORDS: new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off',
    'over', 'under', 'again', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'not', 'only', 'so', 'than',
    'too', 'very', 'just', 'but', 'and', 'or', 'if', 'while', 'what',
    'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'it',
    'its', 'my', 'your', 'his', 'her', 'our', 'their', 'me', 'him', 'us',
    'them', 'up', 'we', 'you', 'please', 'enter', 'provide', 'select',
    'choose', 'write', 'type', 'input', 'fill', 'required', 'optional',
    'must', 'also', 'any', 'own', 'same', 'because', 'about',
  ]),

  // Sensitive fields that require user confirmation before filling
  SENSITIVE_FIELDS: new Set([
    'aadhaar', 'pan', 'passport_number', 'passport_expiry', 'passport_issue_date', 'passport_issue_place',
    'voter_id', 'driving_license', 'ssn',
    'bank_name', 'account_number', 'ifsc_code', 'annual_income',
  ]),

  isSensitiveField(profileKey) {
    return this.SENSITIVE_FIELDS.has(profileKey);
  },

  PROFILE_CATEGORIES: {
    job:        { label: 'Job',        color: '#4F46E5', icon: '💼' },
    academic:   { label: 'Academic',   color: '#059669', icon: '🎓' },
    government: { label: 'Government', color: '#dc2626', icon: '🏛️' },
    personal:   { label: 'Personal',   color: '#d97706', icon: '👤' },
    rental:     { label: 'Rental',     color: '#7c3aed', icon: '🏠' },
    general:    { label: 'General',    color: '#6b7280', icon: '📋' },
  },

  DOMAIN_CATEGORY_MAP: [
    { pattern: /\.gov\b|\.nic\.in|\.gob\b|\.govt\b/i,                     category: 'government' },
    { pattern: /\.edu\b|\.ac\.\w+|university|college|school|admission/i,   category: 'academic' },
    { pattern: /rent|lease|housing|zillow|trulia|apartments|realestate/i,   category: 'rental' },
    { pattern: /linkedin|indeed|glassdoor|monster|naukri|career|jobs|hiring|workday|greenhouse|lever\.co|bamboohr/i, category: 'job' },
  ],

  suggestCategory(url) {
    if (!url) return null;
    for (const rule of this.DOMAIN_CATEGORY_MAP) {
      if (rule.pattern.test(url)) return rule.category;
    }
    return null;
  },

  URL_FIELDS: new Set(['linkedin', 'github', 'website', 'medium', 'twitter', 'facebook', 'instagram', 'portfolio']),

  NON_URL_FIELDS: new Set(['name', 'first_name', 'last_name', 'middle_name', 'address', 'address_line_2', 'city', 'state', 'zip', 'country', 'phone', 'phone_number', 'phone_country_code', 'email', 'company', 'current_title', 'degree', 'university', 'salary', 'gpa']),

  URL_DOMAIN_MAP: {
    linkedin:  ['linkedin.com'],
    github:    ['github.com', 'github.io'],
    twitter:   ['twitter.com', 'x.com'],
    facebook:  ['facebook.com', 'fb.com'],
    instagram: ['instagram.com'],
    medium:    ['medium.com'],
  },

  MONTH_MAP: {
    'jan': '01', 'january': '01', 'feb': '02', 'february': '02',
    'mar': '03', 'march': '03', 'apr': '04', 'april': '04',
    'may': '05', 'jun': '06', 'june': '06', 'jul': '07', 'july': '07',
    'aug': '08', 'august': '08', 'sep': '09', 'sept': '09', 'september': '09',
    'oct': '10', 'october': '10', 'nov': '11', 'november': '11',
    'dec': '12', 'december': '12',
  },

  parseDateToMMYYYY(dateStr) {
    if (!dateStr) return null;
    const str = dateStr.trim().toLowerCase();
    if (str === 'present' || str === 'current') return null;

    const monthYear = str.match(/^([a-z]+)\s+(\d{4})$/);
    if (monthYear) {
      const month = this.MONTH_MAP[monthYear[1]];
      if (month) return month + '/' + monthYear[2];
    }

    const mmyyyy = str.match(/^(\d{1,2})\/(\d{4})$/);
    if (mmyyyy) return mmyyyy[1].padStart(2, '0') + '/' + mmyyyy[2];

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

    // Synthesize full name from parts if missing
    if (!data.name && data.first_name) {
      data.name = data.first_name + (data.last_name ? ' ' + data.last_name : '');
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

    // 2. Input type (skip url — semantic pipeline handles platform-specific URLs better)
    if (fieldInfo.type !== 'url') {
      const typeMatch = this.matchByInputType(fieldInfo, profileData);
      if (typeMatch) return typeMatch;
    }

    // 3. Try matching on LABEL + PLACEHOLDER only first (clean human-readable text)
    const primaryText = this.cleanText([fieldInfo.label, fieldInfo.placeholder, fieldInfo.ariaLabel].join(' '));
    const primaryTokens = this.tokenize(primaryText);

    if (primaryTokens.length > 0) {
      const labelMatch = this.runSemanticPipeline(primaryTokens, primaryText, profileData, fieldInfo);
      if (labelMatch && labelMatch.confidence >= 0.70) return labelMatch;
    }

    // 4. Fall back to including name/id attributes (often contain framework junk)
    const fullText = this.cleanText([fieldInfo.label, fieldInfo.placeholder, fieldInfo.ariaLabel, fieldInfo.name, fieldInfo.id].join(' '));
    const fullTokens = this.tokenize(fullText);

    const fullMatch = this.runSemanticPipeline(fullTokens, fullText, profileData, fieldInfo);
    if (fullMatch) return fullMatch;

    // 5. For type="url" fields with no specific match, fall back to generic website
    if (fieldInfo.type === 'url' && profileData['website']) {
      if (this.validateMatch('website', profileData['website'], fieldInfo)) {
        return {
          profileKey: 'website',
          value: profileData['website'],
          confidence: 0.70,
          method: 'type_fallback'
        };
      }
    }

    return null;
  },

  runSemanticPipeline(tokens, searchText, profileData, fieldInfo) {
    const semanticMatch = this.matchBySemantic(tokens, searchText, profileData, fieldInfo);
    if (semanticMatch) return semanticMatch;

    const tokenMatch = this.matchByTokenOverlap(tokens, profileData, fieldInfo);
    if (tokenMatch) return tokenMatch;

    const fuzzyMatch = this.matchByFuzzy(tokens, profileData, fieldInfo);
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
    return text.split(' ').filter(w => w.length > 1 && !this.STOPWORDS.has(w));
  },

  // === Validation: ensure value makes sense for the field ===

  validateMatch(profileKey, value, fieldInfo) {
    if (!value) return false;
    const strValue = String(value);
    const isURL = /^https?:\/\//.test(strValue) || /^www\./.test(strValue);

    // URL values should not go into non-URL fields
    if (isURL && this.NON_URL_FIELDS.has(profileKey)) return false;

    // Platform URL validation
    if (isURL) {
      const fieldText = this.cleanText(
        [fieldInfo.label, fieldInfo.placeholder, fieldInfo.ariaLabel, fieldInfo.name, fieldInfo.id]
        .filter(Boolean).join(' ')
      );

      // If field label mentions a specific platform, URL must belong to that platform
      for (const [platform, domains] of Object.entries(this.URL_DOMAIN_MAP)) {
        if (fieldText.includes(platform)) {
          if (!domains.some(d => strValue.toLowerCase().includes(d))) return false;
          break;
        }
      }

      // If profile key is a known platform, URL must match that platform's domain
      if (this.URL_DOMAIN_MAP[profileKey]) {
        const domains = this.URL_DOMAIN_MAP[profileKey];
        if (!domains.some(d => strValue.toLowerCase().includes(d))) return false;
      }
    }

    // Address fields should not get URL values
    if (isURL) {
      const searchText = this.cleanText([fieldInfo.label, fieldInfo.placeholder, fieldInfo.ariaLabel, fieldInfo.name, fieldInfo.id].join(' '));
      if (searchText.includes('address') || searchText.includes('street') || searchText.includes('city')) {
        return false;
      }
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
  matchBySemantic(tokens, searchText, profileData, fieldInfo) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [profileKey, phrases] of Object.entries(this.SEMANTIC_MAP)) {
      if (!(profileKey in profileData)) continue;

      for (const phrase of phrases) {
        const score = this.semanticScore(tokens, searchText, phrase);
        if (score > bestScore) {
          const value = profileData[profileKey];
          if (!this.validateMatch(profileKey, value, fieldInfo)) continue;

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
        if (!this.validateMatch(profileKey, value, fieldInfo)) continue;

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

    const phraseTokens = phrase.split(' ').filter(w => !this.STOPWORDS.has(w));
    if (phraseTokens.length === 0) return 0;

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
      // Partial phrase match: require meaningful overlap, scale down significantly
      if (matchCount < phraseTokens.length) {
        if (coverage < 0.5) return 0;
        return coverage * 0.4;
      }
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
  matchByTokenOverlap(tokens, profileData, fieldInfo) {
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
        // For short keys (1-2 tokens), require ALL tokens to match to avoid
        // "name" alone matching "company_name" or "father_name"
        const minScore = keyTokens.length <= 2 ? 0.99 : 0.6;
        if (score >= minScore) {
          const value = profileData[profileKey];
          if (!this.validateMatch(profileKey, value, fieldInfo)) continue;

          if (score > bestScore) {
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
    }

    return bestMatch && bestMatch.confidence >= 0.6 ? bestMatch : null;
  },

  // === Strategy 5: Fuzzy matching ===
  matchByFuzzy(tokens, profileData, fieldInfo) {
    let bestMatch = null;
    let bestAdjusted = 0;

    for (const profileKey of Object.keys(profileData)) {
      const keyNorm = profileKey.replace(/_/g, ' ');
      const keyTokens = keyNorm.split(' ').filter(t => t.length >= 2);
      if (keyTokens.length === 0) continue;

      let matchedCount = 0;
      let bestTokenSim = 0;

      for (const st of tokens) {
        if (st.length < 3) continue;

        for (const kt of keyTokens) {
          if (kt.length < 3) continue;

          const dist = this.levenshtein(st, kt);
          const maxLen = Math.max(st.length, kt.length);
          const similarity = 1 - dist / maxLen;

          if (similarity > 0.80) {
            matchedCount++;
            if (similarity > bestTokenSim) bestTokenSim = similarity;
          }
        }
      }

      if (matchedCount === 0) continue;

      // Scale similarity by coverage of the key
      const keyCoverage = Math.min(matchedCount, keyTokens.length) / keyTokens.length;
      const adjusted = bestTokenSim * keyCoverage;

      if (adjusted > bestAdjusted) {
        const value = profileData[profileKey];
        if (!this.validateMatch(profileKey, value, fieldInfo)) continue;

        bestAdjusted = adjusted;
        bestMatch = {
          profileKey,
          value,
          confidence: 0.35 + adjusted * 0.3,
          method: 'fuzzy'
        };
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

    for (const [key, value] of Object.entries(enriched)) {
      if (key.startsWith(prefix)) {
        const fieldName = key.substring(prefix.length);
        const mapped = this.SECTION_FIELD_MAP[fieldName];
        if (mapped) subset[mapped] = value;
        subset[key] = value;
      }
    }

    return subset;
  },

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
    const enriched = this.preprocessProfile(profileData, sections);

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

      // Section-aware matching
      if (field.sectionType && enriched._workEntries) {
        const sectionProfile = this.buildSectionProfile(enriched, field.sectionType, field.sectionIndex);

        if (Object.keys(sectionProfile).length > 0) {
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
    const keyUsage = new Map();

    for (const result of results) {
      if (!result.match) continue;
      const key = result.match.profileKey;
      if (!keyUsage.has(key)) keyUsage.set(key, []);
      keyUsage.get(key).push(result);
    }

    for (const [key, usages] of keyUsage) {
      if (usages.length <= 1) continue;

      usages.sort((a, b) => b.match.confidence - a.match.confidence);

      const best = usages[0];
      for (let i = 1; i < usages.length; i++) {
        const current = usages[i];
        if (current.match.confidence >= 0.80 && best.match.confidence >= 0.80) {
          continue;
        }

        const altKeys = Object.keys(enriched).filter(k => {
          const primaryUsers = keyUsage.get(k);
          if (!primaryUsers) return true;
          return primaryUsers.every(u => u.match.confidence < current.match.confidence);
        });

        const altMatch = this.findAlternativeMatch(current.field, altKeys, enriched);
        if (altMatch && altMatch.confidence >= 0.75) {
          current.match = altMatch;
          current.status = altMatch.confidence >= 0.75 ? 'matched' : 'ambiguous';
        } else {
          current.match = null;
          current.status = 'unmatched';
        }
      }
    }

    // Apply confidence threshold
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
