# Self-Service Photobox PWA

Aplikasi Photobox Mandiri (*Self-Service Photobox Kiosk*) berbasis Progressive Web App (PWA) yang dirancang khusus untuk ponsel **Samsung Galaxy A35** dan printer thermal Bluetooth **VSC TM-80D (80mm)** melalui jembatan cetak lokal Android **Cleanter**.

Dilengkapi antarmuka pengunjung yang bersih, modern, ramah lansia, dan sepenuhnya berbahasa Indonesia.

---

## ✨ Fitur Utama

- **Alur Kiosk Intuitif**:
  `MULAI FOTO` ➔ `PILIH BINGKAI` ➔ `KAMERA (1:1)` ➔ `PRATINJAU FOTO` ➔ `CETAK` ➔ `SUKSES (RESET OTOMATIS)`.
- **Desain Bersih & Aksesibel**:
  - Dominan putih bersih (80%), aksen biru `#1769E0` (17%), merah `#D83B45` (3% hanya untuk peringatan/error).
  - Target sentuh besar (tinggi tombol min. 60px), teks terbaca jelas (min. 18px), tanpa animasi berlebihan.
  - Ramah bagi pengguna lansia maupun pengunjung awam tanpa bantuan teknis.
- **Kamera Depan 1:1 Square Mirroring**:
  - Live preview kamera depan dengan crop bujur sangkar (1:1) dan mirroring selfie alami.
  - Bingkai aktif langsung terlihat menutupi preview kamera secara *real-time*.
  - Hitung mundur 3 detik (3 — 2 — 1) dengan animasi sentral yang jelas.
- **Tiga Pilihan Bingkai (Dapat Diganti Admin)**:
  - *Bingkai 1 (Classic)*: Gaya minimalis & elegan.
  - *Bingkai 2 (Retro)*: Gaya film vintage berlubang sprocket.
  - *Bingkai 3 (Fun)*: Gaya ceria bertabur bintang & polkadot.
  - Admin dapat mengunggah file PNG kustom (1080x1080 transparan) yang tersimpan permanen di IndexedDB ponsel.
- **Komposisi Struk Vertikal & Optimasi Thermal**:
  - Layout vertikal: Header ➔ Foto 1:1 + Bingkai ➔ Footer (tanggal & kode sesi) ➔ Bottom feed.
  - Optimasi kecerahan & kontras khusus kertas thermal hitam-putih.
  - Pratinjau simulasi dithering thermal Floyd–Steinberg di layar.
- **Integrasi Thermal Printer VSC TM-80D (Cleanter HTTP API)**:
  - Mengirim payload JSON standar ke Cleanter Bridge (`http://localhost:9100/print`).
  - Proteksi anti-duplikasi: Mengunci tombol saat mencetak, hanya 1 lembar berhasil per sesi pengunjung.
  - Penanganan error lengkap (kertas habis, bluetooth putus, izin android) dengan foto tetap aman tersimpan.
- **100% Offline PWA & Layar Terus Aktif (WakeLock)**:
  - Seluruh aset dan script dicache oleh Service Worker Workbox (ukuran total hanya ~330 KB).
  - Berfungsi tanpa koneksi internet/Wi-Fi setelah instalasi PWA pertama kali.
  - Menggunakan Screen Wake Lock API agar layar Samsung A35 tidak mati/tidur saat mode kios aktif.
- **Panel Admin Terproteksi (Kiosk Security)**:
  - Akses tersembunyi: Tekan dan tahan judul "PHOTOBOX" selama 5 detik, lalu masukkan PIN (Default: `1234`).
  - Manajemen bingkai, kalibrasi ukuran titik (576 dots), test print, status koneksi printer, dan pengaturan branding.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Desain Sistem Kiosk Bersih)
- **Kamera**: HTML5 MediaDevices API (`getUserMedia`)
- **Pengolah Gambar**: HTML5 Canvas API
- **Penyimpanan Lokal**: IndexedDB (`idb`) & LocalStorage
- **PWA / Offline**: `vite-plugin-pwa` + Workbox
- **Printer Bridge**: Cleanter Android HTTP API (`localhost:9100`)

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Kloning & Masuk ke Direktori
```bash
cd /Users/Mr.Bob/WEBSITE/PHOTOBOX
```

### 2. Pasang Dependencies
```bash
npm install
```

### 3. Jalankan Server Development
```bash
npm run dev -- --host
```
Server dev akan aktif di `http://localhost:5173`. Bendera `--host` memungkinkan perangkat Samsung A35 dalam satu jaringan Wi-Fi untuk membuka tampilan pengembangan melalui IP laptop Anda (misal `http://192.168.1.xxx:5173`).

### 4. Build Produksi
```bash
npm run build
```
Hasil build siap produksi akan berada di folder `dist/`.

---

## ☁️ Panduan Deploy ke Vercel

Aplikasi ini sudah dilengkapi konfigurasi `vercel.json` untuk routing SPA dan caching Service Worker.

### Cara 1: Menggunakan Vercel CLI
```bash
npm i -g vercel
vercel
```
Ikuti instruksi prompt di terminal untuk menautkan akun Vercel Anda.

### Cara 2: Melalui Git & Dashboard Vercel
1. Buat repositori Git baru dan push folder ini.
2. Buka [dashboard.vercel.com](https://vercel.com/dashboard) ➔ **Add New Project**.
3. Pilih repository Photobox.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Klik **Deploy**.

> **Penting**: Karena Vercel berjalan pada HTTPS (`https://namadomain.vercel.app`), saat PWA mengakses printer lokal `http://localhost:9100` di Android Chrome, pastikan mengikuti panduan izin jaringan lokal pada `SAMSUNG_A35_SETUP.md`.

---

## 📖 Dokumentasi Lengkap

1. [Panduan Setup Samsung Galaxy A35 (Kiosk Mode)](./SAMSUNG_A35_SETUP.md)
2. [Panduan Kalibrasi Printer VSC TM-80D](./VSC_TM80D_CALIBRATION.md)
3. [Daftar Periksa Pengujian Fisik (Checklist)](./TESTING_CHECKLIST.md)
# PHOTOBOB
