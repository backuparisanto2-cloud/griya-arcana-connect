# Griya Arca Putri — Dashboard Router (Tahap 1)

Web responsive + installable (PWA) dengan tema light elegant tech, terhubung ke MikroTik RouterOS 7.19.6 di `117.121.207.223:2629`.

## Yang dibangun

**Halaman utama (`/`) — Status Router**
- Header dengan logo Griya Arca Putri + nama brand.
- Kartu status koneksi: terhubung / gagal, latensi, waktu cek terakhir, tombol "Uji Koneksi" dan auto-refresh tiap 15 detik.
- Kartu info sistem dari router: identitas router, model board, versi RouterOS, uptime, CPU load, penggunaan memori & disk (bar progress), arsitektur.
- Daftar interface: nama, tipe, status running/disabled, RX/TX byte.
- State kosong/eror yang jelas dalam bahasa Indonesia bila router tidak terjangkau.

**Instalasi ke layar utama (PWA)**
- Manifest + ikon dari logo, warna tema mengikuti brand, bisa "Add to Home Screen" di HP.
- Tanpa mode offline (data router selalu butuh koneksi).

## Koneksi ke router

RouterOS 7.19 punya REST API (`https://<ip>:<port>/rest/...`). Karena browser tidak boleh memanggil router secara langsung (kredensial akan bocor + terblokir CORS), semua panggilan lewat server function Lovable:
1. Server mencoba `https://117.121.207.223:2629/rest/system/resource` lalu fallback `http://` pada port yang sama, dengan Basic Auth.
2. Hasil deteksi (skema yang berhasil) ditampilkan di halaman sebagai info diagnostik, sehingga jelas apakah port 2629 memang layanan web/REST.

Penting: bila port 2629 ternyata layanan **API biner** MikroTik (bukan REST/web), runtime server Lovable tidak bisa membuka koneksi TCP mentah. Dalam kasus itu solusinya adalah mengaktifkan service `www` atau `www-ssl` di router dan memberi tahu port-nya — halaman diagnostik akan menunjukkan hasil ini dengan pesan yang jelas.

## Keamanan

- IP, port, user, dan password router disimpan sebagai secret backend (bukan di dalam kode), dan hanya dibaca di dalam server function. Password tidak pernah dikirim ke browser.
- Belum ada login aplikasi sesuai permintaan; halaman terbuka. Rekomendasi: batasi akses API user di router (read-only + allowed address) sampai login ditambahkan nanti.

## Desain

- Light elegant tech: latar putih hangat/abu sangat terang, aksen biru-teal dalam, tipografi geometris untuk judul + sans netral untuk teks, kartu bersudut lembut dengan border tipis dan bayangan halus, mikro-animasi pada perubahan nilai.
- Semua warna sebagai token desain, layout mobile-first (grid 1 kolom → 2/3 kolom di desktop).

## Detail teknis

- `createServerFn` di `src/lib/mikrotik.functions.ts` (`getRouterStatus`) memanggil `/rest/system/resource`, `/rest/system/identity`, `/rest/system/routerboard`, `/rest/interface`.
- Fetch dengan timeout ~8 detik; error dipetakan ke pesan ramah (timeout, auth gagal, port salah).
- Komponen memakai TanStack Query (`useServerFn` + `useQuery`, refetch interval), bukan loader, agar halaman tetap tampil saat router down.
- `public/manifest.webmanifest` + ikon + tag head; favicon diganti dari logo.
- Metadata head khusus di route index (judul, deskripsi, og/twitter).

## Yang dibutuhkan dari Anda

- Upload ulang file logo Griya Arca Putri (sementara saya siapkan placeholder teks bila belum ada).
