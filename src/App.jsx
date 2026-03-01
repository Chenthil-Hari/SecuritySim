import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scenarios from './pages/Scenarios';
import ScenarioPlay from './pages/ScenarioPlay';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
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
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/scenarios" element={<ProtectedRoute><Scenarios /></ProtectedRoute>} />
                <Route path="/scenarios/:id" element={<ProtectedRoute><ScenarioPlay /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
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
