import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import chatRoutes from './src/routes/chat-router.js';

const app = express();
const PORT = 2000;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/chat', chatRoutes);

app.listen(PORT, '0.0.0.0', () => {
	console.log(`CHAT-SERVICE running on ${PORT}`);
});

export default app;