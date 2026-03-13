const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/insights/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const insights = await prisma.insight.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { papers: true, fromLinks: true, toLinks: true } },
      },
    });

    res.json(insights);
  } catch (err) {
    next(err);
  }
});

// POST /api/insights/project/:projectId
router.post('/project/:projectId', upload.single('file'), async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { title, description, content } = req.body;
    // accept 'content' as alias for 'description' for backwards compat
    const finalDescription = description || content || '';

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const insight = await prisma.insight.create({
      data: {
        title,
        description: finalDescription,
        fileUrl,
        projectId: req.params.projectId,
      },
    });

    res.status(201).json(insight);
  } catch (err) {
    next(err);
  }
});

// PUT /api/insights/:id
router.put('/:id', async (req, res, next) => {
  try {
    const insight = await prisma.insight.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!insight || insight.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    const { title, description } = req.body;

    const updated = await prisma.insight.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/insights/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const insight = await prisma.insight.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!insight || insight.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    await prisma.insight.delete({ where: { id: req.params.id } });
    res.json({ message: 'Insight deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/insights/:id/link — link two insights
router.post('/:id/link', async (req, res, next) => {
  try {
    const insight = await prisma.insight.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!insight || insight.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    const { toInsightId, relationshipType, strength } = req.body;

    if (!toInsightId) {
      return res.status(400).json({ error: 'toInsightId is required' });
    }

    const toInsight = await prisma.insight.findUnique({ where: { id: toInsightId } });
    if (!toInsight) {
      return res.status(404).json({ error: 'Target insight not found' });
    }

    const link = await prisma.insightLink.create({
      data: {
        fromInsightId: req.params.id,
        toInsightId,
        relationshipType: relationshipType || 'related',
        strength: strength !== undefined ? parseFloat(strength) : 0.5,
      },
    });

    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/insights/link/:linkId
router.delete('/link/:linkId', async (req, res, next) => {
  try {
    const link = await prisma.insightLink.findUnique({
      where: { id: req.params.linkId },
      include: { fromInsight: { include: { project: true } } },
    });

    if (!link || link.fromInsight.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.insightLink.delete({ where: { id: req.params.linkId } });
    res.json({ message: 'Link deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/insights/:id/link-paper — link insight to paper
router.post('/:id/link-paper', async (req, res, next) => {
  try {
    const insight = await prisma.insight.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!insight || insight.project.userId !== req.user.id) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    const { paperId } = req.body;

    if (!paperId) {
      return res.status(400).json({ error: 'paperId is required' });
    }

    const paper = await prisma.paper.findUnique({ where: { id: paperId } });
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const link = await prisma.insightPaperLink.create({
      data: {
        insightId: req.params.id,
        paperId,
      },
    });

    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
