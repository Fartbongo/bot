let angle;
let len = 150; // Controlled initial length
let branches = [];
let letters = [];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A133'];

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

    if (len > 20) {  // Control branch density with larger threshold
        let nextX = 0;
        let nextY = -len;
        branch(nextX, nextY, len * 0.67, angle + PI / 4, alpha * 0.67, color, letter); // Spread out more
        branch(nextX, nextY, len * 0.67, angle - PI / 4, alpha * 0.67, color, letter); // Spread out more
    } else {  // Add letters at the end of branches
        noStroke();
        fill(255);
        textSize(48); // Increase text size for more impact
        textAlign(CENTER, CENTER);
        text(letter, 0, -len); // Place letters centrally
    }

    pop();
}

function updateFractalVisual(letter, echoDepth = 3) {
    background(0); // Clear the canvas
    branches = []; // Reset branches array
    letters = []; // Reset letters array
    let x = width / 2; // Center x position
    let y = height / 2; // Center y position
    let color = colors[Math.floor(Math.random() * colors.length)]; // Randomize colors
    for (let i = 0; i < echoDepth; i++) {
        let alpha = 255 * Math.pow(0.8, i); // Reduce alpha for each echo
        let scale = Math.pow(0.9, i); // Reduce size for each echo
        branches.push({ x: x, y: y, len: len * scale, angle: -PI / 2, alpha: alpha, color: color, letter: letter });
        letters.push({ x: x, y: y - len * scale, letter: letter, alpha: alpha, scale: scale }); // Store letter positions and alpha for echo effect
    }
    redraw(); // Trigger a redraw
}

function draw() {
    background(0); // Clear the canvas

    // Draw branches
    for (let b of branches) {
        branch(b.x, b.y, b.len, b.angle, b.alpha, b.color, b.letter);
        b.alpha -= 5; // Gradually decrease alpha to fade out
    }

    // Draw letters on top and moving through branches
    for (let l of letters) {
        push();
        translate(l.x, l.y);
        scale(l.scale); // Apply scaling for pulsating effect
        fill(255, l.alpha); // Apply alpha for echo effect
        textSize(48); // Increase text size for more impact
        textAlign(CENTER, CENTER);
        text(l.letter, 0, 0); // Draw letters on top
        l.alpha -= 5; // Gradually decrease alpha to fade out
        pop();
    }

    // Remove branches and letters that have fully dissipated
    branches = branches.filter(b => b.alpha > 0);
    letters = letters.filter(l => l.alpha > 0);
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
