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
