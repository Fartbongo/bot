let angle;
let len = 100;
let branches = [];

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvasContainer');
    angle = PI / 6; // Spread out the branches more
    background(0);
    stroke(255);
    noLoop(); // Prevent automatic looping
}

function branch(x, y, len, angle, alpha, letter) {
    push();
    translate(x, y);
    rotate(angle);
    stroke(255, alpha);
    line(0, 0, 0, -len);

    if (len > 10) {  // Control branch density
        branch(0, -len, len * 0.67, angle + PI / 6, alpha * 0.67, letter);
        branch(0, -len, len * 0.67, angle - PI / 6, alpha * 0.67, letter);
    } else {  // Add letters at the end of branches
        noStroke();
        fill(255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text(letter, 0, -len); // Place letters centrally
    }

    pop();
}

function drawLettersWithFractals(message) {
    background(0); // Clear the canvas
    len = 100; // Reset the initial length
    let x = width / 2; // Center x position
    let y = height / 2; // Center y position
    branch(x, y, len, -PI / 2, 255, message); // Draw a new branch for the entire message
}

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
    drawLettersWithFractals(letter); // Trigger the fractal update with the entire message
};

socket.onclose = () => {
    console.log('WebSocket connection closed.');
};

socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};

function draw() {
    // We're not using a continuous draw loop as each update is triggered by WebSocket messages
}
