const API_URL = "http://127.0.0.1:8000"

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/profile/1`)
  const data = await res.json()
  return data
}

export const getExercises = async () => {
  const res = await fetch(`${API_URL}/exercises`)
  const data = await res.json()
  return data
}

export const logWorkout = async (workout) => {
  const res = await fetch(`${API_URL}/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(workout)
  })

  const data = await res.json()
  return data
}