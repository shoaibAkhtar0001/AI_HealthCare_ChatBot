import React, { useState, useEffect, useCallback } from 'react';
import { User, Activity, AlertCircle, Phone, Check, LogOut, ChevronLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const HealthProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    blood_group: '',
    allergies: '',
    conditions: '',
    current_medicines: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const navigate = useNavigate();

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    // Fetch profile on load
    fetch(`https://ai-healthcare-chatbot-0t17.onrender.com/api/health-profile?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile(p => ({ ...p, ...data }));
        }
      })
      .catch(err => console.error("Error loading profile:", err));
  }, [userId, navigate]);

  // Debounce saving logic
  const saveProfile = useCallback((data) => {
    setIsSaving(true);
    setSaveStatus('');
    fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/health-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, user_id: userId })
    })
      .then(res => res.json())
      .then((res) => {
        setIsSaving(false);
        if (res.success) {
          setSaveStatus('Saved');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      })
      .catch((err) => {
        console.error("Failed to save", err);
        setIsSaving(false);
      });
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile.name !== '' || profile.age !== '') { // minimum condition
         saveProfile(profile);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [profile, saveProfile]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 Nice-Scrollbar overflow-y-auto w-full max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-indigo-50">
             <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Health Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your personal medical record</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {isSaving && <span className="text-xs font-semibold text-slate-400 flex items-center pr-2 animate-pulse">Saving...</span>}
           {saveStatus === 'Saved' && <span className="text-xs font-semibold text-emerald-600 flex items-center pr-2"><Check size={14} className="mr-1" /> Saved</span>}
           
           <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors font-semibold text-sm border-rose-200 shadow-sm border">
             <LogOut size={16} />
             <span className="hidden sm:inline">Logout</span>
           </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Personal Info */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
             <User size={20} className="text-indigo-500" />
             Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
               <input type="text" value={profile.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" placeholder="E.g. Jane Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                 <input type="number" value={profile.age || ''} onChange={e => handleChange('age', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" placeholder="Age" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                 <select value={profile.blood_group || ''} onChange={e => handleChange('blood_group', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer">
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                 </select>
               </div>
            </div>
          </div>
        </section>

        {/* Medical Info */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
             <Activity size={20} className="text-emerald-500" />
             Medical History
          </h2>
          <div className="space-y-6">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allergies</label>
               <textarea rows="2" value={profile.allergies || ''} onChange={e => handleChange('allergies', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all nice-scrollbar resize-none" placeholder="E.g. Peanuts, Penicillin (Comma separated)"></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-end">
                      <span>Current Conditions</span>
                  </label>
                  <textarea rows="4" value={profile.conditions || ''} onChange={e => handleChange('conditions', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all nice-scrollbar resize-none" placeholder="Asthma, Type 2 Diabetes, Hypertension..."></textarea>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-end">
                      <span>Current Medicines</span>
                  </label>
                  <textarea rows="4" value={profile.current_medicines || ''} onChange={e => handleChange('current_medicines', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all nice-scrollbar resize-none" placeholder="Lisinopril 10mg daily, Metformin 500mg..."></textarea>
               </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
             <AlertCircle size={20} className="text-rose-500" />
             Emergency Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Name & Relation</label>
               <input type="text" value={profile.emergency_contact_name || ''} onChange={e => handleChange('emergency_contact_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" placeholder="E.g. John Doe (Husband)" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Phone</label>
               <div className="flex gap-2">
                 <input type="tel" value={profile.emergency_contact_phone || ''} onChange={e => handleChange('emergency_contact_phone', e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" placeholder="Phone Number" />
                 {profile.emergency_contact_phone && (
                   <a href={`tel:${profile.emergency_contact_phone}`} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center px-4 rounded-xl shadow-md transition-colors">
                     <Phone size={18} />
                   </a>
                 )}
               </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="flex justify-end mt-2 pt-4">
           <button 
             onClick={() => {
                saveProfile(profile);
                alert("Profile Saved Successfully!");
             }}
             className="flex items-center space-x-2 px-8 py-3.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg font-bold"
           >
             <Save size={20} />
             <span>Save Profile</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default HealthProfile;

