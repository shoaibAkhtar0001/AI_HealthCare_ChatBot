import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, LogOut, Trash2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    tips: false,
    updates: true
  });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch(`https://ai-healthcare-chatbot-0r7i.onrender.com/api/settings?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(prev => ({ ...prev, username: data.username, email: data.email }));
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [userId, navigate]);

  const toggleSwitch = async (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    
    try {
      await fetch('https://ai-healthcare-chatbot-0r7i.onrender.com/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          notifications: newNotifications
        })
      });
    } catch (error) {
      console.error("Failed to update notifications:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('https://ai-healthcare-chatbot-0r7i.onrender.com/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          email: userData.email,
          ...(userData.password && { password: userData.password })
        })
      });
      if (response.ok) {
        alert("Settings updated successfully!");
        setUserData(prev => ({ ...prev, password: '' })); // clear password field
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update settings.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  return (
    <div className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-slate-50 relative overflow-hidden min-h-[calc(100vh-100px)]">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="w-full max-w-3xl relative z-10 mt-8 mb-12 flex-grow flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-8">
          <Link to="/chat" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6">
            <ArrowLeft size={16} className="mr-1" /> Back to Chat
          </Link>
          <div className="pb-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Account Settings</h2>
            <p className="text-slate-500 text-lg">Manage your account preferences and configurations.</p>
          </div>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
          
          {/* Section 1: Account Information */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Account Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input 
                  type="text" 
                  value={userData.username}
                  onChange={(e) => setUserData({...userData, username: e.target.value})}
                  disabled
                  title="Username cannot be changed"
                  className="w-full px-4 py-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-slate-900 font-medium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep same"
                  value={userData.password}
                  onChange={(e) => setUserData({...userData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button type="button" className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-xl transition-colors duration-200 active:scale-[0.98]">
                Change Password
              </button>
              <button type="button" onClick={handleProfileUpdate} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98]">
                Update Profile
              </button>
            </div>
          </div>

          {/* Section 2: Notification Settings */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Bell size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Notification Settings</h3>
            </div>

            <div className="space-y-4">
              {/* Toggle Item */}
              <div className="flex justify-between items-center bg-slate-50 p-4 sm:px-6 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800">Email Notifications</h4>
                  <p className="text-sm text-slate-500 mt-1">Receive account activity updates via email.</p>
                </div>
                <button 
                  onClick={() => toggleSwitch('email')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${notifications.email ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.email ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle Item */}
              <div className="flex justify-between items-center bg-slate-50 p-4 sm:px-6 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800">Health Tips</h4>
                  <p className="text-sm text-slate-500 mt-1">Weekly personalized health suggestions.</p>
                </div>
                <button 
                  onClick={() => toggleSwitch('tips')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${notifications.tips ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.tips ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Toggle Item */}
              <div className="flex justify-between items-center bg-slate-50 p-4 sm:px-6 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800">Product Updates</h4>
                  <p className="text-sm text-slate-500 mt-1">News regarding the Intellichat app features.</p>
                </div>
                <button 
                  onClick={() => toggleSwitch('updates')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${notifications.updates ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.updates ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Account Actions */}
          <div className="p-6 sm:p-10 bg-slate-50/50">
            <h3 className="text-xl font-bold text-rose-600 mb-6">Danger Zone</h3>
            
            <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="max-w-md">
                <h4 className="font-bold text-slate-800 mb-1">Account Actions</h4>
                <p className="text-sm text-slate-500">Log out of your current session or permanently delete your account and all associated health data.</p>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button onClick={handleLogout} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold rounded-xl transition-colors active:scale-[0.98]">
                  <LogOut size={16} className="mr-2 text-slate-400" />
                  Logout
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-rose-600/20 active:scale-[0.98]">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
