import { createContext, useContext, useEffect, useState } from "react"
import { getMe, logoutUser } from "../api/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    getMe()
      .then(data => setUser(data || null))
      .catch(() => setUser(null))
  }, [])

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  const value = { user, setUser, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)