from manim import *

# =========================================================================
# KONFIGURASI PALET WARNA (KONTRAST TINGGI & RAMAH SMART TV)
# =========================================================================
BG = "#141414"
BLUE_C = "#38BDF8"       # Cyan terang
GREEN_C = "#4ADE80"      # Hijau cerah
YELLOW_C = "#FACC15"     # Kuning emas
ORANGE_C = "#FB923C"     # Oranye hangat
RED_C = "#F87171"        # Merah peringatan
CARD_BG = "#1F2937"      # Slate gelap
BORDER_C = "#374151"     # Border card
WHITE_C = "#FFFFFF"
MUTED_C = "#9CA3AF"

class CholeskyUnifiedExplainer(Scene):
    def construct(self):
        self.camera.background_color = BG

        # Watermark Identitas Ryan
        wm = Text("@librayn", font_size=16, color=MUTED_C).to_corner(UR, buff=0.35)
        self.add(wm)

        # ========================================================
        # 0. PEMBUKAAN SOAL SPL (A x = b)
        # ========================================================
        title_intro = Text("Dekomposisi Cholesky: Metode & Contoh Soal", font_size=25, color=WHITE_C, weight=BOLD)
        title_intro.move_to(ORIGIN)
        self.play(FadeIn(title_intro, shift=UP * 0.2), run_time=0.8)
        self.wait(0.6)

        self.play(title_intro.animate.move_to(UP * 2.85), run_time=0.8)

        subtitle_intro = MathTex(
            r"\mathbf{Selesaikan\ SPL:\ A \cdot x = b\ \quad (Dekomposisi\ A = L \cdot L^T)}",
            font_size=20,
            color=YELLOW_C
        ).next_to(title_intro, DOWN, buff=0.22)
        self.play(FadeIn(subtitle_intro, shift=UP * 0.15), run_time=0.7)
        self.wait(0.4)

        # Matriks & Vektor SPL
        mat_A_intro = Matrix([["4", "2", "-2"], ["2", "10", "2"], ["-2", "2", "6"]], h_buff=0.85, v_buff=0.7).scale(0.7)
        lbl_A_intro = Text("Matriks A", font_size=15, color=WHITE_C, weight=BOLD).next_to(mat_A_intro, UP, buff=0.2)
        grp_A = VGroup(lbl_A_intro, mat_A_intro)

        vec_x_intro = Matrix([["x_1"], ["x_2"], ["x_3"]], h_buff=0.6, v_buff=0.7).scale(0.7)
        lbl_x_intro = Text("Vektor x", font_size=15, color=WHITE_C, weight=BOLD).next_to(vec_x_intro, UP, buff=0.2)
        grp_x = VGroup(lbl_x_intro, vec_x_intro)

        eq_intro = MathTex(r"=", font_size=32, color=WHITE_C)

        vec_b_intro = Matrix([["2"], ["22"], ["4"]], h_buff=0.6, v_buff=0.7).scale(0.7)
        lbl_b_intro = Text("Vektor b", font_size=15, color=WHITE_C, weight=BOLD).next_to(vec_b_intro, UP, buff=0.2)
        grp_b = VGroup(lbl_b_intro, vec_b_intro)

        spl_row = VGroup(grp_A, grp_x, eq_intro, grp_b).arrange(RIGHT, buff=0.45)
        spl_row.move_to(UP * 0.3)
        row2_y = mat_A_intro.get_rows()[1].get_center()[1]
        eq_intro.set_y(row2_y)

        self.play(FadeIn(grp_A, shift=RIGHT * 0.2), run_time=0.6)
        self.play(FadeIn(grp_x, shift=RIGHT * 0.2), run_time=0.5)
        self.play(Write(eq_intro), run_time=0.3)
        self.play(FadeIn(grp_b, shift=RIGHT * 0.2), run_time=0.5)
        self.wait(0.8)

        # Card Pengenalan Karakteristik Khusus Cholesky
        card_txt_intro = MarkupText(
            'Ciri Khas Cholesky: Matriks Segitiga Atas U adalah Transpos dari L (U = L<sup>T</sup>)\nHemat 50% Ruang Memori &amp; 50% Jumlah Operasi Komputasi!',
            font_size=16,
            color=WHITE_C,
            line_spacing=0.9
        )
        card_intro = RoundedRectangle(
            corner_radius=0.15,
            width=card_txt_intro.width + 0.65,
            height=card_txt_intro.height + 0.45,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=YELLOW_C,
            stroke_width=2.0
        ).move_to(DOWN * 2.1)
        card_txt_intro.move_to(card_intro.get_center())
        grp_card_intro = VGroup(card_intro, card_txt_intro)

        self.play(Create(card_intro), FadeIn(card_txt_intro), run_time=0.8)
        self.wait(2.5)

        self.play(
            FadeOut(title_intro),
            FadeOut(subtitle_intro),
            FadeOut(grp_A),
            FadeOut(grp_x),
            FadeOut(eq_intro),
            FadeOut(grp_b),
            FadeOut(grp_card_intro),
            run_time=0.6
        )

        # ========================================================
        # 1. TAHAP VERIFIKASI 2 SYARAT MUTLAK (ARAHAN IBU LINDA)
        # ========================================================
        header_syarat = VGroup(
            Text("Syarat Mutlak Dekomposisi Cholesky", font_size=25, color=YELLOW_C, weight=BOLD),
            Text("Peringatan: Tidak semua matriks bisa diselesaikan dengan Cholesky!", font_size=15, color=RED_C)
        ).arrange(DOWN, buff=0.15).to_edge(UP, buff=0.35)

        self.play(FadeIn(header_syarat, shift=DOWN * 0.15), run_time=0.7)
        self.wait(0.5)

        # Panel Kiri: Matriks A
        mat_A_check = Matrix([["4", "2", "-2"], ["2", "10", "2"], ["-2", "2", "6"]], h_buff=0.85, v_buff=0.7).scale(0.8)
        mat_A_check.move_to(LEFT * 3.8 + DOWN * 0.4)
        lbl_A_check = Text("Matriks A (3×3)", font_size=17, color=WHITE_C, weight=BOLD).next_to(mat_A_check, UP, buff=0.25)
        grp_A_check = VGroup(lbl_A_check, mat_A_check)
        self.play(FadeIn(grp_A_check), run_time=0.7)

        # Card Kanan: Pemeriksaan Syarat
        card_syarat = RoundedRectangle(
            corner_radius=0.15,
            width=6.8,
            height=4.6,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=BLUE_C,
            stroke_width=2.0
        ).move_to(RIGHT * 3.0 + DOWN * 0.4)
        self.play(Create(card_syarat), run_time=0.6)

        # --------------------------------------------------------
        # SYARAT 1: SIMETRIS
        # --------------------------------------------------------
        t_s1_title = Text("1. Syarat Simetris: A = A^T", font_size=16, color=BLUE_C, weight=BOLD).move_to(card_syarat.get_top() + DOWN * 0.35).align_to(card_syarat, LEFT).shift(RIGHT * 0.4)
        desc_s1 = Text("Elemen saling bercermin terhadap diagonal:", font_size=13, color=MUTED_C).next_to(t_s1_title, DOWN, buff=0.1).align_to(t_s1_title, LEFT)
        
        calc_s1 = MathTex(
            r"\begin{aligned} a_{12} &= a_{21} = 2 \\ a_{13} &= a_{31} = -2 \\ a_{23} &= a_{32} = 2 \end{aligned}",
            font_size=16,
            color=YELLOW_C
        ).next_to(desc_s1, DOWN, buff=0.15).align_to(t_s1_title, LEFT)

        badge_s1 = Text("✔ Syarat 1 Terpenuhi: Simetris Sempurna", font_size=13, color=GREEN_C, weight=BOLD).next_to(calc_s1, DOWN, buff=0.15).align_to(t_s1_title, LEFT)

        # Kotak penyorot individual yang rapi
        e12 = SurroundingRectangle(mat_A_check.get_entries()[1], color=GREEN_C, buff=0.06)
        e21 = SurroundingRectangle(mat_A_check.get_entries()[3], color=GREEN_C, buff=0.06)
        e13 = SurroundingRectangle(mat_A_check.get_entries()[2], color=YELLOW_C, buff=0.06)
        e31 = SurroundingRectangle(mat_A_check.get_entries()[6], color=YELLOW_C, buff=0.06)
        e23 = SurroundingRectangle(mat_A_check.get_entries()[5], color=BLUE_C, buff=0.06)
        e32 = SurroundingRectangle(mat_A_check.get_entries()[7], color=BLUE_C, buff=0.06)
        highlight_sim = VGroup(e12, e21, e13, e31, e23, e32)

        self.play(Write(t_s1_title), FadeIn(desc_s1), run_time=0.6)
        self.play(Create(highlight_sim), Write(calc_s1), run_time=0.9)
        self.play(FadeIn(badge_s1), run_time=0.5)
        self.wait(2.0)

        # --------------------------------------------------------
        # SYARAT 2: DEFINIT POSITIF (KRITERIA SYLVESTER)
        # --------------------------------------------------------
        t_s2_title = Text("2. Syarat Definit Positif (Uji Sylvester)", font_size=16, color=BLUE_C, weight=BOLD).next_to(badge_s1, DOWN, buff=0.25).align_to(t_s1_title, LEFT)
        desc_s2 = Text("Semua determinan minor utama harus positif (> 0):", font_size=13, color=MUTED_C).next_to(t_s2_title, DOWN, buff=0.1).align_to(t_s1_title, LEFT)

        calc_s2 = MathTex(
            r"\begin{aligned} &M_1 = |4| = 4 > 0 \\ &M_2 = 4(10) - 2(2) = 36 > 0 \\ &M_3 = \det(A) = 144 > 0 \end{aligned}",
            font_size=15,
            color=YELLOW_C
        ).next_to(desc_s2, DOWN, buff=0.15).align_to(t_s1_title, LEFT)

        badge_s2 = Text("✔ Syarat 2 Terpenuhi: Bebas Akar Imajiner!", font_size=13, color=GREEN_C, weight=BOLD).next_to(calc_s2, DOWN, buff=0.15).align_to(t_s1_title, LEFT)

        self.play(FadeOut(highlight_sim), run_time=0.3)
        self.play(Write(t_s2_title), FadeIn(desc_s2), run_time=0.6)
        self.play(Write(calc_s2), run_time=0.9)
        self.play(FadeIn(badge_s2), run_time=0.5)
        self.wait(3.0)

        # Bersihkan layar untuk faktorisasi
        self.play(
            FadeOut(header_syarat),
            FadeOut(grp_A_check),
            FadeOut(card_syarat),
            FadeOut(t_s1_title), FadeOut(desc_s1), FadeOut(calc_s1), FadeOut(badge_s1),
            FadeOut(t_s2_title), FadeOut(desc_s2), FadeOut(calc_s2), FadeOut(badge_s2),
            run_time=0.6
        )

        # ========================================================
        # 2. TAHAP FAKTORISASI A = L · L^T (KOLOM DEMI KOLOM)
        # ========================================================
        header_faktorisasi = VGroup(
            Text("Faktorisasi Cholesky: A = L · L^T", font_size=25, color=BLUE_C, weight=BOLD),
            MathTex(r"l_{jj} = \sqrt{a_{jj} - \sum_{k=1}^{j-1} l_{jk}^2},\quad l_{ij} = \frac{a_{ij} - \sum_{k=1}^{j-1} l_{ik}l_{jk}}{l_{jj}}", font_size=19, color=WHITE_C)
        ).arrange(DOWN, buff=0.15).to_edge(UP, buff=0.35)
        self.play(FadeIn(header_faktorisasi), run_time=0.7)

        # Matriks A & Template Matriks L di Panel Kiri
        mat_A = Matrix([["4", "2", "-2"], ["2", "10", "2"], ["-2", "2", "6"]], h_buff=0.8, v_buff=0.65).scale(0.7)
        lbl_A = Text("Matriks A", font_size=15, color=WHITE_C, weight=BOLD).next_to(mat_A, UP, buff=0.2)
        grp_A_left = VGroup(lbl_A, mat_A).move_to(LEFT * 4.2 + UP * 0.9)

        mat_L_curr = Matrix([["l_{11}", "0", "0"], ["l_{21}", "l_{22}", "0"], ["l_{31}", "l_{32}", "l_{33}"]], h_buff=0.8, v_buff=0.65).scale(0.7)
        lbl_L_curr = Text("Matriks Segitiga Bawah L", font_size=15, color=GREEN_C, weight=BOLD).next_to(mat_L_curr, UP, buff=0.2)
        grp_L_left = VGroup(lbl_L_curr, mat_L_curr).move_to(LEFT * 4.2 + DOWN * 1.6)

        self.play(FadeIn(grp_A_left), FadeIn(grp_L_left), run_time=0.8)
        self.wait(0.4)

        # Card Kalkulasi Kanan
        card_calc = RoundedRectangle(
            corner_radius=0.15,
            width=6.8,
            height=4.6,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=YELLOW_C,
            stroke_width=2.0
        ).move_to(RIGHT * 2.8 + DOWN * 0.35)
        self.play(Create(card_calc), run_time=0.6)

        # ----------------------------------------------------
        # KOLOM 1 MATRIKS L
        # ----------------------------------------------------
        t_col1 = Text("Langkah 1: Menghitung Kolom 1 Matriks L", font_size=16, color=YELLOW_C, weight=BOLD).move_to(card_calc.get_top() + DOWN * 0.35)
        self.play(Write(t_col1), run_time=0.5)

        calc_col1 = MathTex(
            r"\begin{aligned}"
            r"l_{11} &= \sqrt{a_{11}} = \sqrt{4} = \mathbf{2} \\[6pt]"
            r"l_{21} &= \frac{a_{21}}{l_{11}} = \frac{2}{2} = \mathbf{1} \\[6pt]"
            r"l_{31} &= \frac{a_{31}}{l_{11}} = \frac{-2}{2} = \mathbf{-1}"
            r"\end{aligned}",
            font_size=19,
            color=WHITE_C
        ).next_to(t_col1, DOWN, buff=0.3).align_to(card_calc, LEFT).shift(RIGHT * 0.5)

        badge_res1 = MathTex(
            r"\text{Kolom 1 Matriks } L = \begin{bmatrix} 2 & 1 & -1 \end{bmatrix}^T",
            font_size=16,
            color=GREEN_C
        ).next_to(calc_col1, DOWN, buff=0.35).align_to(calc_col1, LEFT)

        self.play(Write(calc_col1), run_time=1.2)
        self.play(FadeIn(badge_res1), run_time=0.5)

        # Update Matriks L di kiri
        mat_L_step1 = Matrix([["2", "0", "0"], ["1", "l_{22}", "0"], ["-1", "l_{32}", "l_{33}"]], h_buff=0.8, v_buff=0.65).scale(0.7).move_to(mat_L_curr.get_center())
        box_L1 = SurroundingRectangle(mat_L_step1.get_columns()[0], color=GREEN_C, buff=0.08)
        self.play(Transform(mat_L_curr, mat_L_step1), Create(box_L1), run_time=0.8)
        self.wait(2.0)

        # Bersihkan Card untuk Kolom 2
        self.play(
            FadeOut(t_col1), FadeOut(calc_col1), FadeOut(badge_res1), FadeOut(box_L1),
            run_time=0.4
        )

        # ----------------------------------------------------
        # KOLOM 2 MATRIKS L
        # ----------------------------------------------------
        t_col2 = Text("Langkah 2: Menghitung Kolom 2 Matriks L", font_size=16, color=YELLOW_C, weight=BOLD).move_to(card_calc.get_top() + DOWN * 0.35)
        self.play(Write(t_col2), run_time=0.5)

        calc_col2 = MathTex(
            r"\begin{aligned}"
            r"l_{22} &= \sqrt{a_{22} - l_{21}^2} = \sqrt{10 - 1^2} = \sqrt{9} = \mathbf{3} \\[8pt]"
            r"l_{32} &= \frac{a_{32} - l_{31}l_{21}}{l_{22}} = \frac{2 - (-1)(1)}{3} = \frac{3}{3} = \mathbf{1}"
            r"\end{aligned}",
            font_size=18,
            color=WHITE_C
        ).next_to(t_col2, DOWN, buff=0.35).align_to(card_calc, LEFT).shift(RIGHT * 0.5)

        badge_res2 = MathTex(
            r"\text{Kolom 2 Matriks } L = \begin{bmatrix} 0 & 3 & 1 \end{bmatrix}^T",
            font_size=16,
            color=GREEN_C
        ).next_to(calc_col2, DOWN, buff=0.4).align_to(calc_col2, LEFT)

        self.play(Write(calc_col2), run_time=1.2)
        self.play(FadeIn(badge_res2), run_time=0.5)

        mat_L_step2 = Matrix([["2", "0", "0"], ["1", "3", "0"], ["-1", "1", "l_{33}"]], h_buff=0.8, v_buff=0.65).scale(0.7).move_to(mat_L_curr.get_center())
        box_L2 = SurroundingRectangle(mat_L_step2.get_columns()[1], color=GREEN_C, buff=0.08)
        self.play(Transform(mat_L_curr, mat_L_step2), Create(box_L2), run_time=0.8)
        self.wait(2.0)

        # Bersihkan Card untuk Kolom 3
        self.play(
            FadeOut(t_col2), FadeOut(calc_col2), FadeOut(badge_res2), FadeOut(box_L2),
            run_time=0.4
        )

        # ----------------------------------------------------
        # KOLOM 3 MATRIKS L
        # ----------------------------------------------------
        t_col3 = Text("Langkah 3: Menghitung Kolom 3 Matriks L", font_size=16, color=YELLOW_C, weight=BOLD).move_to(card_calc.get_top() + DOWN * 0.35)
        self.play(Write(t_col3), run_time=0.5)

        calc_col3 = MathTex(
            r"\begin{aligned}"
            r"l_{33} &= \sqrt{a_{33} - (l_{31}^2 + l_{32}^2)} \\[4pt]"
            r"&= \sqrt{6 - ((-1)^2 + 1^2)} \\[4pt]"
            r"&= \sqrt{6 - (1 + 1)} = \sqrt{4} = \mathbf{2}"
            r"\end{aligned}",
            font_size=18,
            color=WHITE_C
        ).next_to(t_col3, DOWN, buff=0.3).align_to(card_calc, LEFT).shift(RIGHT * 0.5)

        badge_res3 = MathTex(
            r"\text{Kolom 3 Matriks } L = \begin{bmatrix} 0 & 0 & 2 \end{bmatrix}^T",
            font_size=16,
            color=GREEN_C
        ).next_to(calc_col3, DOWN, buff=0.35).align_to(calc_col3, LEFT)

        self.play(Write(calc_col3), run_time=1.2)
        self.play(FadeIn(badge_res3), run_time=0.5)

        mat_L_step3 = Matrix([["2", "0", "0"], ["1", "3", "0"], ["-1", "1", "2"]], h_buff=0.8, v_buff=0.65).scale(0.7).move_to(mat_L_curr.get_center())
        box_L3 = SurroundingRectangle(mat_L_step3.get_columns()[2], color=GREEN_C, buff=0.08)
        self.play(Transform(mat_L_curr, mat_L_step3), Create(box_L3), run_time=0.8)
        self.wait(2.2)

        # Bersihkan seluruh layar faktorisasi
        self.play(
            FadeOut(header_faktorisasi),
            FadeOut(grp_A_left),
            FadeOut(grp_L_left),
            FadeOut(mat_L_curr),
            FadeOut(card_calc),
            FadeOut(t_col3), FadeOut(calc_col3), FadeOut(badge_res3),
            FadeOut(box_L3),
            run_time=0.6
        )

        # ----------------------------------------------------
        # HASIL DEKOMPOSISI L DAN L^T (EFEK CERMIN TRANSPOS)
        # ----------------------------------------------------
        header_decomp = Text("Hasil Dekomposisi Cholesky: A = L · L^T", font_size=25, color=WHITE_C, weight=BOLD).to_edge(UP, buff=0.5)
        self.play(Write(header_decomp), run_time=0.7)

        mat_L_final = Matrix([["2", "0", "0"], ["1", "3", "0"], ["-1", "1", "2"]], h_buff=0.8, v_buff=0.7).scale(0.75)
        lbl_L_final = Text("Matriks L (Segitiga Bawah)", font_size=16, color=GREEN_C, weight=BOLD).next_to(mat_L_final, UP, buff=0.2)
        grp_L_final = VGroup(lbl_L_final, mat_L_final).move_to(LEFT * 2.9 + UP * 0.25)

        dot_mult = MathTex(r"\cdot", font_size=40, color=WHITE_C).move_to(ORIGIN + UP * 0.25)

        mat_LT_final = Matrix([["2", "1", "-1"], ["0", "3", "1"], ["0", "0", "2"]], h_buff=0.8, v_buff=0.7).scale(0.75)
        lbl_LT_final = Text("Matriks L^T (Transpos = Segitiga Atas)", font_size=16, color=BLUE_C, weight=BOLD).next_to(mat_LT_final, UP, buff=0.2)
        grp_LT_final = VGroup(lbl_LT_final, mat_LT_final).move_to(RIGHT * 2.9 + UP * 0.25)

        self.play(FadeIn(grp_L_final, shift=RIGHT * 0.2), run_time=0.7)
        self.play(Write(dot_mult), run_time=0.3)
        self.play(FadeIn(grp_LT_final, shift=LEFT * 0.2), run_time=0.7)

        card_magic = RoundedRectangle(
            corner_radius=0.15,
            width=10.8,
            height=1.0,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=GREEN_C,
            stroke_width=2.0
        ).move_to(DOWN * 2.05)
        txt_magic = Text(
            "Keunggulan Cholesky: Matriks atas L^T diperoleh langsung dari transpos L!\nTidak memerlukan perhitungan eliminasi tambahan untuk bagian atas.",
            font_size=15,
            color=WHITE_C,
            line_spacing=0.8
        ).move_to(card_magic.get_center())
        self.play(Create(card_magic), Write(txt_magic), run_time=0.9)
        self.wait(3.0)

        self.play(
            FadeOut(header_decomp),
            FadeOut(grp_L_final),
            FadeOut(dot_mult),
            FadeOut(grp_LT_final),
            FadeOut(card_magic),
            FadeOut(txt_magic),
            run_time=0.6
        )

        # ========================================================
        # 3. PENYELESAIAN SPL 2-TAHAP (SUBSTITUSI MAJU & MUNDUR)
        # ========================================================
        # 3.A SUBSTITUSI MAJU L y = b
        header_spl1 = Text("Tahap 1 SPL: Substitusi Maju L · y = b", font_size=23, color=GREEN_C, weight=BOLD).to_edge(UP, buff=0.45)
        self.play(Write(header_spl1), run_time=0.7)

        mat_L_fwd = Matrix([["2", "0", "0"], ["1", "3", "0"], ["-1", "1", "2"]], h_buff=0.75, v_buff=0.65).scale(0.7)
        vec_y_fwd = Matrix([["y_1"], ["y_2"], ["y_3"]], h_buff=0.55, v_buff=0.65).scale(0.7)
        eq_fwd = MathTex(r"=", font_size=28, color=WHITE_C)
        vec_b_fwd = Matrix([["2"], ["22"], ["4"]], h_buff=0.55, v_buff=0.65).scale(0.7)

        row_fwd = VGroup(mat_L_fwd, vec_y_fwd, eq_fwd, vec_b_fwd).arrange(RIGHT, buff=0.35).move_to(LEFT * 3.8 + DOWN * 0.25)
        eq_fwd.set_y(mat_L_fwd.get_rows()[1].get_center()[1])
        self.play(FadeIn(row_fwd), run_time=0.7)

        card_sub1 = RoundedRectangle(
            corner_radius=0.15,
            width=6.5,
            height=4.4,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=GREEN_C,
            stroke_width=2.0
        ).move_to(RIGHT * 3.1 + DOWN * 0.25)
        t_sub1_head = Text("Perhitungan Maju (Atas ke Bawah):", font_size=15, color=GREEN_C, weight=BOLD).move_to(card_sub1.get_top() + DOWN * 0.35)
        self.play(Create(card_sub1), Write(t_sub1_head), run_time=0.5)

        calc_fwd = MathTex(
            r"\begin{aligned}"
            r"2y_1 &= 2 \implies \mathbf{y_1 = 1} \\[6pt]"
            r"1(1) + 3y_2 &= 22 \implies 3y_2 = 21 \implies \mathbf{y_2 = 7} \\[6pt]"
            r"-1(1) + 1(7) + 2y_3 &= 4 \implies 6 + 2y_3 = 4 \implies \mathbf{y_3 = -1}"
            r"\end{aligned}",
            font_size=17,
            color=WHITE_C
        ).next_to(t_sub1_head, DOWN, buff=0.3).align_to(card_sub1, LEFT).shift(RIGHT * 0.4)

        badge_y = MathTex(
            r"\text{Vektor Solusi Antara: } \mathbf{y} = \begin{bmatrix} 1 & 7 & -1 \end{bmatrix}^T",
            font_size=16,
            color=YELLOW_C
        ).next_to(calc_fwd, DOWN, buff=0.35).align_to(calc_fwd, LEFT)

        self.play(Write(calc_fwd), run_time=1.5)
        self.play(FadeIn(badge_y), run_time=0.5)
        self.wait(2.5)

        self.play(
            FadeOut(header_spl1),
            FadeOut(row_fwd),
            FadeOut(card_sub1),
            FadeOut(t_sub1_head),
            FadeOut(calc_fwd),
            FadeOut(badge_y),
            run_time=0.5
        )

        # 3.B SUBSTITUSI MUNDUR L^T x = y
        header_spl2 = Text("Tahap 2 SPL: Substitusi Mundur L^T · x = y", font_size=23, color=BLUE_C, weight=BOLD).to_edge(UP, buff=0.45)
        self.play(Write(header_spl2), run_time=0.7)

        mat_LT_bwd = Matrix([["2", "1", "-1"], ["0", "3", "1"], ["0", "0", "2"]], h_buff=0.75, v_buff=0.65).scale(0.7)
        vec_x_bwd = Matrix([["x_1"], ["x_2"], ["x_3"]], h_buff=0.55, v_buff=0.65).scale(0.7)
        eq_bwd = MathTex(r"=", font_size=28, color=WHITE_C)
        vec_y_bwd = Matrix([["1"], ["7"], ["-1"]], h_buff=0.55, v_buff=0.65).scale(0.7)

        row_bwd = VGroup(mat_LT_bwd, vec_x_bwd, eq_bwd, vec_y_bwd).arrange(RIGHT, buff=0.35).move_to(LEFT * 3.8 + DOWN * 0.25)
        eq_bwd.set_y(mat_LT_bwd.get_rows()[1].get_center()[1])
        self.play(FadeIn(row_bwd), run_time=0.7)

        card_sub2 = RoundedRectangle(
            corner_radius=0.15,
            width=6.6,
            height=4.4,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=BLUE_C,
            stroke_width=2.0
        ).move_to(RIGHT * 3.1 + DOWN * 0.25)
        t_sub2_head = Text("Perhitungan Mundur (Bawah ke Atas):", font_size=15, color=BLUE_C, weight=BOLD).move_to(card_sub2.get_top() + DOWN * 0.35)
        self.play(Create(card_sub2), Write(t_sub2_head), run_time=0.5)

        calc_bwd = MathTex(
            r"\begin{aligned}"
            r"2x_3 &= -1 \implies \mathbf{x_3 = -0{,}5} \\[6pt]"
            r"3x_2 + 1(-0{,}5) &= 7 \implies 3x_2 = 7{,}5 \implies \mathbf{x_2 = 2{,}5} \\[6pt]"
            r"2x_1 + 1(2{,}5) - 1(-0{,}5) &= 1 \implies 2x_1 + 3 = 1 \implies \mathbf{x_1 = -1}"
            r"\end{aligned}",
            font_size=16,
            color=WHITE_C
        ).next_to(t_sub2_head, DOWN, buff=0.3).align_to(card_sub2, LEFT).shift(RIGHT * 0.4)

        badge_x = MathTex(
            r"\text{Solusi SPL: } \mathbf{x} = \begin{bmatrix} -1 & 2{,}5 & -0{,}5 \end{bmatrix}^T",
            font_size=16,
            color=YELLOW_C
        ).next_to(calc_bwd, DOWN, buff=0.35).align_to(calc_bwd, LEFT)

        self.play(Write(calc_bwd), run_time=1.5)
        self.play(FadeIn(badge_x), run_time=0.5)
        self.wait(2.5)

        self.play(
            FadeOut(header_spl2),
            FadeOut(row_bwd),
            FadeOut(card_sub2),
            FadeOut(t_sub2_head),
            FadeOut(calc_bwd),
            FadeOut(badge_x),
            run_time=0.5
        )

        # ========================================================
        # 4. KESIMPULAN AKHIR & VERIFIKASI RESIDU (ELEGANT CONCLUSION)
        # ========================================================
        header_final = Text("Verifikasi Solusi Akhir Metode Cholesky", font_size=25, color=YELLOW_C, weight=BOLD).to_edge(UP, buff=0.45)
        self.play(Write(header_final), run_time=0.7)

        card_final = RoundedRectangle(
            corner_radius=0.15,
            width=11.2,
            height=4.6,
            fill_color=CARD_BG,
            fill_opacity=0.98,
            stroke_color=GREEN_C,
            stroke_width=2.5
        ).move_to(DOWN * 0.25)
        self.play(Create(card_final), run_time=0.6)

        t_res_final = Text("Solusi Eksak Sistem Persamaan Linier:", font_size=18, color=WHITE_C, weight=BOLD).move_to(card_final.get_top() + DOWN * 0.4)
        math_sol_box = MathTex(
            r"\mathbf{x} = \begin{bmatrix} x_1 \\ x_2 \\ x_3 \end{bmatrix} = \begin{bmatrix} -1 \\ 2{,}5 \\ -0{,}5 \end{bmatrix}",
            font_size=24,
            color=YELLOW_C
        ).next_to(t_res_final, DOWN, buff=0.3)

        line_div = Line(LEFT * 4.8, RIGHT * 4.8, color=BORDER_C, stroke_width=1.5).next_to(math_sol_box, DOWN, buff=0.25)

        t_check_intro = Text("Substitusi Balik ke Matriks Awal (A · x = b):", font_size=15, color=GREEN_C, weight=BOLD).next_to(line_div, DOWN, buff=0.2)
        check_eq = MathTex(
            r"\begin{bmatrix} 4 & 2 & -2 \\ 2 & 10 & 2 \\ -2 & 2 & 6 \end{bmatrix} \begin{bmatrix} -1 \\ 2{,}5 \\ -0{,}5 \end{bmatrix} = \begin{bmatrix} 4(-1) + 2(2{,}5) - 2(-0{,}5) \\ 2(-1) + 10(2{,}5) + 2(-0{,}5) \\ -2(-1) + 2(2{,}5) + 6(-0{,}5) \end{bmatrix} = \begin{bmatrix} 2 \\ 22 \\ 4 \end{bmatrix} = \mathbf{b}",
            font_size=16,
            color=WHITE_C
        ).next_to(t_check_intro, DOWN, buff=0.2)

        badge_concl = Text("✔ Solusi 100% Eksak · Residu ||Ax - b|| = 0", font_size=15, color=GREEN_C, weight=BOLD).next_to(check_eq, DOWN, buff=0.25)

        self.play(Write(t_res_final), FadeIn(math_sol_box), run_time=0.7)
        self.play(Create(line_div), FadeIn(t_check_intro), Write(check_eq), run_time=1.2)
        self.play(FadeIn(badge_concl), run_time=0.5)
        self.wait(4.0)

        # Penutup Selesai
        self.play(
            FadeOut(header_final),
            FadeOut(card_final),
            FadeOut(t_res_final),
            FadeOut(math_sol_box),
            FadeOut(line_div),
            FadeOut(t_check_intro),
            FadeOut(check_eq),
            FadeOut(badge_concl),
            run_time=0.7
        )

        final_thanks = Text("Presentasi Dekomposisi Cholesky Selesai", font_size=28, color=GREEN_C, weight=BOLD).move_to(ORIGIN)
        self.play(FadeIn(final_thanks), run_time=0.9)
        self.wait(2.5)
