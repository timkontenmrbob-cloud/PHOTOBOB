# Panduan Konfigurasi Samsung Galaxy A35 (Kiosk Mode)

Dokumen ini menjelaskan langkah-langkah menyiapkan ponsel **Samsung Galaxy A35** sebagai unit photobox mandiri (*self-service kiosk*) menggunakan printer thermal **VSC TM-80D**.

---

## 1. Persiapan Perangkat Keras & Bluetooth

1. **Nyalakan Printer VSC TM-80D** dan pastikan kertas thermal 80mm sudah terpasang rapi dengan posisi gulungan menghadap ke atas.
2. Di Samsung Galaxy A35, buka **Pengaturan (Settings)** ➔ **Koneksi (Connections)** ➔ **Bluetooth**.
3. Pindai (*Scan*) perangkat Bluetooth di sekitar.
4. Temukan printer (biasanya bernama `VSC TM-80D`, `RPP02N`, atau `Bluetooth Printer`).
5. Pasangkan (*Pair*). Jika diminta PIN pairing, masukkan `0000` atau `1234`.
6. Pastikan printer berada pada daftar *Paired Devices*.

---

## 2. Instalasi & Konfigurasi Cleanter Bridge

Cleanter adalah aplikasi Android yang menyediakan HTTP Bridge lokal di port `9100`.

1. Unduh dan pasang aplikasi **Cleanter** dari Google Play Store:
   [Cleanter on Play Store](https://play.google.com/store/apps/details?id=id.cleancode.cleanter)
2. Buka aplikasi Cleanter.
3. Berikan izin yang diminta:
   - **Izin Bluetooth / Nearby Devices** (Pilih *Allow / Izinkan sepanjang waktu*).
   - **Izin Notifikasi / Background Service** (Agar Cleanter tidak dimatikan oleh sistem baterai Samsung).
4. Di dalam Cleanter:
   - Pilih printer default: **VSC TM-80D**.
   - Tipe koneksi: **Bluetooth**.
   - Lebar kertas: **80mm**.
   - Aktifkan toggle **Service Running / HTTP API Active**.
   - Periksa bahwa status Cleanter menampilkan `Listening on http://localhost:9100`.
5. Nonaktifkan penghemat baterai untuk Cleanter:
   - Buka **Pengaturan Android** ➔ **Aplikasi** ➔ **Cleanter** ➔ **Baterai** ➔ Pilih **Tidak Dibatasi (Unrestricted)**.

---

## 3. Konfigurasi Google Chrome & Izin Local Network

Aplikasi Photobox berjalan di HTTPS (Vercel), sedangkan Cleanter berjalan di `http://localhost:9100`. Browser modern memiliki perlindungan *Private Network Access*.

1. Buka browser **Google Chrome** di Samsung A35.
2. Ketik URL berikut di bilah alamat:
   ```
   chrome://flags/#block-insecure-private-network-requests
   ```
   - Ubah setelan menjadi **Disabled**.
3. Ketik URL berikut:
   ```
   chrome://flags/#private-network-access-respect-preflight-results
   ```
   - Ubah setelan menjadi **Disabled** jika diperlukan.
4. Tekan tombol **Relaunch** di bagian bawah Chrome untuk memuat ulang browser.
5. Akses domain Photobox Anda di Vercel:
   `https://[domain-anda].vercel.app`
6. Ketika browser meminta izin kamera depan, pilih **Izinkan saat aplikasi digunakan (While using the app)**.

---

## 4. Instalasi Aplikasi PWA (Standalone Kiosk)

1. Saat halaman web Photobox terbuka di Chrome, ketuk menu titik tiga (⋮) di kanan atas.
2. Pilih **Tambahkan ke Layar Utama (Add to Home screen)** atau **Instal Aplikasi (Install App)**.
3. Ketuk **Instal**.
4. Ikon aplikasi **Photobox** akan muncul di beranda ponsel.
5. Buka aplikasi melalui ikon beranda tersebut. Aplikasi akan berjalan dalam mode layar penuh (*standalone*) tanpa bilah alamat browser.

---

## 5. Pengaturan Layar & Kunci Kiosk (Samsung One UI)

Agar pengunjung tidak bisa keluar dari aplikasi photobox atau mematikan layar:

### A. Aktifkan Pin App (Sematkan Aplikasi)
1. Buka **Pengaturan** ➔ **Keamanan dan Privasi** ➔ **Pengaturan Keamanan Lainnya**.
2. Cari dan aktifkan fitur **Sematkan Aplikasi (Pin App)**.
3. Buka aplikasi PWA Photobox, buka layar *Recent Apps* (geser dari bawah ke atas), ketuk ikon Photobox di atas jendela, lalu pilih **Sematkan aplikasi ini (Pin this app)**.
4. Dengan ini, tombol *Home* dan *Back* dinonaktifkan, sehingga pengunjung terkunci di dalam aplikasi. Untuk keluar, gunakan gestur tombol bersamaan dengan PIN pengunci layar Anda.

### B. Pertahankan Layar Tetap Aktif
- Aplikasi Photobox sudah memiliki fitur terintegrasi **Screen Wake Lock API** yang menjaga layar tetap menyala.
- Di pengaturan ponsel:
  - Buka **Pengaturan** ➔ **Tampilan (Display)**.
  - Atur **Batas waktu layar (Screen timeout)** ke durasi maksimal (10 menit) sebagai lapisan cadangan.
  - Aktifkan **Sensitivitas Sentuhan (Touch Sensitivity)** jika menggunakan pelindung layar (*tempered glass*).

---

## 6. Uji Coba Kesiapan Pertama Kali

1. Di layar pembuka aplikasi Photobox, tekan dan tahan tulisan **PHOTOBOX** di atas selama 5 detik.
2. Masukkan PIN Admin: `1234`.
3. Di tab **Status & Koneksi**:
   - Ketuk tombol **Otorisasi & Cek Koneksi Printer**.
   - Pastikan muncul tanda centang hijau: `Cleanter Bridge Terhubung! Printer: VSC TM-80D`.
4. Buka tab **Pengaturan Cetak** ➔ Ketuk **TEST PRINT**.
5. Printer VSC TM-80D akan mengeluarkan struk uji kalibrasi.
6. Ketuk **Tutup** untuk kembali ke mode kios pengunjung. Unit siap digunakan!
