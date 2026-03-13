const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getProjectGraph } = require('../services/graph.service');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/graph/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const graph = await getProjectGraph(req.params.projectId);
    res.json(graph);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
