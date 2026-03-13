const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

function normalizeAxiosError(err) {
  if (err.response?.data?.detail) return new Error(String(err.response.data.detail));
  if (err.response?.data?.error) return new Error(String(err.response.data.error));
  if (err.code === 'ECONNREFUSED') return new Error(`FastAPI service is not running at ${FASTAPI_URL}`);
  return new Error(err.message || 'AI service error');
}

// Ask question to RAG
async function askRAG(question) {
  try {
    const response = await axios.post(`${FASTAPI_URL}/ask`, {
      question,
    });
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

// Upload PDF to FastAPI
async function uploadPaper(filePath, originalName) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: originalName || path.basename(filePath),
    contentType: 'application/pdf',
  });

  try {
    const response = await axios.post(`${FASTAPI_URL}/upload`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

function listToKeywords(text) {
  return text
    .split(/[\n,;]+/)
    .map((k) => k.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .filter((k, i, arr) => arr.indexOf(k) === i)
    .slice(0, 15);
}

async function summarizePaper(text) {
  const prompt = [
    'Summarize this paper in a structured way with 4 sections:',
    '1) Problem',
    '2) Method',
    '3) Contributions',
    '4) Results/Impact',
    '',
    `Text:\n${text.slice(0, 8000)}`,
  ].join('\n');

  const result = await askRAG(prompt);
  const answer = result.answer || result.response || '';
  return answer || 'Summary unavailable';
}

async function extractKeywords(text) {
  const prompt = [
    'Extract 10-15 concise research keywords from the given text.',
    'Return only the keywords as a plain comma-separated list. No explanation.',
    '',
    `Text:\n${text.slice(0, 6000)}`,
  ].join('\n');

  const result = await askRAG(prompt);
  const keywords = listToKeywords((result.answer || result.response || '').trim());

  if (keywords.length > 0) return keywords;

  return text
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9-]/g, ''))
    .filter((w) => w.length > 4)
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, 10);
}

async function generateResearchGaps(projectContext) {
  const prompt = [
    'Analyze this project context and identify 3-5 research gaps.',
    'For each gap include: why it matters and one concrete next-step experiment.',
    'Use numbered points and stay concise.',
    '',
    `Project Context:\n${(projectContext || '').slice(0, 6000)}`,
  ].join('\n');

  const result = await askRAG(prompt);
  const answer = result.answer || result.response || '';
  return answer || 'Unable to generate gap analysis';
}

async function suggestConnections(insightsList) {
  const insightsText = insightsList
    .map((ins, i) => `${i + 1}. ${ins.title || 'Insight'}: ${ins.description || ''}`)
    .join('\n');

  const prompt = [
    'Given these research insights, suggest 3 non-obvious connections.',
    'For each connection include:',
    '- Which insights are linked',
    '- Why they are related',
    '- A possible experiment to test the connection',
    '',
    `Insights:\n${insightsText.slice(0, 7000)}`,
  ].join('\n');

  const result = await askRAG(prompt);
  const answer = result.answer || result.response || '';
  return answer || 'Unable to suggest connections';
}

async function suggestConnectionsFromContext(projectContext) {
  const prompt = [
    'Suggest 3 possible research connections from this project context.',
    'Each connection should include: hypothesis, rationale, and quick experiment idea.',
    '',
    `Project Context:\n${(projectContext || '').slice(0, 7000)}`,
  ].join('\n');

  const result = await askRAG(prompt);
  const answer = result.answer || result.response || '';
  return answer || 'Unable to suggest connections';
}

async function chatWithAI(message, context) {
  const prompt = [
    'You are Nexus AI, a research assistant.',
    'Answer clearly and use bullet points when useful.',
    '',
    `Project Context:\n${(context || '').slice(0, 2500)}`,
    '',
    `User Question:\n${message}`,
  ].join('\n');

  const result = await askRAG(prompt);
  const answer = result.answer || result.response || '';
  return answer || 'Unable to generate a response';
}

async function chatWithFile(filePath, originalName, message, projectContext, mimetype) {
  if (mimetype === 'application/pdf') {
    await uploadPaper(filePath, originalName);

    const prompt = message
      ? [
        `A new paper named "${originalName}" was uploaded to the knowledge base.`,
        `Project Context: ${(projectContext || '').slice(0, 1500)}`,
        `Question: ${message}`,
      ].join('\n')
      : [
        `A new paper named "${originalName}" was uploaded to the knowledge base.`,
        'Provide a concise structured summary of this paper.',
        `Project Context: ${(projectContext || '').slice(0, 1500)}`,
      ].join('\n');

    const result = await askRAG(prompt);
    return result.answer || result.response || 'Unable to generate a response';
  }

  const text = fs.readFileSync(filePath, 'utf-8');
  const prompt = [
    `The user uploaded a text file named "${originalName}".`,
    `Project Context: ${(projectContext || '').slice(0, 1500)}`,
    message ? `Question: ${message}` : 'Task: summarize and analyze key ideas.',
    '',
    `File Content:\n${text.slice(0, 8000)}`,
  ].join('\n');

  const result = await askRAG(prompt);
  return result.answer || result.response || 'Unable to generate a response';
}

module.exports = {
  summarizePaper,
  extractKeywords,
  generateResearchGaps,
  suggestConnections,
  suggestConnectionsFromContext,
  chatWithAI,
  chatWithFile,
};
