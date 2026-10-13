
### Bab 13: Revisi Babak 0 Manim Cholesky & Push Web (2026-10-13)
- **Problem**: Notasi L^T pada card pengenalan babak 0 belum berbentuk superskrip formal dan ukuran kontainer kartu terlalu lebar.
- **Solusi**:
  1. Teks kartu diubah memakai MarkupText tag <sup>T</sup> untuk typesetting formal eksponen transpos.
  2. Dimensi RoundedRectangle disesuaikan proporsional dengan dimensi bounding box teks (width + 0.65, height + 0.45).
  3. Video 1080p60 contoh_soal_metode_cholesky.mp4 berhasil dikompilasi ulang penuh dan diverifikasi visual frame 7.5s via OCR/vision.
  4. Build & engine test lulus (npm run test:engine && npm run build).
  5. Push ke GitHub remote main commit 4ab0497 untuk deploy live di web.
