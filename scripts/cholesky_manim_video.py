from manim import *

# =========================================================================
# KONFIGURASI PALET WARNA (KONTRAST TINGGI & RAMAH SMART TV)
# =========================================================================
BG = "#141414"
BLUE_C = "#38BDF8"       # Cyan terang
GREEN_C = "#4ADE80"      # Hijau cerah
LIGHT_GREEN = "#86EFAC"  # Hijau muda cerah
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
        header_title = Tex(r"\textbf{Syarat Mutlak Dekomposisi Cholesky}", font_size=30, color=YELLOW_C)
        header_sub = Tex(r"\textbf{Peringatan:} Tidak semua matriks bisa diselesaikan dengan Cholesky!", font_size=18, color=ORANGE_C)
        header_syarat = VGroup(header_title, header_sub).arrange(DOWN, buff=0.15).to_edge(UP, buff=0.32)

        self.play(FadeIn(header_syarat, shift=DOWN * 0.15), run_time=0.6)
        self.wait(0.4)

        # Panel Kiri: Matriks A
        mat_A_check = Matrix([["4", "2", "-2"], ["2", "10", "2"], ["-2", "2", "6"]], h_buff=0.9, v_buff=0.75).scale(0.88)
        mat_A_check.move_to(LEFT * 4.0 + DOWN * 0.55)
        lbl_A_check = Tex(r"\textbf{Matriks $A$ ($3 \times 3$)}", font_size=22, color=WHITE_C).next_to(mat_A_check, UP, buff=0.25)
        grp_A_check = VGroup(lbl_A_check, mat_A_check)
        self.play(FadeIn(grp_A_check), run_time=0.6)

        # --------------------------------------------------------
        # SYARAT 1: SIMETRIS
        # --------------------------------------------------------
        t_s1_title = Tex(r"\textbf{1. Syarat Simetris: } $A = A^T$", font_size=32, color=BLUE_C)
        desc_s1 = Tex(r"\textbf{Elemen saling bercermin terhadap diagonal} ($a_{ij} = a_{ji}$):", font_size=24, color=WHITE_C)
        calc_s1 = MathTex(
            r"a_{12} &= a_{21} = 2 \\",
            r"a_{13} &= a_{31} = -2 \\",
            r"a_{23} &= a_{32} = 2",
            font_size=32, color=YELLOW_C
        )
        badge_s1 = Tex(r"\textbf{\checkmark\ Syarat 1 Terpenuhi: Simetris Sempurna}", font_size=26, color=GREEN_C)

        content_s1 = VGroup(t_s1_title, desc_s1, calc_s1, badge_s1).arrange(DOWN, buff=0.36, aligned_edge=LEFT)
        content_s1.move_to(RIGHT * 2.8 + DOWN * 0.55)

        card_s1 = RoundedRectangle(
            corner_radius=0.2,
            width=content_s1.width + 0.8,
            height=content_s1.height + 0.6,
            fill_color=CARD_BG, fill_opacity=0.92, stroke_color=BORDER_C, stroke_width=2
        ).move_to(content_s1.get_center())

        e12 = SurroundingRectangle(mat_A_check.get_entries()[1], color=GREEN_C, buff=0.06)
        e21 = SurroundingRectangle(mat_A_check.get_entries()[3], color=GREEN_C, buff=0.06)
        e13 = SurroundingRectangle(mat_A_check.get_entries()[2], color=YELLOW_C, buff=0.06)
        e31 = SurroundingRectangle(mat_A_check.get_entries()[6], color=YELLOW_C, buff=0.06)
        e23 = SurroundingRectangle(mat_A_check.get_entries()[5], color=BLUE_C, buff=0.06)
        e32 = SurroundingRectangle(mat_A_check.get_entries()[7], color=BLUE_C, buff=0.06)
        highlight_sim = VGroup(e12, e21, e13, e31, e23, e32)

        self.play(Create(card_s1), FadeIn(t_s1_title), FadeIn(desc_s1), run_time=0.5)
        self.play(Create(highlight_sim), Write(calc_s1), run_time=0.8)
        self.play(FadeIn(badge_s1), run_time=0.5)
        self.wait(2.2)

        # --------------------------------------------------------
        # SYARAT 2: DEFINIT POSITIF (KRITERIA SYLVESTER)
        # --------------------------------------------------------
        t_s2_title = Tex(r"\textbf{2. Syarat Definit Positif (Kriteria Sylvester)}", font_size=26, color=BLUE_C)
        desc_s2 = Tex(r"Hitung determinan minor utama bertahap dari kiri atas ($> 0$):", font_size=20, color=WHITE_C)
        calc_m1 = Tex(r"\textbf{Minor $M_1$ ($1 \times 1$):}\quad $|4| = \mathbf{4 > 0}$", font_size=24, color=YELLOW_C)
        calc_m2 = Tex(r"\textbf{Minor $M_2$ ($2 \times 2$):}\quad $\begin{vmatrix} 4 & 2 \\ 2 & 10 \end{vmatrix} = 4(10) - 2(2) = 40 - 4 = \mathbf{36 > 0}$", font_size=23, color=YELLOW_C)
        calc_m3 = Tex(r"\textbf{Minor $M_3$ ($3 \times 3$):}\quad $\det(A) = 4(56) - 2(16) - 2(24) = \mathbf{144 > 0}$", font_size=23, color=YELLOW_C)
        badge_s2 = Tex(r"\textbf{\checkmark\ Syarat 2 Terpenuhi: Bebas Akar Imajiner!}", font_size=23, color=GREEN_C)

        content_s2 = VGroup(t_s2_title, desc_s2, calc_m1, calc_m2, calc_m3, badge_s2).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        content_s2.move_to(RIGHT * 2.8 + DOWN * 0.6)

        card_s2 = RoundedRectangle(
            corner_radius=0.2,
            width=content_s2.width + 0.7,
            height=content_s2.height + 0.6,
            fill_color=CARD_BG, fill_opacity=0.92, stroke_color=BORDER_C, stroke_width=2
        ).move_to(content_s2.get_center())

        hl_box = SurroundingRectangle(mat_A_check.get_entries()[0], color=GREEN_C, buff=0.08)
        hl_m2_target = SurroundingRectangle(
            VGroup(mat_A_check.get_entries()[0], mat_A_check.get_entries()[1], mat_A_check.get_entries()[3], mat_A_check.get_entries()[4]),
            color=YELLOW_C, buff=0.08
        )
        hl_m3_target = SurroundingRectangle(mat_A_check, color=BLUE_C, buff=0.1)

        self.play(
            FadeOut(highlight_sim),
            FadeOut(content_s1),
            ReplacementTransform(card_s1, card_s2),
            run_time=0.6
        )
        self.play(FadeIn(t_s2_title), FadeIn(desc_s2), run_time=0.5)
        self.play(Create(hl_box), Write(calc_m1), run_time=0.8)
        self.wait(1.5)
        self.play(Transform(hl_box, hl_m2_target), Write(calc_m2), run_time=0.8)
        self.wait(1.8)
        self.play(Transform(hl_box, hl_m3_target), Write(calc_m3), run_time=0.8)
        self.wait(1.8)
        self.play(FadeIn(badge_s2), run_time=0.5)
        self.wait(2.5)

        # Bersihkan layar untuk masuk ke Babak 2 (Faktorisasi)
        self.play(
            FadeOut(header_syarat),
            FadeOut(grp_A_check),
            FadeOut(card_s2),
            FadeOut(hl_box),
            FadeOut(content_s2),
            run_time=0.6
        )

        # ========================================================
        # 2. TAHAP FAKTORISASI A = L · L^T (KOLOM DEMI KOLOM)
        # ========================================================
        # 2. PROSES FAKTORISASI CHOLESKY (KOLOM DEMI KOLOM)
        # ========================================================
        header_faktorisasi = VGroup(
            Tex(r"\textbf{Faktorisasi Cholesky: } $A = L \cdot L^{\mathrm{T}}$", font_size=28, color=BLUE_C),
            MathTex(
                r"l_{jj} = \sqrt{a_{jj} - \sum_{k=1}^{j-1} l_{jk}^2},\quad l_{ij} = \frac{a_{ij} - \sum_{k=1}^{j-1} l_{ik}l_{jk}}{l_{jj}}",
                font_size=20,
                color=WHITE_C,
            )
        ).arrange(DOWN, buff=0.12).to_edge(UP, buff=0.25)
        self.play(FadeIn(header_faktorisasi), run_time=0.6)

        # Matriks A & Template Matriks L di Panel Kiri
        vals_A = [["4", "2", "-2"], ["2", "10", "2"], ["-2", "2", "6"]]
        mat_A = Matrix(vals_A, bracket_h_buff=0.1, bracket_v_buff=0.1, h_buff=0.8, v_buff=0.6)
        lbl_A = Tex(r"\textbf{Matriks $A$}", font_size=20, color=WHITE_C)
        grp_A_left = VGroup(lbl_A, mat_A).arrange(DOWN, buff=0.15).move_to(LEFT * 4.0 + UP * 1.1)

        vals_L_init = [["l_{11}", "0", "0"], ["l_{21}", "l_{22}", "0"], ["l_{31}", "l_{32}", "l_{33}"]]
        mat_L_curr = Matrix(vals_L_init, bracket_h_buff=0.1, bracket_v_buff=0.1, h_buff=0.8, v_buff=0.6)
        lbl_L_curr = Tex(r"\textbf{Matriks Segitiga Bawah $L$}", font_size=20, color=GREEN_C)
        grp_L_left = VGroup(lbl_L_curr, mat_L_curr).arrange(DOWN, buff=0.15).move_to(LEFT * 4.0 + DOWN * 1.8)

        # Redupkan elemen 0 pada matriks L
        for idx in [1, 2, 5]:
            mat_L_curr.get_entries()[idx].set_color(MUTED_C)

        self.play(FadeIn(grp_A_left), FadeIn(grp_L_left), run_time=0.8)
        self.wait(0.5)

        # ----------------------------------------------------
        # LANGKAH 1: MENGIHITUNG KOLOM 1 MATRIKS L
        # ----------------------------------------------------
        card_l1_title = Tex(r"\textbf{Langkah 1: Menghitung Kolom 1 Matriks $L$}", font_size=25, color=YELLOW_C)
        l11_calc = MathTex(r"l_{11} = \sqrt{a_{11}} = \sqrt{4} = \mathbf{2}", font_size=25, color=WHITE_C)
        l21_calc = MathTex(r"l_{21} = \frac{a_{21}}{l_{11}} = \frac{2}{2} = \mathbf{1}", font_size=25, color=WHITE_C)
        l31_calc = MathTex(r"l_{31} = \frac{a_{31}}{l_{11}} = \frac{-2}{2} = \mathbf{-1}", font_size=25, color=WHITE_C)
        l1_badge = Tex(
            r"\textbf{\checkmark\ Kolom 1 Matriks $L$ Selesai: } $\begin{bmatrix} 2 & 1 & -1 \end{bmatrix}^{\mathrm{T}}$",
            font_size=22,
            color=GREEN_C,
        )

        content_l1 = VGroup(card_l1_title, l11_calc, l21_calc, l31_calc, l1_badge).arrange(DOWN, buff=0.32, aligned_edge=LEFT)
        card_l1_bg = RoundedRectangle(
            width=6.6,
            height=content_l1.height + 0.55,
            corner_radius=0.14,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=YELLOW_C,
            stroke_width=2.0,
        ).move_to(RIGHT * 2.7 + DOWN * 0.35)
        content_l1.move_to(card_l1_bg.get_center())

        self.play(FadeIn(card_l1_bg), FadeIn(card_l1_title), run_time=0.6)

        # Tektokan l11
        box_focus = SurroundingRectangle(mat_A.get_entries()[0], color=YELLOW_C, buff=0.14, corner_radius=0.08)
        self.play(Create(box_focus), FadeIn(l11_calc), run_time=0.7)
        self.wait(0.8)

        new_l11 = MathTex(r"\mathbf{2}", font_size=26, color=GREEN_C).move_to(mat_L_curr.get_entries()[0].get_center())
        target_box_l11 = SurroundingRectangle(new_l11, color=GREEN_C, buff=0.14, corner_radius=0.08)
        self.play(
            ReplacementTransform(box_focus, target_box_l11),
            Transform(mat_L_curr.get_entries()[0], new_l11),
            run_time=0.7,
        )
        self.wait(0.8)
        self.play(FadeOut(target_box_l11), run_time=0.3)

        # Tektokan l21
        box_focus = SurroundingRectangle(mat_A.get_entries()[3], color=YELLOW_C, buff=0.14, corner_radius=0.08)
        self.play(Create(box_focus), FadeIn(l21_calc), run_time=0.7)
        self.wait(0.8)

        new_l21 = MathTex(r"\mathbf{1}", font_size=26, color=GREEN_C).move_to(mat_L_curr.get_entries()[3].get_center())
        target_box_l21 = SurroundingRectangle(new_l21, color=GREEN_C, buff=0.14, corner_radius=0.08)
        self.play(
            ReplacementTransform(box_focus, target_box_l21),
            Transform(mat_L_curr.get_entries()[3], new_l21),
            run_time=0.7,
        )
        self.wait(0.8)
        self.play(FadeOut(target_box_l21), run_time=0.3)

        # Tektokan l31
        box_focus = SurroundingRectangle(mat_A.get_entries()[6], color=YELLOW_C, buff=0.14, corner_radius=0.08)
        self.play(Create(box_focus), FadeIn(l31_calc), run_time=0.7)
        self.wait(0.8)

        new_l31 = MathTex(r"\mathbf{-1}", font_size=26, color=GREEN_C).move_to(mat_L_curr.get_entries()[6].get_center())
        target_box_l31 = SurroundingRectangle(new_l31, color=GREEN_C, buff=0.14, corner_radius=0.08)
        self.play(
            ReplacementTransform(box_focus, target_box_l31),
            Transform(mat_L_curr.get_entries()[6], new_l31),
            run_time=0.7,
        )
        self.wait(0.8)
        self.play(FadeOut(target_box_l31), run_time=0.3)

        # Selesai Kolom 1
        col1_entries = VGroup(mat_L_curr.get_entries()[0], mat_L_curr.get_entries()[3], mat_L_curr.get_entries()[6])
        box_col1_all = SurroundingRectangle(col1_entries, color=GREEN_C, buff=0.12, corner_radius=0.1)
        self.play(Create(box_col1_all), FadeIn(l1_badge), run_time=0.7)
        self.wait(1.8)
        self.play(
            FadeOut(box_col1_all),
            FadeOut(card_l1_bg),
            FadeOut(card_l1_title),
            FadeOut(l11_calc),
            FadeOut(l21_calc),
            FadeOut(l31_calc),
            FadeOut(l1_badge),
            run_time=0.6,
        )

        # ----------------------------------------------------
        # LANGKAH 2: MENGIHITUNG KOLOM 2 MATRIKS L
        # ----------------------------------------------------
        card_l2_title = Tex(r"\textbf{Langkah 2: Menghitung Kolom 2 Matriks $L$}", font_size=25, color=YELLOW_C)
        l22_calc = MathTex(r"l_{22} = \sqrt{a_{22} - l_{21}^2} = \sqrt{10 - 1^2} = \sqrt{9} = \mathbf{3}", font_size=24, color=WHITE_C)
        l32_calc = MathTex(r"l_{32} = \frac{a_{32} - l_{31}l_{21}}{l_{22}} = \frac{2 - (-1)(1)}{3} = \frac{3}{3} = \mathbf{1}", font_size=24, color=WHITE_C)
        l2_badge = Tex(
            r"\textbf{\checkmark\ Kolom 2 Matriks $L$ Selesai: } $\begin{bmatrix} 0 & 3 & 1 \end{bmatrix}^{\mathrm{T}}$",
            font_size=22,
            color=GREEN_C,
        )

        content_l2 = VGroup(card_l2_title, l22_calc, l32_calc, l2_badge).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        card_l2_bg = RoundedRectangle(
            width=6.6,
            height=content_l2.height + 0.55,
            corner_radius=0.14,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=YELLOW_C,
            stroke_width=2.0,
        ).move_to(RIGHT * 2.7 + DOWN * 0.35)
        content_l2.move_to(card_l2_bg.get_center())

        self.play(FadeIn(card_l2_bg), FadeIn(card_l2_title), run_time=0.6)

        # Tektokan l22
        box_focus = SurroundingRectangle(mat_A.get_entries()[4], color=YELLOW_C, buff=0.14, corner_radius=0.08)
        self.play(Create(box_focus), FadeIn(l22_calc), run_time=0.7)
        self.wait(0.8)

        new_l22 = MathTex(r"\mathbf{3}", font_size=26, color=GREEN_C).move_to(mat_L_curr.get_entries()[4].get_center())
        target_box_l22 = SurroundingRectangle(new_l22, color=GREEN_C, buff=0.14, corner_radius=0.08)
        self.play(
            ReplacementTransform(box_focus, target_box_l22),
            Transform(mat_L_curr.get_entries()[4], new_l22),
            run_time=0.7,
        )
        self.wait(0.8)
        self.play(FadeOut(target_box_l22), run_time=0.3)

        # Tektokan l32
        box_focus = SurroundingRectangle(mat_A.get_entries()[7], color=YELLOW_C, buff=0.14, corner_radius=0.08)
        self.play(Create(box_focus), FadeIn(l32_calc), run_time=0.7)
        self.wait(0.8)

        new_l32 = MathTex(r"\mathbf{1}", font_size=26, color=GREEN_C).move_to(mat_L_curr.get_entries()[7].get_center())
        target_box_l32 = SurroundingRectangle(new_l32, color=GREEN_C, buff=0.14, corner_radius=0.08)
        self.play(
            ReplacementTransform(box_focus, target_box_l32),
            Transform(mat_L_curr.get_entries()[7], new_l32),
            run_time=0.7,
        )
        self.wait(0.8)
        self.play(FadeOut(target_box_l32), run_time=0.3)

        # Selesai Kolom 2
        col2_entries = VGroup(mat_L_curr.get_entries()[4], mat_L_curr.get_entries()[7])
        box_col2_all = SurroundingRectangle(col2_entries, color=GREEN_C, buff=0.12, corner_radius=0.1)
        self.play(Create(box_col2_all), FadeIn(l2_badge), run_time=0.7)
        self.wait(1.8)
        self.play(
            FadeOut(box_col2_all),
            FadeOut(card_l2_bg),
            FadeOut(card_l2_title),
            FadeOut(l22_calc),
            FadeOut(l32_calc),
            FadeOut(l2_badge),
            run_time=0.6,
        )

        # ----------------------------------------------------
        # LANGKAH 3: MENGIHITUNG KOLOM 3 MATRIKS L
        # ----------------------------------------------------
        card_l3_title = Tex(r"\textbf{Langkah 3: Menghitung Kolom 3 Matriks $L$}", font_size=25, color=YELLOW_C)
        l33_calc = MathTex(
            r"l_{33} = \sqrt{a_{33} - (l_{31}^2 + l_{32}^2)} = \sqrt{6 - ((-1)^2 + 1^2)} = \sqrt{4} = \mathbf{2}",
            font_size=23,
            color=WHITE_C,
        )
        l3_badge = Tex(
            r"\textbf{\checkmark\ Kolom 3 Matriks $L$ Selesai: } $\begin{bmatrix} 0 & 0 & 2 \end{bmatrix}^{\mathrm{T}}$",
            font_size=22,
            color=GREEN_C,
        )

        content_l3 = VGroup(card_l3_title, l33_calc, l3_badge).arrange(DOWN, buff=0.38, aligned_edge=LEFT)
        card_l3_bg = RoundedRectangle(
            width=6.6,
            height=content_l3.height + 0.55,
            corner_radius=0.14,
            fill_color=CARD_BG,
            fill_opacity=0.95,
            stroke_color=YELLOW_C,
            stroke_width=2.0,
        ).move_to(RIGHT * 2.7 + DOWN * 0.35)
        content_l3.move_to(card_l3_bg.get_center())

        self.play(FadeIn(card_l3_bg), FadeIn(card_l3_title), run_time=0.6)

        # Tektokan l33
        box_focus = SurroundingRectangle(mat_A.get_entries()[8], color=YELLOW_C, buff=0.14, corner_radius=0.08)
        self.play(Create(box_focus), FadeIn(l33_calc), run_time=0.7)
        self.wait(0.8)

        new_l33 = MathTex(r"\mathbf{2}", font_size=26, color=GREEN_C).move_to(mat_L_curr.get_entries()[8].get_center())
        target_box_l33 = SurroundingRectangle(new_l33, color=GREEN_C, buff=0.14, corner_radius=0.08)
        self.play(
            ReplacementTransform(box_focus, target_box_l33),
            Transform(mat_L_curr.get_entries()[8], new_l33),
            run_time=0.7,
        )
        self.wait(0.8)
        self.play(FadeOut(target_box_l33), run_time=0.3)

        # Selesai Kolom 3
        box_col3_all = SurroundingRectangle(new_l33, color=GREEN_C, buff=0.12, corner_radius=0.1)
        self.play(Create(box_col3_all), FadeIn(l3_badge), run_time=0.7)
        self.wait(2.0)

        # Bersihkan seluruh layar faktorisasi
        self.play(
            FadeOut(header_faktorisasi),
            FadeOut(grp_A_left),
            FadeOut(grp_L_left),
            FadeOut(mat_L_curr),
            FadeOut(card_l3_bg),
            FadeOut(card_l3_title),
            FadeOut(l33_calc),
            FadeOut(l3_badge),
            FadeOut(box_col3_all),
            run_time=0.7,
        )

        # ----------------------------------------------------
        # HASIL DEKOMPOSISI L DAN L^T (EFEK CERMIN TRANSPOS)
        # ----------------------------------------------------
        header_decomp = Tex(
            r"\textbf{Hasil Dekomposisi Cholesky: } $A = L \cdot L^{\mathrm{T}}$",
            font_size=32,
            color=WHITE_C,
        ).to_edge(UP, buff=0.40)
        self.play(FadeIn(header_decomp), run_time=0.7)

        mat_L_final = Matrix([["2", "0", "0"], ["1", "3", "0"], ["-1", "1", "2"]], bracket_h_buff=0.12, bracket_v_buff=0.12, h_buff=0.95, v_buff=0.72)
        for i, val in enumerate(["2", "0", "0", "1", "3", "0", "-1", "1", "2"]):
            c = MUTED_C if val == "0" else GREEN_C
            mat_L_final.get_entries()[i].set_color(c).scale(1.05)

        lbl_L_final = Tex(r"\textbf{Matriks $L$ (Segitiga Bawah)}", font_size=21, color=GREEN_C)
        grp_L_final = VGroup(lbl_L_final, mat_L_final).arrange(DOWN, buff=0.28).move_to(LEFT * 3.3 + UP * 0.60)

        dot_mult = MathTex(r"\cdot", font_size=48, color=WHITE_C).move_to(UP * 0.60)

        mat_LT_final = Matrix([["2", "1", "-1"], ["0", "3", "1"], ["0", "0", "2"]], bracket_h_buff=0.12, bracket_v_buff=0.12, h_buff=0.95, v_buff=0.72)
        for i, val in enumerate(["2", "1", "-1", "0", "3", "1", "0", "0", "2"]):
            c = MUTED_C if val == "0" else BLUE_C
            mat_LT_final.get_entries()[i].set_color(c).scale(1.05)

        lbl_LT_final = Tex(r"\textbf{Matriks $L^{\mathrm{T}}$ (Transpos = Segitiga Atas)}", font_size=21, color=BLUE_C)
        grp_LT_final = VGroup(lbl_LT_final, mat_LT_final).arrange(DOWN, buff=0.28).move_to(RIGHT * 3.3 + UP * 0.60)

        self.play(FadeIn(grp_L_final, shift=RIGHT * 0.2), run_time=0.7)
        self.play(Write(dot_mult), run_time=0.3)
        self.play(FadeIn(grp_LT_final, shift=LEFT * 0.2), run_time=0.7)

        # Card Catatan Efisiensi (kompak, padat, TeX formal, dinaikkan ke safe zone tinggi aman fullscreen)
        txt_line1 = Tex(
            r"\textbf{Catatan Efisiensi: } Matriks $L^{\mathrm{T}}$ didapat langsung dari transpos tanpa eliminasi tambahan!",
            font_size=22,
            color=WHITE_C,
        )
        txt_line2 = Tex(
            r"\textbf{Keunggulan: } Menghemat $50\%$ beban komputasi dan memori dibanding eliminasi Gauss/LU standar.",
            font_size=20,
            color=YELLOW_C,
        )
        content_box = VGroup(txt_line1, txt_line2).arrange(DOWN, buff=0.16)
        card_magic = RoundedRectangle(
            width=content_box.width + 0.8,
            height=content_box.height + 0.48,
            corner_radius=0.14,
            fill_color=CARD_BG,
            fill_opacity=0.98,
            stroke_color=GREEN_C,
            stroke_width=2.5,
        ).move_to(DOWN * 1.70)
        content_box.move_to(card_magic.get_center())

        self.play(FadeIn(card_magic), FadeIn(content_box), run_time=0.8)
        self.wait(3.0)

        self.play(
            FadeOut(header_decomp),
            FadeOut(grp_L_final),
            FadeOut(dot_mult),
            FadeOut(grp_LT_final),
            FadeOut(card_magic),
            FadeOut(content_box),
            run_time=0.6
        )

        # ========================================================
        # 3. PENYELESAIAN SPL 2-TAHAP (SUBSTITUSI MAJU & MUNDUR)
        # ========================================================
        # 3.A SUBSTITUSI MAJU L y = b
        header_spl1 = Tex(
            r"\textbf{Tahap 1 SPL: Substitusi Maju } $L \cdot \mathbf{y} = \mathbf{b}$",
            font_size=30,
            color=GREEN_C,
        ).to_edge(UP, buff=0.38)
        self.play(Write(header_spl1), run_time=0.7)

        mat_L_fwd = Matrix([["2", "0", "0"], ["1", "3", "0"], ["-1", "1", "2"]], bracket_h_buff=0.1, bracket_v_buff=0.1, h_buff=0.85, v_buff=0.75).scale(0.86)
        for i, val in enumerate(["2", "0", "0", "1", "3", "0", "-1", "1", "2"]):
            c = MUTED_C if val == "0" else GREEN_C
            mat_L_fwd.get_entries()[i].set_color(c)

        vec_y_fwd = Matrix([["y_1"], ["y_2"], ["y_3"]], bracket_h_buff=0.08, bracket_v_buff=0.1, h_buff=0.6, v_buff=0.75).scale(0.86)
        for entry in vec_y_fwd.get_entries():
            entry.set_color(YELLOW_C)

        eq_fwd = MathTex(r"=", font_size=34, color=WHITE_C)

        vec_b_fwd = Matrix([["2"], ["22"], ["4"]], bracket_h_buff=0.08, bracket_v_buff=0.1, h_buff=0.6, v_buff=0.75).scale(0.86)
        for entry in vec_b_fwd.get_entries():
            entry.set_color(WHITE_C)

        lbl_sys_fwd = Tex(r"$L \cdot \mathbf{y} = \mathbf{b}$", font_size=22, color=MUTED_C)

        row_fwd = VGroup(mat_L_fwd, vec_y_fwd, eq_fwd, vec_b_fwd).arrange(RIGHT, buff=0.22)
        eq_fwd.set_y(mat_L_fwd.get_rows()[1].get_center()[1])
        lbl_sys_fwd.next_to(row_fwd, UP, buff=0.22)

        grp_left_fwd = VGroup(lbl_sys_fwd, row_fwd).move_to(LEFT * 3.8 + DOWN * 0.10)
        self.play(FadeIn(grp_left_fwd), run_time=0.7)

        # Konten Card Kanan
        t_sub1_head = Tex(r"\textbf{Perhitungan Maju (Atas ke Bawah):}", font_size=24, color=GREEN_C)

        line_b1 = MathTex(
            r"\textbf{Baris 1: } 2y_1 = 2 \implies \mathbf{y_1 = 1}",
            font_size=23,
            color=WHITE_C,
        )

        line_b2 = MathTex(
            r"\textbf{Baris 2: } 1(1) + 3y_2 = 22 \implies 3y_2 = 21 \implies \mathbf{y_2 = 7}",
            font_size=23,
            color=WHITE_C,
        )

        line_b3 = MathTex(
            r"\begin{aligned}"
            r"\textbf{Baris 3: } & -1(1) + 1(7) + 2y_3 = 4 \\"
            r"& \implies 6 + 2y_3 = 4 \implies 2y_3 = -2 \implies \mathbf{y_3 = -1}"
            r"\end{aligned}",
            font_size=22,
            color=WHITE_C,
        )

        badge_y_txt = MathTex(
            r"\textbf{Hasil Vektor Antara: } \mathbf{y} = \begin{bmatrix} 1 & 7 & -1 \end{bmatrix}^{\mathrm{T}}",
            font_size=22,
            color=YELLOW_C,
        )
        badge_y_bg = RoundedRectangle(
            corner_radius=0.10,
            width=badge_y_txt.width + 0.40,
            height=badge_y_txt.height + 0.22,
            fill_color="#0F172A",
            fill_opacity=0.9,
            stroke_color=YELLOW_C,
            stroke_width=1.8,
        )
        badge_y_grp = VGroup(badge_y_bg, badge_y_txt)
        badge_y_txt.move_to(badge_y_bg.get_center())

        card_content_fwd = VGroup(t_sub1_head, line_b1, line_b2, line_b3, badge_y_grp).arrange(DOWN, buff=0.24, aligned_edge=LEFT)

        card_sub1 = RoundedRectangle(
            corner_radius=0.16,
            width=card_content_fwd.width + 0.65,
            height=card_content_fwd.height + 0.48,
            fill_color=CARD_BG,
            fill_opacity=0.98,
            stroke_color=GREEN_C,
            stroke_width=2.5,
        ).move_to(RIGHT * 3.05 + DOWN * 0.10)
        card_content_fwd.move_to(card_sub1.get_center())

        self.play(Create(card_sub1), FadeIn(t_sub1_head), run_time=0.6)

        # Baris 1: Tektokan kotak baris 1
        box_L1 = SurroundingRectangle(mat_L_fwd.get_rows()[0], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        box_b1 = SurroundingRectangle(vec_b_fwd.get_rows()[0], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_L1), Create(box_b1), run_time=0.4)
        self.play(Write(line_b1), run_time=0.7)
        y1_solved = MathTex("1", font_size=mat_L_fwd.get_entries()[0].font_size, color=GREEN_C).move_to(vec_y_fwd.get_entries()[0].get_center())
        self.play(Transform(vec_y_fwd.get_entries()[0], y1_solved), run_time=0.4)
        self.wait(1.0)
        self.play(FadeOut(box_L1), FadeOut(box_b1), run_time=0.3)

        # Baris 2: Tektokan kotak baris 2
        box_L2 = SurroundingRectangle(mat_L_fwd.get_rows()[1], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        box_b2 = SurroundingRectangle(vec_b_fwd.get_rows()[1], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_L2), Create(box_b2), run_time=0.4)
        self.play(Write(line_b2), run_time=0.7)
        y2_solved = MathTex("7", font_size=mat_L_fwd.get_entries()[0].font_size, color=GREEN_C).move_to(vec_y_fwd.get_entries()[1].get_center())
        self.play(Transform(vec_y_fwd.get_entries()[1], y2_solved), run_time=0.4)
        self.wait(1.0)
        self.play(FadeOut(box_L2), FadeOut(box_b2), run_time=0.3)

        # Baris 3: Tektokan kotak baris 3
        box_L3 = SurroundingRectangle(mat_L_fwd.get_rows()[2], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        box_b3 = SurroundingRectangle(vec_b_fwd.get_rows()[2], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_L3), Create(box_b3), run_time=0.4)
        self.play(Write(line_b3), run_time=0.9)
        y3_solved = MathTex("-1", font_size=mat_L_fwd.get_entries()[0].font_size, color=GREEN_C).move_to(vec_y_fwd.get_entries()[2].get_center())
        self.play(Transform(vec_y_fwd.get_entries()[2], y3_solved), run_time=0.4)
        self.wait(1.0)
        self.play(FadeOut(box_L3), FadeOut(box_b3), run_time=0.3)

        # Hasil Vektor Antara
        box_y_all = SurroundingRectangle(vec_y_fwd, color=GREEN_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_y_all), FadeIn(badge_y_grp, scale=0.95), run_time=0.6)
        self.wait(2.2)
        self.play(FadeOut(box_y_all), run_time=0.3)

        self.play(
            FadeOut(header_spl1),
            FadeOut(grp_left_fwd),
            FadeOut(card_sub1),
            FadeOut(card_content_fwd),
            run_time=0.5
        )

        # 3.B SUBSTITUSI MUNDUR L^T x = y
        header_spl2 = Tex(
            r"\textbf{Tahap 2 SPL: Substitusi Mundur } $L^{\mathrm{T}} \cdot \mathbf{x} = \mathbf{y}$",
            font_size=30,
            color=BLUE_C,
        ).to_edge(UP, buff=0.38)
        self.play(FadeIn(header_spl2), run_time=0.7)

        mat_LT_bwd = Matrix(
            [["2", "1", "-1"], ["0", "3", "1"], ["0", "0", "2"]],
            bracket_h_buff=0.1,
            bracket_v_buff=0.12,
            h_buff=0.85,
            v_buff=0.88,
        ).scale(0.84)
        for i, val in enumerate(["2", "1", "-1", "0", "3", "1", "0", "0", "2"]):
            c = MUTED_C if val == "0" else BLUE_C
            mat_LT_bwd.get_entries()[i].set_color(c)

        vec_x_bwd = Matrix(
            [["x_1"], ["x_2"], ["x_3"]],
            bracket_h_buff=0.12,
            bracket_v_buff=0.12,
            h_buff=0.6,
            v_buff=0.88,
        ).scale(0.84)
        for entry in vec_x_bwd.get_entries():
            entry.set_color(YELLOW_C)

        eq_bwd = MathTex(r"=", font_size=34, color=WHITE_C)

        vec_y_bwd = Matrix(
            [["1"], ["7"], ["-1"]],
            bracket_h_buff=0.08,
            bracket_v_buff=0.12,
            h_buff=0.6,
            v_buff=0.88,
        ).scale(0.84)
        for entry in vec_y_bwd.get_entries():
            entry.set_color(GREEN_C)

        lbl_sys_bwd = Tex(r"$L^{\mathrm{T}} \cdot \mathbf{x} = \mathbf{y}$", font_size=22, color=MUTED_C)

        row_bwd = VGroup(mat_LT_bwd, vec_x_bwd, eq_bwd, vec_y_bwd).arrange(RIGHT, buff=0.22)
        eq_bwd.set_y(mat_LT_bwd.get_rows()[1].get_center()[1])
        lbl_sys_bwd.next_to(row_bwd, UP, buff=0.22)

        grp_left_bwd = VGroup(lbl_sys_bwd, row_bwd).move_to(LEFT * 3.8 + DOWN * 0.10)
        self.play(FadeIn(grp_left_bwd), run_time=0.7)

        # Konten Card Kanan (Pecahan murni, tanpa desimal)
        t_sub2_head = Tex(r"\textbf{Perhitungan Mundur (Bawah ke Atas):}", font_size=24, color=BLUE_C)

        line_b3 = MathTex(
            r"\textbf{Baris 3: } 2x_3 = -1 \implies \mathbf{x_3 = -\frac{1}{2}}",
            font_size=22,
            color=WHITE_C,
        )

        line_b2 = MathTex(
            r"\begin{aligned}"
            r"\textbf{Baris 2: } & 3x_2 + 1(-\frac{1}{2}) = 7 \\"
            r"& \implies 3x_2 = \frac{15}{2} \implies \mathbf{x_2 = \frac{5}{2}}"
            r"\end{aligned}",
            font_size=21,
            color=WHITE_C,
        )

        line_b1 = MathTex(
            r"\begin{aligned}"
            r"\textbf{Baris 1: } & 2x_1 + 1(\frac{5}{2}) - 1(-\frac{1}{2}) = 1 \\"
            r"& \implies 2x_1 + 3 = 1 \implies \mathbf{x_1 = -1}"
            r"\end{aligned}",
            font_size=21,
            color=WHITE_C,
        )

        badge_x_txt = MathTex(
            r"\textbf{Solusi SPL: } \mathbf{x} = \begin{bmatrix} -1 & \frac{5}{2} & -\frac{1}{2} \end{bmatrix}^{\mathrm{T}}",
            font_size=22,
            color=YELLOW_C,
        )
        badge_x_bg = RoundedRectangle(
            corner_radius=0.10,
            width=badge_x_txt.width + 0.40,
            height=badge_x_txt.height + 0.22,
            fill_color="#0F172A",
            fill_opacity=0.9,
            stroke_color=YELLOW_C,
            stroke_width=1.8,
        )
        badge_x_grp = VGroup(badge_x_bg, badge_x_txt)
        badge_x_txt.move_to(badge_x_bg.get_center())

        card_content_bwd = VGroup(t_sub2_head, line_b3, line_b2, line_b1, badge_x_grp).arrange(DOWN, buff=0.20, aligned_edge=LEFT)

        card_sub2 = RoundedRectangle(
            corner_radius=0.16,
            width=card_content_bwd.width + 0.65,
            height=card_content_bwd.height + 0.45,
            fill_color=CARD_BG,
            fill_opacity=0.98,
            stroke_color=BLUE_C,
            stroke_width=2.5,
        ).move_to(RIGHT * 3.05 + DOWN * 0.10)
        card_content_bwd.move_to(card_sub2.get_center())

        self.play(Create(card_sub2), FadeIn(t_sub2_head), run_time=0.6)

        # Baris 3: Tektokan kotak baris 3
        box_LT3 = SurroundingRectangle(mat_LT_bwd.get_rows()[2], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        box_y3 = SurroundingRectangle(vec_y_bwd.get_rows()[2], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_LT3), Create(box_y3), run_time=0.4)
        self.play(Write(line_b3), run_time=0.7)
        x3_solved = MathTex(r"-\frac{1}{2}", font_size=24, color=BLUE_C).move_to(vec_x_bwd.get_entries()[2].get_center())
        self.play(Transform(vec_x_bwd.get_entries()[2], x3_solved), run_time=0.4)
        self.wait(1.0)
        self.play(FadeOut(box_LT3), FadeOut(box_y3), run_time=0.3)

        # Baris 2: Tektokan kotak baris 2
        box_LT2 = SurroundingRectangle(mat_LT_bwd.get_rows()[1], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        box_y2 = SurroundingRectangle(vec_y_bwd.get_rows()[1], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_LT2), Create(box_y2), run_time=0.4)
        self.play(Write(line_b2), run_time=0.8)
        x2_solved = MathTex(r"\frac{5}{2}", font_size=24, color=BLUE_C).move_to(vec_x_bwd.get_entries()[1].get_center())
        self.play(Transform(vec_x_bwd.get_entries()[1], x2_solved), run_time=0.4)
        self.wait(1.0)
        self.play(FadeOut(box_LT2), FadeOut(box_y2), run_time=0.3)

        # Baris 1: Tektokan kotak baris 1
        box_LT1 = SurroundingRectangle(mat_LT_bwd.get_rows()[0], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        box_y1 = SurroundingRectangle(vec_y_bwd.get_rows()[0], color=YELLOW_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_LT1), Create(box_y1), run_time=0.4)
        self.play(Write(line_b1), run_time=0.8)
        x1_solved = MathTex("-1", font_size=24, color=BLUE_C).move_to(vec_x_bwd.get_entries()[0].get_center())
        self.play(Transform(vec_x_bwd.get_entries()[0], x1_solved), run_time=0.4)
        self.wait(1.0)
        self.play(FadeOut(box_LT1), FadeOut(box_y1), run_time=0.3)

        # Solusi SPL Akhir
        box_x_all = SurroundingRectangle(vec_x_bwd, color=BLUE_C, buff=0.08, stroke_width=2.5)
        self.play(Create(box_x_all), FadeIn(badge_x_grp, scale=0.95), run_time=0.6)
        self.wait(2.2)
        self.play(FadeOut(box_x_all), run_time=0.3)

        self.play(
            FadeOut(header_spl2),
            FadeOut(grp_left_bwd),
            FadeOut(card_sub2),
            FadeOut(card_content_bwd),
            run_time=0.5
        )

        # ========================================================
        # 4. KESIMPULAN AKHIR & VERIFIKASI RESIDU (ELEGANT CONCLUSION)
        # ========================================================
        header_final = Tex(
            r"\textbf{Verifikasi Solusi Akhir Metode Cholesky}",
            font_size=32,
            color=YELLOW_C,
        ).to_edge(UP, buff=0.36)
        self.play(FadeIn(header_final), run_time=0.7)

        t_res_final = Tex(
            r"\textbf{Solusi Eksak Sistem Persamaan Linier:}",
            font_size=24,
            color=WHITE_C,
        )

        math_sol_box = MathTex(
            r"\mathbf{x} = \begin{bmatrix} x_1 \\ x_2 \\ x_3 \end{bmatrix} = \begin{bmatrix} -1 \\[4pt] \frac{5}{2} \\[4pt] -\frac{1}{2} \end{bmatrix}",
            font_size=28,
            color=YELLOW_C,
        )

        line_div = Line(LEFT * 5.6, RIGHT * 5.6, color=BORDER_C, stroke_width=2.0)

        t_check_intro = Tex(
            r"\textbf{Substitusi Balik ke Matriks Awal } ($A \cdot \mathbf{x} = \mathbf{b}$):",
            font_size=22,
            color=GREEN_C,
        )

        check_eq = MathTex(
            r"\begin{bmatrix} 4 & 2 & -2 \\ 2 & 10 & 2 \\ -2 & 2 & 6 \end{bmatrix}"
            r"\begin{bmatrix} -1 \\ \frac{5}{2} \\ -\frac{1}{2} \end{bmatrix}"
            r"= \begin{bmatrix} -4 + 5 + 1 \\ -2 + 25 - 1 \\ 2 + 5 - 3 \end{bmatrix}"
            r"= \begin{bmatrix} 2 \\ 22 \\ 4 \end{bmatrix} = \mathbf{b}",
            font_size=23,
            color=WHITE_C,
        )

        badge_concl_txt = Tex(
            r"\textbf{\checkmark\ Solusi 100\% Eksak} \quad $\cdot$ \quad \textbf{Residu } $\|A\mathbf{x} - \mathbf{b}\| = 0$",
            font_size=22,
            color=LIGHT_GREEN,
        )
        badge_concl_bg = RoundedRectangle(
            corner_radius=0.12,
            width=badge_concl_txt.width + 0.55,
            height=badge_concl_txt.height + 0.28,
            fill_color="#064E3B",
            fill_opacity=0.85,
            stroke_color=GREEN_C,
            stroke_width=2.0,
        )
        badge_concl_grp = VGroup(badge_concl_bg, badge_concl_txt)
        badge_concl_txt.move_to(badge_concl_bg.get_center())

        card_content = VGroup(
            t_res_final,
            math_sol_box,
            line_div,
            t_check_intro,
            check_eq,
            badge_concl_grp,
        ).arrange(DOWN, buff=0.22)

        card_final = RoundedRectangle(
            corner_radius=0.18,
            width=11.6,
            height=card_content.height + 0.55,
            fill_color=CARD_BG,
            fill_opacity=0.98,
            stroke_color=GREEN_C,
            stroke_width=2.5,
        ).move_to(DOWN * 0.15)
        card_content.move_to(card_final.get_center())

        self.play(Create(card_final), run_time=0.6)
        self.play(Write(t_res_final), FadeIn(math_sol_box), run_time=0.8)
        self.play(Create(line_div), FadeIn(t_check_intro), run_time=0.5)
        self.play(Write(check_eq), run_time=1.2)
        self.play(FadeIn(badge_concl_grp, scale=0.95), run_time=0.6)
        self.wait(4.0)

        # Penutup Selesai
        self.play(
            FadeOut(header_final),
            FadeOut(card_final),
            FadeOut(card_content),
            run_time=0.7
        )

        final_thanks = Text("Presentasi Dekomposisi Cholesky Selesai", font_size=32, color=GREEN_C, weight=BOLD).move_to(ORIGIN)
        self.play(FadeIn(final_thanks), run_time=0.9)
        self.wait(2.5)
