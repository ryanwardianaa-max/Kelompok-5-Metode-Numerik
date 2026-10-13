
### Bab 13: Revisi Babak 0 Manim Cholesky & Push Web (2026-10-13)
- **Problem**: Notasi L^T pada card pengenalan babak 0 belum berbentuk superskrip formal dan ukuran kontainer kartu terlalu lebar.
- **Solusi**:
  1. Teks kartu diubah memakai MarkupText tag <sup>T</sup> untuk typesetting formal eksponen transpos.
  2. Dimensi RoundedRectangle disesuaikan proporsional dengan dimensi bounding box teks (width + 0.65, height + 0.45).
  3. Video 1080p60 contoh_soal_metode_cholesky.mp4 berhasil dikompilasi ulang penuh dan diverifikasi visual frame 7.5s via OCR/vision.
  4. Build & engine test lulus (npm run test:engine && npm run build).
  5. Push ke GitHub remote main commit 4ab0497 untuk deploy live di web.


### 14. Revisi Babak 1: Tipografi TeX Kualitas Tinggi & Pembesaran Font Syarat Cholesky (2026-10-13)
- Migrasi teks card kanan dari Pango Text ke TeX engine Manim untuk mengeliminasi cacat kerning/spasi antarhuruf.
- Peningkatan ukuran font isi card (+30%) dan penataan vertikal yang presisi:
  * Judul Syarat 1 & 2: font_size 24 (bold)
  * Rumus matematika: font_size 22 dengan perataan tanda sama dengan (=)
  * Subtitle & Badge: font_size 19 warna hijau cerah
- Penambahan intermediate step kalkulasi minor M2: 4(10) - 2(2) = 40 - 4 = 36 > 0.
- Pembuatan garis pembatas elegan antara Syarat 1 dan Syarat 2.
- Render ulang video 1080p60 selesai dan lolos inspeksi visual vision_analyze.
