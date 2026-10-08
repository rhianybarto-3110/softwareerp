import express from 'express';
import { createApiRouter } from '../server/api';

const app = express();
app.use(express.json());
app.use('/api', createApiRouter());

export default app;
