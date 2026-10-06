# Manual Domain Gratis

## Kenyataan penting

Domain gratis paling praktis biasanya berupa subdomain, misalnya `nama.pages.dev`. Opsi lain seperti `eu.org` atau `is-a.dev`/Open Domains memiliki syarat, review, dan kebijakan yang dapat berubah. Cek situs resmi masing-masing sebelum mendaftar. Untuk brand yang serius, domain berbayar murah biasanya lebih stabil.

## Custom Domain di Cloudflare

1. Buka project Pages dan pilih **Custom domains**.
2. Masukkan domain Anda dan ikuti instruksi Cloudflare.
3. Bila memakai DNS eksternal, buat record CNAME dari subdomain ke `nama.pages.dev`.
4. Tunggu propagasi dan aktifkan HTTPS.

## Cek hasil

Buka domain baru di mode incognito, cek HTTPS, refresh route, dan pastikan halaman tampil.

## Kalau gagal

Periksa penulisan CNAME, status DNS, nameserver, dan apakah domain sudah dipakai project lain. Propagasi bisa memerlukan waktu.
