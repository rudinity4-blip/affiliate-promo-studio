# Troubleshooting

## 404 saat refresh di Workers

Deployment tahap ini memakai Workers Static Assets. Pastikan `wrangler.jsonc` memiliki `assets.directory` ke `./dist/public` dan `not_found_handling` bernilai `single-page-application`. Jangan menambahkan `public/_redirects`; file tersebut sengaja tidak dipakai.

## 429 atau RESOURCE_EXHAUSTED

Kuota dihitung per project, bukan per key. Key dari project yang sama tidak menambah kuota. Gunakan cadangan dari project berbeda milik Anda sendiri, tunggu cooldown 60 detik, atau periksa batas kuota Google. Jangan membuat key dari project orang lain.

## Semua key cooldown atau mati

Slot 401/403 ditandai **mati**. Slot 429 menjadi **cooldown**. Tunggu, tes ulang, dan pastikan minimal satu key benar. Pesan error aplikasi meredaksi key; jangan menyalin key ke laporan.

## Gambar tidak terbentuk

Model gambar berada di `IMAGE_MODELS` pada `client/src/lib/promoPack.ts` agar mudah diperbarui. Nama model dapat berubah, kuota gambar dapat habis, atau filter dapat memblokir permintaan. Coba lagi dengan bahan yang berhak Anda gunakan dan prompt yang faktual.

## Produk berbeda pada frame

Periksa kunci produk, bentuk, warna, teks label, dan logo pada setiap frame sebelum dipakai. Aplikasi membawa frame sebelumnya ke permintaan berikutnya, tetapi model gambar tetap dapat salah. Buat ulang frame yang bermasalah dan jangan gunakan frame yang mengubah identitas produk.

## Ikon PWA atau versi lama

Cek `/icon-192.png`, `/icon-512.png`, dan manifest. Untuk versi lama, buka DevTools → Application, unregister service worker, lalu reload. Naikkan `CACHE_NAME` pada service worker saat merilis versi baru.

## Build gagal

Gunakan Node.js 20 atau lebih baru, lalu jalankan `pnpm install && pnpm check && pnpm build`. Pastikan tidak ada API key dalam source atau environment build.

## Cek hasil

Build harus menghasilkan `dist/public/index.html`, aset JavaScript/CSS, manifest, service worker, dan ikon. Refresh route pada deployment Workers juga harus tetap menampilkan aplikasi.

## Kalau gagal

Simpan hanya pesan yang sudah bebas key dan data gambar. Catat status HTTP, model, dan waktu kejadian, lalu periksa dokumentasi Google AI Studio. Jangan mengunggah API key.

## Video referensi tidak terbaca

Gunakan MP4, MOV, atau WEBM yang dapat diputar browser. Coba video yang lebih pendek atau ekspor ulang dengan codec umum. Pastikan file tidak rusak dan izin penggunaan sudah Anda miliki.

## Analisis referensi kosong atau gagal

Pastikan persetujuan referensi dicentang dan minimal satu API key Gemini aktif. Untuk file di atas 15 MB, aplikasi memakai cuplikan frame. Jika model tidak tersedia, coba lagi setelah memeriksa model Gemini dan kuota project.

## Durasi referensi terlalu panjang

Aplikasi membatasi paket ke maksimum 32 detik dan membagi hasil ke jendela 8 detik. Shot di luar 32 detik tidak dipakai. Edit tabel shot bila analisis menggabungkan potongan terlalu pendek.

## Hasil terlalu mirip dengan referensi

Tinjau prompt dan hapus detail identitas yang tidak perlu. Mode ini hanya boleh meniru format; jangan gunakan wajah, logo, musik, teks layar, dialog, atau klaim dari video sumber.

## Produk berubah atau diputar

Gunakan foto produk depan yang jelas. Tambahkan foto samping/atas hanya bila sisi tersebut memang boleh ditampilkan. Tanpa foto tambahan, prompt melarang rotasi atau kemiringan untuk memperlihatkan sisi yang tidak terlihat.

## Teks overlay salah eja

Gunakan mode Ruang kosong dan tambahkan teks di editor video. Mode Lewat prompt bersifat eksperimental dan otomatis dialihkan ke Ruang kosong pada Veo. Selalu cek ejaan pada hasil.

## Foto produk kecil

Jika sisi terpendek foto di bawah 800 px, aplikasi menampilkan peringatan. Gunakan foto lebih besar agar detail, warna, dan logo lebih akurat.

## Kit atau laporan tidak terbaca

Kit harus diawali `PROMO-KIT v1.3` dan laporan harus diawali `PROMO-REPORT v1.3`, masing-masing diikuti satu blok JSON. Jangan menempel API key, gambar, atau base64.

## Bahasa prompt

Bahasa Indonesia adalah default dan belum teruji sama baiknya pada semua model. Jika prompt sulit dipahami generator, pilih Inggris di Langkah 3.

## Kredit dan resolusi

Angka kredit Omni di aplikasi adalah perkiraan dari halaman bantuan Flow. Draf 360p hanya untuk Omni. 1080p dan 4K dilakukan melalui upscale di Flow, bukan generate asli pada aplikasi.

## Rute menu tidak berubah

Gunakan URL hash seperti `#/panduan` atau kembali ke `#/`. Aplikasi tidak membutuhkan konfigurasi server khusus untuk rute tersebut.
