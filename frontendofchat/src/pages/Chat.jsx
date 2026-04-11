import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, MessageSquare, User, Clock, Book, Settings, Mic, Paperclip, Send, Image as ImageIcon, X as XIcon, Check, X, AlertTriangle, Trash2, MapPin, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import CheerVideos from '../components/CheerVideos';
import BreathingExercise from '../components/BreathingExercise';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('user_id');

  const promptSuggestions = [
    "Explain the latest findings on diabetes.",
    "Summarize a medical research paper.",
    "What are the standard protocols for hypertension?",
    "Interpret these clinical lab results."
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [clickedChip, setClickedChip] = useState(null);
  const [showCheerVideos, setShowCheerVideos] = useState(false);
  const [cheerMood, setCheerMood] = useState("");
  const [showBreathing, setShowBreathing] = useState(false);

  const messagesRef = React.useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      const msgs = messagesRef.current;
      if (msgs && msgs.length > 2) {
        const uid = localStorage.getItem('user_id');
        if (uid) {
          fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/summarize-chat', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uid, messages: msgs })
          }).catch(e => console.error(e));
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchSessions = async () => {
      try {
        const response = await fetch(`https://ai-healthcare-chatbot-0t17.onrender.com/api/sessions?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions);
          if (data.sessions.length > 0 && !currentSessionId) {
            setCurrentSessionId(data.sessions[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };
    fetchSessions();
  }, [userId, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentSessionId) {
        setMessages([]);
        return;
      }
      try {
        const response = await fetch(`https://ai-healthcare-chatbot-0t17.onrender.com/api/history?session_id=${currentSessionId}`);
        if (response.ok) {
          const data = await response.json();
          const historyMessages = [];
          data.history.forEach(item => {
            if (item.message) historyMessages.push({ role: 'user', content: item.message });
            if (item.reply) historyMessages.push({ role: 'ai', content: item.reply });
          });
          setMessages(historyMessages);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
  }, [currentSessionId]);

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (e, sessionIdToDel) => {
    e.stopPropagation();
    
    if (messages.length > 2 && currentSessionId === sessionIdToDel) {
       try {
         fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/summarize-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, messages })
          });
       } catch (error) {}
    }

    try {
      const response = await fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/sessions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdToDel,
          user_id: userId
        })
      });
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionIdToDel));
        if (currentSessionId === sessionIdToDel) {
          setCurrentSessionId(sessions.length > 1 ? sessions.filter(s => s.id !== sessionIdToDel)[0]?.id : null);
          if (sessions.length <= 1) setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleFindDoctors = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: "Find nearby doctors" }]);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/nearby-doctors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          });
          if (response.ok) {
            const data = await response.json();
            setMessages(prev => [...prev, { 
                role: 'ai', 
                content: JSON.stringify({ 
                    doctors: data.doctors,
                    chips: ["Ask another question"]
                }) 
            }]);
          } else {
             setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't find doctors right now." }]);
          }
        } catch (error) {
          console.error("Failed to fetch doctors:", error);
          setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't find doctors straightaway." }]);
        } finally {
          setIsLoading(false);
        }
      }, () => {
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'ai', content: "Please enable location access to find nearby doctors." }]);
      });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // If navigated from library with an initial query, start a new chat and send it
    if (location.state?.initialQuery && sessions.length > 0) {
      const query = location.state.initialQuery;
      // Clear the state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title);
      setCurrentSessionId(null);
      setMessages([]);
      handleSend(query);
    }
  }, [location.state, sessions.length]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async (overrideMessage = null) => {
    // If overrideMessage is an event object (e.g. from onClick), treat it as null
    const messageText = typeof overrideMessage === 'string' ? overrideMessage : null;
    
    if (messageText === "Watch something to cheer up") {
       const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
       setCheerMood(lastUserMsg ? lastUserMsg.content : "sad");
       setShowCheerVideos(true);
       return;
    }
    
    if (messageText === "Try a breathing exercise") {
       setShowBreathing(true);
       return;
    }

    if (messageText && !inputValue) {
        setClickedChip(messageText);
        // Add a brief delay to let the user see the selected state animation
        await new Promise(r => setTimeout(r, 300));
        setClickedChip(null);
    }
    const userMessage = messageText || inputValue.trim();
    if ((!userMessage && !selectedImage) || isLoading) return;
    
    // Create a local blob URL for previewing in the message list immediately
    const userImagePreview = selectedImage ? URL.createObjectURL(selectedImage) : null;
    
    // Add user message immediately
    const userMessageContent = userMessage ? userMessage : "Sent an image.";
    const newMessages = [...messages, { role: 'user', content: userMessageContent, image_url: userImagePreview }];
    setMessages(newMessages);
    
    if (!overrideMessage) setInputValue("");
    const imageToSend = selectedImage; // Keep reference before clearing
    clearImage();
    setIsLoading(true);

    try {
      let requestBody, headers;
      
      if (imageToSend) {
        // Send as FormData if there's an image
        requestBody = new FormData();
        requestBody.append('message', userMessage);
        requestBody.append('user_id', userId);
        if (currentSessionId) requestBody.append('session_id', currentSessionId);
        requestBody.append('image', imageToSend);
        
        headers = {}; // Let browser set multipart/form-data with boundary
      } else {
        // Send as JSON if text only
        requestBody = JSON.stringify({
          message: userMessage,
          user_id: userId,
          ...(currentSessionId && { session_id: currentSessionId })
        });
        headers = { 'Content-Type': 'application/json' };
      }

      const response = await fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/chat', {
        method: 'POST',
        headers: headers,
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.session_id && !currentSessionId) {
        setCurrentSessionId(data.session_id);
        // Refresh sessions list to show the new one
        const sessionsRes = await fetch(`https://ai-healthcare-chatbot-0t17.onrender.com/api/sessions?user_id=${userId}`);
        if (sessionsRes.ok) {
          const sData = await sessionsRes.json();
          setSessions(sData.sessions);
        }
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.reply || "Message received."
      }]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I'm having trouble connecting to my backend right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (content) => {
    try {
      let data;
      if (typeof content !== 'string') {
        data = content;
      } else {
        try {
          data = JSON.parse(content);
        } catch (e1) {
          const jsonStart = content.indexOf('{');
          const jsonEnd = content.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonStr = content.slice(jsonStart, jsonEnd + 1);
            data = JSON.parse(jsonStr);
          } else {
            throw new Error("Not our JSON format");
          }
        }
      }
      
      if (data.doctors) {
        return (
          <div className="flex flex-col space-y-4 w-full">
            <h3 className="text-[16px] font-bold text-slate-800">Nearby Doctors & Clinics</h3>
            <div className="grid grid-cols-1 gap-3 mt-1">
              {data.doctors.map((doc, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="font-bold text-slate-800 text-[14px] leading-tight flex-1">{doc.name}</h4>
                      <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded whitespace-nowrap border border-indigo-100">{doc.distance}</span>
                   </div>
                   <p className="text-[13px] text-slate-600 mb-4">{doc.address}</p>
                   
                   <div className="flex items-center space-x-5 border-t border-slate-100 pt-3">
                      {doc.phone !== 'Not available' && (
                         <a href={`tel:${doc.phone}`} className="text-indigo-600 font-bold text-[13px] hover:text-indigo-800 transition-colors">Call {doc.phone}</a>
                      )}
                      <a href={`https://www.openstreetmap.org/directions?from=&to=${doc.lat},${doc.lon}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-[13px] hover:text-indigo-800 transition-colors">Get Directions</a>
                   </div>
                </div>
              ))}
            </div>
            {data.chips && data.chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-1">
                {data.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-left px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 shadow-sm border bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      if (!data.message) throw new Error("Not our JSON format");
      
      return (
        <div className="flex flex-col space-y-4 w-full">
          <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-[15px] leading-relaxed break-words font-normal">
            <ReactMarkdown>{data.message}</ReactMarkdown>
          </div>
          
          {data.warning && (
            <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500 border-y border-r border-amber-200/60 rounded-r-xl rounded-l-sm p-4 flex items-start space-x-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                    <AlertTriangle className="text-amber-600" size={16} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="text-amber-800 font-bold text-xs mb-1.5 uppercase tracking-wider">Important Precaution</h4>
                    <p className="text-amber-900 text-[14px] leading-relaxed mb-0 font-medium">{data.warning}</p>
                </div>
            </div>
          )}

          {data.cards && data.cards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {data.cards.map((card, idx) => {
                const borderColors = ['border-l-blue-500', 'border-l-emerald-500', 'border-l-purple-500', 'border-l-orange-500'];
                const bgColors = ['bg-blue-50', 'bg-emerald-50', 'bg-purple-50', 'bg-orange-50'];
                const textColors = ['text-blue-700', 'text-emerald-700', 'text-purple-700', 'text-orange-700'];
                const colorIdx = idx % borderColors.length;
                
                // Extract dosage/timing dynamically if not specifically provided
                const badgeMatch = card.content ? card.content.match(/\b(\d+(?:\.\d+)?\s*(mg|ml|mcg|g|tablet|tablets|capsule|capsules|drop|drops|unit|units)|once|twice|thrice|daily|morning|night|evening)\b/i) : null;
                const badgeText = card.dosage || (badgeMatch ? badgeMatch[0] : null);

                return (
                  <div key={idx} className={`bg-white border text-left border-slate-200 border-l-4 ${borderColors[colorIdx]} rounded-xl p-3 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow relative overflow-hidden group`}>
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-bold text-slate-800 text-[14px] leading-tight flex-1">{card.title}</h4>
                        {badgeText && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bgColors[colorIdx]} ${textColors[colorIdx]} whitespace-nowrap border border-white/20 shadow-sm`}>
                                {badgeText}
                            </span>
                        )}
                    </div>
                    <p className="text-[13px] text-slate-600 mb-0 leading-relaxed font-medium">{card.content}</p>
                  </div>
                )
              })}
            </div>
          )}

          {((data.dos && data.dos.length > 0) || (data.donts && data.donts.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {data.dos && data.dos.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 h-full relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-emerald-100 opacity-40 scale-150 pointer-events-none"><Check size={80}/></div>
                  <h4 className="font-bold text-emerald-800 mb-3 flex items-center relative z-10">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-2 shadow-sm"><Check size={12} strokeWidth={3}/></span> 
                    Do's
                  </h4>
                  <ul className="space-y-2 mb-0 relative z-10">
                    {data.dos.map((item, idx) => (
                      <li key={idx} className="text-[14px] text-emerald-900 flex items-start font-medium opacity-90">
                        <span className="mr-2 text-emerald-500 mt-0.5"><Check size={14}/></span> <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.donts && data.donts.length > 0 && (
                <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-4 h-full relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-rose-100 opacity-40 scale-150 pointer-events-none"><X size={80}/></div>
                  <h4 className="font-bold text-rose-800 mb-3 flex items-center relative z-10">
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center mr-2 shadow-sm"><X size={12} strokeWidth={3}/></span> 
                    Don'ts
                  </h4>
                  <ul className="space-y-2 mb-0 relative z-10">
                    {data.donts.map((item, idx) => (
                      <li key={idx} className="text-[14px] text-rose-900 flex items-start font-medium opacity-90">
                        <span className="mr-2 text-rose-500 mt-0.5"><X size={14}/></span> <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {data.chips && data.chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-1">
              {data.chips.map((chip, idx) => {
                const isSelected = clickedChip === chip;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className={`text-left px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 shadow-sm border ${
                        isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white scale-95 shadow-inner' 
                        : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(79,70,229,0.08)]'
                    }`}
                  >
                    {chip}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return (
        <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-[15px] leading-relaxed break-words prose-p:my-2 prose-ul:my-2 prose-li:my-0 prose-headings:my-3 font-normal prose-strong:text-indigo-800">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
  };

  return (
    <div className="h-[100dvh] flex bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col h-full z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        
        {/* Branding & New Chat */}
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter">
              Intellichat <span className="text-slate-800">Health</span>
            </span>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XIcon size={20} />
            </button>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98]"
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Previous Conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 nice-scrollbar">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3 mt-2">Recent Chats</div>
          
          {sessions.length === 0 ? (
            <div className="text-sm text-slate-400 px-4 py-2 italic">No earlier chats</div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="relative group w-full flex items-center pr-2">
                <button 
                  onClick={() => {
                     setCurrentSessionId(session.id);
                     setIsSidebarOpen(false);
                  }}
                  className={`flex-1 text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors ${currentSessionId === session.id ? 'bg-slate-100 text-indigo-700 font-semibold' : 'text-slate-700 hover:text-indigo-600'}`}
                >
                  <MessageSquare size={16} className={`${currentSessionId === session.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  <span className="truncate text-sm font-medium w-40">{session.title}</span>
                </button>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Nav Links */}
        <div className="p-4 border-t border-slate-200 space-y-1">
          <button className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold transition-colors">
            <MessageSquare size={18} />
            <span className="text-sm">Chat</span>
          </button>
          <Link to="/profile" className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
            <User size={18} />
            <span className="text-sm">Health Profile</span>
          </Link>
          <Link to="/history" className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
            <Clock size={18} />
            <span className="text-sm">Health History</span>
          </Link>
          <Link to="/health-library" className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
            <Book size={18} />
            <span className="text-sm">Health Library</span>
          </Link>
          <div className="h-px bg-slate-200 my-2 mx-2"></div>
          <button onClick={handleFindDoctors} className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
            <MapPin size={18} />
            <span className="text-sm">Find Doctors Nearby</span>
          </button>
          <Link to="/settings" className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        <CheerVideos isOpen={showCheerVideos} onClose={() => setShowCheerVideos(false)} contextMood={cheerMood} />
        <BreathingExercise isOpen={showBreathing} onClose={() => setShowBreathing(false)} />
        
        {/* Chat Header */}
        <div className="h-16 flex items-center px-4 sm:px-8 bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden mr-3 p-2 -ml-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar"
          >
             <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">AI Health Assistant</h1>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 nice-scrollbar">
          
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              /* Empty State */
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto w-full pt-12 pb-20"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <MessageSquare size={24} />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center tracking-tight">
                  How can I help with your health today?
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {promptSuggestions.map((prompt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => setInputValue(prompt)}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-center min-h-[100px]"
                    >
                      <p className="text-slate-600 font-medium text-[15px] group-hover:text-indigo-700 transition-colors line-clamp-3">
                        {prompt}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Active Chat State */
              <div className="space-y-6 max-w-4xl mx-auto w-full">
                <div className="flex justify-center mb-8">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
                </div>

                {messages.map((msg, index) => (
                  <motion.div 
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs mr-3 mt-1 shadow-md border border-indigo-400">
                        AI
                      </div>
                    )}
                    
                    <div className={
                      msg.role === 'user' 
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-6 py-4 max-w-[85%] sm:max-w-[70%] shadow-md"
                        : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-6 py-4 w-full sm:max-w-[85%] shadow-sm"
                    }>
                      {msg.role === 'user' ? (
                        <>
                          {msg.image_url && (
                            <div className="mb-3 rounded-xl overflow-hidden shadow-sm">
                               <img src={msg.image_url} alt="Uploaded content" className="max-w-full h-auto max-h-48 object-contain" />
                            </div>
                          )}
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </>
                      ) : (
                        renderMessageContent(msg.content)
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold text-xs ml-3 mt-1 shadow-sm border border-indigo-200">
                        U
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs mr-3 mt-1 shadow-md border border-indigo-400">
                      AI
                    </div>
                    <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-6 py-4 max-w-[85%] sm:max-w-[70%] shadow-sm flex items-center space-x-2">
                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    </div>
                  </motion.div>
                )}
                
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />

        </div>

        {/* Bottom Input Section */}
        <div className="p-4 sm:px-8 sm:pb-8 bg-slate-50 flex-shrink-0">
          <div className="max-w-4xl mx-auto relative">
            {/* Image Preview Tag */}
            {selectedImage && (
              <div className="absolute -top-14 left-0 right-0 px-4">
                <div className="bg-white border border-indigo-100 shadow-lg rounded-xl px-3 py-2 inline-flex items-center space-x-3 text-sm font-medium text-slate-700">
                  <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{selectedImage.name}</span>
                  <button 
                    onClick={clearImage}
                    className="p-1 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors z-20 relative"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className={`relative bg-white border shadow-sm rounded-2xl sm:rounded-3xl transition-all flex items-end ${(inputValue.length > 0 || selectedImage || isLoading) ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-300 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400'}`}>
              
              <div className="flex pl-2 sm:pl-3 pb-2 sm:pb-3 pt-3">
                <button
                   onClick={() => setShowCheerVideos(true)}
                   title="Cheer Me Up Videos"
                   className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer mr-1 block mb-1"
                >
                   <span className="text-[20px] leading-none block pt-1">🎬</span>
                </button>
                <button
                   onClick={() => setShowBreathing(true)}
                   title="Breathing Exercise"
                   className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer mr-1 block mb-1"
                >
                   <span className="text-[20px] leading-none block pt-1">🧘</span>
                </button>
                {/* Hidden file input */}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageChange}
                  id="image-upload"
                />
                
                {/* Use a label so clicking it natively triggers the file input */}
                <label 
                  htmlFor="image-upload"
                  className="p-2 sm:p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer block mb-1"
                >
                  <Paperclip size={22} className="sm:w-6 sm:h-6" />
                </label>
              </div>
              
              <textarea 
                placeholder={isLoading ? "AI is thinking..." : "Type your health question..."} 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 max-h-32 min-h-[56px] py-4 px-3 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-[15px] placeholder:text-slate-400 nice-scrollbar field-sizing-content disabled:opacity-50"
                rows={1}
              />

              <div className="pr-2 sm:pr-3 pb-2 sm:pb-3 pt-3 flex items-end">
                <button 
                  onClick={() => handleSend()}
                  disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                  className={`p-2 sm:p-2.5 rounded-xl shadow-md transition-all flex items-center justify-center mb-1 cursor-pointer z-20 relative ${((inputValue.trim() || selectedImage) && !isLoading) ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30' : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'}`}
                >
                  <Send size={18} className="translate-x-[1px] translate-y-[-1px]" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-3 font-medium">Intellichat AI Health Assistant can make mistakes. Please verify medical advice.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Chat;

