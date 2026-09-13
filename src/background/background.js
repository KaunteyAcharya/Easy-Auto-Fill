import * as DB from './db-manager.js';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('EasyAutoFill installed');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => {
    console.error('EasyAutoFill background error:', err);
    sendResponse({ error: err.message });
  });
  return true;
});

async function handleMessage(message) {
  switch (message.action) {

    case 'saveProfile': {
      const profile = await DB.saveProfile(message.profile);
      const all = await DB.getAllProfiles();
      if (all.length === 1) {
        await DB.setActiveProfile(profile.id);
        profile.isActive = true;
      }
      return { success: true, profile };
    }

    case 'getProfile':
      return { profile: await DB.getProfile(message.id) };

    case 'getAllProfiles':
      return { profiles: await DB.getAllProfiles() };

    case 'deleteProfile': {
      await DB.deleteProfile(message.id);
      const remaining = await DB.getAllProfiles();
      if (remaining.length > 0 && !remaining.some(p => p.isActive)) {
        await DB.setActiveProfile(remaining[0].id);
      }
      return { success: true };
    }

    case 'getActiveProfile':
      return { profile: await DB.getActiveProfile() };

    case 'setActiveProfile': {
      await DB.setActiveProfile(message.id);
      return { success: true };
    }

    case 'updateProfile': {
      const existing = await DB.getProfile(message.profile.id);
      if (!existing) return { error: 'Profile not found' };
      const updated = { ...existing, ...message.profile };
      const saved = await DB.saveProfile(updated);
      return { success: true, profile: saved };
    }

    case 'updateProfileField': {
      const prof = await DB.getProfile(message.id);
      if (!prof) return { error: 'Profile not found' };
      prof.data[message.fieldKey] = message.fieldValue;
      const saved = await DB.saveProfile(prof);
      return { success: true, profile: saved };
    }

    case 'saveDomainMapping': {
      await DB.saveDomainMapping(message.domain, message.mapping);
      return { success: true };
    }

    case 'getDomainMapping': {
      const result = await DB.getDomainMapping(message.domain);
      return { mapping: result ? result.mapping : null };
    }

    case 'getSetting': {
      const value = await DB.getSetting(message.key);
      return { value };
    }

    case 'setSetting': {
      await DB.setSetting(message.key, message.value);
      return { success: true };
    }

    case 'exportData': {
      const profiles = await DB.getAllProfiles();
      return { data: JSON.stringify({ profiles, exportedAt: Date.now() }, null, 2) };
    }

    case 'importData': {
      const imported = JSON.parse(message.data);
      if (imported.profiles) {
        for (const profile of imported.profiles) {
          await DB.saveProfile(profile);
        }
      }
      return { success: true, count: imported.profiles?.length || 0 };
    }

    default:
      return { error: 'Unknown action: ' + message.action };
  }
}
