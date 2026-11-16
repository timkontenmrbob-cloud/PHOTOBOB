# Daftar Copywriting PHOTOBOX — Untuk Revisi

Daftar teks saat ini dari source website, termasuk halaman pengunjung, Admin, pesan sistem, aksesibilitas, dan teks cetak bawaan. Tidak termasuk komentar kode, log developer, nama berkas/endpoint, isi respons error dari browser/perangkat di luar aplikasi, atau tulisan yang sudah menjadi bagian gambar frame. Label teknis yang benar-benar tampil di Admin tetap dicantumkan.

**Cara edit:** isi kolom **Bahasa revisi** atau kirim revisi menggunakan ID, misalnya `CW001 → teks pengganti`. Kosong berarti tetap. Teks di dalam `{...}` adalah data otomatis (tanggal, hitungan, nama printer, dan sebagainya); pertahankan maknanya saat mengedit. Nama layanan/model printer dan ukuran teknis sebaiknya tetap akurat.

**Tampilan download yang baru:** dua preview, masing-masing tombol **Download** tepat di bawah foto, masing-masing mengunduh satu JPG; tanpa tombol download gabungan atau ZIP. Tulisan B&W/full color dipertahankan sebagai deskripsi aksesibilitas untuk pembaca layar, tidak sebagai label tombol yang terlihat.

Nomor ID hanya untuk dokumen ini. Teks yang sama di lokasi berbeda dapat tercantum lagi karena konteksnya berbeda. Untuk perubahan bahasa publik, mulai dari bagian **01**.

## 01 — Halaman pengunjung

### src/screens/WelcomeScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW001 | Yuk, Foto Dulu! |  | Tampilan · 20 |
| CW002 | Pilih bingkai, ambil foto, lalu cetak kenanganmu. |  | Tampilan · 25 |
| CW003 | ✨ Gratis 1 Lembar Cetak Thermal |  | Tampilan · 30 |
| CW004 | MULAI FOTO |  | Tampilan · 38 |

### src/screens/FrameSelectionScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW005 | Pilih Bingkai Foto |  | Tampilan · 22 |
| CW006 | Pilih satu bingkai yang kamu suka. |  | Tampilan · 25 |
| CW007 | Foto 1:1 |  | Tampilan · 49 |
| CW008 | Polaroid putih, ruang tulisan di bawah |  | Tampilan / teks dinamis · 70 |
| CW009 | Gaya klasik retro film |  | Tampilan / teks dinamis · 72 |
| CW010 | Gaya ceria bintang & polkadot |  | Tampilan / teks dinamis · 73 |
| CW011 | LANJUT FOTO |  | Tampilan · 97 |
| CW012 | Kembali ke Awal |  | Tampilan · 105 |

### src/screens/CameraScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW013 | Kamera depan tidak dapat diakses. |  | Status / pesan · 42 |
| CW014 | Gagal mengambil foto. Silakan coba lagi. |  | Status / pesan · 87 |
| CW015 | Siap-Siap Foto! |  | Tampilan · 101 |
| CW016 | Lihat kamera, lalu tekan tombol di bawah. |  | Tampilan · 104 |
| CW017 | Frame Overlay |  | Aksesibilitas / petunjuk · 123 |
| CW018 | Menyiapkan kamera... |  | Tampilan · 132 |
| CW019 | Kamera Bermasalah |  | Tampilan · 140 |
| CW020 | Coba Lagi |  | Tampilan · 142 |
| CW021 | Frame: |  | Tampilan · 169 |
| CW022 | MENGAMBIL... ({countdown}) |  | Tampilan / teks dinamis · 181 |
| CW023 | AMBIL FOTO |  | Tampilan / teks dinamis · 181 |
| CW024 | Ganti Bingkai |  | Tampilan · 184 |

### src/screens/PhotoPreviewScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW025 | Foto Kamu Sudah Jadi! |  | Tampilan · 24 |
| CW026 | Sudah suka dengan hasilnya? |  | Tampilan · 27 |
| CW027 | Menyiapkan cetakan... |  | Tampilan · 38 |
| CW028 | Hasil Foto Photobox |  | Aksesibilitas / petunjuk · 47 |
| CW029 | CETAK FOTO |  | Tampilan · 66 |
| CW030 | FOTO LAGI |  | Tampilan · 76 |

### src/screens/PrintingScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW031 | Bantuan Petugas |  | Tampilan · 55 |
| CW032 | Fotomu tetap tersimpan aman. Silakan panggil petugas photobox untuk memeriksa printer. |  | Tampilan · 58 |
| CW033 | Proteksi Anti-Cetak Ganda Aktif: |  | Tampilan · 63 |
| CW034 | • Cetak otomatis dinonaktifkan demi mencegah pemborosan kertas. |  | Tampilan · 64 |
| CW035 | • Hanya petugas resmi yang dapat mengotorisasi cetak ulang setelah mengecek kabel & kertas printer. |  | Tampilan · 65 |
| CW036 | Akses Petugas Diberikan |  | Tampilan · 70 |
| CW037 | Silakan periksa printer |  | Tampilan · 75 |
| CW038 | iWare IW D260UL |  | Tampilan / teks dinamis · 78 |
| CW039 | VSC TM-80D |  | Tampilan / teks dinamis · 81 |
| CW040 | (lampu error, ketersediaan roll kertas, dan kabel data), lalu tentukan tindakan: |  | Tampilan · 83 |
| CW041 | Apakah foto sudah tercetak? |  | Tampilan · 97 |
| CW042 | Periksa mulut printer |  | Tampilan · 101 |
| CW043 | iWare USB |  | Tampilan / teks dinamis · 106 |
| CW044 | . Apakah struk foto telah keluar? |  | Tampilan · 109 |
| CW045 | Petunjuk: |  | Tampilan · 113 |
| CW046 | • Tekan "YA, SUDAH TERCETAK" jika kertas struk sudah keluar rapi. |  | Tampilan · 114 |
| CW047 | • Tekan "BELUM, PANGGIL PETUGAS" jika kertas belum keluar atau terjadi kendala. |  | Tampilan · 115 |
| CW048 | Foto Sedang Dicetak |  | Tampilan · 130 |
| CW049 | Mohon tunggu sebentar, ya. Printer sedang memproses fotomu. |  | Tampilan · 133 |
| CW050 | Mengirim cetak otomatis ke {settings.qzPrinterName \|\| 'iWare IW D260UL'} via QZ Tray... |  | Tampilan / teks dinamis · 142 |
| CW051 | Membuka dialog cetak iWare USB... |  | Tampilan / teks dinamis · 144 |
| CW052 | Mengirim data ke VSC TM-80D... |  | Tampilan / teks dinamis · 145 |
| CW053 | Printer Sedang Bermasalah |  | Tampilan · 158 |
| CW054 | Silakan panggil petugas untuk membantu. |  | Tampilan · 161 |
| CW055 | Keterangan Kendala: |  | Tampilan · 167 |
| CW056 | Printer tidak merespons. |  | Tampilan / teks dinamis · 171 |
| CW057 | Saran: {session.printErrorFix} |  | Tampilan · 174 |
| CW058 | Fotomu tetap tersimpan aman dan tidak hilang. |  | Tampilan · 180 |
| CW059 | Otorisasi Petugas (PIN) |  | Tampilan · 191 |
| CW060 | Cetak Ulang Struk |  | Tampilan · 201 |
| CW061 | Kembali ke Layar Foto |  | Tampilan · 213 |
| CW062 | YA, SUDAH TERCETAK |  | Tampilan · 230 |
| CW063 | BELUM, PANGGIL PETUGAS |  | Tampilan · 239 |
| CW064 | Coba Cetak Lagi |  | Tampilan · 249 |
| CW065 | Kembali ke Foto |  | Tampilan · 257 |

### src/screens/SuccessScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW066 | Foto Berhasil Dicetak! |  | Tampilan · 52 |
| CW067 | Terima kasih! Jangan lupa ambil fotomu di mulut printer ya. |  | Tampilan · 57 |
| CW068 | ⏱️ Kembali ke awal dalam {secondsLeft} detik |  | Tampilan · 64 |
| CW069 | SELESAI |  | Tampilan · 72 |

### src/components/PhotoSharePanel.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW070 | Download QR belum aktif. Petugas perlu menghubungkan penyimpanan di Admin. |  | Tampilan · 33 |
| CW071 | Simpan fotomu di HP |  | Tampilan · 36 |
| CW072 | QR download foto sesi ini |  | Aksesibilitas / petunjuk · 37 |
| CW073 | Menyiapkan dua versi foto... |  | Tampilan / teks dinamis · 37 |
| CW074 | Buka halaman foto |  | Tampilan · 38 |
| CW075 | Hitam putih & full color · Tersedia 30 hari |  | Tampilan · 39 |
| CW076 | Upload tertunda. Kamu bisa scan sekarang; foto tersedia setelah perangkat photobox kembali online. |  | Tampilan · 40 |
| CW077 | Coba upload lagi |  | Tampilan · 40 |
| CW078 | Siap diunduh sampai {tanggal}. |  | Tampilan · 41 |

### src/screens/DownloadScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW079 | Link foto tidak valid. Scan ulang QR dari photobox. |  | Status / pesan · 18 |
| CW080 | Gagal membuka foto. |  | Status / pesan · 27 |
| CW081 | Download gagal. |  | Status / pesan · 42 |
| CW082 | Foto Kenanganmu |  | Tampilan · 46 |
| CW083 | Memeriksa foto... |  | Tampilan · 47 |
| CW084 | Fotomu masih menunggu upload dari photobox. Halaman ini akan memeriksa otomatis. Simpan link ini untuk dibuka lagi nanti. |  | Tampilan · 48 |
| CW085 | Masa download 30 hari sudah berakhir. Foto ini sudah tidak tersedia. |  | Tampilan · 49 |
| CW086 | Dua versi dari momen yang sama, siap kamu simpan. |  | Tampilan · 51 |
| CW087 | Foto hitam putih |  | Aksesibilitas / petunjuk · 55 |
| CW088 | Foto full color |  | Aksesibilitas / petunjuk · 55 |
| CW089 | Download foto hitam putih |  | Aksesibilitas / petunjuk · 57 |
| CW090 | Download foto full color |  | Aksesibilitas / petunjuk · 57 |
| CW091 | Menyiapkan... |  | Tampilan / teks dinamis · 58 |
| CW092 | Download |  | Tampilan / teks dinamis · 58 |
| CW093 | Tersedia sampai {tanggal}. Simpan kedua file sebelum batas waktu. |  | Tampilan · 64 |
| CW094 | Coba lagi |  | Tampilan · 67 |

### src/components/Header.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW095 | Tahan 5 detik untuk Pengaturan Petugas |  | Aksesibilitas / petunjuk · 43 |
| CW096 | PHOTOBOX |  | Tampilan / teks dinamis · 46 |

### src/components/AdminPinModal.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW097 | Akses Petugas |  | Tampilan · 43 |
| CW098 | Masukkan 4 digit PIN admin untuk membuka pengaturan kiosk. (Default: 1234) |  | Tampilan · 53 |
| CW099 | PIN salah. Silakan coba lagi. |  | Tampilan · 78 |
| CW100 | Masuk |  | Tampilan · 84 |

## 02 — Admin dan pengaturan

### src/components/PhotoSharingSettings.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW101 | Download Foto via QR |  | Tampilan · 16 |
| CW102 | Dua file JPG: hitam putih dan full color. Masa download 30 hari sejak foto dibuat. Antrean upload: {pending} sesi. |  | Tampilan · 17 |
| CW103 | Penyimpanan Supabase |  | Tampilan · 18 |
| CW104 | VITE_SUPABASE_URL belum diatur saat build |  | Placeholder · 18 |
| CW105 | Alamat website publik |  | Tampilan · 19 |
| CW106 | https://photobox.vercel.app |  | Placeholder · 19 |
| CW107 | Kunci upload kiosk |  | Tampilan · 20 |
| CW108 | Gunakan kunci khusus kiosk dari setup. Jangan masukkan service role key Supabase. Jangan hapus data browser saat masih ada antrean. |  | Tampilan · 21 |
| CW109 | Simpan & Cek Koneksi |  | Tampilan · 22 |
| CW110 | Atur VITE_SUPABASE_URL lalu deploy ulang website. |  | Status / pesan · 24 |
| CW111 | Terhubung. Pengaturan disimpan; antrean akan diunggah. |  | Status / pesan · 27 |
| CW112 | Koneksi gagal. |  | Status / pesan · 29 |

### src/screens/AdminSettingsScreen.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW113 | Memeriksa... |  | Status / pesan · 58 |
| CW114 | Memeriksa cache offline... |  | Status / pesan · 59 |
| CW115 | QZ Tray terhubung (Port 8181 WSS). {list.length} printer Windows terdeteksi. |  | Status / pesan · 90 |
| CW116 | QZ Tray aktif terhubung, namun tidak ada printer terpasang di Windows. |  | Status / pesan · 101 |
| CW117 | Gagal terhubung ke QZ Tray: {msg} |  | Status / pesan · 106 |
| CW118 | QZ Tray belum berjalan di Windows ({msg}) |  | Status / pesan · 107 |
| CW119 | QZ Tray siap mencetak otomatis. |  | Status / pesan · 125 |
| CW120 | QZ Tray tidak aktif. |  | Status / pesan · 128 |
| CW121 | Windows Browser Print siap untuk printer iWare IW D260UL. |  | Status / pesan · 132 |
| CW122 | Pencetakan browser tidak didukung. |  | Status / pesan · 134 |
| CW123 | Printer Bluetooth |  | Status / pesan · 142 |
| CW124 | Cleanter bridge tidak merespons di localhost:9100 |  | Status / pesan · 146 |
| CW125 | Kamera depan ponsel aktif dan siap digunakan |  | Status / pesan · 163 |
| CW126 | Webcam laptop aktif dan siap digunakan |  | Status / pesan · 164 |
| CW127 | Izin kamera belum aktif: {err.message} |  | Status / pesan · 168 |
| CW128 | MediaDevices tidak didukung oleh browser ini |  | Status / pesan · 171 |
| CW129 | PWA siap offline ({keys.length} cache aktif) |  | Status / pesan · 178 |
| CW130 | Cache offline terdaftar, siap disimpan saat pertama digunakan |  | Status / pesan · 180 |
| CW131 | Fitur Cache Storage tidak didukung |  | Status / pesan · 183 |
| CW132 | Kembalikan semua pengaturan ke nilai standar pabrik? |  | Status / pesan · 203 |
| CW133 | === TEST PRINT KALIBRASI === |  | Teks pada cetakan · 229 |
| CW134 | {formData.qzPrinterName \|\| 'iWare IW D260UL'} (QZ Tray Auto) |  | Status / pesan · 234 |
| CW135 | iWare IW D260UL |  | Status / pesan · 234 |
| CW136 | iWare IW D260UL (Windows USB) |  | Status / pesan · 236 |
| CW137 | Target: {targetPrinterName} |  | Teks pada cetakan · 238 |
| CW138 | Lebar: {canvas.width} dots ({canvas.width / 8} mm) • {new Date().toLocaleTimeString('id-ID')} |  | Teks pada cetakan · 239 |
| CW139 | \|&lt; 0 mm — {canvas.width} dots / {canvas.width / 8} mm &gt;\| |  | Teks pada cetakan · 244 |
| CW140 | STATUS: QZ TRAY AUTO-PRINT OK |  | Teks pada cetakan · 259 |
| CW141 | STATUS: WINDOWS BROWSER PRINT OK |  | Teks pada cetakan · 261 |
| CW142 | STATUS: CLEANTER BLUETOOTH OK |  | Teks pada cetakan · 262 |
| CW143 | Mengirim ke QZ Tray... (Periksa apakah ada pop-up konfirmasi di Windows) |  | Status / pesan · 288 |
| CW144 | Menyiapkan proses cetak... |  | Status / pesan · 289 |
| CW145 | ✅ Test print berhasil terkirim ke "{formData.qzPrinterName \|\| 'iWare'}" via QZ Tray tanpa dialog! |  | Status / pesan · 301 |
| CW146 | ✅ Dialog cetak Windows browser berhasil dibuka untuk printer iWare! |  | Status / pesan · 303 |
| CW147 | ✅ Test print berhasil terkirim ke printer via Cleanter! |  | Status / pesan · 305 |
| CW148 | ({res.errorFix}) |  | Status / pesan · 308 |
| CW149 | ❌ Test print gagal: {res.errorMessage}{detail} |  | Status / pesan · 309 |
| CW150 | ❌ Kendala saat mengirim ke printer: {msg} |  | Status / pesan · 313 |
| CW151 | Harap unggah file berformat PNG dengan latar belakang transparan. |  | Status / pesan · 324 |
| CW152 | Bingkai {frameId} berhasil diperbarui! |  | Status / pesan · 330 |
| CW153 | Gagal mengunggah bingkai: |  | Status / pesan · 332 |
| CW154 | Pengaturan Kiosk Admin |  | Tampilan · 342 |
| CW155 | Mode Aktif: |  | Tampilan · 347 |
| CW156 | Windows — Automatic Printing (QZ Tray / iWare) |  | Tampilan / teks dinamis · 350 |
| CW157 | Windows USB — Browser Print (iWare) |  | Tampilan / teks dinamis · 352 |
| CW158 | Android Bluetooth — Event (VSC TM-80D) |  | Tampilan / teks dinamis · 353 |
| CW159 | Tutup |  | Tampilan · 357 |
| CW160 | Status & Mode |  | Tampilan · 368 |
| CW161 | Manajemen Bingkai |  | Tampilan · 379 |
| CW162 | Pengaturan Cetak |  | Tampilan · 390 |
| CW163 | Branding & Kiosk |  | Tampilan · 401 |
| CW164 | Pengaturan berhasil disimpan! |  | Tampilan · 416 |
| CW165 | Pilih Mode Printer & Perangkat |  | Tampilan · 431 |
| CW166 | Windows QZ Tray Aktif |  | Tampilan / teks dinamis · 435 |
| CW167 | Windows USB Aktif |  | Tampilan / teks dinamis · 437 |
| CW168 | Android Bluetooth Aktif |  | Tampilan / teks dinamis · 438 |
| CW169 | Hanya satu mode yang aktif dalam satu waktu. Pilih sesuai target perangkat dan printer yang Anda gunakan: |  | Tampilan · 441 |
| CW170 | Rekomendasi {formData.printerMode === 'windows-qz' && ( &lt;span className="w-2.5 h-2.5 rounded-full bg-brand-blue" /&gt; )} |  | Tampilan · 457 |
| CW171 | Windows QZ Tray (Auto) |  | Tampilan · 465 |
| CW172 | • 1-Klik Cetak Otomatis • Tanpa dialog cetak browser • Target: iWare IW D260UL • Kamera: Webcam laptop |  | Tampilan · 469 |
| CW173 | Testing Fallback {formData.printerMode === 'windows-usb' && ( &lt;span className="w-2.5 h-2.5 rounded-full bg-brand-blue" /&gt; )} |  | Tampilan · 489 |
| CW174 | Windows USB (Browser) |  | Tampilan · 497 |
| CW175 | • Menggunakan dialog window.print() • Driver Windows iWare • Tanpa install QZ Tray |  | Tampilan · 501 |
| CW176 | Event Mobile {formData.printerMode === 'android-bluetooth' && ( &lt;span className="w-2.5 h-2.5 rounded-full bg-brand-blue" /&gt; )} |  | Tampilan · 520 |
| CW177 | Android Bluetooth |  | Tampilan · 528 |
| CW178 | • HP Android (termasuk Redmi Note 10 Pro) • Printer: PT210 58mm / thermal 80mm • Bridge Cleanter (Port 9100) • Kamera depan selfie (1:1) |  | Tampilan · 532 |
| CW179 | Pencetakan Otomatis QZ Tray |  | Tampilan · 556 |
| CW180 | Direct WebSocket • iWare IW D260UL (80mm Thermal) |  | Tampilan · 557 |
| CW181 | Terhubung |  | Tampilan / teks dinamis · 580 |
| CW182 | Memeriksa... |  | Tampilan / teks dinamis · 582 |
| CW183 | Terputus |  | Tampilan / teks dinamis · 583 |
| CW184 | Memeriksa status service QZ Tray... |  | Tampilan / teks dinamis · 595 |
| CW185 | Pilih Printer Windows Terdeteksi: |  | Tampilan · 601 |
| CW186 | Memindai... |  | Tampilan / teks dinamis · 612 |
| CW187 | Muat Ulang Printer |  | Tampilan / teks dinamis · 612 |
| CW188 | ★ (Rekomendasi iWare) |  | Tampilan / teks dinamis · 624 |
| CW189 | Sedang mencari printer yang terpasang di Windows via QZ Tray... |  | Tampilan / teks dinamis · 631 |
| CW190 | Belum ada printer yang terdeteksi via QZ Tray. Pastikan QZ Tray berjalan di Windows dan klik "Muat Ulang Printer". |  | Tampilan / teks dinamis · 632 |
| CW191 | Input Manual: |  | Tampilan · 636 |
| CW192 | Contoh: iWare IW D260UL atau POS-80 |  | Placeholder · 640 |
| CW193 | Petunjuk Penting 1-Klik Cetak QZ Tray di Windows: |  | Tampilan · 650 |
| CW194 | 1. Pastikan software QZ Tray berjalan di Windows (ikon hijau di taskbar dekat jam). |  | Tampilan · 654 |
| CW195 | 2. Sambungkan kabel USB printer iWare IW D260UL dan nyalakan printer. |  | Tampilan · 655 |
| CW196 | 3. Klik "Muat Ulang Printer" di atas, lalu pilih nama printer iWare Anda. |  | Tampilan · 656 |
| CW197 | 4. Klik "TEST PRINT (QZ TRAY)" di bawah untuk menguji cetak struk otomatis. |  | Tampilan · 657 |
| CW198 | ⚠️ JIKA STATUS HANYA "MENGIRIM..." ATAU TERPUTUS: |  | Tampilan · 660 |
| CW199 | • Pop-up Izin Windows: Periksa taskbar Windows Anda. Jika muncul jendela pop-up otorisasi dari QZ Tray bertuliskan "A website is requesting access...", centang "Remember this decision" lalu klik "Allow". |  | Tampilan · 663 |
| CW200 | • Izin HTTPS / SSL Port 8181: Jika membuka dari link Vercel, buka tab baru ke https://localhost:8181 (Klik di sini) , lalu klik Advanced ➔ Proceed to localhost (unsafe) agar Chrome mengizinkan koneksi WSS terenkripsi lokal. |  | Tampilan · 666 |
| CW201 | Cek Status QZ Tray |  | Tampilan / teks dinamis · 689 |
| CW202 | Mengirim... |  | Tampilan / teks dinamis · 698 |
| CW203 | TEST PRINT (QZ TRAY) |  | Tampilan / teks dinamis · 698 |
| CW204 | Printer Windows USB: iWare IW D260UL |  | Tampilan · 722 |
| CW205 | Thermal Receipt 80mm • ESC/POS Native Driver |  | Tampilan · 723 |
| CW206 | Windows Browser Print Siap |  | Tampilan / teks dinamis · 730 |
| CW207 | Mencetak langsung melalui driver Windows tanpa memerlukan bridge lokal Cleanter atau koneksi Bluetooth. |  | Tampilan · 732 |
| CW208 | Petunjuk Setup Windows & iWare IW D260UL: |  | Tampilan · 737 |
| CW209 | 1. Tancapkan kabel USB printer iWare ke laptop Windows Anda dan nyalakan printer. |  | Tampilan · 741 |
| CW210 | 2. Pastikan driver iWare IW D260UL terpasang di Settings ➔ Printers & Scanners dan jadikan sebagai default printer. |  | Tampilan · 742 |
| CW211 | 3. Di dialog cetak Chrome, pilih ukuran kertas 80mm Roll, Margins: None, dan hilangkan centang Headers & footers. |  | Tampilan · 743 |
| CW212 | 💡 Dukungan Kiosk Otomatis: Jalankan Chrome dengan parameter --kiosk-printing untuk mencetak langsung tanpa dialog browser. |  | Tampilan · 744 |
| CW213 | Uji Status Printer Windows |  | Tampilan · 751 |
| CW214 | Koneksi Cleanter Bridge (Port 9100) |  | Tampilan · 768 |
| CW215 | Target: printer default di Cleanter |  | Tampilan · 769 |
| CW216 | Memeriksa respon Cleanter di |  | Tampilan · 777 |
| CW217 | Cleanter Bridge Terhubung! |  | Tampilan · 781 |
| CW218 | Printer: |  | Tampilan · 786 |
| CW219 | Printer Bluetooth |  | Tampilan / teks dinamis · 786 |
| CW220 | (Bluetooth OK) |  | Tampilan · 786 |
| CW221 | Koneksi Cleanter Belum Terhubung |  | Tampilan · 791 |
| CW222 | Panduan Android: |  | Tampilan · 797 |
| CW223 | 1. Buka aplikasi Cleanter di Android & pastikan service aktif. |  | Tampilan · 798 |
| CW224 | 2. Hubungkan Bluetooth dengan printer kamu di Cleanter. |  | Tampilan · 799 |
| CW225 | 3. Jika Chrome memunculkan dialog Local Network Permission, pilih Allow / Izinkan. |  | Tampilan · 800 |
| CW226 | Tekan tombol di bawah untuk menguji koneksi localhost ke Cleanter bridge. |  | Tampilan · 804 |
| CW227 | Otorisasi & Cek Koneksi Printer |  | Tampilan / teks dinamis · 817 |
| CW228 | Diagnostik Printer Kiosk (Admin Debug) |  | Tampilan · 828 |
| CW229 | Routing: Strict Isolated |  | Tampilan · 832 |
| CW230 | Mode Aktif |  | Tampilan · 839 |
| CW231 | windows-qz (QZ Tray) |  | Tampilan · 842 |
| CW232 | windows-usb (Browser) |  | Tampilan · 844 |
| CW233 | android-bluetooth (Cleanter) |  | Tampilan · 846 |
| CW234 | Printer Terpilih |  | Tampilan · 852 |
| CW235 | (Belum dipilih) |  | Tampilan / teks dinamis · 855 |
| CW236 | iWare IW D260UL (Driver Windows) |  | Tampilan / teks dinamis · 857 |
| CW237 | VSC TM-80D (Bluetooth) |  | Tampilan / teks dinamis · 858 |
| CW238 | Adapter Terpasang |  | Tampilan · 863 |
| CW239 | Port & Protokol |  | Tampilan · 870 |
| CW240 | WSS Port 8181 (Auto cycle 8282-8484) |  | Tampilan / teks dinamis · 873 |
| CW241 | Native Browser window.print() |  | Tampilan / teks dinamis · 875 |
| CW242 | HTTP Port 9100 Cleanter |  | Tampilan / teks dinamis · 876 |
| CW243 | 🛡️ Kebijakan Isolasi Cetak: |  | Tampilan · 883 |
| CW244 | • window.print() DILARANG TOTAL. Hanya QZ Tray qz.print() yang dieksekusi. |  | Tampilan / teks dinamis · 888 |
| CW245 | • Menggunakan window.print() browser dialog untuk driver Windows iWare. |  | Tampilan / teks dinamis · 890 |
| CW246 | • Menggunakan HTTP bridge Cleanter ke printer VSC TM-80D. |  | Tampilan / teks dinamis · 891 |
| CW247 | Belum ada aktivitas cetak pada sesi ini. Klik "TEST PRINT (QZ TRAY)" di atas untuk memverifikasi jalur printer. |  | Tampilan · 900 |
| CW248 | Log Eksekusi Terakhir ({lastDiag.timestamp}): |  | Tampilan · 908 |
| CW249 | Detail: {lastDiag.detail} |  | Tampilan · 923 |
| CW250 | Kesiapan Hardware & Offline PWA |  | Tampilan · 934 |
| CW251 | Webcam Laptop Windows |  | Tampilan / teks dinamis · 942 |
| CW252 | Kamera Depan Ponsel |  | Tampilan / teks dinamis · 942 |
| CW253 | Uji Ulang |  | Tampilan · 947 |
| CW254 | Kesiapan Offline (PWA Cache) |  | Tampilan · 959 |
| CW255 | Offline Ready |  | Tampilan · 963 |
| CW256 | Panduan Penggantian Bingkai Foto: |  | Tampilan · 976 |
| CW257 | Unggah gambar berformat PNG dengan background transparan. Ukuran frame adalah 1080 × 1440 piksel (portrait 3:4). Buat area foto transparan 960 × 960 piksel pada posisi X: 60, Y: 90. Margin kiri/kanan 60 piksel, atas 90 piksel, dan bawah 390 piksel untuk watermark atau tulisan. Foto tetap 1:1. Gunakan tulisan hitam yang cukup besar agar terbaca di printer thermal. Aset tersimpan permanen di IndexedDB dan dapat digunakan offline. |  | Tampilan · 977 |
| CW258 | Kustom |  | Tampilan · 1001 |
| CW259 | {nama bingkai} ({frame.styleName}) |  | Tampilan · 1009 |
| CW260 | Slot #{index + 1} — {frame.isCustom ? 'Aset Kustom Petugas' : 'Template Standar'} |  | Tampilan · 1012 |
| CW261 | Ganti PNG |  | Tampilan · 1017 |
| CW262 | Reset Bawaan |  | Tampilan · 1029 |
| CW263 | Uji Cetak Kalibrasi ({nama printer}) |  | Tampilan · 1053 |
| CW264 | Kirimkan sampel pola kalibrasi langsung via QZ Tray tanpa dialog cetak browser |  | Tampilan / teks dinamis · 1058 |
| CW265 | Membuka dialog cetak Windows dengan struk kalibrasi 80mm |  | Tampilan / teks dinamis · 1060 |
| CW266 | Kirimkan sampel pola kalibrasi langsung ke VSC TM-80D via Cleanter |  | Tampilan / teks dinamis · 1061 |
| CW267 | Mencetak... |  | Tampilan / teks dinamis · 1070 |
| CW268 | TEST PRINT |  | Tampilan / teks dinamis · 1070 |
| CW269 | Kalibrasi Ukuran Kertas & Cetakan |  | Tampilan · 1080 |
| CW270 | Lebar Kertas Fisik (mm) |  | Tampilan · 1086 |
| CW271 | 80 mm (Standar iWare IW D260UL) |  | Tampilan · 1092 |
| CW272 | 58 mm (Roll Mini) |  | Tampilan · 1093 |
| CW273 | Lebar Cetak Efektif (Printable mm) |  | Tampilan · 1098 |
| CW274 | Tinggi Halaman Driver (mm) |  | Tampilan · 1110 |
| CW275 | Awal: 120 mm (Dapat disesuaikan jika driver membatasi panjang) |  | Tampilan · 1119 |
| CW276 | Margin Dokumen Cetak (mm) |  | Tampilan · 1123 |
| CW277 | Rekomendasi: 0 mm agar tidak memicu halaman kedua |  | Tampilan · 1132 |
| CW278 | Lebar Kertas (mm) |  | Tampilan · 1137 |
| CW279 | 80 mm (Standar VSC TM-80D) |  | Tampilan · 1143 |
| CW280 | 58 mm (Kertas Mini) |  | Tampilan · 1144 |
| CW281 | Lebar Raster Titik (Dots / Px) — Resolusi Head Printer |  | Tampilan · 1150 |
| CW282 | 576 dots — STANDAR PAS iWare 80mm (72mm Area Cetak - Rekomendasi) |  | Tampilan · 1158 |
| CW283 | 512 dots — Lebar Kompak |  | Tampilan · 1159 |
| CW284 | 384 dots — Khusus Kertas Mini 58mm |  | Tampilan · 1160 |
| CW285 | 💡 Gunakan 576 dots untuk printer iWare 80mm agar foto pas di tengah dan tidak terpotong memanjang ke bawah. |  | Tampilan · 1162 |
| CW286 | GOOJPRT PT210 — Uji dari HP |  | Tampilan · 1169 |
| CW287 | Kertas 58 mm, area cetak 48 mm (384 dots), tanpa pemotong otomatis. Pilih PT210 sebagai printer default di Cleanter pada HP yang sama. |  | Tampilan · 1170 |
| CW288 | Gunakan Preset PT210 (384 dots) |  | Tampilan · 1174 |
| CW289 | Klik Simpan Pengaturan setelah memilih preset. |  | Tampilan · 1186 |
| CW290 | Perbaiki Ukuran Otomatis (Fit di Tengah) |  | Tampilan · 1193 |
| CW291 | Mengembalikan ukuran foto agar presisi di tengah kertas 80mm dan tidak melebar/memanjang ke bawah. |  | Tampilan · 1194 |
| CW292 | ⚡ Kalibrasi Pas 80mm |  | Tampilan · 1198 |
| CW293 | Ukuran berhasil dikalibrasi ke standar super hemat 80mm (Header & Footer Nonaktif)! Klik "Simpan Pengaturan" di bawah. |  | Status / pesan · 1215 |
| CW294 | Header Struk & Space Atas: {formData.showHeader ? `${formData.headerHeight} px` : 'Dinonaktifkan (0 px)'} |  | Tampilan · 1225 |
| CW295 | Tampilkan Header |  | Tampilan · 1228 |
| CW296 | 🌱 Mode Super Hemat Kertas: Tanpa header. Foto langsung menempel di paling atas kertas (hemat ~2–3 cm kertas per cetakan). |  | Tampilan · 1252 |
| CW297 | ⚡ Mode Kompak Hemat: Hanya judul teks 1 baris tanpa subtitle, menghemat ~1.5 cm kertas. |  | Tampilan · 1257 |
| CW298 | Header standar lengkap dengan judul, subtitle, dan garis pembatas. |  | Tampilan · 1262 |
| CW299 | Footer Struk & Space Bawah: {formData.showFooter ? `${formData.footerHeight} px` : 'Dinonaktifkan (0 px)'} |  | Tampilan · 1271 |
| CW300 | Tampilkan Footer |  | Tampilan · 1274 |
| CW301 | 🌱 Mode Super Hemat Kertas: Tanpa footer. Kertas langsung dipotong setelah foto selesai dicetak (hemat ~2 cm kertas per cetakan). |  | Tampilan · 1298 |
| CW302 | Footer aktif dengan teks penutup, tanggal/waktu, dan kode sesi. |  | Tampilan · 1303 |
| CW303 | Preview dan QZ memakai gambar dengan pola titik teratur yang sama. Hasil fisik tetap perlu diuji. Naikkan kecerahan untuk hasil lebih terang. Turunkan kontras di bawah 1,00 untuk bayangan lebih lembut. |  | Tampilan · 1310 |
| CW304 | Cetak Lebih Lembut (Terang 1,20 · Kontras 0,80) |  | Tampilan · 1314 |
| CW305 | Setelah memilih, klik Simpan Pengaturan lalu ambil foto baru untuk uji cetak. |  | Tampilan · 1321 |
| CW306 | Kecerahan Cetak: {formData.brightness.toFixed(2)}x |  | Tampilan · 1325 |
| CW307 | Kontras Cetak: {formData.contrast.toFixed(2)}x |  | Tampilan · 1340 |
| CW308 | Pengaturan Lanjutan {showAdvancedPrint ? &lt;ChevronUp className="w-4 h-4" /&gt; : &lt;ChevronDown className="w-4 h-4" /&gt;} |  | Tampilan · 1357 |
| CW309 | Cleanter Base URL (Khusus Android) |  | Tampilan · 1368 |
| CW310 | Garis Feed Spacing (Jarak Keluar) |  | Tampilan · 1377 |
| CW311 | 0 = Langsung potong tanpa feed baris kosong (paling hemat kertas). |  | Tampilan · 1386 |
| CW312 | Margin Samping Foto (px) |  | Tampilan · 1391 |
| CW313 | Rekomendasi 24 px: Memberikan batas tepi bersih dan menjaga foto presisi di tengah kertas. |  | Tampilan · 1400 |
| CW314 | Auto Cut Paper |  | Tampilan · 1405 |
| CW315 | Kirim perintah potong kertas otomatis |  | Tampilan · 1414 |
| CW316 | Opsi Mesin Cetak QZ Tray (iWare) |  | Tampilan · 1429 |
| CW317 | Direct ESC/POS 203 DPI (Aktif Otomatis) |  | Tampilan · 1434 |
| CW318 | Mesin cetak dikunci otomatis ke protokol hardware native ESC/POS (0mm margin, resolusi native 203 DPI, dan dithering Black & White otomatis). Kecerahan hasil fisik perlu dikalibrasi sesuai printer dan kertas. |  | Tampilan · 1438 |
| CW319 | Auto Feed & Potong Kertas (Cut) |  | Tampilan · 1444 |
| CW320 | Kirim perintah feed kertas & auto-cut setelah foto selesai |  | Tampilan · 1453 |
| CW321 | Kertas otomatis dipotong rapi tepat setelah foto selesai dicetak. |  | Tampilan · 1457 |
| CW322 | Bebas Dialog Konfirmasi (Silent Printing Otomatis) |  | Tampilan · 1467 |
| CW323 | ⚠️ Kenapa Tombol "Allow" Mati Saat Centang "Remember"? |  | Tampilan · 1473 |
| CW324 | QZ Tray di Windows memiliki proteksi keamanan: QZ Tray menolak tombol "Allow" jika opsi Remember this decision dicentang sebelum sertifikatnya didaftarkan ke Site Manager QZ Tray di laptop Anda. |  | Tampilan · 1476 |
| CW325 | ✅ 1. Solusi Cepat (Untuk Mencetak Sekarang): |  | Tampilan · 1481 |
| CW326 | Saat pop-up QZ Tray muncul: HAPUS CENTANG (UNCHECK) pada "Remember this decision" (biarkan kotaknya kosong). Tombol "Allow" akan langsung berwarna biru/aktif dan bisa diklik untuk mencetak foto seketika! |  | Tampilan · 1482 |
| CW327 | 🔒 2. Solusi Permanen (Bebas Pop-up Selamanya / Silent Print): |  | Tampilan · 1488 |
| CW328 | Daftarkan sertifikat photobox ke QZ Tray sekali saja agar dialog izin tidak pernah muncul lagi: |  | Tampilan · 1489 |
| CW329 | 📥 Download Sertifikat (digital-certificate.txt) ⚡ Download Pasang Otomatis (.bat) |  | Tampilan · 1492 |
| CW330 | Unduh file sertifikat di atas. |  | Tampilan · 1509 |
| CW331 | Di pojok kanan bawah Windows (dekat jam), klik kanan ikon hijau |  | Tampilan · 1510 |
| CW332 | QZ Tray |  | Tampilan · 1510 |
| CW333 | Advanced |  | Tampilan · 1510 |
| CW334 | Site Manager... |  | Tampilan · 1510 |
| CW335 | Drag & drop (tarik & lepas) |  | Tampilan · 1511 |
| CW336 | file |  | Tampilan · 1511 |
| CW337 | digital-certificate.txt |  | Tampilan · 1511 |
| CW338 | ke dalam jendela Site Manager tersebut (atau jalankan file |  | Tampilan · 1511 |
| CW339 | install-qz-cert.bat |  | Tampilan · 1511 |
| CW340 | sebagai Administrator). |  | Tampilan · 1511 |
| CW341 | Selesai! Sertifikat langsung terdaftar sebagai |  | Tampilan · 1512 |
| CW342 | Allowed |  | Tampilan · 1512 |
| CW343 | dan dialog izin tidak akan pernah muncul lagi. |  | Tampilan · 1512 |
| CW344 | Digital Certificate URL (Opsional) |  | Tampilan · 1519 |
| CW345 | http://localhost:8190/cert atau kosongkan |  | Placeholder · 1522 |
| CW346 | Signature Endpoint URL (Opsional) |  | Tampilan · 1530 |
| CW347 | http://localhost:8190/sign atau kosongkan |  | Placeholder · 1533 |
| CW348 | Teks Branding Kios & Struk |  | Tampilan · 1551 |
| CW349 | Judul Aplikasi Kios |  | Tampilan · 1554 |
| CW350 | Header Struk Foto (Atas) |  | Tampilan · 1565 |
| CW351 | Aktifkan Header |  | Tampilan · 1566 |
| CW352 | Contoh: PHOTOBOX |  | Placeholder · 1581 |
| CW353 | ✓ Header nonaktif: Foto langsung dicetak di bagian paling atas kertas tanpa teks header (hemat space ~2–3 cm). |  | Tampilan · 1585 |
| CW354 | Footer Struk Foto (Bawah) |  | Tampilan · 1593 |
| CW355 | Aktifkan Footer |  | Tampilan · 1594 |
| CW356 | Contoh: Capture Your Moment |  | Placeholder · 1609 |
| CW357 | ✓ Footer nonaktif: Foto langsung dipotong tanpa teks footer/tanggal/kode (hemat space ~2 cm). |  | Tampilan · 1613 |
| CW358 | Cetak Tanggal & Waktu |  | Tampilan · 1620 |
| CW359 | Cetak Kode Sesi Ref |  | Tampilan · 1631 |
| CW360 | Keamanan & Perilaku Kiosk |  | Tampilan · 1646 |
| CW361 | PIN Admin Petugas |  | Tampilan · 1650 |
| CW362 | Timeout Reset Otomatis (Detik) |  | Tampilan · 1661 |
| CW363 | Kunci Layar Selalu Menyala (WakeLock API) |  | Tampilan · 1682 |
| CW364 | Mencegah layar laptop/ponsel redup saat kiosk aktif. |  | Tampilan · 1683 |
| CW365 | Mode Simulasi Printer (Mock Mode) |  | Tampilan · 1695 |
| CW366 | Aktifkan hanya untuk demonstrasi tanpa fisik printer terhubung. Nonaktifkan saat produksi! |  | Tampilan · 1696 |
| CW367 | Reset Default |  | Tampilan · 1711 |
| CW368 | Simpan Pengaturan |  | Tampilan · 1720 |

## 03 — Pesan sistem, printer, kamera, dan teks cetak

### src/context/PhotoboxContext.tsx

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW369 | Bingkai 1 |  | Status / pesan · 29 |
| CW370 | Polaroid |  | Status / pesan · 30 |
| CW371 | Bingkai 2 |  | Status / pesan · 35 |
| CW372 | Retro |  | Status / pesan · 36 |
| CW373 | Bingkai 3 |  | Status / pesan · 41 |
| CW374 | Fun |  | Status / pesan · 42 |
| CW375 | Printer tidak terhubung. Silakan panggil petugas. |  | Status / pesan · 432 |

### src/services/camera.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW376 | Kamera tidak didukung oleh browser ini. |  | Status / pesan · 18 |
| CW377 | Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser. |  | Status / pesan · 59 |
| CW378 | Kamera depan tidak ditemukan pada ponsel ini. |  | Status / pesan · 63 |
| CW379 | Webcam tidak terdeteksi pada laptop ini. Pastikan webcam aktif. |  | Status / pesan · 64 |
| CW380 | Kamera sedang digunakan oleh aplikasi lain. |  | Status / pesan · 67 |
| CW381 | Gagal mengakses kamera/webcam. |  | Status / pesan · 69 |
| CW382 | Video stream belum siap untuk mengambil foto. |  | Status / pesan · 96 |
| CW383 | Gagal menginisialisasi canvas context. |  | Status / pesan · 111 |
| CW384 | Gagal mengekspor foto dari canvas. |  | Status / pesan · 137 |

### src/services/compositor.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW385 | Gagal memuat gambar: |  | Status / pesan · 35 |
| CW386 | Gagal menyiapkan pola titik untuk cetak thermal. |  | Status / pesan · 111 |
| CW387 | Gagal menginisialisasi canvas untuk pembuatan layout cetak. |  | Status / pesan · 196 |
| CW388 | PHOTOBOX |  | Status / pesan · 208 |
| CW389 | ★ SELF-SERVICE PHOTOBOX ★ |  | Teks pada cetakan · 221 |
| CW390 | Capture Your Moment |  | Teks pada cetakan · 270 |
| CW391 | {dateText} • #{sessionRef.slice(-6)} |  | Status / pesan · 276 |
| CW392 | SESI: #{sessionRef.slice(-6)} |  | Status / pesan · 280 |
| CW393 | Gagal menyiapkan foto download. |  | Status / pesan · 293 |

### src/services/photoSharing.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW394 | Gunakan alamat HTTPS. |  | Status / pesan · 16 |
| CW395 | Gunakan alamat utama website tanpa path, query, atau password. |  | Status / pesan · 17 |
| CW396 | Kunci kiosk minimal 32 karakter. |  | Status / pesan · 19 |
| CW397 | Penyimpanan foto belum dihubungkan. |  | Status / pesan · 32 |
| CW398 | Penyimpanan belum bisa diakses. |  | Status / pesan · 39 |
| CW399 | Dua versi foto gagal dibuat. |  | Status / pesan · 46 |
| CW400 | File antrean tidak ditemukan. |  | Status / pesan · 72 |
| CW401 | Upload belum berhasil. Foto tersimpan di antrean. |  | Status / pesan · 77 |
| CW402 | Upload tertunda. |  | Status / pesan · 86 |

### src/services/printer.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW403 | Proses cetak sedang berlangsung. Mohon tunggu. |  | Status / pesan · 85 |
| CW404 | Printer tidak terhubung. Silakan panggil petugas. |  | Status / pesan · 181 |
| CW405 | Detail: {cleanErr} |  | Status / pesan · 182 |

### src/services/printers/AndroidCleanterPrinter.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW406 | Android Bluetooth (Cleanter) |  | Status / pesan · 14 |
| CW407 | Cleanter mengembalikan status HTTP {response.status} |  | Status / pesan · 37 |
| CW408 | Cleanter v{data.version \|\| '1.1'} — Printer: {data.printer.name \|\| 'Printer Bluetooth'} ({data.printer.address \|\| 'Bluetooth OK'}) |  | Status / pesan · 45 |
| CW409 | Printer Bluetooth |  | Status / pesan · 45 |
| CW410 | Bluetooth OK |  | Status / pesan · 45 |
| CW411 | Printer belum terhubung di Cleanter: {data.printer?.problem \|\| 'Periksa koneksi Bluetooth'} |  | Status / pesan · 50 |
| CW412 | Periksa koneksi Bluetooth |  | Status / pesan · 50 |
| CW413 | Koneksi ke Cleanter (localhost:9100) timeout. Pastikan aplikasi Cleanter aktif di Android. |  | Status / pesan · 58 |
| CW414 | Tidak dapat terhubung ke Cleanter bridge. Pastikan aplikasi Cleanter berjalan dan izin Local Network telah diberikan. |  | Status / pesan · 64 |
| CW415 | Periksa status printer bluetooth dan ketersediaan kertas. |  | Status / pesan · 132 |
| CW416 | Permintaan cetak tidak valid (HTTP 400). |  | Status / pesan · 140 |
| CW417 | Printer mengembalikan kode status {response.status}. |  | Status / pesan · 146 |
| CW418 | Waktu koneksi pencetakan habis (timeout). |  | Status / pesan · 153 |
| CW419 | Periksa apakah printer thermal Bluetooth terhubung dan memiliki daya cukup. |  | Status / pesan · 154 |
| CW420 | Gagal menghubungi Cleanter printer bridge. |  | Status / pesan · 159 |
| CW421 | Pastikan aplikasi Cleanter aktif pada HP Android dan bluetooth printer sudah tersambung. |  | Status / pesan · 161 |
| CW422 | Izin Bluetooth belum diberikan pada aplikasi Cleanter. |  | Status / pesan · 169 |
| CW423 | Bluetooth pada ponsel Android dalam keadaan nonaktif. |  | Status / pesan · 171 |
| CW424 | Printer Bluetooth belum terhubung ke Cleanter. |  | Status / pesan · 173 |
| CW425 | Printer belum dipasangkan (paired) di pengaturan Bluetooth Android. |  | Status / pesan · 175 |
| CW426 | Printer Bluetooth tidak merespons. Periksa daya dan kertas. |  | Status / pesan · 177 |
| CW427 | Terjadi gangguan komunikasi dengan printer thermal. |  | Status / pesan · 179 |

### src/services/printers/QZTrayPrinter.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW428 | Windows — Automatic Printing (QZ Tray) |  | Status / pesan · 11 |
| CW429 | Koneksi ke QZ Tray timeout (7 detik). Pastikan software QZ Tray sedang berjalan di Windows. |  | Status / pesan · 61 |
| CW430 | Printer QZ Tray belum dipilih. Silakan pilih printer iWare IW D260UL di menu Pengaturan Kiosk Admin. |  | Status / pesan · 134 |
| CW431 | QZ Tray aktif terhubung ke printer "{printerName}". Siap mencetak 1-klik otomatis. |  | Status / pesan · 158 |
| CW432 | Printer "{targetPrinter}" tidak ditemukan pada daftar printer Windows. Pastikan driver iWare terpasang. |  | Status / pesan · 163 |
| CW433 | Printer "{targetPrinter}" tidak terdeteksi di Windows: {(findErr as Error).message} |  | Status / pesan · 169 |
| CW434 | Printer tidak terhubung. Silakan panggil petugas. (QZ Tray: {errorMsg}) |  | Status / pesan · 176 |
| CW435 | Data gambar cetak tidak valid. |  | Status / pesan · 201 |
| CW436 | Silakan ambil foto ulang dan ulangi proses pencetakan. |  | Status / pesan · 202 |
| CW437 | Timeout mencetak ke QZ Tray (18 detik). Periksa apakah muncul dialog izin QZ Tray di layar/taskbar Windows Anda. |  | Status / pesan · 278 |
| CW438 | Periksa apakah kabel USB printer iWare IW D260UL sudah terhubung dan lampu indikator menyala. |  | Status / pesan · 303 |
| CW439 | Waktu respon habis. Buka taskbar Windows dan pastikan dialog izin QZ Tray diklik "Allow" (centang "Remember"). |  | Status / pesan · 305 |
| CW440 | Aplikasi QZ Tray di Windows belum berjalan. Buka QZ Tray dari Start Menu / Taskbar. |  | Status / pesan · 307 |
| CW441 | Printer "{targetPrinter}" tidak ditemukan. Pastikan driver iWare terdaftar di Devices and Printers Windows. |  | Status / pesan · 309 |
| CW442 | Izin cetak belum disetujui pada dialog QZ Tray. Pilih "Allow" dan centang "Remember this decision". |  | Status / pesan · 311 |
| CW443 | Printer tidak terhubung. Silakan panggil petugas. |  | Status / pesan · 320 |
| CW444 | {fix} (Info: {cleanInfo}) |  | Status / pesan · 321 |

### src/services/printers/WindowsBrowserPrinter.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW445 | Windows USB (iWare IW D260UL) |  | Status / pesan · 10 |
| CW446 | Pencetakan browser (window.print) tidak didukung pada sistem ini. |  | Status / pesan · 20 |
| CW447 | Windows Browser Printer siap. Kompatibel dengan driver iWare IW D260UL (80mm) & Chrome Kiosk Printing. |  | Status / pesan · 26 |
| CW448 | Objek window browser tidak tersedia. |  | Status / pesan · 47 |
| CW449 | Gagal membuka dialog cetak browser: |  | Status / pesan · 172 |
| CW450 | Periksa driver iWare IW D260UL atau pastikan pop-up browser tidak diblokir. |  | Status / pesan · 173 |

### src/services/storage.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW451 | PHOTOBOX |  | Status / pesan · 11 |
| CW452 | PHOTOBOX MEMORY |  | Status / pesan · 14 |
| CW453 | Capture Your Moment |  | Status / pesan · 15 |

### supabase/functions/photo-share/index.ts

| ID | Teks saat ini | Bahasa revisi | Jenis / baris sumber |
| --- | --- | --- | --- |
| CW454 | Method tidak diizinkan. |  | Status / pesan · 25 |
| CW455 | Request terlalu besar. |  | Status / pesan · 28 |
| CW456 | Kunci kiosk tidak cocok. Periksa pengaturan Admin. |  | Status / pesan · 32 |
| CW457 | Unauthorized |  | Status / pesan · 34 |
| CW458 | Setup penyimpanan belum lengkap atau bucket tidak privat. |  | Status / pesan · 40 |
| CW459 | Action tidak valid. |  | Status / pesan · 59 |
| CW460 | Link foto tidak valid. |  | Status / pesan · 60 |
| CW461 | Tanggal foto tidak valid. |  | Status / pesan · 64 |
| CW462 | Masa download foto sudah berakhir. |  | Status / pesan · 66 |
| CW463 | Foto belum diunggah. |  | Status / pesan · 74 |
| CW464 | Masa download 30 hari sudah berakhir. |  | Status / pesan · 77 |
| CW465 | Kedua file belum selesai diunggah. |  | Status / pesan · 91 |
| CW466 | Foto masih diunggah. Coba sebentar lagi. |  | Status / pesan · 96 |
| CW467 | Versi foto tidak valid. |  | Status / pesan · 107 |
| CW468 | Penyimpanan foto belum bisa diakses. Silakan coba lagi atau hubungi petugas. |  | Status / pesan · 113 |

Total: **468 entri**.
