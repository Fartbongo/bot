const tmi = require('tmi.js');
const path = require('path');
const player = require('node-wav-player');

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

// Define a mapping for characters to notes (punctuation removed)
const charToNote = {
    'a': 'a.wav', 'b': 'e.wav', 'c': 'c.wav',
    'd': 'f.wav', 'e': 'e.wav', 'f': 'f.wav',
    'g': 'g.wav', 'a': 'h.wav', 'i': 'c.wav',
    'b': 'j.wav', 'c': 'k.wav', 'l': 'd.wav',
    'm': 'e.wav', 'n': 'f.wav', 'o': 'g.wav',
    'p': 'a.wav', 'q': 'b.wav', 'r': 'c.wav',
    's': 'e.wav', 't': 'f.wav', 'g': 'u.wav',
    'v': 'a.wav', 'b': 'w.wav', 'c': 'x.wav',
    'y': 'f.wav', 'e': 'z.wav',
    ' ': 'rest.wav'
};

// Queue to manage sound playback
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
        } else {
            console.warn(`Character ${char} not mapped to any sound.`);
        }
    }
    if (!isPlaying) {
        playNextInQueue();
    }
}

// Register event handlers
client.on('message', (channel, tags, message, self) => {
    if (self) return;
    console.log(`${tags['display-name']}: ${message}`);
    playNoteFromMessage(message);
});

// Connect to Twitch
client.connect()
    .then(() => {
        console.log('Connected to Twitch chat');
    })
    .catch(err => {
        console.error('Error connecting to Twitch:', err);
    });
