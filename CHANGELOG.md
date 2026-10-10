# Changelog
## 7.0.0 — 2026-10-10

- Memperbarui `scenePack.ts` dengan batas referensi model, estimasi kredit Omni, target unduhan, draf 360p, bahasa prompt, dan penamaan aset.
- Mengubah UI menjadi halaman per menu berbasis hash dengan drawer/sidebar, wizard empat langkah, Proyek, Aset, Pengaturan, Riwayat, Panduan, dan Tentang.
- Menambahkan Kit/Laporan v1.4 dengan kompatibilitas impor v1.3.
- Menambahkan prompt Indonesia default, pilihan Inggris, preview penamaan, catatan upscale, dan pengaturan kredit.
- Mempertahankan mode video referensi, format otomatis, slot produk, overlay, dan alur Scene Pack tahap 6.

## 6.0.0 — 2026-10-10

- Menambahkan `adFormats.ts` untuk format iklan otomatis dari kombinasi aktor/ruang dan fashion/produk umum.
- Menambahkan `scenePack.ts` untuk model Veo 3.1 Lite dan Omni Flash, mode Flow, pola durasi, overlay, ingredients, dan aturan sisi produk.
- Menambahkan builder Scene Pack mobile-first dengan burger drawer, slot produk depan/samping/atas, resolusi foto, dan format pilihan.
- Menambahkan `kit.ts` dengan ekspor/impor `PROMO-KIT v1.3` dan `PROMO-REPORT v1.3` tervalidasi zod.
- Menambahkan Salin/Unduh Kit, impor laporan, skor similarity, dan perbaikan prompt scene.
- Mempertahankan mode video referensi tahap 3 dan meneruskan ringkasannya ke prompt Scene Pack.

## 3.0.0 — 2026-10-07

- Menambahkan `referenceVideo.ts` untuk menganalisis struktur video referensi di browser dengan inline video atau cuplikan frame bertimestamp untuk file di atas 15 MB.
- Menambahkan mode UI **Tiru video referensi**, persetujuan hak penggunaan, pilihan Ikuti subjek/Faceless, dan durasi otomatis kelipatan 8 detik maksimal 32 detik.
- Menambahkan editor shot yang dapat mengubah waktu, jenis shot, kamera, aksi, komposisi, transisi, setting, pencahayaan, warna, pacing, dan gaya overlay.
- Menggabungkan struktur referensi ke prompt promo, kartu struktur per segmen, dan mempertahankan jalur Frame → Video, Prompt mandiri, Extend, serta frame gambar.
- Menegaskan batasan bahwa identitas, wajah, musik, logo, teks layar, dialog, lirik, dan klaim referensi tidak disalin.


## 2.0.0 — 2026-10-06

- Menambahkan `geminiClient.ts` dengan `postGemini`, `GeminiError`, dan `KeyPool` maksimum lima key, rotasi, status, cooldown 429, serta redaksi key.
- Mengganti kontrak `promoPack.ts` ke `pool` dan `motionId`, menambahkan `product_lock`, prompt frame awal/akhir, dan `generateKeyframes`.
- Menambahkan `motionPresets.ts` dengan preset Faceless serta preset Dengan aktor termasuk Joget.
- Menambahkan UI lima slot key, tes key, peringatan kuota per project, dua jalur prompt, kartu kunci produk, dan galeri frame bertahap.
- Menyesuaikan panduan untuk Google Flow/Veo, CapCut/Canva, konsistensi label/logo, cooldown, RESOURCE_EXHAUSTED, dan Workers Static Assets.
- Menghapus `_redirects` sesuai deployment Workers. Tidak ada backend, database, API key repo, atau environment build.

## 1.0.0 — 2026-10-06

- Rilis awal web/PWA statis Affiliate Promo Studio.
