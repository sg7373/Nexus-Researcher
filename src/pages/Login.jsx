import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const AppInput = ({ label, placeholder, type = 'text', value, onChange, required }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="w-full relative">
      {label && <label className="block mb-2 text-xs text-gray-400">{label}</label>}
      <div className="relative w-full">
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative z-10 border border-white/10 h-12 w-full rounded-xl bg-[#150825] px-4 text-white text-sm font-light outline-none transition-all duration-200 focus:bg-[#0A000F] placeholder:text-gray-600 focus:border-[#A855F7]/50"
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-0.5 z-20 rounded-t-xl overflow-hidden"
              style={{ background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, #A855F7 0%, transparent 70%)` }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-0.5 z-20 rounded-b-xl overflow-hidden"
              style={{ background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, #A855F7 0%, transparent 70%)` }}
            />
          </>
        )}
      </div>
    </div>
  )
}

const socialIcons = [
  {
    label: 'Google',
    href: `${API_BASE}/auth/google`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36003 19.27 5.00003 16.25 5.00003 12C5.00003 7.9 8.2 4.73 12.2 4.73C15.29 4.73 17.1 6.7 17.1 6.7L19 4.72C19 4.72 16.56 2 12.1 2C6.42003 2 2.03003 6.8 2.03003 12C2.03003 17.05 6.16003 22 12.25 22C17.6 22 21.5 18.33 21.5 12.91C21.5 11.76 21.35 11.1 21.35 11.1Z"/>
      </svg>
    )
  },
  {
    label: 'GitHub',
    href: `${API_BASE}/auth/github`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>
      </svg>
    )
  },
  {
    label: 'LinkedIn',
    href: `${API_BASE}/auth/linkedin`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.94 5a2 2 0 1 1-4-.002A2 2 0 0 1 6.94 5M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z"/>
      </svg>
    )
  },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(() => {
    const e = searchParams.get('error')
    if (e === 'oauth_cancelled') return 'Sign-in was cancelled.'
    if (e === 'oauth_failed') return 'OAuth sign-in failed. Please try again.'
    return null
  })
  const [loading, setLoading] = useState(false)

  // Mouse-tracking glow for the left panel
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await api.register({ name: form.name, email: form.email, password: form.password })
      }
      await login(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A000F] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50 border border-white/5" style={{ minHeight: '580px' }}>

        {/* Left — Form Panel */}
        <div
          className="relative flex-1 flex flex-col justify-center px-10 py-12 bg-[#0A000F] overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Mouse-tracking purple glow */}
          <div
            className={`absolute pointer-events-none w-96 h-96 rounded-full blur-3xl transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
              transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />

          <div className="relative z-10 max-w-sm mx-auto w-full">
            {/* Logo */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black tracking-widest text-[#A855F7]">NEXUS</h1>
              <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">Research Intelligence</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#150825] rounded-xl p-1 mb-8">
              {[['login', 'Sign In'], ['register', 'Register']].map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null) }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === m ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-900/40' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Social buttons */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {socialIcons.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  title={`Sign in with ${s.label}`}
                  className="w-11 h-11 rounded-full bg-[#150825] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#A855F7] hover:border-[#A855F7]/40 transition-all duration-300 hover:scale-110"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-gray-600">or use your account</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <AppInput
                  label="Full Name"
                  placeholder="Dr. Sarah Chen"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              )}
              <AppInput
                label="Email"
                placeholder="demo@nexus.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <AppInput
                label="Password"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              {mode === 'login' && (
                <div className="text-right">
                  <a href="#" className="text-xs text-gray-500 hover:text-[#A855F7] transition-colors">Forgot password?</a>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group/btn relative w-full overflow-hidden rounded-xl bg-[#A855F7] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-13deg)_translateX(-100%)] group-hover/btn:duration-700 group-hover/btn:transform-[skew(-13deg)_translateX(100%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
              </button>
            </form>

            {mode === 'login' && (
              <p className="text-center text-xs text-gray-600 mt-6">
                Demo: <span className="text-gray-400">demo@nexus.com</span> / <span className="text-gray-400">demo1234</span>
              </p>
            )}
          </div>
        </div>

        {/* Right — Image Panel */}
        <div className="hidden lg:block w-5/12 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=900&auto=format&fit=crop&q=80"
            alt="Research workspace"
            className="w-full h-full object-cover"
          />
          {/* overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-[#0A000F]/80 via-purple-950/40 to-transparent" />
          <div className="absolute bottom-10 left-8 right-8">
            <h2 className="text-2xl font-black text-white leading-tight mb-2">
              Your research,<br />
              <span className="text-[#A855F7]">intelligently connected.</span>
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              One workspace for papers, experiments, insights, and AI-powered discovery.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

