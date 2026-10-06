# Affiliate Promo Studio

Web/PWA statis untuk membuat paket konten promosi affiliate dari gambar/video subjek dan foto produk. Hasilnya mencakup prompt video tanpa suara, prompt lanjutan/Extend, overlay, hook, CTA, caption, hashtag, dan naskah voice over.

Aplikasi memakai model **BYOK**: API key Gemini dimasukkan user dan digunakan langsung dari browser. Key tidak disimpan di server, tidak ada database, dan tidak ada backend.

## Menjalankan lokal

1. Pasang Node.js 20 atau lebih baru dan pnpm.
2. Jalankan `pnpm install`.
3. Jalankan `pnpm dev`.
4. Buka alamat yang ditampilkan Vite.
5. Sebelum commit, jalankan `pnpm check`.
6. Buat build produksi dengan `pnpm build` (hasil di `dist/public`).

Panduan awam tersedia di folder `docs/`. Baca `docs/PANDUAN_PENGGUNA.md` untuk alur penggunaan dan `docs/MANUAL_GEMINI_API_KEY.md` untuk API key.

## Privasi dan kepatuhan

Jangan menaruh API key di kode, repo, atau environment variable build. Verifikasi semua klaim produk dan gunakan hanya gambar yang Anda berhak pakai. Video yang dirancang aplikasi selalu tanpa suara; voice over adalah naskah teks yang dapat direkam terpisah.
