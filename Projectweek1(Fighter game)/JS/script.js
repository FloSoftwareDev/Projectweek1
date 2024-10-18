// Get references to the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define player properties for player1 and player2
let player1 = { 
    x: 50, 
    y: 350, 
    width: 40, 
    height: 60, 
    health: 100, 
    color: 'blue', 
    jumping: false, 
    jumpProgress: 0, 
    jumpHeight: 80 // Controls how high the player jumps
};
let player2 = { 
    x: 700, 
    y: 350, 
    width: 40, 
    height: 60, 
    health: 100, 
    color: 'red', 
    jumping: false, 
    jumpProgress: 0, 
    jumpHeight: 80 // Controls how high the player jumps
};

// Define global game variables
let gravity = 0.5;
let keys = {}; // Stores key states (pressed or not)
let timer = 60; // Timer for the game
let interval; // For the timer interval
let gameOver = false; // Track if the game is over

// Define platform properties
let platform = { x: 200, y: 400, width: 400, height: 20 }; // Adjust position and size as needed

// Event listeners for play and restart buttons
document.getElementById('playButton').onclick = startBattle;
document.getElementById('restartButton').onclick = startBattle;
document.getElementById('backButton').onclick = () => {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('result').style.display = 'none';
};

// Start the game, reset player properties, and initiate the timer
function startBattle() {
    document.getElementById('menu').style.display = 'none'; // Hide the menu
    document.getElementById('result').style.display = 'none'; // Hide result screen

    // Reset both players' positions, health, and other properties
    player1 = { 
        x: 50, 
        y: 350, 
        width: 40, 
        height: 60, 
        health: 100, 
        color: 'blue', 
        jumping: false, 
        jumpProgress: 0, 
        jumpHeight: 80 
    };
    player2 = { 
        x: 700, 
        y: 350, 
        width: 40, 
        height: 60, 
        health: 100, 
        color: 'red', 
        jumping: false, 
        jumpProgress: 0, 
        jumpHeight: 80 
    };

    // Reset game variables
    keys = {};
    timer = 60;
    gameOver = false; // Reset the game over flag

    clearInterval(interval); // Stop any previous intervals
    updateHealthBars(); // Update the health bar display
    startTimer(); // Start the game timer
    gameLoop(); // Begin the main game loop
}

// Start the countdown timer and check for game over when time reaches 0
function startTimer() {
    interval = setInterval(() => {
        timer--; // Decrease timer by 1 second
        if (timer <= 0) {
            clearInterval(interval); // Stop timer
            declareWinner(); // Declare the winner
        }
    }, 1000); // Run every 1000 milliseconds (1 second)
}

// Declare the winner based on the players' health
function declareWinner() {
    clearInterval(interval); // Ensure the timer is stopped
    let winner = player1.health > player2.health ? 'Player 1 Wins!' : 'Player 2 Wins!';
    if (player1.health === player2.health) {
        winner = "It's a draw!";
    }
    document.getElementById('winner').innerText = winner; // Display the winner
    document.getElementById('result').style.display = 'block'; // Show result screen
    gameOver = true; // Set game over to true
}

function gameLoop() {
    if (gameOver) return; // Stop the game loop if the game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw platform
    drawPlatform(); // Draw the platform before players

    // Draw both players
    drawStickman(player1);
    drawStickman(player2);

    // Apply gravity to both players and check for jumping
    applyGravity(player1);
    applyGravity(player2);

    // Handle player1 movement based on keys pressed
    if (keys['a'] && player1.x > 0) player1.x -= 5; // Move left
    if (keys['d'] && player1.x < canvas.width - player1.width) player1.x += 5; // Move right
    if (keys['w']) jump(player1); // Jump

    // Handle player2 movement based on keys pressed
    if (keys['ArrowLeft'] && player2.x > 0) player2.x -= 5; // Move left
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width) player2.x += 5; // Move right
    if (keys['ArrowUp']) jump(player2); // Jump

    requestAnimationFrame(gameLoop); // Request the next frame, continues the loop
}

// Function to draw the platform
function drawPlatform() {
    ctx.fillStyle = 'brown'; // Platform color
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height); // Draw platform
}

// Draw each stickman player
function drawStickman(player) {
    ctx.fillStyle = player.color; // Set the player color

    // Draw head (circle)
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - player.height + 15, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw body (line)
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 25);
    ctx.lineTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.stroke();

    // Draw arms (two lines)
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 30);
    ctx.lineTo(player.x, player.y - player.height + 40); // Left arm
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 30);
    ctx.lineTo(player.x + player.width, player.y - player.height + 40); // Right arm
    ctx.stroke();

    // Draw legs (two lines)
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.lineTo(player.x, player.y - player.height + 70); // Left leg
    ctx.moveTo(player.x + player.width / 2, player.y - player.height + 50);
    ctx.lineTo(player.x + player.width, player.y - player.height + 70); // Right leg
    ctx.stroke();

    // Draw health text
    ctx.fillStyle = 'black';
    ctx.fillText(`Health: ${player.health}`, player.x, player.y - player.height - 10);
}

// Apply gravity and manage the jumping arc for players
function applyGravity(player) {
    const groundLevel = canvas.height - player.height;

    // If the player is jumping, calculate the jump arc using a sine wave
    if (player.jumping) {
        // Increment the jump progress
        player.jumpProgress += 0.1; // Adjust this value to control jump speed

        // Calculate the vertical offset using a sine function for smooth jump
        let jumpOffset = Math.sin(player.jumpProgress) * player.jumpHeight;

        // Update player Y position based on jump arc
        player.y = groundLevel - jumpOffset;

        // End the jump when the progress is complete
        if (player.jumpProgress >= Math.PI) {
            player.jumping = false; // Jump finished
            player.y = groundLevel; // Reset position to ground level
        }
    } else if (player.y + player.height < groundLevel) {
        // Apply gravity when not jumping
        player.y += gravity;
    }
}

// Function to make the player jump
function jump(player) {
    if (!player.jumping && !gameOver) { // Prevent jumping if the game is over
        player.jumping = true; // Start the jump
        player.jumpProgress = 0; // Reset jump progress
    }
}

// Variables for attack delay and cooldown
let canAttack1 = true; // Player 1 attack cooldown
let canAttack2 = true; // Player 2 attack cooldown
let attackCooldown = 500; // 500 milliseconds cooldown between attacks

// Function to handle attacks
function attack(attacker, defender, canAttack, setCooldown) {
    if (canAttack && !gameOver) { // Ensure attack can happen and game is not over
        // Check if attacker is within range to hit the defender
        if (
            attacker.x + attacker.width > defender.x && // Attacker right edge passes defender left edge
            attacker.x < defender.x + defender.width && // Attacker left edge passes defender right edge
            Math.abs(attacker.y - defender.y) < 50 // Ensure they are on the same height level
        ) {
            // Deal damage and update health bars
            defender.health -= 10; // Damage dealt
            if (defender.health < 0) defender.health = 0; // Ensure health doesn't go below 0
            updateHealthBars();

            // End game if defender's health reaches 0
            if (defender.health === 0) {
                declareWinner(); // Declare the winner
            }
        }

        // Set attack cooldown
        setCooldown(false); // Disable attacking
        setTimeout(() => setCooldown(true), attackCooldown); // Reset attack ability after cooldown
    }
}

// Update health bars based on current player health
function updateHealthBars() {
    const player1HealthBar = document.getElementById('player1-health');
    const player2HealthBar = document.getElementById('player2-health');
    player1HealthBar.style.width = player1.health + '%'; // Update player 1 health bar width
    player2HealthBar.style.width = player2.health + '%'; // Update player 2 health bar width
}

// Global keydown listener for movement and attacking
window.addEventListener('keydown', (e) => {
    if (gameOver) return; // Stop any actions if the game is over
    keys[e.key] = true; // Track the key as pressed

    // Player 1 actions
    if (e.key === ' ') {
        // Player 1 attack when pressing space
        attack(player1, player2, canAttack1, (state) => canAttack1 = state);
    }

    // Player 2 actions
    if (e.key === 'Enter') {
        // Player 2 attack when pressing Enter
        attack(player2, player1, canAttack2, (state) => canAttack2 = state);
    }
});

// Global keyup listener to reset key state
window.addEventListener('keyup', (e) => {
    keys[e.key] = false; // Track the key as released
});
