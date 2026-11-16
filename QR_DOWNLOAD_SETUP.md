# Download foto via QR — 30 hari

## Perilaku

- Foto yang diterima saat menekan **Cetak Foto** dibuat menjadi dua JPG: warna asli dan grayscale, masing-masing memakai frame pilihan. Foto ulang sebelum diterima tidak diunggah.
- Ekspor digital lebar 1080 px, layout Polaroid 3:4 (1080 × 1440 tanpa header/footer), foto di dalamnya tetap 1:1. Pengaturan terang/kontras/dotted printer tidak diterapkan ke foto digital.
- Dua file di-upload bersamaan. Halaman download yang masih menunggu upload memeriksa lagi setiap 2 detik; tidak ada jeda wajib sebelum download.
- QR unik muncul pada layar sukses. Scan membuka `/download#TOKEN` dengan preview dan dua tombol download. Token acak 256 bit; server menyimpan hash token, bukan token aslinya. Siapa pun yang memiliki QR/link dapat mengunduh kedua file tanpa login.
- Layar sukses tetap tampil minimal 60 detik untuk memberi waktu scan; ini bukan jeda wajib. Pengunjung bisa langsung scan dan tekan Selesai.
- Masa akses dihitung 30 × 24 jam sejak pengambilan foto, termasuk saat upload tertunda. Percobaan upload ulang tidak memperpanjang masa akses.
- Setelah kedaluwarsa, server menolak download. Signed link maksimal 60 detik dan tidak melewati batas akses. Foto yang sudah diunduh pengunjung tetap menjadi milik mereka di perangkatnya.
- Cleanup berjalan tiap 10 menit dan menghapus objek fisik setelah grace period 2 jam (masa berlaku signed upload URL Supabase). Akses download tetap ditutup tepat pada batas 30 hari. Setiap eksekusi membersihkan maksimal 100 sesi; backlog dilanjutkan pada jadwal berikutnya.
- Metadata hash/tanggal kedaluwarsa dipertahankan agar link lama dapat menampilkan pesan kedaluwarsa; file gambar dihapus melalui Storage API.
- Antrean offline disimpan di IndexedDB, dicoba ulang ketika perangkat online, setiap 30 detik, dan saat aplikasi dibuka lagi. **Aplikasi harus dibuka untuk melanjutkan antrean.** Jangan hapus data browser sebelum antrean habis. Dua blob lokal dilepas setelah keduanya berhasil disimpan di server; antrean berusia 30 hari dihapus lokal.
- File warna dan B&W memakai JPEG quality 0.88. Ukuran bergantung isi foto; batas bucket 2 MB per file. Bila upload gagal, blob tetap di antrean dan kesalahan tidak menghentikan cetak.

## 1. Buat proyek Supabase

Gunakan proyek khusus photobox atau proyek yang ingin dipakai. Catat Project URL (bukan database connection string). Jalankan isi `supabase/migrations/202611150001_photo_sharing.sql` melalui SQL Editor, atau gunakan migration CLI pada proyek yang sudah ditautkan.

Migration membuat bucket **private** `photobox-photos` dan tabel `photobox_shares` yang tidak dapat dibaca/ditulis oleh anon/authenticated. Jangan membuat policy publik untuk bucket/tabel tersebut.

## 2. Deploy fungsi server

Buat dua nilai acak **berbeda**, masing-masing minimal 32 karakter. Misalnya jalankan dua kali `openssl rand -hex 32`.

Simpan sebagai Edge Function Secrets di dashboard Supabase:

- `PHOTOBOX_KIOSK_KEY`: kunci upload, hanya dimasukkan ke perangkat photobox melalui Admin.
- `PHOTOBOX_CRON_KEY`: kunci cleanup, hanya digunakan server dan Vault.

`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` disediakan otomatis oleh Supabase pada Edge Function. **Jangan masukkan service role key ke frontend, repository, QR, atau Admin.**

Deploy dengan Supabase CLI setelah login dan link proyek:

```sh
supabase functions deploy photo-share --no-verify-jwt
```

Atau buat fungsi bernama `photo-share` melalui dashboard dengan kode `supabase/functions/photo-share/index.ts`, lalu matikan **Verify JWT** untuk fungsi ini. Fungsi memeriksa kunci kiosk sendiri untuk prepare/complete/health, kunci cron untuk cleanup, dan token sesi untuk baca/download.

## 3. Aktifkan cleanup otomatis

Di **Supabase Vault**, buat:

- `photobox_function_url`: `https://PROJECT_REF.supabase.co/functions/v1/photo-share`
- `photobox_cron_key`: nilai yang sama dengan `PHOTOBOX_CRON_KEY`.

Kemudian jalankan `supabase/schedule-cleanup.sql` melalui SQL Editor. Jadwal harus diaktifkan agar file kedaluwarsa tidak terus memenuhi storage. Jalankan sekali untuk membuat/update job bernama `photobox-expired-photos`.

Periksa hasil eksekusi Cron dan `net._http_response`; job yang menghasilkan HTTP gagal perlu diperbaiki. Cek file benar-benar hilang dari Storage saat menguji cleanup, bukan hanya row database.

## 4. Konfigurasi website

Tambahkan variabel **publik** pada environment build Vercel:

```text
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
```

Untuk lokal, salin `.env.example` menjadi `.env.local` dan isi URL. Deploy/build ulang setelah perubahan. Project URL harus ikut build agar HP pengunjung yang baru membuka halaman download bisa menghubungi server tanpa konfigurasi lokal.

Di perangkat kiosk, buka **Admin → Status & Mode → Download Foto via QR**:

1. Masukkan alamat website **publik HTTPS**, tanpa path tambahan, misalnya `https://photobox.vercel.app`. Jangan gunakan localhost/IP lokal untuk event.
2. Masukkan `PHOTOBOX_KIOSK_KEY` pada **Kunci upload kiosk**.
3. Tekan **Simpan & Cek Koneksi**. Kunci tersimpan hanya pada browser kiosk tersebut, tidak dibundel ke website publik. Gunakan perangkat kiosk tepercaya dan batasi akses Admin.

Frontend tetap bisa cetak saat konfigurasi belum lengkap, tetapi QR tidak ditampilkan sampai pengaturan tersedia. Foto yang diterima tetap diantrekan secara lokal. Antrean dapat diteruskan setelah konfigurasi diperbaiki.

Tidak ada perubahan hosting Vercel atau akun Supabase yang dilakukan otomatis oleh source code ini.

## Verifikasi sebelum event

1. Ambil foto, pilih cetak, scan QR dari HP lain. Unduh kedua file, pastikan frame sama dan foto warna tetap berwarna.
2. Putus internet kiosk, ambil dan terima foto; QR menampilkan halaman menunggu upload. Tutup/buka aplikasi kiosk, sambungkan internet, pastikan kedua file menjadi tersedia tanpa mencetak ulang.
3. Uji print retry: hanya satu sesi download dibuat untuk foto yang sama. Foto ulang menjadi sesi baru.
4. Untuk menguji expiry, ubah `expires_at` sebuah sesi tes menjadi waktu lampau. Halaman harus mengatakan kedaluwarsa dan tombol download lama tidak bisa mendapatkan signed URL baru.
5. Untuk menguji cleanup, gunakan sesi tes yang expiry-nya lebih dari 2 jam lalu. Jalankan job; pastikan kedua file terhapus, lalu link tetap mengatakan kedaluwarsa.
6. Pantau penggunaan Storage dan kuota transfer Supabase. Antrean gagal akibat kapasitas penuh tetap tersimpan lokal sampai masalah diatasi atau masa 30 hari berakhir.
