
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
   - **Minor $M_1$ ($1 	imes 1$):** Kotak sorotan hijau menyorot elemen $a_{11} = [4]$ pada Matriks A $
ightarrow$ baris perhitungan: `Minor M₁ (1×1): |4| = 4 > 0`.
   - **Minor $M_2$ ($2 	imes 2$):** Kotak sorotan meluas ke submatriks $2 	imes 2$ kiri atas $
ightarrow$ baris perhitungan: `Minor M₂ (2×2): det = 4(10) - 2(2) = 40 - 4 = 36 > 0`.
   - **Minor $M_3$ ($3 	imes 3$):** Kotak sorotan meluas ke matriks penuh $3 	imes 3$ $
ightarrow$ baris perhitungan: `Minor M₃ (3×3): det(A) = 4(56) - 2(16) - 2(24) = 224 - 80 = 144 > 0`.
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

## Bab 17: Revisi Babak 2 (Faktorisasi Cholesky Kolom demi Kolom, Animasi Tektokan, Notasi LaTeX L^T, & Desain Card Efisiensi)
- **Tujuan**: Mengimplementasikan alur tektokan dinamis bertempo tenang pada perhitungan kolom 1, 2, dan 3 matriks L, memperbesar font rumus dalam card, memperbaiki notasi pangkat formal LaTeX $L^{\mathrm{T}}$ (menghapus caret `^`), serta merapikan card Catatan Efisiensi agar padat dan proporsional.
- **Perubahan**:
  * **Animasi Tektokan & Tempo Matriks**: Tiap penghitungan elemen ($l_{11}, l_{21}, l_{31}$, dst.), kotak sorot kuning mengitari elemen terkait pada Matriks A, jeda pembacaan, bertransformasi mengalir ke posisi elemen Matriks L penampung, dan memperbarui nilainya dengan angka hijau tebal. Di akhir tiap langkah, kotak hijau melingkupi seluruh kolom hasil yang telah tuntas.
  * **Tipografi & Card Dinamis**: Mengganti `Text` Pango dengan `Tex`/`MathTex` murni berukuran besar (`font_size=23-25`) dengan container yang membungkus konten rapat tanpa dead space kosong di bawah.
  * **Notasi Pangkat $L^{\mathrm{T}}$**: Seluruh judul, subjudul, dan keterangan yang sebelumnya menggunakan karakter caret literal `L^T` diperbaiki menjadi notasi formal LaTeX $L^{\mathrm{T}}$ (`L^{\mathrm{T}}`).
  * **Fix Card Fullscreen & Margin Bawah**: Matriks dinaikkan ke $y = 0{,}60$ dan card Catatan Efisiensi dinaikkan ke $y = -1{,}70$ sehingga tercipta buffer margin bawah $\sim 205\text{ px}$ (sangat aman dari control bar video player 80–120 px saat mode fullscreen). Teks baris kedua diganti kuning terang (`YELLOW_C`) dengan font 20 pt agar kontras tajam.
  * **Render & Verifikasi**: Video 1080p60 Manim dikompilasi ulang ke `public/videos/contoh_soal_metode_cholesky.mp4`, diverifikasi frame visualnya via `vision_analyze` (margin bawah lolos $>200\text{ px}$, kontras tinggi, bebas overlap), build engine/web lulus.

## Bab 18: Revisi Babak 3.a (Tahap 1 SPL: Substitusi Maju L · y = b, Tektokan Matriks-Perhitungan, Font Besar, & Format Vektor Antara Formal)
- **Tujuan**: Mengimplementasikan visualisasi tektokan bertempo pada Babak 3.a antara ruas matriks kiri ($L \cdot \mathbf{y} = \mathbf{b}$) dan card langkah perhitungan aljabar di kanan, memperbesar ukuran font secara proporsional tanpa dead space, memformat Baris 3 dua tingkat terstruktur, serta menyajikan Hasil Vektor Antara $\mathbf{y} = [1, 7, -1]^\mathrm{T}$ dalam badge kontras tinggi ber-superscript formal LaTeX.
- **Perubahan**:
  * **Animasi Tektokan Sinkron**:
    - Baris 1: Kotak kuning menyorot baris 1 matriks $L$ `[2, 0, 0]` dan baris 1 vektor $\mathbf{b}$ `[2]` $
ightarrow$ card kanan menuliskan $\text{Baris 1: } 2y_1 = 2 \implies y_1 = 1$ $
ightarrow$ entri $y_1$ pada vektor $\mathbf{y}$ di kiri otomatis bertransformasi menjadi angka `1` hijau.
    - Baris 2: Kotak kuning menyorot baris 2 matriks $L$ `[1, 3, 0]` dan baris 2 vektor $\mathbf{b}$ `[22]` $
ightarrow$ card kanan menuliskan $\text{Baris 2: } 1(1) + 3y_2 = 22 \implies 3y_2 = 21 \implies y_2 = 7$ $
ightarrow$ entri $y_2$ bertransformasi menjadi angka `7` hijau.
    - Baris 3: Kotak kuning menyorot baris 3 matriks $L$ `[-1, 1, 2]` dan baris 3 vektor $\mathbf{b}$ `[4]` $
ightarrow$ card kanan menampilkan penjabaran dua tingkat: $-1(1) + 1(7) + 2y_3 = 4 \implies 6 + 2y_3 = 4 \implies 2y_3 = -2 \implies y_3 = -1$ $
ightarrow$ entri $y_3$ bertransformasi menjadi angka `-1` hijau.
  * **Badge Hasil Vektor Antara**: Kotak hijau melingkupi seluruh vektor $\mathbf{y}$ di ruas kiri, diiringi kemunculan sub-badge berlatar slate gelap bergaris tepi emas: $\mathbf{y} = \begin{bmatrix} 1 & 7 & -1 \end{bmatrix}^{\mathrm{T}}$ dengan notasi superskrip formal (bebas caret `^`).
  * **Optimalisasi Card & Font**: Ukuran font dinaikkan drastis (`font_size=22-24`), container card membungkus konten rapat tanpa ruang kosong berlebih, dan posisi dinaikkan sehingga sisa jarak bawah layar $\approx 310\text{ px}$ (sangat aman dari control bar video player fullscreen).
  * **Render & Verifikasi**: Video 1080p60 Manim dirender ulang ke `public/videos/contoh_soal_metode_cholesky.mp4`, diverifikasi visual frame aktual via `vision_analyze` (keterbacaan sempurna, aljabar lengkap, notasi formal, aman kontrol bar), dan seluruh test engine/build Vite lulus 100%.

## Bab 19: Revisi Babak 3.b (Tahap 2 SPL: Substitusi Mundur L^T · x = y, Tektokan Bawah-ke-Atas, Pecahan Murni Tanpa Desimal, & Verifikasi Eksak)
- **Tujuan**: Menerapkan pola animasi tektokan berirama serupa Babak 3.a pada Babak 3.b (Substitusi Mundur $L^\mathrm{T} \cdot \mathbf{x} = \mathbf{y}$ dari bawah ke atas), menyajikan seluruh angka dan aljabar dalam notasi pecahan murni (mutlak tanpa desimal seperti $-0{,}5$ atau $2{,}5$), memastikan pecahan vertikal pada vektor $\mathbf{x}$ tidak saling tumpang tindih (*no collision*), serta menyelaraskan Babak 4 (Verifikasi Residu) dengan format pecahan murni.
- **Perubahan**:
  * **Penyajian Pecahan Murni (Zero Decimal)**:
    - Seluruh nilai aljabar di card kanan ditulis dalam pecahan formal vertikal:
      - Baris 3: $2x_3 = -1 \implies x_3 = -\frac{1}{2}$
      - Baris 2: $3x_2 + 1(-\frac{1}{2}) = 7 \implies 3x_2 = \frac{15}{2} \implies x_2 = \frac{5}{2}$
      - Baris 1: $2x_1 + 1(\frac{5}{2}) - 1(-\frac{1}{2}) = 1 \implies 2x_1 + 3 = 1 \implies x_1 = -1$
    - Format solusi akhir SPL: $\mathbf{x} = \begin{bmatrix} -1 & \frac{5}{2} & -\frac{1}{2} \end{bmatrix}^{\mathrm{T}}$ (pecahan murni, notasi superskrip formal $^{\mathrm{T}}$, tanpa caret `^`).
    - Penyamaan format pada Babak 4 Verifikasi Residu $A \cdot \mathbf{x} = \mathbf{b}$ dengan pecahan murni: $4(-1) + 2(\frac{5}{2}) - 2(-\frac{1}{2}) = 2$, dst.
  * **Animasi Tektokan Sinkron Bawah ke Atas**:
    - Baris 3: Kotak kuning menyorot baris 3 $L^\mathrm{T}$ `[0, 0, 2]` dan baris 3 $\mathbf{y}$ `[-1]` $
ightarrow$ card kanan memunculkan aljabar Baris 3 $
ightarrow$ entri $x_3$ pada vektor $\mathbf{x}$ di ruas kiri bertransformasi menjadi $-\frac{1}{2}$ biru.
    - Baris 2: Kotak kuning menyorot baris 2 $L^\mathrm{T}$ `[0, 3, 1]` dan baris 2 $\mathbf{y}$ `[7]` $
ightarrow$ card kanan memunculkan aljabar Baris 2 $
ightarrow$ entri $x_2$ bertransformasi menjadi $\frac{5}{2}$ biru.
    - Baris 1: Kotak kuning menyorot baris 1 $L^\mathrm{T}$ `[2, 1, -1]` dan baris 1 $\mathbf{y}$ `[1]` $
ightarrow$ card kanan memunculkan aljabar Baris 1 $
ightarrow$ entri $x_1$ bertransformasi menjadi $-1$ biru.
  * **Perbaikan Jarak Vertikal Vektor x (No Collision)**:
    - Mengatur `v_buff=0.88` pada matriks $L^\mathrm{T}$, $\mathbf{x}$, dan $\mathbf{y}$, serta penskalaan entri pecahan bertingkat pada vektor $\mathbf{x}$, menjamin pemisahan vertikal yang sangat bersih antara $\frac{5}{2}$ dan $-\frac{1}{2}$ tanpa benturan glif atau tanda minus.
  * **Tipografi, Dimensi Card, & Safe-Zone Fullscreen**:
    - Ukuran font dinaikkan (`font_size=21-24`), card membungkus konten secara presisi dengan garis batas biru cerah (`BLUE_C`), dan margin bawah frame menyisakan ruang $\approx 25\%$ tinggi kanvas (bebas aman dari control bar fullscreen).
  * **Render & Verifikasi**:
    - Kompilasi Manim 1080p60 tuntas 136 animasi ke `public/videos/contoh_soal_metode_cholesky.mp4`.
    - Verifikasi visual frame aktual t=94s (Babak 3.b) dan t=100s (Babak 4) via `vision_analyze` mengonfirmasi: pecahan vertikal bersih, nol desimal, superskrip formal, aljabar lengkap, dan margin bawah aman.
    - Pengujian engine `npm run test:engine` & build `npm run build` lolos $100\%$ tanpa kesalahan.

## Bab 20: Revisi Babak 4 (Kesimpulan: Pembesaran Tipografi Card Kesimpulan & Evaluasi Langkah Tengah Pecahan Eksak)
- **Tujuan**: Membesarkan ukuran seluruh elemen teks, rumus matematika, matriks substitusi, dan badge di dalam card Kesimpulan (Babak 4: Verifikasi Solusi Akhir Metode Cholesky) agar terbaca jelas, padat, dan nyaman dilihat, menghilangkan ruang kosong berlebih di dalam card, serta menyajikan evaluasi langkah tengah perkalian matriks dengan pecahan secara gamblang.
- **Perubahan**:
  * **Peningkatan Signifikan Tipografi Seluruh Komponen Card**:
    - Header scene: ditingkatkan dari `font_size=25` Text biasa menjadi `font_size=32` Tex tebal warna kuning emas (`YELLOW_C`).
    - Subjudul solusi: ditingkatkan dari `font_size=18` menjadi `font_size=24` Tex tebal putih (`WHITE_C`).
    - Vektor solusi SPL $\mathbf{x}$: ditingkatkan dari `font_size=24` menjadi `font_size=28` MathTex emas dengan spasi vertikal antar-baris `4pt` ($[-1, \frac{5}{2}, -\frac{1}{2}]^\mathrm{T}$).
    - Subjudul substitusi balik $A \cdot \mathbf{x} = \mathbf{b}$: ditingkatkan dari `font_size=15` menjadi `font_size=22` Tex hijau cerah (`GREEN_C`).
    - Persamaan evaluasi perkalian matriks: ditingkatkan dari `font_size=16` menjadi `font_size=23` MathTex putih, dilengkapi langkah tengah aritmetika elemen pecahan:
      $$\begin{bmatrix} 4 & 2 & -2 \\ 2 & 10 & 2 \\ -2 & 2 & 6 \end{bmatrix} \begin{bmatrix} -1 \\ \frac{5}{2} \\ -\frac{1}{2} \end{bmatrix} = \begin{bmatrix} -4 + 5 + 1 \\ -2 + 25 - 1 \\ 2 + 5 - 3 \end{bmatrix} = \begin{bmatrix} 2 \\ 22 \\ 4 \end{bmatrix} = \mathbf{b}$$
    - Badge konklusi: ditingkatkan dari `font_size=15` menjadi `font_size=22` Tex hijau muda terang (`LIGHT_GREEN`), dibungkus pill rounded rectangle hijau gelap bergaris tepi emerald tebal.
  * **Dimensi Card Adaptif & Safe-Zone**:
    - Lebar card disesuaikan menjadi `width=11.6` dengan padding simetris dan tinggi dinamis mengikuti konten (`height=card_content.height + 0.55`).
    - Margin bawah menyisakan ruang $>15\%$ tinggi layar kanvas sehingga bebas dari gangguan overlay bilah kontrol fullscreen.
  * **Render & Verifikasi Visual**:
    - Kompilasi Manim 1080p60 tuntas 137 animasi ke `public/videos/contoh_soal_metode_cholesky.mp4`.
    - Ekstraksi frame aktual t=102s via ffmpeg diverifikasi dengan `vision_analyze`: tipografi besar, tebal, kontras tinggi, pecahan murni tanpa desimal, dan tata letak membungkus rapi.
    - Pengujian engine `npm run test:engine` dan build `npm run build` lolos $100\%$ tanpa kesalahan ($0$ warning error).

## Bab 21: Overhaul Kalkulator SPL: Fokus 3 Fitur Utama (Crout, Cholesky, & Uji Definit Positif Sylvester) dengan Langkah Terperinci
- **Tujuan**: Merestrukturisasi antarmuka dan komputasi pada kalkulator numerik agar fokus eksklusif pada 3 fitur inti yang diminta:
  1. Dekomposisi LU Crout ($u_{ii}=1$),
  2. Dekomposisi LU Cholesky ($A = L \cdot L^T$),
  3. Uji Definit Positif (Kriteria Sylvester),
  menghapus fitur preset agar antarmuka bersih dan profesional, serta menyajikan perincian langkah demi langkah (step-by-step) komprehensif saat tombol hitung diklik.
- **Perubahan Komprehensif**:
  * **Penyederhanaan Mode Kalkulator**:
    - Menghilangkan metode Eliminasi Gauss dan LU Doolittle dari antarmuka kalkulator; hanya menyediakan 3 tab metode pilihan yang relevan.
    - Menghapus komponen tombol preset statis (`presets`) agar kalkulator berorientasi mandiri pada input fleksibel pengguna ($2 \times 2$ dan $3 \times 3$).
  * **Penyempurnaan Engine Numerik (`src/engine.ts`)**:
    - `solveCrout`: Menghasilkan rincian langkah faktorisasi elemen $L$ dan $U$ per kolom/baris, langkah substitusi maju $L\mathbf{y}=\mathbf{b}$ dengan formula dan nilai per baris, langkah substitusi mundur $U\mathbf{x}=\mathbf{y}$, serta tabel evaluasi residu perkalian matriks $A\mathbf{x}=\mathbf{b}$.
    - `solveCholesky`: Menghasilkan verifikasi simetri dan definit positif, rincian faktorisasi elemen diagonal $l_{jj} = \sqrt{a_{jj} - \sum l_{jk}^2}$ dan non-diagonal $l_{ij}$, langkah substitusi maju $L\mathbf{y}=\mathbf{b}$, langkah substitusi mundur $L^T\mathbf{x}=\mathbf{y}$, serta tabel evaluasi residu perkalian matriks $A\mathbf{x}=\mathbf{b}$.
    - `checkPositiveDefinite`: Memeriksa simetri matriks ($A = A^T$) dan kriteria Sylvester dengan menghitung seluruh minor utama terkemuka $\Delta_1, \Delta_2, \dots, \Delta_n$ (determinan submatriks pojok kiri atas), formula eksplisit determinan, serta analisis kelayakan faktorisasi Cholesky.
  * **Penyempurnaan Antarmuka Pengguna (`src/App.tsx`)**:
    - Kontrol Matriks A dan Vektor b yang dinamis dan proporsional untuk ukuran 2x2 dan 3x3.
    - Untuk mode Uji Definit Positif, input vektor b otomatis disembunyikan secara elegan dengan penjelasan bahwa Kriteria Sylvester beroperasi pada matriks persegi A.
    - Visualisasi hasil step-by-step: card solusi akhir, matriks segitiga berformat tabel dengan penyorotan warna diagonal, accordion langkah faktorisasi, rincian substitusi maju dan mundur, serta tabel verifikasi residu eksak.
  * **Pengujian dan Validasi**:
    - Engine unit test `npm run test:engine` lulus mencakup uji solver Crout, Cholesky, dan Kriteria Sylvester.
    - Web bundle build `npm run build` lulus $100\%$ ($0$ lint error).

## Bab 22: Transformasi Penuh Desimal Menjadi Pecahan Rasional Eksak (Fractions Everywhere)
- **Tujuan**: Menghilangkan seluruh representasi desimal floating-point pada kalkulator numerik dan menggantikannya secara konsisten dengan representasi pecahan rasional analitis eksak ($p/q$ atau $\frac{p}{q}$), sesuai instruksi langsung pengguna ("jangan menggunakan desimal, tapi pecahan aja").
- **Perubahan Komprehensif**:
  * **Helper Konversi Pecahan Rasional Eksak (`toFraction`, `fmtFrac`, `fmtLatex`, `formatSqrt` di `src/engine.ts`)**:
    - Menerapkan algoritma ekspansi pecahan berlanjut (*continued fractions expansion*) untuk mendeteksi aproksimasi rasional terbaik $p/q$ dari nilai floating point secara eksak.
    - Menghasilkan string teks biasa `$p/q$` (misal `5/2`, `-1/2`, `1/3`) dan format KaTeX/LaTeX `\frac{p}{q}` (misal `\frac{5}{2}`, `-\frac{1}{2}`, `\frac{1}{3}`).
    - `formatSqrt`: Mengonversi nilai dalam bentuk akar pada diagonal Cholesky menjadi pecahan eksak jika radikan berupa bilangan kuadrat sempurna, atau bentuk radikal pecahan murni `\sqrt{p/q}` bila irasional.
  * **Pembaruan Engine Langkah Demi Langkah (`src/engine.ts`)**:
    - Seluruh string langkah kalkulasi elemen $L$, $U$, substitusi maju $L\mathbf{y}=\mathbf{b}$, substitusi mundur $U\mathbf{x}=\mathbf{y}$ / $L^{\mathrm{T}}\mathbf{x}=\mathbf{y}$, dan verifikasi $A\mathbf{x}=\mathbf{b}$ dikonversi ke pecahan eksak murni tanpa desimal berkoma.
    - Minor determinan kriteria Sylvester disajikan dalam ekspresi pecahan rasional eksak.
  * **Pembaruan Antarmuka Pengguna (`src/App.tsx`)**:
    - Nilai vektor solusi akhir $\mathbf{x}$ ditampilkan dalam format KaTeX pecahan rasional bertumpuk (contoh: $x_1 = -1$, $x_2 = \frac{5}{2}$, $x_3 = -\frac{1}{2}$).
    - Vektor perantara $\mathbf{y}$ ditampilkan dalam format matriks transpos pecahan murni.
    - Sel-sel tabel matriks $L$, $U$, $L^{\mathrm{T}}$, dan submatriks minor Sylvester dirender menggunakan `<InlineMath math={fmtLatex(val)} />` sehingga menampilkan pecahan bertumpuk profesional.
    - Baris evaluasi substitusi verifikasi perkalian matriks $A\mathbf{x} = \mathbf{b}$ menyajikan suku-suku pecahan eksak dan residu pecahan.
  * **Pengujian dan Validasi**:
    - Pengujian `npm run test:engine` (Crout, Cholesky, Sylvester) lulus $100\%$ (exit code $0$).
    - Kompilasi `npm run build` sukses $100\%$ tanpa peringatan error.

## Bab 23: Penyempurnaan Spasi Tipografi Pecahan, Pelebaran Tata Letak, dan Standarisasi Notasi Subskrip Matematika
- **Tujuan**: Memperbaiki tata letak visual kalkulator agar tidak berdesakan/sempit, memperbesar ukuran dan spasi vertikal pecahan (`\dfrac`), memperlebar kolom input agar matriks $A$, $x$, dan $b$ tidak terpotong horizontal scrollbar, serta membersihkan seluruh kebocoran karakter underscore (`_`) menjadi notasi subskrip matematika baku ($x_1, x_2, x_3, a_{11}, l_{11}, u_{12}, y_1, \Delta_k$).
- **Perubahan Komprehensif**:
  * **Eliminasi Total Underscore Bocor ke Notasi Subskrip Baku**:
    - Ditambahkan helper `toSub` di `src/engine.ts` untuk memetakan indeks angka dan huruf ke karakter subskrip Unicode murni ($₀, ₁, ₂, ₃, ᵢ, ⱼ, ₖ$) pada teks narasi.
    - Mengganti seluruh label teks polos seperti `x_{i+1}` pada kotak vektor variabel dengan komponen KaTeX `<InlineMath math={`x_{${i+1}}`} />`.
    - Pada kartu langkah faktorisasi dan substitusi, judul dan formula disajikan dalam KaTeX berindeks murni tanpa underscore ($l_{11}, u_{12}, y_1, x_1, \Delta_k$).
  * **Pelebaran Grid dan Eliminasi Scrollbar Terpotong**:
    - Kolom kontrol `.labgrid` di `src/App.css` diperlebar dari 310px menjadi `minmax(400px, 460px) 1fr` dengan gap 24px, sehingga input matriks $A$, tanda dot perkalian, vektor variabel $x$, tanda sama dengan, dan vektor $b$ termuat lega tanpa terpotong scrollbar horizontal.
    - Ukuran kotak input matriks dan vektor diperbesar menjadi $64 \times 42\text{ px}$ dengan font tebal $1.05\text{ rem}$.
  * **Tipografi Pecahan Lega dan Proporsional (`\dfrac`)**:
    - Mengonversi format LaTeX pecahan pada `toFraction` menggunakan `\dfrac` (display fraction) sehingga pembilang dan penyebut memiliki ukuran proporsional penuh dan vinculum (garis pecahan) memiliki jarak vertikal lega dari subskrip.
    - Sel tabel matriks $L, U, L^{\mathrm{T}}$ diperbesar dengan padding `10px 14px` dan tinggi sel minimum `46px` untuk kenyamanan visual.
    - Vektor perantara $y$ disajikan dalam badge kartu mandiri berjarak lega per elemen ($y_1, y_2, y_3$), seragam dengan vektor solusi $x$.
    - Evaluasi verifikasi $A\mathbf{x} = \mathbf{b}$ disajikan dalam notasi matematika KaTeX rapi dengan tanda perkalian `\cdot` yang berjarak.
  * **Pengujian dan Validasi**:
    - Uji solver mandiri `npm run test:engine` lulus sukses ($0$ error).
    - Kompilasi produksi `npm run build` berhasil ($100\%$ valid).

### 24. Perombakan Total Bagian Latihan & Kuis Menjadi Soal Esai HOTS (2026-10-14)
* **Latar Belakang**:
  - Pengguna meminta kuis pilihan ganda interaktif dirombak total menjadi penampilan soal esai analitis mendalam tanpa interaktivitas tombol/skor pilihan ganda.
  - Soal 1 dan 2 bersumber langsung dari berkas naskah PDF kelompok `SOAL_KELOMPOK 4.pdf` (Studi Kasus HOTS C6 "Jembatan Rahasia Crout & Cholesky").
  - Soal 3 dibuat baru: sebuah sistem persamaan linear (SPL) simetris dan definit positif berukuran $3 \times 3$ yang dapat diselesaikan baik dengan metode Crout maupun Cholesky, berbeda dari contoh slide, dan dirancang khusus agar dapat diuji langsung oleh audiens menggunakan Numerical Lab pada aplikasi. Isi kalkulator tidak diubah sama sekali.
* **Tindakan yang Dilakukan**:
  * **Ekstraksi dan Digitalisasi Soal dari PDF**:
    - Membaca dokumen `Downloads/SOAL_KELOMPOK 4.pdf` dan mengekstrak teks studi kasus HOTS C6.
    - Mengonversi halaman 1 dan 2 PDF menjadi citra resolusi tinggi di `public/soal_hots_p1.png` dan `public/soal_hots_p2.png` serta menyalin berkas asli ke `public/SOAL_KELOMPOK_4.pdf`.
  * **Penyusunan 3 Soal Esai Analitis**:
    1. **Soal 1 (C6 HOTS: Rekonstruksi Tanpa Matriks Asli, Bobot 50%)**:
       - Diketahui matriks $A$ simetris definit positif ($3 \times 3$), matriks atas Crout $U_C = \begin{bmatrix} 1 & 2 & -1 \\ 0 & 1 & 3 \\ 0 & 0 & 1 \end{bmatrix}$, diagonal Cholesky $L_{Ch} = [\alpha, 2\alpha, \alpha\sqrt{5}]$, dan $\det(A) = 1280$.
       - Menentukan nilai parameter $\alpha = 2$ serta seluruh elemen matriks segitiga bawah Crout $L_C$ tanpa mencari matriks $A$ terlebih dahulu melalui hubungan $L_C = U_C^{\mathrm{T}} D$.
    2. **Soal 2 (C6 HOTS: Transformasi Vektor Substitusi Maju, Bobot 50%)**:
       - Diketahui vektor perantara substitusi maju Cholesky $\mathbf{y}_{Ch} = [2, 4, \sqrt{5}]^{\mathrm{T}}$.
       - Menentukan vektor perantara Crout $\mathbf{y}_C = [1, 1, 1/2]^{\mathrm{T}}$ melalui transformasi $\mathbf{y}_C = D^{-1/2}\mathbf{y}_{Ch}$.
    3. **Soal 3 (Studi Kasus SPL Baru untuk Uji Audiens & Numerical Lab)**:
       - Diberikan SPL:
         $$\begin{bmatrix} 9 & 6 & 3 \\ 6 & 20 & -2 \\ 3 & -2 & 6 \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \\ x_3 \end{bmatrix} = \begin{bmatrix} 33 \\ 26 \\ 22 \end{bmatrix}$$
       - Uji Kriteria Sylvester: $\Delta_1 = 9 > 0, \Delta_2 = 144 > 0, \Delta_3 = 576 > 0$ (terbukti simetris dan definit positif).
       - Faktorisasi Cholesky: $L = \begin{bmatrix} 3 & 0 & 0 \\ 2 & 4 & 0 \\ 1 & -1 & 2 \end{bmatrix}$, $\mathbf{y} = [11, 1, 6]^{\mathrm{T}}$, $\mathbf{x} = [2, 1, 3]^{\mathrm{T}}$.
       - Faktorisasi Crout: $L = \begin{bmatrix} 9 & 0 & 0 \\ 6 & 16 & 0 \\ 3 & -4 & 4 \end{bmatrix}$, $U = \begin{bmatrix} 1 & 2/3 & 1/3 \\ 0 & 1 & -1/4 \\ 0 & 0 & 1 \end{bmatrix}$, $\mathbf{y} = [11/3, 1/4, 3]^{\mathrm{T}}$, $\mathbf{x} = [2, 1, 3]^{\mathrm{T}}$.
       - Callout khusus mengajak audiens menguji matriks dan vektor ini secara mandiri pada Numerical Lab.
  * **Penyajian Antarmuka & Navigasi Tab**:
    - Mengganti komponen kuis lama dengan `EssayExercisesSlide` yang dilengkapi tab navigasi: `Semua Soal (1, 2, & 3)`, `Soal 1`, `Soal 2`, `Soal 3`, dan `Naskah Asli PDF` (beserta tombol unduh berkas PDF).
    - Membuka tata letak slide esai secara penuh (`fullWidth`) tanpa panel samping sempit untuk keterbacaan optimal.
  * **Pengujian dan Validasi**:
    - Uji komputasi matematika solver dan pengujian unit `npm run test:engine` lulus $100\%$ ($0$ error).
    - Kompilasi produksi `npm run build` sukses tanpa kendala.
