import express from 'express';
import { router } from './src/routes/proxy-router.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
