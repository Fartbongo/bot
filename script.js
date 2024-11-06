let angle;
let len = 150; // Controlled initial length
let branches = [];
let letters = [];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A133'];
const fadeSpeed = 1; // Adjust the speed at which fractals fade out
const maxLetters = 10; // Increase the number of letters
const bounceSpeed = 0.01; // Speed of letter bouncing
let bgOffset = 0;

function setup() {
    let canvas = createCanvas(1000, 800); // Slightly larger canvas size
    canvas.parent('canvasContainer');
    angle = -PI / 4; // Ensure the tree branches are 45 degrees to the right
    background(0);
    frameRate(60); // Smooth animations
}

function branch(x, y, len, angle, alpha, color, depth = 0, letter) {
    push();
    translate(x, y);
    rotate(angle);
    stroke(color);
    strokeWeight(alpha / 255 * 4); // Vary stroke weight with alpha for bold lines
    line(0, 0, 0, -len);

    if (len > 20) {  // Control branch density with larger threshold
        let nextX = 0;
        let nextY = -len;
        branch(nextX, nextY, len * 0.67, angle + PI / 3, alpha * 0.67, color, depth + 1, letter); // Spread out branches more
        branch(nextX, nextY, len * 0.67, angle - PI / 3, alpha * 0.67, color, depth + 1, letter); // Spread out branches more
    } else {  // Add letters at the end of branches
        drawFlower(0, -len, alpha, letter); // Draw flower shapes using letters
    }

    pop();
}

function drawFlower(x, y, alpha, letter) {
    let petals = 'abcdefghijklmnopqrstuvwxyz'; // Letters for petals
    let centerLetter = letter; // Center letter
    fill(255, 255, 0, alpha + 100); // Increased opacity
    noStroke();
    textSize(48); // Larger letters
    textAlign(CENTER, CENTER);
    text(centerLetter, x, y); // Draw center letter

    for (let i = 0; i < 6; i++) {
        let petalLetter = petals.charAt(Math.floor(Math.random() * petals.length)).toUpperCase(); // Random petal letters
        fill(255, 0, 0, alpha + 100); // Increased opacity
        text(petalLetter, x + cos(i * PI / 3) * 20, y + sin(i * PI / 3) * 20);
    }
}

function drawGradient() {
    let c1 = color('#ff9999');
    let c2 = color('#3333ff');
    for (let y = 0; y < height; y++) {
        let n = map(y, 0, height, 0, 1);
        let newc = lerpColor(c1, c2, n);
        stroke(newc);
        line(0, y, width, y);
    }
}

function updateFractalVisual(letter, echoDepth = 3) {
    drawGradient(); // Draw background gradient
    bgOffset += 0.05; // Move gradient for undulating effect
    branches = []; // Reset branches array
    letters = []; // Reset letters array
    let x = width / 2; // Center x position
    let y = height / 2; // Start from the middle of the canvas to raise visuals
    let color = colors[Math.floor(Math.random() * colors.length)]; // Randomize colors
    for (let i = 0; i < echoDepth; i++) {
        let alpha = 255 * Math.pow(0.8, i); // Reduce alpha for each echo
        let scale = Math.pow(0.9, i); // Reduce size for each echo
        branches.push({ x: x, y: y, len: len * scale, angle: -PI / 2 + angle, alpha: alpha, color: color, letter: letter });
        if (i < maxLetters) {  // Increase the number of letters
            letters.push({ x: x, y: y, len: len * scale, letter: letter, alpha: alpha, scale: scale, angle: 0, bounceOffset: 0 }); // Keep letters upright
        }
    }
    redraw(); // Trigger a redraw
}

function draw() {
    drawGradient(); // Draw background gradient
    bgOffset += 0.05; // Move gradient for undulating effect

    // Draw branches
    for (let b of branches) {
        branch(b.x, b.y, b.len, b.angle, b.alpha, b.color, 0, b.letter);
        b.alpha -= fadeSpeed; // Gradually decrease alpha to fade out
    }

    // Draw letters bouncing down the fractal branches
    for (let l of letters) {
        push();
        translate(l.x, l.y + l.bounceOffset);
        rotate(l.angle);
        scale(l.scale); // Apply scaling for pulsating effect
        fill(255, l.alpha + 100); // Increased opacity
        textSize(48); // Increase text size for more impact
        textAlign(CENTER, CENTER);
        text(l.letter, 0, 0); // Draw letters on top
        l.bounceOffset += l.len * bounceSpeed; // Adjust bounce effect to move down
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
