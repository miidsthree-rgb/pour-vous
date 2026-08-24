import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { getAdminPin } from '../services/storageService';

export const AdminAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPin = getAdminPin();

    if (pinInput.trim() === correctPin) {
      setErrorMsg('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMsg('Code PIN incorrect');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-indigo-500/30 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Espace Protégé</h3>
          <p className="text-xs text-slate-400">Veuillez saisir votre code secret d'accès.</p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Code Secret</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                autoFocus
                maxLength={20}
                placeholder="••••••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-base tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Déverrouiller</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800 pt-4">
          <p className="text-[11px] text-slate-500">
            🔒 Accès strictement réservé à l'administrateur.
          </p>
        </div>

      </div>
    </div>
  );
};
