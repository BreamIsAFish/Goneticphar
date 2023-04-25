import './App.css'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import ChatTest from './pages/ChatTest'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/home"
          element={<Home />}
        />
        <Route
          exact
          path="/login"
          element={<Login />}
        />
        <Route
          exact
          path="/register"
          element={<Register />}
        />
        <Route path="/room">
          <Route
            path="/room/:room_num/lobby"
            element={<Lobby />}
          />
          <Route
            path="/room/:room_num/game"
            element={<Game />}
          />
          {/* <Route path="/room/:id/scoreboard" element={...} /> */}
        </Route>
        {/* Default Route */}
        <Route
          exact
          path="/test"
          element={<ChatTest />}
        />
        <Route
          path="*"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
