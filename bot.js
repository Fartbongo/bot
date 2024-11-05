const WebSocket = require('ws');
const tmi = require('tmi.js');
const path = require('path');
const player = require('node-wav-player');

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Define configuration options
const opts = {
    identity: {
        username: 'chatmusicbot',
        password: 'oauth:kogmfeatoxcqelhxdoszgev698fb9g'
    },
    channels: [
        '#fartbongo'
    ]
};

// Create a client with our options
const client = new tmi.Client(opts);

// Define a mapping for characters to notes
const charToNote = {
    'a': 'c.wav', 'b': 'f.wav', 'c': 'g.wav',
    'd': 'c.wav', 'e': 'f.wav', 'f': 'g.wav',
    'g': 'c.wav', 'h': 'f.wav', 'i': 'g.wav',
    'j': 'c.wav', 'k': 'f.wav', 'l': 'g.wav',
    'm': 'c.wav', 'n': 'f.wav', 'o': 'g.wav',
    'p': 'c.wav', 'q': 'f.wav', 'r': 'g.wav',
    's': 'c.wav', 't': 'f.wav', 'u': 'g.wav',
    'v': 'c.wav', 'w': 'f.wav', 'x': 'g.wav',
    'y': 'c.wav', 'z': 'f.wav', ' ': 'rest.wav'
};

const queue = [];
let isPlaying = false;

function playNextInQueue() {
    if (queue.length === 0) {
        console.log("Queue is empty, stopping playback.");
        isPlaying = false;
        return;
    }

    isPlaying = true;
    const noteFile = queue.shift();
    console.log(`Playing: ${noteFile}`);
    player.play({ path: noteFile }).then(() => {
        console.log(`Finished playing: ${noteFile}`);
        setTimeout(playNextInQueue, 300);
    }).catch((error) => {
        console.error(`Error playing note ${noteFile}: ${error.message}`);
        setTimeout(playNextInQueue, 300);
    });
}

function playNoteFromMessage(message) {
    for (let char of message.toLowerCase()) {
        if (char in charToNote) {
            let noteFile = path.join(__dirname, charToNote[char]);
            console.log(`Queuing: ${noteFile}`);
            queue.push(noteFile);
            broadcastLetter(char);
        } else {
            console.warn(`Character ${char} not mapped to any sound.`);
        }
    }
    if (!isPlaying) {
        playNextInQueue();
    }
}

// Function to broadcast letters to WebSocket clients
function broadcastLetter(letter) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(letter);
        }
    });
}

// Register event handlers
client.on('message', (channel, tags, message, self) => {
    if (self) return;
    console.log(`${tags['display-name']}: ${message}`);
    playNoteFromMessage(message);
});

client.connect()
    .then(() => {
        console.log('Connected to Twitch chat');
    })
    .catch(err => {
        console.error('Error connecting to Twitch:', err);
    });
