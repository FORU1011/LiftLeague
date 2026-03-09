import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { getWorkoutHistory, getMusclePRs } from "../api/api"

const MUSCLE_COLORS = {
  Chest: "#ff6b6b", Back: "#40c4ff", Shoulders: "#b388ff",
  Arms: "#ff9500", Legs: "#69ff47", Core: "#ffd700",
  Cardio: "#00e5ff", Stretching: "#f48fb1",
}

const MUSCLE_ICONS = {
  Chest: "💪", Back: "🏋️", Shoulders: "🔱",
  Arms: "💥", Legs: "🦵", Core: "🎯",
  Cardio: "🏃", Stretching: "🧘",
}

function resolveGroup(targetMuscle, category) {
  const MUSCLE_MAP = {
    Chest:     ["chest", "pectorals"],
    Back:      ["lats", "middle back", "lower back", "traps", "rhomboids"],
    Shoulders: ["shoulders", "front deltoids", "middle deltoids", "rear deltoids", "deltoids"],
    Arms:      ["biceps", "triceps", "forearms"],
    Legs:      ["quadriceps", "hamstrings", "glutes", "calves", "abductors", "adductors", "hip flexors"],
    Core:      ["abdominals", "obliques", "core"],
  }
  const cat = (category || "").toLowerCase()
  if (cat === "cardio") return "Cardio"
  if (cat === "stretching") return "Stretching"
  const muscles = (targetMuscle || "").toLowerCase()
  for (const [group, keywords] of Object.entries(MUSCLE_MAP)) {
    if (keywords.some(k => muscles.includes(k))) return group
  }
  return "Other"
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

// ─── PR Card ──────────────────────────────────────────────────────────────────

function PRCard({ pr }) {
  const color = MUSCLE_COLORS[pr.muscle_group] || "#c8f135"
  const icon = MUSCLE_ICONS[pr.muscle_group] || "🏆"
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0f0f0f",
        border: `1px solid ${hovered ? color + "50" : "#1c1c1c"}`,
        borderRadius: 14, padding: "1.25rem",
        display: "flex", flexDirection: "column", gap: "0.5rem",
        transition: "all 0.2s", transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 24px ${color}15` : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
        <span style={{
          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color, background: color + "15",
          padding: "0.2rem 0.55rem", borderRadius: 6,
        }}>{pr.muscle_group}</span>
      </div>

      <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#e0e0e0", lineHeight: 1.3 }}>
        {pr.exercise_name}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color, lineHeight: 1 }}>{pr.weight}</p>
          <p style={{ margin: 0, fontSize: "0.65rem", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>kg</p>
        </div>
        <div style={{ width: 1, background: "#1c1c1c" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#888", lineHeight: 1 }}>{pr.sets}</p>
          <p style={{ margin: 0, fontSize: "0.65rem", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>sets</p>
        </div>
        <div style={{ width: 1, background: "#1c1c1c" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#888", lineHeight: 1 }}>{pr.reps}</p>
          <p style={{ margin: 0, fontSize: "0.65rem", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>reps</p>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: "0.7rem", color: "#333", marginTop: "0.25rem" }}>
        {formatDate(pr.logged_at)}
      </p>
    </div>
  )
}

// ─── History Row ──────────────────────────────────────────────────────────────

function HistoryRow({ item, index }) {
  const group = resolveGroup(item.target_muscle, "")
  const color = MUSCLE_COLORS[group] || "#c8f135"

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "1rem",
      padding: "0.875rem 1rem",
      background: index % 2 === 0 ? "#0a0a0a" : "#0d0d0d",
      borderRadius: 10,
      animation: `fadeUp 0.3s ${index * 0.03}s ease both`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#d8d8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.exercise_name}
        </p>
        <p style={{ margin: 0, fontSize: "0.7rem", color: "#444" }}>
          {formatDate(item.logged_at)} · {formatTime(item.logged_at)}
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
        {[
          { val: item.sets, label: "sets" },
          { val: item.reps, label: "reps" },
          { val: item.weight, label: "kg" },
        ].map(({ val, label }) => (
          <div key={label} style={{ textAlign: "center", minWidth: 38 }}>
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#c0c0c0", lineHeight: 1 }}>{val}</p>
            <p style={{ margin: 0, fontSize: "0.6rem", color: "#333", textTransform: "uppercase" }}>{label}</p>
          </div>
        ))}
      </div>

      <span style={{
        fontSize: "0.65rem", fontWeight: 700, color, background: color + "15",
        padding: "0.2rem 0.55rem", borderRadius: 6, flexShrink: 0,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>{group}</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkoutHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("history")

  useEffect(() => {
    if (!user) return
    Promise.all([
      getWorkoutHistory(user.id),
      getMusclePRs(user.id),
    ]).then(([h, p]) => {
      setHistory(h)
      setPRs(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  return (
    <div style={{ padding: "2.5rem 2rem", minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
          Your Progress
        </p>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
          letterSpacing: "0.05em", lineHeight: 1, color: "#f0f0f0", margin: 0,
        }}>
          {activeTab === "history" ? "Weekly Log" : "Muscle PRs"}
          <span style={{ color: "#c8f135" }}>.</span>
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {[
          { id: "history", label: "📋 Weekly Log" },
          { id: "prs",     label: "🏆 Muscle PRs" },
        ].map(t => {
          const active = activeTab === t.id
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "0.5rem 1.25rem", borderRadius: 8,
              fontSize: "0.8rem", fontWeight: 600,
              border: active ? "none" : "1px solid #1c1c1c",
              background: active ? "#c8f135" : "transparent",
              color: active ? "#0a0a0a" : "#555",
              cursor: "pointer", transition: "all 0.18s",
            }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{
            width: 32, height: 32, border: "2px solid #1c1c1c",
            borderTop: "2px solid #c8f135", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto",
          }} />
        </div>
      )}

      {/* Weekly History */}
      {!loading && activeTab === "history" && (
        history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#333" }}>
            <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}>📭</p>
            <p style={{ fontSize: "0.875rem" }}>No workouts logged this week.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p style={{ color: "#333", fontSize: "0.75rem", fontFamily: "monospace", marginBottom: "0.5rem" }}>
              {history.length} session{history.length !== 1 ? "s" : ""} this week
            </p>
            {history.map((item, i) => (
              <HistoryRow key={item.id} item={item} index={i} />
            ))}
          </div>
        )
      )}

      {/* Muscle PRs */}
      {!loading && activeTab === "prs" && (
        prs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#333" }}>
            <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}>🏋️</p>
            <p style={{ fontSize: "0.875rem" }}>Log some workouts to see your PRs.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.875rem" }}>
            {prs.map(pr => <PRCard key={pr.muscle_group} pr={pr} />)}
          </div>
        )
      )}
    </div>
  )
}