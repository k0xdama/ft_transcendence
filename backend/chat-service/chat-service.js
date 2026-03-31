import express from 'express';
import chatRoutes from './src/routes/chat-router.js';

const app = express();

app.use(express.json());
app.use('/chat', chatRoutes);

const PORT = 2000;

app.listen(PORT, '0.0.0.0', () => {
	console.log(`CHAT-SERVICE running on ${PORT}`);
});

export default app;