# Manual Cloudflare

## Cloudflare Pages dari GitHub

1. Buat akun di `https://dash.cloudflare.com/`.
2. Buka **Workers & Pages**, pilih **Create application**, lalu hubungkan GitHub.
3. Pilih repo dan branch `main`.
4. Isi build command `pnpm exec vite build` dan output directory `dist/public`.
5. Atur `NODE_VERSION=20` pada environment variable build.
6. Simpan. Cloudflare memberi URL `*.pages.dev`.
7. Setiap push memicu auto-deploy. Gunakan halaman deployment untuk rollback ke deployment yang lebih lama bila perlu.

## Alternatif Workers + Static Assets

File `wrangler.jsonc` di root sudah memberi contoh `assets.directory` ke `./dist/public` dan mode SPA. Setelah `pnpm build`, pasang Wrangler dan jalankan deploy sesuai dokumentasi Cloudflare. Jangan mengubah aplikasi menjadi backend.

## Cek hasil

Buka URL `pages.dev`, lakukan refresh pada route aplikasi, cek ikon PWA, dan pastikan deployment terakhir berasal dari commit terbaru.

## Kalau gagal

Periksa output directory, Node 20, build command, dan isi log deployment. Bila refresh menghasilkan 404, pastikan `public/_redirects` ikut masuk ke hasil build.
