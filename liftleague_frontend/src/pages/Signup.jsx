import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../api/api"
import { useAuth } from "../context/AuthContext"

function AuthInput({ label, type, placeholder, value, onChange, onKeyDown }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: focused ? "#c8f135" : "#555", transition: "color 0.2s" }}>
        {label}
      </label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange} onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: "#0a0a0a", border: `1px solid ${focused ? "#c8f135" : "#1e1e1e"}`,
          borderRadius: 10, padding: "0.8rem 1rem", color: "#f0f0f0",
          fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s",
        }}
      />
    </div>
  )
}

export default function Signup() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) return
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return }
    setLoading(true); setError("")
    try {
      const user = await registerUser(form)
      setUser(user)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem"
    }}>
      <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>

        <Link to="/" style={{ display: "flex", alignItems: "baseline", gap: 2, justifyContent: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#c8f135" }}>LIFT</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#f0f0f0" }}>LEAGUE</span>
        </Link>

        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>Join The League</h2>
          <p style={{ color: "#555", fontSize: "0.875rem", marginBottom: "2rem" }}>Create your account and start earning XP</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <AuthInput label="Username" type="text" placeholder="e.g. ironlifter99"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <AuthInput label="Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <AuthInput label="Password" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          <div style={{
            marginTop: "1.25rem", padding: "0.75rem 1rem",
            background: "rgba(200,241,53,0.05)", border: "1px solid rgba(200,241,53,0.1)",
            borderRadius: 10, display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <span>🏋️</span>
            <p style={{ color: "#555", fontSize: "0.8rem" }}>You'll start as a <span style={{ color: "#c8f135", fontWeight: 600 }}>Rookie</span> — grind your way to Titan!</p>
          </div>

          {error && <p style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: "1rem" }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", marginTop: "1.5rem", padding: "0.9rem",
            background: loading ? "#1e1e1e" : "#c8f135",
            color: loading ? "#444" : "#0a0a0a",
            border: "none", borderRadius: 10, fontSize: "0.9rem",
            fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#555", fontSize: "0.875rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#c8f135", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}