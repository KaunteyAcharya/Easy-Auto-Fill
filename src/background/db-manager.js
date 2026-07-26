const DB_NAME = 'EasyAutoFillDB';
const DB_VERSION = 1;

const STORES = {
  PROFILES: 'profiles',
  SETTINGS: 'settings',
  MAPPINGS: 'domainMappings'
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
        profileStore.createIndex('name', 'name', { unique: false });
        profileStore.createIndex('isActive', 'isActive', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.MAPPINGS)) {
        db.createObjectStore(STORES.MAPPINGS, { keyPath: 'domain' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(storeName, mode = 'readonly') {
  return openDB().then(db => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    return { db, tx, store };
  });
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProfile(profile) {
  const { store } = await transaction(STORES.PROFILES, 'readwrite');

  if (!profile.id) {
    profile.id = crypto.randomUUID();
  }
  profile.updatedAt = Date.now();
  if (!profile.createdAt) {
    profile.createdAt = Date.now();
  }
  profile.version = (profile.version || 0) + 1;

  await promisifyRequest(store.put(profile));
  return profile;
}

export async function getProfile(id) {
  const { store } = await transaction(STORES.PROFILES);
  return promisifyRequest(store.get(id));
}

export async function getAllProfiles() {
  const { store } = await transaction(STORES.PROFILES);
  return promisifyRequest(store.getAll());
}

export async function deleteProfile(id) {
  const { store } = await transaction(STORES.PROFILES, 'readwrite');
  return promisifyRequest(store.delete(id));
}

export async function getActiveProfile() {
  const profiles = await getAllProfiles();
  return profiles.find(p => p.isActive) || profiles[0] || null;
}

export async function setActiveProfile(id) {
  const { db } = await transaction(STORES.PROFILES);
  const tx = db.transaction(STORES.PROFILES, 'readwrite');
  const store = tx.objectStore(STORES.PROFILES);

  const all = await promisifyRequest(store.getAll());
  for (const profile of all) {
    profile.isActive = profile.id === id;
    store.put(profile);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveDomainMapping(domain, mapping) {
  const { store } = await transaction(STORES.MAPPINGS, 'readwrite');
  return promisifyRequest(store.put({ domain, mapping, updatedAt: Date.now() }));
}

export async function getDomainMapping(domain) {
  const { store } = await transaction(STORES.MAPPINGS);
  return promisifyRequest(store.get(domain));
}

export async function getSetting(key) {
  const { store } = await transaction(STORES.SETTINGS);
  const result = await promisifyRequest(store.get(key));
  return result ? result.value : null;
}

export async function setSetting(key, value) {
  const { store } = await transaction(STORES.SETTINGS, 'readwrite');
  return promisifyRequest(store.put({ key, value }));
}
