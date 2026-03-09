const API_URL = import.meta.env.VITE_API_URL

const opts = {Credentials: "include"}

// Auth
export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data), ...opts
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail) }
  return res.json()
}

export const loginUser = async (data) => {
  const res = await fetch (`${API_URL}/auth/login`, {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data), ...opts
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail) }
  return res.json()
}

export const logoutUser = async () => {
  await fetch(`${API_URL}/auth/logout`, {method: "POST", ...opts})
}

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, opts)
  if (!res.ok) return null
  return res.json() 
}

export const getExercises = async () => {
  const res = await fetch(`${API_URL}/exercises`, opts)
  return res.json()
}

export const logWorkout = async (workout) => {
  const res = await fetch(`${API_URL}/workouts`, {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify(workout), ...opts
  })
  return res.json()
}

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/profile/1`)
  const data = await res.json()
  return data
}