import { useState } from "react"
import { logWorkout } from "../api/api"

function WorkoutLogger() {

  const [exerciseId, setExerciseId] = useState("")
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const workout = {
      user_id: 1,
      exercise_id: Number(exerciseId),
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight)
    }

    await logWorkout(workout)

    setMessage("🔥 +50 XP earned!")
  }

  return (
    <div className="flex justify-center">

      <div className="bg-gray-800 text-white p-8 rounded shadow w-96">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Log Workout
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="number"
            placeholder="Exercise ID"
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
          />

          <input
            type="number"
            placeholder="Sets"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
          />

          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-black py-2 rounded font-bold hover:bg-green-400"
          >
            Log Workout
          </button>

        </form>

        {message && (
          <p className="mt-4 text-green-400 text-center">
            {message}
          </p>
        )}

      </div>

    </div>
  )
}

export default WorkoutLogger