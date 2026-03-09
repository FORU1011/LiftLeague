import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/exercises", label: "Exercises" },
    { to: "/workout", label: "Log Workout" },
  ]

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <nav style={{
      background: "rgba(10,10,10,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #1e1e1e",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 2rem",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link to="/dashboard" style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.05em", color: "#c8f135" }}>LIFT</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.05em", color: "#f0f0f0" }}>LEAGUE</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8f135", marginLeft: 4, marginBottom: 2, display: "inline-block" }} />
        </Link>

        <div style={{ display: "flex", gap: "0.25rem" }}>
          {links.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} style={{
                padding: "0.4rem 1rem", borderRadius: 6,
                fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.02em",
                color: active ? "#0a0a0a" : "#888",
                background: active ? "#c8f135" : "transparent",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (!active) e.target.style.color = "#f0f0f0" }}
                onMouseLeave={e => { if (!active) e.target.style.color = "#888" }}
              >{label}</Link>
            )
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(200,241,53,0.15)", border: "1px solid rgba(200,241,53,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700, color: "#c8f135"
              }}>
                {user.username?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: "0.875rem", color: "#888", fontWeight: 500 }}>{user.username}</span>
            </div>
          )}
          <button onClick={handleLogout} style={{
            padding: "0.4rem 0.9rem", borderRadius: 6, fontSize: "0.8rem",
            fontWeight: 600, color: "#555", background: "transparent",
            border: "1px solid #1e1e1e", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff6b6b"; e.currentTarget.style.borderColor = "#ff6b6b33" }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#1e1e1e" }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar