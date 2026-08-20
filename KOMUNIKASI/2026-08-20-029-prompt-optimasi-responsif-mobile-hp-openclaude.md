# Instruksi & Panduan Prompt: Optimasi Responsif Mobile (HP) Webapp Presentasi
- **Nomor Dokumen:** 2026-08-20-029
- **Tanggal:** 20 Agustus 2026
- **Pengirim:** Antigravity (Arsitek Sistem) & Ryan Wardiana (Product Owner)
- **Penerima:** OpenClaude / Claude AI Assistant
- **Topik:** Optimasi UI/UX Responsif & Kompatibilitas Layar HP (Smartphone) 100% Sempurna

---

## 📱 Ringkasan Kebutuhan:
Aplikasi web presentasi interaktif **Metode Numerik - Akar Persamaan Nonlinier II (Kelompok 5)** saat ini sudah berjalan baik di layar laptop/desktop. Product Owner (Ryan Wardiana) meminta agar aplikasi ini **100% optimal, kompatibel, dan nyaman diakses melalui smartphone / HP**.

Semua fitur, elemen, grafik, rumus matematika KaTeX, slide presentasi, numerical lab, arena komparasi, dan halaman knowledge base harus masuk ke dalam layar HP dengan rapi tanpa ada elemen yang terpotong atau menimbulkan overflow horizontal.

---

## 🎯 Prompt Siap Pakai untuk OpenClaude:

Salin (*copy*) dan berikan seluruh teks prompt di bawah ini ke **OpenClaude**:

```text
Halo OpenClaude! Tolong optimalkan seluruh tampilan UI/UX webapp presentasi Metode Numerik (React + TypeScript + Vite) agar 100% responsif, nyaman, dan presisi saat dibuka di perangkat HP / Smartphone (layar 360px - 480px) tanpa merusak tampilan desktop yang sudah ada.

Lokasi File Proyek:
- CSS Utama: `01_Bahan_Presentasi/webapp-presentasi/src/App.css`
- Komponen & JSX: `01_Bahan_Presentasi/webapp-presentasi/src/App.tsx`
- HTML Template: `01_Bahan_Presentasi/webapp-presentasi/index.html`

Berikut adalah checklist spesifikasi teknis dan aturan responsif HP yang wajib diterapkan:

================================================================================
1. META VIEWPORT & OVERFLOW GLOBAL (index.html & App.css)
================================================================================
- Pastikan di `index.html`: <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
- Di `App.css`: Cegah horizontal bounce / horizontal scroll yang tidak diinginkan:
  ```css
  html, body, #root {
    max-width: 100vw;
    overflow-x: hidden;
    -webkit-tap-highlight-color: transparent;
  }
  ```

================================================================================
2. HEADER & BOTTOM NAVIGATION BAR PADA HP (@media (max-width: 768px))
================================================================================
- Header Atas:
  - Tinggi kompak: `height: 52px; padding: 0 14px;`
  - Logo UNSIL: `width: 28px; height: 28px;`
  - Teks brand: `font-size: 0.92rem; font-weight: 700;`
  - Badge KELOMPOK 5: `font-size: 0.65rem; padding: 3px 8px;`
  - Tombol Layar Penuh: tetap ada dan mudah disentuh (min touch target 36px).
- Bottom Navigation Bar (Mobile App Style):
  - Pada HP, ubah `<nav>` menjadi bar navigasi bawah tetap (*fixed bottom bar*):
    ```css
    @media (max-width: 768px) {
      nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        height: 60px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-top: 2px solid var(--ink);
        border-bottom: none;
        z-index: 100;
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 4px 6px;
      }
      nav button {
        min-width: 0;
        flex: 1;
        font-size: 0.68rem;
        flex-direction: column;
        gap: 2px;
        padding: 4px 2px;
        border: none;
        background: transparent;
      }
      nav button.active {
        border-bottom: none;
        border-top: 3px solid var(--blue);
        background: var(--low);
        border-radius: 6px;
        color: var(--blue);
      }
      nav button svg {
        width: 18px;
        height: 18px;
      }
      main {
        padding: 14px 12px 80px; /* beri padding bawah agar tidak tertutup nav */
      }
    }
    ```

================================================================================
3. SLIDE PRESENTASI & DECK PADA HP
================================================================================
- Pada HP, bingkai `.slide` tidak boleh kaku 16:9 yang mengecilkan font. Gunakan layout vertikal yang mengalir alami (*natural fluid flow*):
  ```css
  @media (max-width: 768px) {
    .slide {
      aspect-ratio: auto;
      min-height: auto;
      grid-template-columns: 1fr;
      border-radius: 12px;
    }
    .slide > div:not(.progress) {
      padding: 16px 14px;
    }
    .slide h1 {
      font-size: 1.35rem;
      margin-bottom: 8px;
    }
    .slide .katex-display {
      font-size: 0.85rem;
      overflow-x: auto;
      padding: 4px 0;
    }
    .slide ul {
      font-size: 0.82rem;
      padding-left: 1.1em;
      line-height: 1.5;
    }
    /* Slide Aside (Visual + Inti) di HP */
    .slide aside {
      border-left: none;
      border-top: 2px solid var(--ink);
      padding: 14px;
      gap: 12px;
      background: var(--low);
    }
    .slide-visual {
      padding: 12px 8px;
    }
    .slide-visual svg {
      max-height: 110px;
    }
    .slide-takeaway {
      padding: 10px 12px;
    }
    .slide-takeaway strong {
      font-size: 0.82rem;
    }
  }
  ```
- Slide Cover (Slide 1):
  - `.cover-members`: menjadi 1 kolom (`grid-template-columns: 1fr; gap: 8px;`).
  - Kartu profil anggota: padding pas, font terbaca jelas, icon profile pas.
  - Kotak info matkul: ringkas dan terbaca.
- Toolbar Navigasi Slide (`.deckbar`):
  - Tombol Sebelumnya, Indeks, Presentasi, Berikutnya disusun wrap 2x2 atau 1 baris yang pas di layar HP dengan touch target nyaman.
- Drawer Indeks Slide:
  - Pada HP, buka sebagai modal / drawer layar penuh (`inset: 52px 0 60px 0; width: 100%;`) agar mudah memilih slide.

================================================================================
4. NUMERICAL LAB PADA HP
================================================================================
- Layout Grid Lab:
  - `.labgrid`: ubah dari 2 kolom menjadi 1 kolom (`grid-template-columns: 1fr; gap: 14px;`).
  - Panel Konfigurasi berada di atas, diikuti Grafik Canvas di bawahnya.
- Keyboard Matematika Cepat (`.math-tools`):
  - Tombol-tombol simbol (`x`, `+`, `−`, `×`, `÷`, `²`, `³`, `√x`, `eˣ`, `ln`, `sin`, `cos`) disusun rapat dan bisa disentuh dengan mudah (touch-friendly).
- Plot Canvas & Playback:
  - Canvas grafik Cartesian: `height: 260px; width: 100%;` dengan `touch-action: none`.
  - Playback bar (tombol Zoom `-`, Zoom `+`, Play/Pause, Next/Prev): ukuran tombol min 38px, mudah di-tap jempol.
- Panel Hasil / Inspector & Tabel:
  - Metrics ringkasan (xr, f(xr), galat) disusun dalam grid 2 kolom atau 3 kolom mini.
  - Tabel Iterasi: dibungkus dengan `.scroll` (`overflow-x: auto; -webkit-overflow-scrolling: touch;`) sehingga bisa di-swipe horizontal dengan mulus.

================================================================================
5. ARENA & KNOWLEDGE BASE PADA HP
================================================================================
- Arena Komparasi:
  - Form input: disusun 1 kolom atau 2 kolom ringkas.
  - Kartu hasil 3 metode (Newton, Secant, Fixed-Point): bertumpuk 1 kolom vertikal (`grid-template-columns: 1fr; gap: 12px;`).
  - Grafik SVG perbandingan: `width: 100%; height: auto;`.
- Knowledge Base:
  - Pencarian & filter glosarium pas selebar layar.
  - Kartu-kartu glosarium bertumpuk 1 kolom.
  - Kartu identitas tim & profil anggota bertumpuk 1 kolom rapi.

================================================================================
6. CUSTOM CURSOR ON TOUCH DEVICES
================================================================================
- Pastikan kursor animasi `.cursor-dot` dan `.cursor-trail` otomatis mati di layar sentuh HP agar tidak mengganggu sentuhan jempol:
  ```css
  @media (hover: none), (pointer: coarse) {
    .cursor-dot, .cursor-trail {
      display: none !important;
    }
  }
  ```

================================================================================
7. VERIFIKASI BUILD
================================================================================
- Jalankan `npm run build` dan pastikan tidak ada error TypeScript maupun Vite bundling.
- Pastikan commit dan push hasil perbaikan ke GitHub `main`.
```

---

## 📌 Status File:
Dokumen instruksi ini telah tersimpan di:
📂 `KOMUNIKASI/2026-08-20-029-prompt-optimasi-responsif-mobile-hp-openclaude.md`
