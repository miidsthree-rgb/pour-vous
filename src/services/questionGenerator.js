/**
 * Moteur de génération dynamique de questions à partir d'un texte de cours.
 * Génère des QCM, Vrai/Faux et Textes à trous renouvelés et mélangés à chaque session.
 */

// Helper to shuffle array (Fisher-Yates)
export const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Extract sentences from text
const extractSentences = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 250);
};

// Extract key definitions (e.g. "X est...", "X se définit comme...", "X désigne...")
const extractDefinitions = (text) => {
  const lines = text.split(/\n+/);
  const definitions = [];

  const defRegex = /^[-•*]?\s*([^:–\n]{3,40})\s*[:–]\s*(.+)$/i;
  const isRegex = /^([^.]{3,40})\s+(est|désigne|représente|consiste en)\s+(.+)$/i;

  for (const line of lines) {
    const clean = line.trim();
    const matchDef = clean.match(defRegex);
    if (matchDef) {
      definitions.push({ term: matchDef[1].trim(), definition: matchDef[2].trim() });
      continue;
    }
    const matchIs = clean.match(isRegex);
    if (matchIs && !clean.includes('?')) {
      definitions.push({ term: matchIs[1].trim(), definition: `${matchIs[2]} ${matchIs[3]}`.trim() });
    }
  }

  return definitions;
};

// Extract numbers & dates
const extractDatesAndNumbers = (text) => {
  const sentences = extractSentences(text);
  const items = [];

  const numberRegex = /(\b\d{1,4}(?:\s?\d{3})?|\b19\d{2}\b|\b20\d{2}\b|\b\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/gi;

  for (const sentence of sentences) {
    const matches = sentence.match(numberRegex);
    if (matches && matches.length > 0) {
      items.push({ sentence, fact: matches[0] });
    }
  }

  return items;
};

/**
 * Generate a dynamic pool of questions for a chapter
 */
export const generateDynamicQuestions = (chapter, targetCount = 10) => {
  const pool = [];
  const existingQuestions = chapter.questions || [];

  // 1. Process existing manual questions: shuffle options and track correct answer index
  for (const q of existingQuestions) {
    if (q.type === 'mcq' && q.options) {
      const correctAnswerText = q.options[q.answer];
      const shuffledOptions = shuffleArray(q.options);
      const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);

      pool.push({
        ...q,
        id: `static-${q.id}-${Math.random().toString(36).substr(2, 5)}`,
        options: shuffledOptions,
        answer: newAnswerIndex
      });
    } else if (q.type === 'truefalse') {
      const isVraiFirst = Math.random() > 0.5;
      const options = isVraiFirst ? ["Vrai", "Faux"] : ["Faux", "Vrai"];
      const correctAnswerText = q.options ? q.options[q.answer] : (q.answer === 0 ? "Vrai" : "Faux");
      const newAnswerIndex = options.indexOf(correctAnswerText);

      pool.push({
        ...q,
        id: `static-tf-${q.id}-${Math.random().toString(36).substr(2, 5)}`,
        options,
        answer: newAnswerIndex
      });
    } else {
      pool.push(q);
    }
  }

  const content = chapter.content || '';
  if (!content) {
    return shuffleArray(pool);
  }

  // 2. Extract definitions to generate MCQ questions
  const definitions = extractDefinitions(content);
  if (definitions.length >= 2) {
    const shuffledDefs = shuffleArray(definitions);
    for (let i = 0; i < Math.min(shuffledDefs.length, 5); i++) {
      const item = shuffledDefs[i];
      // Generate distractors from other definitions or terms
      const otherTerms = definitions.filter(d => d.term !== item.term).map(d => d.term);
      
      const fallbackDistractors = [
        "Un théorème sans application directe",
        "Une constante universelle fixe",
        "Une propriété secondaire de la structure",
        "Un processus métabolique périphérique"
      ];

      const distractors = shuffleArray([...otherTerms, ...fallbackDistractors]).slice(0, 3);
      const allChoices = shuffleArray([item.term, ...distractors]);
      const correctIndex = allChoices.indexOf(item.term);

      pool.push({
        id: `gen-def-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'mcq',
        question: `Dans le cours "${chapter.title}", quel concept correspond à : "${item.definition.length > 120 ? item.definition.substring(0, 120) + '...' : item.definition}" ?`,
        options: allChoices,
        answer: correctIndex,
        explanation: `D'après le cours : ${item.term} se définit par : ${item.definition}`
      });
    }
  }

  // 3. Extract dates & key facts to generate date/number MCQs
  const dates = extractDatesAndNumbers(content);
  if (dates.length > 0) {
    for (let i = 0; i < Math.min(dates.length, 4); i++) {
      const item = dates[i];
      const fact = item.fact;

      // Generate numeric distractors
      let d1, d2, d3;
      const numFact = parseInt(fact, 10);

      if (!isNaN(numFact) && numFact > 1000 && numFact < 2100) {
        d1 = (numFact - 1).toString();
        d2 = (numFact + 2).toString();
        d3 = (numFact - 5).toString();
      } else {
        d1 = "Non spécifié";
        d2 = "Valeur nulle";
        d3 = "Définition inverse";
      }

      const choices = shuffleArray([fact, d1, d2, d3]);
      const correctIndex = choices.indexOf(fact);

      const questionText = item.sentence.replace(fact, '[ ... ]');

      pool.push({
        id: `gen-date-${i}-${Date.now()}`,
        type: 'mcq',
        question: `Complétez l'élément manquant : "${questionText}"`,
        options: choices,
        answer: correctIndex,
        explanation: `La bonne réponse est : ${fact}.\nExtrait du cours : "${item.sentence}"`
      });
    }
  }

  // 4. Generate True / False questions from key sentences
  const sentences = extractSentences(content);
  if (sentences.length > 0) {
    const selectedSentences = shuffleArray(sentences).slice(0, 4);
    for (let i = 0; i < selectedSentences.length; i++) {
      const sentence = selectedSentences[i];
      const isTrue = Math.random() > 0.4; // 60% chance True, 40% False

      let displaySentence = sentence;
      let explanation = `Extrait exact du cours : "${sentence}"`;

      if (!isTrue) {
        // Slightly alter the sentence to make it false
        displaySentence = sentence
          .replace(/toujours/gi, 'jamais')
          .replace(/est /gi, 'n\'est pas ')
          .replace(/s'apparie toujours avec/gi, 'ne s\'apparie jamais avec')
          .replace(/augmente/gi, 'diminue')
          .replace(/positif/gi, 'négatif');
        
        if (displaySentence === sentence) {
          displaySentence = sentence + " (Ceci est censé décrire un comportement contraire à la réalité).";
        }
        explanation = `C'est Faux ! L'affirmation exacte du cours est : "${sentence}"`;
      }

      const options = ["Vrai", "Faux"];
      const correctIndex = isTrue ? 0 : 1;

      pool.push({
        id: `gen-tf-${i}-${Date.now()}`,
        type: 'truefalse',
        question: `L'affirmation suivante est-elle vraie ou fausse ?\n\n"${displaySentence}"`,
        options,
        answer: correctIndex,
        explanation
      });
    }
  }

  // Shuffle final combined pool and limit to targetCount
  const finalQuestions = shuffleArray(pool);
  return finalQuestions.slice(0, Math.max(targetCount, 5));
};

/**
 * Generate Flashcards from chapter content
 */
export const generateFlashcards = (chapter) => {
  const flashcards = [];
  const content = chapter.content || '';

  // Use manual questions if available
  if (chapter.questions) {
    for (const q of chapter.questions) {
      if (q.type === 'mcq' && q.options) {
        flashcards.push({
          id: `fc-man-${q.id}`,
          question: q.question,
          answer: `Réponse : ${q.options[q.answer]}\n\nExplication : ${q.explanation || ''}`
        });
      }
    }
  }

  // Extract definitions into flashcards
  const definitions = extractDefinitions(content);
  for (const d of definitions) {
    flashcards.push({
      id: `fc-def-${d.term}`,
      question: `Définition de : ${d.term}`,
      answer: `${d.definition}`
    });
  }

  // Extract sentences as question-answers
  const sentences = extractSentences(content);
  for (let i = 0; i < Math.min(sentences.length, 6); i++) {
    flashcards.push({
      id: `fc-sent-${i}`,
      question: `Point clé #${i + 1} (${chapter.title})`,
      answer: sentences[i]
    });
  }

  return shuffleArray(flashcards);
};
