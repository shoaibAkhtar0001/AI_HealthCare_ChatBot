import React from 'react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="gravity-item bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl w-full">
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/10 rounded-full blur-2xl"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight relative z-10">
            Start using AI today
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto relative z-10">
            Join thousands of forward-thinking companies that use Intellichat to power their customer support and automation.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 relative z-10 w-full">
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="w-full bg-white text-indigo-600 hover:bg-slate-50 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl transform hover:-translate-y-1">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
