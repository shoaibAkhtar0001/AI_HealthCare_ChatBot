import React from 'react';
import { MessageSquare, Zap, Link, Shield } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <MessageSquare size={40} className="text-indigo-600 mb-6" />,
      title: "Smart Conversations",
      description: "Natural language AI that understands context.",
      color: "bg-indigo-50"
    },
    {
      icon: <Zap size={40} className="text-amber-500 mb-6" />,
      title: "Instant Answers",
      description: "Get fast responses powered by advanced AI models.",
      color: "bg-amber-50"
    },
    {
      icon: <Link size={40} className="text-rose-500 mb-6" />,
      title: "Custom Integrations",
      description: "Connect the chatbot to websites, apps, and APIs.",
      color: "bg-rose-50"
    },
    {
      icon: <Shield size={40} className="text-emerald-500 mb-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and stable performance.",
      color: "bg-emerald-50"
    }
  ];

  return (
    <section id="features" className="py-20 relative z-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className={`gravity-item bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-start w-full relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${f.color} rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-500`}></div>
              {f.icon}
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{f.title}</h3>
              <p className="text-slate-600 text-lg leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
