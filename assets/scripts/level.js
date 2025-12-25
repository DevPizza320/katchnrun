function startChristmasGame() {

  /* ───────────────── Canvas ───────────────── */
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  addEventListener("resize", resize);
  resize();

  /* ───────────────── Assets ───────────────── */
  const bg = new Image();
  bg.src = "../assets/textures/background/christmas.png";

  const p1Img = new Image();
  p1Img.src = "../assets/textures/entity/player/frog_basket.png";

  const p2Img = new Image();
  p2Img.src = "../assets/textures/entity/player/green_stocking.png";

  const coalImg = new Image();
  coalImg.src = "../assets/textures/entity/enemy/coal.png";

  const grinchImg = new Image();
  grinchImg.src = "../assets/textures/entity/enemy/grinch.png";

  const caneImg = new Image();
  caneImg.src = "../assets/textures/entity/ally/candy_cane.png";

  /* ───────────────── State ───────────────── */
  const state = {
    mode: "menu", // menu | countdown | play | over
    countdown: 3,
    time: 60
  };

  /* ───────────────── Players ───────────────── */
  const players = [
    {
      img: p1Img,
      x: 0.3,
      lives: 5,
      score: 0,
      dir: 0
    },
    {
      img: p2Img,
      x: 0.6,
      lives: 5,
      score: 0,
      dir: 0
    }
  ];

  /* ───────────────── Objects ───────────────── */
  const enemies = [];
  const allies = [];
  const balls = [];
  const particles = [];

  /* ───────────────── Input ───────────────── */
  addEventListener("keydown", e => {
    if (state.mode === "menu" && e.key === "Enter") startCountdown();

    if (e.key === "ArrowLeft") players[0].dir = -1;
    if (e.key === "ArrowRight") players[0].dir = 1;
    if (e.key === "a") players[1].dir = -1;
    if (e.key === "d") players[1].dir = 1;
  });

  addEventListener("keyup", e => {
    if (["ArrowLeft", "ArrowRight"].includes(e.key)) players[0].dir = 0;
    if (["a", "d"].includes(e.key)) players[1].dir = 0;
  });

  /* ───────────────── Spawning ───────────────── */
  function spawnEnemy(img, damage, scoreLoss) {
    enemies.push({
      img,
      x: Math.random(),
      y: -0.1,
      size: 0.05,
      vy: 0.004,
      damage,
      scoreLoss
    });
  }

  function spawnAlly(img, scoreGain, lifeGain) {
    allies.push({
      img,
      x: Math.random(),
      y: -0.1,
      size: 0.05,
      vy: 0.003,
      scoreGain,
      lifeGain
    });
  }

  function spawnBall(color) {
    balls.push({
      x: Math.random(),
      y: -0.05,
      r: 10,
      vy: 0.005,
      color
    });
  }

  /* ───────────────── Particles ───────────────── */
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: Math.random() * 0.5 + 0.2
    });
  }

  /* ───────────────── Timers ───────────────── */
  function startCountdown() {
    state.mode = "countdown";
    const id = setInterval(() => {
      state.countdown--;
      if (state.countdown <= 0) {
        clearInterval(id);
        startGame();
      }
    }, 1000);
  }

  function startGame() {
    state.mode = "play";

    setInterval(() => spawnEnemy(coalImg, 1, 200), 1500);
    setInterval(() => spawnEnemy(grinchImg, 2, 500), 3000);
    setInterval(() => spawnAlly(caneImg, 500, 1), 2000);
    setInterval(() => spawnBall(Math.random() > 0.5 ? "red" : "green"), 400);

    setInterval(() => {
      state.time--;
      if (state.time <= 0) state.mode = "over";
    }, 1000);
  }

  /* ───────────────── Collision ───────────────── */
  function collide(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  /* ───────────────── Loop ───────────────── */
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Snow
    particles.forEach(p => {
      p.y += p.vy;
      if (p.y > canvas.height) p.y = 0;
      ctx.fillStyle = "white";
      ctx.fillRect(p.x, p.y, 2, 2);
    });

    if (state.mode === "menu") {
      drawCenter("Press ENTER to Start");
    }

    if (state.mode === "countdown") {
      drawCenter(state.countdown);
    }

    if (state.mode === "play") {
      updateGame();
      drawHUD();
    }

    if (state.mode === "over") {
      drawGameOver();
    }

    requestAnimationFrame(loop);
  }

  /* ───────────────── Update ───────────────── */
  function updateGame() {
    players.forEach(p => {
      p.x += p.dir * 0.01;
      p.x = Math.max(0, Math.min(1 - 0.08, p.x));
    });

    updateFalling(enemies);
    updateFalling(allies);

    balls.forEach((b, i) => {
      b.y += b.vy;
      players.forEach(p => {
        if (
          b.x * canvas.width > p.x * canvas.width &&
          b.x * canvas.width < (p.x + 0.08) * canvas.width &&
          b.y * canvas.height > canvas.height * 0.8
        ) {
          p.score += 100;
          balls.splice(i, 1);
        }
      });
    });
  }

  function updateFalling(arr) {
    arr.forEach((o, i) => {
      o.y += o.vy;
      players.forEach(p => {
        const hit =
          o.x < p.x + 0.08 &&
          o.x + o.size > p.x &&
          o.y < 0.9 &&
          o.y + o.size > 0.8;

        if (hit) {
          if (o.damage) {
            p.lives -= o.damage;
            p.score -= o.scoreLoss;
          }
          if (o.lifeGain) {
            p.lives += o.lifeGain;
            p.score += o.scoreGain;
          }
          arr.splice(i, 1);
        }
      });
    });
  }

  /* ───────────────── Drawing ───────────────── */
  function drawHUD() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`P1 ❤️ ${players[0].lives} | ${players[0].score}`, 20, 30);
    ctx.fillText(`P2 ❤️ ${players[1].lives} | ${players[1].score}`, 20, 60);
    ctx.fillText(`⏱ ${state.time}`, canvas.width - 80, 30);
  }

  function drawCenter(text) {
    ctx.fillStyle = "red";
    ctx.font = "48px Arial Black";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
  }

  function drawGameOver() {
    drawCenter("GAME OVER");
    const winner =
      players[0].score === players[1].score
        ? "DRAW"
        : players[0].score > players[1].score
        ? "PLAYER 1 WINS"
        : "PLAYER 2 WINS";

    ctx.font = "32px Arial Black";
    ctx.fillText(winner, canvas.width / 2, canvas.height / 2 + 60);
  }

  loop();
}