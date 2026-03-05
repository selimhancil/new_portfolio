/* ==========================================
   BENZERSİZ ÖZELLİKLER - Selim Hancıl Portfolio
   Hiçbir portfolyoda olmayan ayrıcalıklı deneyimler
   ========================================== */

(function() {
  'use strict';

  const PAGES = [
    { path: 'index.html', label: 'Ana Sayfa', icon: '🏠' },
    { path: 'community.html', label: 'Topluluk', icon: '💬' },
    { path: 'admin.html', label: 'Admin Panel', icon: '⚙️' },
    { path: 'projects.html', label: 'Projeler', icon: '📁' },
    { path: 'blog.html', label: 'Blog', icon: '📝' },
    { path: 'about.html', label: 'Hakkımda', icon: '👤' },
    { path: 'contact.html', label: 'İletişim', icon: '✉️' },
    { path: 'fun.html', label: 'Eğlence', icon: '🎮' },
    { path: 'typing-test.html', label: 'Yazma Hızı Testi', icon: '⌨️' },
  ];

  const DEV_COMMANDS = {
    help: () => 'Kullanılabilir komutlar: help, theme, visitor, time, joke, clear, fortune',
    theme: (arg) => {
      const themes = ['dark', 'midnight', 'forest', 'sunset'];
      const t = (arg || 'dark').toLowerCase();
      if (themes.includes(t)) {
        document.body.dataset.theme = t;
        return `Tema "${t}" uygulandı!`;
      }
      return `Temalar: ${themes.join(', ')}`;
    },
    visitor: () => `Sen ziyaretçi #${getVisitorId()}`,
    time: () => new Date().toLocaleString('tr-TR', { dateStyle: 'full', timeStyle: 'medium' }),
    joke: () => {
      const jokes = [
        'Neden programcılar karanlıkta çalışır? Çünkü light mode açık! 💡',
        'Debugging: Bug\'ları kovalamak yerine onlara isim vermek.',
        '0 is null, null is 0. JavaScript böyle diyor. 🤷',
        'Yazılımcı: "Çalışıyor" — Test eden: "Benim bilgisayarımda çalışmıyor"',
        'Git commit -m "fix" -m "fix fix" -m "gerçekten düzeltildi bu sefer"'
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    },
    fortune: () => {
      const fortunes = [
        'Bugün iyi bir pull request atacaksın!',
        '404 - Fal bulunamadı. Tekrar dene.',
        'Yakında harika bir fikir gelecek.',
        'Kod review\'ün geçecek. 🎉',
        'Çay molası zamanı! ☕'
      ];
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    },
    clear: () => {
      const out = document.getElementById('devConsoleOutput');
      if (out) out.innerHTML = '';
      return null;
    }
  };

  function getVisitorId() {
    let id = localStorage.getItem('portfolio_visitor_id');
    if (!id) {
      id = String(1000 + Math.floor(Math.random() * 9000));
      localStorage.setItem('portfolio_visitor_id', id);
    }
    return id;
  }

  function getVisitCount() {
    let count = parseInt(localStorage.getItem('portfolio_visit_count') || '0');
    count++;
    localStorage.setItem('portfolio_visit_count', String(count));
    return count;
  }

  /* ========== COMMAND PALETTE ========== */
  function initCommandPalette() {
    const overlay = document.createElement('div');
    overlay.id = 'command-palette';
    overlay.className = 'command-palette';
    overlay.innerHTML = `
      <div class="command-palette-inner">
        <div class="command-palette-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Sayfa veya komut ara... (↑↓ seç, Enter git)" id="commandInput" autocomplete="off">
        </div>
        <div class="command-palette-results" id="commandResults"></div>
        <div class="command-palette-hint">⌘K veya Ctrl+K ile aç/kapat</div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#commandInput');
    const resultsEl = overlay.querySelector('#commandResults');
    let selectedIndex = 0;
    let currentItems = [];

    function renderResults(query) {
      const q = (query || '').toLowerCase().trim();
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      currentItems = PAGES.filter(p =>
        p.label.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
      ).map(p => ({
        ...p,
        action: () => { window.location.href = p.path; closePalette(); }
      }));

      if (currentItems.length === 0) {
        resultsEl.innerHTML = '<div class="command-palette-empty">Sonuç bulunamadı</div>';
        return;
      }

      selectedIndex = 0;
      resultsEl.innerHTML = currentItems.map((item, i) => `
        <div class="command-palette-item ${i === 0 ? 'selected' : ''}" data-index="${i}" data-action="nav">
          <span class="command-palette-icon">${item.icon}</span>
          <span>${highlightMatch(item.label, q)}</span>
          ${item.path === currentPath ? '<span class="command-palette-current">Mevcut</span>' : ''}
        </div>
      `).join('');

      resultsEl.querySelectorAll('.command-palette-item').forEach((el, i) => {
        el.addEventListener('click', () => currentItems[i].action());
      });
    }

    function highlightMatch(text, q) {
      if (!q) return text;
      const i = text.toLowerCase().indexOf(q);
      if (i === -1) return text;
      return text.slice(0, i) + '<mark>' + text.slice(i, i + q.length) + '</mark>' + text.slice(i + q.length);
    }

    function openPalette() {
      overlay.classList.add('open');
      input.value = '';
      renderResults('');
      input.focus();
    }

    function closePalette() {
      overlay.classList.remove('open');
      selectedIndex = 0;
    }

    function selectNext() {
      const items = resultsEl.querySelectorAll('.command-palette-item');
      if (!items.length) return;
      items[selectedIndex]?.classList.remove('selected');
      selectedIndex = (selectedIndex + 1) % items.length;
      items[selectedIndex]?.classList.add('selected');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }

    function selectPrev() {
      const items = resultsEl.querySelectorAll('.command-palette-item');
      if (!items.length) return;
      items[selectedIndex]?.classList.remove('selected');
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      items[selectedIndex]?.classList.add('selected');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }

    function runSelected() {
      const item = currentItems[selectedIndex];
      if (item && item.action) item.action();
      closePalette();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (overlay.classList.contains('open')) closePalette();
        else openPalette();
      }
      if (overlay.classList.contains('open')) {
        if (e.key === 'Escape') closePalette();
        else if (e.key === 'ArrowDown') { e.preventDefault(); selectNext(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectPrev(); }
        else if (e.key === 'Enter') { e.preventDefault(); runSelected(); }
      }
    });

    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePalette(); });
  }

  /* ========== VISITOR BADGE ========== */
  function initVisitorBadge() {
    const badge = document.createElement('div');
    badge.className = 'visitor-badge';
    badge.title = 'Benzersiz ziyaretçi kimliğin';
    badge.innerHTML = `👤 #${getVisitorId()}`;
    document.body.appendChild(badge);
  }

  /* ========== AKTİF KULLANICI GÖSTERGESİ ========== */
  function getActiveUserCount() {
    const base = 32;
    const hour = new Date().getHours();
    const seed = (hour * 7 + new Date().getMinutes()) % 50;
    return base + seed + Math.floor(Math.random() * 15);
  }

  function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
    return n.toString();
  }

  function initActiveUsersBadge() {
    const badge = document.createElement('div');
    badge.className = 'active-users-badge';
    badge.title = 'Şu an sitede aktif ziyaretçi sayısı';
    badge.innerHTML = `<span class="active-users-dot"></span><span class="active-users-count">${getActiveUserCount()}</span> kişi şu an sitede`;
    document.body.appendChild(badge);

    setInterval(() => {
      const countEl = badge.querySelector('.active-users-count');
      if (countEl) countEl.textContent = getActiveUserCount();
    }, 8000);
  }

  /* ========== SCROLL PROGRESS ========== */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    bar.id = 'scrollProgressBar';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + '%';
    });
  }

  /* ========== SECRET DEV CONSOLE ========== */
  let devConsoleOpen = false;
  let devConsoleEl = null;

  function initDevConsole() {
    devConsoleEl = document.createElement('div');
    devConsoleEl.id = 'dev-console';
    devConsoleEl.className = 'dev-console';
    devConsoleEl.innerHTML = `
      <div class="dev-console-header">
        <span>🔧 Gizli Dev Konsolu</span>
        <button class="dev-console-close" aria-label="Kapat">×</button>
      </div>
      <div class="dev-console-output" id="devConsoleOutput"></div>
      <div class="dev-console-input-wrap">
        <span class="dev-console-prompt">></span>
        <input type="text" id="devConsoleInput" placeholder="Komut yaz (help ile başla)" autocomplete="off">
      </div>
    `;

    document.body.appendChild(devConsoleEl);

    const output = devConsoleEl.querySelector('#devConsoleOutput');
    const input = devConsoleEl.querySelector('#devConsoleInput');
    const closeBtn = devConsoleEl.querySelector('.dev-console-close');

    function log(msg, type = 'result') {
      const line = document.createElement('div');
      line.className = `dev-console-line dev-console-line-${type}`;
      line.textContent = msg;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    function clearDevConsole() {
      output.innerHTML = '';
    }

    function runCommand(cmd) {
      const [name, ...args] = cmd.trim().split(/\s+/);
      const fn = DEV_COMMANDS[name?.toLowerCase()];
      if (fn) {
        const result = fn(args[0]);
        if (result) log(result, 'result');
      } else if (name) {
        log(`Bilinmeyen komut: ${name}. "help" yaz.`, 'error');
      }
    }

    function openDevConsole() {
      devConsoleEl.classList.add('open');
      devConsoleOpen = true;
      input.focus();
      log('Merhaba hacker! Gizli konsola hoş geldin. "help" yazarak komutları gör.');
    }

    function closeDevConsole() {
      devConsoleEl.classList.remove('open');
      devConsoleOpen = false;
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value;
        input.value = '';
        if (cmd.trim()) {
          log('> ' + cmd, 'cmd');
          runCommand(cmd);
        }
      }
      if (e.key === 'Escape') closeDevConsole();
    });

    closeBtn.addEventListener('click', closeDevConsole);

    document.addEventListener('keydown', (e) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        devConsoleOpen ? closeDevConsole() : openDevConsole();
      }
    });
  }

  /* ========== KONAMI CODE EASTER EGG ========== */
  function initKonamiCode() {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let index = 0;

    document.addEventListener('keydown', (e) => {
      if (e.key === konami[index]) {
        index++;
        if (index === konami.length) {
          index = 0;
          triggerKonamiEgg();
        }
      } else {
        index = 0;
      }
    });
  }

  function triggerKonamiEgg() {
    createConfetti();
    const toast = document.createElement('div');
    toast.className = 'konami-toast';
    toast.innerHTML = '🎉 Gizli kodu buldun! Sen bir dahisin!';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function createConfetti() {
    const colors = ['#facc15', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 80; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.cssText = `
        position:fixed;width:10px;height:10px;background:${colors[i % colors.length]};
        left:${Math.random() * 100}vw;top:-20px;z-index:99999;
        animation:confetti-fall ${2 + Math.random() * 2}s linear forwards;
        opacity:0.9;border-radius:2px;
      `;
      c.style.animationDelay = Math.random() * 0.5 + 's';
      c.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }

    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confetti-fall {
          to { transform: translate(var(--tx, 0), 100vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ========== WELCOME TOAST (First Visit) ========== */
  function initWelcomeToast() {
    const count = getVisitCount();
    if (count === 1) {
      setTimeout(() => {
        const toast = document.createElement('div');
        toast.className = 'welcome-toast';
        toast.innerHTML = `
          <span>👋 Hoş geldin! Sen <strong>Ziyaretçi #${getVisitorId()}</strong> oldun.</span>
          <small>İpucu: ⌘K ile hızlı menü, \` tuşu ile gizli konsol!</small>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 500);
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 400);
        }, 6000);
      }, 2000);
    }
  }

  /* ========== INIT ========== */
  document.addEventListener('DOMContentLoaded', () => {
    initCommandPalette();
    initVisitorBadge();
    initActiveUsersBadge();
    initScrollProgress();
    initDevConsole();
    initKonamiCode();
    initWelcomeToast();
  });
})();
