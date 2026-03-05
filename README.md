🚀 Selim Han ÇİL — Kişisel Portfolio Sitesi

Modern, responsive ve güvenli bir kişisel portfolio sitesi. Terminal animasyonu, admin paneli, Firebase entegrasyonu ve mini oyunlar içerir.

![Ana Sayfa](<img width="1680" height="747" alt="Ekran Resmi 2026-03-05 18 27 01" src="https://github.com/user-attachments/assets/b985c59b-5e5f-4229-a5a0-12eb69883248" />


---


## ✨ Özellikler

| Özellik | Açıklama |
|--------|----------|
| 🖥️ **Terminal Hero** | Animasyonlu terminal ile tanıtım |
| 📁 **Projeler** | GitHub API ile gerçek zamanlı repo listesi |
| 📝 **Blog** | Yazılar bölümü |
| 👤 **Hakkımda** | Deneyim ve eğitim bilgileri |
| 📧 **İletişim** | İletişim formu |
| 💬 **Topluluk** | WhatsApp & Telegram grupları, öneri videoları |
| 🎮 **Eğlence** | Araba yarışı, hafıza oyunu, yazma hızı testi vb. |
| 🔐 **Giriş Sistemi** | Firebase Auth (e-posta, Google, GitHub) |
| ⚙️ **Admin Panel** | Site içeriğini düzenleme (Firestore + localStorage) |
| ⌨️ **Command Palette** | `Cmd/Ctrl + K` ile hızlı gezinme |

---

## 🛠️ Teknolojiler

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Firebase (Auth, Firestore)
- **Hosting:** Statik site (GitHub Pages, Netlify, Vercel vb.)

---

## 📸 Ekran Görüntüleri

<!-- Görselleri eklemek için screenshots klasörü oluşturup aşağıdaki yolları kullanabilirsin -->

### Ana Sayfa
![Ana Sayfa Hero](<img width="1680" height="747" alt="Ekran Resmi 2026-03-05 18 26 41" src="https://github.com/user-attachments/assets/97f05f00-05e6-4d05-b13a-c8d8a851fddd" />


### Projeler
![Projeler Sayfası]<img width="1680" height="798" alt="Ekran Resmi 2026-03-05 18 27 27" src="https://github.com/user-attachments/assets/028f2502-b21d-411a-8313-7da4c4a1e27f" />


### Admin Panel
![Admin Panel] <img width="1680" height="780" alt="Ekran Resmi 2026-03-05 18 28 10" src="https://github.com/user-attachments/assets/b9062da9-8920-43e8-b519-88fb960cf00c" />


### Topluluk
![Topluluk Sayfası] <img width="1680" height="780" alt="Ekran Resmi 2026-03-05 18 28 28" src="https://github.com/user-attachments/assets/16422454-578b-4f2f-8349-acc5c9263ac9" />


---

## 🚀 Kurulum

1. **Repoyu klonla**
   ```bash
   git clone https://github.com/selimhancil/new_portfolio.git
   cd new_portfolio
   ```

2. **Firebase yapılandırması** (opsiyonel)
   - [Firebase Console](https://console.firebase.google.com) üzerinden proje oluştur
   - Auth (Email/Password, Google, GitHub) etkinleştir
   - Firestore veritabanı oluştur
   - `auth.js` içindeki `firebaseConfig` değerlerini güncelle

3. **Yerel sunucu ile çalıştır**
   ```bash
   # Python ile
   python -m http.server 8000

   # veya Node.js ile (npx)
   npx serve .
   ```
   Tarayıcıda `http://localhost:8000` adresine git.

---

## 📁 Proje Yapısı

```
new_portfolio/
├── index.html          # Ana sayfa
├── about.html          # Hakkımda
├── projects.html       # Projeler (GitHub API)
├── blog.html           # Blog
├── contact.html        # İletişim
├── community.html      # Topluluk
├── fun.html            # Eğlence / Oyunlar
├── auth.html           # Giriş / Kayıt
├── profile.html        # Kullanıcı profili
├── admin.html          # Admin panel
├── typing-test.html    # Yazma hızı testi
├── style.css           # Ana stiller
├── script.js           # Ana script (particles, GitHub API, terminal)
├── auth.js             # Firebase Auth & Firestore
├── admin.js            # Admin panel mantığı
├── content-loader.js   # Admin içeriğini sayfalara yükleme
├── features.js         # Command Palette, gizli konsol
├── games.js            # Eğlence sayfası oyunları
├── car-racing.js       # Araba yarışı oyunu
├── images/             # Proje görselleri
└── screenshots/        # README için ekran görüntüleri (oluşturacaksın)
```

---

## 📷 Görselleri Eklemek

README'deki görselleri güncellemek için:

1. Proje kökünde `screenshots` klasörü oluştur:
   ```bash
   mkdir screenshots
   ```

2. Ekran görüntülerini ekle (örnek isimler):
   - `home.png` — Ana sayfa
   - `projects.png` — Projeler sayfası
   - `admin.png` — Admin panel
   - `community.png` — Topluluk sayfası

3. Veya farklı yollar kullan:
   ```markdown
   ![Açıklama](screenshots/your-image.png)
   ![Alternatif yol](docs/preview.gif)
   ```

---

## 📄 Lisans

MIT License — İstediğin gibi kullanabilir ve değiştirebilirsin.

---

**Selim Han Çil** · [GitHub](https://github.com/selimhancil) · [Instagram](https://instagram.com/selimhancil)
