/**
 * Content Loader - Admin panelinden kaydedilen içeriği sayfalara yükler
 * localStorage + Firestore'dan okur (Firebase varsa)
 */
(function() {
  const STORAGE_KEY = 'sh_site_content';
  const FIRESTORE_COLLECTION = 'site_content';
  const FIRESTORE_DOC = 'portfolio';
  let content = null;

  function getContent() {
    if (content) return content;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) content = JSON.parse(saved);
    } catch (e) {}
    return content || {};
  }

  function setContent(data) {
    content = data;
  }

  function escapeHtml(str) {
    if (str == null || typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function updateElement(selector, value, attr) {
    const el = document.querySelector(selector);
    if (el && value) {
      if (attr === 'html') el.textContent = value;
      else if (attr === 'href') el.href = value;
      else if (attr) el.setAttribute(attr, value);
      else el.textContent = value;
    }
  }

  function loadContent() {
    const c = getContent();
    if (!c || Object.keys(c).length === 0) return;

    const g = c.general || {};
    const a = c.about || {};
    const p = c.projects || {};
    const b = c.blog || {};
    const co = c.contact || {};
    const comm = c.community || {};

    // Genel - navbar logo, footer
    document.querySelectorAll('.nav-logo span').forEach(el => { if (g.name) el.textContent = g.name; });
    document.querySelectorAll('.footer-brand-desc').forEach(el => { if (g.tagline) el.textContent = g.tagline; });
    document.querySelectorAll('.cta-title').forEach(el => {
      if (g.ctaTitle && g.ctaSubtitle) {
        const t = escapeHtml(g.ctaTitle);
        const s = escapeHtml(g.ctaSubtitle);
        el.innerHTML = t + '<br><span class="gradient-text">' + s + '</span>';
      }
    });

    // Hakkımda sayfası
    const aboutHero = document.querySelector('.page-hero .container h1');
    if (aboutHero && a.name) aboutHero.textContent = a.name;
    const aboutSub = document.querySelector('.page-hero .container p');
    if (aboutSub && a.title) aboutSub.textContent = a.title;

    const aboutBio = document.querySelector('.about-bio');
    if (aboutBio && a.bio) {
      const paras = a.bio.split('|').filter(Boolean);
      const firstP = aboutBio.querySelector('h2 + p, p');
      if (paras.length && firstP) {
        const pContainer = firstP.parentNode;
        const existing = pContainer.querySelectorAll('p');
        paras.forEach((text, i) => {
          if (existing[i]) existing[i].textContent = text;
          else {
            const p = document.createElement('p');
            p.textContent = text;
            pContainer.appendChild(p);
          }
        });
      }
    }

    // İletişim
    const contactEmail = document.querySelector('a[href^="mailto:"]');
    if (contactEmail && co.email) {
      const safe = String(co.email).replace(/[<>"']/g, '');
      contactEmail.href = 'mailto:' + safe;
    }
    document.querySelectorAll('.footer-contact-item a[href^="mailto"]').forEach(el => {
      if (co.email) {
        const safe = String(co.email).replace(/[<>"']/g, '');
        el.href = 'mailto:' + safe;
        el.textContent = escapeHtml(co.email);
      }
    });
    document.querySelectorAll('.footer-contact-item span').forEach(el => { if (co.location) el.textContent = co.location; });

    // Topluluk linkleri
    function isSafeUrl(u) {
      if (!u || typeof u !== 'string') return false;
      const s = u.trim().toLowerCase();
      return (s.startsWith('https://') || s.startsWith('http://')) && !s.startsWith('javascript:');
    }
    document.querySelectorAll('a[href*="chat.whatsapp.com"]').forEach(el => { if (comm.whatsapp && isSafeUrl(comm.whatsapp)) el.href = comm.whatsapp; });
    document.querySelectorAll('a[href*="t.me"]').forEach(el => { if (comm.telegram && isSafeUrl(comm.telegram)) el.href = comm.telegram; });
  }

  function init() {
    loadContent();
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      try {
        firebase.firestore().collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).get()
          .then(doc => {
            if (doc.exists) {
              setContent(doc.data());
              loadContent();
            }
          })
          .catch(() => {});
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 400));
  } else {
    setTimeout(init, 400);
  }
})();
