const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const stickmanImage = new Image();
stickmanImage.src = '05.png';
stickmanImage.onerror = () => console.error('Error loading stickman image.');

const slapImages = ['01.png', '02.png', '03.png', '04.png', '05.png'].map(src => {
    const img = new Image();
    img.src = src;
    img.onerror = () => console.error('Error loading slap image: ' + src);
    return img;
});

// Player properties
const createPlayer = (x, y, color) => ({
    x, y, width: 40, height: 60, health: 100, color,
    jumping: false, jumpProgress: 0, jumpHeight: 80,
    canAttack: true, blocking: false, currentSlapFrame: 0, slapAnimationTimer: 0
});

let player1 = createPlayer(50, 350, 'blue');
let player2 = createPlayer(700, 350, 'red');

// Global variables
let gravity = 0.5;
let keys = {};
let timer = 60;
let interval;
let gameOver = false;
let gamePaused = false;
let score1 = 0, score2 = 0;

const platform = { x: 200, y: 400, width: 400, height: 20 };

// Event listeners
document.getElementById('playButton').onclick = startBattle;
document.getElementById('restartButton').onclick = startBattle;
document.getElementById('backButton').onclick = () => {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('result').style.display = 'none';
};

function startBattle() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    player1.health = player2.health = 100;
    keys = {};
    timer = 60;
    clearInterval(interval);
    updateHealthBars();
    startTimer();
    gameLoop();
}

function startTimer() {
    interval = setInterval(() => {
        if (!gameOver && !gamePaused) {
            timer--;
            document.getElementById('timer').innerText = `Tijd: ${timer} s`;
            if (timer <= 0) {
                clearInterval(interval);
                declareWinner();
            }
        }
    }, 1000);
}

function declareWinner() {
    clearInterval(interval);
    let winner = player1.health > player2.health ? 'Player 1 Wins!' : 'Player 2 Wins!';
    if (player1.health === player2.health) winner = "It's a draw!";
    document.getElementById('winner').innerText = winner;
    document.getElementById('result').style.display = 'block';
    if (winner === 'Player 1 Wins!') score1++;
    if (winner === 'Player 2 Wins!') score2++;
    updateScores();
    gameOver = true;
}

function updateScores() {
    document.getElementById('score1').innerText = `Player 1: ${score1}`;
    document.getElementById('score2').innerText = `Player 2: ${score2}`;
}

function gameLoop() {
    if (gameOver || gamePaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlatform();
    drawStickman(player1);
    drawStickman(player2);
    applyGravity(player1);
    applyGravity(player2);
    handlePlayerMovement(player1, 'a', 'd', 'w');
    handlePlayerMovement(player2, 'ArrowLeft', 'ArrowRight', 'ArrowUp');
    updateSlapAnimation(player1);
    updateSlapAnimation(player2);
    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    ctx.fillStyle = '#87CEEB'; // Lichte blauwe lucht
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handlePlayerMovement(player, leftKey, rightKey, jumpKey) {
    if (keys[leftKey] && player.x > 0) player.x -= 5;
    if (keys[rightKey] && player.x < canvas.width - player.width) player.x += 5;
    if (keys[jumpKey]) jump(player);
    if (keys['Shift']) player.blocking = true; // Start blocking
}

function drawPlatform() {
    ctx.fillStyle = 'brown';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}

function drawStickman(player) {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - player.height + 15, 10, 0, Math.PI * 2); // Hoofd
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Lichaam
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 25);
    ctx.lineTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.stroke();

    // Armen
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 30);
    ctx.lineTo(player.x, player.y - player.height + 40);
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 30);
    ctx.lineTo(player.x + player.width, player.y - player.height + 40);
    ctx.stroke();

    // Benen
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.lineTo(player.x, player.y - player.height + 70);
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.lineTo(player.x + player.width, player.y - player.height + 70);
    ctx.stroke();
}

function applyGravity(player) {
    const groundLevel = canvas.height - player.height;
    if (player.jumping) {
        player.jumpProgress += 0.1;
        player.y = groundLevel - Math.sin(player.jumpProgress) * player.jumpHeight;
        if (player.jumpProgress >= Math.PI) {
            player.jumping = false;
            player.y = groundLevel;
        }
    } else if (player.y + player.height < groundLevel) {
        player.y += gravity;
    }
}

function jump(player) {
    if (!player.jumping && !gameOver) {
        player.jumping = true;
        player.jumpProgress = 0;
    }
}

function attack(attacker, defender) {
    if (attacker.canAttack && isColliding(attacker, defender)) {
        if (!defender.blocking) {
            defender.health = Math.max(0, defender.health - 10);
            updateHealthBars();
            if (defender.health === 0) declareWinner();
        }
        startAttackCooldown(attacker);
    }
}

function startAttackCooldown(player) {
    player.canAttack = false;
    setTimeout(() => player.canAttack = true, 500);
}

function isColliding(attacker, defender) {
    return (
        attacker.x + attacker.width > defender.x &&
        attacker.x < defender.x + defender.width &&
        Math.abs(attacker.y - defender.y) < 50
    );
}

function updateSlapAnimation(player) {
    if (player.attacking) {
        player.slapAnimationTimer++;
        if (player.slapAnimationTimer >= 5) {
            player.currentSlapFrame++;
            if (player.currentSlapFrame >= slapImages.length) {
                player.attacking = false;
                player.currentSlapFrame = 0;
            }
            player.slapAnimationTimer = 0;
        }
    }
}

function updateHealthBars() {
    document.getElementById('player1-health').style.width = player1.health + '%';
    document.getElementById('player2-health').style.width = player2.health + '%';
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'p') {
        gamePaused = !gamePaused;
        if (!gamePaused) {
            startTimer();
            gameLoop();
        } else {
            clearInterval(interval);
        }
    }
    if (e.key === ' ' && !player1.blocking) attack(player1, player2);
    if (e.key === 'Enter' && !player2.blocking) attack(player2, player1);
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === 'Shift') player1.blocking = false;
    if (e.key === 'Control') player2.blocking = false;
});

// Start the game when the stickman image is loaded
stickmanImage.onload = () => {
    Promise.all(slapImages.map(img => new Promise(resolve => { img.onload = resolve; })))
        .then(startBattle);
};
