import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Exercises from "./pages/exercises"
import WorkoutLogger from "./pages/WorkoutLogger"
import WorkoutHistory from "./pages/WorkoutHistory"


function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar /><div style={{ maxWidth: 1200, margin: "0 auto" }}><Dashboard /></div>
          </ProtectedRoute>
        } />
        <Route path="/exercises" element={
          <ProtectedRoute>
            <Navbar /><div style={{ maxWidth: 1200, margin: "0 auto" }}><Exercises /></div>
          </ProtectedRoute>
        } />
        <Route path="/workout" element={
          <ProtectedRoute>
            <Navbar /><div style={{ maxWidth: 1200, margin: "0 auto" }}><WorkoutLogger /></div>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <Navbar /><div style = {{ maxWidth: 1200, margin: "0 auto" }}><WorkoutHistory /></div>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App