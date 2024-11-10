import { updateFractalVisual } from './canvas.js';

const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FF5733', '#33FF57', '#3357FF', '#FF33A133'];

export function setupWebSocket() {
    const socket = new WebSocket('ws://localhost:8080');
    const display = document.getElementById('display');

    socket.onopen = () => {
        console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
        const letter = event.data;
        console.log(`Received: ${letter}`);
        showLetter(letter);
        updateFractalVisual(letter);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed.');
    };

    socket.onerror = (error) => {
        console.error(`WebSocket error: ${error}`);
    };
}

export function showLetter(letter) {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = letter;
    span.style.color = colors[Math.floor(Math.random() * colors.length)];
    display.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 3000);
}