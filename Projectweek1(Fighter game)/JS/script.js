const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player1 = { x: 50, y: 300, width: 40, height: 60, health: 100, color: 'blue', velocityY: 0, jumping: false };
let player2 = { x: 700, y: 300, width: 40, height: 60, health: 100, color: 'red', velocityY: 0, jumping: false };
let gravity = 0.5;
let keys = {};
let timer = 60;
let interval;

document.getElementById('playButton').onclick = startBattle;

function startBattle() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('result').style.display = 'none';

    player1.health = player2.health = 100;
    timer = 60;

    startTimer();
    gameLoop();
}

function startTimer() {
    interval = setInterval(() => {
        timer--;
        if (timer <= 0) {
            clearInterval(interval);
            declareWinner();
        }
    }, 1000);
}

function declareWinner() {
    clearInterval(interval);
    let winner = player1.health > player2.health ? 'Player 1 Wins!' : 'Player 2 Wins!';
    document.getElementById('winner').innerText = winner;
    document.getElementById('result').style.display = 'block';
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw players
    drawStickman(player1);
    drawStickman(player2);

    // Apply gravity
    applyGravity(player1);
    applyGravity(player2);

    // Move players based on keys pressed
    if (keys['a'] && player1.x > 0) player1.x -= 5; // Move left
    if (keys['d'] && player1.x < canvas.width - player1.width) player1.x += 5; // Move right
    if (keys['w'] && !player1.jumping) jump(player1); // Jump

    if (keys['ArrowLeft'] && player2.x > 0) player2.x -= 5; // Move left
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width) player2.x += 5; // Move right
    if (keys['ArrowUp'] && !player2.jumping) jump(player2); // Jump

    // Check for attack
    if (keys['space']) attack(player1, player2);
    if (keys['Enter']) attack(player2, player1);

    requestAnimationFrame(gameLoop);
}

function drawStickman(player) {
    ctx.fillStyle = player.color;

    // Draw head
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - player.height + 15, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw body
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 25);
    ctx.lineTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.stroke();

    // Draw arms
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 30);
    ctx.lineTo(player.x, player.y - player.height + 40);
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 30);
    ctx.lineTo(player.x + player.width, player.y - player.height + 40);
    ctx.stroke();

    // Draw legs
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.lineTo(player.x, player.y - player.height + 70);
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.lineTo(player.x + player.width, player.y - player.height + 70);
    ctx.stroke();

    // Health bar
    ctx.fillStyle = 'black';
    ctx.fillText(`Health: ${player.health}`, player.x, player.y - player.height - 10);
}

function applyGravity(player) {
    if (player.y < canvas.height - player.height) {
        player.velocityY += gravity;
        player.jumping = true;
    } else {
        player.velocityY = 0;
        player.jumping = false;
        player.y = canvas.height - player.height;
    }
    player.y += player.velocityY;
}

function jump(player) {
    player.velocityY = -10;
}

function attack(attacker, defender) {
    // Check for attack proximity
    if (
        attacker.x + attacker.width > defender.x &&
        attacker.x < defender.x + defender.width &&
        attacker.health > 0 && defender.health > 0 // Both players must be alive
    ) {
        defender.health -= 10;
        if (defender.health <= 0) {
            defender.health = 0;
            declareWinner();
        }
    }
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.getElementById('restartButton').onclick = startBattle;
document.getElementById('backButton').onclick = () => {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('result').style.display = 'none';
};
