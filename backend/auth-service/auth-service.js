import express from 'express';
import fs from 'fs';
import { createServer } from 'https';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth-router.js';
import internalRoutes from './src/routes/internal-router.js';

const sslOptions = {
	key: fs.readFileSync('/run/secrets/ssl_key'),
	cert: fs.readFileSync('/run/secrets/ssl_cert')
};

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
// Private, service-to-service endpoints (not exposed via the API gateway)
app.use('/internal', internalRoutes);

const server = createServer(sslOptions, app);

const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {
	console.log(`AUTH-SERVICE running on ${PORT}`);
});

export default app;
