# Panduan Pengujian Printer Thermal USB iWare IW D260UL di Windows 10/11

Panduan ini menjelaskan langkah demi langkah untuk menguji dan menjalankan aplikasi **Photobox** pada laptop Windows menggunakan webcam laptop dan printer thermal receipt **iWare IW D260UL** melalui koneksi USB.

---

## 1. Spesifikasi Hardware & Konfigurasi

- **Sistem Operasi**: Windows 10 atau Windows 11 (64-bit).
- **Model Printer**: iWare IW D260UL (Thermal Receipt Printer).
- **Koneksi**: Kabel USB (USB Type-B to Type-A).
- **Kertas Thermal**: Roll Thermal 80mm (lebar fisik 79.5 ± 0.5 mm).
- **Area Cetak Efektif**: 72 mm (576 dots pada resolusi 203 DPI).
- **Bahasa Perintah**: ESC/POS didukung hardware.
- **Kamera**: Webcam bawaan laptop (*integrated webcam*) atau USB webcam eksternal.
- **Mekanisme Cetak**: Driver Windows native melalui `window.print()`. Tidak memerlukan Cleanter bridge atau koneksi Bluetooth di Windows.

---

## 2. Instalasi Driver Printer iWare IW D260UL di Windows

1. Hubungkan kabel USB dari printer **iWare IW D260UL** ke port USB laptop Anda.
2. Pasang gulungan kertas thermal 80mm ke dalam kompartemen printer (sisi kertas mengilap menghadap ke kepala cetak thermal) dan tutup penutup hingga berbunyi *klik*.
3. Nyalakan tombol saklar daya printer di bagian samping/belakang.
4. Pasang driver resmi iWare:
   - Unduh atau buka installer driver seri **iWare POS-80** atau **POS80 Driver Setup**.
   - Jalankan file installer sebagai Administrator.
   - Pilih OS: **Windows 10 / Windows 11**.
   - Pilih Port: **USB001** (atau port USB virtual yang terdeteksi).
   - Klik **Install / Selesai**.
5. Buka **Windows Settings** ➔ **Bluetooth & devices** ➔ **Printers & scanners**.
6. Pastikan printer iWare terdaftar (biasanya bernama `POS-80`, `iWare IW-D260UL`, atau `POS80 Series`).
7. Klik printer tersebut ➔ Klik **Set as default** (Jadikan printer utama).

---

## 3. Konfigurasi Ukuran Kertas 80mm di Driver Windows

1. Di menu **Printers & scanners**, klik printer iWare IW D260UL ➔ Pilih **Printing preferences**.
2. Pada tab **Paper / Quality** atau **Page Setup**:
   - Pilih Paper Size: **80 x 297 mm** atau **Roll Paper 80 x 3276 mm** (bukan Letter atau A4).
   - Jika tersedia opsi *Paper Type*, pilih **Receipt** / **Continuous**.
3. Pada tab **Device Settings** (atau **Advance**):
   - Pengaturan Pemotong (*Cutter*): Pilih **Cut at end of job** atau **Partial cut** (iWare IW D260UL memiliki fitur pemotong kertas otomatis).
4. Klik **Apply** lalu **OK**.
5. Uji cetak driver: Pada jendela printer, klik tombol **Print a test page**. Printer harus mengeluarkan selembar kertas uji Windows.

---

## 4. Menjalankan Photobox di Laptop Windows

### A. Menjalankan Server Lokal
Buka terminal (Command Prompt / PowerShell) di laptop Anda:
```cmd
cd /Users/Mr.Bob/WEBSITE/PHOTOBOX
npm install
npm run dev
```
Buka browser **Google Chrome** dan akses:
`http://localhost:5173`

*(Atau buka langsung alamat domain deployment Vercel Anda jika sudah dideploy).*

---

## 5. Pengaturan Izin Kamera & Webcam di Chrome

1. Saat halaman Photobox pertama kali dibuka, Chrome akan menampilkan permintaan:
   *`"localhost:5173 wants to use your camera"`*.
2. Klik **Allow / Izinkan**.
3. Jika izin tidak muncul atau terblokir:
   - Klik ikon gembok / slider di sebelah kiri bilah URL Chrome.
   - Pastikan toggle **Camera** dalam posisi **On / Allow**.
   - Muat ulang (*refresh*) halaman.

---

## 6. Mengaktifkan Mode Windows USB di Admin Settings

1. Pada layar pembuka ("Yuk, Foto Dulu!"), **tekan dan tahan judul "PHOTOBOX" selama 5 detik**.
2. Masukkan PIN Admin: `1234`.
3. Pada kartu **Pilih Mode Printer & Perangkat** di bagian atas:
   - Pilih: **Mode 1: Windows USB — Testing**.
4. Masuk ke tab **Pengaturan Cetak**:
   - Lebar Kertas Fisik: **80 mm**.
   - Lebar Cetak Efektif: **72 mm** (576 dots).
   - Tinggi Halaman Driver: **120 mm** (dapat diubah sesuai selera).
   - Margin Dokumen Cetak: **0 mm**.
   - Kecerahan: `1.05x`, Kontras: `1.25x`.
5. Ketuk tombol **`TEST PRINT`**:
   - Dialog cetak Chrome akan terbuka menampilkan struk kalibrasi.
   - Ikuti langkah konfigurasi dialog Chrome di bawah ini.
6. Ketuk **Simpan Pengaturan** di bawah.

---

## 7. Konfigurasi Dialog Cetak Google Chrome (Satu Kali Setup)

Saat dialog cetak Chrome muncul pertama kali:

| Menu Dialog Print Chrome | Pengaturan yang Wajib Dipilih | Catatan |
| :--- | :--- | :--- |
| **Destination** | **iWare IW D260UL** (atau POS-80) | Pastikan bukan *Save as PDF*. |
| **Pages** | `All` | Struk tercetak sebagai 1 lembar. |
| **Color** | `Black and white` atau `Color` | Head thermal otomatis membakar titik hitam. |
| **Paper size** | **`80mm`** atau **`Roll Paper 80 x 297mm`** | **Penting**: Jangan biarkan A4. |
| **Margins** | **`None`** | Mencegah pemotongan margin di tepi kertas. |
| **Scale** | **`100`** (Default) | Menjaga ketajaman raster 576 dots. |
| **Headers and footers** | **HILANGKAN CENTANG (Uncheck)** | Mencegah tanggal, URL web, dan halaman tercetak di struk. |

*Chrome di Windows akan otomatis mengingat setelan ini untuk seluruh proses cetak berikutnya.*

---

## 8. Alur Pengujian Pengunjung (*Visitor Journey*)

1. **Layar Welcome**: Klik tombol biru **MULAI FOTO →**.
2. **Layar Pilih Bingkai**: Pilih salah satu dari 3 bingkai (Classic, Retro, Fun), lalu klik **LANJUT FOTO →**.
3. **Layar Kamera**:
   - Webcam laptop menampilkan pratinjau wajah dengan rasio bujur sangkar 1:1 (*mirrored selfie*).
   - Bingkai foto aktif terlihat langsung menutupi wajah.
   - Klik **AMBIL FOTO** ➔ Muncul hitung mundur 3 detik (3 — 2 — 1) ➔ Foto ditangkap otomatis.
4. **Layar Pratinjau**:
   - Tampil struk vertikal: Header ➔ Foto 1:1 Berbingkai ➔ Footer (tanggal & kode sesi).
   - Klik tombol biru dominan: **CETAK FOTO**.
5. **Dialog Cetak Browser**:
   - Dialog print Chrome terbuka menampilkan struk 80mm.
   - Klik tombol **Print** (atau tekan `Enter`).
6. **Layar Konfirmasi Cetak Fisik**:
   - Karena browser tidak bisa membaca sensor fisik kertas printer, aplikasi menampilkan pertanyaan:
     **"Apakah foto sudah tercetak?"**
   - **Jika berhasil**: Klik tombol **`YA, SUDAH TERCETAK`** ➔ Layar Sukses muncul dengan animasi confetti ➔ Kembali ke Welcome dalam 8 detik.
   - **Jika gagal/kertas habis**: Klik tombol **`BELUM, PANGGIL PETUGAS`** ➔ Foto tetap aman di memori, proteksi anti-cetak ganda mengunci tombol. Petugas memasukkan PIN (`1234`) untuk memeriksa printer dan mengotorisasi cetak ulang.

---

## 9. Mode Chrome Kiosk Printing (`--kiosk-printing`)

Untuk pengalaman kios mandiri di mana struk mencetak **langsung tanpa menampilkan dialog konfirmasi print browser**:

1. Buat pintasan (*shortcut*) Google Chrome di Desktop Windows:
   - Klik kanan ikon Chrome di Desktop ➔ Pilih **Properties**.
   - Pada kolom **Target**, tambahkan parameter berikut di ujung path (beri spasi):
   ```cmd
   --kiosk-printing "http://localhost:5173"
   ```
   *Contoh lengkap kolom Target:*
   `"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing "http://localhost:5173"`
2. Pastikan printer **iWare IW D260UL** telah disetel sebagai **Default Printer** di Windows.
3. Buka Chrome melalui shortcut tersebut.
4. Saat tombol **CETAK FOTO** ditekan di Photobox, Chrome akan mengirimkan data langsung ke printer iWare tanpa pop-up dialog print!
5. Pengunjung cukup menekan **YA, SUDAH TERCETAK** saat struk keluar dari mulut printer.

---

## 10. Pengujian Offline (Tanpa Internet)

1. Putuskan koneksi Wi-Fi atau cabut kabel LAN di laptop Windows.
2. Buka Chrome dan akses `http://localhost:5173` (atau alamat PWA terinstal).
3. Seluruh alur (Webcam, kanvas pemotongan 1:1, bingkai PNG di IndexedDB, dan pencetakan Windows USB) berfungsi 100% lancar tanpa akses internet.

---

## 11. Pemecahan Masalah (Troubleshooting)

### A. Kertas Keluar Kosong (Blank Page Kedua)
- **Penyebab**: Margin pada dialog print belum diatur ke *None*, atau driver mendeteksi overflow tinggi halaman.
- **Solusi**: Di dialog cetak Chrome, pastikan **Margins: None**. Di panel Admin Photobox ➔ Pengaturan Cetak, pastikan **Margin Dokumen Cetak: 0 mm**.

### B. Gambar Terpotong di Sisi Kanan
- **Penyebab**: Lebar raster kanvas melebihi kapasitas print head (72mm).
- **Solusi**: Di panel Admin Photobox ➔ Pengaturan Cetak, pastikan **Lebar Cetak Efektif: 72 mm** dan **Lebar Raster: 576 dots**.

### C. Hasil Cetak Terlalu Gelap atau Terlalu Terang
- **Solusi**: Buka Admin ➔ Pengaturan Cetak ➔ Geser slider **Kecerahan (Brightness)** dan **Kontras (Contrast)**. Nilai rekomendasi awal untuk iWare IW D260UL adalah Kecerahan `1.05x` dan Kontras `1.25x`.
