import { useEffect, useState } from "react"
import { getExercises } from "../api/api"

function Exercises() {

  const [exercises, setExercises] = useState([])

  useEffect(() => {
    getExercises().then(data => {
      console.log("Exercises:", data)
      setExercises(data)
    })
  }, [])

  if (!exercises.length) return <div>Loading exercises...</div>

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Exercise Library
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {exercises.map(exercise => (
          <div
            key={exercise.id}
            className="bg-gray-800 text-white rounded p-4 shadow hover:scale-105 transition"
          >

            <h2 className="text-xl font-semibold">
              {exercise.name}
            </h2>

            <p>Category: {exercise.category}</p>
            <p>Muscle: {exercise.target_muscle}</p>
            <p>Difficulty: {exercise.difficulty}</p>

            <a
              href={exercise.video_url}
              target="_blank"
              className="inline-block mt-3 bg-green-500 text-black px-3 py-1 rounded"
            >
              Watch Tutorial
            </a>

          </div>
        ))}

      </div>

    </div>
  )
}

export default Exercises