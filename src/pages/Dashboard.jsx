import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const tagColors = {
  'Deep Learning': 'bg-purple-500/20 text-purple-300',
  'AutoML': 'bg-blue-500/20 text-blue-300',
  'NAS': 'bg-teal-500/20 text-teal-300',
  'Climate Science': 'bg-green-500/20 text-green-300',
  'GNN': 'bg-orange-500/20 text-orange-300',
  'Forecasting': 'bg-yellow-500/20 text-yellow-300',
  'Transformers': 'bg-pink-500/20 text-pink-300',
  'Efficiency': 'bg-cyan-500/20 text-cyan-300',
  'Edge AI': 'bg-red-500/20 text-red-300',
}

function NewProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const project = await api.createProject({ name: form.name, description: form.description })
      onCreate(project)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#150825] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-6">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Project Name *</label>
            <input
              type="text"
              placeholder="e.g. Transformer Efficiency Study"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
              className="w-full bg-[#0A000F] text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none placeholder:text-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
            <textarea
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-[#0A000F] text-white text-sm rounded-xl px-4 py-3 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none resize-none placeholder:text-gray-600"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#A855F7] hover:bg-[#A855F7]/80 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({ projects: 0, papers: 0, insights: 0, experiments: 0 })
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)

  const loadProjects = () => {
    api.getProjects()
      .then((data) => {
        setProjects(data)
        setStats((s) => ({ ...s, projects: data.length }))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProjects() }, [])

  const displayStats = [
    { label: 'Projects', value: stats.projects, icon: '📁' },
    { label: 'Papers', value: stats.papers, icon: '📄' },
    { label: 'Insights', value: stats.insights, icon: '💡' },
    { label: 'Experiments', value: stats.experiments, icon: '🔬' },
  ]

  const firstName = user?.name?.trim() ? user.name.trim().split(' ')[0] : (user?.email?.split('@')[0] || 'Researcher')

  return (
    <div className="p-8">
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreate={(project) => {
            setShowNewProject(false)
            navigate(`/project/${project.id}`)
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {firstName}</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {displayStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#150825] rounded-xl p-5 border border-white/5 hover:border-[#A855F7]/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Projects Grid */}
        <div className="xl:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Projects</h2>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="bg-[#150825] rounded-xl p-10 border border-white/5 text-center">
              <p className="text-4xl mb-4">📁</p>
              <p className="text-gray-300 font-medium mb-1">No projects yet</p>
              <p className="text-gray-500 text-sm mb-5">Create your first research project to get started</p>
              <button
                onClick={() => setShowNewProject(true)}
                className="bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                + Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="bg-[#150825] rounded-xl p-5 border border-white/5 hover:border-[#A855F7]/30 hover:shadow-lg hover:shadow-[#A855F7]/5 transition-all duration-300 group"
                >
                  <h3 className="font-semibold text-white group-hover:text-[#A855F7] transition-colors text-sm mb-2">
                    {project.title || project.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{project.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(project.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-gray-500/20 text-gray-300'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-[10px] text-gray-500">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently updated'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="bg-[#150825] rounded-xl border border-white/5 divide-y divide-white/5">
            {[
              { label: '🤖 Open AI Assistant', to: '/assistant' },
              { label: '🔍 Similarity Check', to: '/similarity' },
              { label: '🕸️ View Knowledge Graph', to: '/graph' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-5 py-4 hover:bg-white/2 transition-colors text-sm text-gray-300 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
