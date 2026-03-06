import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import ThreatMap from './pages/ThreatMap';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Contact from './pages/Contact';
import ForensicsGame from './pages/ForensicsGame';
import WarRoom from './pages/WarRoom';
import ChatWidget from './components/ChatWidget';
import MatrixBackground from './components/MatrixBackground';
import AdminLogin from './pages/AdminLogin';
import { io } from 'socket.io-client';
import GlobalAlert from './components/GlobalAlert';
import AdminDashboard from './pages/AdminDashboard';
import TerminalLocked from './pages/TerminalLocked';
import InteractiveScenarios from './pages/InteractiveScenarios';
import PvPLobby from './pages/PvPLobby';
import DuelRoom from './pages/DuelRoom';
import Maintenance from './pages/Maintenance';
import './App.css';
import { buildApiUrl } from './utils/api';

import { useAuth } from './context/AuthContext';
import { useGame } from './context/GameContext';

function AppContent() {
  const { user, checkFreezeStatus } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [expectedReturn, setExpectedReturn] = useState('');
  const gameState = useGame();
  const isLoggedIn = !!user;
  const location = useLocation();

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/maintenance/status'));
        if (res.ok) {
          const data = await res.json();
          setMaintenance(data.maintenance);
          setExpectedReturn(data.expectedReturn || '');
        }
      } catch (err) {
        console.error("Maintenance check failed:", err);
      }
    };
    fetchMaintenance();
  }, [location.pathname]);

  // Check for account freeze on every navigation
  useEffect(() => {
    if (isLoggedIn && !user.isFrozen) {
      checkFreezeStatus();
    }
  }, [location.pathname, isLoggedIn]);

  // Redirect frozen users IMMEDIATELY
  if (user && user.isFrozen) {
    return <TerminalLocked />;
  }

  // Handle Maintenance Redirect
  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (maintenance && !isAdmin && !isAdminRoute) {
    return <Maintenance expectedReturn={expectedReturn} />;
  }

  return (
    <div className="app">
      {!isAdminRoute && <Navbar />}
      <GlobalAlert />
      <main className={`app-main ${isAdminRoute ? 'admin-isolated' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/threat-map" element={<ThreatMap />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile/:userId?" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forensics" element={<ForensicsGame />} />
          <Route path="/interactive-scenarios" element={<InteractiveScenarios />} />
          <Route path="/multiplayer/pvp" element={<PvPLobby />} />
          <Route path="/duel/:matchId" element={<DuelRoom />} />
          <Route path="/warroom/:id" element={<WarRoom />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <ChatWidget isLoggedIn={isLoggedIn} />}
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
