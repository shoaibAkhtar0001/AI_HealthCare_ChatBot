import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Trash2, ArrowRight } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://ai-healthcare-chatbot-0t17.onrender.com/api/history/?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium text-lg">Loading History...</div>;
  }

  return (
    <div className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-slate-50 relative overflow-hidden min-h-[calc(100vh-100px)]">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl max-w-3xl w-full relative z-10 border border-slate-100 mt-8 mb-12 flex-grow flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-8">
          <Link to="/chat" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4">
            <ArrowLeft size={16} className="mr-1" /> Back to Chat
          </Link>
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Health History</h2>
            <p className="text-slate-500">Review your past conversations and medical inquiries.</p>
          </div>
        </div>

        <div className="flex-grow flex flex-col space-y-4">
          {history.length > 0 ? (
            history.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <MessageSquare size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg truncate max-w-[200px] sm:max-w-md">
                      {item.message.length > 40 ? item.message.substring(0, 40) + "..." : item.message}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed pl-11">
                  {item.reply}
                </p>

                <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end items-center space-x-3">
                  <Link to="/chat" className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95">
                    Open Chat
                    <ArrowRight size={16} className="ml-1.5" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-400 font-medium">
              No chat history found. Start a conversation to see it here!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default History;

