# Manual Gemini API Key

## 1. Membuat key

1. Buka Google AI Studio di `https://aistudio.google.com/`.
2. Masuk ke akun Google.
3. Buka menu **Get API key**.
4. Buat key baru atau pilih project yang sesuai.
5. Salin key dan tempel hanya pada kolom aplikasi.

## 2. Keamanan

Jangan membagikan key, jangan memasukkannya ke Git, jangan menaruhnya di `.env` build, dan jangan mengirimkannya lewat chat. Aplikasi menggunakan key langsung di browser dan hanya menyimpan di memori sesi, kecuali Anda sendiri mencentang pengingat perangkat.

Kuota gratis, model, dan kebijakan Google dapat berubah. Hapus atau rotasi key di Google AI Studio bila key terlanjur terbuka.

## Cek hasil

Preflight menampilkan model yang berhasil diakses. Setelah itu pembuatan paket harus menghasilkan tab hasil tanpa error key.

## Kalau gagal

Pastikan key tidak memiliki spasi tambahan, API Gemini aktif pada project, dan model tersedia di wilayah/project Anda. Coba key baru atau baca `docs/TROUBLESHOOTING.md`.
