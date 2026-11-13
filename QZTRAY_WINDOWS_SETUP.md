# PANDUAN LENGKAP: SETUP QZ TRAY & iWare IW D260UL DI WINDOWS (1-KLIK CETAK OTOMATIS)

Dokumen ini adalah panduan langkah demi langkah untuk mengonfigurasi **Pencetakan Otomatis 1-Klik (Silent Printing)** pada aplikasi **Photobox PWA** menggunakan printer kasir thermal **iWare IW D260UL (USB 80mm)** dan software bridge **QZ Tray** pada laptop Windows 10 atau Windows 11.

---

## 1. Arsitektur & Keunggulan Mode QZ Tray

Dalam mode **Windows — Automatic Printing (QZ Tray)**:
1. **Tanpa Dialog Browser**: Pengunjung menekan tombol **"CETAK FOTO"**, foto langsung dicetak ke printer iWare tanpa memunculkan dialog cetak Chrome (`window.print()`).
2. **Koneksi WebSocket Lokal**: Aplikasi web berkomunikasi langsung dengan software QZ Tray melalui WebSocket aman (`wss://localhost:8182` atau `ws://localhost:8181`).
3. **Penyimpanan Driver Otomatis**: Admin cukup memilih nama printer sekali di menu Admin Kiosk, selanjutnya setiap sesi pengunjung akan otomatis mencetak ke printer tersebut.
4. **Proteksi Anti-Cetak Ganda & Verifikasi Fisik**: Setelah tugas cetak terkirim, layar menampilkan konfirmasi fisik (*"Apakah foto sudah tercetak?"*). Jika kertas habis atau macet, pengunjung dapat memanggil petugas yang mengotorisasi cetak ulang melalui PIN Admin.

---

## 2. Persiapan Hardware & Software

### Spesifikasi Hardware
- **Laptop / PC**: Windows 10 atau Windows 11 (64-bit).
- **Webcam**: Webcam internal laptop atau USB webcam eksternal (rasio 1:1 square crop).
- **Printer**: **iWare IW D260UL** (Koneksi USB, ukuran kertas thermal roll 80mm).
- **Kertas Thermal**: Lebar 80mm, area cetak efektif 72mm (576 dots pada 203 DPI).

---

## 3. Langkah 1: Instalasi Driver iWare IW D260UL di Windows

1. Hubungkan kabel USB dari printer iWare IW D260UL ke port USB laptop Anda.
2. Pasang roll kertas thermal 80mm ke dalam printer dengan posisi kertas menghadap ke atas, lalu tutup cover printer hingga berbunyi klik.
3. Nyalakan tombol daya printer (pastikan lampu indikator **POWER** menyala biru/hijau konstan, tidak ada lampu **ERROR** merah).
4. Instal driver printer:
   - Jika memiliki CD/Installer iWare: jalankan installer driver (pilih interface **USB** dan model **POS-80** atau **IW D260UL**).
   - Verifikasi di Windows: Buka **Settings** ➔ **Bluetooth & devices** ➔ **Printers & scanners**. Pastikan printer muncul dengan nama misalnya `iWare IW D260UL`, `POS-80`, atau `Thermal Receipt 80`.
5. Kalibrasi Paper Size di Driver:
   - Klik kanan printer di *Printers & Scanners* ➔ **Printing Preferences**.
   - Pada tab **Paper/Quality** atau **Layout** ➔ **Advanced**, pastikan ukuran kertas diatur ke **80(72) x 297 mm** atau **Roll Paper 80 x 297 mm**.

---

## 4. Langkah 2: Instalasi & Pengaturan QZ Tray

1. **Unduh QZ Tray**:
   - Kunjungi situs resmi QZ Tray: [https://qz.io/download/](https://qz.io/download/)
   - Unduh versi terbaru untuk Windows (misalnya versi 2.2.x atau 2.3.x).
2. **Instalasi**:
   - Jalankan file installer `.exe`.
   - Ikuti wizard instalasi standar hingga selesai. QZ Tray menyertakan runtime Java (OpenJDK) secara otomatis sehingga Anda tidak perlu menginstal Java secara terpisah.
3. **Menjalankan QZ Tray**:
   - Buka **QZ Tray** dari Start Menu.
   - Periksa **System Tray** di pojok kanan bawah taskbar Windows (dekat jam).
   - Pastikan ikon **QZ Tray** berwarna **HIJAU** (menandakan service WebSocket aktif dan siap menerima perintah cetak).

---

## 5. Langkah 3: Konfigurasi di Menu Admin Photobox PWA

1. Buka aplikasi Photobox di browser (Google Chrome disarankan):
   - Jika menjalankan secara lokal: `http://localhost:5173`
   - Jika mengakses via hosting Vercel: `https://domain-anda.vercel.app`
2. Masuk ke menu Admin:
   - Klik ikon gerigi (Settings) di pojok kanan atas, atau gunakan shortcut rahasia (ketuk 5 kali logo PHOTOBOX).
   - Masukkan PIN Admin default: **`1234`**.
3. Pilih Mode Printer:
   - Pada kartu **Pilih Mode Printer & Perangkat**, pilih kartu pertama:
     **"Windows QZ Tray (Auto)"** *(Bertanda badge hijau "Rekomendasi")*.
4. Deteksi & Pilih Printer:
   - Buka tab **Status & Mode**.
   - Perhatikan badge status QZ Tray di kanan atas: harus bertuliskan **🟢 Terhubung**.
   - Klik tombol **"Muat Ulang Printer"**.
   - Dropdown akan otomatis terisi dengan seluruh printer Windows yang aktif.
   - Pilih nama printer Anda (misalnya: `iWare IW D260UL` atau `POS-80`).
5. Uji Coba Cetak (Test Print):
   - Klik tombol **"TEST PRINT (QZ TRAY)"**.
   - Printer iWare IW D260UL akan langsung memproses dan mengeluarkan struk pola kalibrasi 576 dots dengan penggaris milimeter dan pola checkerboard.
6. Simpan Pengaturan:
   - Klik tombol **"Simpan Pengaturan"** di bagian bawah.

---

## 6. Langkah 4: Mencapai 100% Silent Printing (Bebas Pop-up Konfirmasi)

QZ Tray memiliki protokol keamanan bawaan untuk mencegah website mencetak secara diam-diam tanpa izin pengguna. Untuk membuat proses cetak sepenuhnya senyap dan instan bagi pengunjung photobox, tersedia 2 metode:

### Metode A: "Remember This Decision" (Paling Cepat & Praktis — Sangat Disarankan)

1. Saat pertama kali Photobox mengirim perintah cetak ke QZ Tray, layar Windows akan menampilkan dialog pop-up keamanan QZ Tray:
   > *"localhost (atau domain Vercel Anda) wants to access printers and print documents."*
2. **PENTING**:
   - Centang kotak **`[x] Remember this decision`** (atau *"Ingat keputusan ini"*).
   - Klik tombol **`Allow`** (Izinkan).
3. Selesai! Setelah kotak tersebut dicentang, QZ Tray akan menyimpan izin permanen untuk domain photobox Anda. Semua cetakan selanjutnya akan berjalan **100% instan dan senyap**, tanpa ada dialog konfirmasi apapun lagi yang muncul.

---

### Metode B: Digital Certificate & Local Signer Endpoint (Level Enterprise / Offline Kiosk)

Jika Anda ingin menerapkan sertifikat digital RSA SHA-512 resmi:

1. Kami telah menyertakan server penandatanganan mandiri (signer) di dalam project:
   ```bash
   npm run signer
   ```
   *(Atau jalankan: `node scripts/qz-signer.js`)*
2. Script akan otomatis membuat pasangan kunci RSA 2048-bit dan menjalankan service di port `8190`:
   - Endpoint Sertifikat Publik: `http://localhost:8190/cert`
   - Endpoint Signature SHA-512 : `http://localhost:8190/sign`
3. Di menu Admin Photobox ➔ Tab **Pengaturan Cetak** ➔ Bagian **Bebas Dialog Konfirmasi (Silent Printing)**:
   - Masukkan `http://localhost:8190/cert` pada kolom **Digital Certificate URL**.
   - Masukkan `http://localhost:8190/sign` pada kolom **Signature Endpoint URL**.
   - Klik **Simpan Pengaturan**.
4. Di QZ Tray Windows:
   - Klik kanan ikon hijau QZ Tray di system tray ➔ pilih **Site Manager**.
   - Masukkan sertifikat root publik yang dibuat di folder `.certs/photobox-cert.pem`.

---

## 7. Panduan Alur Pengunjung (Visitor Flow)

Setelah mode QZ Tray aktif, alur pengguna menjadi sangat mulus:

```
[ WELCOME SCREEN ] ➔ Tekan "MULAI FOTO"
        ↓
[ PILIH BINGKAI ] ➔ Pilih 1 dari 3 Bingkai (Classic, Retro, Fun)
        ↓
[ KAMERA WEBCAM ] ➔ Hitung mundur 3 detik ➔ Jepret Foto 1:1
        ↓
[ PREVIEW FOTO ] ➔ Opsi "FOTO ULANG" atau "CETAK FOTO"
        ↓ (Pengunjung tekan "CETAK FOTO")
[ PRINTING SCREEN ] ➔ Mengirim gambar ke iWare IW D260UL via QZ Tray (Otomatis & Senyap)
        ↓
[ VERIFIKASI FISIK ] ➔ "Apakah foto sudah tercetak?"
     ├── YA, SUDAH TERCETAK ➔ [ SUCCESS SCREEN ] ➔ Konfeti ➔ Auto-reset ke Welcome
     └── BELUM, PANGGIL PETUGAS ➔ Kios terkunci dari cetak ganda ➔ Memeriksa kertas/kabel ➔ PIN Admin untuk cetak ulang
```

---

## 8. Kalibrasi Ukuran Kertas & Kualitas Thermal

Jika hasil cetak struk iWare terlalu panjang, terlalu gelap, atau terpotong:

| Parameter | Nilai Standar | Fungsi & Cara Penyesuaian |
|---|---|---|
| **Lebar Kertas Fisik** | `80 mm` | Ukuran fisik roll kertas iWare IW D260UL. |
| **Lebar Cetak Efektif** | `72 mm` | Area cetak aktual kepala thermal (printhead). |
| **Lebar Raster Titik** | `576 dots` | Standar resolusi 203 DPI untuk 72mm (72 / 25.4 × 203 ≈ 576 dots). |
| **Tinggi Halaman Driver** | `120 mm` | Panjang struk foto. Jika terpotong di bawah, naikkan ke `130-140 mm`. |
| **Margin Dokumen** | `0 mm` | Menghindari driver Windows mengeluarkan kertas kosong tambahan (blank feed). |
| **Kecerahan (Brightness)** | `1.05x` | Menaikkan nilai jika foto terlalu hitam/pekat. |
| **Kontras (Contrast)** | `1.25x` | Menjaga detail garis wajah dan bingkai tetap tajam pada kertas thermal. |
| **Auto Feed & Cut** | `Aktif` | Mengirim perintah ESC/POS untuk memotong kertas struk secara otomatis. |

---

## 9. Troubleshooting & Solusi Kendala Umum

### 1. Status QZ Tray bertuliskan "Terputus" atau error "Unable to establish connection"
- **Penyebab**: Aplikasi QZ Tray belum dibuka di Windows atau port diblokir firewall.
- **Solusi**:
  1. Buka Start Menu di Windows, cari dan jalankan **QZ Tray**.
  2. Perhatikan ikon QZ Tray di system tray taskbar (harus berwarna hijau).
  3. Di menu Admin Photobox, klik tombol **"Cek Status QZ Tray"** atau **"Muat Ulang Printer"**.

### 2. Printer "iWare IW D260UL" tidak muncul di dropdown printer terdeteksi
- **Penyebab**: Kabel USB longgar atau driver printer belum terpasang di Windows.
- **Solusi**:
  1. Cabut dan tancapkan kembali kabel USB iWare ke port laptop yang berbeda.
  2. Buka Windows **Settings ➔ Printers & scanners**, pastikan printer terdaftar dan berstatus *Idle* (bukan *Offline*).
  3. Kembali ke Admin Photobox dan klik **"Muat Ulang Printer"**.
  4. Anda juga dapat mengetikkan nama printer secara manual di kolom *Input Manual*.

### 3. Mengakses dari Vercel HTTPS (`https://...`) tapi QZ Tray di `localhost` diblokir (Mixed Content)
- **Penyebab**: Browser modern memblokir koneksi dari HTTPS ke WebSocket non-aman (`ws://`).
- **Solusi**:
  1. QZ Tray secara bawaan mendukung Secure WebSocket (`wss://localhost:8182`).
  2. Pastikan opsi **Gunakan Secure WSS** aktif di pengaturan lanjutan (sudah otomatis aktif jika URL browser adalah HTTPS).
  3. Buka tab baru di browser dan buka: `https://localhost:8182`. Jika muncul peringatan *"Your connection is not private"*, klik **Advanced ➔ Proceed to localhost (unsafe)** sekali saja untuk mengizinkan sertifikat lokal QZ Tray.

### 4. Kertas keluar tapi tidak ada gambar (polos putih)
- **Penyebab**: Roll kertas thermal terpasang terbalik.
- **Solusi**: Buka penutup printer iWare, balik posisi gulungan kertas sehingga sisi peka panas menghadap ke arah thermal head printer.

### 5. Hasil cetak bergaris putih atau terlalu buram
- **Penyebab**: Printhead kotor atau kontras terlalu rendah.
- **Solusi**:
  1. Bersihkan kepala thermal iWare menggunakan cotton bud yang dibasahi sedikit alkohol isopropil 70%.
  2. Di menu Admin Photobox ➔ Pengaturan Cetak, naikkan **Kontras** ke `1.35x` atau `1.40x`.

---

## 10. Checklist Verifikasi Siap Pakai (Go-Live)

Sebelum photobox digunakan oleh pengunjung acara, pastikan:

- [ ] Printer iWare IW D260UL terhubung kabel USB dan roll kertas terisi penuh.
- [ ] QZ Tray berjalan di Windows dengan ikon **hijau** di system tray.
- [ ] Di Admin Photobox: Mode dipilih **"Windows QZ Tray (Auto)"**.
- [ ] Nama printer `iWare IW D260UL` terpilih di dropdown dan status **🟢 Terhubung**.
- [ ] Tombol **"TEST PRINT (QZ TRAY)"** berhasil mencetak struk secara senyap.
- [ ] Izin pop-up QZ Tray telah dicentang **"Remember this decision"**.
- [ ] Jalankan 1 sesi simulasi dari Welcome ➔ Frame ➔ Kamera ➔ Cetak ➔ Verifikasi Fisik ➔ Success.
- [ ] Kios siap melayani pengunjung dengan pengalaman 1-klik cetak instan!
