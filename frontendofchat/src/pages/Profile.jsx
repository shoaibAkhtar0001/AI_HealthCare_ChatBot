import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'prefer-not',
    weight: '',
    height: '',
    blood_type: 'unknown',
    allergies: '',
    conditions: '',
    medications: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        const response = await fetch(`https://ai-healthcare-chatbot-0t17.onrender.com/api/profile/?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            full_name: data.full_name || '',
            age: data.age || '',
            gender: data.gender || 'prefer-not',
            weight: data.weight || '',
            height: data.height || '',
            blood_type: data.blood_type || 'unknown',
            allergies: data.allergies || '',
            conditions: data.conditions || '',
            medications: data.medications || ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    setFormData(prev => ({ ...prev, [id || name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: userId })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium text-lg">Loading Profile...</div>;
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-8 bg-slate-50 relative overflow-hidden min-h-[calc(100vh-100px)]">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-3xl w-full relative z-10 border border-slate-100 my-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-6">
          <Link to="/chat" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4">
            <ArrowLeft size={16} className="mr-1" /> Back to Chat
          </Link>
          <div className="text-center sm:text-left border-b border-slate-100 pb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Health Profile</h2>
            <p className="text-slate-500">Manage your personal health information to get better AI assistance.</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
            {message.text}
          </div>
        )}

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="full_name">Full Name</label>
              <input 
                id="full_name"
                type="text" 
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="age">Age</label>
                <input 
                  id="age"
                  type="number" 
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="gender">Gender</label>
                <select 
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium bg-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="weight">Weight</label>
                <div className="relative">
                  <input 
                    id="weight"
                    type="text" 
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm pointer-events-none">lbs</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="height">Height</label>
                <div className="relative">
                  <input 
                    id="height"
                    type="text" 
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="blood_type">Blood Type</label>
              <select 
                id="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="allergies">Allergies</label>
              <textarea 
                id="allergies"
                rows={2}
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium resize-none nice-scrollbar"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="conditions">Existing Conditions</label>
              <textarea 
                id="conditions"
                rows={2}
                value={formData.conditions}
                onChange={handleChange}
                placeholder="e.g. Mild asthma, occasional migraines"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium resize-none nice-scrollbar"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="medications">Current Medications</label>
              <textarea 
                id="medications"
                rows={2}
                value={formData.medications}
                onChange={handleChange}
                placeholder="e.g. Albuterol inhaler (as needed)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm text-slate-900 font-medium resize-none nice-scrollbar"
              ></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="col-span-1 sm:col-span-2 mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;

