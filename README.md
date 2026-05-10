# 🚀 MathQuest: Gamified AI Math Learning

MathQuest adalah sebuah platform edukasi generasi baru yang merevolusi cara siswa (SD, SMP, SMA) belajar matematika. Aplikasi ini menggabungkan kekuatan **Kecerdasan Buatan (Google Gemini)** dengan mekanika **Video Game** untuk menciptakan pengalaman belajar yang adiktif, adaptif, dan bebas stres.

![MathQuest Banner](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange)

---

## 🎯 Mengapa MathQuest? (Value Proposition & Uniqueness)

Dibangun berdasarkan riset dan masalah nyata (*Math Anxiety*), MathQuest dirancang untuk memenuhi 3 pilar utama:
1. **Solusi Berdampak Tinggi:** Mengubah pengalaman belajar matematika yang menakutkan menjadi permainan yang adiktif untuk anak SD-SMA. Sangat mudah di-*scale-up* ke jutaan siswa.
2. **User Experience (UX) Premium:** Jauh dari kesan kaku aplikasi sekolah. Menggunakan *Dark Mode*, neon, dan mikro-animasi untuk memberikan *vibe* layaknya game *e-sports*.
3. **Inovasi "Wow" Factor:** Perpaduan **Ekonomi Ganda** ala MMORPG dengan tutor AI yang mampu **melihat gambar soal** secara langsung.

---

## ✨ Fitur Unggulan

### 1. Sistem Ekonomi Ganda (Dual-Currency)
Untuk menyeimbangkan antara proses belajar serius dan bermain santai, MathQuest menggunakan sistem mata uang ganda:
- ⚡ **Experience (EXP):** Diperoleh murni dari membaca teori dan menyelesaikan kuis materi. Digunakan sebagai indikator *progress* dan level akademis siswa. (Tidak akan pernah berkurang).
- 💎 **Game Points:** Diperoleh dengan memenangkan *Arcade Games*. Digunakan sebagai "uang" untuk membeli/mengisi ulang Nyawa (Hearts) di Supply Station (Dashboard).

### 2. Arcade Mini-Games (Sistem Nyawa)
Pemain dibekali dengan **5 Nyawa (Hearts)**. Jika mereka salah menjawab di dalam game, nyawa akan berkurang secara sinkron dengan database. Jika nyawa habis, mereka harus berhenti bermain dan mencari *Game Points* untuk membeli nyawa baru.
- 👾 **Math Invaders:** Tembak meteor persamaan yang jatuh sebelum menghancurkan bumi.
- ⚖️ **Equation Game:** Teka-teki seret-dan-lepas (drag & drop) untuk menyeimbangkan timbangan angka.
- 🔓 **Pattern Breaker:** Pecahkan pola baris bilangan yang disembunyikan oleh sistem keamanan.

### 3. AsistenKu (AI Tutor Multimodal)
Terintegrasi langsung dengan **Google Gemini 1.5 Flash**. AsistenKu bukan sekadar kalkulator pintar, melainkan tutor virtual 24/7.
- **Dukungan Kamera & Galeri:** Siswa dapat mengambil foto PR matematika mereka secara langsung.
- **Penerjemah Markdown:** Chat mendukung teks tebal dan pemformatan rapi (otomatis di-render oleh UI).
- **Deteksi Cerdas (Paste):** Mendukung proses *copy-paste* gambar *screenshot* langsung ke dalam kotak obrolan.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) (Animasi)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Engine:** MySQL (Local/Remote)
- **Icons:** [Lucide React](https://lucide.dev/)
- **AI Integration:** `@google/genai` (Gemini API)

---

## 🚀 Cara Menjalankan Aplikasi (Instalasi)

### 1. Persiapan Kebutuhan
Pastikan komputer Anda sudah terinstal **Node.js (v18+)** dan **MySQL**.

### 2. Kloning dan Instalasi Dependensi
```bash
# Instal semua modul yang dibutuhkan
# (Gunakan --legacy-peer-deps jika terjadi konflik versi React)
npm install --legacy-peer-deps
```

### 3. Konfigurasi Environment Variables (.env)
Buat file `.env` di *root directory* dan sesuaikan kredensial berikut:
```env
# Koneksi Database
DATABASE_URL="mysql://root:@localhost:3306/math_quest"

# Google Gemini API untuk AsistenKu
GEMINI_API_KEY="AIzaSy...kunci-api-anda-di-sini"
GEMINI_MODEL="gemini-1.5-flash"
```

### 4. Sinkronisasi Database
```bash
# Dorong skema Prisma ke database MySQL Anda
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Akses aplikasi melalui browser di `http://localhost:3000`.

---

## 📂 Struktur Direktori Utama
```text
📦 math-app
 ┣ 📂 prisma            # Skema database & konfigurasi Prisma
 ┣ 📂 src
 ┃ ┣ 📂 app             # App Router Next.js (Halaman & API)
 ┃ ┃ ┣ 📂 api           # Backend Endpoints (AI, Users, Games)
 ┃ ┃ ┣ 📂 asistenku     # Halaman Chat AI Tutor
 ┃ ┃ ┣ 📂 belajar       # Modul Materi & Kuis (Penghasil EXP)
 ┃ ┃ ┣ 📂 games         # Modul Arcade Games (Penghasil Poin)
 ┃ ┃ ┣ 📂 home          # Dashboard / Pusat Komando Utama
 ┃ ┃ ┗ 📜 page.tsx      # Landing Page Pemasaran Utama
 ┃ ┣ 📂 components      # Komponen Reusable (Navbar, dll)
 ┃ ┗ 📂 lib             # Utilitas & Data Kurikulum Statis
 ┗ 📜 README.md         # Dokumentasi ini
```

---
*Dibangun dengan ❤️ untuk masa depan pendidikan matematika yang lebih baik.*
