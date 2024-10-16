// Get references to the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define player properties for player1 and player2
let player1 = { x: 50, y: 300, width: 40, height: 60, health: 100, color: 'blue', velocityY: 0, jumping: false };
let player2 = { x: 700, y: 300, width: 40, height: 60, health: 100, color: 'red', velocityY: 0, jumping: false };

// Define global game variables
let gravity = 0.5;
let keys = {}; // Stores key states (pressed or not)
let timer = 60; // Timer for the game
let interval; // For the timer interval

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
    player1 = { x: 50, y: 300, width: 40, height: 60, health: 100, color: 'blue', velocityY: 0, jumping: false };
    player2 = { x: 700, y: 300, width: 40, height: 60, health: 100, color: 'red', velocityY: 0, jumping: false };

    // Reset game variables
    keys = {};
    timer = 60;

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
}

// Main game loop, constantly updates the canvas and player states
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw both players
    drawStickman(player1);
    drawStickman(player2);

    // Apply gravity to both players
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

    // Check for attack actions
    if (keys['z']) attack(player1, player2); // Player1 attacks with 'z'
    if (keys['Enter']) attack(player2, player1); // Player2 attacks with 'Enter'

    requestAnimationFrame(gameLoop); // Request the next frame, continues the loop
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

// Apply gravity to players, ensuring they fall unless they're on the ground
function applyGravity(player) {
    if (player.y < canvas.height - player.height) {
        player.velocityY += gravity; // Increase velocity as the player falls
    } else {
        player.velocityY = 0; // Stop falling when player hits the ground
        player.jumping = false; // Player is no longer jumping
        player.y = canvas.height - player.height; // Reset position to ground
    }
    player.y += player.velocityY; // Update player position with gravity
}

// Function to make the player jump
function jump(player) {
    if (!player.jumping) {
        player.velocityY = -10; // Initial jump velocity
        player.jumping = true; // Mark player as jumping to prevent double jumps
    }
}

// Handle attacks between two players, reduce health when in range
function attack(attacker, defender) {
    if (
        attacker.x + attacker.width > defender.x && // Attacker is close to defender
        attacker.x < defender.x + defender.width &&
        attacker.health > 0 && defender.health > 0 // Both players must be alive
    ) {
        defender.health -= 10; // Reduce defender's health
        if (defender.health < 0) defender.health = 0; // Prevent negative health

        updateHealthBars(); // Update health bars on screen after attack

        if (defender.health <= 0) { // If defender's health reaches 0, game over
            defender.health = 0;
            declareWinner(); // Declare winner when one player has 0 health
        }
    }
}

// Update the health bars based on the current health of each player
function updateHealthBars() {
    const player1HealthBar = document.getElementById('player1-health');
    const player2HealthBar = document.getElementById('player2-health');

    player1HealthBar.style.width = player1.health + '%'; // Set health bar width to health percentage
    player2HealthBar.style.width = player2.health + '%'; // Set health bar width to health percentage
}

// Keydown event listener to track when keys are pressed
window.addEventListener('keydown', (e) => {
    keys[e.key] = true; // Set key state to true when pressed
});

// Keyup event listener to track when keys are released
window.addEventListener('keyup', (e) => {
    keys[e.key] = false; // Set key state to false when released
});
