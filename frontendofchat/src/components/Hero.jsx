import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const headline = "Your Intelligent AI Chat Assistant".split(' ');
  
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl rounded-[100%] z-0 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {headline.map((word, i) => (
            <motion.span 
              key={i} 
              className="inline-block mr-3 md:mr-5 mb-2"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-medium"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          Ask questions, automate tasks, and get instant answers with our powerful AI chatbot.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <Link to="/chat">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl shadow-indigo-600/20 transition-colors"
            >
              Try the Chatbot
            </motion.button>
          </Link>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-white border-2 border-slate-200 text-slate-800 px-10 py-5 rounded-full font-bold text-xl hover:border-slate-300 transition-colors"
          >
            View Demo
          </motion.button>
        </motion.div>

        {/* Chatbot Demo Mockup */}
        <motion.div 
          id="about"
          className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden text-left mt-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="font-semibold text-slate-700">Intellichat AI Demo</div>
          </div>
          
          <div className="p-6 space-y-6 bg-slate-50/50">
            {/* User message */}
            <motion.div 
              className="flex justify-end"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-sm">
                <p>What is machine learning?</p>
              </div>
            </motion.div>
            
            {/* Bot message */}
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-5 py-3 max-w-[85%] shadow-sm flex items-start space-x-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs mt-1">AI</div>
                 <p className="leading-relaxed">Machine learning is a type of AI that allows systems to learn from data and improve over time.</p>
              </div>
            </motion.div>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-white m-2 rounded-2xl flex items-center text-slate-400">
            <span className="flex-1">Type your message...</span>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">→</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
