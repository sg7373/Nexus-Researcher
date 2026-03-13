import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const typeColors = {
  paper: { bg: 'bg-[#7C3AED]', border: 'border-[#7C3AED]', text: 'text-[#7C3AED]' },
  insight: { bg: 'bg-[#A855F7]', border: 'border-[#A855F7]', text: 'text-[#A855F7]' },
  experiment: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400' },
}

const nodeDetails = {
  1: {
    title: 'Neural Architecture Search',
    description: 'Automated methods for discovering optimal neural network architectures using search algorithms and performance estimation strategies.',
    papers: ['DARTS: Differentiable Architecture Search', 'EfficientNet: Rethinking Model Scaling'],
    insights: ['Architecture Scaling Laws', 'Cross-Domain Transfer Potential'],
  },
  2: {
    title: 'Attention Mechanisms',
    description: 'Core component of transformer architectures that allows models to weigh the importance of different input elements dynamically.',
    papers: ['Attention Is All You Need', 'Sparse Transformers for Long-Range Dependencies'],
    insights: ['Attention Sparsity Threshold'],
  },
  3: {
    title: 'Climate Prediction',
    description: 'Using deep learning to forecast weather patterns and long-term climate changes with improved accuracy over numerical models.',
    papers: ['Graph Neural Networks for Climate Prediction', 'ClimaX: A Foundation Model'],
    insights: ['GNN Expressiveness Gap', 'Cross-Domain Transfer Potential'],
  },
  4: {
    title: 'Graph Neural Networks',
    description: 'Neural network architectures designed to operate on graph-structured data, capturing relationships between interconnected entities.',
    papers: ['Graph Neural Networks for Climate Prediction'],
    insights: ['GNN Expressiveness Gap'],
  },
  5: {
    title: 'Transfer Learning',
    description: 'Technique of leveraging knowledge from pre-trained models to improve performance on related downstream tasks with limited data.',
    papers: ['ClimaX: A Foundation Model'],
    insights: ['Cross-Domain Transfer Potential'],
  },
  6: {
    title: 'Model Efficiency',
    description: 'Research focused on reducing computational cost and memory usage of deep learning models without significantly sacrificing performance.',
    papers: ['EfficientNet: Rethinking Model Scaling', 'Sparse Transformers for Long-Range Dependencies'],
    insights: ['Architecture Scaling Laws'],
  },
  7: {
    title: 'Sparse Transformers',
    description: 'Transformer variants that use sparse attention patterns to reduce the quadratic complexity of standard self-attention.',
    papers: ['Sparse Transformers for Long-Range Dependencies'],
    insights: ['Attention Sparsity Threshold'],
  },
  8: {
    title: 'Scaling Laws',
    description: 'Empirical relationships describing how model performance changes as a function of model size, dataset size, and compute budget.',
    papers: ['EfficientNet: Rethinking Model Scaling'],
    insights: ['Architecture Scaling Laws'],
  },
  9: {
    title: 'Edge Deployment',
    description: 'Optimizing deep learning models for inference on resource-constrained devices such as mobile phones and embedded systems.',
    papers: ['EfficientNet: Rethinking Model Scaling'],
    insights: ['Architecture Scaling Laws'],
  },
  10: {
    title: 'Foundation Models',
    description: 'Large pre-trained models that can be adapted to a wide range of downstream tasks through fine-tuning or prompting.',
    papers: ['ClimaX: A Foundation Model', 'Attention Is All You Need'],
    insights: ['Cross-Domain Transfer Potential'],
  },
}

const filters = ['All', 'Papers', 'Insights', 'Experiments']

export default function InsightGraph() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [graphNodes, setGraphNodes] = useState([])
  const [graphEdges, setGraphEdges] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load projects list
  useEffect(() => {
    api.getProjects().then((data) => {
      setProjects(data)
      if (data.length > 0) setSelectedProject(data[0].id)
    }).catch(console.error)
  }, [])

  // Load graph when project changes
  useEffect(() => {
    if (!selectedProject) return
    setLoading(true)
    api.getGraph(selectedProject)
      .then((data) => {
        // data = { nodes: [...], edges: [[aId, bId], ...] } or [{ from, to }, ...]
        const nodes = (data.nodes || []).map((n, i) => ({
          ...n,
          x: n.x ?? 120 + (i % 5) * 180,
          y: n.y ?? 120 + Math.floor(i / 5) * 150,
        }))
        const edges = (data.edges || [])
          .map((e) => Array.isArray(e) ? e : [e.from, e.to])
          .filter(([a, b]) => a && b)
        setGraphNodes(nodes)
        setGraphEdges(edges)
        setSelectedNode(null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedProject])

  const filteredNodes = graphNodes.filter((node) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Papers') return node.type === 'paper'
    if (activeFilter === 'Insights') return node.type === 'insight'
    if (activeFilter === 'Experiments') return node.type === 'experiment'
    return true
  })

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id))
  const filteredEdges = graphEdges.filter(([a, b]) => filteredNodeIds.has(a) && filteredNodeIds.has(b))

  // Build detail panel from selected node
  const detail = selectedNode ? {
    title: selectedNode.label,
    description: selectedNode.description || `A ${selectedNode.type} in your research workspace.`,
    papers: (selectedNode.linkedPapers || []),
    insights: (selectedNode.linkedInsights || []),
  } : null

  return (
    <div className="flex h-screen">
      {/* Graph Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Filter & Project Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-white/5">
          {projects.length > 1 && (
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-[#150825] text-white text-xs rounded-lg px-3 py-1.5 border border-white/5 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title || p.name}</option>
              ))}
            </select>
          )}
          <span className="text-sm text-gray-400">Filter:</span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-[#A855F7] text-white'
                  : 'bg-[#150825] text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[#0A1420]">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, #A855F7 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm z-10">
              Loading graph...
            </div>
          )}

          {!loading && filteredNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm z-10">
              No data available for this project.
            </div>
          )}

          {/* SVG Edges */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {filteredEdges.map(([aId, bId], i) => {
              const a = filteredNodes.find((n) => n.id === aId)
              const b = filteredNodes.find((n) => n.id === bId)
              if (!a || !b) return null
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#A855F7"
                  strokeOpacity={0.15}
                  strokeWidth={1.5}
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const colors = typeColors[node.type]
            const isSelected = selectedNode?.id === node.id
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`absolute flex flex-col items-center gap-2 group transition-all duration-200`}
                style={{ left: node.x - 40, top: node.y - 40, zIndex: 2 }}
              >
                <div
                  className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center text-white text-xs font-bold border-2 ${
                    isSelected ? 'border-white scale-110 shadow-lg shadow-[#A855F7]/30' : `${colors.border}/50 group-hover:scale-110`
                  } transition-all duration-200`}
                >
                  {node.label.split(' ').map((w) => w[0]).join('').slice(0, 3)}
                </div>
                <span
                  className={`text-[10px] max-w-24 text-center leading-tight ${
                    isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  } transition-colors`}
                >
                  {node.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Details Panel */}
      <div className="w-80 bg-[#150825] border-l border-white/5 p-6 overflow-y-auto shrink-0">
        {detail ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`w-3 h-3 rounded-full ${typeColors[selectedNode.type]?.bg || 'bg-gray-400'}`}
              />
              <span className="text-xs text-gray-400 capitalize">{selectedNode.type}</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-3">{detail.title}</h2>
            <p className="text-sm text-gray-400 mb-6">{detail.description}</p>

            {detail.papers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Linked Papers ({detail.papers.length})
                </h3>
                <div className="space-y-2">
                  {detail.papers.map((p, i) => (
                    <div
                      key={i}
                      className="bg-[#0A000F] rounded-lg px-3 py-2 text-xs text-gray-300 border border-white/5"
                    >
                      📄 {typeof p === 'string' ? p : p.title || p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.insights.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Linked Insights ({detail.insights.length})
                </h3>
                <div className="space-y-2">
                  {detail.insights.map((ins, i) => (
                    <div
                      key={i}
                      className="bg-[#0A000F] rounded-lg px-3 py-2 text-xs text-gray-300 border border-white/5"
                    >
                      💡 {typeof ins === 'string' ? ins : ins.title || ins}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-4">🕸️</span>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Knowledge Graph</h3>
            <p className="text-xs text-gray-500">
              Click a node to view details about research concepts, papers, and their connections.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
