import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nexus_token')
    if (token) {
      api.me()
        .then((u) => setUser(u))
        .catch(() => localStorage.removeItem('nexus_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await api.login({ email, password })
    localStorage.setItem('nexus_token', data.token)
    setUser(data.user)
    return data.user
  }

  const loginWithToken = async (token) => {
    localStorage.setItem('nexus_token', token)
    const u = await api.me()
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('nexus_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
