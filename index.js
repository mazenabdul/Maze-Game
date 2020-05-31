const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

const width = 800;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        height: height,
        width: width,
        wireframes: false

    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}))

//Walls
const walls = [
    Bodies.rectangle(0, 300, 30, 599, {
        isStatic: true
    }),
    Bodies.rectangle(799, 300, 30, 599, {
        isStatic: true
    }),
    Bodies.rectangle(400, 0, 799, 30, {
        isStatic: true
    }),
    Bodies.rectangle(400, 599, 799, 30, {
        isStatic: true
    }),

];
//Creating Random Movable Shapes

for (var i = 0; i < 20; i++) {
    if (Math.random() > 0.5) {
        World.add(world, Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50))
    } else {
        World.add(world, Bodies.circle(Math.random() * width, Math.random() * height, 50, 50))
    }
}
World.add(world, walls);