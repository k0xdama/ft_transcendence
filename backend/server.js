import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors(
	{
		origin: 'http://localhost:5173',
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'PUT'],
		allowHeaders: ['Content-Type', 'Authorization']
	}
))

// Middleware
app.use(express.json());  // Parse JSON bodies

// Test route
app.get('/api/health', (req, res) => {
	res.json({ 
		status: 'OK', 
		message: 'Backend is running',
		timestamp: new Date().toISOString()
	});
});

const port = 5172;

// Start server
app.listen(port, '0.0.0.0', () => {
	console.log(`Backend server running on port ${port}`);
});

export default app;