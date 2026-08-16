# Logo Transparan + Daftar User Hotspot

## 1. Bersihkan logo jadi PNG transparan
- Hapus latar putih dari `src/assets/logo.png` (toleransi warna agar tepi tetap halus, tanpa sisa "halo" abu-abu).
- Regenerasi turunan ikon dari logo bersih: `public/favicon.png`, `icon-192.png`, `icon-512.png`.
- `icon-maskable-512.png` tetap memakai latar solid sesuai warna brand (syarat ikon maskable PWA), bukan transparan.
- Header dashboard tidak perlu diubah; logo transparan langsung menyatu dengan latar.

## 2. Daftar user hotspot (aktif & tidak aktif)
Halaman/bagian baru yang menampilkan pengguna hotspot dari router:

- **Sesi aktif**: user yang sedang login (nama, alamat IP, MAC, lama sesi, trafik naik/turun).
- **Semua user terdaftar**: seluruh akun hotspot dengan penanda status Aktif / Tidak aktif (dan Dinonaktifkan bila akun di-disable di router), plus profil, total pemakaian, dan waktu login terakhir bila tersedia.
- Ringkasan angka di atas tabel: total user, sedang online, offline.
- Pencarian nama user dan filter status, tabel bisa digulir horizontal di layar kecil.
- Data ikut auto-refresh berkala seperti dashboard utama, dengan tombol refresh manual.
- Bila router tidak punya layanan hotspot atau user API tidak berhak membacanya, tampilkan pesan jelas alih-alih tabel kosong.

## Catatan teknis
- Ambil data lewat klien API biner yang sudah ada (`src/lib/mikrotik.server.ts`) dengan perintah `/ip/hotspot/user/print` dan `/ip/hotspot/active/print`, digabungkan berdasarkan nama user.
- Modul baru `src/lib/mikrotik-hotspot.server.ts` untuk pemetaan data + tipe di `src/lib/mikrotik-types.ts`; server function baru ditambahkan di `src/lib/mikrotik.functions.ts`.
- Route baru `src/routes/hotspot.tsx` dengan `head()` meta sendiri, ditambah tautan navigasi di header.
- Logo diproses dengan ImageMagick (`-fuzz` + `-transparent white`) lalu ikon di-resize ulang.
