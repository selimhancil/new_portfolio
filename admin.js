/* Admin Panel - Site İçerik Yönetimi */

const STORAGE_KEY = 'sh_site_content';
const FIRESTORE_COLLECTION = 'site_content';
const FIRESTORE_DOC = 'portfolio';

// Sadece bu e-postalar admin paneline erişebilir
const ADMIN_EMAILS = ['admin@demo.com', 'selimhancil@gmail.com'];

let siteContent = getDefaultContent();

function getDefaultContent() {
  return {
    general: {
      name: 'Selim Hancıl',
      tagline: 'AI & Automation Developer | Founder @ ARTplus Global Yazılım Ajansı',
      ctaTitle: 'Bir fikriniz mi var?',
      ctaSubtitle: 'Birlikte hayata geçirelim.'
    },
    about: {
      name: 'Selim Han Çil',
      title: 'AI & Automation Developer | Founder @ ARTplus Global',
      bio: 'Gerçek dünya problemlerini teknolojiyle çözmeye odaklanan bir AI & Automation Developer.|ARTplus Global Yazılım Ajansı\'nın kurucusuyum.|Teknik uzmanlığımı girişimcilik vizyonu ile birleştirerek uzun vadeli ölçeklenebilir sistemler tasarlıyorum.',
      experience: [
        { role: 'Founder & AI Developer', place: 'ARTplus Global', date: '2024 - Devam', desc: 'AI otomasyon, web ve mobil uygulamalar geliştiriyorum.' },
        { role: 'Full Stack Developer', place: 'Freelance', date: '2023 - 2024', desc: 'TypeScript, C# ve Python ile web ve mobil uygulamalar.' }
      ],
      education: [
        { degree: 'Bilgisayar Mühendisliği', place: 'Üniversite', date: '2021 - 2025', desc: 'Yazılım, algoritma, yapay zeka ve mobil uygulama geliştirme.' }
      ]
    },
    projects: {
      heroDesc: 'GitHub hesabımdaki tüm açık kaynak projelerim. Gerçek zamanlı olarak GitHub API\'den yükleniyor.'
    },
    blog: {
      heroDesc: 'Yazılım, yapay zeka ve teknoloji üzerine teknik yazılar, rehberler ve karşılaştırmalar.',
      posts: [
        { title: 'Web Geliştirmeye Yeni Başlayanlar İçin Kapsamlı Rehber', date: '4 Mart 2026', readCount: '2.4K', link: '#', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop' },
        { title: 'React mı Vue mu? 2026 Frontend Framework Karşılaştırması', date: '28 Şubat 2026', readCount: '1.8K', link: '#', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop' },
        { title: 'Yapay Zeka ile Yazılım Geliştirme', date: '20 Şubat 2026', readCount: '3.1K', link: '#', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop' }
      ]
    },
    contact: {
      email: 'selimhancil@gmail.com',
      location: 'Texas, USA',
      heroDesc: 'Yeni projeler, iş birlikleri veya sadece sohbet etmek için benimle iletişime geçebilirsiniz.'
    },
    community: {
      whatsapp: 'https://chat.whatsapp.com/GRUP_LINKI',
      telegram: 'https://t.me/selimhancil',
      videos: [
        { id: 'VIDEO_ID', title: 'Video Başlığı 1', platform: 'youtube' },
        { id: 'VIDEO_ID_2', title: 'Video Başlığı 2', platform: 'youtube' },
        { id: 'REEL_ID', title: 'Instagram Reel', platform: 'instagram' }
      ]
    }
  };
}

function loadContent() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      siteContent = { ...getDefaultContent(), ...parsed };
      if (parsed.about?.experience) siteContent.about.experience = parsed.about.experience;
      if (parsed.about?.education) siteContent.about.education = parsed.about.education;
      if (parsed.blog?.posts) siteContent.blog.posts = parsed.blog.posts;
      if (parsed.community?.videos) siteContent.community.videos = parsed.community.videos;
    } catch (e) {
      console.warn('Admin: Could not parse saved content');
    }
  }
  const db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;
  if (db) {
    db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          Object.assign(siteContent, data);
          renderAll();
        }
      })
      .catch(() => {});
  }
}

function saveContent() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(siteContent));
  const db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;
  const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
  if (db && user) {
    db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).set(siteContent, { merge: true })
      .catch(e => console.warn('Firestore save error:', e));
  }
  showToast('✅ İçerik kaydedildi!');
}

function showToast(msg) {
  const el = document.getElementById('adminToast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// Section switching
document.querySelectorAll('.admin-nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.dataset.section;
    document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    const panel = document.getElementById('section-' + section);
    if (panel) panel.classList.add('active');
    const titles = {
      general: 'Genel Ayarlar',
      about: 'Hakkımda',
      projects: 'Projeler',
      blog: 'Blog',
      contact: 'İletişim',
      community: 'Topluluk'
    };
    const h2 = document.getElementById('adminSectionTitle');
    if (h2) h2.textContent = titles[section] || '';
  });
});

// Populate forms from siteContent
function renderAll() {
  const g = siteContent.general || {};
  setVal('general_name', g.name);
  setVal('general_tagline', g.tagline);
  setVal('general_ctaTitle', g.ctaTitle);
  setVal('general_ctaSubtitle', g.ctaSubtitle);

  const a = siteContent.about || {};
  setVal('about_name', a.name);
  setVal('about_title', a.title);
  setVal('about_bio', (a.bio || '').replace(/\|/g, '\n'));

  renderExperience();
  renderEducation();

  const p = siteContent.projects || {};
  setVal('projects_heroDesc', p.heroDesc);

  const b = siteContent.blog || {};
  setVal('blog_heroDesc', b.heroDesc);
  renderBlogPosts();

  const c = siteContent.contact || {};
  setVal('contact_email', c.email);
  setVal('contact_location', c.location);
  setVal('contact_heroDesc', c.heroDesc);

  const co = siteContent.community || {};
  setVal('community_whatsapp', co.whatsapp);
  setVal('community_telegram', co.telegram);
  renderVideos();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function renderExperience() {
  const list = document.getElementById('about_experience_list');
  if (!list) return;
  const arr = siteContent.about?.experience || [];
  list.innerHTML = arr.map((item, i) => `
    <div class="admin-item-row" data-type="experience" data-i="${i}">
      <input type="text" placeholder="Pozisyon" value="${esc(item.role)}">
      <input type="text" placeholder="Şirket" value="${esc(item.place)}">
      <input type="text" placeholder="Tarih" value="${esc(item.date)}">
      <input type="text" placeholder="Açıklama" value="${esc(item.desc)}">
      <button type="button" class="admin-item-remove">Sil</button>
    </div>
  `).join('');
  list.querySelectorAll('.admin-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.admin-item-row');
      const i = parseInt(row.dataset.i);
      siteContent.about.experience.splice(i, 1);
      renderExperience();
    });
  });
}

function renderEducation() {
  const list = document.getElementById('about_education_list');
  if (!list) return;
  const arr = siteContent.about?.education || [];
  list.innerHTML = arr.map((item, i) => `
    <div class="admin-item-row" data-type="education" data-i="${i}">
      <input type="text" placeholder="Bölüm" value="${esc(item.degree)}">
      <input type="text" placeholder="Kurum" value="${esc(item.place)}">
      <input type="text" placeholder="Tarih" value="${esc(item.date)}">
      <input type="text" placeholder="Açıklama" value="${esc(item.desc)}">
      <button type="button" class="admin-item-remove">Sil</button>
    </div>
  `).join('');
  list.querySelectorAll('.admin-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.admin-item-row');
      const i = parseInt(row.dataset.i);
      siteContent.about.education.splice(i, 1);
      renderEducation();
    });
  });
}

function renderBlogPosts() {
  const list = document.getElementById('blog_posts_list');
  if (!list) return;
  const arr = siteContent.blog?.posts || [];
  list.innerHTML = arr.map((item, i) => `
    <div class="admin-item-row" data-type="blog" data-i="${i}">
      <input type="text" placeholder="Başlık" value="${esc(item.title)}" style="flex:2">
      <input type="text" placeholder="Tarih" value="${esc(item.date)}">
      <input type="text" placeholder="Okuma (örn 2.4K)" value="${esc(item.readCount)}">
      <input type="text" placeholder="Link" value="${esc(item.link)}">
      <button type="button" class="admin-item-remove">Sil</button>
    </div>
  `).join('');
  list.querySelectorAll('.admin-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.admin-item-row');
      const i = parseInt(row.dataset.i);
      siteContent.blog.posts.splice(i, 1);
      renderBlogPosts();
    });
  });
}

function renderVideos() {
  const list = document.getElementById('community_videos_list');
  if (!list) return;
  const arr = siteContent.community?.videos || [];
  list.innerHTML = arr.map((item, i) => `
    <div class="admin-item-row" data-type="video" data-i="${i}">
      <input type="text" placeholder="Video ID / Reel ID" value="${esc(item.id)}">
      <input type="text" placeholder="Başlık" value="${esc(item.title)}">
      <select style="padding:10px 14px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:inherit;">
        <option value="youtube" ${item.platform === 'youtube' ? 'selected' : ''}>YouTube</option>
        <option value="instagram" ${item.platform === 'instagram' ? 'selected' : ''}>Instagram</option>
      </select>
      <button type="button" class="admin-item-remove">Sil</button>
    </div>
  `).join('');
  list.querySelectorAll('.admin-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.admin-item-row');
      const i = parseInt(row.dataset.i);
      siteContent.community.videos.splice(i, 1);
      renderVideos();
    });
  });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Add buttons
document.getElementById('addExperience')?.addEventListener('click', () => {
  siteContent.about.experience.push({ role: '', place: '', date: '', desc: '' });
  renderExperience();
});

document.getElementById('addEducation')?.addEventListener('click', () => {
  siteContent.about.education.push({ degree: '', place: '', date: '', desc: '' });
  renderEducation();
});

document.getElementById('addBlogPost')?.addEventListener('click', () => {
  siteContent.blog.posts.push({ title: '', date: '', readCount: '', link: '#', image: '' });
  renderBlogPosts();
});

document.getElementById('addVideo')?.addEventListener('click', () => {
  if (!siteContent.community.videos) siteContent.community.videos = [];
  siteContent.community.videos.push({ id: '', title: '', platform: 'youtube' });
  renderVideos();
});

// Save - collect from form and save
function collectAndSave() {
  siteContent.general = {
    name: document.getElementById('general_name')?.value || '',
    tagline: document.getElementById('general_tagline')?.value || '',
    ctaTitle: document.getElementById('general_ctaTitle')?.value || '',
    ctaSubtitle: document.getElementById('general_ctaSubtitle')?.value || ''
  };

  siteContent.about = siteContent.about || {};
  siteContent.about.name = document.getElementById('about_name')?.value || '';
  siteContent.about.title = document.getElementById('about_title')?.value || '';
  const bio = document.getElementById('about_bio')?.value || '';
  siteContent.about.bio = bio.replace(/\n/g, '|');

  siteContent.about.experience = [];
  document.querySelectorAll('#about_experience_list .admin-item-row').forEach((row, i) => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 4) {
      siteContent.about.experience.push({
        role: inputs[0].value,
        place: inputs[1].value,
        date: inputs[2].value,
        desc: inputs[3].value
      });
    }
  });

  siteContent.about.education = [];
  document.querySelectorAll('#about_education_list .admin-item-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 4) {
      siteContent.about.education.push({
        degree: inputs[0].value,
        place: inputs[1].value,
        date: inputs[2].value,
        desc: inputs[3].value
      });
    }
  });

  siteContent.projects = { heroDesc: document.getElementById('projects_heroDesc')?.value || '' };

  siteContent.blog = siteContent.blog || {};
  siteContent.blog.heroDesc = document.getElementById('blog_heroDesc')?.value || '';
  siteContent.blog.posts = [];
  document.querySelectorAll('#blog_posts_list .admin-item-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 4) {
      siteContent.blog.posts.push({
        title: inputs[0].value,
        date: inputs[1].value,
        readCount: inputs[2].value,
        link: inputs[3].value || '#'
      });
    }
  });

  siteContent.contact = {
    email: document.getElementById('contact_email')?.value || '',
    location: document.getElementById('contact_location')?.value || '',
    heroDesc: document.getElementById('contact_heroDesc')?.value || ''
  };

  siteContent.community = siteContent.community || {};
  siteContent.community.whatsapp = document.getElementById('community_whatsapp')?.value || '';
  siteContent.community.telegram = document.getElementById('community_telegram')?.value || '';
  siteContent.community.videos = [];
  document.querySelectorAll('#community_videos_list .admin-item-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const sel = row.querySelector('select');
    if (inputs.length >= 2) {
      siteContent.community.videos.push({
        id: inputs[0].value,
        title: inputs[1].value,
        platform: sel?.value || 'youtube'
      });
    }
  });

  saveContent();
}

document.getElementById('adminSaveBtn')?.addEventListener('click', collectAndSave);
document.getElementById('adminSaveBtn').style.display = 'inline-flex';

// Logout
document.getElementById('adminLogout')?.addEventListener('click', () => {
  if (typeof auth !== 'undefined' && auth) {
    auth.signOut().then(() => {
      window.location.href = 'auth.html';
    }).catch(() => {
      localStorage.removeItem('sh_currentUser');
      window.location.href = 'auth.html';
    });
  } else {
    localStorage.removeItem('sh_currentUser');
    window.location.href = 'auth.html';
  }
});

// Init: wait for auth
function initAdmin() {
  const user = currentUser || JSON.parse(localStorage.getItem('sh_currentUser') || 'null');
  if (!user) {
    window.location.href = 'auth.html?redirect=admin.html';
    return;
  }
  const email = (user.email || '').toLowerCase();
  const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === email);
  if (!isAdmin) {
    alert('Bu sayfaya erişim yetkiniz yok.');
    window.location.href = 'index.html';
    return;
  }
  loadContent();
  renderAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initAdmin, 300));
} else {
  setTimeout(initAdmin, 300);
}
