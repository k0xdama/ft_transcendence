import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth-router.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

const port = 3000;

app.listen(port, '0.0.0.0', () => {
	console.log(`Auth service running on ${port}`);
});

export default app;
