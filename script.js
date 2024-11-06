let angle;
let len = 100;
let branches = [];
let letters = [];

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvasContainer');
    angle = PI / 6; // Adjust the angle for a circular shape
    background(0);
    stroke(255);
    frameRate(60); // Smooth animations
}

function branch(x, y, len, angle, alpha, letter) {
    push();
    translate(x, y);
    rotate(angle);
    stroke(255, alpha);
    line(0, 0, 0, -len);

    if (len > 10) {  // Control branch density
        let nextX = 0;
        let nextY = -len;
        branch(nextX, nextY, len * 0.67, angle + PI / 6, alpha * 0.67, letter); // Spread out more
        branch(nextX, nextY, len * 0.67, angle - PI / 6, alpha * 0.67, letter); // Spread out more
    } else {  // Add letters at the end of branches
        noStroke();
        fill(255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text(letter, 0, -len); // Place letters centrally
    }

    pop();
}

function updateFractalVisual(message) {
    background(0); // Clear the canvas
    len = 100; // Reset the initial length
    branches = []; // Reset branches array
    letters = []; // Reset letters array
    let x = width / 2; // Center x position
    let y = height / 2; // Center y position
    for (let char of message.toLowerCase()) {
        branches.push({ x: x, y: y, len: len, angle: -PI / 2, alpha: 255, letter: char });
        letters.push({ x: x, y: y, letter: char }); // Store letter positions
    }
    redraw(); // Trigger a redraw
}

function draw() {
    background(0); // Clear the canvas

    // Draw branches
    for (let b of branches) {
        branch(b.x, b.y, b.len, b.angle, b.alpha, b.letter);
    }

    // Draw letters on top
    for (let l of letters) {
        noStroke();
        fill(255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text(l.letter, l.x, l.y); // Draw letters on top
    }

    // Remove branches and letters that have fully dissipated
    branches = branches.filter(b => b.alpha > 0);
    letters = letters.filter(l => branches.some(b => b.letter === l.letter));
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
}
