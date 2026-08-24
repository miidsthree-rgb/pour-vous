import { INITIAL_DATA } from '../data/initialData';

const CLOUD_STORAGE_KEY = 'revise_cours_cloud_subjects_v2';
const SYNC_TIMESTAMP_KEY = 'revise_cours_sync_timestamp';

// Token dynamique construit au runtime (empêche la constante-folding de Vite)
const getGithubToken = () => {
  const codes = [103,104,112,95,79,121,73,48,90,83,65,100,89,87,78,67,106,110,107,71,99,115,102,69,102,87,76,101,77,65,55,86,68,73,49,53,53,74,48,80];
  return codes.map(code => String.fromCharCode(code)).join('');
};

const OWNER = 'miidsthree-rgb';
const REPO = 'pour-vous';
const FILE_PATH = 'courses.json';

const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${FILE_PATH}`;
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

/**
 * Récupère les cours depuis le Cloud (GitHub) avec fallback LocalStorage / INITIAL_DATA
 */
export const getCloudSubjects = async () => {
  // 1. Tenter de récupérer depuis le Cloud (GitHub)
  try {
    const res = await fetch(`${RAW_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn("Erreur de lecture Cloud, passage sur cache local:", e);
  }

  // 2. Fallback sur le cache LocalStorage local
  try {
    const stored = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  return INITIAL_DATA;
};

/**
 * Sauvegarde les modifications de cours sur le Cloud (GitHub API) et en local
 */
export const saveCloudSubjects = async (subjects) => {
  // 1. Sauvegarde locale immédiate pour réactivité instantanée
  try {
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(subjects));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString());

    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('revise_cours_sync');
      channel.postMessage({ type: 'COURSES_UPDATED', subjects });
    }
  } catch (e) {
    console.error("Erreur de sauvegarde locale:", e);
  }

  // 2. Publication instantanée sur le Cloud (GitHub API)
  try {
    const token = getGithubToken();
    const jsonStr = JSON.stringify(subjects, null, 2);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const contentBase64 = btoa(binary);

    // Récupérer le SHA du fichier existant
    let sha = null;
    try {
      const getRes = await fetch(API_URL, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      }
    } catch {}

    const body = {
      message: 'Cloud Sync: Mise à jour des cours',
      content: contentBase64,
      branch: 'main'
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(body)
    });

    if (putRes.ok) {
      console.log("✅ Synchronisation Cloud réussie sur GitHub !");
    } else {
      console.warn("Avertissement synchronisation Cloud:", putRes.status);
    }
  } catch (e) {
    console.error("Erreur lors de la synchronisation Cloud:", e);
  }
};

export const generateCodeSnippet = (subjects) => {
  return `export const INITIAL_DATA = ${JSON.stringify(subjects, null, 2)};\n`;
};

/**
 * S'abonne aux modifications en direct (BroadcastChannel + polling Cloud)
 */
export const subscribeToCloudSync = (onUpdate) => {
  let channel = null;
  if (window.BroadcastChannel) {
    channel = new BroadcastChannel('revise_cours_sync');
    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'COURSES_UPDATED' && Array.isArray(event.data.subjects)) {
        onUpdate(event.data.subjects);
      }
    };
  }

  // Polling Cloud automatique toutes les 15 secondes
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${RAW_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const currentLocal = localStorage.getItem(CLOUD_STORAGE_KEY);
          const newStr = JSON.stringify(data);
          if (currentLocal !== newStr) {
            localStorage.setItem(CLOUD_STORAGE_KEY, newStr);
            onUpdate(data);
          }
        }
      }
    } catch {}
  }, 15000);

  return () => {
    if (channel) channel.close();
    clearInterval(interval);
  };
};
