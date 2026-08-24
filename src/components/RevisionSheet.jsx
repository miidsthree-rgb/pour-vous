import React, { useState } from 'react';
import { BookMarked, Sparkles, Zap, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const RevisionSheet = ({ subjects, onStartRevision }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedChapterId, setSelectedChapterId] = useState(subjects[0]?.chapters[0]?.id || '');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const currentChapter = currentSubject?.chapters.find(c => c.id === selectedChapterId) || currentSubject?.chapters[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <BookMarked className="w-7 h-7 text-indigo-400" />
            Fiches de Synthèse & Cours
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Consultez le texte intégral de votre cours et relisez les points fondamentaux avant de lancer un quiz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matière</h3>
            <div className="space-y-2 mb-6">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubjectId(s.id);
                    if (s.chapters.length > 0) setSelectedChapterId(s.chapters[0].id);
                  }}
                  className={`w-full p-3 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${
                    s.id === selectedSubjectId
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-xs text-slate-500 font-normal">{s.chapters.length} chap.</span>
                </button>
              ))}
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chapitre</h3>
            <div className="space-y-2">
              {currentSubject?.chapters.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChapterId(c.id)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                    c.id === selectedChapterId
                      ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8">
          {currentChapter ? (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{currentSubject.name}</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{currentChapter.title}</h2>
                </div>
                
                <button
                  onClick={() => onStartRevision({ subject: currentSubject, chapter: currentChapter, mode: 'mcq' })}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Lancer le QCM
                </button>
              </div>

              <p className="text-sm text-slate-300 italic bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                {currentChapter.description}
              </p>

              {/* Course Full Content */}
              <div className="space-y-4 text-slate-200 leading-relaxed text-sm sm:text-base whitespace-pre-line font-normal">
                {currentChapter.content ? (
                  currentChapter.content
                ) : (
                  <p className="text-slate-500 italic">Aucun contenu texte renseigné pour ce chapitre. Rendez-vous dans l'Espace Admin pour ajouter du texte ou impoter un fichier cours.</p>
                )}
              </div>

              {/* Action bottom */}
              <div className="border-t border-slate-800 pt-6 flex justify-end">
                <button
                  onClick={() => onStartRevision({ subject: currentSubject, chapter: currentChapter, mode: 'mcq' })}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>S'entraîner sur ce chapitre</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              Sélectionnez un chapitre pour afficher la fiche de cours.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
