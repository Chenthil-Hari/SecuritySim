import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Scenarios from './pages/Scenarios';
import ScenarioPlay from './pages/ScenarioPlay';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scenarios" element={<Scenarios />} />
                <Route path="/scenarios/:id" element={<ScenarioPlay />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
