import * as utils from "../../assets/scripts/utils/utils.js";
import { ConfirmationPopup } from "../../assets/scripts/classes/gui/popups.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.style.display = "none";
const popup = new ConfirmationPopup({
  size: 50,
  icon: "../assets/textures/gui/warning.png",
  warning: "Warning!",
  message:
    "Continue to level?"
});

popup.onAccept(() => {
  utils.toggleFullscreen();
  popup.remove();
  canvas.style.display = "block";
});

popup.onDecline(() => {
  window.location.href.replace("../index.html");
});

popup.show();

// Resize canvas on window resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initialize on page load

// Game Variables
const gameState = { current: "menu", countdown: 5, time: 180 };
let timerInterval;
let countdownInterval;

// Global effect flags
let playerSlowed = false;
let playersFast = false;

// Players Configuration
let players = [];

// Assets
const backgroundMusic = new Audio("Media/Equinoxe.mp3");
const damageSound = new Audio("Media/SFX/DamageSound.mp3");
const cashSound = new Audio("Media/SFX/Cash.mp3");
const slowSound = new Audio("Media/SFX/SlowSound.mp3");
const morePointsSound = new Audio("Media/SFX/MorePoints.mp3");
const loseLifeSound = new Audio("Media/SFX/LoseLife.mp3");
const stealSound = new Audio("Media/SFX/StealSound.mp3");
const speedBoostSound = new Audio("Media/SFX/SpeedBoost.mp3");
backgroundMusic.loop = true;
const basketImg = new Image();
const basket2Img = new Image();
const candyCaneImg = new Image();
const coalImg = new Image();
const grinchImg = new Image();
const goblinImg = new Image();

// Objects
const stars = [];
const redBalls = [];
const greenBalls = [];
const candyCanes = [];
const coals = [];
const grinches = [];
const goblins = [];

// Initialize game objects
function initializeGameObjects() {
  console.log("Initializing game objects...");
  players = [
    {
      x: canvas.width / 4 - canvas.width * 0.05,
      y: canvas.height - canvas.height * 0.10,
      width: canvas.width * 0.05,
      height: canvas.width * 0.05,
      img: basketImg,
      score: 0,
      lives: 6,
      speed: canvas.width * 0.008,
      caughtBalls: 0
    },
    {
      x: 3 * canvas.width / 4 - canvas.width * 0.05,
      y: canvas.height - canvas.height * 0.10,
      width: canvas.width * 0.05,
      height: canvas.width * 0.05,
      img: basket2Img,
      score: 0,
      lives: 6,
      speed: canvas.width * 0.008,
      caughtBalls: 0
    }
  ];

  stars.length = 0;
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 0.5 + 0.2
    });
  }
}

// Event Listeners
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") players[0].direction = "left";
  if (e.key === "ArrowRight") players[0].direction = "right";
  if (e.key === "a") players[1].direction = "left";
  if (e.key === "d") players[1].direction = "right";
  if (e.key === "Enter" && gameState.current === "menu") startCountdown();
});
document.addEventListener("keyup", (e) => {
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) players[0].direction = null;
  if (["a", "d"].includes(e.key)) players[1].direction = null;
});

// Rendering Functions
function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Text Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // Shadow color
  ctx.shadowBlur = 3; // Blur intensity
  ctx.shadowOffsetX = 4; // Horizontal shadow offset
  ctx.shadowOffsetY = 4; // Vertical shadow offset

  ctx.fillStyle = "red";
  ctx.font = `${canvas.height / 10}px Arial Black`;
  const startText = "Press ENTER to Start";
  const textWidth = ctx.measureText(startText).width;

  // Fill text with shadow
  ctx.fillText(startText, canvas.width / 2 - textWidth / 2, canvas.height / 2);

  // Text Border (Stroke)
  ctx.lineWidth = 2; // Border thickness
  ctx.strokeStyle = "white"; // Border color
  ctx.strokeText(startText, canvas.width / 2 - textWidth / 2, canvas.height / 2);

  // Reset shadow for future drawings
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}


function drawCountdown() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Text Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = "red";
  ctx.font = `${canvas.height / 10}px 'Arial Black'`;
  const countdownText = `Starting in ${gameState.countdown}...`;
  const textWidth = ctx.measureText(countdownText).width;

  // Draw filled text
  ctx.fillText(countdownText, canvas.width / 2 - textWidth / 2, canvas.height / 2);

  // Draw stroke text
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "white";
  ctx.strokeText(countdownText, canvas.width / 2 - textWidth / 2, canvas.height / 2);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}


function drawUI() {
  // Text Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 1;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = "red";
  ctx.font = `${canvas.height / 30}px Arial Black`;

  ctx.fillText(`P1 Lives: ${players[0].lives} | Score: ${players[0].score}`, 20, 30);
  ctx.strokeText(`P1 Lives: ${players[0].lives} | Score: ${players[0].score}`, 20, 30);

  ctx.fillText(`P2 Lives: ${players[1].lives} | Score: ${players[1].score}`, 20, 60);
  ctx.strokeText(`P2 Lives: ${players[1].lives} | Score: ${players[1].score}`, 20, 60);

  ctx.fillText(`Time: ${gameState.time}s`, canvas.width - 150, 30);
  ctx.strokeText(`Time: ${gameState.time}s`, canvas.width - 150, 30);


  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Text Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = "red";
  ctx.font = `${canvas.height / 20}px 'Arial Black'`;
  const gameOverText = "Game Over!";
  const gameOverTextWidth = ctx.measureText(gameOverText).width;

  // Draw Game Over text
  ctx.fillText(gameOverText, canvas.width / 2 - gameOverTextWidth / 2, canvas.height / 2 - 50);
  ctx.strokeStyle = "white";
  ctx.strokeText(gameOverText, canvas.width / 2 - gameOverTextWidth / 2, canvas.height / 2 - 50);

  // Determine winner/loser based on lives and scores
  let winnerIndex = -1;
  let loserIndex = -1;

  // Check if any player lost all lives
  players.forEach((player, index) => {
    if (player.lives <= 0) {
      loserIndex = index;
    }
  });

  // If no one lost all lives, determine based on scores
  if (loserIndex === -1 && gameState.time <= 0) {
    const highestScore = Math.max(...players.map(player => player.score));
    winnerIndex = players.findIndex(player => player.score === highestScore);
  }

  // Draw player scores, images, and outcome texts
  players.forEach((player, index) => {
    const playerXPos = canvas.width / 2 - 200 + index * 300;
    ctx.drawImage(player.img, playerXPos, canvas.height / 2, player.width, player.height);

    const playerScoreText = `Score: ${player.score}`;
    const playerScoreTextWidth = ctx.measureText(playerScoreText).width;

    // Draw player score
    ctx.fillText(playerScoreText, playerXPos + (player.width / 2) - (playerScoreTextWidth / 2), canvas.height / 2 + 100);
    ctx.strokeText(playerScoreText, playerXPos + (player.width / 2) - (playerScoreTextWidth / 2), canvas.height / 2 + 100);

    // Determine outcome text
    let outcomeText = "";
    if (loserIndex !== -1) {
      outcomeText = index === loserIndex ? "Loser" : "Winner";
    } else if (winnerIndex !== -1) {
      outcomeText = index === winnerIndex ? "Winner" : "Loser";
    }

    // Draw outcome text below the score
    const outcomeTextWidth = ctx.measureText(outcomeText).width;
    ctx.fillStyle = outcomeText === "Winner" ? "red" : "red"; // Green for winner, red for loser
    ctx.font = `${canvas.height / 25}px 'Arial Black'`;
    ctx.fillText(outcomeText, playerXPos + (player.width / 2) - (outcomeTextWidth / 2), canvas.height / 2 + 150);
    ctx.strokeText(outcomeText, playerXPos + (player.width / 2) - (outcomeTextWidth / 2), canvas.height / 2 + 150);

    // Draw player lives below outcome
    const liveText = `Lives: ${player.lives}`;
    const liveTextWidth = ctx.measureText(liveText).width;
    ctx.fillStyle = "red";
    ctx.font = `${canvas.height / 25}px 'Arial Black'`;

    ctx.fillText(liveText, playerXPos + (player.width / 2) - (liveTextWidth / 2), canvas.height / 2 + 200);
    ctx.strokeText(liveText, playerXPos + (player.width / 2) - (liveTextWidth / 2), canvas.height / 2 + 200);

    // Draw timer below lives
    const timerText = `Timer: ${gameState.time}`;
    const timerTextWidth = ctx.measureText(timerText).width;
    ctx.fillStyle = "green";
    ctx.font = `${canvas.height / 25}px 'Arial Black'`;

    ctx.fillText(timerText, (canvas.width / 2) - (timerTextWidth / 2), canvas.height / 2 + 250);
    ctx.strokeText(timerText, (canvas.width / 2) - (timerTextWidth / 2), canvas.height / 2 + 250);
  });

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  setTimeout(() => {
    window.location.replace("../index.html");
  }, 10000);
}

// Movement Functions
function moveStars() {
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) star.y = 0;
  });
}

function moveObjects(objects) {
  objects.forEach((obj, index) => {
    obj.y += obj.speed;
    if (obj.y > canvas.height) objects.splice(index, 1);
  });
}

function movePlayers() {
  players.forEach(player => {
    if (player.direction === "left" && player.x > 0) player.x -= player.speed;
    if (player.direction === "right" && player.x < canvas.width - player.width) player.x += player.speed;
  });
}

// Collision Detection
function checkCollisions() {
  const ballsToRemove = { red: [], green: [] };
  const coalsToRemove = [];
  const candyCanesToRemove = [];
  const grinchesToRemove = [];
  const goblinsToRemove = [];

  // Check collisions for red balls
  redBalls.forEach((ball, ballIndex) => {
    players.forEach((player, playerIndex) => {
      const ballRight = ball.x + ball.radius;
      const ballBottom = ball.y + ball.radius;
      const playerRight = player.x + player.width;
      const playerBottom = player.y + player.height;

      if (ballRight > player.x && ball.x - ball.radius < playerRight &&
        ballBottom > player.y && ball.y - ball.radius < playerBottom) {
        players[playerIndex].score += 100;
        players[playerIndex].caughtBalls++;
        if (players[playerIndex].caughtBalls >= 50) {
          players[playerIndex].lives++;
          players[playerIndex].caughtBalls = 0;
        }
        ballsToRemove.red.push(ballIndex);
      }
    });
  });

  // Check collisions for green balls
  greenBalls.forEach((ball, ballIndex) => {
    players.forEach((player, playerIndex) => {
      const ballRight = ball.x + ball.radius;
      const ballBottom = ball.y + ball.radius;
      const playerRight = player.x + player.width;
      const playerBottom = player.y + player.height;

      if (ballRight > player.x && ball.x - ball.radius < playerRight &&
        ballBottom > player.y && ball.y - ball.radius < playerBottom) {
        players[playerIndex].score += 100;
        players[playerIndex].caughtBalls++;
        if (players[playerIndex].caughtBalls >= 35) {
          players[playerIndex].lives++;
          players[playerIndex].caughtBalls = 0;
        }
        ballsToRemove.green.push(ballIndex);
      }
    });
  });

  // Check collisions for coals
  coals.forEach((coal, coalIndex) => {
    players.forEach((player, playerIndex) => {
      const coalRight = coal.x + coal.width;
      const coalBottom = coal.y + coal.height;
      const playerRight = player.x + player.width;
      const playerBottom = player.y + player.height;

      if (coalRight > player.x && coal.x < playerRight &&
        coalBottom > player.y && coal.y < playerBottom) {
        players[playerIndex].lives -= 2;
        coalsToRemove.push(coalIndex);
        damageSound.play();
        console.log(`Player ${playerIndex + 1} caught a coal!`);
        if (players[playerIndex].lives <= 0) {
          gameState.current = "gameover";
        }
      }
    });
  });

  // Check collisions for candy canes
  candyCanes.forEach((candyCane, candyCaneIndex) => {
    players.forEach((player, playerIndex) => {
      const candyCaneRight = candyCane.x + candyCane.width;
      const candyCaneBottom = candyCane.y + candyCane.height;
      const playerRight = player.x + player.width;
      const playerBottom = player.y + player.height;

      if (candyCaneRight > player.x && candyCane.x < playerRight &&
        candyCaneBottom > player.y && candyCane.y < playerBottom) {
        players[playerIndex].score += 2000; // Adding score for candy cane
        players[playerIndex].lives++; // Adds a life
        candyCanesToRemove.push(candyCaneIndex); // Mark the candy cane for removal
      }
    });
  });

  // Check collisions for grinches
  grinches.forEach((grinch, grinchIndex) => {
    players.forEach((player, playerIndex) => {
      const grinchRight = grinch.x + grinch.width;
      const grinchBottom = grinch.y + grinch.height;
      const playerRight = player.x + player.width;
      const playerBottom = player.y + player.height;

      if (grinchRight > player.x && grinch.x < playerRight &&
        grinchBottom > player.y && grinch.y < playerBottom) {
        players[playerIndex].score -= 5000;
        players[playerIndex].lives -= 3; // Grinches take away 3 lives
        grinchesToRemove.push(grinchIndex); // Mark the grinch for removal
        damageSound.play();
        if (players[playerIndex].lives <= 0) {
          gameState.current = "gameover";
        }
      }
    });
  });

  // Track collision cooldowns to avoid multiple effects for the same collision
  const collisionCooldowns = [];

  // Update collision detection for goblins
  goblins.forEach((goblin, goblinIndex) => {
    players.forEach((player, playerIndex) => {
      const goblinRight = goblin.x + goblin.width;
      const goblinBottom = goblin.y + goblin.height;
      const playerRight = player.x + player.width;
      const playerBottom = player.y + player.height;

      // Check if the goblin collides with the player
      if (goblinRight > player.x && goblin.x < playerRight &&
        goblinBottom > player.y && goblin.y < playerBottom) {

        // Check if there's already a collision effect running for this player and goblin
        if (collisionCooldowns[goblinIndex] && collisionCooldowns[goblinIndex][playerIndex]) {
          return; // Skip this collision if it's within the cooldown
        }

        // Set a cooldown for this player and goblin
        if (!collisionCooldowns[goblinIndex]) {
          collisionCooldowns[goblinIndex] = [];
        }
        collisionCooldowns[goblinIndex][playerIndex] = true;

        console.log(`Collision detected between Goblin ${goblinIndex} and Player ${playerIndex}`);

        // Randomize the effect for the colliding player
        const randomEffect = Math.random();

        if (randomEffect < 0.2) {
          const bonusPoints = 5000;
          players[playerIndex].score += bonusPoints; // Case 1: Adds 5000 points
          morePointsSound.play();
          console.log(`Player ${playerIndex + 1} gains ${bonusPoints} points!`);
        } else if (randomEffect < 0.4) {
          player.lives -= 4; // Case 2: takes away 4 lives
          damageSound.play();
          console.log(`Player ${playerIndex + 1} loses 2 lives!`);
          if (player.lives <= 0) {
            gameState.current = "gameover";
          }
        } else if (randomEffect < 0.6) {
          player.lives += 3; // Case 3: adds 3 lives
          cashSound.play();
          console.log(`Player ${playerIndex + 1} gains three lives!`);
        } else if (randomEffect < 0.8) {
          playerSlowed = true;
          players[playerIndex].speed = 1;
          setTimeout(() => {
            playerSlowed = false;
            players[playerIndex].speed = 8; // Reset speed after the effect ends
          }, 10000); // 10 seconds duration
          slowSound.play();
          console.log(`Player ${playerIndex + 1} is slowed for 10s!`);
        } else if (randomEffect < 0.9) {
          const targetPlayer = players[(playerIndex + 1) % players.length];
          const pointsToSteal = 5000;
          players[playerIndex].score += pointsToSteal;
          stealSound.play();
          targetPlayer.score -= pointsToSteal;
          console.log(`Player ${playerIndex + 1} steals ${pointsToSteal} points from Player ${((playerIndex + 1) % 2) + 1}`);
        } else if (randomEffect < 1) {
          playersFast = true;
          players[playerIndex].speed = 22;
          setTimeout(() => {
            playersFast = false;
            players[playerIndex].speed = 8; // Resets speed
          }, 8000); // 8 seconds duration
          speedBoostSound.play();
          console.log(`Player ${playerIndex + 1} is fast for 8s!`);
        }

        // Remove the goblin after collision (or mark it as inactive)
        goblins.splice(goblinIndex, 1);  // This removes the goblin from the array

        // Set cooldown for the collision (adjust the time as needed)
        setTimeout(() => {
          collisionCooldowns[goblinIndex][playerIndex] = false; // Reset the cooldown
        }, 1000); // Cooldown period (1 second)
      }
    });
  });


  // Remove all marked objects in one go (after checking all collisions)
  ballsToRemove.red.reverse().forEach(ballIndex => redBalls.splice(ballIndex, 1));
  ballsToRemove.green.reverse().forEach(ballIndex => greenBalls.splice(ballIndex, 1));
  coalsToRemove.reverse().forEach(coalIndex => coals.splice(coalIndex, 1));
  candyCanesToRemove.reverse().forEach(candyCaneIndex => candyCanes.splice(candyCaneIndex, 1));
  grinchesToRemove.reverse().forEach(grinchIndex => grinches.splice(grinchIndex, 1));
  goblinsToRemove.reverse().forEach(goblinIndex => goblins.splice(goblinIndex, 1));
}


// Spawn Functions
function spawnRedBall() {
  redBalls.push({
    x: Math.random() * canvas.width,
    y: 0,
    radius: 10,
    speed: Math.random() * 1 + 0.2,
    color: "red"
  });
}

function spawnGreenBall() {
  greenBalls.push({
    x: Math.random() * canvas.width,
    y: 0,
    radius: 10,
    speed: Math.random() * 1 + 0.2,
    color: "green"
  });
}

function spawnCoals() {
  coals.push({
    x: Math.random() * canvas.width,
    y: 0,
    width: canvas.width * 0.03,
    height: canvas.height * 0.05,
    speed: Math.random() * 1 + 0.2,
    img: coalImg
  })
}

function spawnCandyCane() {
  candyCanes.push({
    x: Math.random() * canvas.width,
    y: 0,
    width: canvas.width * 0.03,
    height: canvas.height * 0.05,
    speed: Math.random() * 1 + 0.2,
    img: candyCaneImg
  });
}

function spawnGrinch() {
  grinches.push({
    x: Math.random() * canvas.width,
    y: 0,
    width: canvas.width * 0.06,
    height: canvas.height * 0.08,
    speed: Math.random() * 4 + 2,
    img: grinchImg
  })
}

function spawnGoblin() {
  goblins.push({
    x: Math.random() * canvas.width,
    y: 0,
    width: canvas.width * 0.07,
    height: canvas.height * 0.1,
    speed: Math.random() * 0.5 + 0.2,
    img: goblinImg
  })
}

// Main Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState.current === "menu") drawMenu();
  if (gameState.current === "countdown") drawCountdown();
  if (gameState.current === "playing") {
    moveStars();
    moveObjects(redBalls);
    moveObjects(greenBalls);
    moveObjects(candyCanes);
    moveObjects(coals);
    moveObjects(grinches);
    moveObjects(goblins);
    movePlayers();

    // Draw objects
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    });

    players.forEach(player => {
      ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
    });

    redBalls.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    });

    greenBalls.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "green";
      ctx.fill();
    });

    candyCanes.forEach(candyCane => {
      ctx.drawImage(candyCaneImg, candyCane.x, candyCane.y, candyCane.width, candyCane.height);
    });

    coals.forEach(coal => {
      ctx.drawImage(coalImg, coal.x, coal.y, coal.width, coal.height);
    })

    grinches.forEach(grinch => {
      ctx.drawImage(grinchImg, grinch.x, grinch.y, grinch.width, grinch.height);
    })

    goblins.forEach(goblin => {
      ctx.drawImage(goblinImg, goblin.x, goblin.y, goblin.width, goblin.height);
    })

    // Check collisions
    checkCollisions();

    drawUI();
  }

  if (gameState.current === "gameover") drawGameOver();

  requestAnimationFrame(gameLoop);
}

// Start the countdown
function startCountdown() {
  backgroundMusic.play();
  gameState.current = "countdown";
  countdownInterval = setInterval(() => {
    if (gameState.countdown > 0) {
      gameState.countdown--;
    } else {
      clearInterval(countdownInterval);
      gameState.current = "playing";  // Change state to playing
      startGame();  // Start the game logic (initialize objects, spawn items, etc.)
    }
  }, 1000);
}

// Start the game after countdown ends
function startGame() {
  // Initialize game objects (players, etc.)
  initializeGameObjects();

  // Start spawning objects (balls, candy canes, etc.)
  setInterval(spawnRedBall, 100); // Spawn a red ball
  setInterval(spawnGreenBall, 100); // Spawn a green ball
  setInterval(spawnCandyCane, 2000); // Spawn a candy cane every 3 seconds
  setInterval(spawnCoals, 1500); // Spawn a coal every 2 seconds
  setInterval(spawnGrinch, 2500); // Spawn a grinch every 7.5 seconds
  setInterval(spawnGoblin, 6000); // Spawns a goblin every 10 seconds

  // Start the timer
  timerInterval = setInterval(() => {
    if (gameState.time > 0) {
      gameState.time--;
    } else {
      clearInterval(timerInterval);
      gameState.current = "gameover";  // End the game
    }
  }, 1000);
  backgroundMusic.play();
}
console.log("Time: ", gameState.time);

// Initialize Images
basketImg.src = "../assets/textures/entity/player/red_stocking.png";
basket2Img.src = "../assets/textures/entity/player/green_stocking.png";
candyCaneImg.src = "../assets/textures/entity/candy_cane.png";
coalImg.src = "../assets/textures/entity/coal.png";
grinchImg.src = "../assets/textures/entity/grinch.png";
goblinImg.src = "../assets/textures/entity/goblin.png";

// Start Game Loop
gameLoop();