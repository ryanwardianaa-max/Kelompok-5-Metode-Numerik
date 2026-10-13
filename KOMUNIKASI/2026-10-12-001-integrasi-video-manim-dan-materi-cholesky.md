
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

## Bab 15: Penjabaran Step-by-Step Cara Hitung Minor Sylvester (M1, M2, M3) pada Babak 1 Video Manim

### 1. Masalah / Permintaan User
- User meminta penambahan penjelasan dan langkah pengerjaan cara menghitung minor-minor utama ($M_1, M_2, M_3$) pada Babak 1 (Syarat Definit Positif - Kriteria Sylvester).
- Perlu visualisasi yang runtut dari mana minor diambil pada Matriks A dan bagaimana perhitungannya.
- Ukuran font harus besar, nyaman dibaca, dan tidak bertumpuk/berdesakan.

### 2. Implementasi & Penyempurnaan Manim
1. **Pemisahan Alur Sekuensial Babak 1:**
   - Card Kanan menampilkan Syarat 1 (Simetris: $A = A^T$) dengan font besar, pemeriksaan elemen $a_{12}=a_{21}=2$, $a_{13}=a_{31}=-2$, $a_{23}=a_{32}=2$, sorotan visual elemen cermin pada Matriks A, dan badge centang hijau `✓ Syarat 1 Terpenuhi: Simetris Sempurna`.
   - Setelah penonton selesai membaca (~2.5 detik), isi berganti secara elegan ke Syarat 2 (Definit Positif - Kriteria Sylvester).
2. **Visualisasi Dinamis Perhitungan Minor Sylvester:**
   - **Minor $M_1$ ($1 	imes 1$):** Kotak sorotan hijau menyorot elemen $a_{11} = [4]$ pada Matriks A $ightarrow$ baris perhitungan: `Minor M₁ (1×1): |4| = 4 > 0`.
   - **Minor $M_2$ ($2 	imes 2$):** Kotak sorotan meluas ke submatriks $2 	imes 2$ kiri atas $ightarrow$ baris perhitungan: `Minor M₂ (2×2): det = 4(10) - 2(2) = 40 - 4 = 36 > 0`.
   - **Minor $M_3$ ($3 	imes 3$):** Kotak sorotan meluas ke matriks penuh $3 	imes 3$ $ightarrow$ baris perhitungan: `Minor M₃ (3×3): det(A) = 4(56) - 2(16) - 2(24) = 224 - 80 = 144 > 0`.
   - Muncul badge centang hijau `✓ Syarat 2 Terpenuhi: Bebas Akar Imajiner!`.
3. **Validasi & Verifikasi Video:**
   - Video dirender ulang 1080p60 Manim ke `public/videos/contoh_soal_metode_cholesky.mp4`.
   - Dilakukan ekstraksi dan analisis visual frame via `vision_analyze` untuk memverifikasi keterbacaan, headroom teks, dan sinkronisasi sorotan.
   - Self-check engine dan build Vite sukses tanpa regresi.


## Bab 16: Optimalisasi Skala Font & Padding Card Babak 1 (Syarat Simetris & Sylvester)
- **Tujuan**: Memperbesar font teks dan rumus di dalam card Syarat 1 dan Syarat 2 agar terbaca sangat nyaman dan mengisi card secara proporsional.
- **Perubahan**: 
  * Judul Syarat 1: font_size 32, subteks: font_size 24, rumus kesamaan elemen simetris: font_size 32, badge: font_size 26.
  * Penyesuaian padding card_s1 dan card_s2 dengan spacing vertikal proporsional (buff=0.36) tanpa dead space berlebih.
  * Kompilasi ulang Manim 1080p60 `contoh_soal_metode_cholesky.mp4`.
  * Verifikasi visual frame t=14s dan t=25s via vision_analyze: teks tajam, font besar, kontras tinggi, siap tayang.
