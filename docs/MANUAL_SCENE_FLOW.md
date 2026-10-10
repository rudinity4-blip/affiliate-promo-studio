# Manual Scene Pack untuk Google Flow dan Scenebuilder

## Alur utama

1. Pilih jenis subjek: **Aktor** atau **Ruang/meja minimalis**.
2. Pilih jenis produk: **Fashion** atau **Produk umum**.
3. Pilih format otomatis yang disarankan. Format pertama dipilih otomatis, tetapi dapat diganti.
4. Unggah **Produk (depan)**. Sisi samping/atas bersifat opsional dan dipakai untuk benda seperti tumbler.
5. Pilih model, mode scene, durasi, pola durasi, dan overlay.
6. Tekan **Buat Scene Pack**, lalu kerjakan setiap scene satu per satu di Flow.
7. Gunakan **More → Add to Scene** pada hasil yang sesuai dan rakit urutannya di Scenebuilder.
8. Tempel laporan `PROMO-REPORT v1.3` untuk mencatat status dan skor similarity.

## Model dan durasi

Veo 3.1 Lite mendukung 4/6/8 detik; mode Ingredients dibatasi 8 detik. Omni Flash mendukung 4/6/8/10 detik. Pola **Seimbang** membagi durasi lebih rata, sedangkan **Maksimal** mengisi klip terpanjang terlebih dahulu.

## Overlay

- **Ruang kosong**: prompt menjaga area atas 15% dan bawah 25% kosong; tambahkan teks di editor.
- **Lewat prompt**: eksperimental dan hanya efektif untuk Omni Flash; cek ejaan.
- **Tanpa overlay**: model diminta tidak merender teks.

## Kit dan laporan

Kit hanya teks, tidak berisi API key, gambar, atau base64. Salin atau unduh Kit dari hasil. Laporan diawali `PROMO-REPORT v1.3`, lalu JSON dengan status `ok`, `ulang`, atau `gagal` dan similarity 1–5.

## Pengaturan v7

Prompt default memakai Bahasa Indonesia agar mudah diedit. Pilih Inggris bila hasil model kurang baik. Gunakan target 720p untuk unduhan langsung; 1080p dan 4K adalah upscale di antarmuka Flow sesuai paket akun. Draf 360p hanya tersedia untuk Omni.

Nama folder dan file memakai token `{proyek}`, `{no}`, `{model}`, `{durasi}`, dan `{tanggal}`. Kit v1.4 membawa konfigurasi ini ke Tool Scene Runner tanpa API key atau gambar.
