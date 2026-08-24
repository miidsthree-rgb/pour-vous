import { INITIAL_DATA } from '../data/initialData.js';
import { UNIFIED_STORAGE_KEY } from './cloudSyncService.js';

const STORAGE_KEYS = {
  SUBJECTS: UNIFIED_STORAGE_KEY,
  STATS: 'revise_cours_stats',
  STREAK: 'revise_cours_streak',
  SETTINGS: 'revise_cours_settings',
  ADMIN_PIN: 'revise_cours_admin_pin',
  ADMIN_PROTECTED: 'revise_cours_admin_protected'
};

export const getStoredSubjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading stored subjects:", err);
    return INITIAL_DATA;
  }
};

export const saveStoredSubjects = (subjects) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (err) {
    console.error("Error saving subjects:", err);
  }
};

export const getStoredStats = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) {
      const defaultStats = {
        totalQuizzes: 0,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        chapterScores: {},
        history: []
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(defaultStats));
      return defaultStats;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading stats:", err);
    return { totalQuizzes: 0, totalQuestionsAnswered: 0, correctAnswers: 0, chapterScores: {}, history: [] };
  }
};

export const recordQuizResult = ({ subjectId, chapterId, chapterTitle, score, totalQuestions, mode }) => {
  try {
    const stats = getStoredStats();
    stats.totalQuizzes += 1;
    stats.totalQuestionsAnswered += totalQuestions;
    stats.correctAnswers += score;

    if (!stats.chapterScores[chapterId]) {
      stats.chapterScores[chapterId] = { total: 0, correct: 0, lastScore: 0, lastDate: null, attempts: 0 };
    }

    const prev = stats.chapterScores[chapterId];
    stats.chapterScores[chapterId] = {
      total: prev.total + totalQuestions,
      correct: prev.correct + score,
      lastScore: Math.round((score / totalQuestions) * 100),
      lastDate: new Date().toISOString(),
      attempts: prev.attempts + 1
    };

    stats.history.unshift({
      id: Date.now().toString(),
      subjectId,
      chapterId,
      chapterTitle,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      mode,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    });

    if (stats.history.length > 50) {
      stats.history = stats.history.slice(0, 50);
    }

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    updateStreak();

    return stats;
  } catch (err) {
    console.error("Error recording quiz result:", err);
  }
};

export const getStreak = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!data) return { current: 1, lastDate: new Date().toDateString() };
    return JSON.parse(data);
  } catch {
    return { current: 1, lastDate: new Date().toDateString() };
  }
};

const updateStreak = () => {
  try {
    const streak = getStreak();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (streak.lastDate === today) {
      return streak;
    } else if (streak.lastDate === yesterday) {
      streak.current += 1;
      streak.lastDate = today;
    } else {
      streak.current = 1;
      streak.lastDate = today;
    }

    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    return streak;
  } catch (err) {
    console.error("Error updating streak:", err);
  }
};

export const getAdminPin = () => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '2007';
};

export const setAdminPin = (pin) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
};

export const isAdminProtected = () => {
  const val = localStorage.getItem(STORAGE_KEYS.ADMIN_PROTECTED);
  return val !== 'false'; // default true
};

export const setAdminProtected = (isProtected) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PROTECTED, isProtected ? 'true' : 'false');
};

export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.STREAK);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_PIN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_PROTECTED);
  return getStoredSubjects();
};
