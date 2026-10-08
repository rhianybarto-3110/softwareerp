import express from 'express';
import path from 'path';
import { createApiRouter } from './api';

const app = express();
const port = process.env.PORT || 3000;

app.use('/api', createApiRouter());

// Serve production static assets if dist exists
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`NexusERP server listening on port ${port}`);
});
