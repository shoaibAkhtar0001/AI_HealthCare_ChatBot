import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Profile from './pages/HealthProfile';
import History from './pages/HealthHistory';
import Library from './pages/Library';
import Settings from './pages/Settings';

function App() {
  const location = useLocation();
  const isStandalonePage = ['/chat', '/profile', '/history', '/health-library', '/settings'].includes(location.pathname);

  if (isStandalonePage) {
    if (location.pathname === '/chat') return <Chat />;
    if (location.pathname === '/profile') return <Profile />;
    if (location.pathname === '/history') return <History />;
    if (location.pathname === '/health-library') return <Library />;
    if (location.pathname === '/settings') return <Settings />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/health-library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
