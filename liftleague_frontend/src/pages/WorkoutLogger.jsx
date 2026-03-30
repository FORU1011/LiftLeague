import { useState, useEffect, useRef } from "react"
import { logWorkout, getExercises } from "../api/api"
import { useAuth } from "../context/AuthContext"

const MUSCLE_MAP = {
  Chest:     ["chest", "pectorals"],
  Back:      ["lats", "middle back", "lower back", "traps", "rhomboids"],
  Shoulders: ["shoulders", "front deltoids", "middle deltoids", "rear deltoids", "deltoids"],
  Arms:      ["biceps", "triceps", "forearms"],
  Legs:      ["quadriceps", "hamstrings", "glutes", "calves", "abductors", "adductors", "hip flexors"],
  Core:      ["abdominals", "obliques", "core"],
}

const GROUP_COLORS = {
  Chest: "#ff6b6b", Back: "#40c4ff", Shoulders: "#b388ff",
  Arms: "#ff9500", Legs: "#69ff47", Core: "#ffd700",
  Cardio: "#00e5ff", Stretching: "#f48fb1",
}

function resolveGroup(exercise) {
  const cat = exercise.category?.toLowerCase() || ""
  if (cat === "cardio") return "Cardio"
  if (cat === "stretching") return "Stretching"
  const muscles = exercise.target_muscle?.toLowerCase() || ""
  for (const [group, keywords] of Object.entries(MUSCLE_MAP)) {
    if (keywords.some(k => muscles.includes(k))) return group
  }
  return null
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0")
  const s = (secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

const inputStyle = {
  background: "#0f0f0f", border: "1px solid #1c1c1c",
  borderRadius: 8, padding: "0.5rem 0.6rem",
  color: "#f0f0f0", fontSize: "0.875rem", outline: "none",
  width: "100%", boxSizing: "border-box", textAlign: "center",
}

export default function WorkoutLogger() {
  const { user } = useAuth()

  // Exercise picker
  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState("")
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Sets
  const [sets, setSets] = useState([
    { set_number: 1, weight: "", reps: "", completed: false }
  ])

  // Notes
  const [notes, setNotes] = useState("")

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const restRef = useRef(null)

  // Workout duration
  const [duration, setDuration] = useState(0)
  const durationRef = useRef(null)

  // UI
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getExercises().then(data => setExercises(data))
    // Start duration timer
    durationRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    return () => {
      clearInterval(durationRef.current)
      clearInterval(restRef.current)
    }
  }, [])

  // Rest timer logic
  useEffect(() => {
    if (restActive && restSeconds > 0) {
      restRef.current = setInterval(() => {
        setRestSeconds(s => {
          if (s <= 1) {
            clearInterval(restRef.current)
            setRestActive(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(restRef.current)
  }, [restActive])

  const startRest = (secs = 60) => {
    clearInterval(restRef.current)
    setRestSeconds(secs)
    setRestActive(true)
  }

  const stopRest = () => {
    clearInterval(restRef.current)
    setRestActive(false)
    setRestSeconds(0)
  }

  // Set management
  const addSet = () => {
    setSets(prev => [...prev, {
      set_number: prev.length + 1,
      weight: prev[prev.length - 1]?.weight || "",
      reps: prev[prev.length - 1]?.reps || "",
      completed: false,
    }])
  }

  const removeSet = (index) => {
    setSets(prev => prev
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, set_number: i + 1 }))
    )
  }

  const updateSet = (index, field, value) => {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const toggleComplete = (index) => {
    const wasCompleted = sets[index].completed
    updateSet(index, "completed", !wasCompleted)
    if (!wasCompleted) startRest(60)
  }

  // Exercise picker
  const filtered = search.length > 1
    ? exercises
        .filter(ex => resolveGroup(ex) !== null)
        .filter(ex =>
          ex.name?.toLowerCase().includes(search.toLowerCase()) ||
          ex.target_muscle?.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 8)
    : []

  const handleSelect = (ex) => {
    setSelectedExercise(ex)
    setSearch(ex.name)
    setShowDropdown(false)
    setMessage("")
  }

  const handleSubmit = async () => {
    if (!selectedExercise) { setMessage("Select an exercise first."); return }
    const completedSets = sets.filter(s => s.completed)
    if (completedSets.length === 0) { setMessage("Complete at least one set."); return }

    setLoading(true)
    try {
      await logWorkout({
        user_id: user.id,
        exercise_id: selectedExercise.id,
        notes: notes || null,
        duration_seconds: duration,
        sets: sets.map(s => ({
          set_number: s.set_number,
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
          completed: s.completed,
        })),
      })
      const xp = completedSets.length * 10
      setMessage(`🔥 +${xp} XP earned! (${completedSets.length} sets)`)
      // Reset
      setSelectedExercise(null); setSearch("")
      setSets([{ set_number: 1, weight: "", reps: "", completed: false }])
      setNotes(""); stopRest()
    } catch {
      setMessage("Something went wrong.")
    }
    setLoading(false)
  }

  const group = selectedExercise ? resolveGroup(selectedExercise) : null
  const accentColor = group ? GROUP_COLORS[group] : "#c8f135"
  const completedCount = sets.filter(s => s.completed).length

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 560, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .set-row:hover .remove-btn { opacity: 1 !important; }
      `}</style>

      {/* Header + Duration */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <p style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.4rem", margin: 0 }}>
            Track Your Progress
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "0.05em", lineHeight: 1, color: "#f0f0f0", margin: 0,
          }}>
            Log Workout<span style={{ color: accentColor }}>.</span>
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontFamily: "monospace", fontSize: "1.5rem", color: "#c8f135", letterSpacing: "0.05em" }}>
            {formatDuration(duration)}
          </p>
          <p style={{ margin: 0, fontSize: "0.65rem", color: "#333", textTransform: "uppercase", letterSpacing: "0.1em" }}>duration</p>
        </div>
      </div>

      {/* Rest Timer Banner */}
      {restActive && (
        <div style={{
          background: accentColor + "15", border: `1px solid ${accentColor}40`,
          borderRadius: 12, padding: "0.875rem 1rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "1.25rem", animation: "pulse 2s infinite",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.7rem", color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>Rest Time</p>
            <p style={{ margin: 0, fontSize: "1.75rem", fontFamily: "monospace", color: accentColor, lineHeight: 1 }}>
              {formatDuration(restSeconds)}
            </p>
          </div>
          <button onClick={stopRest} style={{
            background: accentColor, color: "#0a0a0a", border: "none",
            borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.8rem",
            fontWeight: 700, cursor: "pointer",
          }}>
            Skip
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Exercise Picker */}
        <div style={{ position: "relative" }}>
          <label style={{ display: "block", color: "#555", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Exercise
          </label>
          <input
            placeholder="Search exercises..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedExercise(null); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            style={{
              ...inputStyle, textAlign: "left", padding: "0.75rem 1rem",
              borderColor: selectedExercise ? accentColor + "60" : "#1c1c1c",
            }}
          />
          {showDropdown && filtered.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: "#111", border: "1px solid #1c1c1c", borderRadius: 10,
              zIndex: 100, overflow: "hidden", animation: "fadeDown 0.15s ease both",
            }}>
              {filtered.map(ex => {
                const g = resolveGroup(ex)
                const c = GROUP_COLORS[g] || "#c8f135"
                return (
                  <div key={ex.id} onMouseDown={() => handleSelect(ex)}
                    style={{ padding: "0.7rem 1rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #161616" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a" }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#e0e0e0", fontWeight: 500 }}>{ex.name}</p>
                      <p style={{ margin: 0, fontSize: "0.7rem", color: "#444" }}>{ex.target_muscle?.split(",")[0]}</p>
                    </div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: c, background: c + "15", padding: "0.15rem 0.5rem", borderRadius: 5 }}>{g}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected exercise chip */}
        {selectedExercise && (
          <div style={{
            background: accentColor + "10", border: `1px solid ${accentColor}25`,
            borderRadius: 10, padding: "0.75rem 1rem",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: accentColor, fontWeight: 600 }}>{selectedExercise.name}</p>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#555" }}>{selectedExercise.difficulty} · {selectedExercise.target_muscle?.split(",")[0]}</p>
            </div>
            <button onClick={() => { setSelectedExercise(null); setSearch("") }}
              style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "1rem" }}>✕</button>
          </div>
        )}

        {/* Sets Table */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <label style={{ color: "#555", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Sets <span style={{ color: accentColor }}>{completedCount}/{sets.length}</span>
            </label>
          </div>

          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 36px 32px", gap: "0.5rem", marginBottom: "0.4rem", padding: "0 0.25rem" }}>
            {["SET", "KG", "REPS", "✓", ""].map((h, i) => (
              <span key={i} style={{ fontSize: "0.6rem", color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>{h}</span>
            ))}
          </div>

          {/* Set rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {sets.map((s, i) => (
              <div key={i} className="set-row" style={{
                display: "grid", gridTemplateColumns: "32px 1fr 1fr 36px 32px",
                gap: "0.5rem", alignItems: "center",
                background: s.completed ? accentColor + "08" : "transparent",
                borderRadius: 8, padding: "0.25rem",
                border: `1px solid ${s.completed ? accentColor + "25" : "transparent"}`,
                transition: "all 0.15s",
              }}>
                <span style={{ textAlign: "center", fontSize: "0.8rem", color: "#444", fontFamily: "monospace" }}>{s.set_number}</span>
                <input
                  type="number" placeholder="0" value={s.weight}
                  onChange={e => updateSet(i, "weight", e.target.value)}
                  style={{ ...inputStyle, borderColor: s.completed ? accentColor + "30" : "#1c1c1c" }}
                />
                <input
                  type="number" placeholder="0" value={s.reps}
                  onChange={e => updateSet(i, "reps", e.target.value)}
                  style={{ ...inputStyle, borderColor: s.completed ? accentColor + "30" : "#1c1c1c" }}
                />
                <button onClick={() => toggleComplete(i)} style={{
                  width: 32, height: 32, borderRadius: 8, border: `2px solid ${s.completed ? accentColor : "#2a2a2a"}`,
                  background: s.completed ? accentColor : "transparent",
                  color: s.completed ? "#0a0a0a" : "#444",
                  cursor: "pointer", fontSize: "0.8rem", display: "flex",
                  alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                }}>✓</button>
                <button className="remove-btn" onClick={() => removeSet(i)} style={{
                  width: 28, height: 28, borderRadius: 6, border: "none",
                  background: "transparent", color: "#333", cursor: "pointer",
                  fontSize: "0.9rem", opacity: 0, transition: "opacity 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              </div>
            ))}
          </div>

          {/* Add set */}
          <button onClick={addSet} style={{
            width: "100%", marginTop: "0.6rem", padding: "0.5rem",
            background: "transparent", border: `1px dashed #1c1c1c`,
            borderRadius: 8, color: "#444", fontSize: "0.8rem",
            cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1c1c1c"; e.currentTarget.style.color = "#444" }}
          >
            + Add Set
          </button>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: "block", color: "#555", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Notes (optional)
          </label>
          <textarea
            placeholder="e.g. felt strong today, increase weight next session..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            style={{
              ...inputStyle, textAlign: "left", resize: "vertical",
              padding: "0.75rem 1rem", lineHeight: 1.5,
            }}
          />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "0.875rem",
          background: loading ? "#1a1a1a" : accentColor,
          color: loading ? "#444" : "#0a0a0a",
          border: "none", borderRadius: 10,
          fontSize: "0.9rem", fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}>
          {loading ? "Saving..." : `Save Workout${completedCount > 0 ? ` · +${completedCount * 10} XP` : ""}`}
        </button>

        {message && (
          <p style={{
            textAlign: "center", fontSize: "0.875rem",
            color: message.includes("XP") ? "#c8f135" : "#ff6b6b",
            margin: 0,
          }}>{message}</p>
        )}

      </div>
    </div>
  )
}