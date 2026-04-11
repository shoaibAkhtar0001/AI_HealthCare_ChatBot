import React from 'react';

const Footer = () => {
  return (
    <footer className="py-16 border-t border-slate-100 bg-white relative z-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="gravity-item text-3xl font-black text-slate-900 tracking-tighter mb-8 md:mb-0">
          Intellichat <span className="text-indigo-600">AI</span>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
          <a href="#" className="gravity-item text-slate-500 hover:text-indigo-600 font-medium transition-colors text-lg">Privacy Policy</a>
          <a href="#" className="gravity-item text-slate-500 hover:text-indigo-600 font-medium transition-colors text-lg">Terms of Service</a>
          <a href="#" className="gravity-item text-slate-500 hover:text-indigo-600 font-medium transition-colors text-lg">Contact Us</a>
          <div className="gravity-item text-slate-400 font-medium text-lg pt-4 sm:pt-0 sm:border-l sm:border-slate-200 sm:pl-8">
            © 2024 Intellichat AI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
