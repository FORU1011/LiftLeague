import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center shadow">

      <h1 className="text-xl font-bold text-green-400">
        LiftLeague
      </h1>

      <div className="flex gap-6">

        <Link to="/" className="hover:text-green-400">
          Dashboard
        </Link>

        <Link to="/exercises" className="hover:text-green-400">
          Exercises
        </Link>

        <Link to="/workout" className="hover:text-green-400">
          Log Workout
        </Link>

      </div>

    </nav>
  )
}

export default Navbar