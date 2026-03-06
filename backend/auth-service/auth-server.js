import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth-router.js';

const app = express();

/*
	CORS ne sera plus utile une fois l'API Gateway implémentée
	Tout sera same-origin avec les requêtes proxies vers les
	microservices: /api/*
*/
app.use(cors(
	{
		origin: 'http://localhost:5173',
		credentials: true
	}
))
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

const port = 3000;

app.listen(port, '0.0.0.0', () => {
	console.log(`Auth service running on ${port}`);
});

export default app;
