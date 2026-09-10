# Log Komunikasi: Penyesuaian Materi Kelompok 4 & Jadwal Pertemuan 05

**Tanggal:** Kamis, 10 September 2026  
**Mata Kuliah:** Metode Numerik (KP21517001) - Kelas C  
**Repositori:** `ryanwardianaa-max/Kelompok-5-Metode-Numerik`  
**Deploy Vercel:** `https://kelompok-5-metode-numerik.vercel.app`

---

## Ringkasan Perubahan
1. **Pembaruan Nomor Kelompok & Pertemuan:**
   - Disesuaikan dari *Kelompok 5* menjadi **Kelompok 4**.
   - Penentuan jadwal giliran presentasi: **Pertemuan 05** (karena Pertemuan 02 baru Kelompok 1 yang maju, Pertemuan 03 untuk Kelompok 2, Pertemuan 04 untuk Kelompok 3, dan Pertemuan 05 giliran Kelompok 4).
2. **Pembaruan Anggota Tim:**
   - Menghapus anggota non-kelompok: Dini Astriani dan Qurrota Aini.
   - Menetapkan susunan resmi 3 anggota:
     - **Ryan Wardiana** (NPM 232151098) - *Ketua / Lead*
     - **Najla Aisyah** (NPM 232151087) - *Anggota*
     - **Nabila Fitria Nuroktavianty Rosadi** (NPM 232151088) - *Anggota*
3. **Penyempurnaan Materi Presentasi (18 Slide Terstruktur):**
   - Penjelasan filosofis metode terbuka vs metode tertutup menggunakan analogi konkret.
   - Derivasi analitis Newton-Raphson dari Deret Taylor Orde-1.
   - Karakteristik konvergensi kuadratik ($p=2$) dan titik gagal/kelemahan.
   - Metode Secant sebagai solusi hampiran tanpa turunan analitis ($p \approx 1{,}618$).
   - Penambahan materi resmi silabus: **Sistem Persamaan Nirlanjar (SPNL)** dengan pendekatan **Matriks Jacobian $J(\mathbf{x})$**.
   - Contoh perhitungan numerik langkah demi langkah (Variabel $\to$ Nilai $\to$ Substitusi) untuk Newton-Raphson, Secant, dan SPNL Jacobian.
   - Glosarium dan kuis interaktif 3 babak terkalibrasi materi.
4. **Sinkronisasi Build & Deploy:**
   - `npm run build` lolos tanpa error TypeScript/bundling.
   - Commit & push ke `main` di GitHub repo `Kelompok-5-Metode-Numerik`.
   - Vercel berhasil auto-deploy dengan judul dan konten baru.
