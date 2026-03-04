import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Scenarios from './pages/Scenarios';
import ScenarioPlay from './pages/ScenarioPlay';
import Teams from './pages/Teams';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import ChatWidget from './components/ChatWidget';
import './App.css';

import { useAuth } from './context/AuthContext';

function AppContent() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const location = useLocation();

  // Hide chat widget if the user is in the /scenarios section
  const isScenarioRoute = location.pathname.startsWith('/scenarios');

  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/scenarios/:id" element={<ScenarioPlay />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      {!isScenarioRoute && <ChatWidget isLoggedIn={isLoggedIn} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <AppContent />
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
