# Checklist Pengujian Fisik Photobox PWA (Dual Mode)

Daftar periksa ini digunakan oleh operator sebelum membuka photobox kepada pengunjung acara atau saat melakukan uji coba di meja kerja.

---

## 1. Verifikasi Mode Operasional di Admin

Buka Panel Admin (tahan judul "PHOTOBOX" selama 5 detik, PIN: `1234`).

| Mode yang Diuji | Status Target | Komponen yang Diperiksa |
| :--- | :--- | :--- |
| **Mode 1: Desktop USB (Testing)** | [ ] Aktif | Laptop Windows/macOS, Webcam aktif, Printer iWare USB terhubung. |
| **Mode 2: Android Bluetooth (Event)** | [ ] Aktif | Samsung Galaxy A35, Kamera Depan, Cleanter aktif, VSC TM-80D Bluetooth. |

---

## 2. Pengujian Mode 1: Desktop USB (Laptop & iWare USB)

- [ ] **Webcam Laptop**: Webcam bawaan laptop aktif otomatis dalam rasio bujur sangkar 1:1 (*mirrored selfie*).
- [ ] **Hitung Mundur**: Tombol **AMBIL FOTO** memicu hitung mundur visual 3 detik (3 — 2 — 1).
- [ ] **Pratinjau Foto**: Foto tertangkap dengan benar bersama bingkai terpilih, header struk, dan footer.
- [ ] **Aksi Cetak (Browser Print)**:
  - Tekan tombol **CETAK FOTO**.
  - Dialog cetak sistem browser (Google Chrome) muncul otomatis.
  - Tidak ada panggilan network ke `localhost:9100` Cleanter saat mode desktop aktif.
- [ ] **Setelan Dialog Cetak Chrome**:
  - Destination: Printer iWare USB terpilih.
  - Paper size: 80mm Roll.
  - Margins: *None*.
  - Headers and footers: *Unchecked*.
- [ ] **Layar Konfirmasi**:
  - Setelah dialog cetak browser ditutup, muncul layar konfirmasi:
    *"Apakah struk foto berhasil keluar dari printer USB (iWare)?"*
  - Tombol **"Belum / Cetak Ulang"** mengembalikan ke pratinjau foto tanpa kehilangan foto.
  - Tombol **"Ya, Berhasil Dicetak"** memicu animasi sukses confetti dan mengunci sesi agar tidak terjadi cetak ganda.
- [ ] **Auto-Reset**: Sesi mereset otomatis dalam 8 detik setelah konfirmasi sukses.

---

## 3. Pengujian Mode 2: Android Bluetooth (Samsung A35 & VSC TM-80D)

- [ ] **Koneksi Bluetooth**: Printer VSC TM-80D terpasang (*paired*) di menu Bluetooth Android.
- [ ] **Cleanter Bridge Aktif**: Aplikasi Cleanter aktif dan menampilkan `Listening on localhost:9100`.
- [ ] **Kamera Depan**: Kamera depan ponsel aktif otomatis (`facingMode: "user"`).
- [ ] **Pengiriman Job Cetak**:
  - Tekan tombol **CETAK FOTO**.
  - Tombol langsung terkunci (*disabled*).
  - Cleanter menerima payload JSON dengan `dither: true` dan mencetak foto.
  - Status HTTP 200 langsung mengarahkan ke Layar Sukses tanpa memunculkan dialog cetak browser.
- [ ] **Simulasi Kendala**:
  - Matikan printer saat menekan cetak.
  - Aplikasi menampilkan pesan ramah: *"Printer Sedang Bermasalah. Silakan panggil petugas."*
  - Foto pengunjung tetap utuh dan tersimpan di memori.

---

## 4. Pengujian Kesiapan Offline (Mode Pesawat)

1. Aktifkan **Mode Pesawat (Airplane Mode)** pada ponsel atau matikan Wi-Fi pada laptop.
2. Tutup aplikasi Photobox dan buka kembali.
3. Lakukan seluruh alur pengambilan foto dan cetak.
4. **Hasil yang diharapkan**: Aplikasi tetap terbuka seketika, kamera/webcam berfungsi, canvas merender foto, dan printer mencetak tanpa hambatan jaringan.

---

## 5. Pengujian Fitur Kiosk & Admin

- [ ] **Screen Wake Lock**: Layar tidak meredup atau terkunci saat dibiarkan menyala selama 5 menit.
- [ ] **Inactivity Reset**: Jika pengunjung meninggalkan layar pemilihan bingkai atau kamera selama 60 detik tanpa interaksi, aplikasi otomatis kembali ke layar Welcome.
- [ ] **Penggantian Bingkai**: Di panel admin, coba unggah file PNG kustom 1080x1080 transparan. Bingkai baru langsung muncul di Layar 2 dan tetap ada meski aplikasi di-refresh.
- [ ] **Test Print**: Tombol Test Print di panel admin berhasil mencetak pola garis dan papan catur kalibrasi 576 dots sesuai mode printer yang aktif.
- [ ] **Keamanan PIN**: Memasukkan PIN selain PIN yang ditentukan akan ditolak dengan pesan peringatan yang jelas.
