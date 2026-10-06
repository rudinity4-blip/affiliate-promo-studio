# Troubleshooting

## 404 saat refresh

Pastikan host memakai `public/_redirects` berisi `/* /index.html 200`. Untuk Workers, gunakan `not_found_handling: single-page-application` di `wrangler.jsonc`.

## Versi lama masih muncul

Service worker memakai cache berdasarkan versi. Buka DevTools, pilih Application, lakukan **Unregister** pada service worker lalu reload dengan cache dibersihkan. Deployment berikutnya dapat menaikkan `CACHE_NAME`.

## Ikon PWA tidak muncul

Pastikan `public/icon-192.png` dan `public/icon-512.png` ada, dapat diakses pada `/icon-192.png` dan `/icon-512.png`, lalu cek manifest.

## API key atau model tidak tersedia

Jalankan preflight lagi, buat key baru di Google AI Studio, dan pastikan Gemini API aktif. Model dapat berubah atau tidak tersedia pada project/region tertentu. Aplikasi mencoba fallback model dan menyamarkan key pada error.

## Build gagal karena Node

Gunakan Node.js 20 atau lebih baru dan jalankan `pnpm install` ulang. Hapus `node_modules` dan `pnpm-lock.yaml` hanya bila lockfile benar-benar konflik, lalu ulangi install.

## Cek hasil

Jalankan `pnpm install && pnpm check && pnpm build`. Periksa folder `dist/public` berisi `index.html`, aset JavaScript/CSS, manifest, redirect, dan ikon.

## Kalau gagal

Simpan pesan error tanpa API key, cek versi dengan `node --version` dan `pnpm --version`, lalu ulangi langkah terkait. Jangan mengunggah log yang berisi key atau data gambar.
