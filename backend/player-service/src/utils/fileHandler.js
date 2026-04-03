//fileHandler.js est un Utilitaire, une fonction utilitaire ne dépend pas d'Express, elle peut être appelée n'importe où.
//les middleware eux doivent etre utilise avec express

import	fs		from	'fs';
import	path	from	'path';


/**
 * Vérifie si un chemin correspond à l'image par défaut
 * @param {string} filePath - Chemin du fichier (relatif ou absolu)
 * @returns {boolean}
 */
export function isDefaultProfilePicture(filePath) {
    if (!filePath) return false;
    
    // Normaliser le chemin pour la comparaison
    const normalizedPath = filePath.toLowerCase();
    
    return normalizedPath.includes('default_profile_picture');
}

/**

/**
 * Supprime un fichier du système de fichiers
 * @param {string} filePath - Chemin complet du fichier
 */

export	function	deleteFile(filePath){
	if(!filePath) return;

	// ✅ Protection : Ne jamais supprimer l'image par défaut
    if (isDefaultProfilePicture(filePath)) {
        console.log(`⚠️  Skipped deletion of default profile picture: ${filePath}`);
        return;
    }

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