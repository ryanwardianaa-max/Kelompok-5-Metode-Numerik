import math
from manim import *

# Konfigurasi Dasar & Palet Warna Sesuai Standar Ryan (@librayn)
BG_COLOR = "#0f172a"        # Slate 900
TEXT_MAIN = "#f8fafc"       # Slate 50
TEXT_MUTED = "#94a3b8"      # Slate 400
ACCENT_BLUE = "#38bdf8"     # Sky 400
ACCENT_GREEN = "#4ade80"    # Emerald 400
ACCENT_RED = "#f87171"      # Rose 400
ACCENT_GOLD = "#fbbf24"     # Amber 400
PANEL_BG = "#1e293b"        # Slate 800

class HookCholeskyJembatan(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR

        # 1. Watermark Wajib Sesuai Aturan Desain Ryan
        watermark = Text("@librayn", font_size=20, color=TEXT_MUTED).to_corner(UR, buff=0.35)
        self.add(watermark)

        # 2. Judul Hook Utama
        title = Text("MENGAPA DEKOMPOSISI MATRIKS DIBUTUHKAN?", font_size=28, color=ACCENT_GOLD, weight=BOLD)
        title.to_edge(UP, buff=0.4)
        subtitle = Text("Studi Kasus: Simulasi Beban Getaran Jembatan & Bangunan Gempa", font_size=18, color=TEXT_MUTED)
        subtitle.next_to(title, DOWN, buff=0.15)
        
        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)
        self.wait(1.0)

        # 3. Tata Letak Split-Screen (Aturan Baku Ryan)
        # Panel Kiri (LEFT * 3.3): Visual Geometri Jembatan Rangka
        left_center = LEFT * 3.5 + DOWN * 0.4
        
        # Bangun Model Jembatan Rangka Baja (Warren Truss)
        nodes_pos = [
            left_center + LEFT * 2.5 + DOWN * 1.0,  # 0: Tumpuan kiri
            left_center + LEFT * 1.25 + DOWN * 1.0, # 1: Bawah 1
            left_center + ORIGIN + DOWN * 1.0,      # 2: Bawah 2 (Tengah)
            left_center + RIGHT * 1.25 + DOWN * 1.0,# 3: Bawah 3
            left_center + RIGHT * 2.5 + DOWN * 1.0, # 4: Tumpuan kanan
            left_center + LEFT * 1.875 + UP * 0.5,  # 5: Atas 1
            left_center + LEFT * 0.625 + UP * 0.5,  # 6: Atas 2
            left_center + RIGHT * 0.625 + UP * 0.5, # 7: Atas 3
            left_center + RIGHT * 1.875 + UP * 0.5  # 8: Atas 4
        ]
        
        beams_idx = [
            (0,1), (1,2), (2,3), (3,4),             # Gelagar Bawah
            (5,6), (6,7), (7,8),                    # Gelagar Atas
            (0,5), (5,1), (1,6), (6,2),             # Batang Diagonal
            (2,7), (7,3), (3,8), (8,4)
        ]
        
        bridge_beams = VGroup(*[
            Line(nodes_pos[u], nodes_pos[v], color=ACCENT_BLUE, stroke_width=3.5)
            for u, v in beams_idx
        ])
        bridge_nodes = VGroup(*[
            Dot(pos, radius=0.07, color=TEXT_MAIN)
            for pos in nodes_pos
        ])
        bridge_label = Text("Model Rangka Jembatan (Matriks K Kekakuan)", font_size=16, color=TEXT_MUTED)
        bridge_label.next_to(bridge_beams, DOWN, buff=0.35)

        bridge_group = VGroup(bridge_beams, bridge_nodes, bridge_label)

        # Panel Kanan (RIGHT * 3.3): Panel Hitungan Aljabar & Perbandingan
        right_center = RIGHT * 3.4 + DOWN * 0.4
        panel_card = RoundedRectangle(
            corner_radius=0.2, width=6.2, height=4.8,
            color=ACCENT_BLUE, fill_color=PANEL_BG, fill_opacity=0.8, stroke_width=1.5
        ).move_to(right_center)
        
        panel_title = Text("SISTEM PERSAMAAN LINIER", font_size=18, color=ACCENT_BLUE, weight=BOLD)
        panel_title.next_to(panel_card.get_top(), DOWN, buff=0.25)
        
        eq_spl = MathTex(r"K \cdot \mathbf{x} = \mathbf{b}", font_size=32, color=TEXT_MAIN)
        eq_spl.next_to(panel_title, DOWN, buff=0.25)

        self.play(
            Create(bridge_beams),
            Create(bridge_nodes),
            FadeIn(bridge_label),
            FadeIn(panel_card),
            FadeIn(panel_title),
            Write(eq_spl),
            run_time=1.5
        )
        self.wait(1.0)

        # 4. Skenario Beban Gempa / Angin Dinamis Masuk
        force_arrow1 = Arrow(nodes_pos[2] + UP * 1.5, nodes_pos[2], color=ACCENT_RED, buff=0.05, stroke_width=5)
        force_lbl1 = Text("Beban Truk / Gempa b₁", font_size=14, color=ACCENT_RED).next_to(force_arrow1, UP, buff=0.1)

        expl1 = Text("Beban b berubah tiap detik!", font_size=15, color=ACCENT_RED)
        expl1.next_to(eq_spl, DOWN, buff=0.25)

        gauss_box = RoundedRectangle(corner_radius=0.15, width=5.6, height=1.1, color=ACCENT_RED, fill_color=BG_COLOR, fill_opacity=0.9)
        gauss_box.next_to(expl1, DOWN, buff=0.2)
        gauss_text1 = Text("Metode Gauss Biasa:", font_size=14, color=ACCENT_RED, weight=BOLD)
        gauss_text2 = Text("Hitung ulang dari awal O(n³)\n~667 Juta Operasi! Terlalu Lambat!", font_size=13, color=TEXT_MAIN)
        VGroup(gauss_text1, gauss_text2).arrange(DOWN, aligned_edge=LEFT, buff=0.1).move_to(gauss_box)

        self.play(
            GrowArrow(force_arrow1),
            FadeIn(force_lbl1),
            FadeIn(expl1),
            FadeIn(gauss_box),
            FadeIn(gauss_text1),
            FadeIn(gauss_text2),
            bridge_nodes[2].animate.set_color(ACCENT_RED),
            run_time=1.5
        )
        self.wait(1.5)

        # 5. Transformasi Solusi: Dekomposisi Cholesky / Crout
        sol_box = RoundedRectangle(corner_radius=0.15, width=5.6, height=1.3, color=ACCENT_GREEN, fill_color=BG_COLOR, fill_opacity=0.9)
        sol_box.next_to(gauss_box, DOWN, buff=0.2)
        sol_text1 = Text("Solusi Cholesky (A = L·Lᵀ):", font_size=14, color=ACCENT_GREEN, weight=BOLD)
        sol_text2 = Text("Faktorkan K cukup 1 KALI!\nTiap beban b datang: Substitusi O(n²)\n667x Lebih Cepat & Hemat Memori 50%", font_size=13, color=TEXT_MAIN)
        VGroup(sol_text1, sol_text2).arrange(DOWN, aligned_edge=LEFT, buff=0.08).move_to(sol_box)

        eq_cholesky = MathTex(r"K = L \cdot L^T \quad \rightarrow \quad L \mathbf{y} = \mathbf{b}, \; L^T \mathbf{x} = \mathbf{y}", font_size=22, color=ACCENT_GOLD)
        eq_cholesky.move_to(eq_spl)

        self.play(
            Transform(eq_spl, eq_cholesky),
            FadeIn(sol_box),
            FadeIn(sol_text1),
            FadeIn(sol_text2),
            bridge_beams.animate.set_color(ACCENT_GREEN),
            run_time=1.5
        )
        self.wait(2.0)

        # 6. Kesimpulan Hook Akhir
        self.play(
            FadeOut(expl1),
            FadeOut(gauss_box),
            FadeOut(gauss_text1),
            FadeOut(gauss_text2),
            sol_box.animate.shift(UP * 0.8),
            sol_text1.animate.shift(UP * 0.8),
            sol_text2.animate.shift(UP * 0.8),
            run_time=1.0
        )
        
        punchline = Text("Dekomposisi LU memisahkan matriks struktur\ndari beban dinamis dunia nyata.", font_size=16, color=ACCENT_GOLD, weight=BOLD)
        punchline.next_to(sol_box, DOWN, buff=0.4)
        self.play(FadeIn(punchline), run_time=1.0)
        self.wait(2.5)
