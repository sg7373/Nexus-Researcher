import { useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: '📄',
    title: 'Upload Papers & Get AI Summaries',
    desc: 'Drop any research paper and instantly receive a concise AI-generated summary, key themes, and extracted keywords — no more reading 40-page PDFs to get the gist.',
  },
  {
    icon: '🔬',
    title: 'Track Experiments & Hypotheses',
    desc: 'Log experiments with their status, link them to hypotheses, and watch your research method become fully traceable from question to conclusion.',
  },
  {
    icon: '💡',
    title: 'Auto-Connect Insights',
    desc: 'Capture insights as you work. Nexus auto-maps connections between them and visualizes the knowledge web your research is weaving — in real time.',
  },
  {
    icon: '🔍',
    title: 'Similarity & Plagiarism Detection',
    desc: 'Paste any two documents and get an instant semantic similarity score, phrase-level breakdown, and matched excerpt highlighting.',
  },
  {
    icon: '🤖',
    title: 'Ask Your Research in Plain English',
    desc: 'The AI Assistant has context over your entire project — papers, experiments, insights — and can answer questions, surface gaps, and suggest connections.',
  },
]

const audience = [
  { icon: '🎓', label: 'PhD Students' },
  { icon: '🔭', label: 'University Researchers' },
  { icon: '🏭', label: 'R&D Teams' },
  { icon: '📰', label: 'Investigative Journalists' },
  { icon: '📊', label: 'Data Analysts' },
  { icon: '🏛️', label: 'Research Institutions' },
]

const pricing = [
  {
    tier: 'Free',
    price: '$0',
    period: 'forever',
    target: 'Students',
    color: 'border-white/10',
    accent: 'text-gray-300',
    features: ['2 Projects', '20 Papers', 'AI Summaries', 'Basic Graph'],
  },
  {
    tier: 'Researcher',
    price: '$12',
    period: 'per month',
    target: 'Individual Researchers',
    color: 'border-[#A855F7]/50',
    accent: 'text-[#A855F7]',
    highlight: true,
    features: ['Unlimited Projects', 'Unlimited Papers', 'Full AI Suite', 'Lineage Graph', 'Export'],
  },
  {
    tier: 'Lab',
    price: '$49',
    period: 'per user / month',
    target: 'Research Teams',
    color: 'border-purple-500/40',
    accent: 'text-purple-400',
    features: ['Everything in Researcher', 'Team Collaboration', 'Shared Graphs', 'Admin Controls', 'Priority Support'],
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: 'institutional pricing',
    target: 'Universities & Institutes',
    color: 'border-white/10',
    accent: 'text-amber-400',
    features: ['Everything in Lab', 'SSO / SAML', 'On-premise Option', 'SLA & Compliance', 'Dedicated CSM'],
  },
]

const stack = [
  { label: 'React 18', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { label: 'Vite', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { label: 'TailwindCSS v4', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { label: 'Node.js + Express', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { label: 'PostgreSQL', color: 'bg-blue-600/20 text-blue-300 border-blue-600/30' },
  { label: 'Prisma ORM', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { label: 'D3.js', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { label: 'HuggingFace BART', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { label: 'Mistral-7B', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { label: 'JWT Auth', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
]

export default function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAboutPage = location.pathname === '/about'
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  useEffect(() => {
    if (!loading && user && !isAboutPage) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate, isAboutPage])

  if (loading && !isAboutPage) return null

  return (
    <div className="min-h-screen bg-[#0A000F] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0A000F]/80 backdrop-blur-md border-b border-white/5">
        <div>
          <span className="text-xl font-bold tracking-wider text-[#A855F7]">NEXUS</span>
          <span className="ml-2 text-xs text-gray-500 tracking-widest uppercase">Research Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                )}
                <span className="text-sm text-gray-200 max-w-40 truncate">{user.name || 'Researcher'}</span>
              </div>
              <Link to="/dashboard" className="text-sm bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-5 py-2 rounded-xl font-medium transition-colors">
                Dashboard →
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">Sign In</Link>
              <Link to="/login" className="text-sm bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-5 py-2 rounded-xl font-medium transition-colors">
                Get Started Free →
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#A855F7]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-100 h-100 bg-purple-600/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-100 h-100 bg-blue-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            <span className="text-white">NEXUS</span>
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' }}>
              Research Intelligence
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The AI-powered workspace that understands your research, connects your insights, and thinks alongside you — from first paper to final conclusion.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-8 py-3.5 rounded-2xl font-semibold text-base transition-all hover:scale-105 shadow-lg shadow-[#A855F7]/20"
            >
              Launch the Platform →
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-8 py-3.5 rounded-2xl font-medium text-base transition-colors border border-white/10"
            >
              See How It Works
            </a>
          </div>

          {/* Metric pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-14">
            {[
              { value: '30–40%', label: 'research time wasted on tool-switching' },
              { value: '5 tools', label: 'replaced by one platform' },
              { value: '12×', label: 'LTV to CAC ratio projected' },
              { value: '$1M+', label: 'target ARR year one' },
            ].map((m) => (
              <div key={m.label} className="bg-[#150825]/80 border border-white/5 rounded-2xl px-5 py-3 text-center backdrop-blur">
                <div className="text-2xl font-black text-[#A855F7]">{m.value}</div>
                <div className="text-xs text-gray-500 mt-0.5 max-w-35">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <span>↓</span>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs text-red-400 font-semibold tracking-widest uppercase mb-4">The Problem</div>
            <h2 className="text-4xl font-black text-white mb-6 leading-tight">
              Researchers lose <span className="text-red-400">30–40%</span> of their time managing scattered tools.
            </h2>
            <p className="text-gray-400 leading-relaxed">
              PDFs in one folder. Notes in another. Experiments in a spreadsheet. Insights buried in email threads. There's no single place that connects a paper read 3 months ago to the hypothesis being tested today.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Insights get lost. Work gets duplicated. And there's <span className="text-white font-medium">zero traceability</span> of how a conclusion was actually reached.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { tool: 'Google Drive / Dropbox', pain: 'PDF graveyard, no structure' },
              { tool: 'Zotero / Mendeley', pain: 'Citation only, no insights layer' },
              { tool: 'Notion / Obsidian', pain: 'Manual, no AI, no graph' },
              { tool: 'Excel / Sheets', pain: 'Experiments with no context' },
              { tool: 'ChatGPT', pain: 'No memory of your research' },
            ].map((r) => (
              <div key={r.tool} className="flex items-start gap-4 bg-[#150825] rounded-xl px-5 py-4 border border-red-500/10">
                <span className="text-red-400 mt-0.5 text-lg">✗</span>
                <div>
                  <div className="text-white text-sm font-medium">{r.tool}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{r.pain}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#150825]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-[#A855F7] font-semibold tracking-widest uppercase mb-4">What Nexus Does</div>
            <h2 className="text-4xl font-black text-white">One intelligent workspace. Everything connected.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#0A000F] rounded-2xl p-6 border border-white/5 hover:border-[#A855F7]/30 transition-all hover:-translate-y-1 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold text-sm mb-2 group-hover:text-[#A855F7] transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Innovation — Insight Lineage Graph */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-[#A855F7]/20 bg-linear-to-br from-[#150825] to-[#0A000F]">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-[#A855F7]/8 blur-3xl" />
            </div>
            <div className="relative z-10 p-10 md:p-16">
              <div className="inline-flex items-center gap-2 bg-[#A855F7]/15 border border-[#A855F7]/30 rounded-full px-4 py-1.5 text-xs text-[#A855F7] font-semibold mb-8 tracking-wider uppercase">
                ⭐ Key Innovation
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                The Insight<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
                  Lineage Graph
                </span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-8">
                A visual, interactive map that shows exactly how every insight was derived. Click any conclusion and trace it back through the experiments, observations, and papers that produced it.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {[
                  { icon: '🕸️', label: 'Interactive knowledge graph', sub: 'D3.js force-directed layout' },
                  { icon: '🔗', label: 'Click-to-trace lineage', sub: 'Paper → Experiment → Insight' },
                  { icon: '🚫', label: 'No other tool does this', sub: 'Completely unique to Nexus' },
                ].map((p) => (
                  <div key={p.label} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="text-2xl mb-2">{p.icon}</div>
                    <div className="text-white text-sm font-semibold">{p.label}</div>
                    <div className="text-gray-500 text-xs mt-1">{p.sub}</div>
                  </div>
                ))}
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              >
                Explore the Graph →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6 bg-[#150825]/30">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-xs text-gray-500 font-semibold tracking-widest uppercase mb-8">Tech Stack</div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {stack.map((s) => (
              <span
                key={s.label}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full border ${s.color}`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs text-[#A855F7] font-semibold tracking-widest uppercase mb-4">Who It's For</div>
            <h2 className="text-4xl font-black text-white">Built for anyone who works with knowledge</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {audience.map((a) => (
              <div
                key={a.label}
                className="bg-[#150825] rounded-2xl p-5 text-center border border-white/5 hover:border-[#A855F7]/30 transition-all hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{a.icon}</div>
                <div className="text-xs text-gray-400 font-medium leading-tight">{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-24 px-6 bg-[#150825]/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs text-[#A855F7] font-semibold tracking-widest uppercase mb-4">Business Model</div>
            <h2 className="text-4xl font-black text-white">Freemium SaaS</h2>
            <p className="text-gray-500 mt-3">Target ARR of <span className="text-white font-semibold">$1M+</span> by end of year one · <span className="text-white font-semibold">12× LTV:CAC</span></p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pricing.map((p) => (
              <div
                key={p.tier}
                className={`rounded-2xl p-6 border ${p.color} ${p.highlight ? 'bg-[#A855F7]/5' : 'bg-[#0A000F]'} relative`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#A855F7] text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className={`text-xs font-bold tracking-widest uppercase mb-3 ${p.accent}`}>{p.tier}</div>
                <div className="text-white">
                  <span className="text-3xl font-black">{p.price}</span>
                  {p.price !== 'Custom' && <span className="text-gray-500 text-xs ml-1">/{p.period}</span>}
                  {p.price === 'Custom' && <div className="text-gray-500 text-xs mt-0.5">{p.period}</div>}
                </div>
                <div className="text-xs text-gray-500 mt-1 mb-5">{p.target}</div>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className={`mt-0.5 ${p.accent}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Line CTA */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-[#A855F7]/8 blur-3xl rounded-full" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            Nexus doesn't just<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
              store research.
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            It understands it, connects it, and helps you think through it.<br />
            <span className="text-white font-medium">The research workspace that thinks alongside you.</span>
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 bg-[#A855F7] hover:bg-[#A855F7]/80 text-white px-10 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105 shadow-xl shadow-[#A855F7]/20"
          >
            Start for Free →
          </Link>
          <p className="text-xs text-gray-600 mt-5">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="text-sm text-gray-600">
          <span className="text-[#A855F7] font-bold">NEXUS</span> Research Intelligence Platform · Built for Augenblick Hackathon 2026
        </div>
      </footer>
    </div>
  )
}
