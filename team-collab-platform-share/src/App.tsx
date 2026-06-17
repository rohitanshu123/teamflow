import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './store/AuthContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { Board } from './pages/Board'
import { Chat } from './pages/Chat'
import { Team } from './pages/Team'
import  {Signup}  from "./pages/signup"

function Protected({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { currentUser } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />

 {/* <Route
  path="/signup"
  element={currentUser ? <Navigate to="/dashboard" replace /> : <Signup />}
/> */}

<Route
  path="/signup"
  element={<Signup />}
/>

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/board" element={<Board />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/team" element={<Team />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
