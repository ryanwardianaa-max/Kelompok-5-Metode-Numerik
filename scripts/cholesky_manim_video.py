from manim import *

# =========================================================================
# PALET WARNA VISUAL KONTRAST TINGGI (OPTIMAL KELAS & SMART TV BESAR)
# =========================================================================
BG_DARK = "#0B0F19"       # Obsidian gelap pekat
CARD_BG = "#131B2E"       # Panel biru malam kontras
BORDER_COLOR = "#38BDF8"  # Cyan cerah
TEXT_COLOR = "#FFFFFF"    # Putih murni
TEXT_MUTED = "#94A3B8"    # Abu-abu terang terbaca
ACCENT_CYAN = "#38BDF8"   # Cyan terang
ACCENT_WARN = "#FACC15"   # Kuning terang
ACCENT_GREEN = "#22C55E"  # Hijau segar
ACCENT_ROSE = "#F43F5E"   # Merah muda tegas

class CholeskyUnifiedExplainer(Scene):
    def construct(self):
        self.camera.background_color = BG_DARK

        # -----------------------------------------------------------------
        # WATERMARK IDENTITAS DI POJOK KANAN ATAS
        # -----------------------------------------------------------------
        watermark = Text("@librayn", font_size=22, color="#64748B", weight=BOLD)
        watermark.to_corner(UR, buff=0.35)
        self.add(watermark)

        # -----------------------------------------------------------------
        # HEADER UTAMA PERSISTEN SEPANJANG VIDEO
        # -----------------------------------------------------------------
        main_title = Text("Dekomposisi Cholesky", font_size=32, color=ACCENT_WARN, weight=BOLD)
        main_sub = MathTex(
            r"\text{Faktorisasi Khusus SPL: } A \cdot \mathbf{x} = \mathbf{b} \quad \implies \quad A = L \cdot L^T",
            font_size=24,
            color=ACCENT_CYAN
        )
        header_group = VGroup(main_title, main_sub).arrange(DOWN, buff=0.15)
        header_group.to_edge(UP, buff=0.3)
        self.play(FadeIn(header_group, shift=DOWN * 0.2), run_time=1.4)
        self.wait(1.5)

        # =================================================================
        # INTRO: SPL 3x3 DAN ANALOGI CERMIN AJAIB
        # =================================================================
        spl_matrix = MathTex(
            r"\begin{bmatrix} 4 & 2 & -2 \\ 2 & 10 & 2 \\ -2 & 2 & 6 \end{bmatrix}"
            r"\begin{bmatrix} x_1 \\ x_2 \\ x_3 \end{bmatrix} = "
            r"\begin{bmatrix} 2 \\ 22 \\ 4 \end{bmatrix}",
            font_size=30,
            color=TEXT_COLOR
        ).shift(UP * 0.6)

        self.play(FadeIn(spl_matrix, shift=UP * 0.2), run_time=1.5)
        self.wait(1.5)

        # Card Pengantar Analogi Cermin Ajaib (Spacious & Clean)
        intro_box = RoundedRectangle(
            corner_radius=0.2, width=11.6, height=3.1,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).shift(DOWN * 2.0)

        intro_title = Text("Analogi Cermin Ajaib (U = L Transpos)", font_size=27, color=ACCENT_WARN, weight=BOLD)
        intro_sub = MathTex(r"U = L^T \quad \text{atau} \quad u_{ij} = l_{ji}", font_size=26, color=TEXT_COLOR)
        intro_body = Text("Komputasi 50% lebih hemat, 2x lebih cepat dari eliminasi LU biasa.", font_size=23, color=TEXT_MUTED)
        intro_req = Text("SYARAT MUTLAK: Matriks Wajib Simetris & Definit Positif!", font_size=24, color=ACCENT_ROSE, weight=BOLD)

        intro_content = VGroup(intro_title, intro_sub, intro_body, intro_req).arrange(DOWN, buff=0.22)
        intro_content.move_to(intro_box.get_center())

        self.play(FadeIn(intro_box), FadeIn(intro_content), run_time=1.5)
        self.wait(4.5)
        self.play(FadeOut(intro_box), FadeOut(intro_content), FadeOut(spl_matrix), run_time=1.2)

        # =================================================================
        # BAGIAN 1: VERIFIKASI 2 SYARAT MUTLAK (ARAHAN DOSEN IBU LINDA)
        # =================================================================
        # Matriks A di sebelah kiri (tetap diam sebagai acuan visual)
        a_lbl = Text("Matriks A:", font_size=26, color=ACCENT_CYAN, weight=BOLD).move_to(LEFT * 4.0 + UP * 1.5)
        a_mat = Matrix(
            [[4, 2, -2],
             [2, 10, 2],
             [-2, 2, 6]],
            v_buff=0.75, h_buff=0.85
        ).scale(0.85).move_to(LEFT * 4.0 + DOWN * 0.3)
        a_mat.get_brackets().set_color(BORDER_COLOR)

        self.play(FadeIn(a_lbl), FadeIn(a_mat), run_time=1.2)
        self.wait(1.5)

        # Highlight Pasangan Simetris pada Matriks A
        hl_12 = SurroundingRectangle(a_mat.get_entries()[1], color=ACCENT_GREEN, buff=0.1, stroke_width=2.5)
        hl_21 = SurroundingRectangle(a_mat.get_entries()[3], color=ACCENT_GREEN, buff=0.1, stroke_width=2.5)
        hl_13 = SurroundingRectangle(a_mat.get_entries()[2], color=ACCENT_WARN, buff=0.1, stroke_width=2.5)
        hl_31 = SurroundingRectangle(a_mat.get_entries()[6], color=ACCENT_WARN, buff=0.1, stroke_width=2.5)
        hl_23 = SurroundingRectangle(a_mat.get_entries()[5], color=ACCENT_CYAN, buff=0.1, stroke_width=2.5)
        hl_32 = SurroundingRectangle(a_mat.get_entries()[7], color=ACCENT_CYAN, buff=0.1, stroke_width=2.5)
        hl_group = VGroup(hl_12, hl_21, hl_13, hl_31, hl_23, hl_32)

        # Card Syarat 1: Matriks Simetris
        card_center = RIGHT * 3.3 + DOWN * 0.1
        card_w, card_h = 7.5, 5.5

        req1_box = RoundedRectangle(
            corner_radius=0.25, width=card_w, height=card_h,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).move_to(card_center)

        req1_title = Text("Syarat 1: Matriks Harus Simetris", font_size=28, color=ACCENT_WARN, weight=BOLD)
        req1_sub1 = Text("Cermin Diagonal: Elemen Atas & Bawah Wajib Sama", font_size=21, color=TEXT_MUTED)
        req1_sub2 = MathTex(r"A = A^T \quad \iff \quad a_{ij} = a_{ji}", font_size=25, color=TEXT_COLOR)

        pair1 = MathTex(r"a_{12} = a_{21} = 2 \quad \checkmark", font_size=26, color=ACCENT_GREEN)
        pair2 = MathTex(r"a_{13} = a_{31} = -2 \quad \checkmark", font_size=26, color=ACCENT_GREEN)
        pair3 = MathTex(r"a_{23} = a_{32} = 2 \quad \checkmark", font_size=26, color=ACCENT_GREEN)
        pairs_group = VGroup(pair1, pair2, pair3).arrange(DOWN, buff=0.25)

        # Status badge Syarat 1 lolos (Bebas dari unicode Tofu!)
        badge1_box = RoundedRectangle(
            corner_radius=0.15, width=6.6, height=0.75,
            fill_color="#064E3B", fill_opacity=0.9, stroke_color=ACCENT_GREEN, stroke_width=2.0
        )
        badge1_txt = MathTex(r"\mathbf{LOLOS:\ A = A^T\ (Matriks\ Simetris\ Sempurna!)}", font_size=23, color=ACCENT_GREEN)
        badge1 = VGroup(badge1_box, badge1_txt)

        req1_content = VGroup(req1_title, req1_sub1, req1_sub2, pairs_group, badge1).arrange(DOWN, buff=0.28)
        req1_content.move_to(req1_box.get_center())

        self.play(FadeIn(req1_box), FadeIn(req1_content), FadeIn(hl_group), run_time=1.6)
        self.wait(4.5)
        self.play(FadeOut(req1_content), FadeOut(req1_box), FadeOut(hl_group), run_time=1.2)

        # Card Syarat 2: Definit Positif (Kriteria Sylvester)
        req2_box = RoundedRectangle(
            corner_radius=0.25, width=card_w, height=card_h,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=ACCENT_GREEN, stroke_width=2.5
        ).move_to(card_center)

        req2_title = Text("Syarat 2: Matriks Definit Positif", font_size=28, color=ACCENT_WARN, weight=BOLD)
        req2_sub1 = Text("Kriteria Sylvester: Semua Determinan Minor Utama", font_size=21, color=TEXT_MUTED)
        req2_sub2 = Text("Wajib Bernilai Positif Murni (> 0)", font_size=22, color=ACCENT_CYAN, weight=BOLD)

        m1_calc = MathTex(r"\det(M_1) = \det([4]) = \mathbf{4 > 0} \quad \checkmark", font_size=28, color=WHITE)
        m2_calc = MathTex(r"\det(M_2) = (4)(10) - (2)(2) = \mathbf{36 > 0} \quad \checkmark", font_size=28, color=WHITE)
        m3_calc = MathTex(r"\det(M_3) = \det(A) = \mathbf{144 > 0} \quad \checkmark", font_size=28, color=WHITE)
        sylv_group = VGroup(m1_calc, m2_calc, m3_calc).arrange(DOWN, buff=0.25)

        badge2_box = RoundedRectangle(
            corner_radius=0.15, width=6.8, height=0.75,
            fill_color="#064E3B", fill_opacity=0.9, stroke_color=ACCENT_GREEN, stroke_width=2.0
        )
        badge2_txt = Text("LOLOS: 100% Bebas Akar Negatif!", font_size=22, color=ACCENT_GREEN, weight=BOLD)
        badge2 = VGroup(badge2_box, badge2_txt)

        req2_content = VGroup(req2_title, req2_sub1, req2_sub2, sylv_group, badge2).arrange(DOWN, buff=0.26)
        req2_content.move_to(req2_box.get_center())

        self.play(FadeIn(req2_box), FadeIn(req2_content), run_time=1.6)
        self.wait(4.5)
        self.play(FadeOut(req2_content), FadeOut(req2_box), FadeOut(a_lbl), FadeOut(a_mat), run_time=1.2)

        # =================================================================
        # BAGIAN 2: PROSES FAKTORISASI A = L * L^T (KOLOM DEMI KOLOM)
        # =================================================================
        # Matriks L simbolik di sebelah kiri
        l_sym_title = MathTex(r"\mathbf{\text{Faktorisasi: } A = L \cdot L^T}", font_size=30, color=ACCENT_CYAN).move_to(LEFT * 4.0 + UP * 1.6)
        l_sym_mat = Matrix(
            [[r"l_{11}", 0, 0],
             [r"l_{21}", r"l_{22}", 0],
             [r"l_{31}", r"l_{32}", r"l_{33}"]],
            v_buff=0.8, h_buff=0.9
        ).scale(0.95).move_to(LEFT * 4.0 + DOWN * 0.3)
        l_sym_mat.get_brackets().set_color(BORDER_COLOR)

        self.play(FadeIn(l_sym_title), FadeIn(l_sym_mat), run_time=1.2)
        self.wait(1.5)

        # --- KOLOM 1 ---
        col1_box = RoundedRectangle(
            corner_radius=0.25, width=card_w, height=card_h,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).move_to(card_center)

        col1_title = Text("Langkah 1: Kolom 1 Matriks L", font_size=28, color=ACCENT_WARN, weight=BOLD)
        col1_c1 = MathTex(r"l_{11} = \sqrt{a_{11}} = \sqrt{4} = \mathbf{2}", font_size=30, color=WHITE)
        col1_c2 = MathTex(r"l_{21} = \frac{a_{21}}{l_{11}} = \frac{2}{2} = \mathbf{1}", font_size=30, color=WHITE)
        col1_c3 = MathTex(r"l_{31} = \frac{a_{31}}{l_{11}} = \frac{-2}{2} = \mathbf{-1}", font_size=30, color=WHITE)
        col1_calc = VGroup(col1_c1, col1_c2, col1_c3).arrange(DOWN, buff=0.35)

        col1_badge_box = RoundedRectangle(
            corner_radius=0.15, width=6.6, height=0.75,
            fill_color="#1E293B", fill_opacity=0.9, stroke_color=BORDER_COLOR, stroke_width=2.0
        )
        col1_badge_txt = MathTex(r"\mathbf{\text{Kolom 1 Selesai: } [2 \quad 1 \quad -1]^T}", font_size=28, color=WHITE)
        col1_badge = VGroup(col1_badge_box, col1_badge_txt)

        col1_content = VGroup(col1_title, col1_calc, col1_badge).arrange(DOWN, buff=0.38)
        col1_content.move_to(col1_box.get_center())

        self.play(FadeIn(col1_box), FadeIn(col1_content), run_time=1.6)
        self.wait(4.5)

        # Update elemen matriks simbolik Kolom 1
        new_c1_1 = MathTex("2", font_size=30, color=ACCENT_GREEN).move_to(l_sym_mat.get_entries()[0].get_center())
        new_c1_2 = MathTex("1", font_size=30, color=ACCENT_GREEN).move_to(l_sym_mat.get_entries()[3].get_center())
        new_c1_3 = MathTex("-1", font_size=30, color=ACCENT_GREEN).move_to(l_sym_mat.get_entries()[6].get_center())

        self.play(
            Transform(l_sym_mat.get_entries()[0], new_c1_1),
            Transform(l_sym_mat.get_entries()[3], new_c1_2),
            Transform(l_sym_mat.get_entries()[6], new_c1_3),
            run_time=1.2
        )
        self.wait(1.5)
        self.play(FadeOut(col1_content), FadeOut(col1_box), run_time=1.0)

        # --- KOLOM 2 ---
        col2_box = RoundedRectangle(
            corner_radius=0.25, width=card_w, height=card_h,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).move_to(card_center)

        col2_title = Text("Langkah 2: Kolom 2 Matriks L", font_size=28, color=ACCENT_WARN, weight=BOLD)
        col2_c1 = MathTex(r"l_{22} = \sqrt{a_{22} - l_{21}^2} = \sqrt{10 - 1^2} = \sqrt{9} = \mathbf{3}", font_size=28, color=WHITE)
        col2_c2 = MathTex(r"l_{32} = \frac{a_{32} - l_{31} l_{21}}{l_{22}} = \frac{2 - (-1)(1)}{3} = \frac{3}{3} = \mathbf{1}", font_size=28, color=WHITE)
        col2_calc = VGroup(col2_c1, col2_c2).arrange(DOWN, buff=0.45)

        col2_badge_box = RoundedRectangle(
            corner_radius=0.15, width=6.6, height=0.75,
            fill_color="#1E293B", fill_opacity=0.9, stroke_color=BORDER_COLOR, stroke_width=2.0
        )
        col2_badge_txt = MathTex(r"\mathbf{\text{Kolom 2 Selesai: } [0 \quad 3 \quad 1]^T}", font_size=28, color=WHITE)
        col2_badge = VGroup(col2_badge_box, col2_badge_txt)

        col2_content = VGroup(col2_title, col2_calc, col2_badge).arrange(DOWN, buff=0.45)
        col2_content.move_to(col2_box.get_center())

        self.play(FadeIn(col2_box), FadeIn(col2_content), run_time=1.6)
        self.wait(4.5)

        # Update elemen matriks simbolik Kolom 2
        new_c2_1 = MathTex("3", font_size=30, color=ACCENT_GREEN).move_to(l_sym_mat.get_entries()[4].get_center())
        new_c2_2 = MathTex("1", font_size=30, color=ACCENT_GREEN).move_to(l_sym_mat.get_entries()[7].get_center())

        self.play(
            Transform(l_sym_mat.get_entries()[4], new_c2_1),
            Transform(l_sym_mat.get_entries()[7], new_c2_2),
            run_time=1.2
        )
        self.wait(1.5)
        self.play(FadeOut(col2_content), FadeOut(col2_box), run_time=1.0)

        # --- KOLOM 3 ---
        col3_box = RoundedRectangle(
            corner_radius=0.25, width=card_w, height=card_h,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).move_to(card_center)

        col3_title = Text("Langkah 3: Kolom 3 Matriks L", font_size=28, color=ACCENT_WARN, weight=BOLD)
        col3_c1 = MathTex(
            r"l_{33} = \sqrt{a_{33} - (l_{31}^2 + l_{32}^2)}"
            r"= \sqrt{6 - ((-1)^2 + 1^2)} = \sqrt{4} = \mathbf{2}",
            font_size=28,
            color=WHITE
        )
        col3_note = Text("Nilai di dalam akar (4 > 0) terbukti selalu real positif!", font_size=23, color=ACCENT_GREEN, weight=BOLD)
        col3_calc = VGroup(col3_c1, col3_note).arrange(DOWN, buff=0.4)

        col3_badge_box = RoundedRectangle(
            corner_radius=0.15, width=6.6, height=0.75,
            fill_color="#1E293B", fill_opacity=0.9, stroke_color=BORDER_COLOR, stroke_width=2.0
        )
        col3_badge_txt = MathTex(r"\mathbf{\text{Kolom 3 Selesai: } [0 \quad 0 \quad 2]^T}", font_size=28, color=WHITE)
        col3_badge = VGroup(col3_badge_box, col3_badge_txt)

        col3_content = VGroup(col3_title, col3_calc, col3_badge).arrange(DOWN, buff=0.45)
        col3_content.move_to(col3_box.get_center())

        self.play(FadeIn(col3_box), FadeIn(col3_content), run_time=1.6)
        self.wait(4.5)

        # Update elemen matriks simbolik Kolom 3
        new_c3_1 = MathTex("2", font_size=30, color=ACCENT_GREEN).move_to(l_sym_mat.get_entries()[8].get_center())
        self.play(Transform(l_sym_mat.get_entries()[8], new_c3_1), run_time=1.2)
        self.wait(1.5)
        self.play(FadeOut(col3_content), FadeOut(col3_box), FadeOut(l_sym_title), FadeOut(l_sym_mat), run_time=1.0)

        # Tampilkan Hasil Lengkap Matriks L dan L^T Berdampingan
        pair_box = RoundedRectangle(
            corner_radius=0.25, width=11.6, height=4.2,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).shift(DOWN * 0.2)

        pair_title = Text("Hasil Sempurna: Pasangan Cermin Matriks L dan L^T", font_size=30, color=ACCENT_WARN, weight=BOLD)
        l_res_mat = MathTex(
            r"L = \begin{bmatrix} 2 & 0 & 0 \\ 1 & 3 & 0 \\ -1 & 1 & 2 \end{bmatrix}"
            r"\quad \longleftrightarrow \quad "
            r"L^T = \begin{bmatrix} 2 & 1 & -1 \\ 0 & 3 & 1 \\ 0 & 0 & 2 \end{bmatrix}",
            font_size=32,
            color=WHITE
        )
        pair_sub = Text("L^T langsung didapat dari transpos L tanpa satu pun perhitungan tambahan!", font_size=23, color=ACCENT_CYAN, weight=BOLD)

        pair_content = VGroup(pair_title, l_res_mat, pair_sub).arrange(DOWN, buff=0.35)
        pair_content.move_to(pair_box.get_center())

        self.play(FadeIn(pair_box), FadeIn(pair_content), run_time=1.6)
        self.wait(5.0)
        self.play(FadeOut(pair_content), FadeOut(pair_box), run_time=1.2)

        # =================================================================
        # BAGIAN 3: PENYELESAIAN SPL 2-TAHAP (SUBSTITUSI MAJU & MUNDUR)
        # =================================================================
        # --- TAHAP 1: SUBSTITUSI MAJU L * y = b ---
        fwd_box = RoundedRectangle(
            corner_radius=0.25, width=12.0, height=5.6,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).shift(DOWN * 0.15)

        fwd_title = Text("Tahap 1 SPL: Substitusi Maju (L · y = b)", font_size=30, color=ACCENT_WARN, weight=BOLD)
        fwd_title.move_to(fwd_box.get_top() + DOWN * 0.5)

        fwd_sys = MathTex(
            r"\begin{bmatrix} 2 & 0 & 0 \\ 1 & 3 & 0 \\ -1 & 1 & 2 \end{bmatrix}"
            r"\begin{bmatrix} y_1 \\ y_2 \\ y_3 \end{bmatrix} = "
            r"\begin{bmatrix} 2 \\ 22 \\ 4 \end{bmatrix}",
            font_size=32,
            color=WHITE
        ).move_to(fwd_box.get_center() + LEFT * 3.0)

        fwd_calc = MathTex(
            r"\begin{aligned}"
            r"2y_1 &= 2 \implies \mathbf{y_1 = 1} \\[10pt]"
            r"1(1) + 3y_2 &= 22 \implies 3y_2 = 21 \implies \mathbf{y_2 = 7} \\[10pt]"
            r"-1 + 7 + 2y_3 &= 4 \implies 2y_3 = -2 \implies \mathbf{y_3 = -1}"
            r"\end{aligned}",
            font_size=31,
            color=WHITE
        ).move_to(fwd_box.get_center() + RIGHT * 2.7)

        fwd_badge_box = RoundedRectangle(
            corner_radius=0.15, width=9.8, height=0.75,
            fill_color="#064E3B", fill_opacity=0.9, stroke_color=ACCENT_GREEN, stroke_width=2.0
        )
        fwd_badge_txt = MathTex(r"\mathbf{\text{Vektor Antara Ditemukan: } y = [1 \quad 7 \quad -1]^T}", font_size=28, color=WHITE)
        fwd_badge = VGroup(fwd_badge_box, fwd_badge_txt).move_to(fwd_box.get_bottom() + UP * 0.6)

        self.play(FadeIn(fwd_box), FadeIn(fwd_title), FadeIn(fwd_sys), run_time=1.5)
        self.wait(1.5)
        self.play(Write(fwd_calc), run_time=2.2)
        self.play(FadeIn(fwd_badge), run_time=1.2)
        self.wait(5.5)
        self.play(FadeOut(fwd_title), FadeOut(fwd_sys), FadeOut(fwd_calc), FadeOut(fwd_badge), FadeOut(fwd_box), run_time=1.2)

        # --- TAHAP 2: SUBSTITUSI MUNDUR L^T * x = y ---
        bwd_box = RoundedRectangle(
            corner_radius=0.25, width=12.0, height=5.6,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=BORDER_COLOR, stroke_width=2.5
        ).shift(DOWN * 0.15)

        bwd_title = Text("Tahap 2 SPL: Substitusi Mundur (L^T · x = y)", font_size=30, color=ACCENT_WARN, weight=BOLD)
        bwd_title.move_to(bwd_box.get_top() + DOWN * 0.5)

        bwd_sys = MathTex(
            r"\begin{bmatrix} 2 & 1 & -1 \\ 0 & 3 & 1 \\ 0 & 0 & 2 \end{bmatrix}"
            r"\begin{bmatrix} x_1 \\ x_2 \\ x_3 \end{bmatrix} = "
            r"\begin{bmatrix} 1 \\ 7 \\ -1 \end{bmatrix}",
            font_size=32,
            color=WHITE
        ).move_to(bwd_box.get_center() + LEFT * 3.0)

        bwd_calc = MathTex(
            r"\begin{aligned}"
            r"2x_3 &= -1 \implies \mathbf{x_3 = -0.5} \\[10pt]"
            r"3x_2 - 0.5 &= 7 \implies 3x_2 = 7.5 \implies \mathbf{x_2 = 2.5} \\[10pt]"
            r"2x_1 + 3 &= 1 \implies 2x_1 = -2 \implies \mathbf{x_1 = -1}"
            r"\end{aligned}",
            font_size=31,
            color=WHITE
        ).move_to(bwd_box.get_center() + RIGHT * 2.7)

        bwd_badge_box = RoundedRectangle(
            corner_radius=0.15, width=9.8, height=0.75,
            fill_color="#064E3B", fill_opacity=0.9, stroke_color=ACCENT_GREEN, stroke_width=2.0
        )
        bwd_badge_txt = MathTex(r"\mathbf{\text{Solusi Akhir SPL: } x = [-1 \quad 2.5 \quad -0.5]^T}", font_size=28, color=WHITE)
        bwd_badge = VGroup(bwd_badge_box, bwd_badge_txt).move_to(bwd_box.get_bottom() + UP * 0.6)

        self.play(FadeIn(bwd_box), FadeIn(bwd_title), FadeIn(bwd_sys), run_time=1.5)
        self.wait(1.5)
        self.play(Write(bwd_calc), run_time=2.2)
        self.play(FadeIn(bwd_badge), run_time=1.2)
        self.wait(5.5)
        self.play(FadeOut(bwd_title), FadeOut(bwd_sys), FadeOut(bwd_calc), FadeOut(bwd_badge), FadeOut(bwd_box), run_time=1.2)

        # =================================================================
        # FINALE: KESIMPULAN SOLUSI & VERIFIKASI RESIDU PRESISI
        # =================================================================
        fin_box = RoundedRectangle(
            corner_radius=0.25, width=11.8, height=5.5,
            fill_color=CARD_BG, fill_opacity=0.96, stroke_color=ACCENT_GREEN, stroke_width=3.0
        ).shift(DOWN * 0.15)

        fin_title = Text("Solusi Akhir Sistem Persamaan Linear", font_size=32, color=ACCENT_WARN, weight=BOLD)
        fin_sol = MathTex(
            r"\mathbf{x} = \begin{bmatrix} x_1 \\ x_2 \\ x_3 \end{bmatrix} = "
            r"\begin{bmatrix} \mathbf{-1} \\ \mathbf{2.5} \\ \mathbf{-0.5} \end{bmatrix}",
            font_size=38,
            color=WHITE
        )
        fin_check = MathTex(
            r"\mathbf{\text{Pemeriksaan Residu: } A \cdot x = \begin{bmatrix} 2 \\ 22 \\ 4 \end{bmatrix} = b \quad (\text{Galat} = 0)}",
            font_size=33,
            color=WHITE
        )
        fin_badge = Text("Verifikasi: Solusi Eksak & Presisi Sempurna", font_size=25, color=ACCENT_WARN, weight=BOLD)

        fin_content = VGroup(fin_title, fin_sol, fin_check, fin_badge).arrange(DOWN, buff=0.35)
        fin_content.move_to(fin_box.get_center())

        self.play(FadeIn(fin_box), FadeIn(fin_content), run_time=1.8)
        self.wait(6.5)
        self.play(FadeOut(fin_content), FadeOut(fin_box), FadeOut(header_group), FadeOut(watermark), run_time=1.5)
        self.wait(1.5)
