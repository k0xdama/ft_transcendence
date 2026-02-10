import express from 'express';
import authRoutes from './src/routes/auth.js';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

const port = 3000;

if (process.env.NODE_ENV !== 'test') {
	app.listen(port, '0.0.0.0', () => {
		console.log(`Auth service running on ${port}`);
	});
}

export default app;