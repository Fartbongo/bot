const WebSocket = require('ws');
const tmi = require('tmi.js');
const path = require('path');
const player = require('node-wav-player');

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Define configuration options for Twitch chat
const opts = {
    identity: {
        username: 'chatmusicbot',
        password: 'oauth:kogmfeatoxcqelhxdoszgev698fb9g'
    },
    channels: [
        '#fartbongo'
    ]
};

// Create a Twitch chat client with our options
const client = new tmi.Client(opts);

client.connect()
    .then(() => {
        console.log('Connected to Twitch chat');
    })
    .catch(err => {
        console.error('Error connecting to Twitch:', err);
    });

// Function to broadcast letters to WebSocket clients
function broadcastLetter(letter) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(letter);
        }
    });
}

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
const echoDelay = 300; // Echo delay in milliseconds
let volume = 1; // Volume control for the echo effect

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

    player.play({ path: noteFile, gain: volume }).then(() => {
        console.log(`Finished playing: ${noteFile}`);
        volume *= 0.8; // Reduce volume for the echo effect
        setTimeout(playNextInQueue, echoDelay);
    }).catch((error) => {
        console.error(`Error playing note ${noteFile}: ${error.message}`);
        setTimeout(playNextInQueue, echoDelay);
    });
}

function playFractalPattern(message) {
    for (let char of message.toLowerCase()) {
        if (char in charToNote) {
            let noteFile = path.join(__dirname, charToNote[char]);
            console.log(`Queuing: ${noteFile} for letter: ${char}`);
            queue.push(noteFile);
            letterQueue.push(char);
        } else {
            console.warn(`Character ${char} not mapped to any sound.`);
        }
    }
    volume = 1; // Reset volume for each new message
    if (!isPlaying) {
        playNextInQueue();
    }
}

// WebSocket connection to the server
wss.on('connection', (ws) => {
    console.log('New client connected.');

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

// Listen to chat messages and trigger fractal generation
client.on('message', (channel, tags, message, self) => {
    if (self) return; // Ignore messages from the bot itself

    console.log(`${tags['display-name']}: ${message}`);
    playFractalPattern(message); // Play the generated fractal pattern based on the chat message
});
