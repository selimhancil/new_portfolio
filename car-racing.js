/* ==========================================
   CAR RACING GAME - Profesyonel Sürüm
   ========================================== */
let carGameRAF = null;

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('carRacingHighScore');
  if (el) el.textContent = localStorage.getItem('carRacingHighScore') || '0';
});

function startCarRacing() {
  const overlay = document.getElementById('carRacingOverlay');
  if (overlay) overlay.style.display = 'none';

  const canvas = document.getElementById('carRacingCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const roadWidth = w * 0.55;
  const roadLeft = (w - roadWidth) / 2;
  const laneWidth = roadWidth / 3;
  const playerWidth = 44;
  const playerHeight = 72;

  let state = 'countdown';
  let countdown = 3;
  let countdownTimer = 0;

  let playerX = roadLeft + laneWidth / 2 - playerWidth / 2;
  let targetX = playerX;
  let roadOffset = 0;
  let obstacles = [];
  let particles = [];
  let score = 0;
  let lives = 3;
  let speed = 5;
  let baseSpeed = 5;
  let lastObstacle = 0;
  let lastPowerUp = 0;
  let invincibleUntil = 0;
  let highScore = parseInt(localStorage.getItem('carRacingHighScore') || '0');
  const highScoreEl = document.getElementById('carRacingHighScore');
  if (highScoreEl) highScoreEl.textContent = highScore;

  const obstacleTypes = [
    { w: 38, h: 65, color: '#ef4444', type: 'car' },
    { w: 42, h: 90, color: '#dc2626', type: 'truck' },
    { w: 28, h: 55, color: '#f97316', type: 'bike' }
  ];

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      e.preventDefault();
      const lane = Math.max(0, Math.min(2, Math.floor((targetX - roadLeft + laneWidth/2) / laneWidth)));
      targetX = roadLeft + Math.max(0, lane - 1) * laneWidth + laneWidth / 2 - playerWidth / 2;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
      e.preventDefault();
      const lane = Math.max(0, Math.min(2, Math.floor((targetX - roadLeft + laneWidth/2) / laneWidth)));
      targetX = roadLeft + Math.min(2, lane + 1) * laneWidth + laneWidth / 2 - playerWidth / 2;
    }
  });

  if ('ontouchstart' in window) {
    let touchStartX = 0;
    canvas.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const dx = e.touches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        const lane = Math.floor((targetX - roadLeft) / laneWidth);
        if (dx > 0) targetX = roadLeft + Math.min(2, lane + 1) * laneWidth + laneWidth / 2 - playerWidth / 2;
        else targetX = roadLeft + Math.max(0, lane - 1) * laneWidth + laneWidth / 2 - playerWidth / 2;
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: false });
  }

  function spawnObstacle() {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const lane = Math.floor(Math.random() * 3);
    const x = roadLeft + lane * laneWidth + laneWidth / 2 - type.w / 2;
    obstacles.push({
      x, y: -type.h - 20,
      w: type.w, h: type.h,
      color: type.color,
      type: type.type
    });
  }

  function spawnParticles(x, y, color) {
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + Math.random();
      particles.push({
        x, y,
        vx: Math.cos(angle) * (4 + Math.random() * 6),
        vy: Math.sin(angle) * (4 + Math.random() * 6),
        life: 1,
        color
      });
    }
  }

  function drawSky() {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#0c1445');
    gr.addColorStop(0.5, '#1a1f3a');
    gr.addColorStop(1, '#0f0f14');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  }

  function drawRoad() {
    ctx.fillStyle = '#252525';
    ctx.fillRect(0, 0, w, h);

    const perspective = 0.15;
    const topWidth = roadWidth * (1 - perspective);
    const topLeft = (w - topWidth) / 2;
    const bottomLeft = roadLeft;

    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2a2a2a');
    gr.addColorStop(0.5, '#333');
    gr.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = gr;

    ctx.beginPath();
    ctx.moveTo(topLeft, 0);
    ctx.lineTo(topLeft + topWidth, 0);
    ctx.lineTo(bottomLeft + roadWidth, h);
    ctx.lineTo(bottomLeft, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.stroke();

    const dashLen = 35;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    for (let y = (roadOffset % 50) - 50; y < h + 50; y += 50) {
      const progress = y / h;
      const cx = topLeft + topWidth / 2 + (bottomLeft + roadWidth / 2 - topLeft - topWidth / 2) * progress;
      ctx.beginPath();
      ctx.moveTo(cx - 3, y);
      ctx.lineTo(cx - 3, y + dashLen);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([15, 25]);
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
      const lx = roadLeft + (roadWidth / 3) * i;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx + (roadWidth / 3) * (1 - 2 * perspective) * 0.3, h);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawCar(x, y, width, height, color, isPlayer) {
    const rx = 6;
    ctx.save();

    if (isPlayer) {
      const gr = ctx.createLinearGradient(x, y, x + width, y);
      gr.addColorStop(0, '#60a5fa');
      gr.addColorStop(0.5, '#3b82f6');
      gr.addColorStop(1, '#2563eb');
      ctx.fillStyle = gr;
    } else {
      ctx.fillStyle = color;
    }

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, rx);
    ctx.fill();

    ctx.strokeStyle = isPlayer ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isPlayer) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(x + 6, y + 8, width - 12, 18);
      ctx.fillRect(x + 6, y + height - 38, width - 12, 14);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(x + 4, y + 6, width - 8, 14);
    }

    ctx.restore();
  }

  function drawObstacles() {
    obstacles.forEach(o => {
      drawCar(o.x, o.y, o.w, o.h, o.color, false);
    });
  }

  function drawParticles() {
    particles = particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) return false;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });
  }

  function drawUI() {
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`SKOR: ${score}`, 12, 28);
    if (score > highScore) {
      ctx.fillStyle = '#22c55e';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('YENİ REKOR!', 12, 46);
    }
    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`En Yüksek: ${highScore}`, 12, 60);

    for (let i = 0; i < lives; i++) {
      ctx.fillStyle = i < lives ? '#ef4444' : '#444';
      ctx.beginPath();
      ctx.arc(w - 20 - i * 24, 24, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`HIZ: ${Math.round(speed)} km/h`, w - 90, 50);
  }

  function checkCollision() {
    if (Date.now() < invincibleUntil) return false;
    const py = h - playerHeight - 25;
    return obstacles.some(o =>
      playerX + playerWidth - 8 > o.x + 8 && playerX + 8 < o.x + o.w - 8 &&
      py + playerHeight - 5 > o.y + 5 && py + 5 < o.y + o.h - 5
    );
  }

  function hit() {
    spawnParticles(playerX + playerWidth / 2, h - playerHeight / 2 - 25, '#ef4444');
    lives--;
    invincibleUntil = Date.now() + 1500;
    if (lives <= 0) {
      state = 'gameover';
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('carRacingHighScore', String(highScore));
      }
      const overlay = document.getElementById('carRacingOverlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.innerHTML = `
          <div class="game-overlay-text">🏁 Yarış Bitti!</div>
          <div style="font-size:1.2rem;color:var(--text-secondary);margin:8px 0;">Skor: <strong style="color:var(--accent-gold);">${score}</strong></div>
          ${score >= highScore ? '<div style="color:var(--accent-green);font-weight:700;margin-bottom:8px;">🎉 Yeni Rekor!</div>' : ''}
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">En Yüksek: ${highScore}</div>
          <button class="btn btn-primary game-start-btn" onclick="startCarRacing()">Tekrar Yarış</button>
        `;
      }
    }
  }

  function loop(t) {
    if (carGameRAF) cancelAnimationFrame(carGameRAF);

    if (state === 'countdown') {
      drawSky();
      drawRoad();
      playerX += (targetX - playerX) * 0.1;
      drawCar(playerX, h - playerHeight - 25, playerWidth, playerHeight, '#3b82f6', true);
      drawUI();

      countdownTimer += 1/60;
      if (countdownTimer >= 1) {
        countdown--;
        countdownTimer = 0;
        if (countdown <= 0) {
          state = 'racing';
          countdown = 0;
        }
      }

      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.fillStyle = countdown > 0 ? 'rgba(250,204,21,0.9)' : 'rgba(34,197,94,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(countdown > 0 ? countdown : 'GO!', w / 2, h / 2 + 16);
      ctx.textAlign = 'left';

      carGameRAF = requestAnimationFrame(loop);
      return;
    }

    if (state === 'gameover') return;

    playerX += (targetX - playerX) * 0.15;
    roadOffset += speed;
    score += Math.floor(speed / 2);

    speed = baseSpeed + score * 0.008;
    if (speed > 18) speed = 18;

    const spawnRate = Math.max(600, 1400 - score * 2);
    if (Date.now() - lastObstacle > spawnRate) {
      spawnObstacle();
      lastObstacle = Date.now();
    }

    obstacles.forEach(o => o.y += speed);
    obstacles = obstacles.filter(o => o.y < h);

    if (checkCollision()) hit();

    drawSky();
    drawRoad();
    drawObstacles();
    drawParticles();

    if (Date.now() < invincibleUntil && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5;
    }
    drawCar(playerX, h - playerHeight - 25, playerWidth, playerHeight, '#3b82f6', true);
    ctx.globalAlpha = 1;

    drawUI();

    const scoreEl = document.getElementById('carRacingScore');
    if (scoreEl) scoreEl.textContent = `${score} puan`;

    carGameRAF = requestAnimationFrame(loop);
  }

  state = 'countdown';
  countdown = 3;
  countdownTimer = 0;
  playerX = roadLeft + laneWidth / 2 - playerWidth / 2;
  targetX = playerX;
  roadOffset = 0;
  obstacles = [];
  particles = [];
  score = 0;
  lives = 3;
  speed = 5;
  lastObstacle = 0;
  invincibleUntil = 0;

  loop(0);
}
