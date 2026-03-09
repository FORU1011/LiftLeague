import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>

      {/* Navbar */}
      <nav style={{
        padding: "0 2rem", height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #1a1a1a"
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#c8f135" }}>LIFT</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#f0f0f0" }}>LEAGUE</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8f135", marginLeft: 4, display: "inline-block" }} />
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/login" style={{
            padding: "0.45rem 1.1rem", borderRadius: 8, fontSize: "0.875rem",
            fontWeight: 500, color: "#888", border: "1px solid #1e1e1e",
          }}>Log In</Link>
          <Link to="/signup" style={{
            padding: "0.45rem 1.1rem", borderRadius: 8, fontSize: "0.875rem",
            fontWeight: 600, color: "#0a0a0a", background: "#c8f135"
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4rem 2rem" }}>

        <div className="fade-up" style={{
          display: "inline-block", fontSize: "0.7rem", fontWeight: 600,
          letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8f135",
          background: "rgba(200,241,53,0.08)", border: "1px solid rgba(200,241,53,0.2)",
          padding: "0.3rem 0.9rem", borderRadius: 999, marginBottom: "2rem"
        }}>
          Level Up Your Training
        </div>

        <h1 className="fade-up-1" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(3.5rem, 12vw, 8rem)",
          letterSpacing: "0.03em", lineHeight: 0.95,
          color: "#f0f0f0", marginBottom: "1.5rem"
        }}>
          Train Hard.<br />
          <span style={{ color: "#c8f135" }}>Rank Higher.</span>
        </h1>

        <p className="fade-up-2" style={{
          color: "#555", fontSize: "clamp(1rem, 2vw, 1.2rem)",
          maxWidth: 480, lineHeight: 1.7, marginBottom: "3rem"
        }}>
          Log workouts, earn XP, climb the leaderboard. LiftLeague turns your gym grind into a competitive experience.
        </p>

        <div className="fade-up-3" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/signup" style={{
            padding: "0.9rem 2.5rem", borderRadius: 10, fontSize: "0.95rem",
            fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
            color: "#0a0a0a", background: "#c8f135",
          }}>Start For Free</Link>
          <Link to="/login" style={{
            padding: "0.9rem 2.5rem", borderRadius: 10, fontSize: "0.95rem",
            fontWeight: 600, color: "#888", border: "1px solid #1e1e1e",
          }}>Sign In</Link>
        </div>

        {/* Stats row */}
        <div className="fade-up-4" style={{
          display: "flex", gap: "3rem", marginTop: "5rem",
          flexWrap: "wrap", justifyContent: "center"
        }}>
          {[
            { val: "800+", label: "Exercises" },
            { val: "7", label: "Rank Tiers" },
            { val: "∞", label: "Gains" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", color: "#c8f135", lineHeight: 1 }}>{val}</p>
              <p style={{ color: "#444", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.25rem" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}