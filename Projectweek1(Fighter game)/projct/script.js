// Get references to the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load the stickman image
let stickmanImage = new Image();

stickmanImage.src = '15.png'; // Vervang dit door het pad naar je afbeelding

// Player properties for player1 and player2
let player1 = {
    x: 50,
    y: 300,
    width: 40,
    height: 60,
    health: 100,
    color: 'blue',
    jumping: false,
    jumpProgress: 0,
    jumpHeight: 80,
    canAttack: true,
    blocking: false
};
let player2 = {
    x: 700,
    y: 300,
    width: 40,
    height: 60,
    health: 100,
    color: 'red',
    jumping: false,
    jumpProgress: 0,
    jumpHeight: 80,
    canAttack: true,
    blocking: false
};

// Global game variables
let gravity = 0.5; // Gravity applied to players
let keys = {}; // Stores key states (pressed or not)
let timer = 60; // Timer for the game duration
let interval; // For the timer interval
let gameOver = false; // Track if the game is over
let gamePaused = false; // Track if the game is paused

// Event listeners for play and restart buttons
document
    .getElementById('playButton')
    .onclick = startBattle;
document
    .getElementById('restartButton')
    .onclick = startBattle;
document
    .getElementById('backButton')
    .onclick = () => {
        document
            .getElementById('menu')
            .style
            .display = 'flex';
        document
            .getElementById('result')
            .style
            .display = 'none';
        const canvas = document.getElementById('gameCanvas');
        canvas
            .classList
            .add('hidden');
        document
            .getElementById('player1-health-container')
            .style
            .display = 'none';
        document
            .getElementById('player2-health-container')
            .style
            .display = 'none';
    };

// Function to start the battle and initialize game variables
function startBattle() {
    document
        .getElementById('menu')
        .style
        .display = 'none';
    document
        .getElementById('result')
        .style
        .display = 'none';
    const canvas = document.getElementById('gameCanvas');
    canvas
        .classList
        .remove('hidden');
    document
        .getElementById('player1-health-container')
        .style
        .display = 'block';
    document
        .getElementById('player2-health-container')
        .style
        .display = 'block';
    player1.health = 100;
    player2.health = 100;
    updateHealthBars();
    player1 = {
        x: 50,
        y: 300,
        width: 40,
        height: 60,
        health: 100,
        color: 'blue',
        jumping: false,
        jumpProgress: 0,
        jumpHeight: 80,
        canAttack: true,
        blocking: false
    };
    player2 = {
        x: 700,
        y: 300,
        width: 40,
        height: 60,
        health: 100,
        color: 'red',
        jumping: false,
        jumpProgress: 0,
        jumpHeight: 80,
        canAttack: true,
        blocking: false
    };
    keys = {};
    timer = 60;
    gameOver = false;
    gamePaused = false;
    clearInterval(interval);
    updateHealthBars();
    startTimer();
    gameLoop();
}

// Function to start the countdown timer and manage game over logic
function startTimer() {
    interval = setInterval(() => {
        if (!gameOver && !gamePaused) {
            timer--;
            if (timer <= 0) {
                clearInterval(interval);
                declareWinner();
            }
        }
    }, 1000);
}

// Function to declare the winner based on players' health
function declareWinner() {
    clearInterval(interval);
    let winner = player1.health > player2.health
        ? 'Player 1 Wins!'
        : 'Player 2 Wins!';
    if (player1.health === player2.health) {
        winner = "It's a draw!";
    }
    document
        .getElementById('winner')
        .innerText = winner;
    document
        .getElementById('result')
        .style
        .display = 'block';
    gameOver = true;
}

// Main game loop that handles rendering and player movements
function gameLoop() {
    if (gameOver || gamePaused)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatform(); // Draw the platform first
    drawStickman(player1);
    drawStickman(player2);
    applyGravity(player1);
    if (player1.y > 340)
        player1.y = 340; // Stop player1 at the platform level
    applyGravity(player2);
    if (player2.y > 340)
        player2.y = 340; // Stop player2 at the platform level
    if (keys['a'] && player1.x > 0 && !gameOver && !isColliding(player1, player2, 'left'))
        player1.x -= 5;
    if (keys['d'] && player1.x < canvas.width - player1.width && !gameOver && !isColliding(player1, player2, 'right'))
        player1.x += 5;
    if (keys['w'] && !gameOver && !isColliding(player1, player2, 'up'))
        jump(player1);
    if (keys['ArrowLeft'] && player2.x > 0 && !gameOver && !isColliding(player2, player1, 'left'))
        player2.x -= 5;
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width && !gameOver && !isColliding(player2, player1, 'right'))
        player2.x += 5;
    if (keys['ArrowUp'] && !gameOver && !isColliding(player2, player1, 'up'))
        jump(player2);
    checkCollision(player1, player2);
    drawTimer();
    requestAnimationFrame(gameLoop);
}

// Function to draw the platform for players to stand on
function drawPlatform() {
    ctx.fillStyle = '#654321'; // Brown color for the platform
    ctx.fillRect(0, 350, canvas.width, 50); // Draw the platform near the bottom of the canvas
}

// Function to draw the remaining time at the top center of the canvas
function drawTimer() {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(`Time: ${timer}`, canvas.width / 2, 50);
}

// Function to draw each stickman player using an image
function drawStickman(player) {
    ctx.drawImage(
        stickmanImage,
        player.x,
        player.y - player.height,
        player.width,
        player.height
    );
}

// Function to apply gravity and manage the jumping arc for players
function applyGravity(player) {
    const groundLevel = 340; // Platform height
    if (player.jumping) {
        player.jumpProgress += 0.1;
        let jumpOffset = Math.sin(player.jumpProgress) * player.jumpHeight;
        player.y = groundLevel - jumpOffset;
        if (player.jumpProgress >= Math.PI) {
            player.jumping = false;
            player.y = groundLevel;
        }
    } else if (player.y < groundLevel) {
        player.y += gravity;
    }
}

// Function to make the player jump
function jump(player) {
    if (!player.jumping && !gameOver) {
        player.jumping = true;
        player.jumpProgress = 0;
    }
}

// Function to handle attacks between players
function attack(attacker, defender) {
    if (attacker.canAttack && !gameOver) {
        if (attacker.x + attacker.width > defender.x && attacker.x < defender.x + defender.width && Math.abs(attacker.y - defender.y) < 50) {
            if (!defender.blocking) {
                defender.health -= 10;
                if (defender.health < 0)
                    defender.health = 0;
            }
            updateHealthBars();
            if (defender.health === 0) {
                declareWinner();
            }
        }
        setAttackCooldown(attacker);
    }
}

// Function to set the attack cooldown
function setAttackCooldown(player) {
    player.canAttack = false;
    setTimeout(() => {
        player.canAttack = true;
    }, 500);
}

// Function to update health bars for both players
function updateHealthBars() {
    const player1HealthBar = document.getElementById('player1-health');
    const player2HealthBar = document.getElementById('player2-health');
    player1HealthBar.style.width = player1.health + '%';
    player2HealthBar.style.width = player2.health + '%';
    player1HealthBar.innerText = `Player 1: ${player1.health}%`;
    player2HealthBar.innerText = `Player 2: ${player2.health}%`;
}

// Function to check for collisions between players
function checkCollision(playerA, playerB) {
    if (playerA.x < playerB.x + playerB.width && playerA.x + playerA.width > playerB.x && playerA.y < playerB.y + playerB.height && playerA.y + playerA.height > playerB.y) {
        // Handle collision (e.g., stop movement, push back players, reduce speed)
        console.log('Collision detected');
    }
}

// Function to determine if players are colliding to prevent walking through each other
function isColliding(playerA, playerB, direction) {
    if (playerA.x < playerB.x + playerB.width && playerA.x + playerA.width > playerB.x && playerA.y < playerB.y + playerB.height && playerA.y + playerA.height > playerB.y) {
        // Horizontal collision checks
        if (direction === 'left' && playerA.x > playerB.x) {
            return true;
        }
        if (direction === 'right' && playerA.x < playerB.x) {
            return true;
        }
        // Vertical collision checks
        if (direction === 'up' && playerA.y > playerB.y) {
            return true;
        }
        if (direction === 'down' && playerA.y < playerB.y) {
            return true;
        }
    }
    return false;
}

// Event listener for keydown events
window.addEventListener('keydown', (e) => {
    if (gameOver)
        return;
    if (e.key === 'p') {
        gamePaused = !gamePaused;
        if (!gamePaused) {
            startTimer();
            gameLoop();
        } else {
            clearInterval(interval);
        }
    } else {
        keys[e.key] = true;
        if (e.key === ' ' && !player1.blocking) {
            attack(player1, player2);
        }
        if (e.key === 'Enter' && !player2.blocking) {
            attack(player2, player1);
        }
    }
});

// Event listener for keyup events
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === 'Shift')
        player1.blocking = false;
    if (e.key === 'Control')
        player2.blocking = false;
});

// Start the game loop when the image is loaded
stickmanImage.onload = function () {
    startBattle(); // Start the battle or game loop when the image is loaded
};
