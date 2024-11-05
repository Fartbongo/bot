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

// Define a mapping for characters to notes
const charToNote = {
    'a': 'a.wav', 'b': 'b.wav', 'c': 'c.wav',
    'd': 'd.wav', 'e': 'e.wav', 'f': 'f.wav',
    'g': 'g.wav', 'h': 'h.wav', 'i': 'i.wav',
    'j': 'j.wav', 'k': 'k.wav', 'l': 'l.wav',
    'm': 'm.wav', 'n': 'n.wav', 'o': 'o.wav',
    'p': 'p.wav', 'q': 'q.wav', 'r': 'r.wav',
    's': 's.wav', 't': 't.wav', 'u': 'u.wav',
    'v': 'v.wav', 'w': 'w.wav', 'x': 'x.wav',
    'y': 'y.wav', 'z': 'z.wav',
    ' ': 'rest.wav',
    '.': 'period.wav', ',': 'comma.wav', '!': 'exclamation.wav', '?': 'question.wav'
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
    player.play({ path: noteFile })
        .then(() => {
            console.log(`Finished playing: ${noteFile}`);
            setTimeout(() => {
                isPlaying = false;
                playNextInQueue();
            }, 300);
        })
        .catch((error) => {
            console.error(`Error playing note ${noteFile}: ${error.message}`);
            // Retry playing the next sound
            setTimeout(() => {
                isPlaying = false;
                playNextInQueue();
            }, 300);
        });
}

function playNoteFromMessage(message) {
    const chars = message.toLowerCase().split('');
    chars.forEach((char, index) => {
        if (char in charToNote) {
            let noteFile = path.join(__dirname, charToNote[char]);
            console.log(`Queuing: ${noteFile}`);
            queue.push(noteFile);
        } else {
            console.warn(`Character ${char} not mapped to any sound.`);
        }
    });
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
