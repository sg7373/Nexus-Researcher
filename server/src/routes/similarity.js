const express = require('express');
const authMiddleware = require('../middleware/auth');
const { compareDocs } = require('../services/similarity.service');

const router = express.Router();

router.use(authMiddleware);

// POST /api/similarity/compare
router.post('/compare', async (req, res, next) => {
  try {
    const { textA, textB } = req.body;

    if (!textA || !textB) {
      return res.status(400).json({ error: 'Both textA and textB are required' });
    }

    const result = compareDocs(textA, textB);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
