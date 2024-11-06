let angle;
let len = 100;
let branches = [];

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvasContainer');
    angle = PI / 6; // Adjust the angle to spread out the branches more
    background(0);
    stroke(255);
    frameRate(30); // Set a reasonable frame rate
}

function branch(x, y, len, angle, alpha, letter) {
    push();
    translate(x, y);
    rotate(angle);
    stroke(255, alpha);
    line(0, 0, 0, -len);
    if (len > 10) {  // Adjust the length threshold to control branch density
        branch(0, -len, len * 0.67, angle + PI / 6, alpha * 0.67, letter);
        branch(0, -len, len * 0.67, angle - PI / 6, alpha * 0.67, letter);
    } else if (len <= 20) {  // Add letters at the end of branches
        push();
        translate(0, -len);
        noStroke();
        fill(255);
        textSize(32); // Adjusted text size for clarity
        textAlign(CENTER, CENTER); // Center align the text
        text(letter, 0, 0);
        pop();
    }
    pop();
}

function updateFractalVisual(message) {
    background(0); // Clear the canvas
    len = 100; // Reset the initial length
    let x = width / 2; // Center the initial x position
    let y = height / 2; // Center the initial y position
    for (let char of message.toLowerCase()) {
        branch(x, y, len, -PI / 2, 255, char); // Draw a new branch for each letter
    }
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
    updateFractalVisual(letter); // Trigger the fractal update based on the letter
};

socket.onclose = () => {
    console.log('WebSocket connection closed.');
};

socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};

function draw() {
    drawBranches(); // Continuously draw branches
}
