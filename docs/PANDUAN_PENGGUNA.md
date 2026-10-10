# Panduan Pengguna

## 1. Siapkan bahan dan key

Unggah gambar/video subjek atau ruang/meja minimalis dan foto produk yang jelas. Pastikan semua gambar boleh Anda gunakan. Isi fakta produk, merk, dan target audiens tanpa menambahkan klaim yang belum diverifikasi.

Masukkan satu sampai lima API key Gemini. Secara default key hanya berada di memori sesi. Opsi **Ingat di perangkat ini** menyimpan key di localStorage browser; aktifkan hanya pada perangkat pribadi dan jangan gunakan untuk komputer bersama. Tombol **Tes semua key** memeriksa slot. Status hanya menampilkan empat karakter terakhir: siap, cooldown, atau mati.

> Kuota Gemini dihitung per **project** Google, bukan per key. Beberapa key dari project yang sama berbagi kuota yang sama. Gunakan key dari project berbeda milikmu sendiri sebagai cadangan, dan patuhi ketentuan layanan Google.

## 2. Pilih preset motion

Preset dikelompokkan menjadi **Faceless** dan **Dengan aktor**. Faceless otomatis meminta model tidak menampilkan wajah. Preset Dengan aktor mempertahankan pilihan seperti Joget. Pilih platform, durasi kelipatan 8 detik, rasio, nuansa, dan strategi promosi, lalu tekan **Buat paket**.

## 3. Pilih jalur hasil

**A. Frame → Video** memakai frame awal dan akhir setiap segmen bersama prompt gerak. Di tab **Frame gambar**, tekan **Buat frame gambar** secara terpisah. Aplikasi menampilkan perkiraan jumlah gambar, membuat segmen + 1 frame secara berurutan, dan menyediakan tombol unduh. Frame akhir segmen menjadi frame awal segmen berikutnya.

**B. Prompt mandiri** memakai `prompt_en` dan `prompt_id`. Keduanya sudah membawa kunci produk dan kontinuitas sehingga dapat ditempel langsung pada generator yang hanya menerima teks.

**C. Extend** hanya berisi aksi baru lanjutan. Tombol Extend berbeda menurut model generator video, jadi cek hasil dan susunan klip secara manual.

## 4. Bawa ke generator video dan editor

Salin frame serta prompt ke generator video pihak ketiga seperti Google Flow/Veo, lalu ekspor klip ke CapCut atau Canva. Tinjau setiap frame: bentuk produk, warna, tulisan label, dan logo harus tetap sama dengan foto sumber. Tambahkan overlay dari tab Overlay dan gunakan naskah Voice over hanya sebagai teks untuk suara AI atau rekaman sendiri. Video hasil aplikasi selalu tanpa suara.

## Pasang PWA di HP

Buka alamat aplikasi di browser HP, buka menu browser, lalu pilih **Tambahkan ke layar utama** atau **Install app**.

## Cek hasil

Pastikan jumlah frame sama dengan jumlah segmen + 1, frame akhir dan awal tersambung, label/logo konsisten, prompt tidak menambah klaim produk, dan semua video tanpa suara.

## Kalau gagal

Baca `docs/TROUBLESHOOTING.md` untuk cooldown, model gambar, atau masalah konsistensi. Untuk key baca `docs/MANUAL_GEMINI_API_KEY.md`.

## Mode Tiru format video referensi

Pilih video pendek yang jelas, idealnya 8–30 detik, satu gaya visual, dan memiliki shot yang mudah dibaca. Centang bahwa Anda berhak memakai video tersebut, lalu tekan **Analisis video referensi**. Analisis dilakukan di browser; video tidak diunggah ke server aplikasi. Video di atas 15 MB diproses sebagai cuplikan frame bertimestamp.

Tabel hasil dapat diedit: waktu, jenis shot, kamera, aksi, komposisi, transisi, setting, pencahayaan, warna, tempo, dan gaya overlay. Pilih **Ikuti subjek** agar wajah mengikuti bahan subjek Anda atau **Faceless** agar wajah tidak ditampilkan.

Yang ditiru hanya struktur scene, pacing, jenis shot, gerak kamera, komposisi, pencahayaan, dan gaya teks overlay. Jangan menyalin wajah, musik, logo, kata-kata di layar, dialog, lirik, atau klaim video referensi. Prompt membantu meniru format, tetapi generator video tetap dapat menghasilkan variasi dan tidak menjamin kemiripan persis.

## Scene Pack, format otomatis, dan Kit Flow v1.3

Pilih jenis subjek dan produk untuk mendapatkan format otomatis. Format fashion memakai aktor; format ruang memakai tangan dan meja. Foto Produk (samping) atau Produk (atas) hanya diperlukan bila model boleh memperlihatkan sisi tersebut. Tanpa foto sisi, produk tidak boleh diputar atau dimiringkan untuk memperlihatkan bagian yang tidak tersedia.

Scene Pack menampilkan durasi yang didukung Flow, pola **Seimbang** atau **Maksimal**, serta mode overlay. Kerjakan scene secara terpisah di Flow dan rakit di Scenebuilder. Gunakan **Salin Kit** atau **Unduh Kit .txt** untuk format `PROMO-KIT v1.3`; Kit tidak berisi API key, gambar, atau base64.

Laporan hasil dapat ditempel dalam format `PROMO-REPORT v1.3`. Skor similarity rendah menampilkan tombol perbaikan prompt scene terkait. Tinjau hasil manual karena generator dapat mengubah detail produk, teks overlay, atau gerakan.
