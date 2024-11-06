let angle;
let len = 150; // Controlled initial length
let branches = [];
let letters = [];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A133'];
const fadeSpeed = 1; // Adjust the speed at which fractals fade out
const maxLetters = 5; // Limit the number of letters
const bounceSpeed = 0.01; // Speed of letter bouncing

function setup() {
    let canvas = createCanvas(900, 1200); // Adjust canvas size for rotation
    canvas.parent('canvasContainer');
    angle = PI / 4; // Adjust the angle for more spread
    background(0);
    frameRate(60); // Smooth animations
}

function branch(x, y, len, angle, alpha, color, depth = 0, letter) {
    push();
    translate(x, y);
    rotate(angle);
    stroke(color);
    strokeWeight(alpha / 255 * 4); // Vary stroke weight with alpha for bold lines
    line(0, 0, len, 0); // Rotate line to be horizontal

    if (len > 20) {  // Control branch density with larger threshold
        let nextX = len;
        let nextY = 0;
        branch(nextX, nextY, len * 0.67, angle + random(PI / 6, PI / 3), alpha * 0.67, color, depth + 1, letter); // Spread out more dynamically
        branch(nextX, nextY, len * 0.67, angle - random(PI / 6, PI / 3), alpha * 0.67, color, depth + 1, letter); // Spread out more dynamically
    } else if (depth < maxLetters) {  // Add letters at the end of branches
        drawFlower(len, 0, alpha, letter); // Draw flower shapes using letters
    }

    pop();
}

function drawFlower(x, y, alpha, letter) {
    let petals = 'abcdefghijklmnopqrstuvwxyz'; // Letters for petals
    let centerLetter = letter; // Center letter
    fill(255, 255, 0, alpha); // Center color
    noStroke();
    textSize(32);
    textAlign(CENTER, CENTER);
    text(centerLetter, x, y); // Draw center letter

    for (let i = 0; i < 6; i++) {
        let petalLetter = petals.charAt(Math.floor(Math.random() * petals.length)).toUpperCase(); // Random petal letters
        fill(255, 0, 0, alpha); // Petal color
        text(petalLetter, x + cos(i * PI / 3) * 20, y + sin(i * PI / 3) * 20);
    }
}

function updateFractalVisual(letter, echoDepth = 3) {
    background(0); // Clear the canvas
    branches = []; // Reset branches array
    letters = []; // Reset letters array
    let x = height / 2; // Adjust center x position for rotation
    let y = width / 2; // Adjust center y position for rotation
    let color = colors[Math.floor(Math.random() * colors.length)]; // Randomize colors
    for (let i = 0; i < echoDepth; i++) {
        let alpha = 255 * Math.pow(0.8, i); // Reduce alpha for each echo
        let scale = Math.pow(0.9, i); // Reduce size for each echo
        branches.push({ x: x, y: y, len: len * scale, angle: 0, alpha: alpha, color: color, letter: letter });
        if (i < maxLetters) {  // Limit the number of letters
            letters.push({ x: x, y: y, len: len * scale, letter: letter, alpha: alpha, scale: scale, angle: 0, bounceOffset: 0 });
        }
    }
    redraw(); // Trigger a redraw
}

function draw() {
    background(0); // Clear the canvas

    // Draw branches
    for (let b of branches) {
        branch(b.x, b.y, b.len, b.angle, b.alpha, b.color, 0, b.letter);
        b.alpha -= fadeSpeed; // Gradually decrease alpha to fade out
    }

    // Draw letters bouncing along the fractal branches
    for (let l of letters) {
        push();
        translate(l.x + l.bounceOffset, l.y); // Adjust translation for horizontal movement
        rotate(l.angle);
        scale(l.scale); // Apply scaling for pulsating effect
        fill(255, l.alpha); // Apply alpha for echo effect
        textSize(48); // Increase text size for more impact
        textAlign(CENTER, CENTER);
        text(l.letter, 0, 0); // Draw letters on top
        l.bounceOffset += l.len * bounceSpeed; // Adjust bounce effect to move horizontally
        l.scale *= 0.95; // Reduce size of letters
        l.alpha -= fadeSpeed; // Gradually decrease alpha to fade out
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
