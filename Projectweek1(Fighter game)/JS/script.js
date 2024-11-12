// Get references to the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio elements for background music
const menuMusic = new Audio('Soundtracks/Menu.mp3');
const gameMusic = new Audio('Soundtracks/Battle.mp3');

// Start menu music after user interaction to comply with autoplay policies
menuMusic.loop = true;
gameMusic.loop = true;

// Player properties template for character selection
const KeroImage = new Image();
KeroImage.src = 'IMG/Paladin_Idle.png'; // Vervang door het juiste pad
const KeroAttackImages = [
    new Image(),
    new Image()
];
KeroAttackImages[0].src = 'IMG/Kero_attack1.png'; // Vervang door het juiste pad
KeroAttackImages[1].src = 'IMG/Kero_attack2.png'; // Vervang door het juiste pad

const LiraImage = new Image();
LiraImage.src = 'IMG/Rogue_Idle.png'; // Vervang door het juiste pad
const LiraAttackImages = [
    new Image(),
    new Image()
];
LiraAttackImages[0].src = 'IMG/attack_Lira1.png';
LiraAttackImages[1].src = 'IMG/attack_Lira2.png';

const DraxImage = new Image();
DraxImage.src = 'IMG/idle.png'; // Vervang door het juiste pad
const DraxAttackImages = [
    new Image(),
    new Image()
];
DraxAttackImages[0].src = 'IMG/attack_Drax1.png';
DraxAttackImages[1].src = 'IMG/attack_Drax2.png';

const Meester_SumiImage = new Image();
Meester_SumiImage.src = 'IMG/idle.png'; // Vervang door het juiste pad
const Meester_SumiAttackImages = [
    new Image(),
    new Image()
];
Meester_SumiAttackImages[0].src = 'IMG/attack_Meester_Sumi1.png';
Meester_SumiAttackImages[1].src = 'IMG/attack_Meester_Sumi2.png';

const ZinImage = new Image();
ZinImage.src = 'IMG/idle.png'; // Vervang door het juiste pad
const ZinAttackImages = [
    new Image(),
    new Image()
];
ZinAttackImages[0].src = 'IMG/attack_Zin1.png';
ZinAttackImages[1].src = 'IMG/attack_Zin2.png';

const OrlaImage = new Image();
OrlaImage.src = 'IMG/idle.png'; // Vervang door het juiste pad
const OrlaAttackImages = [
    new Image(),
    new Image()
];
OrlaAttackImages[0].src = 'IMG/attack_Orla1.png';
OrlaAttackImages[1].src = 'IMG/attack_Orla2.png';

const Dark_ForcesImage = new Image();
Dark_ForcesImage.src = 'IMG/idle.png'; // Vervang door het juiste pad
const Dark_ForcesAttackImages = [
    new Image(),
    new Image()
];
Dark_ForcesAttackImages[0].src = 'IMG/attack_Dark_Forces1.png';
Dark_ForcesAttackImages[1].src = 'IMG/attack_Dark_Forces2.png';

const characters = [
    { name: 'Kero', health: 120, damage: 20, speed: 1.2, color: 'blue', attackRange: 50, image: KeroImage, attackImages: KeroAttackImages },
    { name: 'Lira', health: 80, damage: 15, speed: 1.0, color: 'purple', attackRange: 350, image: LiraImage, attackImages: LiraAttackImages },
    { name: 'Drax', health: 100, damage: 20, speed: 1.5, color: 'green', attackRange: 40, image: DraxImage, attackImages: DraxAttackImages },
    { name: 'Meester Sumi', health: 150, damage: 10, speed: 0.8, color: 'gray', attackRange: 45, image: Meester_SumiImage, attackImages: Meester_SumiAttackImages },
    { name: 'Zin', health: 90, damage: 18, speed: 1.4, color: 'orange', attackRange: 400, image: ZinImage, attackImages: ZinAttackImages },
    { name: 'Orla', health: 130, damage: 13, speed: 1.0, color: 'white', attackRange: 50, image: OrlaImage, attackImages: OrlaAttackImages },
    { name: 'Dark Forces', health: 85, damage: 23, speed: 1.6, color: 'black', attackRange: 60,  image: LiraImage, attackImages: Dark_ForcesAttackImages },
];

let player1Character = characters[0]; // Default to Kero
let player2Character = characters[1]; // Default to Lira

// Player properties for player1 and player2
let player1 = createPlayer(player1Character, 50, 300);
let player2 = createPlayer(player2Character, 700, 300);

function createPlayer(character, x, y) {
    return {
        x: x,
        y: y,
        width: 40,
        height: 60,
        health: character.health,
        damage: character.damage,
        speed: character.speed,
        color: character.color,
        attackRange: character.attackRange,
        image: character.image, // Voeg de afbeelding toe
        attackImages: character.attackImages, // Attack images for animation
        jumping: false,
        jumpProgress: 0,
        jumpHeight: 80,
        canAttack: true,
        blocking: false,
        attacking: false,
        attackFrame: 0
    };
}

// Global game variables
let gravity = 1.5; // Gravity applied to players
let keys = {}; // Stores key states (pressed or not)
let timer = 60; // Timer for the game duration
let interval; // For the timer interval
let gameOver = false; // Track if the game is over
let gamePaused = false; // Track if the game is paused

// Event listeners for play, restart, and character selection buttons
document
    .getElementById('playButton')
    .onclick = () => {
        menuMusic.pause();
        gameMusic.play();
        startBattle();
    };
document
    .getElementById('restartButton')
    .onclick = () => {
        menuMusic.pause();
        gameMusic.play();
        startBattle();
    };
document
    .getElementById('backButton')
    .onclick = () => {
        gameMusic.pause();
        menuMusic.play();
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
        document.getElementById('character-selection-container').style.display = 'block';
    };

// Character selection logic
document.addEventListener('DOMContentLoaded', () => {
    const characterSelectionContainer = document.createElement('div');
    characterSelectionContainer.id = 'character-selection-container';
    characterSelectionContainer.innerHTML = '<h2>Select Characters for Player 1 and Player 2:</h2>';

    const player1Selection = document.createElement('div');
    player1Selection.id = 'player1-selection';
    player1Selection.innerHTML = '<h3>Player 1:</h3>';
    characters.forEach((character) => {
        const characterButton = document.createElement('button');
        characterButton.className = 'character-button';
        characterButton.innerText = character.name;
        characterButton.onclick = () => {
            player1Character = character;
            document.querySelectorAll('#player1-selection .character-button').forEach(button => button.style.backgroundColor = '');
            characterButton.style.backgroundColor = 'purple';
        };
        player1Selection.appendChild(characterButton);
    });

    const player2Selection = document.createElement('div');
    player2Selection.id = 'player2-selection';
    player2Selection.innerHTML = '<h3>Player 2:</h3>';
    characters.forEach((character) => {
        const characterButton = document.createElement('button');
        characterButton.className = 'character-button';
        characterButton.innerText = character.name;
        characterButton.onclick = () => {
            player2Character = character;
            document.querySelectorAll('#player2-selection .character-button').forEach(button => button.style.backgroundColor = '');
            characterButton.style.backgroundColor = 'purple';
        };
        player2Selection.appendChild(characterButton);
    });

    characterSelectionContainer.appendChild(player1Selection);
    characterSelectionContainer.appendChild(player2Selection);
    document.body.insertBefore(characterSelectionContainer, document.getElementById('menu'));
});

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
    document.getElementById('character-selection-container').style.display = 'none';

    player1 = createPlayer(player1Character, 50, 300);
    player2 = createPlayer(player2Character, 700, 300);
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
    const gameOverSound = new Audio('Soundtracks/game_over.mp3');
    gameMusic.pause();
    gamePaused = true;
    gameOverSound.play();
    gameOverSound.onended = () => {
        gamePaused = false;
        menuMusic.play();
    };
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
    drawCharacter(player1); // Gebruik de nieuwe functie
    drawCharacter(player2); // Gebruik de nieuwe functie
    applyGravity(player1);
    if (player1.y > 340) 
        player1.y = 340; // Stop player1 at the platform level
    applyGravity(player2);
    if (player2.y > 340) 
        player2.y = 340; // Stop player2 at the platform level
    if (keys['a'] && player1.x > 0 && !gameOver && !isColliding(player1, player2, 'left')) 
        player1.x -= player1.speed; // Use player-specific speed for movement
    if (keys['d'] && player1.x < canvas.width - player1.width && !gameOver && !isColliding(player1, player2, 'right')) 
        player1.x += player1.speed; // Use player-specific speed for movement
    if (keys['w'] && !gameOver && !isColliding(player1, player2, 'up')) 
        jump(player1);
    if (keys['ArrowLeft'] && player2.x > 0 && !gameOver && !isColliding(player2, player1, 'left')) 
        player2.x -= player2.speed; // Use player-specific speed for movement
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width && !gameOver && !isColliding(player2, player1, 'right')) 
        player2.x += player2.speed; // Use player-specific speed for movement
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

// Function to draw each character player
function drawCharacter(player) {
    ctx.drawImage(player.image, player.x, player.y - player.height, player.width, player.height); // Tekent de afbeelding
}

// Function to apply gravity and manage the jumping arc for players
function applyGravity(player) {
    const groundLevel = 340; // Platform height
    if (player.jumping) {
        player.jumpProgress += 0.02; // Slowed down the jump progress increment for slower jumping
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
        const inRange = Math.abs(attacker.x - defender.x) <= attacker.attackRange;
        if (inRange && Math.abs(attacker.y - defender.y) < 50) {
            if (!defender.blocking) {
                defender.health -= attacker.damage;
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
// Function to determine if players are colliding to prevent walking through
// each other
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
        if (e.key === 'o') {
            player1.blocking = true;
        }
        if (e.key === '/') {
            player2.blocking = true;
        }
    }
});

// Event listener for keyup events
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === 'o') 
        player1.blocking = false;
    if (e.key === '/') 
        player2.blocking = false;
});
