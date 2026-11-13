# Panduan Kalibrasi Printer VSC TM-80D (80mm ESC/POS)

Panduan ini ditujukan untuk administrator teknis guna mengkalibrasi kualitas gambar cetak, lebar raster, dan pemotongan kertas pada printer thermal **VSC TM-80D** menggunakan aplikasi Photobox PWA.

---

## 1. Karakteristik Hardware VSC TM-80D

- **Metode Cetak**: Direct Thermal (Thermal langsung tanpa tinta/pita).
- **Lebar Kertas Roll**: 80 mm (diameter roll maks. 80 mm).
- **Lebar Area Cetak Efektif**: 72 mm.
- **Resolusi Head**: 203 DPI (8 dots per mm).
- **Kapasitas Titik Raster Horizontal**:
  $$\text{Titik} = 72\text{ mm} \times 8\text{ dots/mm} = 576\text{ dots}$$
- **Interface**: Bluetooth 4.0 / USB / ESC/POS command set.
- **Auto-cutter**: Sebagian model VSC TM-80D dilengkapi *tear-bar* manual atau *auto-cutter*. Pengaturan default di aplikasi adalah `cut: false` demi kompatibilitas menyeluruh.

---

## 2. Pengaturan Parameter Raster di Panel Admin

Buka Panel Admin (tahan judul aplikasi selama 5 detik, PIN: `1234`) ➔ Pilih tab **Pengaturan Cetak**.

| Parameter | Rekomendasi Standar | Keterangan |
| :--- | :--- | :--- |
| **Lebar Kertas** | `80 mm` | Sesuai lebar fisik roll kertas VSC TM-80D. |
| **Raster Dot Width** | `576 dots` | Resolusi native horizontal tanpa distorsi. |
| **Margin Horizontal** | `12 px` | Memberikan jarak aman di tepi kiri dan kanan kertas. |
| **Header Height** | `110 px` | Ruang teks judul/event di atas foto bujur sangkar. |
| **Footer Height** | `110 px` | Ruang teks footer, tanggal & kode sesi di bawah foto. |
| **Kecerahan (Brightness)** | `1.05x` | Sedikit mengangkat detail bayangan/wajah pengunjung. |
| **Kontras (Contrast)** | `1.25x` | Menajamkan separasi hitam-putih sebelum dithering. |
| **Garis Feed Kosong** | `3 garis` | Memberikan ruang cukup agar teks footer terdorong keluar dari mulut pemotong. |
| **Auto Cut Paper** | `Nonaktif (Off)` | Aktifkan hanya jika unit printer Anda memiliki pemotong motorik otomatis. |

---

## 3. Kalibrasi Kualitas Hasil Cetak (Dithering)

Printer thermal hanya dapat mencetak titik hitam atau putih (1-bit monochrome). Untuk mencetak gradasi wajah dan foto pengunjung:

1. **Alur Dithering Bersih**:
   - Canvas aplikasi menyusun foto 1:1, menempelkan bingkai PNG berresolusi tinggi, dan mengoptimalkan kontras.
   - Aplikasi mengirim base64 PNG bersih ke Cleanter Bridge dengan bendera `"dither": true`.
   - Engine Cleanter melakukan algoritma difusi error **Floyd–Steinberg** langsung sebelum mengirim perintah ESC/POS `GS v 0` ke printer.
   - Pendekatan ini mencegah *double-dithering* (efek moiré bergaris-garis yang merusak foto).

2. **Penyetelan Jika Hasil Terlalu Gelap**:
   - Jika wajah pengunjung terlihat terlalu hitam atau pekat, masuk ke **Pengaturan Cetak** di Admin.
   - Naikkan nilai **Kecerahan (Brightness)** menjadi `1.10x` atau `1.15x`.
   - Naikkan sedikit **Kontras** menjadi `1.30x`.
   - Ketuk **Simpan Pengaturan** dan lakukan **TEST PRINT**.

3. **Penyetelan Jika Hasil Terlalu Pudar / Putih**:
   - Turunkan **Kecerahan** menjadi `1.00x`.
   - Turunkan **Kontras** menjadi `1.20x`.
   - Pastikan baterai printer VSC TM-80D terisi penuh, karena tegangan baterai rendah dapat menyebabkan thermal head tidak cukup panas untuk membakar kertas dengan pekat.

---

## 4. Prosedur Uji Kalibrasi Batang Garis (Test Print)

Di dalam panel admin, ketuk tombol **TEST PRINT**:
1. Struk uji akan mencetak:
   - Judul kalibrasi.
   - Tanggal & waktu.
   - **Garis horizontal kalibrasi**: Periksa apakah garis ini tercetak lurus dan berada tepat di tengah tanpa terpotong di sisi kiri atau kanan kertas.
   - **Pola papan catur (checkerboard)**: Periksa kerapatan titik. Jika titik-titik kecil kotak terlihat tajam dan jelas, maka printer sudah terkalibrasi sempurna untuk mencetak foto.
2. Periksa margin pemotongan: Struk harus keluar melewati bibir pisau pemotong setidaknya 1 cm sehingga mudah dirobek tanpa merobek teks terakhir. Jika kurang panjang, naikkan **Jumlah Garis Feed** menjadi `4` atau `5`.

---

## 5. Pemeliharaan Printer di Lokasi Acara

1. **Gunakan Kertas Thermal Berkualitas**:
   - Gunakan kertas thermal 80x80 atau 80x50 mm berkualitas *high-sensitivity* (misal kertas berlabel *coreless* hitam pekat).
   - Simpan gulungan kertas di tempat sejuk dan terlindung dari sinar matahari langsung.
2. **Membersihkan Print Head**:
   - Jika terlihat garis putih vertikal memanjang di setiap hasil cetak, matikan printer.
   - Buka tutup printer dan bersihkan lempeng pemanas (*thermal head*) dengan kapas alkohol (*alcohol swab*) secara perlahan.
   - Tunggu 1 menit hingga kering sebelum menyalakan kembali.
