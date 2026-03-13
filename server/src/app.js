const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const projectRoutes = require('./routes/projects');
const paperRoutes = require('./routes/papers');
const experimentRoutes = require('./routes/experiments');
const insightRoutes = require('./routes/insights');
const graphRoutes = require('./routes/graph');
const aiRoutes = require('./routes/ai');
const similarityRoutes = require('./routes/similarity');

const app = express();

// CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Static files (uploads)
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', oauthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/similarity', similarityRoutes);

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'Nexus Research Intelligence Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      projects: ['GET /api/projects', 'POST /api/projects', 'GET /api/projects/:id', 'GET /api/projects/:id/stats'],
      papers: ['GET /api/papers/project/:projectId', 'POST /api/papers/project/:projectId', 'POST /api/papers/:id/summarize'],
      experiments: ['GET /api/experiments/project/:projectId', 'POST /api/experiments/project/:projectId'],
      insights: ['GET /api/insights/project/:projectId', 'POST /api/insights/project/:projectId'],
      graph: ['GET /api/graph/project/:projectId'],
      ai: ['POST /api/ai/summarize', 'POST /api/ai/keywords', 'POST /api/ai/gaps', 'POST /api/ai/connections', 'POST /api/ai/chat'],
      similarity: ['POST /api/similarity/compare'],
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A unique constraint would be violated' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

module.exports = app;
