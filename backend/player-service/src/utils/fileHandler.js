//fileHandler.js est un Utilitaire, une fonction utilitaire ne dépend pas d'Express, elle peut être appelée n'importe où.
//les middleware eux doivent etre utilise avec express

import	fs		from	'fs';
import	path	from	'path';


/**
 * Supprime un fichier du système de fichiers
 * @param {string} filePath - Chemin complet du fichier
 */

export	function	deleteFile(filePath){
	if(!filePath) return;

	try {
		if(fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			console.log(`Deleted old file: ${filePath}`);
		}
	} catch (error) {
		console.error(`Error deleting file: ${filePath}`, error.message);
	}
};

/**
 * Vérifie si un fichier existe
 * @param {string} filePath - Chemin complet du fichier
 * @returns {boolean}
 */

export function fileExists(filePath) {
    return fs.existsSync(filePath);
};