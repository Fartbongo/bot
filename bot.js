const WebSocket = require('ws');
const tmi = require('tmi.js');
const path = require('path');
const player = require('node-wav-player');

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Function to broadcast letters to WebSocket clients
function broadcastLetter(letter) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(letter);
        }
    });
}

// Function to generate a simple fractal pattern
function generateFractalPattern(depth) {
    if (depth === 0) return 'a'; // Base case
    const pattern = generateFractalPattern(depth - 1);
    return pattern + pattern + pattern; // Fractal pattern
}

// Generate a fractal pattern with a specific depth
const fractalPattern = generateFractalPattern(3);
console.log(fractalPattern); // Example output: "aaaaaaaaa"

// Define a mapping for characters to notes
const charToNote = {
    'a': 'a.wav', 'b': 'b.wav', 'c': 'c.wav',
    'd': 'd.wav', 'e': 'e.wav', 'f': 'f.wav',
    'g': 'g.wav', 'h': 'd.wav', 'i': 'b.wav',
    'j': 'c.wav', 'k': 'd.wav', 'l': 'e.wav',
    'm': 'f.wav', 'n': 'g.wav', 'o': 'a.wav',
    'p': 'b.wav', 'q': 'c.wav', 'r': 'd.wav',
    's': 'e.wav', 't': 'f.wav', 'u': 'g.wav',
    'v': 'a.wav', 'w': 'b.wav', 'x': 'c.wav',
    'y': 'd.wav', 'z': 'e.wav', ' ': 'rest.wav'
};

const queue = [];
const letterQueue = [];
let isPlaying = false;

function playNextInQueue() {
    if (queue.length === 0) {
        console.log("Queue is empty, stopping playback.");
        isPlaying = false;
        return;
    }

    isPlaying = true;
    const noteFile = queue.shift();
    const letter = letterQueue.shift();

    console.log(`Playing: ${noteFile} for letter: ${letter}`);
    broadcastLetter(letter);

    player.play({ path: noteFile }).then(() => {
        console.log(`Finished playing: ${noteFile}`);
        setTimeout(playNextInQueue, 300);
    }).catch((error) => {
        console.error(`Error playing note ${noteFile}: ${error.message}`);
        setTimeout(playNextInQueue, 300);
    });
}

function playFractalPattern(pattern) {
    for (let char of pattern) {
        if (char in charToNote) {
            let noteFile = path.join(__dirname, charToNote[char]);
            console.log(`Queuing: ${noteFile} for letter: ${char}`);
            queue.push(noteFile);
            letterQueue.push(char);
        } else {
            console.warn(`Character ${char} not mapped to any sound.`);
        }
    }
    if (!isPlaying) {
        playNextInQueue();
    }
}

// Function to display letters on the front-end
function showLetter(letter) {
    const display = document.getElementById('display');

    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];

    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = letter;
    span.style.color = colors[Math.floor(Math.random() * colors.length)];
    display.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 3000); // Remove the letter after 3 seconds
}

// WebSocket connection to the server
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    console.log('WebSocket connection established.');
};

socket.onmessage = (event) => {
    const letter = event.data;
    console.log(`Received: ${letter}`);
    showLetter(letter);
    // Optionally call a function to update the fractal visual
    updateFractalVisual();
};

socket.onclose = () => {
    console.log('WebSocket connection closed.');
};

socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};

// Function to update the fractal visual (if needed)
function updateFractalVisual() {
    // Redraw the fractal with new parameters or update the existing fractal
    background(0);
    translate(width / 2, height);
    branch(len);
}

// Play the fractal pattern when needed
playFractalPattern(fractalPattern);
