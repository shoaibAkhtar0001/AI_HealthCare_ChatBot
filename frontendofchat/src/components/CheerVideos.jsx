import React from 'react';
import { X, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const videos = [
  {
    id: "inpok4MKVLM",
    title: "5 Minute Meditation You Can Do Anywhere",
    channel: "Goodful",
    category: "Meditation",
    mood: ["stressed", "anxious", "overwhelmed"]
  },
  {
    id: "ZToicYcHIOU",
    title: "10 Minute Morning Meditation for Anxiety",
    channel: "Goodful",
    category: "Meditation",
    mood: ["anxious", "nervous"]
  },
  {
    id: "VF4AnGGXCMg",
    title: "Guided Meditation for Stress Relief",
    channel: "The Honest Guys",
    category: "Meditation",
    mood: ["stressed", "overwhelmed"]
  },
  {
    id: "O-6f5wQXSu8",
    title: "Happy Music to Brighten Your Day",
    channel: "Meditation Relax Music",
    category: "Uplifting Music",
    mood: ["sad", "down", "low"]
  },
  {
    id: "77ZozI0rw7w",
    title: "1 Hour Peaceful Relaxing Music",
    channel: "Soothing Relaxation",
    category: "Relaxing Music",
    mood: ["stressed", "cant sleep", "anxious"]
  },
  {
    id: "MIr3RsUWrdo",
    title: "How to Stop Feeling Anxious About Anxiety",
    channel: "TEDx Talks",
    category: "Mental Health Talk",
    mood: ["anxious", "nervous", "overwhelmed"]
  },
  {
    id: "RcGyVTAoXEU",
    title: "The Power of Vulnerability",
    channel: "TED",
    category: "Inspiration",
    mood: ["sad", "low", "down"]
  },
  {
    id: "4Tcsk9hDtIc",
    title: "Funny Animal Compilation to Make You Smile",
    channel: "AFV Animals",
    category: "Feel Good",
    mood: ["sad", "low", "stressed"]
  },
  {
    id: "lDqOt9XJKUQ",
    title: "Baby Laughing Hysterically",
    channel: "America's Funniest Home Videos",
    category: "Feel Good",
    mood: ["sad", "low", "down"]
  },
  {
    id: "d-diB65scQU",
    title: "You Are Not Alone — Mental Health",
    channel: "TEDx Talks",
    category: "Mental Health Talk",
    mood: ["lonely", "sad", "down"]
  }
];

const CheerVideos = ({ isOpen, onClose, contextMood }) => {
  if (!isOpen) return null;

  // determine mood categories
  const normalizedContext = (contextMood || "").toLowerCase();
  const matchedVideos = [];
  const otherVideos = [];

  videos.forEach(v => {
    let match = false;
    v.mood.forEach(m => {
      if (normalizedContext.includes(m)) match = true;
    });
    if (match) {
      matchedVideos.push(v);
    } else {
      otherVideos.push(v);
    }
  });

  const renderCard = (v) => (
    <a 
      key={v.id} 
      href={`https://www.youtube.com/watch?v=${v.id}`} 
      target="_blank" 
      rel="noreferrer"
      className="flex-shrink-0 w-64 md:w-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group relative block snap-start"
    >
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <PlayCircle size={48} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-sm" />
        </div>
        <span className="absolute top-2 left-2 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
          {v.category}
        </span>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">{v.title}</h4>
        <p className="text-slate-500 text-[13px] font-medium">{v.channel}</p>
      </div>
    </a>
  );

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🎬</span> Pick-Me-Up Videos
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Hand-picked collection to help you feel better</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors relative z-10"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto overflow-x-hidden nice-scrollbar flex-1 relative z-0">
            {matchedVideos.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                        ✨ Top picks for how you're feeling
                    </h3>
                    <div className="flex overflow-x-auto pb-4 gap-4 nice-scrollbar snap-x px-1">
                        {matchedVideos.map(v => (
                           <div key={v.id} className="w-64 md:w-72 flex-shrink-0">
                               {renderCard(v)}
                           </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">
                    {matchedVideos.length > 0 ? "More videos you might like" : "Browse all relaxing videos"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1 pb-4">
                    {otherVideos.map(renderCard)}
                </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheerVideos;
