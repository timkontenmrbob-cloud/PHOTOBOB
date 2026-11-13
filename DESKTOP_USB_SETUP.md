# Panduan Konfigurasi Desktop USB Printer Testing Mode (iWare & Laptop)

Panduan ini menjelaskan cara menguji dan menjalankan aplikasi **Photobox** pada laptop (Windows atau macOS) menggunakan webcam laptop dan printer thermal receipt **iWare** yang terhubung via kabel USB.

---

## 1. Ikhtisar Mode Desktop USB

Mode ini dirancang khusus untuk keperluan pengujian (*testing*), demonstrasi, dan kalibrasi di meja kerja tanpa memerlukan ponsel Android atau aplikasi Cleanter.

- **Perangkat**: Laptop Windows 10/11 atau Apple macOS.
- **Kamera**: Webcam bawaan laptop (*integrated webcam*) atau webcam eksternal USB.
- **Printer**: Printer thermal receipt iWare (atau printer thermal 80mm ESC/POS lainnya) via USB.
- **Mekanisme Cetak**: Menggunakan dialog cetak native sistem browser (`window.print()`).
- **Verifikasi Fisik**: Dilengkapi langkah konfirmasi operator setelah dialog cetak tertutup untuk memastikan struk fisik benar-benar keluar sebelum beralih ke layar Sukses.

---

## 2. Pemasangan & Persiapan Driver Printer iWare USB

### A. Pada Laptop Windows (10 / 11)
1. Hubungkan printer iWare ke port USB laptop dan nyalakan saklar daya printer.
2. Pasang driver resmi iWare (biasanya driver seri **POS-80** atau **iWare 80mm Thermal Printer**).
3. Buka **Windows Settings** ➔ **Bluetooth & Devices** ➔ **Printers & scanners**.
4. Pastikan printer iWare terdeteksi (misal bernama `POS-80`, `iWare IW-800`, atau `Generic / Text Only`).
5. Masuk ke **Printing Preferences**:
   - Tab **Paper/Quality** atau **Advanced**:
   - Atur ukuran kertas (*Paper Size*) ke: **80 x 297 mm** atau **Roll Paper 80 x 3276 mm**.
   - Atur pemotongan kertas (*Cutter Setting*): *Cut at the end of job* atau *Partial cut* (jika model mendukung auto-cutter).

### B. Pada Laptop macOS (Apple Silicon / Intel)
1. Hubungkan kabel USB printer iWare (gunakan dongle USB-C jika diperlukan) dan nyalakan printer.
2. Buka **System Settings** ➔ **Printers & Scanners**.
3. Klik **Add Printer, Scanner, or Fax...** (+).
4. Pilih printer USB yang terdeteksi.
5. Pada pilihan *Use*, jika driver iWare macOS tidak tersedia, Anda dapat memilih:
   - **Generic PostScript Printer** atau driver **CUPS Thermal Printer 80mm**.
6. Simpan konfigurasi printer.

---

## 3. Konfigurasi Dialog Cetak Google Chrome

Saat pertama kali menekan tombol **CETAK FOTO** atau **TEST PRINT**, dialog cetak Google Chrome akan muncul. Lakukan setelan berikut satu kali (Chrome akan mengingat setelan ini untuk pencetakan berikutnya):

| Pengaturan Chrome Print | Nilai yang Harus Dipilih | Penjelasan |
| :--- | :--- | :--- |
| **Destination (Tujuan)** | Pilih Printer iWare Anda | Pastikan bukan *Save as PDF*. |
| **Pages (Halaman)** | `All` | Struk hanya berupa 1 halaman. |
| **Color (Warna)** | `Black and white` atau `Color` | Printer thermal otomatis mencetak hitam-putih. |
| **Paper Size (Ukuran Kertas)** | `80mm` / `Roll Paper 80 x 297mm` | Jangan pilih A4 atau Letter! |
| **Margins (Batas)** | **`None`** atau **`Minimum`** | **Sangat Penting** agar gambar tidak terpotong di samping. |
| **Scale (Skala)** | **`100`** (Default) | Hindari mengecilkan skala agar foto tetap tajam. |
| **Headers and footers** | **HILANGKAN CENTANG (Uncheck)** | **Penting**: Mencegah tanggal, URL, dan nomor halaman tercetak di struk. |

---

## 4. Mengaktifkan Mode Desktop USB di Photobox

1. Buka aplikasi Photobox di browser laptop (misal `http://localhost:5173` atau domain Vercel Anda).
2. Di layar pembuka, **tekan dan tahan judul "PHOTOBOX" selama 5 detik**.
3. Masukkan PIN Admin: `1234`.
4. Pada kartu **Pilih Mode Operasional Printer** di bagian atas:
   - Pilih: **Mode 1: Desktop USB (Testing)**.
5. Buka tab **Pengaturan Cetak**:
   - Pastikan **Lebar Kertas Roll Desktop** bernilai **`80 mm`**.
   - Margin Desktop: **`0 mm`**.
   - Raster Dot Width: **`576 dots`** (standar kalibrasi 80mm).
6. Ketuk tombol **`TEST PRINT`**:
   - Dialog cetak Chrome akan terbuka menampilkan pola kalibrasi.
   - Periksa pratinjau di layar Chrome, pastikan gambar struk pas di kertas 80mm tanpa spasi kosong berlebih.
   - Klik tombol **Print** pada dialog browser.
7. Ketuk **Simpan Pengaturan** dan tutup panel admin.

---

## 5. Alur Pengujian Pengunjung di Desktop

```
[ Welcome ] ➔ [ Pilih Bingkai ] ➔ [ Webcam ] ➔ [ Ambil Foto (1:1) ] ➔ [ Pratinjau ] ➔ [ Dialog Cetak Browser ] ➔ [ Konfirmasi Hasil Cetak ] ➔ [ Sukses ]
```

1. **Webcam**: Webcam laptop otomatis aktif. Posisi wajah Anda akan ditampilkan dalam format cermin (*mirrored selfie*) bujur sangkar 1:1.
2. **Ambil Foto**: Tekan **AMBIL FOTO** ➔ Hitung mundur 3 detik (3 — 2 — 1) ➔ Foto ditangkap.
3. **Pratinjau**: Periksa hasil foto berbingkai dengan header dan footer struk.
4. **Cetak**:
   - Tekan tombol **CETAK FOTO**.
   - Dialog cetak sistem browser akan muncul otomatis.
   - Tekan tombol **Print** di dialog browser.
5. **Konfirmasi Hasil Cetak**:
   - Karena `window.print()` tidak dapat mendeteksi apakah printer memiliki kertas atau mencetak fisik, aplikasi menampilkan layar:
     *"Konfirmasi Hasil Cetak: Apakah struk foto berhasil keluar dari printer USB (iWare)?"*
   - Ketuk **Ya, Berhasil Dicetak** ➔ Menuju layar Sukses (confetti + reset otomatis 8 detik).
   - Ketuk **Belum / Cetak Ulang** ➔ Kembali ke pratinjau foto untuk mencetak ulang tanpa kehilangan foto.

---

## 6. Kalibrasi & Pemecahan Masalah

### A. Gambar Struk Terlalu Kecil atau Geser ke Kiri
- Di dialog print Chrome, pastikan **Margins** dipilih **None**.
- Pada pilihan Paper size, pastikan memilih ukuran gulungan kertas 80mm, bukan A4.

### B. Dialog Print Tidak Muncul
- Periksa bilah alamat Chrome di kanan atas. Jika terdapat ikon pop-up terblokir (*Pop-up blocked*), klik ikon tersebut dan pilih **Always allow pop-ups from this site** (Selalu izinkan pop-up).

### C. Kertas Keluar Terus-menerus (Feed Berlebihan)
- Pada pengaturan driver iWare di Windows (Printing Preferences), ubah tipe kertas dari *Continuous* ke *Receipt / Cut at end of page*.

### D. Beralih Kembali ke Mode Android Bluetooth
- Kapan pun Anda siap menggunakan ponsel Samsung Galaxy A35 dan printer Bluetooth VSC TM-80D di lokasi acara, cukup buka Panel Admin ➔ Ganti mode ke **Mode 2: Android Bluetooth (Event)** ➔ Ketuk **Simpan Pengaturan**.
