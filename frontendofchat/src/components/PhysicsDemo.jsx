import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

const PhysicsDemo = ({ title, description, demoType }) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (sceneRef.current) {
      observer.observe(sceneRef.current);
    }

    return () => {
      if (sceneRef.current) observer.unobserve(sceneRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !sceneRef.current) {
      if (engineRef.current) {
        Matter.Render.stop(renderRef.current);
        Matter.Runner.stop(engineRef.current.runner);
        Matter.Engine.clear(engineRef.current);
        renderRef.current.canvas.remove();
        renderRef.current.canvas = null;
        renderRef.current.context = null;
        renderRef.current.textures = {};
        engineRef.current = null;
      }
      return;
    }

    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const width = sceneRef.current.clientWidth;
    const height = 400;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
      },
    });
    renderRef.current = render;

    const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
    World.add(world, [
      Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), // Bottom
      Bodies.rectangle(-25, height / 2, 50, height, wallOptions), // Left
      Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions), // Right
    ]);

    const colors = ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    let bodies = [];

    const createBox = (x, y, w, h, isStatic = false) => {
      return Bodies.rectangle(x, y, w, h, {
        isStatic,
        restitution: 0.7,
        friction: 0.1,
        render: {
          fillStyle: colors[Math.floor(Math.random() * colors.length)],
          strokeStyle: '#ffffff',
          lineWidth: 2,
        },
      });
    };

    const createCircle = (x, y, r, isStatic = false) => {
        return Bodies.circle(x, y, r, {
            isStatic,
            restitution: 0.9,
            friction: 0.1,
            render: {
              fillStyle: colors[Math.floor(Math.random() * colors.length)],
              strokeStyle: '#ffffff',
              lineWidth: 2,
            },
        });
    }

    if (demoType === 'gravity') {
      // Drop elements from top
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          if (!engineRef.current) return;
          const w = Math.random() * 40 + 30;
          const h = Math.random() * 40 + 30;
          const body = createBox(Math.random() * (width - 100) + 50, -50, w, h);
          World.add(world, body);
        }, i * 200);
      }
    } else if (demoType === 'collision') {
      // Elements colliding
      for (let i = 0; i < 20; i++) {
        const r = Math.random() * 20 + 15;
        bodies.push(createCircle(Math.random() * (width - 100) + 50, Math.random() * height * 0.5, r));
      }
      World.add(world, bodies);
    } else if (demoType === 'drag' || demoType === 'playground') {
      // Mix of elements for drag/playground
      for (let i = 0; i < 8; i++) {
        bodies.push(createBox(Math.random() * width, Math.random() * height, 60, 60));
        bodies.push(createCircle(Math.random() * width, Math.random() * height, 30));
      }
      
      // Add text-like blocks
      bodies.push(createBox(width/2, 100, 200, 40));
      bodies.push(createBox(width/2 - 50, 200, 150, 40));

      World.add(world, bodies);

      if (demoType === 'drag' || demoType === 'playground') {
          const mouse = Mouse.create(render.canvas);
          const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
              stiffness: 0.2,
              render: { visible: false }
            }
          });
          World.add(world, mouseConstraint);
          render.mouse = mouse; // keep mouse in sync with render
      }
    }

    Render.run(render);
    const runner = Runner.create();
    engine.runner = runner;
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      World.clear(world);
      Engine.clear(engine);
    };
  }, [isVisible, demoType]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-16">
      <div className="w-full md:w-1/3 text-left">
        <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h3>
        <p className="text-xl text-slate-600 leading-relaxed">{description}</p>
        {(demoType === 'drag' || demoType === 'playground') && (
            <p className="mt-4 text-sm font-semibold text-indigo-500 uppercase tracking-wider flex items-center">
               <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
               Try dragging these elements!
            </p>
        )}
      </div>
      <div 
        className="w-full md:w-2/3 h-[400px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden relative shadow-inner"
        ref={sceneRef}
      >
        {/* Matter.js canvas will be injected here */}
      </div>
    </div>
  );
};

export default PhysicsDemo;
