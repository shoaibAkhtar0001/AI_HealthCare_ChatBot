import Matter from 'matter-js';

export const triggerGravity = () => {
    // Only trigger once
    if (window.gravityEnabled) return;
    window.gravityEnabled = true;

    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create engine
    const engine = Engine.create({
        enableSleeping: true
    });
    
    // adjust gravity to make it feel slightly floaty but impactful
    engine.world.gravity.y = 1;

    const world = engine.world;

    // Get all gravity nodes
    const gravityNodes = document.querySelectorAll('.gravity-item');
    const nodes = [];
    const bodies = [];

    // First pass: measure everything
    gravityNodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        // Ignore hidden elements
        if (rect.width === 0 || rect.height === 0) return;
        
        // Get background or colors to ensure visibility if needed, but not strictly required
        nodes.push({
            element: node,
            origWidth: rect.width,
            origHeight: rect.height,
            startX: rect.left + rect.width / 2, // center X
            startY: rect.top + rect.height / 2, // center Y
        });
    });

    // We keep the body scroll enabled or hidden? 
    // Usually Google Gravity collapses everything into the current viewport
    document.body.style.overflow = 'hidden';
    // Optional: add a slight background change
    document.body.style.backgroundColor = '#f8fafc';

    // Create the Matter.js render for mouse interaction (we won't display it visually)
    // We attach it to a hidden div or just use the mouse constraint without a renderer
    // the Mouse.create needs an element. Since DOM bodies are over it, we attach mouse to document.body
    
    // Second pass: apply fixed styles and create physics bodies
    nodes.forEach(item => {
        const { element, origWidth, origHeight, startX, startY } = item;

        // Apply fixed positioning inline BEFORE creating body
        const computedStyle = window.getComputedStyle(element);
        
        // If element relies on flex/grid parent, its dimensions might collapse.
        // We ensure its explicit width/height
        element.style.width = `${origWidth}px`;
        element.style.height = `${origHeight}px`;
        element.style.position = 'fixed';
        element.style.top = '0px';
        element.style.left = '0px';
        element.style.margin = '0';
        element.style.zIndex = '9999';
        element.style.transformOrigin = 'center center';
        element.style.transform = `translate(${startX - origWidth / 2}px, ${startY - origHeight / 2}px)`;
        element.style.boxSizing = 'border-box';
        // Remove CSS transitions so physics updates are instant
        element.style.transition = 'none';

        // Add a class to indicate it's active in physics (optional styling)
        element.classList.add('physics-active');
        element.style.cursor = 'grab';

        // Create body - round corners slightly, slight bounciness
        const body = Bodies.rectangle(startX, startY, origWidth, origHeight, {
            restitution: 0.6, // Bounciness
            friction: 0.3,
            frictionAir: 0.01,
            density: 0.002, // slightly heavy
            render: { visible: false }
        });

        bodies.push(body);
        item.body = body;
    });

    // Add bodies to the world
    World.add(world, bodies);

    // Floor and walls based on viewport
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wallOptions = { 
        isStatic: true, 
        render: { visible: false },
        friction: 0.8,
        restitution: 0.2
    };

    const thickness = 200;

    World.add(world, [
        Bodies.rectangle(width / 2, height + thickness / 2, width * 3, thickness, wallOptions), // Floor
        Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 4, wallOptions), // Left Wall
        Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 4, wallOptions), // Right Wall
        Bodies.rectangle(width / 2, -thickness / 2 - 1000, width * 3, thickness, wallOptions), // Ceiling
    ]);

    // Add mouse control
    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });

    World.add(world, mouseConstraint);

    // Keep the mouse in sync with scrolling if we hadn't hidden overflow
    // mouse.position.x = ... 

    // Update DOM loop
    let lastTime = performance.now();
    function renderUpdate(time) {
        requestAnimationFrame(renderUpdate);
        
        // Use a fixed time step or delta for updating
        let delta = time - lastTime;
        lastTime = time;
        // Cap delta to avoid large jump when tab is inactive
        if (delta > 30) delta = 16.66;
        
        Engine.update(engine, delta);

        nodes.forEach(item => {
            const { element, body, origWidth, origHeight } = item;
            
            // Matter.js body.position is the center
            const x = body.position.x - origWidth / 2;
            const y = body.position.y - origHeight / 2;
            const angle = body.angle;
            
            element.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
        });
    }

    // Start loop
    requestAnimationFrame(renderUpdate);
};
