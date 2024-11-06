let angle;
let len = 200; // Increase initial length but in a controlled manner
let branches = [];
let letters = [];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];

function setup() {
    let canvas = createCanvas(1200, 900); // Moderately increase canvas size
    canvas.parent('canvasContainer');
    angle = PI / 4; // Adjust the angle for more spread
    background(0);
    frameRate(60); // Smooth animations
}

function branch(x, y, len, angle, alpha, color, letter) {
    push();
    translate(x, y);
    rotate(angle);
    stroke(color);
    strokeWeight(alpha / 255 * 4); // Vary stroke weight with alpha for bold lines
    line(0, 0, 0, -len);

    if (len > 10) {  // Increase branching and make faster
        let nextX = 0;
        let nextY = -len;
        branch(nextX, nextY, len * 0.67, angle + PI / 4, alpha * 0.67, color, letter); // Spread out more
        branch(nextX, nextY, len * 0.67, angle - PI / 4, alpha * 0.67, color, letter); // Spread out more
    } 

    pop();
}

function updateFractalVisual(message) {
    background(0); // Clear the canvas
    branches = []; // Reset branches array
    letters = []; // Reset letters array
    let x = width / 2; // Center x position
    let y = height / 2; // Center y position
    for (let char of message.toLowerCase()) {
        let color = colors[Math.floor(Math.random() * colors.length)]; // Randomize colors
        branches.push({ x: x, y: y, len: len, angle: -PI / 2, alpha: 255, color: color, letter: char });
        letters.push({ x: x, y: y - len, letter: char }); // Store letter positions
    }
    redraw(); // Trigger a redraw
}

function draw() {
    background(0); // Clear the canvas

    // Draw branches
    for (let b of branches) {
        branch(b.x, b.y, b.len, b.angle, b.alpha, b.color, b.letter);
    }

    // Draw letters on top
    for (let l of letters) {
        noStroke();
        fill(255);
        textSize(48); // Increase text size for more impact
        textAlign(CENTER, CENTER);
        text(l.letter, l.x, l.y); // Draw letters on top
    }

    // Remove branches and letters that have fully dissipated
    branches = branches.filter(b => b.alpha > 0);
    letters = letters.filter(l => branches.some(b => b.letter === l.letter));
}

// WebSocket connection to the server
const display = document.getElementById('display');

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
