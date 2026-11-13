# Self-Service Photobox PWA (Dual Mode: Desktop USB & Android Bluetooth)

Aplikasi Photobox Mandiri (*Self-Service Photobox Kiosk*) berbasis Progressive Web App (PWA) yang mendukung dua mode operasional:
1. **Mode Desktop USB (Testing)**: Dijalankan pada laptop (Windows / macOS) menggunakan webcam laptop dan printer thermal receipt **iWare** (80mm) yang terhubung via kabel USB melalui dialog cetak browser native (`window.print()`).
2. **Mode Android Bluetooth (Event)**: Dijalankan pada ponsel **Samsung Galaxy A35** dan printer thermal **VSC TM-80D (80mm)** melalui koneksi Bluetooth dan Android bridge lokal **Cleanter** (`http://localhost:9100`).

Dilengkapi antarmuka pengunjung yang bersih, modern, ramah lansia, dan sepenuhnya berbahasa Indonesia.

---

## ✨ Fitur Utama

- **Dukungan Dua Mode Printer (Modular Adapter Architecture)**:
  - **Desktop USB (Testing)**: Mencetak ke printer USB iWare 80mm menggunakan dialog sistem browser tanpa server/bridge tambahan. Dilengkapi langkah konfirmasi operator sebelum beralih ke layar sukses.
  - **Android Bluetooth (Event)**: Integrasi penuh Cleanter API lokal ke VSC TM-80D dengan dithering Floyd–Steinberg dan penanganan status bluetooth/kertas.
  - Arsitektur berbasis adapter (`PrinterAdapter`) yang siap diperluas (misal integrasi QZ Tray di masa depan).
- **Kamera Responsif**:
  - Pada laptop: Otomatis mendeteksi dan menggunakan webcam laptop bawaan maupun webcam USB eksternal.
  - Pada ponsel: Menggunakan kamera depan (*facingMode: "user"*).
  - Keduanya mempertahankan preview cermin alami (*mirrored selfie*), crop bujur sangkar 1:1, dan hitung mundur 3 detik.
- **Alur Kiosk Intuitif**:
  `MULAI FOTO` ➔ `PILIH BINGKAI` ➔ `KAMERA (1:1)` ➔ `PRATINJAU FOTO` ➔ `CETAK` ➔ `KONFIRMASI` ➔ `SUKSES (RESET OTOMATIS)`.
- **Desain Bersih & Aksesibel**:
  - Dominan putih bersih (80%), aksen biru `#1769E0` (17%), merah `#D83B45` (3% hanya untuk peringatan/error).
  - Target sentuh besar (tinggi tombol min. 60px), teks terbaca jelas (min. 18px), tanpa animasi berlebihan.
  - Ramah bagi pengguna lansia maupun pengunjung awam tanpa bantuan teknis.
- **Tiga Pilihan Bingkai (Dapat Diganti Admin)**:
  - *Bingkai 1 (Classic)*: Gaya minimalis & elegan.
  - *Bingkai 2 (Retro)*: Gaya film vintage berlubang sprocket.
  - *Bingkai 3 (Fun)*: Gaya ceria bertabur bintang & polkadot.
  - Admin dapat mengunggah file PNG kustom (1080x1080 transparan) yang tersimpan permanen di IndexedDB ponsel/laptop.
- **Komposisi Struk Vertikal & Optimasi Thermal**:
  - Layout vertikal: Header ➔ Foto 1:1 + Bingkai ➔ Footer (tanggal & kode sesi) ➔ Bottom feed.
  - Optimasi kecerahan & kontras khusus kertas thermal hitam-putih.
  - Pratinjau simulasi dithering thermal Floyd–Steinberg di layar.
- **100% Offline PWA & Layar Terus Aktif (WakeLock)**:
  - Seluruh aset dan script dicache oleh Service Worker Workbox (ukuran total hanya ~340 KB).
  - Berfungsi tanpa koneksi internet/Wi-Fi setelah instalasi PWA pertama kali.
  - Menggunakan Screen Wake Lock API agar layar tidak mati/tidur saat mode kios aktif.
- **Panel Admin Terproteksi (Kiosk Security)**:
  - Akses tersembunyi: Tekan dan tahan judul "PHOTOBOX" selama 5 detik, lalu masukkan PIN (Default: `1234`).
  - Pemilihan mode printer, manajemen bingkai, kalibrasi ukuran titik (576 dots), test print, status koneksi printer, dan pengaturan branding.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Desain Sistem Kiosk Bersih)
- **Kamera**: HTML5 MediaDevices API (`getUserMedia`)
- **Pengolah Gambar**: HTML5 Canvas API
- **Penyimpanan Lokal**: IndexedDB (`idb`) & LocalStorage
- **PWA / Offline**: `vite-plugin-pwa` + Workbox
- **Printer Adapters**:
  - `DesktopBrowserPrinter`: Native browser printing (`window.print()`)
  - `AndroidCleanterPrinter`: Cleanter Android HTTP API (`localhost:9100`)

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
Server dev akan aktif di `http://localhost:5173`.

### 4. Build Produksi
```bash
npm run build
```
Hasil build siap produksi akan berada di folder `dist/`.

---

## ☁️ Panduan Deploy ke Vercel

Aplikasi ini sudah dilengkapi konfigurasi `vercel.json` untuk routing SPA dan caching Service Worker.

### Menggunakan Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 📖 Dokumentasi Lengkap

1. [Panduan Pengujian Windows USB iWare IW D260UL (Laptop Windows)](./WINDOWS_IWARE_TESTING.md)
2. [Panduan Setup Samsung Galaxy A35 (Kiosk Mode)](./SAMSUNG_A35_SETUP.md)
3. [Panduan Kalibrasi Printer VSC TM-80D](./VSC_TM80D_CALIBRATION.md)
4. [Daftar Periksa Pengujian Fisik (Checklist)](./TESTING_CHECKLIST.md)
