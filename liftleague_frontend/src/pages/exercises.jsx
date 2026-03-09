// import { useEffect, useState } from "react"
// import { getExercises } from "../api/api"

// function Exercises() {

//   const [exercises, setExercises] = useState([])

//   useEffect(() => {
//     getExercises().then(data => {
//       console.log("Exercises:", data)
//       setExercises(data)
//     })
//   }, [])

//   if (!exercises.length) return <div>Loading exercises...</div>

//   return (
//     <div className="p-6">

//       <h1 className="text-3xl font-bold mb-6">
//         Exercise Library
//       </h1>

//       <div className="grid grid-cols-3 gap-6">

//         {exercises.map(exercise => (
//           <div
//             key={exercise.id}
//             className="bg-gray-800 text-white rounded p-4 shadow hover:scale-105 transition"
//           >

//             <h2 className="text-xl font-semibold">
//               {exercise.name}
//             </h2>

//             <p>Category: {exercise.category}</p>
//             <p>Muscle: {exercise.target_muscle}</p>
//             <p>Difficulty: {exercise.difficulty}</p>

//             <a
//               href={exercise.video_url}
//               target="_blank"
//               className="inline-block mt-3 bg-green-500 text-black px-3 py-1 rounded"
//             >
//               Watch Tutorial
//             </a>

//           </div>
//         ))}

//       </div>

//     </div>
//   )
// }

// export default Exercises

import { useEffect, useState } from "react"
import { getExercises } from "../api/api"

const categoryColors = {
  Strength: "#c8f135",
  Stretching: "#00e5ff",
  Plyometrics: "#ff6b6b",
  Cardio: "#ffd700",
  Powerlifting: "#ff9500",
  Strongman: "#b388ff",
  "Olympic Weightlifting": "#69ff47",
  Crossfit: "#ff4081",
  "Weighted Bodyweight": "#40c4ff",
  Assisted: "#a0a0a0",
}

const difficultyDots = { Beginner: 1, Intermediate: 2, Advanced: 3 }

function ExerciseCard({ exercise, index }) {
  const color = categoryColors[exercise.category] || "#c8f135"
  const dots = difficultyDots[exercise.difficulty] || 1

  return (
    <div
      style={{
        background: "#111", border: "1px solid #1e1e1e", borderRadius: 16,
        padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem",
        transition: "border-color 0.2s, transform 0.2s",
        animation: `fadeUp 0.4s ${(index % 20) * 0.03}s ease both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-3px)" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.transform = "translateY(0)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color, background: `${color}18`,
          padding: "0.25rem 0.6rem", borderRadius: 999, border: `1px solid ${color}30`
        }}>{exercise.category}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3].map(d => (
            <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: d <= dots ? color : "#222" }} />
          ))}
        </div>
      </div>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#f0f0f0", lineHeight: 1.3 }}>
        {exercise.name}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: "#444", fontSize: "0.8rem" }}>Target:</span>
        <span style={{ color: "#888", fontSize: "0.8rem", fontWeight: 500 }}>{exercise.target_muscle}</span>
      </div>

      <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid #1e1e1e" }}>
        <a href={exercise.video_url} target="_blank" rel="noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          fontSize: "0.8rem", fontWeight: 600, color: "#0a0a0a",
          background: color, padding: "0.4rem 0.9rem", borderRadius: 8, transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >▶ Watch Tutorial</a>
      </div>
    </div>
  )
}

function Exercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  useEffect(() => {
    getExercises().then(data => {
      setExercises(data)
      setLoading(false)
    })
  }, [])

  const categories = ["All", ...Object.keys(categoryColors).filter(cat =>
    exercises.some(e => e.category === cat)
  )]

  const filtered = exercises.filter(e => {
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.target_muscle?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === "All" || e.category === activeCategory
    return matchSearch && matchCat
  })

  // Group by category
  const grouped = filtered.reduce((acc, ex) => {
    const cat = ex.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ex)
    return acc
  }, {})

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
        <p style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Browse & Learn</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.04em", lineHeight: 1, color: "#f0f0f0" }}>
          Exercise Library<span style={{ color: "#c8f135" }}>.</span>
        </h1>
      </div>

      {/* Search */}
      <div className="fade-up-1" style={{ marginBottom: "1.5rem" }}>
        <input
          placeholder="Search exercises or muscles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", background: "#111", border: "1px solid #1e1e1e",
            borderRadius: 10, padding: "0.8rem 1rem", color: "#f0f0f0",
            fontSize: "0.875rem", outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = "#c8f135"}
          onBlur={e => e.target.style.borderColor = "#1e1e1e"}
        />
      </div>

      {/* Category Tabs */}
      <div className="fade-up-2" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
        {categories.map(cat => {
          const active = activeCategory === cat
          const color = categoryColors[cat] || "#c8f135"
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
              border: active ? "none" : "1px solid #1e1e1e",
              background: active ? color : "transparent",
              color: active ? "#0a0a0a" : "#555",
              transition: "all 0.2s",
            }}>
              {cat}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <p style={{ color: "#444", fontSize: "0.8rem", marginBottom: "2rem", fontFamily: "'JetBrains Mono', monospace" }}>
        {loading ? "Loading..." : `${filtered.length} exercise${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Grouped Results */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "2px solid #1e1e1e", borderTop: "2px solid #c8f135", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : activeCategory === "All" && !search ? (
        // Show grouped by category
        Object.entries(grouped).map(([cat, exs]) => (
          <div key={cat} style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", color: categoryColors[cat] || "#c8f135" }}>
                {cat}
              </h2>
              <span style={{ color: "#333", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace" }}>{exs.length} exercises</span>
              <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {exs.slice(0, 6).map((ex, i) => <ExerciseCard key={ex.id} exercise={ex} index={i} />)}
            </div>
            {exs.length > 6 && (
              <button onClick={() => setActiveCategory(cat)} style={{
                marginTop: "1rem", padding: "0.5rem 1.25rem", borderRadius: 8,
                fontSize: "0.8rem", fontWeight: 600, color: categoryColors[cat] || "#c8f135",
                background: "transparent", border: `1px solid ${categoryColors[cat] || "#c8f135"}30`,
                transition: "all 0.2s",
              }}>
                View all {exs.length} {cat} exercises →
              </button>
            )}
          </div>
        ))
      ) : (
        // Show flat grid when filtering
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {filtered.map((ex, i) => <ExerciseCard key={ex.id} exercise={ex} index={i} />)}
        </div>
      )}
    </div>
  )
}

export default Exercises