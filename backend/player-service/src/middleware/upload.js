import	multer				from	'multer';
import	path				from	'path';
import	fs					from	'fs';
import	{ fileURLToPath }	from	'url';

// Recréer __dirname pour ES modules
const	__filename = fileURLToPath(import.meta.url);
const	__dirname = path.dirname(__filename);


// Chemin du dossier de stockage
const	UPLOAD_DIR = path.join(__dirname, '../../uploads/profilePictures');

// ✅ Chemin de l'image par défaut
const DEFAULT_PROFILE_PICTURE = '/uploads/profilePictures/default_profile_picture.png';
const DEFAULT_PROFILE_PICTURE_PATH = path.join(UPLOAD_DIR, 'default_profile_picture.png');


// Créer le dossier s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, {recursive: true });
	console.log(`Created upload directory: ${UPLOAD_DIR}`);
}

// ✅ Vérifier si l'image par défaut existe, sinon créer un placeholder
if (!fs.existsSync(DEFAULT_PROFILE_PICTURE_PATH)) {
    // Créer un fichier SVG simple comme placeholder
    // (Tu devras remplacer ça par une vraie image PNG)
    const svgPlaceholder = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#cccccc"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666666" font-size="20">
            Default Avatar
        </text>
    </svg>`;
    
    // Note: Pour l'instant, je crée un SVG
    // On devra mettre une vraie image PNG
    fs.writeFileSync(
        DEFAULT_PROFILE_PICTURE_PATH.replace('.png', '.svg'),
        svgPlaceholder
    );
    
    console.log(`⚠️  Created placeholder default profile picture`);
    console.log(`📝 Please replace with actual PNG at: ${DEFAULT_PROFILE_PICTURE_PATH}`);
}

// Configuration du stockage
const	storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (req, file, cb) => {
		const	authUserId = req.params.auth_user_id || req.user?.id || 'unknown';
		const	timestamp = Date.now();
		const	extension = path.extname(file.originalname);
		const	filename = `${authUserId}_${timestamp}${extension}`;

		cb(null, filename);
	}
});


// Filtrer les types de fichiers acceptés
const	fileFilter = (req, file, cb) => {
	const	allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];//WARN je ne sais pas si on va garder les gif

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`), false);
	}
};


// Configuration de multer
const	upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024 //5 Mbit
	}
});

export	default	upload;
export { UPLOAD_DIR, DEFAULT_PROFILE_PICTURE };