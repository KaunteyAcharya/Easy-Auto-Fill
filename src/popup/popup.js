(function() {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let activeProfile = null;
  let allProfiles = [];
  let matchResults = [];
  let confidenceThreshold = 0.60;
  let pendingFile = null;
  let suggestedCategory = null;
  let confirmedSensitiveFields = new Set();
  let dropdownOpen = false;

  // === Initialization ===

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    await loadTheme();
    bindEvents();
    await loadSettings();
    await loadProfiles();
    await checkAutoSuggest();
    await detectCurrentPageFields();
  }

  let currentTheme = 'light';

  // === Theme ===

  async function loadTheme() {
    const response = await sendToBackground({ action: 'getSetting', key: 'theme' });
    currentTheme = response.value || 'light';
    applyTheme(currentTheme);
    updateThemeIcon();
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function updateThemeIcon() {
    const sunIcon = $('#themeIconSun');
    const moonIcon = $('#themeIconMoon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = currentTheme === 'dark' ? 'none' : '';
      moonIcon.style.display = currentTheme === 'dark' ? '' : 'none';
    }
  }

  async function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    updateThemeIcon();
    await sendToBackground({ action: 'setSetting', key: 'theme', value: currentTheme });
  }

  async function loadSettings() {
    const response = await sendToBackground({ action: 'getSetting', key: 'confidenceThreshold' });
    if (response.value !== null && response.value !== undefined) {
      confidenceThreshold = response.value;
    }
    const slider = $('#thresholdSlider');
    if (slider) {
      slider.value = Math.round(confidenceThreshold * 100);
      $('#thresholdValue').textContent = Math.round(confidenceThreshold * 100) + '%';
    }
  }

  function bindEvents() {
    $('#fileInputEmpty').addEventListener('change', handleFileSelect);
    $('#fileInputMain').addEventListener('change', handleFileSelect);
    $('#fillBtn').addEventListener('click', handleFillAll);
    $('#previewBtn').addEventListener('click', handlePreview);
    $('#clearBtn').addEventListener('click', handleClear);
    $('#exportBtn').addEventListener('click', handleExport);
    $('#suggestDismissBtn').addEventListener('click', dismissSuggest);
    $('#suggestUseBtn').addEventListener('click', applySuggest);

    const menuBtn = $('#menuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', handleExport);
    }

    // Theme toggle button
    const themeBtn = $('#themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    const slider = $('#thresholdSlider');
    if (slider) {
      slider.addEventListener('input', function() {
        const val = parseInt(this.value, 10);
        $('#thresholdValue').textContent = val + '%';
      });
      slider.addEventListener('change', async function() {
        confidenceThreshold = parseInt(this.value, 10) / 100;
        await sendToBackground({ action: 'setSetting', key: 'confidenceThreshold', value: confidenceThreshold });
        await detectCurrentPageFields();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (dropdownOpen && !e.target.closest('.profile-dropdown')) {
        dropdownOpen = false;
        renderProfileDropdown();
      }
    });
  }

  // === Auto-Suggest ===

  async function checkAutoSuggest() {
    try {
      const tab = await getActiveTab();
      if (!tab || !tab.url) return;

      const category = EasyAutoFill.FieldMatcher.suggestCategory(tab.url);
      if (!category) { hideSection('autoSuggest'); return; }

      suggestedCategory = category;
      const catInfo = EasyAutoFill.FieldMatcher.PROFILE_CATEGORIES[category];

      if (activeProfile && activeProfile.category === category) { hideSection('autoSuggest'); return; }

      const matchingProfile = allProfiles.find(p => p.category === category);
      if (!matchingProfile) { hideSection('autoSuggest'); return; }

      $('#suggestCategory').textContent = catInfo.label;
      showSection('autoSuggest');
    } catch (e) {
      hideSection('autoSuggest');
    }
  }

  async function applySuggest() {
    if (!suggestedCategory) return;
    const matchingProfile = allProfiles.find(p => p.category === suggestedCategory);
    if (matchingProfile) {
      await sendToBackground({ action: 'setActiveProfile', id: matchingProfile.id });
      activeProfile = matchingProfile;
      await loadProfiles();
      await detectCurrentPageFields();
    }
    hideSection('autoSuggest');
  }

  function dismissSuggest() {
    hideSection('autoSuggest');
  }

  // === Profile Management ===

  async function loadProfiles() {
    const response = await sendToBackground({ action: 'getAllProfiles' });
    allProfiles = response.profiles || [];

    if (allProfiles.length === 0) {
      showSection('emptyState');
      hideSection('profileSection');
      hideSection('confidenceSection');
      hideSection('fieldsSection');
      hideSection('actionsSection');
      return;
    }

    hideSection('emptyState');
    showSection('profileSection');
    activeProfile = allProfiles.find(p => p.isActive) || allProfiles[0];
    renderProfileDropdown();
  }

  function renderProfileDropdown() {
    const container = $('#profileDropdown');
    container.innerHTML = '';

    if (!activeProfile) return;

    const category = activeProfile.category || 'general';
    const catInfo = EasyAutoFill.FieldMatcher.PROFILE_CATEGORIES[category] || EasyAutoFill.FieldMatcher.PROFILE_CATEGORIES.general;
    const fieldCount = Object.keys(activeProfile.data || {}).filter(k => !k.startsWith('_')).length;

    // Active profile row
    const activeRow = document.createElement('div');
    activeRow.className = 'profile-active';

    const info = document.createElement('div');
    info.className = 'profile-active-info';

    const name = document.createElement('div');
    name.className = 'profile-active-name';
    name.textContent = activeProfile.name || activeProfile.sourceFile || 'Untitled';
    info.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'profile-active-meta';
    meta.textContent = catInfo.label + ' · ' + fieldCount + ' fields';
    info.appendChild(meta);

    activeRow.appendChild(info);

    // Chevron (dropdown indicator)
    if (allProfiles.length > 1) {
      const chevron = document.createElement('span');
      chevron.className = 'profile-chevron' + (dropdownOpen ? ' open' : '');
      chevron.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>';
      activeRow.appendChild(chevron);

      activeRow.style.cursor = 'pointer';
      activeRow.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownOpen = !dropdownOpen;
        renderProfileDropdown();
      });
    }

    container.appendChild(activeRow);

    // Dropdown list (only when open and multiple profiles)
    if (dropdownOpen && allProfiles.length > 1) {
      const list = document.createElement('div');
      list.className = 'profile-list';

      for (const profile of allProfiles) {
        if (profile.id === activeProfile.id) continue;

        const item = document.createElement('div');
        item.className = 'profile-list-item';

        const pCat = profile.category || 'general';
        const pCatInfo = EasyAutoFill.FieldMatcher.PROFILE_CATEGORIES[pCat] || EasyAutoFill.FieldMatcher.PROFILE_CATEGORIES.general;
        const pFieldCount = Object.keys(profile.data || {}).filter(k => !k.startsWith('_')).length;

        const itemInfo = document.createElement('div');
        itemInfo.className = 'profile-list-item-info';

        const itemName = document.createElement('div');
        itemName.className = 'profile-list-item-name';
        itemName.textContent = profile.name || profile.sourceFile || 'Untitled';
        itemInfo.appendChild(itemName);

        const itemMeta = document.createElement('div');
        itemMeta.className = 'profile-list-item-meta';
        itemMeta.textContent = pCatInfo.label + ' · ' + pFieldCount + ' fields';
        itemInfo.appendChild(itemMeta);

        item.appendChild(itemInfo);

        // Delete button
        const del = document.createElement('button');
        del.className = 'profile-list-item-delete';
        del.title = 'Delete';
        del.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          handleDeleteProfile(profile);
        });
        item.appendChild(del);

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdownOpen = false;
          handleProfileSwitch(profile.id);
        });

        list.appendChild(item);
      }

      container.appendChild(list);
    }
  }

  // === File Upload with Category Selection ===

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';
    pendingFile = file;
    showCategoryPicker();
  }

  function showCategoryPicker() {
    const container = $('#categoryChips');
    container.innerHTML = '';

    const categories = EasyAutoFill.FieldMatcher.PROFILE_CATEGORIES;
    let selectedCategory = suggestedCategory || 'general';

    for (const [key, catInfo] of Object.entries(categories)) {
      const chip = document.createElement('button');
      chip.className = 'category-chip' + (key === selectedCategory ? ' selected' : '');

      chip.appendChild(document.createTextNode(catInfo.label));

      chip.addEventListener('click', () => {
        container.querySelectorAll('.category-chip').forEach(c => {
          c.classList.remove('selected');
        });
        chip.classList.add('selected');
        selectedCategory = key;
      });

      container.appendChild(chip);
    }

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-sm btn-primary';
    confirmBtn.textContent = 'Upload';
    confirmBtn.style.marginLeft = 'auto';
    confirmBtn.addEventListener('click', () => {
      hideSection('categoryPicker');
      handleFileUpload(pendingFile, selectedCategory);
      pendingFile = null;
    });
    container.appendChild(confirmBtn);

    showSection('categoryPicker');
  }

  async function handleFileUpload(file, category) {
    if (!file) return;
    showLoading(true);
    hideStatus();

    try {
      const parsed = await EasyAutoFill.FileParser.parseFile(file);
      const profile = {
        name: parsed.data._profileName || file.name.replace(/\.[^.]+$/, ''),
        data: parsed.data,
        sections: parsed.sections,
        raw: parsed.raw,
        sourceFile: parsed.sourceFile,
        category: category || 'general',
        isActive: false
      };

      const response = await sendToBackground({ action: 'saveProfile', profile });
      if (response.error) throw new Error(response.error);

      const catLabel = EasyAutoFill.FieldMatcher.PROFILE_CATEGORIES[category]?.label || 'General';
      showStatus('"' + profile.name + '" uploaded as ' + catLabel, 'success');
      await loadProfiles();
      await detectCurrentPageFields();
    } catch (err) {
      showStatus('Error: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  async function handleProfileSwitch(id) {
    await sendToBackground({ action: 'setActiveProfile', id });
    const response = await sendToBackground({ action: 'getProfile', id });
    activeProfile = response.profile;
    renderProfileDropdown();
    await detectCurrentPageFields();
  }

  async function handleDeleteProfile(profile) {
    if (!confirm('Delete "' + (profile.name || 'this profile') + '"?')) return;
    await sendToBackground({ action: 'deleteProfile', id: profile.id });
    activeProfile = null;
    await loadProfiles();
    if (!activeProfile) {
      hideSection('fieldsSection');
      hideSection('actionsSection');
    } else {
      await detectCurrentPageFields();
    }
  }

  // === Field Detection ===

  async function detectCurrentPageFields() {
    if (!activeProfile) {
      hideSection('confidenceSection');
      hideSection('fieldsSection');
      hideSection('actionsSection');
      return;
    }
    showSection('confidenceSection');

    try {
      const tab = await getActiveTab();
      if (!tab || tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
        showNoFields('Cannot access this page.');
        return;
      }

      const domain = new URL(tab.url).hostname;
      const mappingResponse = await sendToBackground({ action: 'getDomainMapping', domain });
      const domainOverrides = mappingResponse.mapping || {};

      const enrichedData = EasyAutoFill.FieldMatcher.preprocessProfile(activeProfile.data, activeProfile.sections);
      enrichedData._domainOverrides = domainOverrides;
      enrichedData._confidenceThreshold = confidenceThreshold;

      const response = await sendToContentScript(tab.id, {
        action: 'previewFill',
        profileData: enrichedData,
        sections: activeProfile.sections
      });

      if (!response || response.error) {
        showNoFields('Refresh this page to enable field detection.');
        return;
      }

      matchResults = response.matches || [];
      renderFields(matchResults);
    } catch (err) {
      showNoFields('Refresh this page to enable field detection.');
    }
  }

  function renderFields(matches) {
    showSection('fieldsSection');
    const list = $('#fieldsList');
    const noFields = $('#noFields');

    if (matches.length === 0) {
      list.style.display = 'none';
      noFields.style.display = 'block';
      hideSection('actionsSection');
      $('#fieldCount').textContent = '0 found';
      return;
    }

    list.style.display = 'flex';
    noFields.style.display = 'none';
    showSection('actionsSection');
    $('#fieldCount').textContent = matches.length + ' found';

    const fillable = matches.filter(r => r.match).length;
    $('#fillBtnText').textContent = 'Auto-Fill ' + fillable + ' Field' + (fillable !== 1 ? 's' : '');

    list.innerHTML = '';
    for (const result of matches) {
      list.appendChild(createFieldItem(result));
    }
  }

  function createFieldItem(result) {
    const div = document.createElement('div');
    div.className = 'field-item';

    // Status circle — dark bg + white check for matched, grey circle + dash for unmatched
    const statusIcon = document.createElement('div');
    statusIcon.className = 'field-status ' + result.status;
    if (result.status === 'matched') {
      statusIcon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>';
    } else if (result.status === 'ambiguous') {
      statusIcon.textContent = '?';
    } else {
      statusIcon.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--status-off-stroke)" stroke-width="3" stroke-dasharray="4 4"><line x1="6" y1="12" x2="18" y2="12"/></svg>';
    }
    div.appendChild(statusIcon);

    // Field info
    const info = document.createElement('div');
    info.className = 'field-info';

    const name = document.createElement('div');
    name.className = 'field-name';
    name.textContent = result.field.label || result.field.name || result.field.id || 'Unknown';
    info.appendChild(name);

    const value = document.createElement('div');
    value.className = 'field-value';
    if (result.match) {
      const v = String(result.match.value);
      value.textContent = v.length > 35 ? v.substring(0, 35) + '…' : v;
    } else {
      value.textContent = 'No match found';
      value.style.color = 'var(--text-tertiary)';
    }
    info.appendChild(value);
    div.appendChild(info);

    // Right side: confidence + sensitive + chevron
    const right = document.createElement('div');
    right.className = 'field-right';

    if (result.match) {
      if (EasyAutoFill.FieldMatcher.isSensitiveField(result.match.profileKey)) {
        const sens = document.createElement('span');
        sens.className = 'field-sensitive';
        sens.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
        sens.title = 'Sensitive — requires confirmation';
        right.appendChild(sens);
      }

      const conf = document.createElement('span');
      const confLevel = result.match.confidence >= 0.8 ? 'high'
        : result.match.confidence >= 0.6 ? 'medium' : 'low';
      conf.className = 'field-confidence ' + confLevel;
      conf.textContent = Math.round(result.match.confidence * 100) + '%';
      right.appendChild(conf);
    } else {
      const dash = document.createElement('span');
      dash.className = 'field-confidence';
      dash.textContent = '—';
      right.appendChild(dash);
    }

    const chevron = document.createElement('span');
    chevron.className = 'field-chevron';
    chevron.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>';
    right.appendChild(chevron);

    div.appendChild(right);

    div.addEventListener('click', () => showCorrectionMenu(div, result));
    return div;
  }

  async function showCorrectionMenu(div, result) {
    const existing = document.querySelector('.eaf-correction-menu');
    if (existing) existing.remove();
    if (!activeProfile) return;

    const menu = document.createElement('div');
    menu.className = 'eaf-correction-menu';

    const title = document.createElement('div');
    title.className = 'correction-title';
    title.textContent = 'Assign profile field:';
    menu.appendChild(title);

    const enrichedData = EasyAutoFill.FieldMatcher.preprocessProfile(activeProfile.data, activeProfile.sections);
    const keys = Object.keys(enrichedData).filter(k => !k.startsWith('_'));

    const currentKey = result.match ? result.match.profileKey : '';
    keys.sort((a, b) => {
      if (a === currentKey) return -1;
      if (b === currentKey) return 1;
      return a.localeCompare(b);
    });

    const select = document.createElement('select');
    select.className = 'correction-select';

    const noneOpt = document.createElement('option');
    noneOpt.value = '';
    noneOpt.textContent = '— Skip this field —';
    select.appendChild(noneOpt);

    for (const key of keys) {
      const opt = document.createElement('option');
      opt.value = key;
      const val = String(enrichedData[key]);
      const label = key.replace(/_/g, ' ');
      opt.textContent = label + ': ' + (val.length > 30 ? val.substring(0, 30) + '…' : val);
      if (key === currentKey) opt.selected = true;
      select.appendChild(opt);
    }
    menu.appendChild(select);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-sm btn-primary';
    saveBtn.textContent = 'Save for this site';
    saveBtn.addEventListener('click', async () => {
      const fieldId = result.field.id || result.field.name || result.field.xpath;
      const selectedKey = select.value;
      const tab = await getActiveTab();
      if (tab) {
        const domain = new URL(tab.url).hostname;
        const mappingResponse = await sendToBackground({ action: 'getDomainMapping', domain });
        const mapping = mappingResponse.mapping || {};
        if (selectedKey) { mapping[fieldId] = selectedKey; } else { delete mapping[fieldId]; }
        await sendToBackground({ action: 'saveDomainMapping', domain, mapping });
        showStatus('Correction saved for ' + domain, 'success');
      }
      menu.remove();
      await detectCurrentPageFields();
    });
    menu.appendChild(saveBtn);

    div.parentElement.insertBefore(menu, div.nextSibling);
  }

  function showNoFields(message) {
    showSection('fieldsSection');
    $('#fieldsList').style.display = 'none';
    const noFields = $('#noFields');
    noFields.style.display = 'block';
    noFields.querySelector('p').textContent = message;
    hideSection('actionsSection');
    $('#fieldCount').textContent = '0 found';
  }

  // === Fill Actions ===

  async function handleFillAll() {
    if (!activeProfile) return;
    const tab = await getActiveTab();
    if (!tab) return;

    const sensitiveMatches = matchResults.filter(r =>
      r.match && EasyAutoFill.FieldMatcher.isSensitiveField(r.match.profileKey) &&
      !confirmedSensitiveFields.has(r.match.profileKey)
    );

    if (sensitiveMatches.length > 0) {
      const fieldNames = sensitiveMatches.map(r => r.match.profileKey.replace(/_/g, ' '));
      const confirmed = confirm(
        'Sensitive fields detected:\n\n' +
        fieldNames.map(n => '  • ' + n).join('\n') +
        '\n\nFill these fields? Your data stays local.'
      );
      if (!confirmed) {
        showStatus('Skipped sensitive fields', 'info');
        await fillWithFilter(tab, (result) => !result.match || !EasyAutoFill.FieldMatcher.isSensitiveField(result.match.profileKey));
        return;
      }
      for (const r of sensitiveMatches) confirmedSensitiveFields.add(r.match.profileKey);
    }

    showLoading(true);
    try {
      const domain = new URL(tab.url).hostname;
      const mappingResponse = await sendToBackground({ action: 'getDomainMapping', domain });
      const domainOverrides = mappingResponse.mapping || {};

      const enrichedData = EasyAutoFill.FieldMatcher.preprocessProfile(activeProfile.data, activeProfile.sections);
      enrichedData._domainOverrides = domainOverrides;
      enrichedData._confidenceThreshold = confidenceThreshold;

      const response = await sendToContentScript(tab.id, {
        action: 'fillFields',
        profileData: enrichedData,
        sections: activeProfile.sections
      });

      if (response.error) throw new Error(response.error);
      showStatus(response.filled + ' of ' + response.total + ' fields filled', 'success');
    } catch (err) {
      showStatus('Fill failed: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  async function fillWithFilter(tab, filterFn) {
    showLoading(true);
    try {
      const domain = new URL(tab.url).hostname;
      const mappingResponse = await sendToBackground({ action: 'getDomainMapping', domain });
      const enrichedData = EasyAutoFill.FieldMatcher.preprocessProfile(activeProfile.data, activeProfile.sections);
      enrichedData._domainOverrides = mappingResponse.mapping || {};
      enrichedData._confidenceThreshold = confidenceThreshold;

      const skipFields = new Set();
      for (const result of matchResults) {
        if (!filterFn(result)) {
          skipFields.add(result.field.id || result.field.name || result.field.xpath);
        }
      }
      enrichedData._skipFields = Array.from(skipFields);

      const response = await sendToContentScript(tab.id, {
        action: 'fillFields',
        profileData: enrichedData,
        sections: activeProfile.sections
      });

      if (response.error) throw new Error(response.error);
      showStatus(response.filled + ' of ' + response.total + ' fields filled', 'success');
    } catch (err) {
      showStatus('Fill failed: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  async function handlePreview() {
    if (!activeProfile) return;
    const tab = await getActiveTab();
    if (!tab) return;

    const enrichedData = EasyAutoFill.FieldMatcher.preprocessProfile(activeProfile.data, activeProfile.sections);
    await sendToContentScript(tab.id, {
      action: 'previewFill',
      profileData: enrichedData,
      sections: activeProfile.sections
    });
    showStatus('Fields highlighted on page', 'info');
  }

  async function handleClear() {
    const tab = await getActiveTab();
    if (!tab) return;
    await sendToContentScript(tab.id, { action: 'clearHighlights' });
    hideStatus();
  }

  async function handleExport() {
    const response = await sendToBackground({ action: 'exportData' });
    if (response.data) {
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'easyautofill-profiles-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showStatus('Profiles exported!', 'success');
    }
  }

  // === Helpers ===

  function sendToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => resolve(response || {}));
    });
  }

  function sendToContentScript(tabId, message) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) resolve({ error: chrome.runtime.lastError.message });
        else resolve(response || {});
      });
    });
  }

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  function showSection(id) { const el = document.getElementById(id); if (el) el.style.display = ''; }
  function hideSection(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  function showLoading(visible) { $('#loading').style.display = visible ? 'flex' : 'none'; }

  function showStatus(message, type) {
    const section = $('#statusSection');
    const msg = $('#statusMessage');
    section.style.display = '';
    msg.textContent = message;
    msg.className = 'status-message ' + type;
    if (type === 'success' || type === 'info') setTimeout(hideStatus, 4000);
  }

  function hideStatus() { $('#statusSection').style.display = 'none'; }

})();
