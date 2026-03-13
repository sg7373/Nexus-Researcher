const express = require('express');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const aiService = require('../services/ai.service');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(authMiddleware);

// POST /api/ai/summarize
router.post('/summarize', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const summary = await aiService.summarizePaper(text);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/keywords
router.post('/keywords', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const keywords = await aiService.extractKeywords(text);
    res.json({ keywords });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/gaps
router.post('/gaps', async (req, res, next) => {
  try {
    const { projectContext } = req.body;
    if (!projectContext) {
      return res.status(400).json({ error: 'Project context is required' });
    }

    const gaps = await aiService.generateResearchGaps(projectContext);
    res.json({ gaps });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/connections
router.post('/connections', async (req, res, next) => {
  try {
    const { insights, projectContext } = req.body;

    if (Array.isArray(insights) && insights.length > 0) {
      const connections = await aiService.suggestConnections(insights);
      return res.json({ connections });
    }

    if (projectContext) {
      const connections = await aiService.suggestConnectionsFromContext(projectContext);
      return res.json({ connections });
    }

    return res.status(400).json({ error: 'Insights array or project context is required' });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { message, projectContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await aiService.chatWithAI(message, projectContext || '');
    res.json({ response });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/chat-with-file  (multipart/form-data)
// Fields: file (PDF or txt), message (optional), projectContext (optional)
router.post('/chat-with-file', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'A file is required' });
    }

    const { message, projectContext } = req.body;
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    try {
      const response = await aiService.chatWithFile(
        filePath,
        originalName,
        message,
        projectContext || '',
        req.file.mimetype
      );
      return res.json({ response, fileName: originalName });
    } finally {
      // Clean up temp file
      fs.unlink(filePath, () => {});
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
