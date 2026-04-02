import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth-router.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
	console.log(`AUTH-SERVICE running on ${PORT}`);
});

export default app;
