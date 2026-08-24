import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, XCircle, ArrowRight, RotateCcw, Award, 
  HelpCircle, Clock, Sparkles, Check, ChevronRight, Home 
} from 'lucide-react';
import { generateDynamicQuestions } from '../services/questionGenerator';

export const QuizEngine = ({ subject, chapter, mode, onFinishQuiz, onBackToHome }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(25); // 25s timer per question
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Initialize or re-generate dynamic questions on mount
  useEffect(() => {
    initQuiz();
  }, [chapter]);

  const initQuiz = () => {
    const qList = generateDynamicQuestions(chapter, 8);
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setUserAnswers([]);
    setTimeLeft(25);
  };

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || isFinished || isSubmitted || questions.length === 0) return;

    if (timeLeft <= 0) {
      // Auto submit time's up
      handleSubmitAnswer(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, isFinished, isTimerActive, questions]);

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = (answerIdx) => {
    if (isSubmitted) return;

    const actualIdx = answerIdx !== undefined ? answerIdx : selectedAnswer;
    setSelectedAnswer(actualIdx);
    setIsSubmitted(true);

    const isCorrect = actualIdx === currentQuestion.answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: actualIdx,
        correctAnswer: currentQuestion.answer,
        isCorrect,
        explanation: currentQuestion.explanation,
        options: currentQuestion.options
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setTimeLeft(25);
    } else {
      // Quiz Finished!
      setIsFinished(true);
      const finalScore = score + (selectedAnswer === currentQuestion?.answer ? 1 : 0);
      
      // Trigger confetti if high score >= 60%
      if (finalScore / questions.length >= 0.6) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.log("Confetti error", e);
        }
      }

      onFinishQuiz({
        subjectId: subject.id,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        score: finalScore,
        totalQuestions: questions.length,
        mode: mode === 'truefalse' ? 'Vrai/Faux' : 'QCM'
      });
    }
  };

  if (!currentQuestion && !isFinished) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-400" />
        <p className="text-lg">Génération de questions dynamiques en cours...</p>
      </div>
    );
  }

  // End of Quiz Screen
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="glass-panel p-8 rounded-3xl text-center border border-indigo-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Award className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2">Session Terminée !</h2>
          <p className="text-slate-400 text-sm mb-6">{subject.name} • {chapter.title}</p>

          {/* Score display */}
          <div className="inline-flex items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 mb-8 min-w-[240px]">
            <div>
              <div className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                {score} / {questions.length}
              </div>
              <div className="text-sm font-bold text-slate-300">
                Taux de réussite : {percentage}%
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={initQuiz}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer (Questions 100% Inédites)
            </button>
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Retour au menu
            </button>
          </div>

          {/* Review answers breakdown */}
          <div className="text-left border-t border-slate-800 pt-6">
            <h3 className="text-base font-bold text-white mb-4">Récapitulatif des questions</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {userAnswers.map((ua, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border ${
                    ua.isCorrect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-200">
                        {idx + 1}. {ua.question}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Votre réponse : <span className={ua.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {ua.userAnswer >= 0 ? ua.options[ua.userAnswer] : 'Temps écoulé'}
                        </span>
                      </p>
                      {!ua.isCorrect && (
                        <p className="text-xs text-emerald-400 mt-0.5">
                          Bonne réponse : {ua.options[ua.correctAnswer]}
                        </p>
                      )}
                    </div>
                    {ua.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Active Quiz View
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Top Bar: Subject info, score, timer & progress */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <Sparkles className="w-4 h-4" />
            {subject.name} • {chapter.title}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                {timeLeft}s
              </span>
            </span>
            <span className="font-bold text-white">
              Question {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative">
        <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-6">
          {currentQuestion.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((optionText, idx) => {
            let optionStyle = "bg-slate-900/60 border-slate-800/90 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/60";

            if (isSubmitted) {
              if (idx === currentQuestion.answer) {
                optionStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/50";
              } else if (idx === selectedAnswer) {
                optionStyle = "bg-rose-950/80 border-rose-500 text-rose-200 font-bold ring-1 ring-rose-500/50";
              } else {
                optionStyle = "bg-slate-900/30 border-slate-900 text-slate-500 opacity-60";
              }
            } else if (selectedAnswer === idx) {
              optionStyle = "bg-indigo-950/80 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/50";
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedAnswer(idx)}
                className={`w-full p-4 rounded-2xl border text-left font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-between gap-4 ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center ${
                    selectedAnswer === idx 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{optionText}</span>
                </div>

                {isSubmitted && idx === currentQuestion.answer && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isSubmitted && idx === selectedAnswer && idx !== currentQuestion.answer && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Box after submission */}
        {isSubmitted && currentQuestion.explanation && (
          <div className="p-4 mb-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2 font-bold mb-1 text-indigo-300">
              <HelpCircle className="w-4 h-4" />
              Explication :
            </div>
            {currentQuestion.explanation}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Quitter
          </button>

          {!isSubmitted ? (
            <button
              disabled={selectedAnswer === null}
              onClick={() => handleSubmitAnswer()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span>Valider</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{currentIndex < questions.length - 1 ? 'Question Suivante' : 'Voir les Résultats'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
