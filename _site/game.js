(() => {
  const dialog = document.querySelector("#runner-dialog");
  const launcher = document.querySelector(".game-launcher");
  const closeButton = document.querySelector(".runner-close");
  const startButton = document.querySelector(".runner-start");
  const jumpButton = document.querySelector(".runner-jump");
  const canvas = document.querySelector("#runner-canvas");
  const scoreOutput = document.querySelector("#runner-score");
  const bestOutput = document.querySelector("#runner-best");
  const status = document.querySelector("#runner-status");

  if (
    !(dialog instanceof HTMLDialogElement) ||
    !(launcher instanceof HTMLButtonElement) ||
    !(closeButton instanceof HTMLButtonElement) ||
    !(startButton instanceof HTMLButtonElement) ||
    !(jumpButton instanceof HTMLButtonElement) ||
    !(canvas instanceof HTMLCanvasElement) ||
    !(scoreOutput instanceof HTMLOutputElement) ||
    !(bestOutput instanceof HTMLOutputElement) ||
    !(status instanceof HTMLElement)
  ) {
    console.error("The runner game could not initialize because required page elements are missing.");
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    status.textContent = "This browser could not start the game.";
    startButton.disabled = true;
    jumpButton.disabled = true;
    console.error("The runner game requires a 2D canvas context.");
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const floor = 127;
  const player = { x: 42, y: floor - 22, width: 16, height: 22, velocityY: 0 };
  const obstacles = [];
  let animationFrame = 0;
  let previousTime = 0;
  let spawnTimer = 0;
  let score = 0;
  let best = 0;
  let speed = 175;
  let running = false;
  let gameOver = false;
  let storageAvailable = true;

  try {
    best = Number.parseInt(localStorage.getItem("gem-runner-best") || "0", 10) || 0;
  } catch (error) {
    storageAvailable = false;
    console.warn("The runner game could not read the saved best score.", error);
  }
  bestOutput.value = String(best);

  function draw() {
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#0a0a0a";
    const muted = getComputedStyle(document.documentElement).getPropertyValue("--gray-400").trim() || "#a3a3a3";
    const background = getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#ffffff";

    context.clearRect(0, 0, width, height);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.fillStyle = muted;
    for (let i = 0; i < 28; i += 1) {
      const dotX = (i * 47 + 13) % width;
      const dotY = 15 + ((i * 23) % 65);
      context.fillRect(dotX, dotY, 1, 1);
    }

    context.strokeStyle = muted;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, floor + 0.5);
    context.lineTo(width, floor + 0.5);
    context.stroke();

    context.fillStyle = ink;
    context.fillRect(player.x, player.y, player.width, player.height);
    context.clearRect(player.x + 4, player.y + 5, 2, 2);
    context.fillRect(player.x + 11, player.y + 5, 2, 2);
    context.fillRect(player.x + 6, player.y + 14, 4, 2);
    context.fillRect(player.x - 3, player.y + player.height - 2, 7, 3);
    context.fillRect(player.x + 12, player.y + player.height - 2, 7, 3);

    context.fillStyle = ink;
    for (const obstacle of obstacles) {
      context.fillRect(obstacle.x, floor - obstacle.height, obstacle.width, obstacle.height);
      context.clearRect(obstacle.x + 3, floor - obstacle.height + 4, 2, 2);
    }

    if (!running && !gameOver) {
      context.fillStyle = muted;
      context.font = '10px "Geist Mono", monospace';
      context.textAlign = "center";
      context.fillText("READY WHEN YOU ARE", width / 2, 35);
    }

    if (gameOver) {
      context.fillStyle = background;
      context.fillRect(width / 2 - 73, 42, 146, 29);
      context.strokeStyle = muted;
      context.strokeRect(width / 2 - 73.5, 42.5, 146, 29);
      context.fillStyle = ink;
      context.font = '11px "Geist Mono", monospace';
      context.textAlign = "center";
      context.fillText("RUN ENDED", width / 2, 61);
    }
  }

  function jump() {
    if (!running) return;
    if (player.y >= floor - player.height - 0.5) {
      player.velocityY = -390;
    }
  }

  function finishRun() {
    running = false;
    gameOver = true;
    score = Math.floor(score);
    scoreOutput.value = String(score);
    startButton.textContent = "Run again";
    jumpButton.disabled = true;
    status.textContent = `Run over. You scored ${score}. Start another run to play again.`;

    if (score > best) {
      best = Math.floor(score);
      bestOutput.value = String(best);
      if (storageAvailable) {
        try {
          localStorage.setItem("gem-runner-best", String(best));
        } catch (error) {
          storageAvailable = false;
          status.textContent += " This browser could not save your best score.";
          console.warn("The runner game could not save the best score.", error);
        }
      }
    }
  }

  function tick(time) {
    if (!running) return;
    const delta = Math.min((time - previousTime) / 1000, 0.04);
    previousTime = time;
    score += delta * 12;
    speed = Math.min(175 + score * 1.4, 360);
    scoreOutput.value = String(Math.floor(score));

    player.velocityY += 1050 * delta;
    player.y = Math.min(player.y + player.velocityY * delta, floor - player.height);
    if (player.y >= floor - player.height) player.velocityY = 0;

    spawnTimer -= delta;
    if (spawnTimer <= 0) {
      const obstacleHeight = 17 + Math.floor(Math.random() * 18);
      obstacles.push({
        x: width + 8,
        width: 12 + Math.floor(Math.random() * 8),
        height: obstacleHeight
      });
      spawnTimer = 0.95 + Math.random() * 0.7;
    }

    for (const obstacle of obstacles) obstacle.x -= speed * delta;
    while (obstacles.length && obstacles[0].x + obstacles[0].width < 0) obstacles.shift();

    const playerTop = player.y + 2;
    const playerBottom = player.y + player.height;
    for (const obstacle of obstacles) {
      const obstacleTop = floor - obstacle.height;
      if (
        player.x + player.width - 2 > obstacle.x &&
        player.x + 2 < obstacle.x + obstacle.width &&
        playerBottom > obstacleTop &&
        playerTop < floor
      ) {
        finishRun();
        break;
      }
    }

    draw();
    if (running) animationFrame = requestAnimationFrame(tick);
  }

  function startRun() {
    cancelAnimationFrame(animationFrame);
    obstacles.length = 0;
    player.y = floor - player.height;
    player.velocityY = 0;
    score = 0;
    speed = 175;
    spawnTimer = 1.1;
    previousTime = performance.now();
    running = true;
    gameOver = false;
    scoreOutput.value = "0";
    startButton.textContent = "Restart";
    jumpButton.disabled = false;
    status.textContent = "Game in progress. Press Space or Up Arrow to jump.";
    animationFrame = requestAnimationFrame(tick);
  }

  function stopRun() {
    running = false;
    cancelAnimationFrame(animationFrame);
    draw();
  }

  launcher.addEventListener("click", () => {
    if (!dialog.open) dialog.showModal();
  });

  closeButton.addEventListener("click", () => dialog.close());
  startButton.addEventListener("click", startRun);
  jumpButton.addEventListener("click", jump);
  canvas.addEventListener("pointerdown", jump);

  dialog.addEventListener("close", () => {
    stopRun();
    launcher.focus();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener("keydown", (event) => {
    if (!dialog.open || !["Space", "ArrowUp"].includes(event.code)) return;
    if (event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    jump();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) {
      stopRun();
      startButton.textContent = "Resume run";
      jumpButton.disabled = true;
      status.textContent = "Run stopped while the page was hidden. Start a fresh run to play again.";
    }
  });

  draw();
})();
