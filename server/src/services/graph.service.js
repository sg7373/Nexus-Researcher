const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function tokenize(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4)
  );
}

function overlapScore(aSet, bSet) {
  let score = 0;
  for (const token of aSet) {
    if (bSet.has(token)) score += 1;
  }
  return score;
}

async function getProjectGraph(projectId) {
  const [insights, papers, experiments, insightLinks, paperLinks] = await Promise.all([
    prisma.insight.findMany({ where: { projectId } }),
    prisma.paper.findMany({ where: { projectId } }),
    prisma.experiment.findMany({ where: { projectId } }),
    prisma.insightLink.findMany({
      where: {
        OR: [
          { fromInsight: { projectId } },
          { toInsight: { projectId } },
        ],
      },
    }),
    prisma.insightPaperLink.findMany({
      where: {
        OR: [
          { insight: { projectId } },
          { paper: { projectId } },
        ],
      },
    }),
  ]);

  const nodes = [
    ...insights.map((i) => ({
      id: i.id,
      label: i.title,
      type: 'insight',
      data: { description: i.description },
    })),
    ...papers.map((p) => ({
      id: p.id,
      label: p.title,
      type: 'paper',
      data: { authors: p.authors, year: p.year, abstract: p.abstract },
    })),
    ...experiments.map((e) => ({
      id: e.id,
      label: e.name,
      type: 'experiment',
      data: { objective: e.objective, status: e.status },
    })),
  ];

  const edges = [
    ...insightLinks.map((l) => [l.fromInsightId, l.toInsightId]),
    ...paperLinks.map((l) => [l.insightId, l.paperId]),
  ];

  const existingInsightPaperPairs = new Set(
    paperLinks.map((l) => `${l.insightId}|${l.paperId}`)
  );

  // If user has not manually linked insights to papers, infer a best paper match per insight.
  const inferredInsightPaperEdges = insights
    .map((insight) => {
      const alreadyLinked = paperLinks.some((l) => l.insightId === insight.id);
      if (alreadyLinked) return null;

      const insightTokens = tokenize(`${insight.title} ${insight.description}`);
      let bestPaper = null;
      let bestScore = 0;

      for (const paper of papers) {
        const paperTokens = tokenize(
          `${paper.title} ${paper.abstract || ''} ${(paper.keywords || []).join(' ')}`
        );
        const score = overlapScore(insightTokens, paperTokens);
        if (score > bestScore) {
          bestScore = score;
          bestPaper = paper;
        }
      }

      if (!bestPaper) return null;
      if (bestScore <= 0 && papers.length > 1) return null;

      const pairKey = `${insight.id}|${bestPaper.id}`;
      if (existingInsightPaperPairs.has(pairKey)) return null;
      return [insight.id, bestPaper.id];
    })
    .filter(Boolean);

  return { nodes, edges: [...edges, ...inferredInsightPaperEdges] };
}

module.exports = { getProjectGraph };
