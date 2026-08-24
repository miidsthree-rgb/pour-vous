/**
 * Service to parse uploaded files (.txt, .md, .json, .csv, .pdf)
 */

export const parseFileContent = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("Aucun fichier fourni"));
    }

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          resolve({ type: 'json', data: json, rawText: JSON.stringify(json, null, 2) });
        } catch (err) {
          reject(new Error("Fichier JSON invalide: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsText(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv') || fileName.endsWith('.html')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ type: 'text', rawText: e.target.result });
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier texte"));
      reader.readAsText(file, 'UTF-8');
    } else if (fileName.endsWith('.pdf')) {
      // Basic text extraction from PDF file bytes
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          // Extract text strings matching readable characters from binary PDF stream
          const textMatches = content.match(/[\x20-\x7E\xC0-\xFF]{4,}/g) || [];
          const extractedText = textMatches
            .filter(str => !str.startsWith('/') && !str.includes('obj') && !str.includes('endobj') && str.length > 5)
            .join(' ');
          
          if (extractedText.trim().length > 20) {
            resolve({ type: 'pdf', rawText: extractedText });
          } else {
            // Fallback
            resolve({ type: 'pdf', rawText: `Contenu extrait du PDF (${file.name}):\n` + content.substring(0, 2000) });
          }
        } catch {
          resolve({ type: 'pdf', rawText: `Fichier PDF chargé (${file.name}). Veuillez coller ou affiner les notes.` });
        }
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du PDF"));
      reader.readAsText(file, 'ISO-8859-1');
    } else {
      // Generic reader
      const reader = new FileReader();
      reader.onload = (e) => resolve({ type: 'unknown', rawText: e.target.result });
      reader.onerror = () => reject(new Error("Format de fichier non pris en charge"));
      reader.readAsText(file);
    }
  });
};
