import { BookOpen, Settings, BarChart3, Flame, Sparkles, BookMarked, Lock, Unlock } from 'lucide-react';

export const Navbar = ({ activeTab, onSelectTab, streak, totalScore, isAdminUnlocked, onLockAdmin }) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab('revise')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Révise Tes Cours
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
                  AI PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Générateur dynamique & révision personnalisée</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => onSelectTab('revise')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'revise'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Réviser
            </button>

            <button
              onClick={() => onSelectTab('fiches')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'fiches'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              Fiches de Cours
            </button>

            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Espace Admin</span>
              {!isAdminUnlocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </button>
          </nav>

          {/* Right Controls: Lock Status, Streak & Score */}
          <div className="flex items-center gap-3">
            
            {/* Lock toggle button if unlocked */}
            {isAdminUnlocked && (
              <button
                onClick={onLockAdmin}
                title="Verrouiller l'Espace Admin"
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verrouiller Admin</span>
              </button>
            )}

            {/* Streak Badge */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm"
              title="Jours consécutifs de révision"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
              <span>{streak?.current || 1} J</span>
            </div>

            {/* Total Points */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <span>Points : {totalScore} pts</span>
            </div>

          </div>

        </div>
        
        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2">
          <button
            onClick={() => onSelectTab('revise')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              activeTab === 'revise' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Réviser
          </button>
          <button
            onClick={() => onSelectTab('fiches')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              activeTab === 'fiches' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <BookMarked className="w-5 h-5" />
            Fiches
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              activeTab === 'admin' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            Admin {!isAdminUnlocked ? '🔒' : '🔓'}
          </button>
          <button
            onClick={() => onSelectTab('stats')}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              activeTab === 'stats' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Stats
          </button>
        </div>

      </div>
    </header>
  );
};
