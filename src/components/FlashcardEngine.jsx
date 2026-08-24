import React, { useState, useEffect } from 'react';
import { 
  RotateCw, Volume2, ThumbsUp, HelpCircle, AlertCircle, 
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2, RotateCcw, Home 
} from 'lucide-react';
import { generateFlashcards } from '../services/questionGenerator';

export const FlashcardEngine = ({ subject, chapter, onBackToHome }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    initFlashcards();
  }, [chapter]);

  const initFlashcards = () => {
    const list = generateFlashcards(chapter);
    setCards(list);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ easy: 0, medium: 0, hard: 0 });
    setIsFinished(false);
  };

  const currentCard = cards[currentIndex];

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRateCard = (rating) => {
    setStats(prev => ({ ...prev, [rating]: prev[rating] + 1 }));

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150);
    } else {
      setIsFinished(true);
    }
  };

  if (!currentCard && !isFinished) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-lg">Préparation des flashcards d'apprentissage...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="glass-panel p-8 rounded-3xl text-center border border-purple-500/20 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Paquet de Flashcards Terminé !</h2>
          <p className="text-slate-400 text-sm mb-6">{subject.name} • {chapter.title}</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <div className="text-2xl font-black">{stats.easy}</div>
              <div className="text-xs font-semibold">Facile</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
              <div className="text-2xl font-black">{stats.medium}</div>
              <div className="text-xs font-semibold">Moyen</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
              <div className="text-2xl font-black">{stats.hard}</div>
              <div className="text-xs font-semibold">À revoir</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={initFlashcards}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer le paquet
            </button>
            <button
              onClick={onBackToHome}
              className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Menu principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Header Info */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="text-purple-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Flashcards • {chapter.title}
          </span>
          <span className="font-bold text-white">
            Carte {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[320px] cursor-pointer perspective-1000 group mb-6"
      >
        <div className={`relative w-full h-full min-h-[320px] transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}>

          {/* FRONT side */}
          <div className="absolute inset-0 w-full h-full glass-panel p-8 rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col justify-between backface-hidden bg-slate-900/90">
            <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                RECTO • QUESTION
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(currentCard.question);
                }}
                className={`p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-purple-300 transition-colors ${
                  isSpeaking ? 'animate-pulse text-purple-400' : ''
                }`}
                title="Écouter la question (Synthèse vocale)"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-center px-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <RotateCw className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>Cliquez pour retourner la carte</span>
            </div>
          </div>

          {/* BACK side */}
          <div className="absolute inset-0 w-full h-full glass-panel p-8 rounded-3xl border border-indigo-500/30 shadow-2xl flex flex-col justify-between backface-hidden rotate-y-180 bg-indigo-950/80">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                VERSO • RÉPONSE
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(currentCard.answer);
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-indigo-300 transition-colors"
                title="Écouter la réponse"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-line">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <span>Auto-évaluez votre réponse ci-dessous</span>
            </div>
          </div>

        </div>
      </div>

      {/* Self-Rating Controls */}
      {isFlipped ? (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleRateCard('hard')}
            className="py-3 px-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4" />
            À revoir
          </button>
          <button
            onClick={() => handleRateCard('medium')}
            className="py-3 px-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            Moyen
          </button>
          <button
            onClick={() => handleRateCard('easy')}
            className="py-3 px-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <ThumbsUp className="w-4 h-4" />
            Facile !
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-slate-400">
          <button
            disabled={currentIndex === 0}
            onClick={() => {
              setCurrentIndex(prev => prev - 1);
              setIsFlipped(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold disabled:opacity-40 flex items-center gap-1 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédente
          </button>
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold hover:text-white transition-colors"
          >
            Quitter
          </button>
          <button
            onClick={() => setIsFlipped(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 flex items-center gap-1"
          >
            Voir réponse
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
