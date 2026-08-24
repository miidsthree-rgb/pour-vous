import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SubjectSelector } from './components/SubjectSelector';
import { QuizEngine } from './components/QuizEngine';
import { FlashcardEngine } from './components/FlashcardEngine';
import { RevisionSheet } from './components/RevisionSheet';
import { AdminDashboard } from './components/AdminDashboard';
import { StatsDashboard } from './components/StatsDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { INITIAL_DATA } from './data/initialData';
import { 
  getStoredSubjects, saveStoredSubjects, getStoredStats, 
  recordQuizResult, getStreak, resetAllData, isAdminProtected 
} from './services/storageService';
import { getCloudSubjects, saveCloudSubjects, subscribeToCloudSync } from './services/cloudSyncService';

export function App() {
  const [activeTab, setActiveTab] = useState('revise'); // 'revise', 'fiches', 'admin', 'stats', 'quiz', 'flashcards'
  const [subjects, setSubjects] = useState(INITIAL_DATA);
  const [stats, setStats] = useState({ totalQuizzes: 0, totalQuestionsAnswered: 0, correctAnswers: 0, chapterScores: {}, history: [] });
  const [streak, setStreak] = useState({ current: 1 });

  // Security / Admin Lock state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Session Config
  const [activeSession, setActiveSession] = useState({ subject: null, chapter: null, mode: 'mcq' });

  useEffect(() => {
    // Initial Load from Cloud Sync / Local Cache
    const loadInitialData = async () => {
      try {
        const loaded = await getCloudSubjects();
        if (Array.isArray(loaded) && loaded.length > 0) {
          setSubjects(loaded);
        }
      } catch (err) {
        console.warn("Falling back to INITIAL_DATA on load:", err);
      }
      setStats(getStoredStats());
      setStreak(getStreak());
    };

    loadInitialData();

    // Subscribe to live updates across screens / devices / tabs
    const unsubscribe = subscribeToCloudSync((updatedSubjects) => {
      if (Array.isArray(updatedSubjects) && updatedSubjects.length > 0) {
        setSubjects(updatedSubjects);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectTab = (tabName) => {
    if (tabName === 'admin') {
      const protectedState = isAdminProtected();
      if (protectedState && !isAdminUnlocked) {
        setIsAuthModalOpen(true);
        return;
      }
    }
    setActiveTab(tabName);
  };

  const handleAuthSuccess = () => {
    setIsAdminUnlocked(true);
    setIsAuthModalOpen(false);
    setActiveTab('admin');
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    if (activeTab === 'admin') {
      setActiveTab('revise');
    }
  };

  const handleSaveSubjects = async (newSubjects) => {
    setSubjects(newSubjects);
    saveStoredSubjects(newSubjects);
    await saveCloudSubjects(newSubjects);
  };

  const handleStartRevision = ({ subject, chapter, mode }) => {
    setActiveSession({ subject, chapter, mode });
    if (mode === 'flashcards') {
      setActiveTab('flashcards');
    } else {
      setActiveTab('quiz');
    }
  };

  const handleFinishQuiz = (result) => {
    const updatedStats = recordQuizResult(result);
    if (updatedStats) setStats(updatedStats);
    setStreak(getStreak());
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        streak={streak}
        totalScore={stats.correctAnswers * 10}
        isAdminUnlocked={isAdminUnlocked}
        onLockAdmin={handleLockAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'revise' && (
          <SubjectSelector
            subjects={subjects}
            onStartRevision={handleStartRevision}
            onGoToAdmin={() => handleSelectTab('admin')}
          />
        )}

        {activeTab === 'quiz' && activeSession.subject && activeSession.chapter && (
          <QuizEngine
            subject={activeSession.subject}
            chapter={activeSession.chapter}
            mode={activeSession.mode}
            onFinishQuiz={handleFinishQuiz}
            onBackToHome={() => setActiveTab('revise')}
          />
        )}

        {activeTab === 'flashcards' && activeSession.subject && activeSession.chapter && (
          <FlashcardEngine
            subject={activeSession.subject}
            chapter={activeSession.chapter}
            onBackToHome={() => setActiveTab('revise')}
          />
        )}

        {activeTab === 'fiches' && (
          <RevisionSheet
            subjects={subjects}
            onStartRevision={handleStartRevision}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            subjects={subjects}
            onSaveSubjects={handleSaveSubjects}
            onLockAdmin={handleLockAdmin}
          />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard
            stats={stats}
            streak={streak}
            subjects={subjects}
          />
        )}
      </main>

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/60 text-center text-xs text-slate-500 glass-panel">
        <p>© 2026 Révise Tes Cours — Application d'apprentissage et de révision avec questions dynamiques</p>
      </footer>

    </div>
  );
}

export default App;
