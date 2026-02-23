import express from 'express';
import chatRoutes from './src/routes/chat.js';

const app = express();

app.use(express.json());

app.use('/chat', chatRoutes);

const port = 5055;

app.listen(port, '0.0.0.0', () => {
	console.log(`Chat service running on ${port}`);
});

export default app;