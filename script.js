// p5.js code for fractal visuals
let angle;
let len = 100;
let branches = [];

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvasContainer');
    angle = PI / 4;
    background(0);
    stroke(255);
    noLoop(); // Prevent automatic looping
}

function branch(len) {
    let newBranch = { x: width / 2, y: height, len: len, angle: -PI / 2, alpha: 255 };
    branches.push(newBranch);
    drawBranches();
}

function drawBranches() {
    background(0);
    for (let i = branches.length - 1; i >= 0; i--) {
        let b = branches[i];
        push();
        translate(b.x, b.y);
        rotate(b.angle);
        stroke(255, b.alpha);
        line(0, 0, 0, -b.len);
        pop();

        b.alpha -= 5; // Fade out the branch
        if (b.alpha > 0) {
            let newBranch1 = { x: b.x, y: b.y - b.len, len: b.len * 0.67, angle: b.angle + angle, alpha: b.alpha };
            let newBranch2 = { x: b.x, y: b.y - b.len, len: b.len * 0.67, angle: b.angle - angle, alpha: b.alpha };
            branches.push(newBranch1);
            branches.push(newBranch2);
        } else {
            branches.splice(i, 1); // Remove the branch when it disappears
        }
    }
}

function updateFractalVisual(message) {
    len = 100; // Reset the initial length
    branches = []; // Reset the branches array
    for (let char of message.toLowerCase()) {
        branch(len); // Create a new branch for each letter in the message
    }
    redraw(); // Trigger a redraw
}

// WebSocket connection to the server
const display = document.getElementById('display');
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];

function showLetter(letter) {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = letter;
    span.style.color = colors[Math.floor(Math.random() * colors.length)];
    display.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 3000); // Remove the letter after 3 seconds
}

const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    console.log('WebSocket connection established.');
};

socket.onmessage = (event) => {
    const letter = event.data;
    console.log(`Received: ${letter}`);
    showLetter(letter);
    updateFractalVisual(letter); // Trigger the fractal update based on the letter
};

socket.onclose = () => {
    console.log('WebSocket connection closed.');
};

socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};

function draw() {
    drawBranches();
}
