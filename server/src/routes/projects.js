const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All project routes require auth
router.use(authMiddleware);

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { papers: true, experiments: true, insights: true } },
      },
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        tags: tags || [],
        userId: req.user.id,
      },
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        _count: { select: { papers: true, experiments: true, insights: true } },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { title, description, tags, stage } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(stage !== undefined && { stage }),
      },
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/stats
router.get('/:id/stats', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const [papersCount, experimentsCount, insightsCount, linksCount] = await Promise.all([
      prisma.paper.count({ where: { projectId: req.params.id } }),
      prisma.experiment.count({ where: { projectId: req.params.id } }),
      prisma.insight.count({ where: { projectId: req.params.id } }),
      prisma.insightLink.count({
        where: {
          OR: [
            { fromInsight: { projectId: req.params.id } },
            { toInsight: { projectId: req.params.id } },
          ],
        },
      }),
    ]);

    res.json({ papersCount, experimentsCount, insightsCount, linksCount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
