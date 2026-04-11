import React from 'react';
import PhysicsDemo from './PhysicsDemo';

const PhysicsShowcase = () => {
  return (
    <section className="py-24 relative z-10 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            See the Engine in Action
          </h2>
          <p className="text-xl text-slate-600">
            Scroll down to explore how our Matter.js integration seamlessly converts static designs into tangible, interactive objects.
          </p>
        </div>

        <PhysicsDemo 
          title="Realistic Gravity Simulation" 
          description="UI elements fall naturally with real physics. As this section enters your viewport, gravity takes over instantly." 
          demoType="gravity" 
        />
        
        <div className="w-full h-px bg-slate-100 my-8"></div>

        <PhysicsDemo 
          title="Natural Object Collisions" 
          description="Objects interact and collide just like real-world physics, calculating mass, velocity, and bounce trajectory on the fly." 
          demoType="collision" 
        />

        <div className="w-full h-px bg-slate-100 my-8"></div>

        <PhysicsDemo 
          title="Interactive Physics" 
          description="Click, drag, and throw elements around. The simulation responds instantly to your pointer movements." 
          demoType="drag" 
        />

        <div className="w-full h-px bg-slate-100 my-8"></div>

        <PhysicsDemo 
          title="Your Website Becomes a Physics Playground" 
          description="Mix gravity, collisions, and user interactions to create a fully immersive and playful user interface." 
          demoType="playground" 
        />

      </div>
    </section>
  );
};

export default PhysicsShowcase;
