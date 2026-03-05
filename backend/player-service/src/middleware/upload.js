import	multer				from	'multer';
import	path				from	'path';
import	fs					from	'fs';
import	{ fileURLToPath }	from	'url';

// Recréer __dirname pour ES modules
const	__filename = fileURLToPath(import.meta.url);
const	__dirname = path.dirname(__filename);


// Chemin du dossier de stockage
const	UPLOAD_DIR = path.join(__dirname, '../../uploads/profilePictures');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, {recursive: true });
	console.log(`Created upload directory: ${UPLOAD_DIR}`);
}

// Configuration du stockage
const	storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (req, file, cb) => {
		const	authUserId = req.params.authUserId || 'unknow';// le 'unknown' au cas ou pas de uuid
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
export	{ UPLOAD_DIR };