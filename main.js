import { setupCanvas, drawCanvas, updateFractalVisual } from './canvas.js';
import { setupWebSocket } from './websocket.js';

function setup() {
    setupCanvas();
    setupWebSocket();
}

function draw() {
    drawCanvas();
}

window.setup = setup;
window.draw = draw;