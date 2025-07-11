// Game variables
let player, bullets = [], enemies = [], bg, bg2;
let score = 0, level = 1, startTime;
let enemyImages = [], rocketImg;
let health = 3; // Player health (3 hearts)
let shootSound; // Variable for bullet sound

// Load assets before game starts
function preload() {
    bg = loadImage("images/canvas.webp"); // Background image for level 1
    bg2 = loadImage("images/canvas2.webp"); // Background image for level 2
    rocketImg = loadImage("images/rocket.png"); // Rocket image

    // Load enemy images
    for (let i = 1; i <= 5; i++) {
        enemyImages.push(loadImage(`images/enemy${i}.png`));
    }

    // Load bullet sound
    shootSound = loadSound("sounds/bulletsound.mp3"); // Add your bullet sound file here
}

// Setup the game environment
function setup() {
    createCanvas(windowWidth, windowHeight); // Fullscreen canvas
    player = new Player(); // Create player object
    startTime = millis(); // Start timer for level tracking
}

// Main game loop
function draw() {
    // Switch background based on level
    if (level === 1) {
        background(bg); // Display level 1 background
    } else if (level === 2) {
        background(bg2); // Display level 2 background
    }

    player.show();
    player.move();

    handleBullets();
    handleEnemies();
    checkCollisions();

    displayScore();
    checkLevelProgress();
    displayHealth();
}

// Player class (rocket spaceship)
class Player {
    constructor() {
        this.x = width / 2; // Start in the middle
        this.y = height - 80; // Place near bottom
        this.width = 50;
        this.height = 50;
    }

    show() {
        image(rocketImg, this.x, this.y, this.width, this.height); // Draw rocket image
    }

    move() {
        if (keyIsDown(LEFT_ARROW) && this.x > 0) this.x -= 5;
        if (keyIsDown(RIGHT_ARROW) && this.x < width - this.width) this.x += 5;
    }
}

// Bullet class (fired from player)
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
        this.speed = 7;
    }

    show() {
        fill("red");
        rect(this.x, this.y, this.width, this.height); // Bullets are red rectangles
    }

    move() {
        this.y -= this.speed;
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.x = random(50, width - 50);
        this.y = -50;
        this.width = 50;
        this.height = 50;
        this.speed = level === 1 ? 2 : 4; // Faster in level 2
        this.type = floor(random(0, 5)); // Random enemy type (0-4)
        this.scoreValue = (this.type + 1) * 10; // Points based on type
    }

    show() {
        image(enemyImages[this.type], this.x, this.y, this.width, this.height); // Display enemy image
    }

    move() {
        this.y += this.speed;
    }
}

// Handle bullets
function handleBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].move();
        bullets[i].show();

        if (bullets[i].y < 0) {
            bullets.splice(i, 1); // Remove bullets that go off screen
        }
    }
}

// Enemy spawning and movement
let lastEnemySpawn = 0;
const enemySpawnDelay = 1000; // 1 second between spawns

function handleEnemies() {
    if (millis() - lastEnemySpawn > enemySpawnDelay) {
        enemies.push(new Enemy());
        lastEnemySpawn = millis();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
        enemies[i].show();

        if (enemies[i].y > height) {
            enemies.splice(i, 1); // Remove enemies that go off screen
        }
    }
}

// Collision detection between bullets and enemies
function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (collideRectRect(
                bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height,
                enemies[j].x, enemies[j].y, enemies[j].width, enemies[j].height)) 
            {
                score += enemies[j].scoreValue; // Increase score
                bullets.splice(i, 1); // Remove bullet
                enemies.splice(j, 1); // Remove enemy
                break; // Prevent out-of-bounds error
            }
        }
    }

    // Check if enemy hits player (collides with rocket)
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (collideRectRect(
            player.x, player.y, player.width, player.height,
            enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height)) 
        {
            health -= 1; // Decrease health on collision
            enemies.splice(i, 1); // Remove enemy
            if (health <= 0) {
                gameOver(); // Game over if health reaches 0
            }
            break; // Prevent multiple hits
        }
    }
}

// Function for shooting bullets
let lastShot = 0;
const shotDelay = 300; // 0.3 seconds between shots

function keyPressed() {
    if (keyCode === 32) { // Spacebar to shoot
        if (millis() - lastShot > shotDelay) {
            bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y));
            lastShot = millis();
            shootSound.play(); // Play bullet sound
        }
    }
}

// Display score and level
function displayScore() {
    fill("white");
    textSize(24);
    text(`Score: ${score}`, 20, 30);
    text(`Level: ${level}`, 20, 60);
}

// Display health (hearts)
function displayHealth() {
    fill("white");
    textSize(24);
    for (let i = 0; i < health; i++) {
        text("❤️", 20 + i * 30, 90); // Draw hearts for health
    }
}

// Level progression system
function checkLevelProgress() {
    let elapsedTime = (millis() - startTime) / 1000;

    if (level === 1 && score >= 300) {
        if (elapsedTime < 10) alert("🌟🌟🌟 3 Stars! Level 2 Starts");
        else if (elapsedTime < 20) alert("🌟🌟 2 Stars! Level 2 Starts");
        else if (elapsedTime < 30) alert("🌟 1 Star! Level 2 Starts");
        else alert("💀 Game Over!");

        level = 2;
        score = 0;
        startTime = millis();
    }

    // Check if player failed to reach 300 points within 30 seconds
    if (level === 1 && elapsedTime >= 30 && score < 300) {
        alert("💀 Game Over!");
        level = 2; // Switch to game over state or reset game
    }
}

// Game over function
function gameOver() {
    alert("💀 Game Over!");
    noLoop(); // Stop the game loop
}

// Basic collision detection function
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}