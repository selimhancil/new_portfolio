/* ==========================================
   PORTFOLIO - Main JavaScript
   Multi-page portfolio with GitHub integration
   ========================================== */

const GITHUB_USERNAME = 'selimhancil';

document.addEventListener('DOMContentLoaded', () => {
  // Hide loader
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('hidden');
  }, 600);

  initParticles();
  initTerminalAnimation();
  initScrollReveal();
  initNavbar();
  initMobileMenu();
  initScrollToTop();
  initCounterAnimation();
  initSkillBars();
  initFAQ();
  initGitHubIntegration();
});

/* ==========================================
   GITHUB API INTEGRATION
   ========================================== */
async function initGitHubIntegration() {
  // Only fetch on pages that need it
  const githubProfileCard = document.getElementById('githubProfileCard');
  const githubReposContainer = document.getElementById('githubRepos');
  const githubStatsContainer = document.querySelector('.github-stats');

  if (!githubProfileCard && !githubReposContainer && !githubStatsContainer) return;

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`)
    ]);

    const profile = await profileRes.json();
    const repos = await reposRes.json();

    // Filter out forks for display
    const ownRepos = repos.filter(r => !r.fork);

    // Update GitHub stats on homepage bento grid
    if (githubStatsContainer) {
      updateGitHubStats(profile, ownRepos);
    }

    // Update GitHub profile card (about page)
    if (githubProfileCard) {
      updateGitHubProfileCard(profile);
    }

    // Update repos on projects page
    if (githubReposContainer) {
      renderGitHubRepos(githubReposContainer, ownRepos);
    }
  } catch (err) {
    console.log('GitHub API error:', err);
  }
}

function updateGitHubStats(profile, repos) {
  const statValues = document.querySelectorAll('.github-stat-value[data-target]');
  const statMap = {
    'repos': profile.public_repos,
    'followers': profile.followers,
    'following': profile.following
  };

  // Calculate total stars
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  // Count languages
  const languages = new Set(repos.map(r => r.language).filter(Boolean));

  // Update stat values with real data
  statValues.forEach(el => {
    const label = el.closest('.github-stat')?.querySelector('.github-stat-label')?.textContent?.toLowerCase();
    if (label?.includes('repo')) el.setAttribute('data-target', profile.public_repos);
    else if (label?.includes('star')) el.setAttribute('data-target', totalStars);
    else if (label?.includes('takip')) el.setAttribute('data-target', profile.followers);
    else if (label?.includes('dil')) el.setAttribute('data-target', languages.size);
  });

  // Re-trigger counter animation
  initCounterAnimation();
}

function updateGitHubProfileCard(profile) {
  const card = document.getElementById('githubProfileCard');
  if (!card) return;

  const avatar = card.querySelector('.github-avatar');
  const name = card.querySelector('.github-name');
  const bio = card.querySelector('.github-bio');
  const stats = card.querySelector('.github-profile-stats');

  if (avatar && profile.avatar_url && isSafeUrl(profile.avatar_url)) avatar.src = profile.avatar_url;
  if (name) name.textContent = profile.name || profile.login;
  if (bio) bio.textContent = profile.bio || '';
  if (stats) {
    stats.innerHTML = `
      <div class="github-profile-stat"><strong>${profile.public_repos}</strong><span>Repos</span></div>
      <div class="github-profile-stat"><strong>${profile.followers}</strong><span>Followers</span></div>
      <div class="github-profile-stat"><strong>${profile.following}</strong><span>Following</span></div>
    `;
  }
}

function escapeHtml(str) {
  if (str == null || typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim().toLowerCase();
  return (u.startsWith('https://') || u.startsWith('http://')) &&
    !u.startsWith('javascript:') && !u.startsWith('data:') && !u.startsWith('vbscript:');
}

function renderGitHubRepos(container, repos) {
  // Language color map
  const langColors = {
    'TypeScript': '#3178c6', 'JavaScript': '#f1e05a', 'Python': '#3572A5',
    'C#': '#178600', 'HTML': '#e34c26', 'CSS': '#563d7c',
    'Jupyter Notebook': '#DA5B0B', 'Dart': '#00B4AB', 'Java': '#b07219',
    'C++': '#f34b7d', 'Rust': '#dea584', 'Go': '#00ADD8'
  };

  // Project image mapping — repo name → image file
  const projectImages = {
    'trendCRM': 'images/project_trendcrm.png',
    'MyWebsite_selimhancil.com': 'images/project_mywebsite.png',
    'My-Pet-Companion': 'images/project_pet_companion.png',
    'Strategic-TicTacToe': 'images/project_tictactoe.png',
    'Hangman-Game': 'images/project_hangman.png',
    'Car-Racing-Master': 'images/project_car_racing.png',
    'Fibonacci-Toolkit-Project': 'images/project_fibonacci.png',
    'Flappy-Bird-Game': 'images/project_flappy_bird.png',
    'UML-Diagram-Examples': 'images/project_uml_diagrams.png',
    'AI-Framework': 'images/project_ai_framework.png',
    'Construction-Stock-Management': 'images/project_construction.png'
  };
  const defaultImage = 'images/project_default.png';

  const safeRepoUrl = (repo) => isSafeUrl(repo.html_url) ? repo.html_url : '#';
  const safeHomepage = (url) => url && isSafeUrl(url) ? url : null;
  const safeLang = (l) => l && langColors[l] ? l : null;

  container.innerHTML = repos.map(repo => {
    const imgSrc = projectImages[repo.name] || defaultImage;
    const ghUrl = safeRepoUrl(repo);
    const hpUrl = safeHomepage(repo.homepage);
    const name = escapeHtml(repo.name);
    const desc = escapeHtml(repo.description || 'Bu proje için henüz bir açıklama eklenmemiş.');
    const lang = safeLang(repo.language);
    const langColor = lang ? (langColors[lang] || '#8b949e') : '#8b949e';
    return `
    <div class="project-card reveal">
      <img src="${escapeHtml(imgSrc)}" alt="${name}" class="project-card-image" loading="lazy">
      <div class="project-card-body">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" style="color: var(--text-muted); flex-shrink:0;"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>
          <h3 class="project-card-title" style="margin:0;">${name}</h3>
        </div>
        <p class="project-card-desc">${desc}</p>
      </div>
      <div class="project-card-tags">
        ${lang ? `<span class="project-tag" style="border-color: ${langColor}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${langColor};margin-right:4px;"></span>${escapeHtml(lang)}</span>` : ''}
        ${repo.stargazers_count > 0 ? `<span class="project-tag">⭐ ${repo.stargazers_count}</span>` : ''}
        ${repo.forks_count > 0 ? `<span class="project-tag">🍴 ${repo.forks_count}</span>` : ''}
      </div>
      <div class="project-card-footer">
        <a href="${escapeHtml(ghUrl)}" target="_blank" rel="noopener noreferrer">GitHub'da Gör →</a>
        ${hpUrl ? `<a href="${escapeHtml(hpUrl)}" target="_blank" rel="noopener noreferrer">Canlı Demo</a>` : ''}
      </div>
    </div>
  `}).join('');

  // Re-trigger scroll reveal for new elements
  initScrollReveal();
}

/* ==========================================
   PARTICLE BACKGROUND
   ========================================== */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  const particleCount = 60;
  const connectionDistance = 140;
  const mouseRadius = 180;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius;
          this.x -= (dx / distance) * force * 1.2;
          this.y -= (dy / distance) * force * 1.2;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 163, 184, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.12;
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================
   TERMINAL TYPING ANIMATION (Home page)
   ========================================== */
function initTerminalAnimation() {
  const terminalBody = document.getElementById('terminalBody');
  if (!terminalBody) return;

  const lines = [
    { type: 'command', prompt: 'selim@portfolio', path: '~', command: 'whoami' },
    { type: 'output', text: ' Selim Han Çil - AI & Automation Developer' },
    { type: 'command', prompt: 'selim@portfolio', path: '~', command: 'cat company.txt' },
    { type: 'output', text: ' Founder @ ARTplus Global Yazılım Ajansı' },
    { type: 'command', prompt: 'selim@portfolio', path: '~', command: 'cat skills.txt' },
    { type: 'output', text: ' TypeScript • C# • Python • React • Next.js' },
    { type: 'command', prompt: 'selim@portfolio', path: '~', command: 'echo $STATUS' },
    { type: 'output', text: ' "Yeni projeler için müsaitim 🚀"' },
    { type: 'cursor', prompt: 'selim@portfolio', path: '~' }
  ];

  let lineIndex = 0;
  const lineDelay = 350;
  const typeSpeed = 35;

  function createLine(lineData) {
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal-line';

    if (lineData.type === 'command') {
      lineEl.innerHTML = `<span class="terminal-prompt">${lineData.prompt}:</span><span class="terminal-path">${lineData.path}</span><span class="terminal-prompt">$</span> <span class="terminal-command"></span>`;
    } else if (lineData.type === 'output') {
      lineEl.innerHTML = `<span class="terminal-output">${lineData.text}</span>`;
    } else if (lineData.type === 'cursor') {
      lineEl.innerHTML = `<span class="terminal-prompt">${lineData.prompt}:</span><span class="terminal-path">${lineData.path}</span><span class="terminal-prompt">$</span> <span class="terminal-cursor"></span>`;
    }

    terminalBody.appendChild(lineEl);
    requestAnimationFrame(() => { lineEl.classList.add('visible'); });
    return lineEl;
  }

  function typeText(element, text, callback) {
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < text.length) {
        element.textContent += text[charIndex];
        charIndex++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, typeSpeed);
  }

  function processNextLine() {
    if (lineIndex >= lines.length) return;
    const lineData = lines[lineIndex];
    const lineEl = createLine(lineData);

    if (lineData.type === 'command') {
      const commandEl = lineEl.querySelector('.terminal-command');
      setTimeout(() => {
        typeText(commandEl, lineData.command, () => {
          lineIndex++;
          setTimeout(processNextLine, lineDelay);
        });
      }, 150);
    } else {
      lineIndex++;
      setTimeout(processNextLine, lineDelay);
    }
  }

  setTimeout(processNextLine, 500);
}

/* ==========================================
   SCROLL REVEAL
   ========================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.active)');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ==========================================
   NAVBAR
   ========================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
      closeMenuIfOpen();
    });
  });
}

/* ==========================================
   MOBILE MENU
   ========================================== */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (!mobileBtn || !navLinks) return;

  mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    mobileBtn.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
  });
}

function closeMenuIfOpen() {
  const navLinks = document.getElementById('navLinks');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (navLinks && navLinks.classList.contains('mobile-open')) {
    navLinks.classList.remove('mobile-open');
    mobileBtn.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================
   SCROLL TO TOP
   ========================================== */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================
   ANIMATED COUNTERS
   ========================================== */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.github-stat-value[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    element.textContent = current.toLocaleString('tr-TR');
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ==========================================
   SKILL BARS ANIMATION
   ========================================== */
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  if (!skillBars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        setTimeout(() => { bar.style.width = width + '%'; }, 300);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => observer.observe(bar));
}

/* ==========================================
   FAQ ACCORDION (Services page)
   ========================================== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}
