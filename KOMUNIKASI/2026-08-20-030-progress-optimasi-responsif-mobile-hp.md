# Progress Optimasi Responsif Mobile HP

Tanggal: 20 Agustus 2026
Status: Selesai

## Implementasi

- Memastikan viewport mobile memakai `viewport-fit=cover` dan skala sesuai instruksi.
- Mencegah overflow horizontal global pada `html`, `body`, dan `#root`.
- Header mobile 52px; logo 28px; brand dan badge dipadatkan; status sesi disembunyikan untuk ruang efektif.
- Navigasi berubah menjadi bottom app bar 60px dengan safe-area, ikon/label vertikal, blur, indikator aktif, dan touch target.
- Main/footer mendapat ruang bawah agar tidak tertutup app bar.
- Slide menjadi aliran vertikal; cover tidak lagi terkunci rasio 16:9; kartu anggota satu kolom.
- Visual dan poin INTI tetap tampil di bawah materi, bukan disembunyikan.
- Drawer indeks menjadi modal penuh antara header dan bottom bar.
- Numerical Lab menjadi satu kolom; form angka satu kolom; keyboard matematika 4–5 kolom dengan touch target 40px.
- Plot menjadi 260px; kontrol zoom/play lebih ramah sentuh dan dapat membungkus.
- Tabel iterasi memakai horizontal momentum scrolling.
- Arena, glosarium, tim, dan kartu metode menjadi satu kolom.
- Formula KaTeX panjang dapat digeser horizontal tanpa memotong layout.
- Custom cursor tetap dinonaktifkan pada perangkat sentuh.
- Safe-area iPhone diterapkan pada bottom bar, main, drawer, footer, dan kontrol langkah.

## Verifikasi

- `npm run lint` — lulus, 0 error.
- `npm run build` — lulus, 0 error.
- `git diff --check` — lulus.
- Vite hanya memberi peringatan chunk JavaScript >500 kB; non-blocking dan tidak terkait responsivitas.
