let angle;
let len = 150;
let branches = [];
let letters = [];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A133'];
const fadeSpeed = 1;
const maxLetters = 10;
const bounceSpeed = 0.01;
let bgOffset = 0;
let oldLetters = [];

export function setupCanvas() {
    let canvas = createCanvas(1000, 800);
    canvas.parent('canvasContainer');
    angle = -PI / 4;
    background(0);
    frameRate(60);
}

export function drawCanvas() {
    drawGradient();
    bgOffset += 0.05;

    for (let b of branches) {
        branch(b.x, b.y, b.len, b.angle, b.alpha, b.color, 0, b.letter);
        b.alpha -= fadeSpeed;
    }

    for (let l of letters) {
        push();
        translate(l.x, l.y);
        rotate(l.angle);
        scale(l.scale);
        fill(255, l.alpha + 100);
        textSize(48);
        textAlign(CENTER, CENTER);
        text(l.letter, 0, 0);
        l.bounceOffset += l.len * bounceSpeed;
        l.scale *= 1.05;
        l.alpha -= fadeSpeed;
        pop();
    }

    for (let i = oldLetters.length - 1; i >= 0; i--) {
        let o = oldLetters[i];
        fill(o.color);
        textSize(o.size);
        textAlign(CENTER, CENTER);
        text(o.letter, o.x, o.y);
        o.y -= o.size * bounceSpeed * 5;
        o.alpha -= fadeSpeed;
        o.size *= 1.05;
        if (o.alpha <= 0) oldLetters.splice(i, 1);
    }

    branches = branches.filter(b => b.alpha > 0);
    letters = letters.filter(l => l.alpha > 0);
}

function branch(x, y, len, angle, alpha, color, depth = 0, letter) {
    push();
    translate(x, y);
    rotate(angle);
    stroke(color);
    strokeWeight(alpha / 255 * 4);
    line(0, 0, 0, -len);

    if (len > 20) {
        let nextX = 0;
        let nextY = -len;
        branch(nextX, nextY, len * 0.67, angle + PI / 6, alpha * 0.67, color, depth + 1, letter);
        branch(nextX, nextY, len * 0.67, angle - PI / 6, alpha * 0.67, color, depth + 1, letter);
    } else {
        drawFlower(0, -len, alpha, letter);
    }

    pop();
}

let petals = 'abcdefghijklmnopqrstuvwxyz';

function drawFlower(x, y, alpha, letter) {
    let centerLetter = letter;
    fill(255, 255, 0, alpha + 100);
    noStroke();
    textSize(48);
    textAlign(CENTER, CENTER);
    text(centerLetter, x, y);

    for (let i = 0; i < 6; i++) {
        let petalLetter = petals.charAt(Math.floor(Math.random() * petals.length)).toUpperCase();
        fill(255, 0, 0, alpha + 100);
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

export function updateFractalVisual(letter, echoDepth = 3) {
    drawGradient();
    bgOffset += 0.05;
    branches = [];
    letters = [];
    oldLetters.push({ letter: letter, color: colors[Math.floor(Math.random() * colors.length)], x: width / 2, y: height / 2, alpha: 255, size: 48 });

    let x = width / 2;
    let y = height / 2;
    let color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < echoDepth; i++) {
        let alpha = 255 * Math.pow(0.8, i);
        let scale = Math.pow(0.9, i);
        branches.push({ x: x, y: y, len: len * scale, angle: -PI / 2 + angle, alpha: alpha, color: color, letter: letter });
        if (i < maxLetters) {
            letters.push({ x: x, y: y, len: len * scale, letter: letter, alpha: alpha, scale: scale, angle: 0, bounceOffset: 0 });
        }
    }
    if (typeof redraw === 'function') {
        redraw();
    }
}