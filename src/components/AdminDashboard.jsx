import React, { useState } from 'react';
import { 
  Settings, Plus, Trash2, Edit3, Upload, FileText, Download, 
  Save, Check, AlertCircle, Sparkles, Layers, BookOpen, HelpCircle, KeyRound, Lock, Unlock, Globe, Code
} from 'lucide-react';
import { parseFileContent } from '../services/fileParser';
import { getAdminPin, setAdminPin, isAdminProtected, setAdminProtected } from '../services/storageService';
import { generateCodeSnippet } from '../services/cloudSyncService';

export const AdminDashboard = ({ subjects, onSaveSubjects, onLockAdmin }) => {
  const [subjectList, setSubjectList] = useState(subjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedChapterId, setSelectedChapterId] = useState(subjects[0]?.chapters[0]?.id || '');
  
  // PIN Security settings state
  const [isPinSettingsOpen, setIsPinSettingsOpen] = useState(false);
  const [currentPinSetting, setCurrentPinSetting] = useState(getAdminPin());
  const [isProtectedState, setIsProtectedState] = useState(isAdminProtected());
  const [pinChangeNotice, setPinChangeNotice] = useState('');

  // Code Publish Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [copiedCodeNotice, setCopiedCodeNotice] = useState('');

  // Forms & Modal states
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjIcon, setNewSubjIcon] = useState('BookOpen');
  const [newSubjColor, setNewSubjColor] = useState('from-indigo-600 to-purple-500');

  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapTitle, setNewChapTitle] = useState('');
  const [newChapDesc, setNewChapDesc] = useState('');

  // Active Chapter Editing
  const currentSubject = subjectList.find(s => s.id === selectedSubjectId) || subjectList[0];
  const currentChapter = currentSubject?.chapters.find(c => c.id === selectedChapterId) || currentSubject?.chapters[0];

  const [editCourseContent, setEditCourseContent] = useState(currentChapter?.content || '');
  const [editCourseTitle, setEditCourseTitle] = useState(currentChapter?.title || '');
  const [editCourseDesc, setEditCourseDesc] = useState(currentChapter?.description || '');
  const [uploadNotice, setUploadNotice] = useState('');

  // Add Manual Question Modal
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [qText, setQText] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [qExpl, setQExpl] = useState('');

  // Synchronize edit fields when chapter selection changes
  const handleSelectChapter = (chap) => {
    setSelectedChapterId(chap.id);
    setEditCourseTitle(chap.title);
    setEditCourseDesc(chap.description);
    setEditCourseContent(chap.content || '');
    setUploadNotice('');
  };

  const handleSaveCurrentChapter = () => {
    if (!currentSubject || !currentChapter) return;

    const updated = subjectList.map(s => {
      if (s.id === currentSubject.id) {
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id === currentChapter.id) {
              return {
                ...c,
                title: editCourseTitle,
                description: editCourseDesc,
                content: editCourseContent
              };
            }
            return c;
          })
        };
      }
      return s;
    });

    setSubjectList(updated);
    onSaveSubjects(updated);
    setUploadNotice('Modifications enregistrées avec succès !');
    setTimeout(() => setUploadNotice(''), 3000);
  };

  // Add New Subject
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    const newSubj = {
      id: `subj-${Date.now()}`,
      name: newSubjName.trim(),
      icon: newSubjIcon,
      color: newSubjColor,
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
      chapters: []
    };

    const updated = [...subjectList, newSubj];
    setSubjectList(updated);
    onSaveSubjects(updated);
    setSelectedSubjectId(newSubj.id);
    setIsAddingSubject(false);
    setNewSubjName('');
  };

  // Delete Subject
  const handleDeleteSubject = (subjId) => {
    if (subjectList.length <= 1) {
      alert("Vous devez conserver au moins une matière.");
      return;
    }
    if (confirm("Voulez-vous vraiment supprimer cette matière et tous ses chapitres ?")) {
      const updated = subjectList.filter(s => s.id !== subjId);
      setSubjectList(updated);
      onSaveSubjects(updated);
      setSelectedSubjectId(updated[0].id);
    }
  };

  // Add New Chapter
  const handleAddChapter = (e) => {
    e.preventDefault();
    if (!newChapTitle.trim() || !currentSubject) return;

    const newChap = {
      id: `chap-${Date.now()}`,
      title: newChapTitle.trim(),
      description: newChapDesc.trim() || "Aucune description",
      content: "Insérez le cours ici ou uploadez un fichier.",
      questions: []
    };

    const updated = subjectList.map(s => {
      if (s.id === currentSubject.id) {
        return {
          ...s,
          chapters: [...s.chapters, newChap]
        };
      }
      return s;
    });

    setSubjectList(updated);
    onSaveSubjects(updated);
    setSelectedChapterId(newChap.id);
    setEditCourseTitle(newChap.title);
    setEditCourseDesc(newChap.description);
    setEditCourseContent(newChap.content);
    setIsAddingChapter(false);
    setNewChapTitle('');
    setNewChapDesc('');
  };

  // Delete Chapter
  const handleDeleteChapter = (chapId) => {
    if (!currentSubject) return;
    if (confirm("Voulez-vous supprimer ce chapitre ?")) {
      const updated = subjectList.map(s => {
        if (s.id === currentSubject.id) {
          return {
            ...s,
            chapters: s.chapters.filter(c => c.id !== chapId)
          };
        }
        return s;
      });

      setSubjectList(updated);
      onSaveSubjects(updated);
      const remainingChaps = updated.find(s => s.id === currentSubject.id)?.chapters || [];
      if (remainingChaps.length > 0) {
        handleSelectChapter(remainingChaps[0]);
      }
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadNotice("Lecture et parsing du fichier en cours...");
      const result = await parseFileContent(file);

      if (result.type === 'json' && Array.isArray(result.data)) {
        setSubjectList(result.data);
        onSaveSubjects(result.data);
        setUploadNotice("Base de données cours importée avec succès !");
      } else if (result.rawText) {
        setEditCourseContent(result.rawText);
        setUploadNotice(`Contenu extrait de "${file.name}" importé avec succès ! Pensez à enregistrer.`);
      }
    } catch (err) {
      alert("Erreur lors de la lecture du fichier : " + err.message);
      setUploadNotice('');
    }
  };

  // Save PIN code settings
  const handleSavePinSettings = (e) => {
    e.preventDefault();
    if (currentPinSetting.trim().length > 0) {
      setAdminPin(currentPinSetting.trim());
      setAdminProtected(isProtectedState);
      setPinChangeNotice('Sécurité et code PIN mis à jour !');
      setTimeout(() => {
        setPinChangeNotice('');
        setIsPinSettingsOpen(false);
      }, 1500);
    }
  };

  // Add Manual Custom Question
  const handleAddQuestionSubmit = (e) => {
    e.preventDefault();
    if (!qText.trim() || !qOpt1.trim() || !qOpt2.trim()) return;

    const options = [qOpt1.trim(), qOpt2.trim()];
    if (qOpt3.trim()) options.push(qOpt3.trim());
    if (qOpt4.trim()) options.push(qOpt4.trim());

    const newQ = {
      id: `man-q-${Date.now()}`,
      type: 'mcq',
      question: qText.trim(),
      options,
      answer: Number(qCorrect),
      explanation: qExpl.trim() || "Réponse correcte renseignée par l'administrateur."
    };

    const updated = subjectList.map(s => {
      if (s.id === currentSubject.id) {
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id === currentChapter.id) {
              return {
                ...c,
                questions: [...(c.questions || []), newQ]
              };
            }
            return c;
          })
        };
      }
      return s;
    });

    setSubjectList(updated);
    onSaveSubjects(updated);
    setIsAddingQuestion(false);
    setQText('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
  };

  // Download updated initialData.js code file
  const handleDownloadInitialData = () => {
    const snippet = generateCodeSnippet(subjectList);
    const blob = new Blob([snippet], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'initialData.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export database to JSON file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subjectList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `revise_tes_cours_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-400" />
            Espace Administration & Gestion des Cours
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Ajoutez ou modifiez vos matières, téléversez vos fichiers de cours et publiez les mises à jour pour tous les étudiants.
          </p>
        </div>

        {/* Security & Backup Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Publish to code button */}
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Publier pour Tous les Élèves
          </button>

          <button
            onClick={() => setIsPinSettingsOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold transition-all flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            Code PIN Securité
          </button>

          <button
            onClick={onLockAdmin}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            Verrouiller
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Exporter JSON
          </button>
        </div>
      </div>

      {/* Main Grid: Subject List & Chapter Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Subjects & Chapters Hierarchy */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Subjects Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Matières ({subjectList.length})
              </h3>
              <button
                onClick={() => setIsAddingSubject(true)}
                className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Matière
              </button>
            </div>

            {/* Subject List */}
            <div className="space-y-2">
              {subjectList.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSubjectId(s.id);
                    if (s.chapters.length > 0) handleSelectChapter(s.chapters[0]);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    s.id === selectedSubjectId
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-white font-bold'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-normal">{s.chapters.length} chap.</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(s.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Supprimer la matière"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chapters Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Chapitres de {currentSubject?.name}
              </h3>
              <button
                onClick={() => setIsAddingChapter(true)}
                className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Chapitre
              </button>
            </div>

            <div className="space-y-2">
              {currentSubject?.chapters.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelectChapter(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    c.id === selectedChapterId
                      ? 'bg-purple-950/60 border-purple-500/50 text-white font-bold'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs truncate max-w-[180px]">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(c.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Supprimer le chapitre"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Active Chapter Content Editor & File Upload */}
        <div className="lg:col-span-8 space-y-6">
          {currentChapter ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{currentSubject.name}</span>
                  <h2 className="text-xl font-bold text-white">Édition du Chapitre</h2>
                </div>

                <button
                  onClick={handleSaveCurrentChapter}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer les Modifications
                </button>
              </div>

              {uploadNotice && (
                <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {uploadNotice}
                </div>
              )}

              {/* Title & Description Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Titre du Chapitre</label>
                  <input
                    type="text"
                    value={editCourseTitle}
                    onChange={(e) => setEditCourseTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Description / Résumé court</label>
                  <input
                    type="text"
                    value={editCourseDesc}
                    onChange={(e) => setEditCourseDesc(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload File Zone */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-dashed border-indigo-500/40 text-center relative hover:border-indigo-500 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                <p className="text-sm font-bold text-white mb-1">
                  Uploadez votre fichier de cours (.txt, .pdf, .md, .json)
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  Le texte sera extrait et inséré automatiquement pour la génération des questions.
                </p>
                <label className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all">
                  Parcourir mes fichiers
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Rich Course Text Content Area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Contenu du Cours (Texte source pour les questions)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {editCourseContent.length} caractères
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={editCourseContent}
                  onChange={(e) => setEditCourseContent(e.target.value)}
                  placeholder="Collez ici le texte intégral de votre cours (définitions, formules, dates, explications)..."
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-200 font-mono focus:border-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Questions Section */}
              <div className="border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    Banque de Questions Manuelles ({currentChapter.questions?.length || 0})
                  </h3>
                  <button
                    onClick={() => setIsAddingQuestion(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une Question
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {currentChapter.questions?.map((q, idx) => (
                    <div key={q.id || idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{idx + 1}. {q.question}</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Réponse : {q.options ? q.options[q.answer] : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-500">
              Sélectionnez un chapitre à modifier.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Publish for All Students */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-emerald-500/40 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Publier pour Tous les Étudiants</h3>
                  <p className="text-xs text-slate-400">Enregistrez vos cours pour qu'ils mettent à jour le code du site global.</p>
                </div>
              </div>

              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <p className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                ✅ **Vos modifications sont déjà actives dans la base de données.**<br/>
                Pour mettre à jour le code source général de votre site sur **GitHub / Vercel** afin que tous les futurs utilisateurs voient directement ces cours par défaut :
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleDownloadInitialData}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger initialData.js mis à jour
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateCodeSnippet(subjectList));
                    setCopiedCodeNotice('Code source initialData.js copié dans votre presse-papier !');
                    setTimeout(() => setCopiedCodeNotice(''), 3000);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Code className="w-4 h-4 text-purple-400" />
                  Copier le Code JavaScript
                </button>
              </div>

              {copiedCodeNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs text-center">
                  {copiedCodeNotice}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-4">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all"
              >
                Fermer & Terminer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Change Security PIN */}
      {isPinSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-indigo-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              Sécurité & Code PIN Admin
            </h3>
            <p className="text-xs text-slate-400 mb-4">Définissez le code secret nécessaire pour accéder à l'administration.</p>

            {pinChangeNotice && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                {pinChangeNotice}
              </div>
            )}

            <form onSubmit={handleSavePinSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nouveau Code PIN</label>
                <input
                  type="text"
                  required
                  value={currentPinSetting}
                  onChange={(e) => setCurrentPinSetting(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="protToggle"
                  checked={isProtectedState}
                  onChange={(e) => setIsProtectedState(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="protToggle" className="text-xs font-semibold text-slate-300">
                  Exiger le code PIN pour ouvrir l'Espace Admin
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPinSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Subject */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-indigo-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Ajouter une Matière</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nom de la Matière</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Physique-Chimie, Droit, Philosophie..."
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Créer Matière
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Chapter */}
      {isAddingChapter && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-purple-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Ajouter un Chapitre à {currentSubject?.name}</h3>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Titre du Chapitre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Les Équations Différentielles..."
                  value={newChapTitle}
                  onChange={(e) => setNewChapTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description courte</label>
                <input
                  type="text"
                  placeholder="Ex: Résolution de f'(x) = af(x) + b..."
                  value={newChapDesc}
                  onChange={(e) => setNewChapDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingChapter(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Créer Chapitre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Question */}
      {isAddingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border border-emerald-500/30 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Ajouter une Question Manuelle (QCM)</h3>
            <form onSubmit={handleAddQuestionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Question</label>
                <input
                  type="text"
                  required
                  placeholder="Intitulé de la question..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Option A (Obligatoire)</label>
                  <input
                    type="text"
                    required
                    value={qOpt1}
                    onChange={(e) => setQOpt1(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Option B (Obligatoire)</label>
                  <input
                    type="text"
                    required
                    value={qOpt2}
                    onChange={(e) => setQOpt2(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Option C (Optionnel)</label>
                  <input
                    type="text"
                    value={qOpt3}
                    onChange={(e) => setQOpt3(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Option D (Optionnel)</label>
                  <input
                    type="text"
                    value={qOpt4}
                    onChange={(e) => setQOpt4(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bonne Réponse</label>
                <select
                  value={qCorrect}
                  onChange={(e) => setQCorrect(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  {qOpt3 && <option value={2}>Option C</option>}
                  {qOpt4 && <option value={3}>Option D</option>}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Ajouter Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
