import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';

const PATTERNS = {
  CALM: { id: 'calm', name: 'Calm Down', inhale: 4, hold: 4, exhale: 4, rounds: 5, desc: 'Box breathing — good for anxiety' },
  RELAX: { id: 'relax', name: 'Deep Relax', inhale: 4, hold: 7, exhale: 8, rounds: 5, desc: '4-7-8 breathing — good for sleep' },
  RESET: { id: 'reset', name: 'Quick Reset', inhale: 5, hold: 0, exhale: 5, rounds: 5, desc: 'Equal breathing — good for stress' },
};

const PHASES = {
  INHALE: { name: 'Breathe In...', color: 'bg-blue-300', scale: 1.5, id: 'inhale' },
  HOLD: { name: 'Hold...', color: 'bg-indigo-300', scale: 1.5, id: 'hold' },
  EXHALE: { name: 'Breathe Out...', color: 'bg-emerald-300', scale: 0.8, id: 'exhale' },
  IDLE: { name: 'Ready?', color: 'bg-slate-200', scale: 1, id: 'idle' },
};

const BreathingExercise = ({ isOpen, onClose }) => {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [currentPhase, setCurrentPhase] = useState(PHASES.IDLE);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  
  useEffect(() => {
    if (isCompleted && selectedPattern) {
      const pattern = PATTERNS[selectedPattern];
      const duration = (pattern.inhale + pattern.hold + pattern.exhale) * pattern.rounds;
      const userId = localStorage.getItem('user_id');
      if (userId) {
        fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/save-breathing/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            pattern: pattern.name,
            rounds_completed: pattern.rounds,
            duration_seconds: duration
          })
        }).catch(e => console.error("Failed to save breathing:", e));
      }
    }
  }, [isCompleted, selectedPattern]);
  
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time > 1) return time - 1;
          
          const pattern = PATTERNS[selectedPattern];
          
          if (currentPhase.id === 'idle') {
            setCurrentPhase(PHASES.INHALE);
            return pattern.inhale;
          }
          
          if (currentPhase.id === 'inhale') {
            if (pattern.hold > 0) {
              setCurrentPhase(PHASES.HOLD);
              return pattern.hold;
            } else {
              setCurrentPhase(PHASES.EXHALE);
              return pattern.exhale;
            }
          }
          
          if (currentPhase.id === 'hold') {
            setCurrentPhase(PHASES.EXHALE);
            return pattern.exhale;
          }
          
          if (currentPhase.id === 'exhale') {
            if (currentRound >= pattern.rounds) {
              setIsCompleted(true);
              setIsActive(false);
              return 0;
            } else {
              setCurrentRound(r => r + 1);
              setCurrentPhase(PHASES.INHALE);
              return pattern.inhale;
            }
          }
          
          return 0;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, isCompleted, currentPhase, currentRound, selectedPattern]);

  const handleStart = (patternKey) => {
    setSelectedPattern(patternKey);
    setIsActive(true);
    setIsPaused(false);
    setIsCompleted(false);
    setCurrentRound(1);
    setCurrentPhase(PHASES.INHALE);
    setTimeLeft(PATTERNS[patternKey].inhale);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsCompleted(false);
    setSelectedPattern(null);
    setCurrentPhase(PHASES.IDLE);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 text-white font-sans overflow-hidden"
      >
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
        >
            <X size={32} />
        </button>

        {!selectedPattern && !isCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-2xl"
          >
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">🧘</span>
              <h2 className="text-2xl font-bold mb-2">Breathing Exercises</h2>
              <p className="text-slate-400 font-medium text-sm">Choose a pattern to help you relax</p>
            </div>
            
            <div className="space-y-4">
              {Object.keys(PATTERNS).map(key => (
                <button
                  key={key}
                  onClick={() => handleStart(key)}
                  className="w-full bg-slate-700/50 hover:bg-indigo-600/80 border border-slate-600 hover:border-indigo-500 rounded-2xl p-4 text-left transition-all duration-300 group"
                >
                  <h3 className="text-lg font-bold text-white group-hover:text-white flex items-center justify-between">
                    {PATTERNS[key].name}
                    <Play size={16} className="text-white/50 group-hover:text-white" />
                  </h3>
                  <p className="text-slate-400 group-hover:text-indigo-100 text-[13px] mt-1 font-medium">{PATTERNS[key].desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {(selectedPattern || isCompleted) && (
          <div className="w-full max-w-lg flex flex-col items-center justify-center relative min-h-[500px]">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center text-slate-400 font-medium w-full">
              {!isCompleted && <span>Round {currentRound} of {PATTERNS[selectedPattern].rounds}</span>}
              {!isCompleted && <span>{PATTERNS[selectedPattern].name}</span>}
            </div>

            {/* Animation Area */}
            {!isCompleted ? (
              <div className="relative w-64 h-64 flex items-center justify-center my-16">
                <motion.div
                  className={`absolute rounded-full opacity-60 ${currentPhase.color}`}
                  animate={{ 
                    scale: currentPhase.scale,
                    backgroundColor: currentPhase.id === 'inhale' ? '#93c5fd' : currentPhase.id === 'hold' ? '#c4b5fd' : currentPhase.id === 'exhale' ? '#86efac' : '#e2e8f0'
                  }}
                  transition={{ 
                    duration: currentPhase.id === 'inhale' ? PATTERNS[selectedPattern].inhale : currentPhase.id === 'exhale' ? PATTERNS[selectedPattern].exhale : 0.5, 
                    ease: "easeInOut" 
                  }}
                  style={{ width: '150px', height: '150px' }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center bg-slate-900/50 w-32 h-32 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-1">{currentPhase.name}</h3>
                  <span className="text-3xl font-light tabular-nums">{timeLeft > 0 ? timeLeft : ''}</span>
                </div>
              </div>
            ) : (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="text-center my-16 bg-slate-800/80 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-2xl"
               >
                 <span className="text-5xl mb-6 block">✨</span>
                 <h2 className="text-3xl font-bold mb-4 text-white">Well done!</h2>
                 <p className="text-slate-300 font-medium text-lg mb-8">Take a moment to notice how you feel.</p>
                 
                 <div className="flex flex-col space-y-3">
                   <button 
                     onClick={() => handleStart(selectedPattern)}
                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                   >
                     <RotateCcw size={18} />
                     <span>Do another round</span>
                   </button>
                   <button 
                     onClick={onClose}
                     className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                   >
                     Go back to chat
                   </button>
                 </div>
               </motion.div>
            )}

            {/* Controls */}
            {!isCompleted && (
              <div className="absolute bottom-0 w-full flex justify-center items-center space-x-6">
                <button 
                  onClick={handleStop}
                  title="Change Pattern"
                  className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors flex flex-col items-center border border-slate-700 shadow-md"
                >
                  <ArrowLeft size={20} />
                </button>

                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center w-16 h-16"
                >
                  {isPaused ? <Play size={24} className="ml-1" /> : <Pause size={24} />}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BreathingExercise;

