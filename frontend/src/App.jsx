import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/home"
          element={<Home />}
        />
        {/* Default Route */}
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
  );
}

export default App;
