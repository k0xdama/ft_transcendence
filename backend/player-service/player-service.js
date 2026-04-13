import express from 'express';
import playerRoutes from './src/routes/player.js';
import internalRoutes from './src/routes/internal-router.js';
import fs from 'fs';
import { createServer } from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { statsWorker } from './src/workers/stats-worker.js';

// Recréer __dirname pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslOptions = {
    key: fs.readFileSync('/run/secrets/ssl_key'),
    cert: fs.readFileSync('/run/secrets/ssl_cert'),
};

const app = express();

// Middleware pour parser JSON
app.use(express.json());

// ✅ IMPORTANT : Servir les fichiers statiques (images de profil)
// Sans ça, les redirections vers /uploads/... ne fonctionneront pas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Monter les routes sur /players (PLURIEL - convention REST)
app.use('/players', playerRoutes);
app.use('/internal', internalRoutes);

// Health check (optionnel mais utile)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'player' });
});

const server = createServer(sslOptions, app);

const port = 3001;

if (process.env.NODE_ENV !== 'test') {
    server.listen(port, '0.0.0.0', () => {
        console.log(`✅ Player service running on port ${port}`);
        console.log(`📁 Static files served from: ${path.join(__dirname, 'uploads')}`);
    });

    try {
            await statsWorker.start();
        } catch (error) {
            console.error('❌ Failed to start stats worker:', error);
        }
}

// Arrêt gracieux
    process.on('SIGTERM', async () => {
        console.log('⚠️  SIGTERM received, shutting down gracefully...');
        await statsWorker.stop();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('⚠️  SIGINT received, shutting down gracefully...');
        await statsWorker.stop();
        process.exit(0);
    });

export default app;


// MON TRUC
// import	express			from	'express';
// import	playerRoutes	from	'./src/routes/player.js';

// const	app	= express();
// app.use(express.json());
// app.use('/player', playerRoutes);

// app.listen(3001, () => {
// 	console.log('player service running on port 3001');
// });
// MON TRUC