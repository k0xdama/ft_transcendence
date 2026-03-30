import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth-router.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

app.listen(PORT, '0.0.0.0', () => {
	console.log(`AUTH-SERVICE running on ${PORT}`);
});

export default app;
