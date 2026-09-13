(function() {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let activeProfile = null;
  let detectedFields = [];
  let matchResults = [];
  let confidenceThreshold = 0.60; // Default minimum confidence

  // === Initialization ===

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    bindEvents();
    await loadSettings();
    await loadProfiles();
    await detectCurrentPageFields();
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
    $('#fileInputEmpty').addEventListener('change', handleFileUpload);
    $('#fileInputMain').addEventListener('change', handleFileUpload);
    $('#profileSelect').addEventListener('change', handleProfileSwitch);
    $('#deleteProfileBtn').addEventListener('click', handleDeleteProfile);
    $('#fillBtn').addEventListener('click', handleFillAll);
    $('#previewBtn').addEventListener('click', handlePreview);
    $('#clearBtn').addEventListener('click', handleClear);
    $('#exportBtn').addEventListener('click', handleExport);
    $('#settingsBtn').addEventListener('click', toggleSettings);

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
  }

  // === Profile Management ===

  async function loadProfiles() {
    const response = await sendToBackground({ action: 'getAllProfiles' });
    const profiles = response.profiles || [];

    if (profiles.length === 0) {
      showSection('emptyState');
      hideSection('profileSection');
      hideSection('fieldsSection');
      hideSection('actionsSection');
      return;
    }

    hideSection('emptyState');
    showSection('profileSection');

    const select = $('#profileSelect');
    select.innerHTML = '';
    for (const profile of profiles) {
      const opt = document.createElement('option');
      opt.value = profile.id;
      opt.textContent = profile.name || profile.sourceFile || 'Untitled';
      if (profile.isActive) opt.selected = true;
      select.appendChild(opt);
    }

    activeProfile = profiles.find(p => p.isActive) || profiles[0];
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0];
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
        isActive: false
      };

      const response = await sendToBackground({ action: 'saveProfile', profile });

      if (response.error) throw new Error(response.error);

      showStatus('Profile "' + profile.name + '" uploaded successfully!', 'success');
      await loadProfiles();
      await detectCurrentPageFields();
    } catch (err) {
      showStatus('Error: ' + err.message, 'error');
    } finally {
      showLoading(false);
      event.target.value = '';
    }
  }

  async function handleProfileSwitch() {
    const id = $('#profileSelect').value;
    await sendToBackground({ action: 'setActiveProfile', id });
    const response = await sendToBackground({ action: 'getProfile', id });
    activeProfile = response.profile;
    await detectCurrentPageFields();
  }

  async function handleDeleteProfile() {
    if (!activeProfile) return;
    const name = activeProfile.name || 'this profile';
    if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;

    await sendToBackground({ action: 'deleteProfile', id: activeProfile.id });
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
      hideSection('fieldsSection');
      hideSection('actionsSection');
      return;
    }

    try {
      const tab = await getActiveTab();
      if (!tab || tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
        showNoFields('Cannot access this page.');
        return;
      }

      // Load domain-specific overrides
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
      $('#fieldCount').textContent = '0';
      return;
    }

    list.style.display = 'flex';
    noFields.style.display = 'none';
    showSection('actionsSection');
    $('#fieldCount').textContent = String(matches.length);

    list.innerHTML = '';
    for (const result of matches) {
      const item = createFieldItem(result);
      list.appendChild(item);
    }
  }

  function createFieldItem(result) {
    const div = document.createElement('div');
    div.className = 'field-item';
    div.title = 'Click to correct this match';
    div.style.cursor = 'pointer';

    const statusIcon = document.createElement('div');
    statusIcon.className = 'field-status ' + result.status;
    statusIcon.textContent = result.status === 'matched' ? '✓'
      : result.status === 'ambiguous' ? '?' : '✗';

    const name = document.createElement('span');
    name.className = 'field-name';
    name.textContent = result.field.label || result.field.name || result.field.id || 'Unknown';
    name.title = name.textContent;

    div.appendChild(statusIcon);
    div.appendChild(name);

    if (result.match) {
      const value = document.createElement('span');
      value.className = 'field-value';
      const v = String(result.match.value);
      value.textContent = v.length > 25 ? v.substring(0, 25) + '…' : v;
      value.title = v;
      div.appendChild(value);

      const conf = document.createElement('span');
      const confLevel = result.match.confidence >= 0.8 ? 'high'
        : result.match.confidence >= 0.6 ? 'medium' : 'low';
      conf.className = 'field-confidence ' + confLevel;
      conf.textContent = Math.round(result.match.confidence * 100) + '%';
      div.appendChild(conf);
    } else {
      const value = document.createElement('span');
      value.className = 'field-value';
      value.textContent = 'No match';
      value.style.color = '#dc2626';
      div.appendChild(value);
    }

    // Click to correct: show profile key selector
    div.addEventListener('click', () => showCorrectionMenu(div, result));

    return div;
  }

  async function showCorrectionMenu(div, result) {
    // Remove any existing correction menu
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

    // Sort by relevance — show current match first
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
      opt.textContent = key.replace(/_/g, ' ') + ': ' + (val.length > 30 ? val.substring(0, 30) + '…' : val);
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
        if (selectedKey) {
          mapping[fieldId] = selectedKey;
        } else {
          delete mapping[fieldId];
        }
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
    $('#fieldCount').textContent = '0';
  }

  // === Fill Actions ===

  async function handleFillAll() {
    if (!activeProfile) return;

    const tab = await getActiveTab();
    if (!tab) return;

    showLoading(true);

    try {
      // Load domain overrides
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

      const msg = response.filled + ' of ' + response.total + ' fields filled';
      showStatus(msg + (response.failed ? ' (' + response.failed + ' failed)' : ''), 'success');
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

  // === Export/Import ===

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

  function toggleSettings() {
    const panel = $('#settingsPanel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? '' : 'none';
    }
  }

  // === Helpers ===

  function sendToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || {});
      });
    });
  }

  function sendToContentScript(tabId, message) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ error: chrome.runtime.lastError.message });
        } else {
          resolve(response || {});
        }
      });
    });
  }

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  function showSection(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function hideSection(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  function showLoading(visible) {
    $('#loading').style.display = visible ? 'flex' : 'none';
  }

  function showStatus(message, type) {
    const section = $('#statusSection');
    const msg = $('#statusMessage');
    section.style.display = '';
    msg.textContent = message;
    msg.className = 'status-message ' + type;

    if (type === 'success' || type === 'info') {
      setTimeout(hideStatus, 4000);
    }
  }

  function hideStatus() {
    $('#statusSection').style.display = 'none';
  }

})();
