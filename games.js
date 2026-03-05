/* ==========================================
   GAMES.JS — Mini Games for Fun Page
   ========================================== */

/* ==========================================
   1. SNAKE GAME
   ========================================== */
let snakeGame = null;

function startSnake() {
    const overlay = document.getElementById('snakeOverlay');
    if (overlay) overlay.style.display = 'none';

    // Show mobile controls on touch devices
    if ('ontouchstart' in window) {
        document.getElementById('snakeMobileControls').style.display = 'flex';
    }

    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let food = spawnFood();
    let dx = 0, dy = 0;
    let score = 0;
    let gameRunning = true;

    function spawnFood() {
        return {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }

    function draw() {
        // Background
        ctx.fillStyle = '#0a0f1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid (subtle)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // Food (glowing)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake
        snake.forEach((seg, i) => {
            const ratio = 1 - (i / snake.length) * 0.4;
            ctx.shadowBlur = i === 0 ? 10 : 0;
            ctx.shadowColor = '#3b82f6';
            ctx.fillStyle = i === 0 ? '#3b82f6' : `rgba(59, 130, 246, ${ratio})`;
            ctx.beginPath();
            ctx.roundRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    function update() {
        if (!gameRunning) return;
        if (dx === 0 && dy === 0) { draw(); requestAnimationFrame(() => setTimeout(update, 120)); return; }

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver(); return;
        }

        // Self collision
        if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            gameOver(); return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('snakeScore').textContent = `Skor: ${score}`;
            food = spawnFood();
        } else {
            snake.pop();
        }

        draw();
        requestAnimationFrame(() => setTimeout(update, 120));
    }

    function gameOver() {
        gameRunning = false;
        const overlay = document.getElementById('snakeOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.innerHTML = `
        <div class="game-overlay-text">💀 Oyun Bitti!</div>
        <div style="font-size:1.3rem;color:var(--accent-yellow);margin-bottom:12px;">Skor: ${score}</div>
        <button class="btn btn-primary game-start-btn" onclick="startSnake()">Tekrar Oyna</button>
      `;
        }
    }

    // Keyboard controls
    document.onkeydown = (e) => {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': if (dy !== 1) { dx = 0; dy = -1; } break;
            case 'ArrowDown': case 's': case 'S': if (dy !== -1) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': case 'a': case 'A': if (dx !== 1) { dx = -1; dy = 0; } break;
            case 'ArrowRight': case 'd': case 'D': if (dx !== -1) { dx = 1; dy = 0; } break;
        }
    };

    // Store direction setter for mobile
    window._snakeSetDir = (dir) => {
        switch (dir) {
            case 'up': if (dy !== 1) { dx = 0; dy = -1; } break;
            case 'down': if (dy !== -1) { dx = 0; dy = 1; } break;
            case 'left': if (dx !== 1) { dx = -1; dy = 0; } break;
            case 'right': if (dx !== -1) { dx = 1; dy = 0; } break;
        }
    };

    update();
}

function snakeDir(d) {
    if (window._snakeSetDir) window._snakeSetDir(d);
}


/* ==========================================
   2. MEMORY GAME
   ========================================== */
const memoryEmojis = ['🚀', '💻', '🎮', '🧠', '⚡', '🔥', '🎯', '🌟'];
let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = [];
let memoryMoves = 0;
let memoryLocked = false;

function initMemory() {
    memoryFlipped = [];
    memoryMatched = [];
    memoryMoves = 0;
    memoryLocked = false;
    document.getElementById('memoryScore').textContent = 'Hamle: 0';

    // Create shuffled pairs
    memoryCards = [...memoryEmojis, ...memoryEmojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, i) => ({ id: i, emoji, matched: false }));

    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = memoryCards.map((card, i) => `
    <div class="memory-card" data-index="${i}" onclick="flipMemoryCard(${i})">
      <div class="memory-card-inner">
        <div class="memory-card-front">?</div>
        <div class="memory-card-back">${card.emoji}</div>
      </div>
    </div>
  `).join('');
}

function flipMemoryCard(index) {
    if (memoryLocked) return;
    if (memoryFlipped.includes(index)) return;
    if (memoryMatched.includes(index)) return;

    const cardEl = document.querySelector(`.memory-card[data-index="${index}"]`);
    cardEl.classList.add('flipped');
    memoryFlipped.push(index);

    if (memoryFlipped.length === 2) {
        memoryMoves++;
        document.getElementById('memoryScore').textContent = `Hamle: ${memoryMoves}`;
        memoryLocked = true;

        const [a, b] = memoryFlipped;
        if (memoryCards[a].emoji === memoryCards[b].emoji) {
            memoryMatched.push(a, b);
            memoryFlipped = [];
            memoryLocked = false;

            // Matched animation
            document.querySelector(`.memory-card[data-index="${a}"]`).classList.add('matched');
            document.querySelector(`.memory-card[data-index="${b}"]`).classList.add('matched');

            if (memoryMatched.length === memoryCards.length) {
                setTimeout(() => {
                    document.getElementById('memoryScore').textContent = `🎉 Tebrikler! ${memoryMoves} hamlede bitirdin!`;
                }, 500);
            }
        } else {
            setTimeout(() => {
                document.querySelector(`.memory-card[data-index="${a}"]`).classList.remove('flipped');
                document.querySelector(`.memory-card[data-index="${b}"]`).classList.remove('flipped');
                memoryFlipped = [];
                memoryLocked = false;
            }, 800);
        }
    }
}


/* ==========================================
   3. TYPING SPEED TEST
   ========================================== */
const typingSentences = [
    "Yazılım dünyasında her gün yeni bir şey öğreniyorum",
    "Yapay zeka geleceğin en önemli teknolojisidir",
    "Modern web uygulamaları hızlı ve güvenli olmalıdır",
    "Python programlama dili çok yönlü ve güçlüdür",
    "Açık kaynak projeler topluluk için büyük değer taşır",
    "Her büyük proje küçük bir adımla başlar",
    "Kod yazmak yaratıcı bir süreçtir",
    "Teknoloji hayatımızı kolaylaştıran en güçlü araçtır",
    "Veritabanı tasarımı yazılımın temelidir",
    "Bulut bilişim modern yazılım geliştirmeyi değiştirdi"
];
let typingTimer = null;
let typingStartTime = null;
let typingTimeLeft = 30;
let typingCorrectChars = 0;
let typingTotalChars = 0;
let typingWordCount = 0;
let typingCurrentSentence = '';

function startTyping() {
    typingTimeLeft = 30;
    typingCorrectChars = 0;
    typingTotalChars = 0;
    typingWordCount = 0;
    typingStartTime = null;

    typingCurrentSentence = typingSentences[Math.floor(Math.random() * typingSentences.length)];
    document.getElementById('typingText').innerHTML = typingCurrentSentence.split('').map(c => `<span class="typing-char">${c}</span>`).join('');

    const input = document.getElementById('typingInput');
    input.disabled = false;
    input.value = '';
    input.focus();

    document.getElementById('typingTime').textContent = '30';
    document.getElementById('typingWords').textContent = '0';
    document.getElementById('typingAccuracy').textContent = '100';
    document.getElementById('typingWPM').textContent = '0 WPM';

    if (typingTimer) clearInterval(typingTimer);

    input.oninput = () => {
        if (!typingStartTime) {
            typingStartTime = Date.now();
            typingTimer = setInterval(updateTypingTimer, 1000);
        }

        const inputVal = input.value;
        const chars = document.querySelectorAll('.typing-char');
        let correct = 0;

        chars.forEach((charEl, i) => {
            charEl.classList.remove('correct', 'incorrect', 'current');
            if (i < inputVal.length) {
                if (inputVal[i] === typingCurrentSentence[i]) {
                    charEl.classList.add('correct');
                    correct++;
                } else {
                    charEl.classList.add('incorrect');
                }
            } else if (i === inputVal.length) {
                charEl.classList.add('current');
            }
        });

        typingCorrectChars = correct;
        typingTotalChars = inputVal.length;

        const accuracy = typingTotalChars > 0 ? Math.round((typingCorrectChars / typingTotalChars) * 100) : 100;
        document.getElementById('typingAccuracy').textContent = accuracy;

        // Word count
        typingWordCount = inputVal.trim().split(/\s+/).filter(w => w).length;
        document.getElementById('typingWords').textContent = typingWordCount;

        // WPM calculation
        const elapsed = (Date.now() - typingStartTime) / 60000;
        if (elapsed > 0) {
            const wpm = Math.round(typingWordCount / elapsed);
            document.getElementById('typingWPM').textContent = `${wpm} WPM`;
        }

        // Completed sentence
        if (inputVal === typingCurrentSentence) {
            input.value = '';
            typingCurrentSentence = typingSentences[Math.floor(Math.random() * typingSentences.length)];
            document.getElementById('typingText').innerHTML = typingCurrentSentence.split('').map(c => `<span class="typing-char">${c}</span>`).join('');
        }
    };
}

function updateTypingTimer() {
    typingTimeLeft--;
    document.getElementById('typingTime').textContent = typingTimeLeft;

    if (typingTimeLeft <= 0) {
        clearInterval(typingTimer);
        const input = document.getElementById('typingInput');
        input.disabled = true;
        input.value = '';

        const elapsed = 0.5; // 30 seconds = 0.5 min
        const wpm = Math.round(typingWordCount / elapsed);
        document.getElementById('typingWPM').textContent = `${wpm} WPM`;
        document.getElementById('typingText').innerHTML = `<div style="text-align:center;font-size:1.5rem;color:var(--accent-yellow);">⏱️ Süre Doldu! ${wpm} WPM</div>`;
    }
}


/* ==========================================
   4. REFLEX TEST
   ========================================== */
let reflexState = 'idle'; // idle, waiting, ready
let reflexTimeout = null;
let reflexStartTime = null;
let reflexResults = [];

function reflexClick() {
    const area = document.getElementById('reflexArea');
    const text = document.getElementById('reflexText');
    const result = document.getElementById('reflexResult');

    if (reflexState === 'idle') {
        // Start waiting
        reflexState = 'waiting';
        area.className = 'game-area reflex-area reflex-waiting';
        text.textContent = 'Yeşil olunca tıkla...';
        result.textContent = '';

        reflexTimeout = setTimeout(() => {
            reflexState = 'ready';
            area.className = 'game-area reflex-area reflex-go';
            text.textContent = 'TIKLA!';
            reflexStartTime = Date.now();
        }, 1500 + Math.random() * 3000);

    } else if (reflexState === 'waiting') {
        // Too early!
        clearTimeout(reflexTimeout);
        reflexState = 'idle';
        area.className = 'game-area reflex-area reflex-early';
        text.textContent = 'Çok erken tıkladın! 😅';
        result.textContent = 'Tekrar denemek için tıkla';

    } else if (reflexState === 'ready') {
        // Measure reaction time
        const reactionTime = Date.now() - reflexStartTime;
        reflexResults.push(reactionTime);
        reflexState = 'idle';
        area.className = 'game-area reflex-area';

        let rating = '';
        if (reactionTime < 200) rating = '⚡ İnanılmaz!';
        else if (reactionTime < 300) rating = '🔥 Harika!';
        else if (reactionTime < 400) rating = '👍 İyi!';
        else if (reactionTime < 500) rating = '😐 Ortalama';
        else rating = '🐌 Biraz yavaş...';

        text.textContent = `${reactionTime} ms`;

        const avg = Math.round(reflexResults.reduce((a, b) => a + b) / reflexResults.length);
        result.innerHTML = `${rating}<br><span style="font-size:0.85rem;color:var(--text-muted);">Ortalama: ${avg} ms | ${reflexResults.length} deneme</span><br><span style="font-size:0.8rem;color:var(--text-muted);">Tekrar denemek için tıkla</span>`;
    }
}


/* ==========================================
   5. MATH QUIZ
   ========================================== */
let mathTimer = null;
let mathTimeLeft = 30;
let mathCorrectCount = 0;
let mathWrongCount = 0;
let mathCurrentAnswer = 0;

function startMath() {
    mathTimeLeft = 30;
    mathCorrectCount = 0;
    mathWrongCount = 0;

    document.getElementById('mathTime').textContent = '30';
    document.getElementById('mathCorrect').textContent = '0';
    document.getElementById('mathWrong').textContent = '0';
    document.getElementById('mathScore').textContent = 'Skor: 0';

    const input = document.getElementById('mathInput');
    input.disabled = false;
    input.value = '';
    input.focus();

    document.getElementById('mathStartBtn').style.display = 'none';

    generateMathQuestion();

    if (mathTimer) clearInterval(mathTimer);
    mathTimer = setInterval(() => {
        mathTimeLeft--;
        document.getElementById('mathTime').textContent = mathTimeLeft;
        if (mathTimeLeft <= 0) {
            clearInterval(mathTimer);
            input.disabled = true;
            document.getElementById('mathQuestion').innerHTML = `<span style="color:var(--accent-yellow);">⏱️ Süre Doldu!</span><br>Doğru: ${mathCorrectCount} | Yanlış: ${mathWrongCount}`;
            document.getElementById('mathStartBtn').style.display = 'inline-flex';
            document.getElementById('mathStartBtn').textContent = 'Tekrar Oyna';
        }
    }, 1000);

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            const answer = parseInt(input.value);
            if (!isNaN(answer)) {
                if (answer === mathCurrentAnswer) {
                    mathCorrectCount++;
                    document.getElementById('mathCorrect').textContent = mathCorrectCount;
                    document.getElementById('mathScore').textContent = `Skor: ${mathCorrectCount * 10}`;
                } else {
                    mathWrongCount++;
                    document.getElementById('mathWrong').textContent = mathWrongCount;
                }
                input.value = '';
                generateMathQuestion();
            }
        }
    };
}

function generateMathQuestion() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;

    if (op === '+') {
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        mathCurrentAnswer = a + b;
    } else if (op === '-') {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * a);
        mathCurrentAnswer = a - b;
    } else {
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        mathCurrentAnswer = a * b;
    }

    document.getElementById('mathQuestion').innerHTML = `<span style="font-size:2.5rem;font-weight:700;">${a} ${op} ${b} = ?</span>`;
}


/* ==========================================
   6. ROCK PAPER SCISSORS
   ========================================== */
let rpsPlayerScore = 0;
let rpsComputerScore = 0;
const rpsEmojis = { 'taş': '🪨', 'kağıt': '📄', 'makas': '✂️' };
const rpsChoices = ['taş', 'kağıt', 'makas'];

function playRPS(playerChoice) {
    const computerChoice = rpsChoices[Math.floor(Math.random() * 3)];

    // Animate choices
    const playerEl = document.getElementById('rpsPlayerChoice');
    const computerEl = document.getElementById('rpsComputerChoice');
    const resultEl = document.getElementById('rpsResult');

    playerEl.classList.add('rps-animate');
    computerEl.classList.add('rps-animate');

    setTimeout(() => {
        playerEl.textContent = rpsEmojis[playerChoice];
        computerEl.textContent = rpsEmojis[computerChoice];
        playerEl.classList.remove('rps-animate');
        computerEl.classList.remove('rps-animate');

        let result = '';
        if (playerChoice === computerChoice) {
            result = '🤝 Berabere!';
            resultEl.className = 'rps-result rps-draw';
        } else if (
            (playerChoice === 'taş' && computerChoice === 'makas') ||
            (playerChoice === 'kağıt' && computerChoice === 'taş') ||
            (playerChoice === 'makas' && computerChoice === 'kağıt')
        ) {
            result = '🎉 Kazandın!';
            rpsPlayerScore++;
            resultEl.className = 'rps-result rps-win';
        } else {
            result = '😢 Kaybettin!';
            rpsComputerScore++;
            resultEl.className = 'rps-result rps-lose';
        }

        resultEl.textContent = result;
        document.getElementById('rpsScore').textContent = `${rpsPlayerScore} - ${rpsComputerScore}`;
    }, 300);
}


/* ==========================================
   INIT ON PAGE LOAD
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize memory game if on fun page
    if (document.getElementById('memoryGrid')) {
        initMemory();
    }
});
