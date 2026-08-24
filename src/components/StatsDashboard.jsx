import React from 'react';
import { BarChart3, Award, Flame, CheckCircle, Clock, AlertTriangle, Target } from 'lucide-react';

export const StatsDashboard = ({ stats, streak, subjects }) => {
  const globalAccuracy = stats.totalQuestionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100)
    : 0;

  // Identify weak or non-attempted chapters for recommendations
  const recommendations = [];
  subjects.forEach(s => {
    s.chapters.forEach(c => {
      const chapterData = stats.chapterScores[c.id];
      if (!chapterData || chapterData.lastScore < 60) {
        recommendations.push({
          subjectName: s.name,
          chapterTitle: c.title,
          lastScore: chapterData ? chapterData.lastScore : null
        });
      }
    });
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          Statistiques & Suivi de Progression
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Analyse de vos performances de révision, historique des quiz et recommandations personnalisées.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 shadow-lg flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{streak?.current || 1} Jours</div>
            <div className="text-xs font-semibold text-slate-400">Série actuelle</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 shadow-lg flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{globalAccuracy}%</div>
            <div className="text-xs font-semibold text-slate-400">Précision globale</div>
          </div>
        </div>

        {/* Total Quizzes */}
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 shadow-lg flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalQuizzes || 0}</div>
            <div className="text-xs font-semibold text-slate-400">Quiz complétés</div>
          </div>
        </div>

        {/* Questions Answered */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 shadow-lg flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalQuestionsAnswered || 0}</div>
            <div className="text-xs font-semibold text-slate-400">Questions traitées</div>
          </div>
        </div>

      </div>

      {/* Grid: Recommendations & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Recommendations */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Chapitres Recommandés à Réviser
          </h2>
          
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{rec.chapterTitle}</span>
                  <span className="text-[11px] text-slate-400">{rec.subjectName}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  rec.lastScore === null 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {rec.lastScore === null ? 'Non essayé' : `Dernier score: ${rec.lastScore}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: History Log */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Historique des Sessions Récentes
          </h2>

          {stats.history && stats.history.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {stats.history.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">{item.chapterTitle}</span>
                    <span className="text-slate-400 text-[11px]">{item.date} • Mode : {item.mode}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-sm block ${
                      item.percentage >= 70 ? 'text-emerald-400' : item.percentage >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {item.score} / {item.totalQuestions} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Aucune session enregistrée pour le moment. Lancez un quiz pour voir apparaître vos scores !
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
