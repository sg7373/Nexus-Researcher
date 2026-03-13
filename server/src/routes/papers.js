const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { summarizePaper } = require('../services/ai.service');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/papers/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const papers = await prisma.paper.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { insights: true } } },
    });

    res.json(papers);
  } catch (err) {
    next(err);
  }
});

// POST /api/papers/project/:projectId
router.post('/project/:projectId', upload.single('file'), async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { title, authors, year, abstract, content, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Coerce authors: accept string "A, B" or array ["A","B"]
    const authorsArr = Array.isArray(authors)
      ? authors
      : typeof authors === 'string' && authors.trim()
        ? authors.split(',').map((a) => a.trim()).filter(Boolean)
        : [];

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const paper = await prisma.paper.create({
      data: {
        title,
        authors: authorsArr,
        year: year ? parseInt(year, 10) : null,
        abstract: abstract || null,
        content: content || null,
        fileUrl,
        tags: tags || [],
        keywords: [],
        projectId: req.params.projectId,
      },
    });

    res.status(201).json(paper);
  } catch (err) {
    next(err);
  }
});

// PUT /api/papers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!paper || paper.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const { title, authors, year, abstract, content, tags, keywords } = req.body;

    const authorsArr = authors === undefined ? undefined
      : Array.isArray(authors) ? authors
      : typeof authors === 'string' && authors.trim()
        ? authors.split(',').map((a) => a.trim()).filter(Boolean)
        : [];

    const updated = await prisma.paper.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(authorsArr !== undefined && { authors: authorsArr }),
        ...(year !== undefined && { year: year ? parseInt(year, 10) : null }),
        ...(abstract !== undefined && { abstract }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(keywords !== undefined && { keywords }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/papers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!paper || paper.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    await prisma.paper.delete({ where: { id: req.params.id } });
    res.json({ message: 'Paper deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/papers/:id/summarize
router.post('/:id/summarize', async (req, res, next) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!paper || paper.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const textToSummarize = paper.content || paper.abstract;
    if (!textToSummarize) {
      return res.status(400).json({ error: 'Paper has no content or abstract to summarize' });
    }

    const summary = await summarizePaper(textToSummarize);

    const updated = await prisma.paper.update({
      where: { id: req.params.id },
      data: { aiSummary: summary },
    });

    res.json({ summary: updated.aiSummary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
