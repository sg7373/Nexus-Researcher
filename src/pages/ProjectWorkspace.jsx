import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const tagColors = {
  CNN: 'bg-purple-500/20 text-purple-300',
  Scaling: 'bg-blue-500/20 text-blue-300',
  Efficiency: 'bg-cyan-500/20 text-cyan-300',
  Attention: 'bg-pink-500/20 text-pink-300',
  Transformers: 'bg-pink-500/20 text-pink-300',
  NLP: 'bg-green-500/20 text-green-300',
  GNN: 'bg-orange-500/20 text-orange-300',
  Climate: 'bg-green-500/20 text-green-300',
  Prediction: 'bg-yellow-500/20 text-yellow-300',
  NAS: 'bg-teal-500/20 text-teal-300',
  AutoML: 'bg-blue-500/20 text-blue-300',
  Optimization: 'bg-red-500/20 text-red-300',
  'Foundation Model': 'bg-indigo-500/20 text-indigo-300',
  'Transfer Learning': 'bg-violet-500/20 text-violet-300',
  'Sparse Attention': 'bg-amber-500/20 text-amber-300',
}

const statusColors = {
  Active: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  Completed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
}

const tabs = ['Papers', 'Experiments', 'Insights', 'Workflow']

function PapersTab({ projectId }) {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState({})
  const [summarizing, setSummarizing] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', authors: '', year: '', abstract: '' })
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  const loadPapers = () => {
    if (!projectId) return
    api.getPapers(projectId).then(setPapers).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { loadPapers() }, [projectId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await api.createPaper(projectId, { ...form, year: form.year ? Number(form.year) : undefined }, file)
      setForm({ title: '', authors: '', year: '', abstract: '' })
      setFile(null)
      setShowForm(false)
      loadPapers()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleSummarize = async (paperId, abstract) => {
    setSummarizing((s) => ({ ...s, [paperId]: true }))
    try {
      const result = abstract ? await api.aiSummarize(abstract) : await api.summarizePaper(paperId)
      setSummaries((s) => ({ ...s, [paperId]: result.summary || result }))
    } catch {
      setSummaries((s) => ({ ...s, [paperId]: 'Summary unavailable.' }))
    } finally {
      setSummarizing((s) => ({ ...s, [paperId]: false }))
    }
  }

  if (loading) return <div className="text-gray-500 text-sm py-10 text-center">Loading papers...</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Paper
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#150825] rounded-xl p-6 border border-[#A855F7]/20 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
            <input type="text" required placeholder="Paper title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Authors</label>
            <input type="text" placeholder="e.g. Smith et al." value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Year</label>
            <input type="number" placeholder="2024" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none placeholder:text-gray-600" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Abstract</label>
            <textarea placeholder="Paper abstract..." value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} rows={3}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none resize-none placeholder:text-gray-600" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Attach File <span className="text-gray-600">(PDF or .txt, optional)</span></label>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = '' }} />
            {file ? (
              <div className="flex items-center gap-2 bg-[#1D0A30] border border-[#A855F7]/30 rounded-lg px-3 py-2 text-xs text-purple-300">
                <span>📄</span>
                <span className="truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 ml-auto">✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#A855F7] bg-[#0A000F] border border-white/5 hover:border-[#A855F7]/30 rounded-lg px-3 py-2 transition-colors">
                📎 Attach PDF or text file
              </button>
            )}
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#A855F7] hover:bg-[#A855F7]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Saving...' : 'Save Paper'}
            </button>
          </div>
        </form>
      )}

      {papers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-sm">No papers yet. Click <strong className="text-gray-300">+ Add Paper</strong> to add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <div key={paper.id} className="bg-[#150825] rounded-xl p-5 border border-white/5 hover:border-[#A855F7]/30 transition-all duration-300">
              <h3 className="font-semibold text-white text-sm mb-1">{paper.title}</h3>
              <p className="text-xs text-[#A855F7] mb-2">{paper.authors} {paper.year ? `· ${paper.year}` : ''}</p>
              <p className="text-xs text-gray-400 mb-4 line-clamp-3">{paper.abstract}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(paper.tags || []).map((tag) => (
                  <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-gray-500/20 text-gray-300'}`}>{tag}</span>
                ))}
              </div>
              {summaries[paper.id] && (
                <div className="bg-[#0A000F] rounded-lg p-3 mb-3 text-xs text-gray-300 leading-relaxed">{summaries[paper.id]}</div>
              )}
              <button onClick={() => handleSummarize(paper.id, paper.abstract)} disabled={summarizing[paper.id]}
                className="text-xs bg-[#A855F7]/10 text-[#A855F7] hover:bg-[#A855F7]/20 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors">
                {summarizing[paper.id] ? '⏳ Summarizing...' : '✨ AI Summary'}
              </button>
              {paper.fileUrl && (
                <a href={`http://localhost:3000${paper.fileUrl}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors ml-2">
                  📄 View file
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ExperimentsTab({ projectId }) {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', hypothesis: '', status: 'Pending' })
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  const loadExperiments = () => {
    if (!projectId) return
    api.getExperiments(projectId).then(setExperiments).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { loadExperiments() }, [projectId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await api.createExperiment(projectId, form, file)
      setForm({ name: '', hypothesis: '', status: 'Pending' })
      setFile(null)
      setShowForm(false)
      loadExperiments()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-500 text-sm py-10 text-center">Loading experiments...</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm((v) => !v)}
          className="bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Add Experiment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#150825] rounded-xl p-6 border border-[#A855F7]/20 mb-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name *</label>
            <input type="text" required placeholder="Experiment name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:outline-none">
              <option>Pending</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hypothesis</label>
            <textarea placeholder="Your hypothesis..." value={form.hypothesis} onChange={(e) => setForm({ ...form, hypothesis: e.target.value })} rows={2}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none resize-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Attach File <span className="text-gray-600">(PDF or .txt, optional)</span></label>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = '' }} />
            {file ? (
              <div className="flex items-center gap-2 bg-[#1D0A30] border border-[#A855F7]/30 rounded-lg px-3 py-2 text-xs text-purple-300">
                <span>📄</span>
                <span className="truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 ml-auto">✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#A855F7] bg-[#0A000F] border border-white/5 hover:border-[#A855F7]/30 rounded-lg px-3 py-2 transition-colors">
                📎 Attach PDF or text file
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#A855F7] hover:bg-[#A855F7]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Saving...' : 'Save Experiment'}
            </button>
          </div>
        </form>
      )}

      {experiments.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-3xl mb-3">🔬</p>
          <p className="text-sm">No experiments yet. Click <strong className="text-gray-300">+ Add Experiment</strong> to get started.</p>
        </div>
      ) : (
        <div className="bg-[#150825] rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs">Name</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs">Status</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs hidden md:table-cell">Hypothesis</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {experiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 text-white font-medium">{exp.name}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[exp.status] || 'bg-gray-500/20 text-gray-300'}`}>{exp.status}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs hidden md:table-cell max-w-xs truncate">{exp.objective || exp.hypothesis}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function InsightsTab({ projectId }) {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  const loadInsights = () => {
    if (!projectId) return
    api.getInsights(projectId).then(setInsights).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { loadInsights() }, [projectId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await api.createInsight(projectId, form, file)
      setForm({ title: '', content: '' })
      setFile(null)
      setShowForm(false)
      loadInsights()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-500 text-sm py-10 text-center">Loading insights...</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm((v) => !v)}
          className="bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Add Insight
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#150825] rounded-xl p-6 border border-[#A855F7]/20 mb-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
            <input type="text" required placeholder="Insight title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Content</label>
            <textarea placeholder="Describe this insight..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3}
              className="w-full bg-[#0A000F] text-white text-sm rounded-lg px-3 py-2.5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none resize-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Attach File <span className="text-gray-600">(PDF or .txt, optional)</span></label>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = '' }} />
            {file ? (
              <div className="flex items-center gap-2 bg-[#1D0A30] border border-[#A855F7]/30 rounded-lg px-3 py-2 text-xs text-purple-300">
                <span>📄</span>
                <span className="truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 ml-auto">✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#A855F7] bg-[#0A000F] border border-white/5 hover:border-[#A855F7]/30 rounded-lg px-3 py-2 transition-colors">
                📎 Attach PDF or text file
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#A855F7] hover:bg-[#A855F7]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Saving...' : 'Save Insight'}
            </button>
          </div>
        </form>
      )}

      {insights.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-3xl mb-3">💡</p>
          <p className="text-sm">No insights yet. Click <strong className="text-gray-300">+ Add Insight</strong> to record your first finding.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-[#150825] rounded-xl p-5 border border-white/5 hover:border-[#A855F7]/30 transition-all duration-300">
              <h3 className="font-semibold text-white text-sm mb-1">💡 {insight.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{insight.description || insight.content}</p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500">{insight._count?.papers || 0} linked papers</span>
                {insight.fileUrl && (
                  <a href={`http://localhost:3000${insight.fileUrl}`} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
                    📄 View file
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WorkflowTab({ projectId }) {
  const [experiments, setExperiments] = useState([])

  useEffect(() => {
    if (!projectId) return
    api.getExperiments(projectId).then(setExperiments).catch(console.error)
  }, [projectId])

  const columns = [
    { title: 'Pending', items: experiments.filter((e) => e.status === 'Pending') },
    { title: 'Active', items: experiments.filter((e) => e.status === 'Active') },
    { title: 'Completed', items: experiments.filter((e) => e.status === 'Completed') },
    { title: 'Other', items: experiments.filter((e) => !['Pending', 'Active', 'Completed'].includes(e.status)) },
  ].filter((col) => col.items.length > 0 || col.title !== 'Other')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.title} className="bg-[#0A000F] rounded-xl border border-white/5 p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
            {col.title}
            <span className="text-xs text-gray-500 ml-auto">{col.items.length}</span>
          </h4>
          <div className="space-y-3">
            {col.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#150825] rounded-lg p-3 border border-white/5 hover:border-[#A855F7]/20 transition-all duration-200"
              >
                <p className="text-xs text-white mb-1">{item.name}</p>
                {item.hypothesis && (
                  <p className="text-[10px] text-gray-500 line-clamp-2">{item.hypothesis}</p>
                )}
              </div>
            ))}
            {col.items.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-4">Empty</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProjectWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = tabParam ? tabs.findIndex(t => t.toLowerCase() === tabParam.toLowerCase()) : 0
  const [activeTab, setActiveTab] = useState(initialTab >= 0 ? initialTab : 0)
  const [project, setProject] = useState(null)
  const [allProjects, setAllProjects] = useState([])

  useEffect(() => {
    api.getProjects().then(setAllProjects).catch(console.error)
  }, [])

  useEffect(() => {
    if (id && id !== 'new') {
      api.getProject(id).then(setProject).catch(console.error)
    }
  }, [id])

  return (
    <div className="p-8">
      {/* Project Picker bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white text-sm transition-colors">← Projects</button>
        {allProjects.length > 1 && (
          <>
            <span className="text-gray-600">/</span>
            <select
              value={id || ''}
              onChange={(e) => navigate(`/project/${e.target.value}`)}
              className="bg-[#150825] text-white text-sm rounded-lg px-3 py-1.5 border border-white/5 focus:outline-none"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.title || p.name}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{project?.title || project?.name || 'Project Workspace'}</h1>
        <p className="text-gray-400 text-sm max-w-2xl">{project?.description || ''}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#150825] rounded-xl p-1 w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === i
                ? 'bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && <PapersTab projectId={id} />}
      {activeTab === 1 && <ExperimentsTab projectId={id} />}
      {activeTab === 2 && <InsightsTab projectId={id} />}
      {activeTab === 3 && <WorkflowTab projectId={id} />}
    </div>
  )
}
