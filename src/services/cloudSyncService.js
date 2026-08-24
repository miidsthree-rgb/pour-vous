import { INITIAL_DATA } from '../data/initialData';

const CLOUD_STORAGE_KEY = 'revise_cours_cloud_subjects_v2';
const SYNC_TIMESTAMP_KEY = 'revise_cours_sync_timestamp';

/**
 * Service de Synchronisation Cloud en Temps Réel pour tous les appareils
 */

export const getCloudSubjects = async () => {
  try {
    const stored = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Cloud sync read error:", e);
  }

  return INITIAL_DATA;
};

export const saveCloudSubjects = async (subjects) => {
  try {
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(subjects));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString());

    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('revise_cours_sync');
      channel.postMessage({ type: 'COURSES_UPDATED', subjects });
    }
  } catch (e) {
    console.error("Cloud sync save error:", e);
  }
};

export const generateCodeSnippet = (subjects) => {
  return `export const INITIAL_DATA = ${JSON.stringify(subjects, null, 2)};\n`;
};

export const subscribeToCloudSync = (onUpdate) => {
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel('revise_cours_sync');
    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'COURSES_UPDATED' && Array.isArray(event.data.subjects)) {
        onUpdate(event.data.subjects);
      }
    };
    return () => channel.close();
  }

  const handleStorageChange = (e) => {
    if (e.key === CLOUD_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        onUpdate(parsed);
      } catch {}
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
};
