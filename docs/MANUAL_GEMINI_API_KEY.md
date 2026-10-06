# Manual Gemini API Key

## Membuat satu atau beberapa key

1. Buka `https://aistudio.google.com/` dan masuk ke akun Google.
2. Buka **Get API key**.
3. Buat key pada project yang Anda pahami dan simpan secara aman.
4. Untuk cadangan, buat key dari project Google berbeda milik Anda sendiri. Lima slot aplikasi hanya membatasi jumlah key yang dipakai browser; key dari project yang sama tetap berbagi kuota project.
5. Tempel key ke slot aplikasi. Jangan kirim key melalui chat, URL, commit, atau file build.

Aplikasi memakai BYOK langsung dari browser. Key tidak disimpan kecuali opsi **Ingat di perangkat ini** dipilih. Kuota, nama model, dan kebijakan gratis Google dapat berubah. Patuhi ketentuan layanan Google.

## Cek hasil

Gunakan **Tes semua key**. Setelah generate, slot menampilkan hanya empat karakter terakhir dan status siap/cooldown/mati. Key tidak dimasukkan ke ekspor Markdown.

## Kalau gagal

Key 401/403 akan ditandai mati. Respons 429 membuat slot cooldown dan pool mencoba slot lain. Periksa project aktif, Gemini API, kuota, dan spasi tambahan pada key. Rotasi key di Google AI Studio bila pernah terbuka. Jangan menaruh key pada environment variable build.
