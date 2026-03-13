import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      navigate(`/login?error=${error}`, { replace: true })
      return
    }

    if (token) {
      loginWithToken(token)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch(() => navigate('/login?error=oauth_failed', { replace: true }))
    } else {
      navigate('/login', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0A000F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-purple-300 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
