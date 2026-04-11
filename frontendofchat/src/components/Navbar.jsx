import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) setUser(username);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="w-full bg-transparent py-6 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 cursor-pointer">
            <Link to="/" className="gravity-item text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter">
              Intellichat
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="gravity-item text-slate-600 hover:text-indigo-600 font-semibold tracking-wide">Features</a>
            {user && (
              <Link to="/chat" className="gravity-item text-slate-600 hover:text-indigo-600 font-semibold tracking-wide">Chat</Link>
            )}
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
              {user ? (
                <>
                  <span className="text-slate-800 font-semibold">Hi, {user}</span>
                  <button onClick={handleLogout} className="gravity-item bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-2.5 rounded-full font-semibold transition-colors">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="gravity-item text-slate-800 font-semibold hover:text-indigo-600 transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup" className="gravity-item bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
