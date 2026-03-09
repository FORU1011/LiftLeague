import { useState, useEffect } from "react"
import { logWorkout, getExercises } from "../api/api"
import { useAuth } from "../context/AuthContext"

const MUSCLE_MAP = {
  Chest:     ["chest", "pectorals"],
  Back:      ["lats", "middle back", "lower back", "traps", "rhomboids"],
  Shoulders: ["shoulders", "front deltoids", "middle deltoids", "rear deltoids", "deltoids"],
  Arms:      ["biceps", "triceps", "forearms"],
  Legs:      ["quadriceps", "hamstrings", "glutes", "calves", "abductors", "adductors", "hip flexors"],
  Core:      ["abdominals", "obliques", "core"],
  Cardio:    ["cardio"],
  Stretching:["stretching"],
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

const GROUP_COLORS = {
  Chest: "#ff6b6b", Back: "#40c4ff", Shoulders: "#b388ff",
  Arms: "#ff9500", Legs: "#69ff47", Core: "#ffd700",
  Cardio: "#00e5ff", Stretching: "#f48fb1",
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#0f0f0f", border: "1px solid #1c1c1c",
  borderRadius: 10, padding: "0.75rem 1rem",
  color: "#f0f0f0", fontSize: "0.875rem", outline: "none",
}

export default function WorkoutLogger() {
  const { user } = useAuth()

  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState("")
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getExercises().then(data => setExercises(data))
  }, [])

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
    if (!selectedExercise || !sets || !reps || !weight) {
      setMessage("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      await logWorkout({
        user_id: user.id,
        exercise_id: selectedExercise.id,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
      })
      setMessage("🔥 +50 XP earned!")
      setSets(""); setReps(""); setWeight("")
      setSearch(""); setSelectedExercise(null)
    } catch {
      setMessage("Something went wrong.")
    }
    setLoading(false)
  }

  const group = selectedExercise ? resolveGroup(selectedExercise) : null
  const accentColor = group ? GROUP_COLORS[group] : "#c8f135"

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 520, margin: "0 auto" }}>
      <style>{`@keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
          Track Your Progress
        </p>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.2rem, 5vw, 3rem)",
          letterSpacing: "0.05em", lineHeight: 1, color: "#f0f0f0", margin: 0,
        }}>
          Log Workout<span style={{ color: accentColor }}>.</span>
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Exercise Picker */}
        <div style={{ position: "relative" }}>
          <label style={{ display: "block", color: "#555", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Exercise
          </label>
          <input
            placeholder="Search exercises..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setSelectedExercise(null)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            style={{
              ...inputStyle,
              borderColor: selectedExercise ? accentColor + "60" : "#1c1c1c",
            }}
          />

          {/* Dropdown */}
          {showDropdown && filtered.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: "#111", border: "1px solid #1c1c1c", borderRadius: 10,
              zIndex: 100, overflow: "hidden",
              animation: "fadeDown 0.15s ease both",
            }}>
              {filtered.map(ex => {
                const g = resolveGroup(ex)
                const c = GROUP_COLORS[g] || "#c8f135"
                return (
                  <div
                    key={ex.id}
                    onMouseDown={() => handleSelect(ex)}
                    style={{
                      padding: "0.7rem 1rem", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderBottom: "1px solid #161616",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a" }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#e0e0e0", fontWeight: 500 }}>{ex.name}</p>
                      <p style={{ margin: 0, fontSize: "0.7rem", color: "#444" }}>{ex.target_muscle?.split(",")[0]}</p>
                    </div>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 700, color: c,
                      background: c + "15", padding: "0.15rem 0.5rem", borderRadius: 5,
                    }}>{g}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected exercise info */}
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
            <button
              onClick={() => { setSelectedExercise(null); setSearch("") }}
              style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "1rem" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Sets / Reps / Weight */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          {[
            { label: "Sets", value: sets, set: setSets, placeholder: "e.g. 3" },
            { label: "Reps", value: reps, set: setReps, placeholder: "e.g. 10" },
            { label: "Weight (kg)", value: weight, set: setWeight, placeholder: "e.g. 60" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label style={{ display: "block", color: "#555", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                {label}
              </label>
              <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={e => set(e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "0.85rem",
            background: loading ? "#1a1a1a" : accentColor,
            color: loading ? "#444" : "#0a0a0a",
            border: "none", borderRadius: 10,
            fontSize: "0.9rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s", marginTop: "0.5rem",
          }}
        >
          {loading ? "Logging..." : "Log Workout"}
        </button>

        {/* Message */}
        {message && (
          <p style={{
            textAlign: "center", fontSize: "0.875rem",
            color: message.includes("XP") ? "#c8f135" : "#ff6b6b",
            margin: 0,
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}