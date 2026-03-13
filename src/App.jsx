import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ProjectWorkspace from './pages/ProjectWorkspace'
import InsightGraph from './pages/InsightGraph'
import AIAssistant from './pages/AIAssistant'
import SimilarityChecker from './pages/SimilarityChecker'
import Login from './pages/Login'
import OAuthCallback from './pages/OAuthCallback'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<Landing />} />
        <Route path="/project/:id" element={<ProjectWorkspace />} />
        <Route path="/graph" element={<InsightGraph />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/similarity" element={<SimilarityChecker />} />
      </Route>
    </Routes>
  )
}
