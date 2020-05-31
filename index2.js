const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const wallWidth = 2;
const cellsHorizontal = 6;
const cellsVertical = 2;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = width / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
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


//Walls
const walls = [
    Bodies.rectangle(0, height / 2, 7, height, {
        isStatic: true
    }),
    Bodies.rectangle(width, height / 2, 7, height, {
        isStatic: true
    }),
    Bodies.rectangle(width / 2, 0, width, 7, {
        isStatic: true
    }),
    Bodies.rectangle(width / 2, height, width, 7, {
        isStatic: true
    }),

];
World.add(world, walls);

//Grid Generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}


const gridArray = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));


const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
// console.log('Verticals:', verticals);

const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));
// console.log('Horizontals:', horizontals);

const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);
// console.log(startRow, startCol);

const stepThroughCell = (row, column) => {
    // If i have visted the cell at [row, column], then return
    if (gridArray[row][column]) {
        return;
    }

    // Mark this cell as being visited
    gridArray[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'Up'],
        [row, column + 1, 'Right'],
        [row + 1, column, 'Down'],
        [row, column - 1, 'Left']
    ]);
    // console.log(neighbors);

    for (let neighbor of neighbors) {
        // See if that neighbor is out of bounds

        const [nextRow, nextColumn, direction] = neighbor;
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }
        // If we have visited that neighbor, continue to next neighbor
        if (gridArray[nextRow][nextColumn] === true) {
            continue;
        }
        // Remove a wall from either horizontals or verticals
        if (direction === 'Left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'Right') {
            verticals[row][column] = true;
        } else if (direction === 'Up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'Down') {
            horizontals[row][column] = true;
        }
        // Visit that next cell
        stepThroughCell(nextRow, nextColumn)
    }

};

stepThroughCell(startRow, startCol);

horizontals.forEach((row, rowIdx) => {
    row.forEach((val, colIdx) => {
        if (val === true) {
            return;
        } else {
            const wall = Bodies.rectangle(
                colIdx * unitLengthX + unitLengthY / 2,
                rowIdx * unitLengthY + unitLengthY,
                unitLengthX,
                wallWidth, {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                }
            );
            World.add(world, wall);
        }

    })
})

verticals.forEach((row, rowIdx) => {
    row.forEach((val, colIdx) => {
        if (val === true) {
            return;
        } else {
            const vertWall = Bodies.rectangle(
                colIdx * unitLengthX + unitLengthX,
                rowIdx * unitLengthY + unitLengthY / 2,
                wallWidth,
                unitLengthY, {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'red'
                    }
                }
            );
            World.add(world, vertWall);
        }
    })
})

//End Goal Marker
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7, {
        isStatic: true,
        label: 'Goal',
        render: {
            fillStyle: 'green'
        }


    }
);
World.add(world, goal);

//Starting Ball 
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius, {
        label: 'Ball',
        render: {
            fillStyle: 'blue'
        }
    }

);
World.add(world, ball);

//Listening to Keypress to Control Ball

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    // console.log(x, y)
    if (event.keyCode === 38) {
        Body.setVelocity(ball, { x: x, y: y - 5 })
            // console.log('Up was pressed', event);
    } else if (event.keyCode === 39) {
        Body.setVelocity(ball, { x: x + 3, y: y })
            // console.log('Right was pressed', event);
    } else if (event.keyCode === 40) {
        Body.setVelocity(ball, { x: x, y: y + 3 })
            // console.log('Down was pressed', event);
    } else if (event.keyCode === 37) {
        Body.setVelocity(ball, { x: x - 3, y: y })
            // console.log('Left was pressed', event);
    }
})

//Detecting Win Condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['Ball', 'Goal'];
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            world.gravity.y = 1;
            document.querySelector(".winner").classList.remove('hidden');
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            })

        }
    })
})