import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

const quickActions = ['Summarize Papers', 'Find Gaps', 'Suggest Connections']

const ALLOWED_TYPES = ['application/pdf', 'text/plain']
const MAX_SIZE_MB = 10

function FileChip({ file, onRemove }) {
  const isPdf = file.type === 'application/pdf'
  return (
    <div className="flex items-center gap-2 bg-[#1D0A30] border border-[#A855F7]/30 rounded-lg px-3 py-1.5 text-xs text-purple-300 max-w-xs">
      <span>{isPdf ? '📄' : '📝'}</span>
      <span className="truncate max-w-40">{file.name}</span>
      <span className="text-gray-500">({(file.size / 1024).toFixed(0)} KB)</span>
      <button onClick={onRemove} className="text-gray-500 hover:text-red-400 ml-1 shrink-0">✕</button>
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m Nexus AI. Ask me anything about your research — I can summarize papers, find gaps, suggest connections, or answer questions. You can also attach a PDF or text file!' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [attachedFile, setAttachedFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.getProjects().then((data) => {
      setProjects(data)
      if (data.length > 0) setSelectedProject(data[0])
    }).catch(console.error)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (role, text, meta) => setMessages((prev) => [...prev, { role, text, ...meta }])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only PDF and .txt files are allowed.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Max ${MAX_SIZE_MB} MB.`)
      return
    }
    setFileError(null)
    setAttachedFile(file)
    // reset input so same file can be re-selected if removed
    e.target.value = ''
  }

  const handleSend = async () => {
    const msg = input.trim()
    if ((!msg && !attachedFile) || sending) return
    setInput('')
    const file = attachedFile
    setAttachedFile(null)

    const displayText = file
      ? (msg ? `📎 ${file.name}\n\n${msg}` : `📎 ${file.name}`)
      : msg
    addMessage('user', displayText)
    setSending(true)
    try {
      const context = selectedProject
        ? `Project: ${selectedProject.title || selectedProject.name}. ${selectedProject.description || ''}`
        : ''
      let result
      if (file) {
        result = await api.aiChatWithFile(file, msg || '', context)
      } else {
        result = await api.aiChat(msg, context)
      }
      addMessage('assistant', result.response || result.message || 'No response.')
    } catch (err) {
      addMessage('assistant', `Error: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleQuickAction = async (action) => {
    addMessage('user', action)
    setSending(true)
    try {
      let result
      const context = selectedProject
        ? `Project: ${selectedProject.title || selectedProject.name}. ${selectedProject.description || ''}`
        : ''
      if (action === 'Find Gaps') {
        result = await api.aiGaps(context)
        addMessage('assistant', result.gaps || result.response || JSON.stringify(result))
      } else if (action === 'Suggest Connections') {
        result = await api.aiConnections(context)
        addMessage('assistant', result.connections || result.response || JSON.stringify(result))
      } else {
        result = await api.aiChat(action, context)
        addMessage('assistant', result.response || result.message || 'No response.')
      }
    } catch (err) {
      addMessage('assistant', `Error: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center text-sm">
            🤖
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-white">Nexus AI Assistant</h1>
            <p className={`text-xs ${sending ? 'text-yellow-400' : 'text-green-400'}`}>
              {sending ? 'Thinking...' : 'Online · Ready'}
            </p>
          </div>
          {projects.length > 1 && (
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => setSelectedProject(projects.find((p) => p.id === e.target.value) || null)}
              className="bg-[#0A000F] text-white text-xs rounded-lg px-3 py-1.5 border border-white/5 focus:outline-none"
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
            </select>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#7C3AED] text-white rounded-br-md'
                    : 'bg-[#150825] text-gray-300 rounded-bl-md border border-white/5'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-[#150825] border border-white/5 rounded-2xl rounded-bl-md px-5 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#A855F7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#A855F7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#A855F7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-2 flex gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={sending}
              className="text-xs bg-[#150825] text-[#A855F7] hover:bg-[#A855F7]/10 disabled:opacity-50 px-3 py-1.5 rounded-lg border border-[#A855F7]/20 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/5">
          {/* File chip */}
          {attachedFile && (
            <div className="mb-3">
              <FileChip file={attachedFile} onRemove={() => setAttachedFile(null)} />
            </div>
          )}
          {fileError && (
            <p className="text-xs text-red-400 mb-2">{fileError}</p>
          )}
          <div className="flex gap-2 items-center">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              title="Attach PDF or text file"
              className="w-10 h-10 shrink-0 rounded-xl bg-[#150825] border border-white/5 hover:border-[#A855F7]/40 flex items-center justify-center text-gray-400 hover:text-[#A855F7] transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 0 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={sending}
              placeholder={attachedFile ? 'Ask something about the file, or send as-is…' : 'Ask Nexus AI about your research...'}
              className="flex-1 bg-[#150825] text-white text-sm rounded-xl px-5 py-3 border border-white/5 focus:border-[#A855F7]/50 focus:outline-none transition-colors placeholder:text-gray-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || (!input.trim() && !attachedFile)}
              className="bg-[#A855F7] hover:bg-[#A855F7]/80 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <div className="w-80 bg-[#150825] border-l border-white/5 p-6 overflow-y-auto shrink-0">
        <h2 className="text-sm font-semibold text-white mb-4">Active Project Context</h2>

        {selectedProject ? (
          <div className="bg-[#0A000F] rounded-xl p-4 border border-white/5 mb-6">
            <h3 className="text-sm font-medium text-[#A855F7] mb-1">{selectedProject.title || selectedProject.name}</h3>
            <p className="text-xs text-gray-400 line-clamp-3">{selectedProject.description}</p>
          </div>
        ) : (
          <div className="bg-[#0A000F] rounded-xl p-4 border border-white/5 mb-6">
            <p className="text-xs text-gray-500">No project selected</p>
          </div>
        )}

        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Tips
        </h3>
        <div className="space-y-2">
          {[
            'Attach a PDF to summarize or analyse it',
            'Ask about research gaps in your field',
            'Request connections between your papers',
            'Summarize your most recent findings',
            'Get methodology suggestions',
          ].map((tip) => (
            <div
              key={tip}
              className="bg-[#0A000F] rounded-lg px-3 py-2 text-xs text-gray-400 border border-white/5"
            >
              💡 {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
