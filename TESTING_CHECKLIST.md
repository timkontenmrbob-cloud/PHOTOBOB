# Checklist Pengujian Fisik Photobox PWA

Daftar periksa ini digunakan oleh operator sebelum membuka photobox kepada pengunjung acara.

---

## 1. Verifikasi Pra-Operasional (Pre-Flight Check)

| No | Komponen Pengujian | Metode Verifikasi | Status |
| :-: | :--- | :--- | :-: |
| 1 | **Daya & Baterai Ponsel** | Baterai Samsung Galaxy A35 terisi minimal 80% atau terhubung ke charger. | [ ] |
| 2 | **Daya & Kertas Printer** | Baterai VSC TM-80D terisi penuh, roll kertas 80mm baru terpasang rapi. | [ ] |
| 3 | **Koneksi Bluetooth** | Printer terpasang (*paired*) di menu Bluetooth Android. | [ ] |
| 4 | **Cleanter Bridge Aktif** | Aplikasi Cleanter aktif dan menampilkan `Listening on localhost:9100`. | [ ] |
| 5 | **Aplikasi Terinstal (PWA)** | Photobox dibuka melalui ikon di layar utama (*standalone mode*). | [ ] |
| 6 | **Kunci Aplikasi (Pin App)** | Fitur Sematkan Aplikasi (*Pin App*) aktif mengunci bilah navigasi. | [ ] |

---

## 2. Pengujian Alur Pengunjung (Visitor Flow)

### A. Layar 1 — Welcome
- [ ] Teks judul "PHOTOBOX", judul "Yuk, Foto Dulu!", dan instruksi tampil jelas.
- [ ] Tombol biru besar **MULAI FOTO →** responsif saat disentuh.
- [ ] Menahan judul selama 5 detik memunculkan modal PIN admin.

### B. Layar 2 — Pilih Bingkai
- [ ] Tampil tepat 3 kartu bingkai: Bingkai 1, Bingkai 2, Bingkai 3.
- [ ] Kartu yang dipilih memiliki bingkai biru tebal dan tanda centang putih.
- [ ] Thumbnail pratinjau bingkai terlihat jelas dan proporsional.
- [ ] Tombol **LANJUT FOTO →** membawa ke layar kamera.
- [ ] Tombol **Kembali ke Awal** mengembalikan ke Layar 1.

### C. Layar 3 — Kamera Depan & Hitung Mundur
- [ ] Kamera depan aktif otomatis tanpa jeda panjang.
- [ ] Tampilan kamera berformat bujur sangkar (1:1) pas di tengah layar.
- [ ] Kamera mencerminkan gerakan secara natural (*mirrored selfie*).
- [ ] Bingkai yang dipilih terlihat menutupi pratinjau video secara *real-time*.
- [ ] Tombol **AMBIL FOTO** memulai hitung mundur visual 3 detik ("3 — 2 — 1").
- [ ] Tombol tidak bisa ditekan ganda saat hitung mundur berjalan.
- [ ] Flash putih halus muncul saat foto ditangkap, lalu berpindah ke pratinjau.

### D. Layar 4 — Pratinjau Foto
- [ ] Foto hasil tangkapan berformat 1:1, tidak gepeng atau melar.
- [ ] Arah foto konsisten dengan pratinjau cermin yang dilihat pengunjung.
- [ ] Header struk berada di atas foto, footer (tanggal & kode sesi) berada di bawah foto.
- [ ] Tombol **FOTO LAGI** membuang foto lama dan kembali ke kamera secara mulus.
- [ ] Tombol **CETAK FOTO** dominan biru, responsif dan langsung mengunci aksi cetak.

### E. Layar 5 — Proses Cetak & Penanganan Kendala
- [ ] Ikon printer dan teks "Foto Sedang Dicetak" tampil saat proses berlangsung.
- [ ] Layar terkunci (tidak bisa ditekan bolak-balik atau double-print).
- [ ] **Simulasi Kendala (Uji Matikan Printer)**:
  - Matikan printer saat menekan cetak.
  - Aplikasi menampilkan pesan ramah: "Printer Sedang Bermasalah. Silakan panggil petugas."
  - Foto pengunjung tetap utuh dan tersimpan di memori.
  - Tersedia tombol "Coba Cetak Lagi" dan "Kembali ke Foto".

### F. Layar 6 — Sukses & Reset Otomatis
- [ ] Muncul ikon centang biru dan animasi confetti perayaan.
- [ ] Teks "Foto Berhasil Dicetak!" dan instruksi mengambil foto.
- [ ] Teks hitung mundur "Kembali ke awal dalam 8 detik" menghitung mundur dengan benar.
- [ ] Setelah 8 detik, aplikasi kembali ke Layar Welcome secara otomatis.
- [ ] Sesi pengunjung baru bersih total (foto lama dan data sementara terhapus).

---

## 3. Pengujian Kesiapan Offline (Mode Pesawat)

1. Aktifkan **Mode Pesawat (Airplane Mode)** pada Samsung Galaxy A35 (matikan Wi-Fi dan data seluler).
2. Tutup aplikasi Photobox dan buka kembali melalui ikon beranda.
3. Lakukan seluruh alur pengambilan foto dan cetak.
4. **Hasil yang diharapkan**: Aplikasi tetap terbuka seketika, kamera depan berfungsi, canvas merender foto, dan printer mencetak tanpa hambatan jaringan.

---

## 4. Pengujian Fitur Kiosk & Admin

- [ ] **Screen Wake Lock**: Layar tidak meredup atau terkunci saat dibiarkan menyala selama 5 menit.
- [ ] **Inactivity Reset**: Jika pengunjung meninggalkan layar pemilihan bingkai atau kamera selama 60 detik tanpa interaksi, aplikasi otomatis kembali ke layar Welcome.
- [ ] **Penggantian Bingkai**: Di panel admin, coba unggah file PNG kustom 1080x1080 transparan. Bingkai baru harus langsung muncul di Layar 2 dan tetap ada meski aplikasi di-refresh.
- [ ] **Test Print**: Tombol Test Print di panel admin berhasil mencetak pola garis dan papan catur kalibrasi 576 dots.
- [ ] **Keamanan PIN**: Memasukkan PIN selain PIN yang ditentukan akan ditolak dengan pesan peringatan yang jelas.
