import React, { useState, useEffect } from 'react';
import { 
  Calculator, Globe, Dna, Code, BookOpen, Layers, 
  Sparkles, Zap, Brain, CheckCircle2, ArrowRight, PlusCircle, Search, Clock
} from 'lucide-react';

const ICON_MAP = {
  Calculator: Calculator,
  Globe: Globe,
  Dna: Dna,
  Code: Code,
  BookOpen: BookOpen,
  Layers: Layers
};

export const SubjectSelector = ({ subjects = [], onStartRevision, onGoToAdmin }) => {
  const safeSubjects = Array.isArray(subjects) && subjects.length > 0 ? subjects : [];

  const [selectedSubjectId, setSelectedSubjectId] = useState(safeSubjects[0]?.id || '');
  const [selectedChapterId, setSelectedChapterId] = useState(safeSubjects[0]?.chapters?.[0]?.id || '');
  const [selectedMode, setSelectedMode] = useState('mcq'); // 'mcq', 'flashcards', 'truefalse'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (safeSubjects.length > 0) {
      const exists = safeSubjects.some(s => s.id === selectedSubjectId);
      if (!selectedSubjectId || !exists) {
        const firstSubj = safeSubjects[0];
        setSelectedSubjectId(firstSubj.id);
        const chaps = Array.isArray(firstSubj.chapters) ? firstSubj.chapters : [];
        if (chaps.length > 0) {
          setSelectedChapterId(chaps[0].id);
        }
      }
    }
  }, [safeSubjects, selectedSubjectId]);

  const filteredSubjects = safeSubjects.filter(s => 
    s && s.name && (
      s.name.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (Array.isArray(s.chapters) && s.chapters.some(c => c && c.title && c.title.toLowerCase().includes((searchQuery || '').toLowerCase())))
    )
  );

  const currentSubject = safeSubjects.find(s => s.id === selectedSubjectId) || safeSubjects[0] || null;
  const currentSubjectChapters = Array.isArray(currentSubject?.chapters) ? currentSubject.chapters : [];
  const currentChapter = currentSubjectChapters.find(c => c.id === selectedChapterId) || currentSubjectChapters[0] || null;

  const renderIcon = (iconName, className = "w-6 h-6") => {
    const IconComp = ICON_MAP[iconName] || BookOpen;
    return <IconComp className={className} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/20 p-8 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Moteur de Questions Dynamiques Indépendant
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Choisissez votre cours & révisez sans limite
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-6">
            Importez vos cours ou sélectionnez une matière ci-dessous. À chaque partie, l'application génère des <span className="text-indigo-400 font-semibold">questions inédites</span> et des distracteurs aléatoires pour un entraînement optimal.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une matière ou un chapitre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Grid: 1. Subject Selector | 2. Chapter & Mode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Subjects list */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Matières Disponibles ({filteredSubjects.length})
            </h2>
          </div>

          <div className="space-y-3">
            {filteredSubjects.map((subj) => {
              const isSelected = subj.id === selectedSubjectId;
              const chapsCount = Array.isArray(subj.chapters) ? subj.chapters.length : 0;
              return (
                <div
                  key={subj.id}
                  onClick={() => {
                    setSelectedSubjectId(subj.id);
                    if (chapsCount > 0) {
                      setSelectedChapterId(subj.chapters[0].id);
                    }
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 glass-panel-hover border ${
                    isSelected
                      ? `bg-slate-900/95 ${subj.borderColor || 'border-indigo-500'} shadow-lg ring-1 ring-indigo-500/40`
                      : 'bg-slate-900/50 border-slate-800/80 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${subj.color || 'from-indigo-600 to-purple-600'} text-white shadow-md`}>
                        {renderIcon(subj.icon)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{subj.name}</h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {chapsCount} chapitre{chapsCount > 1 ? 's' : ''} disponible{chapsCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chapters & Mode Selector */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Chapter Selection */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Sélectionnez un Chapitre ({currentSubject?.name || 'Matière'})
            </h2>

            {currentSubjectChapters.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-3">
                <p>Aucun chapitre dans cette matière.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {currentSubjectChapters.map((chap) => {
                  const isChapSelected = chap.id === selectedChapterId;
                  return (
                    <div
                      key={chap.id}
                      onClick={() => setSelectedChapterId(chap.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isChapSelected
                          ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-md ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <h4 className="font-semibold text-sm mb-1">{chap.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{chap.description}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mode Selection */}
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Choisissez votre Mode de Révision
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              
              {/* QCM Mode */}
              <div
                onClick={() => setSelectedMode('mcq')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                  selectedMode === 'mcq'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/40 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                <h4 className="font-bold text-sm">QCM Dynamique</h4>
                <p className="text-[11px] text-slate-400 mt-1">Questions & choix mélangés à chaque fois</p>
              </div>

              {/* Flashcards Mode */}
              <div
                onClick={() => setSelectedMode('flashcards')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                  selectedMode === 'flashcards'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500/40 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <h4 className="font-bold text-sm">Flashcards 3D</h4>
                <p className="text-[11px] text-slate-400 mt-1">Cartes mémoire interactives & audio</p>
              </div>

              {/* Vrai/Faux Express */}
              <div
                onClick={() => setSelectedMode('truefalse')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                  selectedMode === 'truefalse'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                <h4 className="font-bold text-sm">Vrai / Faux</h4>
                <p className="text-[11px] text-slate-400 mt-1">Test rapide d'affirmations exactes/inverses</p>
              </div>

            </div>

            {/* Start Button */}
            <button
              disabled={!currentChapter}
              onClick={() => onStartRevision({ subject: currentSubject, chapter: currentChapter, mode: selectedMode })}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span>Démarrer la session ({currentChapter?.title || 'Aucun chapitre'})</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
