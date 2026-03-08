import {BrowserRouter, Routes, Route} from "react-router-dom"

import Navbar from "./components/Navbar"

import Dashboard from "./pages/Dashboard"
import Exercises from "./pages/exercises"
import WorkoutLogger from "./pages/WorkoutLogger"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="max-w-6xl mx-auto mt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/workout" element={<WorkoutLogger />} />
          </Routes>
      </div>
    </BrowserRouter>
  )
}
export default App