import React, { useState, useEffect, useMemo } from 'react';
import { Clock, MessageSquare, Activity, ChevronDown, ChevronUp, ChevronLeft, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const HealthHistory = () => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'breathing'
  const [data, setData] = useState({ chat_summaries: [], breathing_sessions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChat, setExpandedChat] = useState(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    fetch(`https://ai-healthcare-chatbot-0r7i.onrender.com/api/health-history?user_id=${userId}`)
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) {
          setData(resData);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load history", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const toggleExpand = (idx) => {
    setExpandedChat(expandedChat === idx ? null : idx);
  };

  const getTagColor = (topic) => {
    const t = topic.toLowerCase();
    if (t.includes('prescription') || t.includes('medicine')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (t.includes('mental') || t.includes('stress') || t.includes('anx')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const breathingStats = useMemo(() => {
    const sessions = data.breathing_sessions || [];
    if (sessions.length === 0) return { total: 0, mostUsed: '-', minutes: 0 };
    
    let totalMinutes = 0;
    const patternCount = {};
    
    sessions.forEach(s => {
      // duration comes as "X mins Y sec" format
      let minsStr = s.duration.split(' ')[0];
      let mins = parseInt(minsStr) || 0;
      totalMinutes += mins;
      
      patternCount[s.pattern] = (patternCount[s.pattern] || 0) + 1;
    });
    
    let mostUsed = '-';
    let max = 0;
    for (const [pattern, count] of Object.entries(patternCount)) {
      if (count > max) {
        max = count;
        mostUsed = pattern;
      }
    }
    
    return { total: sessions.length, mostUsed, minutes: totalMinutes };
  }, [data.breathing_sessions]);

  return (
    <div className="flex flex-col h-full bg-slate-50 Nice-Scrollbar overflow-y-auto w-full max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/chat" className="text-slate-400 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-indigo-50">
             <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Health History</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your timeline of conversations and activities</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('chats')} 
            className={`flex-1 sm:w-32 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'chats' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MessageSquare size={16} /> Chats
          </button>
          <button 
            onClick={() => setActiveTab('breathing')} 
            className={`flex-1 sm:w-40 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'breathing' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Activity size={16} /> Breathing
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 font-semibold animate-pulse">Loading history...</div>
        ) : (
          <div className="space-y-6">
            
            {activeTab === 'chats' && (
              <div className="relative">
                {(!data.chat_summaries || data.chat_summaries.length === 0) ? (
                  <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-bold">No chat history yet</p>
                    <p className="text-sm mt-1">Your health conversations will be saved here.</p>
                  </div>
                ) : (
                  <div className="relative pl-4 sm:pl-8 border-l-2 border-indigo-100 ml-4 sm:ml-8 space-y-8 py-4">
                    {data.chat_summaries.map((chat, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[23px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white shadow-sm" />
                        
                        <div 
                          className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden" 
                          onClick={() => toggleExpand(idx)}
                        >
                          <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-bold text-slate-800 text-lg">{chat.topic}</h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getTagColor(chat.topic)}`}>
                                  {chat.topic.includes('Prescription') ? 'Prescription' : chat.topic.includes('mental') ? 'Mental Health' : 'General'}
                                </span>
                              </div>
                              <p className="text-slate-600 text-sm leading-relaxed">{chat.summary}</p>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-4 flex-shrink-0">
                               <span className="text-xs font-semibold text-slate-400 flex items-center"><Calendar size={12} className="mr-1" /> {chat.date}</span>
                               {expandedChat === idx ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </div>
                          </div>
                          
                          {/* Expanded Full Chat */}
                          {expandedChat === idx && (
                            <div className="border-t border-slate-100 p-5 bg-slate-50/50 text-sm overflow-hidden nice-scrollbar">
                               <p className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wider">Full Conversation Transcript</p>
                               <div className="whitespace-pre-wrap text-slate-600 font-mono text-[13px] leading-relaxed max-h-96 overflow-y-auto pr-2">
                                  {chat.full_chat}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'breathing' && (
              <div>
                {/* Stats Summary Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-lg mb-8">
                   <h2 className="text-lg font-bold mb-6 opacity-90">Breathing Analytics</h2>
                   <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-3xl font-black mb-1">{breathingStats.total}</div>
                        <div className="text-xs uppercase font-bold opacity-80 tracking-wider">Sessions</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black mb-1">{breathingStats.minutes}<span className="text-lg opacity-80 font-semibold ml-1">m</span></div>
                        <div className="text-xs uppercase font-bold opacity-80 tracking-wider">Total Time</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold mb-2 uppercase leading-tight pt-1">{breathingStats.mostUsed}</div>
                        <div className="text-xs uppercase font-bold opacity-80 tracking-wider">Top Pattern</div>
                      </div>
                   </div>
                </div>

                <div className="relative">
                  {(!data.breathing_sessions || data.breathing_sessions.length === 0) ? (
                    <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                      <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="font-bold">No breathing sessions yet</p>
                      <p className="text-sm mt-1">Use the chat to start a guided breathing exercise.</p>
                    </div>
                  ) : (
                    <div className="relative pl-4 sm:pl-8 border-l-2 border-emerald-100 ml-4 sm:ml-8 space-y-6 py-2">
                      {data.breathing_sessions.map((session, idx) => (
                        <div key={idx} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[23px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white shadow-sm" />
                          
                          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-500">
                                 <Activity size={24} />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800">{session.pattern}</h3>
                                <p className="text-slate-500 text-sm mt-0.5">{session.rounds} rounds • {session.duration}</p>
                              </div>
                            </div>
                            <div className="text-slate-400 text-sm font-semibold flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                               <Clock size={14} className="mr-2" /> {session.date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default HealthHistory;
