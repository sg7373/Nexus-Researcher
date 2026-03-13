import { useState } from 'react'
import { api } from '../lib/api'

function highlightText(text, phrases) {
  if (!phrases || phrases.length === 0) return <span>{text}</span>
  let result = text
  phrases.forEach((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    result = result.replace(regex, '|||$1|||')
  })
  const parts = result.split('|||')
  return parts.map((part, i) => {
    const isHighlight = phrases.some((p) => part.toLowerCase() === p.toLowerCase())
    if (isHighlight) {
      return (
        <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">
          {part}
        </mark>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function SimilarityChecker() {
  const [docA, setDocA] = useState('')
  const [docB, setDocB] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const similarity = result ? Math.round((result.score || 0) * 100) : 0
  const matchingPhrases = result?.matchingPhrases || []

  const getSimilarityColor = (pct) => {
    if (pct >= 75) return 'text-red-400'
    if (pct >= 50) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getSimilarityLabel = (pct) => {
    if (pct >= 75) return 'High similarity detected'
    if (pct >= 50) return 'Moderate similarity detected'
    return 'Low similarity'
  }

  const handleAnalyze = async () => {
    if (!docA.trim() || !docB.trim()) {
      setError('Please enter text in both documents.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await api.compareDocs(docA, docB)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Similarity Checker</h1>
        <p className="text-gray-400 text-sm">Compare documents to detect overlapping content and paraphrased passages.</p>
      </div>

      {/* Document Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Document A</label>
          <textarea
            value={docA}
            onChange={(e) => { setDocA(e.target.value); setResult(null) }}
            placeholder="Paste the first document text here..."
            className="w-full h-64 bg-[#150825] text-gray-300 text-sm rounded-xl p-5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none resize-none transition-colors placeholder:text-gray-600"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Document B</label>
          <textarea
            value={docB}
            onChange={(e) => { setDocB(e.target.value); setResult(null) }}
            placeholder="Paste the second document text here..."
            className="w-full h-64 bg-[#150825] text-gray-300 text-sm rounded-xl p-5 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none resize-none transition-colors placeholder:text-gray-600"
          />
        </div>
      </div>

      {error && (
        <div className="flex justify-center mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-[#A855F7] hover:bg-[#A855F7]/80 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? '⏳ Analyzing...' : '🔍 Analyze Similarity'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Similarity Score */}
          <div className="flex justify-center">
            <div className="bg-[#150825] rounded-2xl p-8 border border-white/5 text-center">
              <p className="text-sm text-gray-400 mb-2">Overall Similarity</p>
              <p className={`text-7xl font-bold ${getSimilarityColor(similarity)}`}>
                {similarity}%
              </p>
              <p className={`text-sm mt-2 ${getSimilarityColor(similarity)}`}>
                {getSimilarityLabel(similarity)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          {result.breakdown && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Similarity Breakdown</h3>
              <div className="bg-[#150825] rounded-xl p-6 border border-white/5 space-y-4">
                {[
                  { label: 'Exact Match', pct: Math.round((result.breakdown.exact || 0) * 100) },
                  { label: 'Semantic Similarity', pct: Math.round((result.breakdown.semantic || 0) * 100) },
                ].map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">{cat.label}</span>
                      <span className="text-gray-300 font-medium">{cat.pct}%</span>
                    </div>
                    <div className="h-2.5 bg-[#0A000F] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${cat.pct >= 75 ? 'bg-red-400' : cat.pct >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlighted documents */}
          {matchingPhrases.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Matching Passages ({matchingPhrases.length} found)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#150825] rounded-xl p-5 border border-white/5">
                  <p className="text-xs text-gray-500 mb-3 font-medium">Document A</p>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {highlightText(docA, matchingPhrases)}
                  </p>
                </div>
                <div className="bg-[#150825] rounded-xl p-5 border border-white/5">
                  <p className="text-xs text-gray-500 mb-3 font-medium">Document B</p>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {highlightText(docB, matchingPhrases)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Matched Phrases
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchingPhrases.slice(0, 12).map((phrase, i) => (
                    <span
                      key={i}
                      className="text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-3 py-1 rounded-full"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
