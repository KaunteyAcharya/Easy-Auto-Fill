(function() {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let activeProfile = null;
  let detectedFields = [];
  let matchResults = [];

  // === Initialization ===

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    bindEvents();
    await loadProfiles();
    await detectCurrentPageFields();
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
    $('#settingsBtn').addEventListener('click', handleSettings);
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

      const response = await sendToContentScript(tab.id, {
        action: 'previewFill',
        profileData: activeProfile.data
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

    return div;
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
      const response = await sendToContentScript(tab.id, {
        action: 'fillFields',
        profileData: activeProfile.data
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

    await sendToContentScript(tab.id, {
      action: 'previewFill',
      profileData: activeProfile.data
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

  function handleSettings() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
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
