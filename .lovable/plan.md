# Link Graph + Sheet Daftar Perangkat

## 1. Halaman Graph (`/graph`)

Halaman baru berisi dua kartu tombol besar:
- **Dari luar kost** → `http://117.121.207.223:2627/graphs/`
- **Dari dalam kost** → `http://192.168.35.1/graphs/`

Keduanya buka di tab baru (`target="_blank"`, `rel="noopener noreferrer"`), lengkap dengan URL yang terlihat, ikon, dan catatan singkat kapan memakai yang mana (di luar jaringan kost vs terhubung WiFi kost). Tautan dalam-kost diberi keterangan bahwa hanya bisa dibuka saat perangkat berada di jaringan lokal.

Tidak dipakai iframe: halaman aplikasi berjalan di HTTPS, sedangkan graph MikroTik HTTP, jadi browser akan memblokir embed.

## 2. Halaman Perangkat (`/perangkat`)

Tabel/daftar perangkat dengan kolom:
- Nama perangkat, tipe (Access Point / Router / Switch / CCTV / lainnya)
- Lokasi, IP address, MAC address
- User login perangkat, password (disamarkan `••••••`, ada tombol mata untuk lihat + tombol salin)
- SSID dan password WiFi (khusus Access Point)
- Catatan

Fitur: pencarian (nama/IP/MAC/SSID), filter tipe, tambah/edit/hapus perangkat lewat form dialog, tampilan kartu di layar HP dan tabel di desktop.

Menu di header ditambah: Ringkasan · User Hotspot · Graph · Perangkat.

## 3. Penyimpanan & keamanan

Data perangkat disimpan di database Lovable Cloud (perlu diaktifkan). Karena isinya password perangkat, halaman ini tidak boleh terbuka bebas seperti halaman lain — jadi:

- Aktifkan Lovable Cloud + login email/password.
- Halaman `/perangkat` berada di area terproteksi: kalau belum login, diarahkan ke halaman `/auth` untuk masuk.
- Akun pertama Anda buat sendiri lewat halaman daftar; setelah itu pendaftaran bisa kita batasi bila diinginkan.
- Halaman Ringkasan, Hotspot, dan Graph tetap terbuka seperti sekarang.

Kalau Anda benar-benar tidak mau ada login sama sekali, alternatifnya password perangkat tidak disimpan di aplikasi. Tapi rekomendasi saya: pakai login untuk halaman perangkat saja.

## Detail teknis

- Aktifkan Lovable Cloud; migrasi membuat tabel `public.devices` (id, name, type, location, ip_address, mac_address, username, password, ssid, wifi_password, notes, timestamps) + `GRANT` untuk `authenticated`/`service_role`, RLS aktif, policy hanya untuk pengguna terautentikasi (tanpa akses `anon`).
- CRUD lewat `createServerFn` di `src/lib/devices.functions.ts` dengan `.middleware([requireSupabaseAuth])` dan validasi Zod; dipanggil dari komponen memakai `useServerFn` + TanStack Query.
- Route: `src/routes/graph.tsx` (publik), `src/routes/auth.tsx` (login/daftar), `src/routes/_authenticated/perangkat.tsx` + layout terproteksi bawaan integrasi.
- `head()` khusus per route (judul, deskripsi, og/twitter); halaman perangkat diberi `robots: noindex`.
- `SiteHeader` diperluas dengan dua item nav baru dan tombol keluar saat sudah login.
- Gaya mengikuti token desain light elegant tech yang sudah ada.
