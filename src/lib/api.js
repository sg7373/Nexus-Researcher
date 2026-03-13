const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getToken() {
  return localStorage.getItem('nexus_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

async function formDataRequest(path, data, file) {
  const token = getToken()
  const form = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') form.append(k, String(v))
  })
  if (file) form.append('file', file)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/auth/me'),

  // Projects
  getProjects: () => request('/api/projects'),
  getProject: (id) => request(`/api/projects/${id}`),
  getProjectStats: (id) => request(`/api/projects/${id}/stats`),
  createProject: ({ name, ...rest }) => request('/api/projects', { method: 'POST', body: JSON.stringify({ title: name, ...rest }) }),
  updateProject: (id, data) => request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),

  // Papers
  getPapers: (projectId) => request(`/api/papers/project/${projectId}`),
  createPaper: (projectId, data, file) => formDataRequest(`/api/papers/project/${projectId}`, data, file),
  updatePaper: (id, data) => request(`/api/papers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePaper: (id) => request(`/api/papers/${id}`, { method: 'DELETE' }),
  summarizePaper: (id) => request(`/api/papers/${id}/summarize`, { method: 'POST' }),

  // Experiments
  getExperiments: (projectId) => request(`/api/experiments/project/${projectId}`),
  createExperiment: (projectId, data, file) => formDataRequest(`/api/experiments/project/${projectId}`, data, file),
  updateExperiment: (id, data) => request(`/api/experiments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExperiment: (id) => request(`/api/experiments/${id}`, { method: 'DELETE' }),
  getIterations: (expId) => request(`/api/experiments/${expId}/iterations`),
  addIteration: (expId, data) => request(`/api/experiments/${expId}/iterations`, { method: 'POST', body: JSON.stringify(data) }),

  // Insights
  getInsights: (projectId) => request(`/api/insights/project/${projectId}`),
  createInsight: (projectId, data, file) => formDataRequest(`/api/insights/project/${projectId}`, data, file),
  updateInsight: (id, data) => request(`/api/insights/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInsight: (id) => request(`/api/insights/${id}`, { method: 'DELETE' }),
  linkInsights: (id, data) => request(`/api/insights/${id}/link`, { method: 'POST', body: JSON.stringify(data) }),
  deleteInsightLink: (linkId) => request(`/api/insights/link/${linkId}`, { method: 'DELETE' }),
  linkPaper: (id, paperId) => request(`/api/insights/${id}/link-paper`, { method: 'POST', body: JSON.stringify({ paperId }) }),

  // Graph
  getGraph: (projectId) => request(`/api/graph/project/${projectId}`),

  // AI
  aiSummarize: (text) => request('/api/ai/summarize', { method: 'POST', body: JSON.stringify({ text }) }),
  aiKeywords: (text) => request('/api/ai/keywords', { method: 'POST', body: JSON.stringify({ text }) }),
  aiGaps: (projectContext) => request('/api/ai/gaps', { method: 'POST', body: JSON.stringify({ projectContext }) }),
  aiConnections: (insightsOrContext) => {
    const body = Array.isArray(insightsOrContext)
      ? { insights: insightsOrContext }
      : { projectContext: insightsOrContext }
    return request('/api/ai/connections', { method: 'POST', body: JSON.stringify(body) })
  },
  aiChat: (message, projectContext) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, projectContext }) }),
  aiChatWithFile: (file, message, projectContext) => {
    const token = getToken()
    const form = new FormData()
    form.append('file', file)
    if (message) form.append('message', message)
    if (projectContext) form.append('projectContext', projectContext)
    return fetch(`${BASE_URL}/api/ai/chat-with-file`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error || `Request failed: ${res.status}`)
      }
      return res.json()
    })
  },

  // Similarity
  compareDocs: (textA, textB) => request('/api/similarity/compare', { method: 'POST', body: JSON.stringify({ textA, textB }) }),
}
