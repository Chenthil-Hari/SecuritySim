import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { SystemStatusProvider, useSystemStatus } from './context/SystemStatusContext';
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import './App.css';
import { buildApiUrl } from './utils/api';

import { useAuth } from './context/AuthContext';
import { useGame } from './context/GameContext';

function AppContent() {
  const { user, checkFreezeStatus, isLoggedIn } = useAuth();
  
  // Heartbeat for persistence (works on Vercel where Sockets might fail)
  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    const sendHeartbeat = async () => {
      try {
        const token = localStorage.getItem('token');
        await fetch(buildApiUrl('/api/users/heartbeat'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    };

    // Send immediately and then every 45 seconds
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 45000);
    return () => clearInterval(interval);
  }, [isLoggedIn, user?.id]);

  const { maintenance, features, loading } = useSystemStatus();
  const gameState = useGame();
  const location = useLocation();

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

  // Global socket identification for presence
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      console.log(`[Presence] Initializing for user: ${user.id}`);
      const socket = io(window.location.origin, {
        reconnectionAttempts: 5,
        timeout: 10000
      });
      
      const identify = () => {
        console.log(`[Presence] Identifying socket ${socket.id} for user ${user.id}`);
        socket.emit('identify', user.id);
      };

      socket.on('connect', identify);
      socket.on('reconnect', identify);
      
      // Auto-identify on focus to ensure we haven't timed out
      const handleFocus = () => {
        if (socket.connected) identify();
      };
      window.addEventListener('focus', handleFocus);

      identify(); // Initial identification

      return () => {
        console.log(`[Presence] Cleaning up for user: ${user.id}`);
        socket.off('connect', identify);
        socket.off('reconnect', identify);
        window.removeEventListener('focus', handleFocus);
        socket.disconnect();
      };
    }
  }, [isLoggedIn, user?.id]);

  // Handle Maintenance Redirect
  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (maintenance.enabled && !isAdmin && !isAdminRoute) {
    return <Maintenance expectedReturn={maintenance.expectedReturn} />;
  }

  // Handle Verification Redirect
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].some(path => location.pathname.startsWith(path));
  if (isLoggedIn && user?.isVerified === false && !isAdmin && !isAuthRoute) {
    return <VerifyEmail />;
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
          {/* Authentication & Security */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
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
      <SystemStatusProvider>
        <GameProvider>
          <Router>
            <AppContent />
          </Router>
        </GameProvider>
      </SystemStatusProvider>
    </AuthProvider>
  );
}

export default App;
