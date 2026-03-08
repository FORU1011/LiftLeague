import { useEffect, useState } from "react"
import { getProfile } from "../api/api"

function Dashboard() {

  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  if (!profile) return <p>Loading...</p>

  return (

    <div>

      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-gray-800 text-white p-6 rounded shadow">
          <p className="text-gray-400">Username</p>
          <p className="text-2xl">{profile.username}</p>
        </div>

        <div className="bg-gray-800 text-white p-6 rounded shadow">
          <p className="text-gray-400">XP</p>
          <p className="text-2xl">{profile.xp}</p>
        </div>

        <div className="bg-gray-800 text-white p-6 rounded shadow">
          <p className="text-gray-400">Rank</p>
          <p className="text-2xl text-green-400">
            {profile.rank}
          </p>
        </div>

      </div>

    </div>
  )
}

export default Dashboard