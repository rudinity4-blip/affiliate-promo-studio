# Manual GitHub

## Membuat akun dan repo

1. Buka `https://github.com/` dan buat akun.
2. Pilih **New repository**.
3. Beri nama `affiliate-promo-studio`, pilih visibility sesuai kebutuhan, lalu buat repo kosong.

## Push dari PC

1. Pasang Git.
2. Di folder aplikasi jalankan `git init`, `git add .`, dan `git commit -m "Rilis awal"`.
3. Tambahkan remote GitHub dengan `git remote add origin URL_REPO`.
4. Jalankan `git branch -M main` lalu `git push -u origin main`.

## Push dari HP

Gunakan GitHub Mobile untuk membuat repo dan aplikasi editor yang mendukung Git. Unduh ZIP bersih dari komputer, buka di editor, commit, lalu push ke remote. Jangan memasukkan API key ke file.

## Cek hasil

Buka halaman repo dan pastikan `client/`, `docs/`, `CHANGELOG.md`, `wrangler.jsonc` terlihat dan konfigurasi Workers tersedia. Pastikan tidak ada `.exe`, `desktop/`, atau `legacy_release_0.3.1/`.

## Kalau gagal

Periksa URL remote, login GitHub, branch `main`, dan ukuran file. Jangan memaksa commit file rahasia; hapus key dan buat key baru bila pernah terunggah.
