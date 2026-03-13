const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
  'these', 'those', 'it', 'its', 'we', 'our', 'they', 'their', 'them',
  'he', 'she', 'his', 'her', 'i', 'me', 'my', 'you', 'your', 'which',
  'what', 'who', 'whom', 'how', 'when', 'where', 'why', 'not', 'no',
  'than', 'then', 'also', 'as', 'if', 'so', 'such', 'more', 'most',
  'very', 'each', 'all', 'both', 'few', 'some', 'any', 'other', 'into',
  'about', 'up', 'out', 'over', 'after', 'before', 'between', 'under',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function buildTFVector(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  return tf;
}

function cosineSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const tfA = buildTFVector(tokensA);
  const tfB = buildTFVector(tokensB);

  // Get all unique terms
  const allTerms = new Set([...Object.keys(tfA), ...Object.keys(tfB)]);

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const term of allTerms) {
    const a = tfA[term] || 0;
    const b = tfB[term] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

function getNgrams(tokens, minN, maxN) {
  const ngrams = new Set();
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.add(tokens.slice(i, i + n).join(' '));
    }
  }
  return ngrams;
}

function findMatchingPhrases(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const ngramsA = getNgrams(tokensA, 3, 8);
  const ngramsB = getNgrams(tokensB, 3, 8);

  const matching = [];
  for (const ngram of ngramsA) {
    if (ngramsB.has(ngram)) {
      matching.push(ngram);
    }
  }

  // Remove sub-phrases if a longer phrase contains them
  const filtered = matching.filter((phrase) => {
    return !matching.some((other) => other !== phrase && other.includes(phrase));
  });

  return filtered.sort((a, b) => b.split(' ').length - a.split(' ').length);
}

function compareDocs(textA, textB) {
  const exactScore = cosineSimilarity(textA, textB);
  const matchingPhrases = findMatchingPhrases(textA, textB);

  // Estimate semantic similarity boost from matching phrases
  const tokensA = tokenize(textA);
  const phraseTokenCount = matchingPhrases.reduce((sum, p) => sum + p.split(' ').length, 0);
  const semanticBoost = Math.min(phraseTokenCount / Math.max(tokensA.length, 1), 0.5);

  const combinedScore = Math.min(exactScore + semanticBoost * 0.5, 1.0);

  return {
    score: Math.round(combinedScore * 100) / 100,
    matchingPhrases: matchingPhrases.slice(0, 20),
    breakdown: {
      exact: Math.round(exactScore * 100) / 100,
      semantic: Math.round(semanticBoost * 100) / 100,
    },
  };
}

module.exports = { cosineSimilarity, findMatchingPhrases, compareDocs };
