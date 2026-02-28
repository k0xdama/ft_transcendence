import express from 'express';
import cors from 'cors';
import chatRoutes from './src/routes/chat-router.js';

const app = express();

// Supprimer cors une fois l'API Gateway implémentée
app.use(cors(
	{
		origin: 'http://localhost:5173',
		credentials: true
	}
))
app.use(express.json());
app.use('/chat', chatRoutes);

const port = 2000;

app.listen(port, '0.0.0.0', () => {
	console.log(`Chat service running on ${port}`);
});

export default app;