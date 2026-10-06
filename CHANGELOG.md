# Changelog

## 1.0.0 — 2026-10-06
- Mengganti generator lama dengan `client/src/lib/promoPack.ts` dan schema JSON tervalidasi.
- Menambahkan preflight koneksi Gemini, fallback model, redaksi API key, serta ekstraksi frame video.
- Menyusun wizard UI 4 langkah: bahan visual, detail produk, pengaturan, dan hasil.
- Menambahkan tab prompt EN/ID/Extend, overlay, copywriting, voice over, kepatuhan, dan ekspor Markdown.
- Membersihkan plugin Manus, server Express, proxy storage, aset debug, desktop, installer, dan legacy release.
- Mengubah PWA ke ikon lokal, service worker network-first, redirect SPA, serta dokumentasi deployment.
- Perbaikan minimal pada modul inti: konteks strategi promosi diteruskan sebagai `promotionStrategy`; pesan error Gemini dibuat ramah Bahasa Indonesia dan tetap meredaksi key.
