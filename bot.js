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
    ' ': 'rest.wav',  // Use the silent rest sound file
    '.': 'period.wav', ',': 'comma.wav', '!': 'exclamation.wav', '?': 'question.wav'
};

// Queue to manage sound playback
const queue = [];
let isPlaying = false;

function playNextInQueue() {
    if (queue.length === 0) {
        isPlaying = false;
        return;
    }

    isPlaying = true;
    const noteFile = queue.shift();
    player.play({ path: noteFile }).then(() => {
        // Add a delay of 300ms (adjust as needed for musicality)
        setTimeout(playNextInQueue, 300);
    }).catch((error) => {
        console.error(`Error playing note ${noteFile}: ${error}`);
        // Continue to the next file even if there's an error
        setTimeout(playNextInQueue, 300);
    });
}

function playNoteFromMessage(message) {
    const chars = message.toLowerCase().split('');
    for (let i = 0; i < chars.length; i++) {
        if (chars[i] in charToNote) {
            let noteFile = path.join(__dirname, charToNote[chars[i]]);
            queue.push(noteFile);

            if (chars[i + 1] === ' ' && i < chars.length - 1) {
                let restFile = path.join(__dirname, charToNote[' ']);
                queue.push(restFile);
            }

            if (!isPlaying) {
                playNextInQueue();
            }
        }
    }
}

// Register event handlers
client.on('message', (channel, tags, message, self) => {
    if (self) return;  // Ignore messages from the bot itself
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
