import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';

const app = express();

app.use(cors ({
	origin: 'http://localhost:5173',
	credentials: true
}))

app.use(express.json());

app.use('/auth', authRoutes);

const port = 3000;

app.listen(port, '0.0.0.0', () => {
	console.log(`Auth service running on ${port}`);
});

export default app;