const display = document.getElementById('display');

const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];

function showLetter(letter) {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = letter;
    span.style.color = colors[Math.floor(Math.random() * colors.length)];
    display.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 1000); // Remove the letter after 1 second
}

// Simulate receiving letters from the bot
const testMessage = "hello world";
testMessage.split('').forEach((letter, index) => {
    setTimeout(() => showLetter(letter), index * 500);
});
