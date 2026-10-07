# Changelog
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
