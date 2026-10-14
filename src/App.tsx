import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react'
import {BlockMath,InlineMath} from 'react-katex'
import {BookOpen,CheckCircle2,AlertCircle,ChevronLeft,ChevronRight,FastForward,FlaskConical,Maximize,Minimize,Pause,Play,Presentation,Rewind,RotateCcw,User,Users,ZoomIn,ZoomOut} from 'lucide-react'
import {
  solveCrout,
  solveCholesky,
  checkPositiveDefinite,
  fmtFrac,
  fmtLatex,
  type LUResult,
  type CholeskyResult,
  type PositiveDefiniteResult
} from './engine'
import 'katex/dist/katex.min.css'
import './App.css'

const identity={
 course:'Metode Numerik (Kelas C)',
 code:'KP21517001',
 program:'Pendidikan Matematika',
 faculty:'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)',
 group:'Kelompok 4',
 meeting:'Pertemuan 08',
 topic:'Dekomposisi LU: Metode Reduksi Crout & Metode Dekomposisi Cholesky'
} as const

const members=[
 ['Ryan Wardiana','232151098'],
 ['Najla Aisyah','232151087'],
 ['Nabila Fitria Nuroktavianty Rosadi','232151088']
] as const

const slides=[
 ['Dekomposisi LU: Crout & Cholesky','A = L \\cdot U \\quad \\& \\quad A = L \\cdot L^T',[
  'Kelompok 4 · Presentasi Pertemuan 08 Metode Numerik (Kelas C).',
  'Membahas tuntas Dekomposisi LU Metode Reduksi Crout dan Metode Dekomposisi Cholesky.'
 ]],
 ['Mengapa Dekomposisi Matriks?','\\mathcal{O}(n^3) \\to \\mathcal{O}(n^2)',[
  'Pada persoalan rekayasa, matriks koefisien A tetap konstan, tetapi vektor beban b berganti berulang kali.',
  'Dekomposisi memfaktorkan A cukup SEKALI (O(n³)), lalu tiap vektor b diselesaikan via substitusi kilat O(n²).'
 ]],
 ['Tiga Varian Dekomposisi LU','\\text{Doolittle} \\quad | \\quad \\text{Crout} \\quad | \\quad \\text{Cholesky}',[
  'Doolittle: Diagonal L = 1 (lᵢᵢ = 1), diagonal U bebas (standar LU Gauss).',
  'Crout: Diagonal U = 1 (uᵢᵢ = 1), diagonal L bebas. Cholesky: Khusus simetris definit positif, A = L · Lᵀ.'
 ]],
 ['Metode Reduksi Crout','A = L \\cdot U,\\quad u_{ii} = 1',[
  'Metode Crout mengunci semua elemen diagonal utama matriks segitiga atas U bernilai tepat 1 (uᵢᵢ = 1).',
  'Matriks segitiga bawah L memuat elemen diagonal bebas yang menanggung bobot pembagian numerik.'
 ]],
 ['Algoritma Rekursif Crout','l_{ik} = a_{ik} - \\sum_{m=1}^{k-1} l_{im}u_{mk},\\quad u_{kj} = \\frac{a_{kj} - \\sum_{m=1}^{k-1} l_{km}u_{mj}}{l_{kk}}',[
  'Pola pengerjaan teratur: Tentukan kolom ke-k matriks L, lalu tentukan baris ke-k matriks U.',
  'Langkah bergantian kolom-baris ini berlanjut dari k = 1 hingga k = n tanpa perlu eliminasi baris manual.'
 ]],
 ['Tahap 1: Substitusi Maju Crout','L\\mathbf{y} = \\mathbf{b}',[
  'Menyelesaikan sistem segitiga bawah L · y = b dari baris teratas (i = 1) ke baris terbawah (i = n).',
  'Karena lᵢᵢ ≠ 1 pada Crout, setiap elemen yᵢ dihitung dengan pembagian bertingkat: yᵢ = (bᵢ - ∑ lᵢⱼ yⱼ) / lᵢᵢ.',
  'Karakteristik: Butuh pembagian karena lᵢᵢ ≠ 1 pada dekomposisi Crout.'
 ]],
 ['Tahap 2: Substitusi Mundur Crout','U\\mathbf{x} = \\mathbf{y},\\quad u_{ii} = 1',[
  'Menyelesaikan sistem segitiga atas U · x = y dari baris terbawah (i = n) ke baris teratas (i = 1).',
  'Karena diagonal U tepat 1 (uᵢᵢ = 1), tidak ada pembagian pada tahap ini: xᵢ = yᵢ - ∑ uᵢⱼ xⱼ (BEBAS BAGI!).'
 ]],
 ['Contoh Numerik Crout 3×3','A\\mathbf{x} = \\mathbf{b} \\implies \\mathbf{x} = [-1, 2.5, -0.5]^T',[
  'Simulasi lengkap pemfaktoran Crout 3×3 bersesuaian dengan naskah video animasi Manim.',
  'Mencakup faktorisasi A = L · U, substitusi maju L · y = b, dan substitusi mundur U · x = y.'
 ]],
 ['Jebakan Poros Nol pada Crout','l_{kk} = 0 \\implies \\text{Pembagian Nol}',[
  'Jika elemen diagonal L bernilai nol (lₖₖ = 0), rumus baris U akan mengalami pembagian dengan nol.',
  'Pencegahan: Lakukan pertukaran baris (pivoting) pada matriks awal A sebelum menerapkan algoritma Crout.'
 ]],
 ['Metode Dekomposisi Cholesky','A = L \\cdot L^T',[
  'Analogi Cermin Ajaib: Membagi matriks tepat di depan cermin! Matriks atas U tidak perlu dihitung karena otomatis adalah bayangan transpos L (U = Lᵀ).',
  'Faktorisasi khusus paling efisien di dunia untuk matriks bujursangkar simetris dan definit positif.',
  'Hanya menghitung satu matriks segitiga bawah L; kerja komputasi dan memori terpangkas 50% dibanding metode LU biasa.'
 ]],
 ['Syarat Mutlak Metode Cholesky','A = A^T \\quad \\& \\quad \\mathbf{x}^T A \\mathbf{x} > 0',[
  'Syarat 1 (Simetris A = Aᵀ): Cermin tidak pernah bohong. Karena (L · Lᵀ)ᵀ = L · Lᵀ = A, matriks A wajib simetris sempurna (aᵢⱼ = aⱼᵢ). Beda satu angka saja, Cholesky gugur!',
  'Syarat 2 (Definit Positif xᵀAx > 0): Rumus diagonal memakai akar kuadrat lⱼⱼ = √(aⱼⱼ - ∑ lⱼₖ²). Angka di dalam akar HARUS positif murni agar tidak muncul bilangan imajiner!',
  'Uji Kriteria Sylvester: Potong submatriks utama dari pojok kiri atas bertahap; semua determinan minor M₁, M₂, ..., Mₙ wajib > 0.'
 ]],
 ['Algoritma Faktorisasi Cholesky','l_{jj} = \\sqrt{a_{jj} - \\sum_{k=1}^{j-1} l_{jk}^2}',[
  'Elemen Diagonal (lⱼⱼ): Ditarik akar kuadrat dari elemen asal dikurangi jumlah kuadrat elemen sebelumnya pada baris yang sama: lⱼⱼ = √(aⱼⱼ - ∑ lⱼₖ²).',
  'Elemen Bawah Diagonal (lᵢⱼ): Elemen asal dikurangi produk silang elemen sebelumnya, lalu dibagi poros diagonal lⱼⱼ: lᵢⱼ = (aᵢⱼ - ∑ lᵢₖ lⱼₖ) / lⱼⱼ.',
  'Efek Kembar: Begitu matriks segitiga bawah L selesai dihitung, matriks segitiga atas langsung diperoleh gratis via transpos (U = Lᵀ).'
 ]],
 ['Efisiensi Komputasi Cholesky','\\sim \\frac{1}{6}n^3 \\text{ Operasi} \\quad (\\text{Hemat 50\\% Memori dan Waktu})',[
  'Hemat Memori 50%: Komputer hanya perlu menyimpan satu matriks segitiga L; matriks U tidak memerlukan alokasi memori tambahan.',
  'Kecepatan 2× Lipat: Beban operasi hanya ~ ⅙ n³ operasi, memangkas separuh beban Eliminasi Gauss dan Crout/Doolittle (~ ⅓ n³ operasi).',
  'Stabilitas Numerik Alami: Khusus matriks definit positif, Cholesky dijamin stabil tanpa memerlukan pertukaran baris (tanpa pivoting).'
 ]],
 ['Contoh Numerik Cholesky 3×3','A = L \\cdot L^T \\implies \\mathbf{x} = [-1, 2.5, -0.5]^T',[
  'Simulasi pemfaktoran sistem simetris definit positif 3×3 dengan video animasi Manim interaktif khusus Smart TV.',
  'Langkah lengkap: verifikasi syarat simetris & Sylvester, faktorisasi L, cermin Lᵀ, hingga substitusi maju-mundur.'
 ]],
 ['Jebakan Fatal: Bilangan Non-Positif dalam Akar','a_{jj} - \\sum_{k=1}^{j-1} l_{jk}^2 \\le 0 \\implies \\text{Gagal Cholesky}',[
  'Bahaya Akar Imajiner: Jika matriks tidak definit positif, nilai di dalam akar menjadi non-positif sehingga muncul bilangan imajiner (i = √(-1)).',
  'Respon Komputer: Program Python (scipy/numpy) atau MATLAB langsung melempar galat LinAlgError: Matrix is not positive definite.',
  'Solusi Alternatif: Jika matriks simetris tak-definit positif, gunakan faktorisasi LDLᵀ (tanpa penarikan akar) atau metode Crout dengan partial pivoting.'
 ]],
 ['Perbandingan Komparatif Tiga Metode','\\text{Doolittle vs Crout vs Cholesky}',[
  'Doolittle: Umum, lᵢᵢ = 1. Crout: Umum, uᵢᵢ = 1 (cocok bila substitusi balik dioptimalkan).',
  'Cholesky: Spesifik simetris definit positif, paling cepat dan paling stabil secara numerik.'
 ]],
 ['Latihan & Kuis Interaktif','\\text{Tantangan Analitis: } 3\\text{ Soal Esai HOTS}',[
  'Studi Kasus HOTS C6: Jembatan Rahasia Dekomposisi Crout & Cholesky (Soal 1 & 2 dari Naskah PDF).',
  'Eksplorasi SPL Simetris Definit Positif & Uji Komputasi Mandiri via Numerical Lab (Soal 3).'
 ]],
 ['Kesimpulan & Pembagian Peran Kelompok 4','A = L \\cdot U \\quad \\longleftrightarrow \\quad A = L \\cdot L^T',[
  'Kelompok 4 siap mempresentasikan Dekomposisi Crout & Cholesky secara interaktif.',
  'Ryan: Konsep Teori & Demo Lab, Najla: Metode Crout, Nabila: Metode Cholesky & Tanya Jawab.'
 ]]
] as const

const examples={
 'Contoh Numerik Crout 3×3':{
  videoUrl:'/videos/contoh_soal_metode_crout.mp4',
  prompt:[
   '\\begin{bmatrix} 4 & 2 & -2 \\\\ 2 & 10 & 2 \\\\ -2 & 2 & 6 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 22 \\\\ 4 \\end{bmatrix}',
   '\\text{Faktorkan } A = L \\cdot U \\text{ dengan } u_{ii} = 1 \\text{ (Metode Crout), lalu selesaikan } L\\mathbf{y} = \\mathbf{b} \\text{ dan } U\\mathbf{x} = \\mathbf{y}'
  ],
  steps:[
   [
    '\\text{Langkah 1: Kolom 1 matriks } L \\text{ sama persis dengan kolom 1 matriks } A:',
    'l_{11} = a_{11} = 4, \\quad l_{21} = a_{21} = 2, \\quad l_{31} = a_{31} = -2',
    '\\text{Kolom 1 } L = \\begin{bmatrix} 4 \\\\ 2 \\\\ -2 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 2: Baris 1 matriks } U \\text{ dibagi poros } l_{11} = 4 \\ (u_{11} = 1):',
    'u_{12} = \\frac{a_{12}}{l_{11}} = \\frac{2}{4} = \\frac{1}{2}, \\quad u_{13} = \\frac{a_{13}}{l_{11}} = \\frac{-2}{4} = -\\frac{1}{2}',
    '\\text{Baris 1 } U = \\left[ 1, \\ \\frac{1}{2}, \\ -\\frac{1}{2} \\right]'
   ],
   [
    '\\text{Langkah 3: Kolom 2 matriks } L \\text{ (mengurangi akumulasi baris 1):}',
    'l_{22} = a_{22} - (l_{21} u_{12}) = 10 - \\left(2 \\cdot \\frac{1}{2}\\right) = 10 - 1 = 9',
    'l_{32} = a_{32} - (l_{31} u_{12}) = 2 - \\left(-2 \\cdot \\frac{1}{2}\\right) = 2 - (-1) = 3',
    '\\text{Kolom 2 } L = \\begin{bmatrix} 0 \\\\ 9 \\\\ 3 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 4: Baris 2 matriks } U \\text{ dibagi poros } l_{22} = 9 \\ (u_{22} = 1):',
    'u_{23} = \\frac{a_{23} - (l_{21} u_{13})}{l_{22}} = \\frac{2 - \\left(2 \\cdot -\\frac{1}{2}\\right)}{9} = \\frac{2 - (-1)}{9} = \\frac{3}{9} = \\frac{1}{3}',
    '\\text{Baris 2 } U = \\left[ 0, \\ 1, \\ \\frac{1}{3} \\right]'
   ],
   [
    '\\text{Langkah 5: Kolom 3 matriks } L \\text{ (elemen pivot terakhir):}',
    'l_{33} = a_{33} - (l_{31} u_{13} + l_{32} u_{23}) = 6 - \\left[\\left(-2 \\cdot -\\frac{1}{2}\\right) + \\left(3 \\cdot \\frac{1}{3}\\right)\\right] = 6 - (1 + 1) = 4',
    'L = \\begin{bmatrix} 4 & 0 & 0 \\\\ 2 & 9 & 0 \\\\ -2 & 3 & 4 \\end{bmatrix}, \\quad U = \\begin{bmatrix} 1 & \\frac{1}{2} & -\\frac{1}{2} \\\\ 0 & 1 & \\frac{1}{3} \\\\ 0 & 0 & 1 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 6: Sub-Tahap 1 Substitusi Maju } L\\mathbf{y} = \\mathbf{b}:',
    '4 y_1 = 2 \\implies y_1 = \\frac{2}{4} = \\frac{1}{2}',
    '2\\left(\\frac{1}{2}\\right) + 9 y_2 = 22 \\implies 1 + 9 y_2 = 22 \\implies 9 y_2 = 21 \\implies y_2 = \\frac{21}{9} = \\frac{7}{3}',
    '-2\\left(\\frac{1}{2}\\right) + 3\\left(\\frac{7}{3}\\right) + 4 y_3 = 4 \\implies 6 + 4 y_3 = 4 \\implies 4 y_3 = -2 \\implies y_3 = -\\frac{1}{2}',
    '\\mathbf{y} = \\begin{bmatrix} \\frac{1}{2} \\\\ \\frac{7}{3} \\\\ -\\frac{1}{2} \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 7: Sub-Tahap 2 Substitusi Mundur } U\\mathbf{x} = \\mathbf{y}:',
    '1 x_3 = -\\frac{1}{2} \\implies x_3 = -\\frac{1}{2}',
    'x_2 + \\frac{1}{3}\\left(-\\frac{1}{2}\\right) = \\frac{7}{3} \\implies x_2 - \\frac{1}{6} = \\frac{14}{6} \\implies x_2 = \\frac{15}{6} = \\frac{5}{2}',
    'x_1 + \\frac{1}{2}\\left(\\frac{5}{2}\\right) - \\frac{1}{2}\\left(-\\frac{1}{2}\\right) = \\frac{1}{2} \\implies x_1 + \\frac{6}{4} = \\frac{2}{4} \\implies x_1 = -1',
    '\\mathbf{x} = \\begin{bmatrix} -1 \\\\ \\frac{5}{2} \\\\ -\\frac{1}{2} \\end{bmatrix}'
   ]
  ],
  conclusion:['Solusi eksak metode Crout adalah ', '\\mathbf{x} = \\begin{bmatrix} -1 \\\\ 2.5 \\\\ -0.5 \\end{bmatrix}', '. Terverifikasi 100% memenuhi sistem persamaan linier asal A x = b dengan residu nol!']
 },
 'Contoh Numerik Cholesky 3×3':{
  videoUrl:'/videos/contoh_soal_metode_cholesky.mp4',
  prompt:[
   '\\begin{bmatrix} 4 & 2 & -2 \\\\ 2 & 10 & 2 \\\\ -2 & 2 & 6 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 22 \\\\ 4 \\end{bmatrix}',
   '\\text{Uji Simetri dan Definit Positif, lalu faktorkan } A = L \\cdot L^T \\text{ (Cholesky)}'
  ],
  steps:[
   [
    '\\text{Langkah 1: Verifikasi Matriks Simetris dan Definit Positif:}',
    'A^T = A \\quad (a_{12}=a_{21}=2, \\ a_{13}=a_{31}=-2, \\ a_{23}=a_{32}=2)',
    '\\det(A_1) = 4 > 0, \\quad \\det(A_2) = (4)(10) - (2)(2) = 36 > 0, \\quad \\det(A) = 144 > 0',
    '\\text{Syarat Cholesky terpenuhi mutlak!}'
   ],
   [
    '\\text{Langkah 2: Faktorisasi Kolom 1 matriks } L:',
    'l_{11} = \\sqrt{a_{11}} = \\sqrt{4} = 2',
    'l_{21} = \\frac{a_{21}}{l_{11}} = \\frac{2}{2} = 1, \\quad l_{31} = \\frac{a_{31}}{l_{11}} = \\frac{-2}{2} = -1'
   ],
   [
    '\\text{Langkah 3: Faktorisasi Kolom 2 dan Kolom 3 matriks } L:',
    'l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{10 - 1^2} = \\sqrt{9} = 3',
    'l_{32} = \\frac{a_{32} - l_{31} l_{21}}{l_{22}} = \\frac{2 - (-1)(1)}{3} = \\frac{3}{3} = 1',
    'l_{33} = \\sqrt{a_{33} - (l_{31}^2 + l_{32}^2)} = \\sqrt{6 - ((-1)^2 + 1^2)} = \\sqrt{4} = 2',
    'L = \\begin{bmatrix} 2 & 0 & 0 \\\\ 1 & 3 & 0 \\\\ -1 & 1 & 2 \\end{bmatrix}, \\quad L^T = \\begin{bmatrix} 2 & 1 & -1 \\\\ 0 & 3 & 1 \\\\ 0 & 0 & 2 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 4: Tahap 1 Substitusi Maju } L\\mathbf{y} = \\mathbf{b}:',
    '2 y_1 = 2 \\implies y_1 = 1',
    '1(1) + 3 y_2 = 22 \\implies 3 y_2 = 21 \\implies y_2 = 7',
    '-1(1) + 1(7) + 2 y_3 = 4 \\implies 6 + 2 y_3 = 4 \\implies y_3 = -1',
    '\\mathbf{y} = \\begin{bmatrix} 1 \\\\ 7 \\\\ -1 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 5: Tahap 2 Substitusi Mundur } L^T\\mathbf{x} = \\mathbf{y}:',
    '2 x_3 = -1 \\implies x_3 = -0.5',
    '3 x_2 + 1(-0.5) = 7 \\implies 3 x_2 = 7.5 \\implies x_2 = 2.5',
    '2 x_1 + 1(2.5) - 1(-0.5) = 1 \\implies 2 x_1 + 3 = 1 \\implies x_1 = -1',
    '\\mathbf{x} = \\begin{bmatrix} -1 \\\\ 2.5 \\\\ -0.5 \\end{bmatrix}'
   ]
  ],
  conclusion:['Solusi eksak metode Cholesky adalah ', '\\mathbf{x} = \\begin{bmatrix} -1 \\\\ 2.5 \\\\ -0.5 \\end{bmatrix}', '. Cepat, stabil, dan hemat memori 50%!']
 }
} as const

function SmartTvVideoPlayer({videoUrl}:{videoUrl:string}){
 const videoRef=useRef<HTMLVideoElement>(null);
 const [isPlaying,setIsPlaying]=useState(false);
 const [currentTime,setCurrentTime]=useState(0);
 const [duration,setDuration]=useState(0);

 const togglePlay=()=>{
  if(!videoRef.current) return;
  if(videoRef.current.paused){
   videoRef.current.play().catch(()=>{});
   setIsPlaying(true);
  }else{
   videoRef.current.pause();
   setIsPlaying(false);
  }
 };

 const skip=(secs:number)=>{
  if(!videoRef.current) return;
  const target=Math.max(0,Math.min(videoRef.current.duration||0,videoRef.current.currentTime+secs));
  videoRef.current.currentTime=target;
  setCurrentTime(target);
 };

 const restart=()=>{
  if(!videoRef.current) return;
  videoRef.current.currentTime=0;
  setCurrentTime(0);
  videoRef.current.play().catch(()=>{});
  setIsPlaying(true);
 };

 const toggleFullscreen=()=>{
  if(!videoRef.current) return;
  if(document.fullscreenElement){
   document.exitFullscreen().catch(()=>{});
  }else{
   if(videoRef.current.requestFullscreen){
    videoRef.current.requestFullscreen().catch(()=>{});
   }
  }
 };

 const handleSeek=(e:React.ChangeEvent<HTMLInputElement>)=>{
  const val=parseFloat(e.target.value);
  if(videoRef.current){
   videoRef.current.currentTime=val;
   setCurrentTime(val);
  }
 };

 const fmtTime=(sec:number)=>{
  if(isNaN(sec)) return '00:00';
  const m=Math.floor(sec/60);
  const s=Math.floor(sec%60);
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
 };

 return <div className="smart-tv-player">
  <div className="smart-tv-viewport" onClick={togglePlay}>
   <video
    ref={videoRef}
    src={videoUrl}
    className="smart-tv-media"
    playsInline
    onTimeUpdate={()=>{if(videoRef.current) setCurrentTime(videoRef.current.currentTime)}}
    onLoadedMetadata={()=>{if(videoRef.current) setDuration(videoRef.current.duration)}}
    onPlay={()=>setIsPlaying(true)}
    onPause={()=>setIsPlaying(false)}
    onEnded={()=>setIsPlaying(false)}
   />
  </div>

  <div className="smart-tv-deckbar">
   <div className="tv-track-row">
    <span className="tv-time-badge">{fmtTime(currentTime)}</span>
    <input
     type="range"
     min={0}
     max={duration||100}
     step={0.5}
     value={currentTime}
     onChange={handleSeek}
     className="tv-track-slider"
     title="Geser Waktu Animasi"
    />
    <span className="tv-time-badge">{fmtTime(duration)}</span>
   </div>

   <div className="tv-control-buttons">
    <button type="button" className="tv-ctrl-btn tv-ctrl-step" onClick={()=>skip(-5)} title="Mundur 5 Detik">
     <Rewind size={22}/>
     <span>-5 Detik</span>
    </button>
    <button type="button" className={`tv-ctrl-btn tv-ctrl-main ${isPlaying?'active-pause':''}`} onClick={togglePlay} title={isPlaying?'Jeda Video':'Putar Video'}>
     {isPlaying?<><Pause size={24} fill="currentColor"/><span>Jeda</span></>:<><Play size={24} fill="currentColor"/><span>Putar</span></>}
    </button>
    <button type="button" className="tv-ctrl-btn tv-ctrl-step" onClick={()=>skip(5)} title="Maju 5 Detik">
     <FastForward size={22}/>
     <span>+5 Detik</span>
    </button>
    <button type="button" className="tv-ctrl-btn tv-ctrl-sub" onClick={restart} title="Putar Dari Awal">
     <RotateCcw size={20}/>
     <span>Ulang</span>
    </button>
    <button type="button" className="tv-ctrl-btn tv-ctrl-sub" onClick={toggleFullscreen} title="Layar Penuh TV">
     <Maximize size={20}/>
     <span>Layar Penuh</span>
    </button>
   </div>
  </div>
 </div>
}

function StepExample({data}:{data:any}){
 const [step,setStep]=useState(0);

 return <div className="example">
  <div className="example-prompt">{data.prompt.map((line:string)=><BlockMath math={line} key={line}/>)}</div>

  {data.videoUrl ? (
   <SmartTvVideoPlayer videoUrl={data.videoUrl}/>
  ) : (
   <>
    <div className="step">
     <small>LANGKAH {step + 1} DARI {data.steps.length}</small>
     {data.steps[step].map((line:string)=><BlockMath math={line} key={line}/>)}
    </div>
    {'conclusion' in data&&step===data.steps.length-1&&<div className="conclusion">
     <strong>Kesimpulan Matematis</strong>
     <p>{data.conclusion.map((part:string,n:number)=>n%2?<InlineMath math={part} key={part}/>:part)}</p>
    </div>}
    <div className="step-controls">
     <button disabled={!step} onClick={()=>setStep(step-1)}><ChevronLeft/>Langkah Sebelumnya</button>
     <button disabled={step===data.steps.length-1} onClick={()=>setStep(step+1)}>Langkah Berikutnya<ChevronRight/></button>
    </div>
   </>
  )}
 </div>
}

function EssayExercisesSlide() {
  const [tab, setTab] = useState<'all' | 'soal1' | 'soal2' | 'soal3' | 'pdf'>('all');

  return (
    <div className="essay-container">
      {/* Navigasi Tab */}
      <div className="essay-nav-box">
        <div className="essay-nav-title">
          <BookOpen size={18} />
          <span>Latihan Soal &amp; Tantangan HOTS: Dekomposisi Crout &amp; Cholesky</span>
        </div>
        <div className="essay-tabs">
          <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>Semua Soal (1, 2, &amp; 3)</button>
          <button className={tab === 'soal1' ? 'active' : ''} onClick={() => setTab('soal1')}>Soal 1 (C6 HOTS: Rekonstruksi)</button>
          <button className={tab === 'soal2' ? 'active' : ''} onClick={() => setTab('soal2')}>Soal 2 (C6 HOTS: Substitusi Maju)</button>
          <button className={tab === 'soal3' ? 'active' : ''} onClick={() => setTab('soal3')}>Soal 3 (SPL &amp; Numerical Lab)</button>
          <button className={tab === 'pdf' ? 'active' : ''} onClick={() => setTab('pdf')}>📄 Naskah Asli PDF</button>
        </div>
      </div>

      {/* Tampilan Tab Dokumen Asli PDF */}
      {tab === 'pdf' && (
        <div className="essay-pdf-container">
          <div className="essay-pdf-actions">
            <div>
              <strong>Dokumen Asli Soal Tantangan HOTS (C6)</strong>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Kelompok 4 — Mata Kuliah Metode Numerik (Kelas C)</div>
            </div>
            <a
              href="/SOAL_KELOMPOK_4.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="SOAL_KELOMPOK_4.pdf"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                background: 'var(--ink)',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.82rem'
              }}
            >
              Unduh Berkas Asli (PDF)
            </a>
          </div>
          <div className="essay-pdf-grid">
            <div className="essay-pdf-card">
              <div className="essay-pdf-card-header">Halaman 1 — Deskripsi Kasus &amp; Pertanyaan 1</div>
              <img src="/soal_hots_p1.png" alt="Soal HOTS Halaman 1" />
            </div>
            <div className="essay-pdf-card">
              <div className="essay-pdf-card-header">Halaman 2 — Pertanyaan 2 (Transformasi Substitusi Maju)</div>
              <img src="/soal_hots_p2.png" alt="Soal HOTS Halaman 2" />
            </div>
          </div>
        </div>
      )}

      {/* Tampilan Soal Esai (Tab all, soal1, soal2, soal3) */}
      {tab !== 'pdf' && (
        <div className="essay-grid">
          {/* Deskripsi Kasus Bersama untuk Soal 1 & Soal 2 */}
          {(tab === 'all' || tab === 'soal1' || tab === 'soal2') && (
            <div className="essay-case-card">
              <div className="essay-case-header">
                <div className="essay-case-title">
                  <span>🏛️</span>
                  <span>Deskripsi Kasus HOTS (Level C6): "Jembatan Rahasia Crout &amp; Cholesky"</span>
                </div>
                <span className="essay-badge badge-hots">SUMBER: SOAL KELOMPOK 4 (PDF)</span>
              </div>
              <p className="essay-case-desc">
                Diberikan sebuah matriks koefisien <InlineMath math="A" /> berukuran <InlineMath math="3 \times 3" /> yang diketahui bersifat <strong>simetris dan definit positif</strong> (<InlineMath math="A = A^{\mathrm{T}}, A \succ 0" />). Dua orang mahasiswa melakukan dekomposisi pada matriks <InlineMath math="A" /> yang sama tersebut menggunakan dua metode berbeda:
              </p>
              <ul style={{ margin: '4px 0 6px 20px', padding: 0, fontSize: '0.84rem', lineHeight: '1.6' }}>
                <li><strong>Mahasiswa Pertama</strong> menggunakan <strong>Metode Reduksi Crout</strong> (<InlineMath math="A = L_C \cdot U_C" />, dengan diagonal utama <InlineMath math="u_{ii} = 1" />).</li>
                <li><strong>Mahasiswa Kedua</strong> menggunakan <strong>Metode Dekomposisi Cholesky</strong> (<InlineMath math="A = L_{Ch} \cdot L_{Ch}^{\mathrm{T}}" />).</li>
              </ul>
              <p className="essay-case-desc">
                Akibat kelalaian saat menyimpan file, seluruh elemen matriks asli <InlineMath math="A" /> dan sebagian besar hasil faktorisasi keduanya hilang. Data yang tersisa hanyalah matriks segitiga atas <InlineMath math="U_C" /> (milik Crout) dan vektor diagonal utama dari matriks <InlineMath math="L_{Ch}" /> (milik Cholesky) yang mengandung parameter <InlineMath math="\alpha > 0" />:
              </p>
              <div style={{ margin: '8px 0', textAlign: 'center' }}>
                <BlockMath math="U_C = \begin{bmatrix} 1 & 2 & -1 \\ 0 & 1 & 3 \\ 0 & 0 & 1 \end{bmatrix} \quad \text{dan Diagonal utama } L_{Ch} = \begin{bmatrix} \alpha & 2\alpha & \alpha\sqrt{5} \end{bmatrix}" />
              </div>
              <p className="essay-case-desc">
                Jika diketahui determinan matriks asli adalah <strong><InlineMath math="\det(A) = 1280" /></strong>, selesaikan dua tantangan analitis berikut:
              </p>
            </div>
          )}

          {/* SOAL 1 */}
          {(tab === 'all' || tab === 'soal1') && (
            <article className="essay-card">
              <div className="essay-card-header">
                <div className="essay-card-title">
                  <span>Pertanyaan 1 — Rekonstruksi Tanpa Matriks Asli</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="essay-badge badge-hots">BOBOT 50%</span>
                  <span className="essay-badge badge-hots">LEVEL C6 HOTS</span>
                </div>
              </div>
              <div className="essay-prompt">
                <p>
                  Tentukan nilai parameter <strong><InlineMath math="\alpha" /></strong> serta seluruh elemen matriks segitiga bawah <strong><InlineMath math="L_C" /></strong> (milik metode Crout) <strong>tanpa menghitung atau mencari elemen matriks <InlineMath math="A" /> terlebih dahulu!</strong>
                </p>
              </div>
              <details className="essay-hint-box">
                <summary>💡 Petunjuk Analitis &amp; Kaitan Konseptual</summary>
                <div style={{ marginTop: '6px' }}>
                  <p>1. <strong>Determinan Cholesky:</strong> Karena <InlineMath math="A = L_{Ch} L_{Ch}^{\mathrm{T}}" />, maka <InlineMath math="\det(A) = (\det(L_{Ch}))^2 = (\alpha \cdot 2\alpha \cdot \alpha\sqrt{5})^2 = 20\alpha^6" />. Samakan dengan 1280 untuk memperoleh <InlineMath math="\alpha^6 = 64 \implies \alpha = 2" />.</p>
                  <p>2. <strong>Faktorisasi Unik <InlineMath math="LDL^{\mathrm{T}}" />:</strong> Karena <InlineMath math="A" /> simetris, berlaku hubungan <InlineMath math="L_C = U_C^{\mathrm{T}} D" /> dengan <InlineMath math="D = \operatorname{diag}(d_1^2, d_2^2, d_3^2)" /> di mana <InlineMath math="d_i" /> adalah diagonal utama <InlineMath math="L_{Ch}" />.</p>
                </div>
              </details>
            </article>
          )}

          {/* SOAL 2 */}
          {(tab === 'all' || tab === 'soal2') && (
            <article className="essay-card">
              <div className="essay-card-header">
                <div className="essay-card-title">
                  <span>Pertanyaan 2 — Transformasi Vektor Substitusi Maju</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="essay-badge badge-hots">BOBOT 50%</span>
                  <span className="essay-badge badge-hots">LEVEL C6 HOTS</span>
                </div>
              </div>
              <div className="essay-prompt">
                <p>
                  Apabila matriks <InlineMath math="A" /> tersebut digunakan untuk menyelesaikan sistem persamaan linear <InlineMath math="A\mathbf{x} = \mathbf{b}" /> dan diketahui hasil langkah substitusi maju (<em>forward substitution</em>) pada metode Cholesky (<InlineMath math="L_{Ch}\mathbf{y}_{Ch} = \mathbf{b}" />) adalah:
                </p>
                <div style={{ margin: '6px 0', textAlign: 'center' }}>
                  <BlockMath math="\mathbf{y}_{Ch} = \begin{bmatrix} 2 \\ 4 \\ \sqrt{5} \end{bmatrix}" />
                </div>
                <p>
                  Berapakah vektor antara <strong><InlineMath math="\mathbf{y}_C" /></strong> (hasil langkah substitusi maju <InlineMath math="L_C \mathbf{y}_C = \mathbf{b}" />) jika sistem persamaan linear yang sama diselesaikan menggunakan metode Crout?
                </p>
              </div>
              <details className="essay-hint-box">
                <summary>💡 Petunjuk Analitis &amp; Kaitan Konseptual</summary>
                <div style={{ marginTop: '6px' }}>
                  <p>Karena <InlineMath math="L_C = L_{Ch} D^{1/2}" />, maka <InlineMath math="L_C \mathbf{y}_C = \mathbf{b} \iff L_{Ch} (D^{1/2} \mathbf{y}_C) = \mathbf{b} = L_{Ch} \mathbf{y}_{Ch}" />. Dengan ketunggalan solusi sistem segitiga bawah, berlaku <InlineMath math="\mathbf{y}_C = D^{-1/2} \mathbf{y}_{Ch}" /> atau elemen per baris <InlineMath math="y_{C,i} = \dfrac{y_{Ch,i}}{l_{Ch,ii}}" />.</p>
                </div>
              </details>
            </article>
          )}

          {/* SOAL 3 */}
          {(tab === 'all' || tab === 'soal3') && (
            <article className="essay-card" style={{ borderLeft: '6px solid var(--blue)' }}>
              <div className="essay-card-header">
                <div className="essay-card-title">
                  <span>Pertanyaan 3 — Eksplorasi SPL Simetris Definit Positif &amp; Verifikasi Numerical Lab</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="essay-badge badge-spl">STUDI KASUS SPL</span>
                  <span className="essay-badge badge-bonus">KOMPATIBEL DUA METODE</span>
                </div>
              </div>
              <div className="essay-prompt">
                <p>
                  Diberikan sebuah Sistem Persamaan Linear (SPL) <InlineMath math="A\mathbf{x} = \mathbf{b}" /> berukuran <InlineMath math="3 \times 3" /> sebagai berikut:
                </p>
                <div style={{ margin: '8px 0', textAlign: 'center' }}>
                  <BlockMath math="\begin{bmatrix} 9 & 6 & 3 \\ 6 & 20 & -2 \\ 3 & -2 & 6 \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \\ x_3 \end{bmatrix} = \begin{bmatrix} 33 \\ 26 \\ 22 \end{bmatrix}" />
                </div>
                <p><strong>Instruksi Pengerjaan (Esai):</strong></p>
                <ol>
                  <li>
                    <strong>Uji Karakteristik Matriks (Kriteria Sylvester):</strong><br />
                    Tunjukkan secara analitis bahwa matriks koefisien <InlineMath math="A" /> bersifat simetris (<InlineMath math="A = A^{\mathrm{T}}" />) dan definit positif dengan menghitung nilai determinan dari seluruh minor utama terkemukanya (<InlineMath math="\Delta_1, \Delta_2, \Delta_3 > 0" />).
                  </li>
                  <li>
                    <strong>Penyelesaian dengan Dekomposisi Cholesky (<InlineMath math="A = L \cdot L^{\mathrm{T}}" />):</strong><br />
                    Tentukan matriks segitiga bawah <InlineMath math="L" />, lalu hitung vektor perantara <InlineMath math="\mathbf{y}" /> melalui substitusi maju <InlineMath math="L\mathbf{y} = \mathbf{b}" /> dan solusi akhir <InlineMath math="\mathbf{x}" /> melalui substitusi mundur <InlineMath math="L^{\mathrm{T}}\mathbf{x} = \mathbf{y}" />.
                  </li>
                  <li>
                    <strong>Penyelesaian dengan Metode Reduksi Crout (<InlineMath math="A = L \cdot U, u_{ii} = 1" />):</strong><br />
                    Tentukan matriks <InlineMath math="L" /> dan <InlineMath math="U" />, lalu selesaikan sistem melalui substitusi maju <InlineMath math="L\mathbf{y} = \mathbf{b}" /> dan substitusi mundur <InlineMath math="U\mathbf{x} = \mathbf{y}" />.
                  </li>
                </ol>
              </div>

              {/* Callout Uji Audiens via Numerical Lab */}
              <div className="essay-callout">
                <strong>🎯 Tantangan Audiens &amp; Verifikasi Langsung di Numerical Lab:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Audiens dipersilakan menguji matriks <InlineMath math="A" /> dan vektor <InlineMath math="\mathbf{b}" /> di atas pada fitur <strong>Numerical Lab</strong> (pilih tab menu di atas, set ordo <InlineMath math="3 \times 3" />). Uji tombol <strong>Metode Crout</strong>, <strong>Metode Cholesky</strong>, dan <strong>Uji Definit Positif</strong> untuk memverifikasi langkah perhitungan analitis serta solusi akhir <InlineMath math="\mathbf{x} = [2, 1, 3]^{\mathrm{T}}" /> secara langsung!
                </p>
              </div>

              <details className="essay-hint-box">
                <summary>💡 Petunjuk Analitis &amp; Kunci Jawaban Singkat</summary>
                <div style={{ marginTop: '6px' }}>
                  <p>• <strong>Minor Sylvester:</strong> <InlineMath math="\Delta_1 = 9 > 0" />, <InlineMath math="\Delta_2 = 180 - 36 = 144 > 0" />, <InlineMath math="\Delta_3 = \det(A) = 576 > 0" />.</p>
                  <p>• <strong>Faktor Cholesky:</strong> <InlineMath math="L = \begin{bmatrix} 3 & 0 & 0 \\ 2 & 4 & 0 \\ 1 & -1 & 2 \end{bmatrix}" />, <InlineMath math="\mathbf{y} = \begin{bmatrix} 11 \\ 1 \\ 6 \end{bmatrix}" />, <InlineMath math="\mathbf{x} = \begin{bmatrix} 2 \\ 1 \\ 3 \end{bmatrix}" />.</p>
                  <p>• <strong>Faktor Crout:</strong> <InlineMath math="L = \begin{bmatrix} 9 & 0 & 0 \\ 6 & 16 & 0 \\ 3 & -4 & 4 \end{bmatrix}" />, <InlineMath math="U = \begin{bmatrix} 1 & 2/3 & 1/3 \\ 0 & 1 & -1/4 \\ 0 & 0 & 1 \end{bmatrix}" />, <InlineMath math="\mathbf{y} = \begin{bmatrix} 11/3 \\ 1/4 \\ 3 \end{bmatrix}" />, <InlineMath math="\mathbf{x} = \begin{bmatrix} 2 \\ 1 \\ 3 \end{bmatrix}" />.</p>
                </div>
              </details>
            </article>
          )}
        </div>
      )}
    </div>
  );
}

function VariantComparisonSlide(){
 const [tab,setTab]=useState<'all'|'doolittle'|'crout'|'cholesky'>('all');

 return <div className="variant-comparison">
  <div className="variant-header-box">
   <div className="variant-target-info">
    <div style={{fontWeight:700,fontSize:'0.9rem',color:'var(--ink)',marginBottom:'4px'}}>
      Matriks Asal A (3×3 Simetris Definit Positif):
    </div>
    <BlockMath math="A = \begin{bmatrix} 4 & 2 & -2 \\ 2 & 10 & 2 \\ -2 & 2 & 6 \end{bmatrix}"/>
    <div style={{color:'var(--muted)',fontSize:'0.75rem',fontWeight:600,marginTop:'2px'}}>
      ✓ Simetris (A = Aᵀ) &nbsp;•&nbsp; ✓ Definit Positif (Semua subdeterminan &gt; 0)
    </div>
   </div>
   <div className="variant-tab-buttons">
    <button className={tab==='all'?'active':''} onClick={()=>setTab('all')}>Semua Varian (3 Kolom)</button>
    <button className={tab==='doolittle'?'active':''} onClick={()=>setTab('doolittle')}>1. Doolittle (lᵢᵢ = 1)</button>
    <button className={tab==='crout'?'active':''} onClick={()=>setTab('crout')}>2. Crout (uᵢᵢ = 1)</button>
    <button className={tab==='cholesky'?'active':''} onClick={()=>setTab('cholesky')}>3. Cholesky (A = L · Lᵀ)</button>
   </div>
  </div>

  <div className={`variant-grid ${tab!=='all'?'single-focus':''}`}>
   {(tab==='all'||tab==='doolittle')&&<article className="variant-card doolittle">
    <div className="variant-card-title">
     <span>1. Metode Doolittle</span>
     <span className="badge">lᵢᵢ = 1</span>
    </div>
    <p className="variant-rule">Kunci angka <b>1</b> di diagonal <b>L</b>. Matriks <b>U</b> menampung sisa.</p>
    <div className="variant-math-stack">
     <div className="matrix-row">
      <span className="matrix-label">L =</span>
      <BlockMath math="\begin{bmatrix} 1 & 0 & 0 \\[10pt] \dfrac{1}{2} & 1 & 0 \\[10pt] -\dfrac{1}{2} & \dfrac{1}{3} & 1 \end{bmatrix}"/>
     </div>
     <div className="matrix-row">
      <span className="matrix-label">U =</span>
      <BlockMath math="\begin{bmatrix} 4 & 2 & -2 \\[8pt] 0 & 9 & 3 \\[8pt] 0 & 0 & 4 \end{bmatrix}"/>
     </div>
    </div>
    <ul className="variant-points">
     <li>Materi kelompok sebelumnya (Eliminasi Gauss murni).</li>
     <li>Diagonal L dipatok <code>[1, 1, 1]</code>.</li>
     <li>Matriks U menampung diagonal <code>[4, 9, 4]</code>.</li>
    </ul>
   </article>}

   {(tab==='all'||tab==='crout')&&<article className="variant-card crout">
    <div className="variant-card-title">
     <span>2. Metode Crout</span>
     <span className="badge">uᵢᵢ = 1</span>
    </div>
    <p className="variant-rule">Kunci angka <b>1</b> di diagonal <b>U</b>. Matriks <b>L</b> menampung sisa.</p>
    <div className="variant-math-stack">
     <div className="matrix-row">
      <span className="matrix-label">L =</span>
      <BlockMath math="\begin{bmatrix} 4 & 0 & 0 \\[8pt] 2 & 9 & 0 \\[8pt] -2 & 3 & 4 \end{bmatrix}"/>
     </div>
     <div className="matrix-row">
      <span className="matrix-label">U =</span>
      <BlockMath math="\begin{bmatrix} 1 & \dfrac{1}{2} & -\dfrac{1}{2} \\[10pt] 0 & 1 & \dfrac{1}{3} \\[10pt] 0 & 0 & 1 \end{bmatrix}"/>
     </div>
    </div>
    <ul className="variant-points">
     <li>Materi inti Kelompok 4 (Reduksi Crout).</li>
     <li>Diagonal U dipatok <code>[1, 1, 1]</code>.</li>
     <li>Substitusi balik bebas pembagian, pembagian diserap di L.</li>
    </ul>
   </article>}

   {(tab==='all'||tab==='cholesky')&&<article className="variant-card cholesky">
    <div className="variant-card-title">
     <span>3. Metode Cholesky</span>
     <span className="badge">A = L · Lᵀ</span>
    </div>
    <p className="variant-rule">Bagi rata simetris! Diagonal ditarik akar: <code>√4=2, √9=3, √4=2</code>.</p>
    <div className="variant-math-stack">
     <div className="matrix-row">
      <span className="matrix-label">L =</span>
      <BlockMath math="\begin{bmatrix} 2 & 0 & 0 \\ 1 & 3 & 0 \\ -1 & 1 & 2 \end{bmatrix}"/>
     </div>
     <div className="matrix-row">
      <span className="matrix-label">Lᵀ =</span>
      <BlockMath math="\begin{bmatrix} 2 & 1 & -1 \\ 0 & 3 & 1 \\ 0 & 0 & 2 \end{bmatrix}"/>
     </div>
    </div>
    <ul className="variant-points">
     <li>Materi inti Kelompok 4 khusus simetris definit positif.</li>
     <li>Tidak ada pemaksaan angka 1, terbagi simetris sempurna.</li>
     <li>Hanya perlu hitung L sekali! Hemat komputasi 50%.</li>
    </ul>
   </article>}
  </div>

  <div className="variant-footer-summary">
   <strong>💡 Rangkuman Alokasi Angka Diagonal [4, 9, 4]:</strong>
   <p>
    • <b>Doolittle:</b> Angka [4, 9, 4] ditaruh di <b>U</b>, diagonal L dikunci <b>1</b>.<br/>
    • <b>Crout:</b> Angka [4, 9, 4] ditaruh di <b>L</b>, diagonal U dikunci <b>1</b>.<br/>
    • <b>Cholesky:</b> Angka [4, 9, 4] ditarik akar menjadi <b>[2, 3, 2]</b> dan dibagi seimbang ke <b>L</b> dan <b>Lᵀ</b>!
   </p>
  </div>
 </div>
}

function SlideDeck(){
 const [i,setI]=useState(0),last=slides.length-1,[open,setOpen]=useState(false);
 const [zoom,setZoom]=useState<number>(100);
 const [isFullscreen,setIsFullscreen]=useState<boolean>(false);
 const move=useCallback((to:number)=>setI(Math.max(0,Math.min(last,to))),[last]);

 const zoomIn=useCallback(()=>setZoom(z=>Math.min(160,z+10)),[]);
 const zoomOut=useCallback(()=>setZoom(z=>Math.max(70,z-10)),[]);
 const resetZoom=useCallback(()=>setZoom(100),[]);
 const toggleFullscreen=useCallback(()=>{
  if(!document.fullscreenElement){
   document.documentElement.requestFullscreen().catch(()=>{});
  }else{
   document.exitFullscreen().catch(()=>{});
  }
 },[]);

 useEffect(()=>{
  const onFs=()=>setIsFullscreen(Boolean(document.fullscreenElement));
  document.addEventListener('fullscreenchange',onFs);
  return()=>document.removeEventListener('fullscreenchange',onFs);
 },[]);

 useEffect(()=>{
  const k=(e:KeyboardEvent)=>{
   const target=e.target as HTMLElement|null;
   if(target&&['INPUT','TEXTAREA','SELECT'].includes(target.tagName)) return;
   if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();move(i+1)}
   if(e.key==='ArrowLeft'){e.preventDefault();move(i-1)}
   if(e.key==='+'||e.key==='='){e.preventDefault();zoomIn()}
   if(e.key==='-'||e.key==='_'){e.preventDefault();zoomOut()}
   if(e.key==='0'){e.preventDefault();resetZoom()}
   if(e.key==='f'||e.key==='F'){e.preventDefault();toggleFullscreen()}
  };
  addEventListener('keydown',k);
  return()=>removeEventListener('keydown',k)
 },[i,move,zoomIn,zoomOut,resetZoom,toggleFullscreen]);

 const slide=slides[i],
   example=examples[slide[0] as keyof typeof examples],
   quiz=slide[0]==='Latihan & Kuis Interaktif',
   isVariantSlide=slide[0]==='Tiga Varian Dekomposisi LU',
   fullWidth=i===0||Boolean(example)||isVariantSlide||quiz,
   special=Boolean(example)||quiz||isVariantSlide;

  return <section className="deck" style={{'--deck-zoom':zoom/100} as CSSProperties}>
   <article className={`slide ${i===0?'cover-slide':''} ${special?'special':''} ${fullWidth?'full-width':''}`} style={{zoom:`${zoom}%`}}>
    <div className="progress" style={{width:`${(i+1)/slides.length*100}%`}}/>
    <div>
     <small>METODE NUMERIK · SLIDE {i+1} DARI {slides.length}</small>
     <h1>{slide[0]}</h1>
     {i===0?<Cover/>:isVariantSlide?<VariantComparisonSlide/>:example?<StepExample key={slide[0]} data={example}/>:quiz?<EssayExercisesSlide/>:<><BlockMath math={slide[1]}/><ul>{slide[2].map(x=><li key={x}>{x}</li>)}</ul></>}
    </div>
   {!fullWidth&&<aside className={special?'compact-visual':''}>
    <SlideVisual index={i}/>
    {!special&&<div className="slide-takeaway">
     <div className="takeaway-header"><span className="sticker">INTI KONSEP</span><small className="nav-hint">Gunakan ← → / Space</small></div>
     <strong>{slide[2][0]}</strong>
    </div>}
   </aside>}
  </article>
  <div className="deckbar">
   <button disabled={!i} onClick={()=>move(i-1)}><ChevronLeft/>Sebelumnya</button>
   <button onClick={()=>setOpen(!open)}>{i+1} / {slides.length} · Daftar Slide</button>
   <button disabled={i===last} onClick={()=>move(i+1)}>Berikutnya<ChevronRight/></button>
   <div className="deck-zoom-controls">
    <button onClick={zoomOut} title="Zoom Out (-)" disabled={zoom<=70}><ZoomOut size={16}/></button>
    <button onClick={resetZoom} title="Reset Skala 100% (0)" className="zoom-indicator"><strong>{zoom}%</strong></button>
    <button onClick={zoomIn} title="Zoom In (+)" disabled={zoom>=160}><ZoomIn size={16}/></button>
    <button onClick={toggleFullscreen} title={isFullscreen?"Keluar Layar Penuh (F)":"Layar Penuh (F)"}>
     {isFullscreen?<Minimize size={16}/>:<Maximize size={16}/>}
    </button>
   </div>
  </div>
  {open&&<div className="drawer">
   <div className="drawer-head"><h2>Daftar Slide Presentasi</h2><button onClick={()=>setOpen(false)}>Tutup</button></div>
   <div className="drawer-list">
    {slides.map(([t],idx)=><button className={idx===i?'active':''} onClick={()=>{move(idx);setOpen(false)}} key={t}><span>{idx+1}</span><strong>{t}</strong></button>)}
   </div>
  </div>}
 </section>
}

function Cover(){
 return <div className="cover">
  <div className="course">
   <strong>{identity.course}</strong>
   <span>{identity.code} · {identity.program}</span>
   <span>{identity.faculty}</span>
   <div className="course-badges" style={{marginTop:'8px',display:'flex',justifyContent:'center',gap:'8px',alignItems:'center'}}>
    <span style={{background:'rgba(5, 150, 105, 0.15)',color:'#059669',padding:'4px 12px',borderRadius:'9999px',fontWeight:800,fontSize:'0.82rem',letterSpacing:'0.04em'}}>
     {identity.group}
    </span>
    <span style={{background:'rgba(59, 130, 246, 0.15)',color:'#2563eb',padding:'4px 12px',borderRadius:'9999px',fontWeight:800,fontSize:'0.82rem',letterSpacing:'0.04em'}}>
     {identity.meeting}
    </span>
   </div>
  </div>
  <div className="cover-members">
   {members.map(([name,npm],i)=><article className={`member-color-${i}`} key={npm}>
    <span className="profile-mark"><User aria-hidden="true"/></span>
    <div><strong>{name}</strong><span>NPM {npm}</span></div>
    <span className="member-badge">{name==='Ryan Wardiana'?'Ketua / Lead':'Anggota'}</span>
   </article>)}
  </div>
 </div>
}

// Numerical Lab: Dedicated Solver for Crout, Cholesky, & Sylvester Positive Definite
function Lab(){
  const [matrixMode, setMatrixMode] = useState<'crout' | 'cholesky' | 'definit'>('crout');
  const [dim, setDim] = useState<number>(3);

  const [matrixA, setMatrixA] = useState<number[][]>([
    [4, 2, -2],
    [2, 10, 2],
    [-2, 2, 6]
  ]);
  const [vectorB, setVectorB] = useState<number[]>([2, 22, 4]);

  const [croutOut, setCroutOut] = useState<LUResult | null>(null);
  const [choleskyOut, setCholeskyOut] = useState<CholeskyResult | null>(null);
  const [definitOut, setDefinitOut] = useState<PositiveDefiniteResult | null>(null);
  const [errText, setErrText] = useState<string>('');

  const handleDimChange = (newDim: number) => {
    setDim(newDim);
    if (newDim === 2) {
      setMatrixA([
        [4, 2],
        [2, 5]
      ]);
      setVectorB([8, 13]);
    } else {
      setMatrixA([
        [4, 2, -2],
        [2, 10, 2],
        [-2, 2, 6]
      ]);
      setVectorB([2, 22, 4]);
    }
    setCroutOut(null);
    setCholeskyOut(null);
    setDefinitOut(null);
    setErrText('');
  };

  const handleModeChange = (mode: 'crout' | 'cholesky' | 'definit') => {
    setMatrixMode(mode);
    setCroutOut(null);
    setCholeskyOut(null);
    setDefinitOut(null);
    setErrText('');
  };

  const runSolve = () => {
    setErrText('');
    try {
      if (matrixMode === 'crout') {
        const res = solveCrout(matrixA, vectorB);
        setCroutOut(res);
        setCholeskyOut(null);
        setDefinitOut(null);
        if (res.status === 'singular') setErrText(res.message);
      } else if (matrixMode === 'cholesky') {
        const res = solveCholesky(matrixA, vectorB);
        setCholeskyOut(res);
        setCroutOut(null);
        setDefinitOut(null);
        if (res.status !== 'converged') setErrText(res.message);
      } else {
        const res = checkPositiveDefinite(matrixA);
        setDefinitOut(res);
        setCroutOut(null);
        setCholeskyOut(null);
      }
    } catch (e) {
      setErrText(e instanceof Error ? e.message : 'Terjadi kesalahan komputasi matriks.');
    }
  };

  return <>
    <div className="pagehead">
      <div>
        <small>LABORATORIUM NUMERIK SPL · KELOMPOK 4</small>
        <h1>Kalkulator Dekomposisi Crout, Cholesky &amp; Definit Positif</h1>
      </div>
      <span className={`status ${(croutOut?.status==='converged'||choleskyOut?.status==='converged'||definitOut?.status==='converged')?'ok':''}`}>
        {croutOut?.status==='converged' ? 'Crout Selesai' : choleskyOut?.status==='converged' ? 'Cholesky Selesai' : definitOut?.status==='converged' ? 'Definit Positif OK' : definitOut ? 'Uji Selesai' : 'Siap Komputasi'}
      </span>
    </div>

    <div className="methods">
      <button className={`newton ${matrixMode==='crout'?'chosen':''}`} onClick={()=>handleModeChange('crout')}>
        <span>1. Dekomposisi LU Crout (</span><InlineMath math="u_{ii}=1" /><span>)</span>
      </button>
      <button className={`secant ${matrixMode==='cholesky'?'chosen':''}`} onClick={()=>handleModeChange('cholesky')}>
        <span>2. Dekomposisi LU Cholesky (</span><InlineMath math="A = L \cdot L^T" /><span>)</span>
      </button>
      <button className={`fixed ${matrixMode==='definit'?'chosen':''}`} onClick={()=>handleModeChange('definit')}>
        <span>3. Uji Definit Positif (Sylvester)</span>
      </button>
    </div>

    <div className="labgrid">
      <section className="panel controls">
        <h2>{matrixMode === 'definit' ? 'Matriks Bujursangkar A' : 'Matriks Koefisien A dan Vektor b'}</h2>
        <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'12px'}}>
          <label style={{fontSize:'0.82rem',fontWeight:700}}>Ukuran Matriks:</label>
          <button type="button" className={`pill ${dim===2?'active':''}`} onClick={()=>handleDimChange(2)}>2 × 2</button>
          <button type="button" className={`pill ${dim===3?'active':''}`} onClick={()=>handleDimChange(3)}>3 × 3</button>
        </div>

        <div style={{display:'flex',gap:'12px',alignItems:'center',overflowX:'auto',paddingBottom:'8px'}}>
          <div>
            <div style={{fontSize:'0.82rem',fontWeight:800,marginBottom:'6px',color:'#1e3a8a'}}>Matriks A:</div>
            <div style={{display:'grid',gridTemplateColumns:`repeat(${dim}, 64px)`,gap:'6px'}}>
              {matrixA.map((row, r)=>row.map((val, c)=><input
                key={`${r}-${c}`}
                type="number"
                value={val}
                onChange={e=>{
                  const next=matrixA.map(row=>[...row]);
                  next[r][c]=Number(e.target.value);
                  setMatrixA(next);
                }}
                style={{width:'64px',height:'42px',padding:'6px 4px',textAlign:'center',border:'1.5px solid #cbd5e1',borderRadius:'6px',fontWeight:700,fontSize:'1rem'}}
              />))}
            </div>
          </div>

          {matrixMode !== 'definit' && (
            <>
              <div style={{fontSize:'1.8rem',color:'#64748b',fontWeight:800,padding:'0 4px'}}>·</div>

              <div>
                <div style={{fontSize:'0.82rem',fontWeight:800,marginBottom:'6px',color:'#047857'}}>Vektor x:</div>
                <div style={{display:'grid',gap:'6px'}}>
                  {Array.from({length:dim}).map((_, i)=><div
                    key={i}
                    style={{width:'56px',height:'42px',display:'flex',alignItems:'center',justifyContent:'center',background:'#f1f5f9',borderRadius:'6px',border:'1.5px dashed #94a3b8',fontSize:'1.05rem',fontWeight:800,color:'#334155'}}
                  >
                    <InlineMath math={`x_{${i+1}}`} />
                  </div>)}
                </div>
              </div>

              <div style={{fontSize:'1.8rem',color:'#64748b',fontWeight:800,padding:'0 4px'}}>=</div>

              <div>
                <div style={{fontSize:'0.82rem',fontWeight:800,marginBottom:'6px',color:'#b45309'}}>Vektor b:</div>
                <div style={{display:'grid',gap:'6px'}}>
                  {vectorB.map((val, i)=><input
                    key={i}
                    type="number"
                    value={val}
                    onChange={e=>{
                      const next=[...vectorB];
                      next[i]=Number(e.target.value);
                      setVectorB(next);
                    }}
                    style={{width:'64px',height:'42px',padding:'6px 4px',textAlign:'center',border:'1.5px solid #cbd5e1',borderRadius:'6px',fontWeight:700,fontSize:'1rem'}}
                  />)}
                </div>
              </div>
            </>
          )}
        </div>

        {matrixMode === 'definit' && (
          <div style={{marginTop:'10px',fontSize:'0.78rem',color:'#475569',background:'#f8fafc',padding:'8px 10px',borderRadius:'6px',border:'1px solid #e2e8f0',lineHeight:1.4}}>
            <b>Uji Definit Positif:</b> Menggunakan Kriteria Sylvester untuk memeriksa minor utama terkemuka (determinan submatriks pojok kiri atas). Vektor b tidak diperlukan.
          </div>
        )}

        {errText&&<div className="error" style={{color:'#dc2626',marginTop:'10px',fontWeight:700,background:'#fef2f2',padding:'10px',borderRadius:'8px',border:'1px solid #fca5a5'}}>{errText}</div>}

        <button className="primary" style={{marginTop:'14px',width:'100%'}} onClick={runSolve}>
          <Play/> {matrixMode === 'definit' ? 'Uji Definit Positif & Simetri' : 'Hitung Solusi Lengkap'}
        </button>
      </section>

      <section className="panel display">
        <h2>Hasil &amp; Langkah Terperinci (Step-by-Step)</h2>

        {/* 1. CROUT RESULT */}
        {croutOut&&croutOut.status==='converged'&&(
          <div>
            <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'14px 18px',marginBottom:'16px'}}>
              <div style={{fontWeight:800,color:'#065f46',marginBottom:'8px',fontSize:'0.95rem',display:'flex',alignItems:'center',gap:'6px'}}>
                <span>Solusi Akhir Vektor</span> <InlineMath math="\mathbf{x}" /> <span>(Metode Crout):</span>
              </div>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
                {croutOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'8px 16px',borderRadius:'8px',border:'1.5px solid #10b981',boxShadow:'0 2px 4px rgba(0,0,0,0.06)',display:'inline-flex',alignItems:'center',fontSize:'1.2rem',fontWeight:800,color:'#065f46'}}>
                  <InlineMath math={`x_{${idx+1}} = ${fmtLatex(val)}`} />
                </div>)}
              </div>
              <div style={{fontWeight:700,fontSize:'0.88rem',color:'#047857',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
                <span>Vektor perantara</span> <InlineMath math="\mathbf{y}" /> <span>(dari</span> <InlineMath math="L\mathbf{y} = \mathbf{b}" /><span>):</span>
              </div>
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                {croutOut.y.map((val, idx)=><div key={idx} style={{background:'#f0fdf4',padding:'6px 14px',borderRadius:'8px',border:'1px solid #86efac',display:'inline-flex',alignItems:'center',fontSize:'1.1rem',color:'#166534',fontWeight:700}}>
                  <InlineMath math={`y_{${idx+1}} = ${fmtLatex(val)}`} />
                </div>)}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'16px'}}>
              <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'12px'}}>
                <div style={{fontWeight:800,color:'#1e3a8a',fontSize:'0.88rem',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px'}}>
                  <span>Matriks Segitiga Bawah</span> <InlineMath math="L" /> (Diagonal Bebas):
                </div>
                <table style={{borderCollapse:'collapse',width:'100%',fontSize:'1.05rem'}}>
                  <tbody>
                    {croutOut.L.map((row, ri)=><tr key={ri}>
                      {row.map((val, ci)=><td key={ci} style={{border:'1.5px solid #cbd5e1',padding:'10px 14px',minWidth:'55px',minHeight:'46px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci<=ri?'#ecfdf5':'transparent'}}>
                        <InlineMath math={fmtLatex(val)} />
                      </td>)}
                    </tr>)}
                  </tbody>
                </table>
              </div>

              <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'12px'}}>
                <div style={{fontWeight:800,color:'#047857',fontSize:'0.88rem',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px'}}>
                  <span>Matriks Segitiga Atas</span> <InlineMath math="U" /> <b>(Diagonal 1):</b>
                </div>
                <table style={{borderCollapse:'collapse',width:'100%',fontSize:'1.05rem'}}>
                  <tbody>
                    {croutOut.U.map((row, ri)=><tr key={ri}>
                      {row.map((val, ci)=><td key={ci} style={{border:'1.5px solid #cbd5e1',padding:'10px 14px',minWidth:'55px',minHeight:'46px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci===ri?'#dbeafe':ci>=ri?'#eff6ff':'transparent'}}>
                        <InlineMath math={fmtLatex(val)} />
                      </td>)}
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>1. Langkah Faktorisasi Elemen Matriks L &amp; U:</div>
            <div style={{display:'grid',gap:'10px',marginBottom:'16px',maxHeight:'320px',overflowY:'auto',background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
              {croutOut.steps.map((st, idx)=>(
                <div key={idx} style={{fontSize:'0.88rem',background:'white',padding:'10px 14px',borderRadius:'8px',border:'1px solid #cbd5e1'}}>
                  <div style={{fontWeight:700,color:'#0f172a',marginBottom:'4px'}}>{st.title}</div>
                  <div style={{color:'#475569',marginBottom:'6px',lineHeight:1.5}}>{st.explanation}</div>
                  {st.explanationLatex&&<div style={{marginTop:'4px',padding:'8px 12px',background:'#eff6ff',borderRadius:'6px',color:'#1e40af',fontSize:'1.1rem',overflowX:'auto'}}><InlineMath math={st.explanationLatex}/></div>}
                </div>
              ))}
            </div>

            {croutOut.forwardSteps && croutOut.forwardSteps.length > 0 && (
              <>
                <div style={{fontWeight:800,color:'#047857',marginBottom:'8px'}}>2. Langkah Substitusi Maju (<InlineMath math="L\mathbf{y} = \mathbf{b}" />):</div>
                <div style={{display:'grid',gap:'10px',marginBottom:'16px',background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                  {croutOut.forwardSteps.map((st, idx)=>(
                    <div key={idx} style={{fontSize:'0.88rem',background:'white',padding:'10px 14px',borderRadius:'8px',border:'1px solid #cbd5e1'}}>
                      <div style={{fontWeight:700,color:'#0f172a',marginBottom:'4px',display:'flex',alignItems:'center',gap:'6px'}}>
                        <span>Baris {st.row}: Menghitung</span> <InlineMath math={st.latexVar || `y_{${st.row}}`} />
                      </div>
                      {st.latex ? <div style={{margin:'6px 0',padding:'8px 12px',background:'#f0fdf4',borderRadius:'6px',color:'#047857',fontSize:'1.1rem',overflowX:'auto'}}><InlineMath math={st.latex}/></div> : <div>{st.calculation}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {croutOut.backwardSteps && croutOut.backwardSteps.length > 0 && (
              <>
                <div style={{fontWeight:800,color:'#b45309',marginBottom:'8px'}}>3. Langkah Substitusi Mundur (<InlineMath math="U\mathbf{x} = \mathbf{y}" />):</div>
                <div style={{display:'grid',gap:'10px',marginBottom:'16px',background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                  {croutOut.backwardSteps.map((st, idx)=>(
                    <div key={idx} style={{fontSize:'0.88rem',background:'white',padding:'10px 14px',borderRadius:'8px',border:'1px solid #cbd5e1'}}>
                      <div style={{fontWeight:700,color:'#0f172a',marginBottom:'4px',display:'flex',alignItems:'center',gap:'6px'}}>
                        <span>Baris {st.row}: Menghitung</span> <InlineMath math={st.latexVar || `x_{${st.row}}`} />
                      </div>
                      {st.latex ? <div style={{margin:'6px 0',padding:'8px 12px',background:'#fffbeb',borderRadius:'6px',color:'#b45309',fontSize:'1.1rem',overflowX:'auto'}}><InlineMath math={st.latex}/></div> : <div>{st.calculation}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {croutOut.verificationRows && croutOut.verificationRows.length > 0 && (
              <>
                <div style={{fontWeight:800,color:'#1e293b',marginBottom:'8px'}}>4. Verifikasi Solusi (<InlineMath math="A\mathbf{x} = \mathbf{b}" />):</div>
                <div style={{background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}>
                    <thead>
                      <tr style={{background:'#e2e8f0',textAlign:'left'}}>
                        <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Baris</th>
                        <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Evaluasi <InlineMath math="A_i \cdot \mathbf{x}" /></th>
                        <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Target <InlineMath math="b_i" /></th>
                        <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {croutOut.verificationRows.map((vr, idx)=>(
                        <tr key={idx} style={{background:'white'}}>
                          <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',textAlign:'center',fontWeight:700}}>Baris {vr.row}</td>
                          <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',fontSize:'1.05rem'}}>
                            {vr.lhsLatex ? <InlineMath math={`${vr.lhsLatex} = ${fmtLatex(vr.lhsValue)}`} /> : `${vr.lhsExpression} = ${fmtFrac(vr.lhsValue)}`}
                          </td>
                          <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',textAlign:'center',fontSize:'1.05rem'}}>
                            <InlineMath math={fmtLatex(vr.rhsTarget)} />
                          </td>
                          <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',textAlign:'center',color:'#10b981',fontWeight:700}}>
                            {Math.abs(vr.residual) < 1e-4 ? '✓ Cocok' : `Residu: ${fmtFrac(vr.residual)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. CHOLESKY RESULT */}
        {choleskyOut&&(
          <div>
            {choleskyOut.status==='converged' ? (
              <div>
                <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'14px 18px',marginBottom:'16px'}}>
                  <div style={{fontWeight:800,color:'#065f46',marginBottom:'8px',fontSize:'0.95rem',display:'flex',alignItems:'center',gap:'6px'}}>
                    <span>Solusi Akhir Vektor</span> <InlineMath math="\mathbf{x}" /> <span>(Metode Cholesky</span> <InlineMath math="A = L \cdot L^T" /><span>):</span>
                  </div>
                  <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
                    {choleskyOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'8px 16px',borderRadius:'8px',border:'1.5px solid #10b981',boxShadow:'0 2px 4px rgba(0,0,0,0.06)',display:'inline-flex',alignItems:'center',fontSize:'1.2rem',fontWeight:800,color:'#065f46'}}>
                      <InlineMath math={`x_{${idx+1}} = ${fmtLatex(val)}`} />
                    </div>)}
                  </div>
                  <div style={{fontWeight:700,fontSize:'0.88rem',color:'#047857',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
                    <span>Vektor perantara</span> <InlineMath math="\mathbf{y}" /> <span>(dari</span> <InlineMath math="L\mathbf{y} = \mathbf{b}" /><span>):</span>
                  </div>
                  <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                    {choleskyOut.y.map((val, idx)=><div key={idx} style={{background:'#f0fdf4',padding:'6px 14px',borderRadius:'8px',border:'1px solid #86efac',display:'inline-flex',alignItems:'center',fontSize:'1.1rem',color:'#166534',fontWeight:700}}>
                      <InlineMath math={`y_{${idx+1}} = ${fmtLatex(val)}`} />
                    </div>)}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'16px'}}>
                  <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'12px'}}>
                    <div style={{fontWeight:800,color:'#1e3a8a',fontSize:'0.88rem',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px'}}>
                      <span>Matriks Segitiga Bawah</span> <InlineMath math="L" />:
                    </div>
                    <table style={{borderCollapse:'collapse',width:'100%',fontSize:'1.05rem'}}>
                      <tbody>
                        {choleskyOut.L.map((row, ri)=><tr key={ri}>
                          {row.map((val, ci)=><td key={ci} style={{border:'1.5px solid #cbd5e1',padding:'10px 14px',minWidth:'55px',minHeight:'46px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci<=ri?'#ecfdf5':'transparent'}}>
                            <InlineMath math={fmtLatex(val)} />
                          </td>)}
                        </tr>)}
                      </tbody>
                    </table>
                  </div>

                  <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'12px'}}>
                    <div style={{fontWeight:800,color:'#047857',fontSize:'0.88rem',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px'}}>
                      <span>Matriks Segitiga Atas</span> <InlineMath math="L^T" /> <b>(Transpos L):</b>
                    </div>
                    <table style={{borderCollapse:'collapse',width:'100%',fontSize:'1.05rem'}}>
                      <tbody>
                        {choleskyOut.LT.map((row, ri)=><tr key={ri}>
                          {row.map((val, ci)=><td key={ci} style={{border:'1.5px solid #cbd5e1',padding:'10px 14px',minWidth:'55px',minHeight:'46px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci>=ri?'#eff6ff':'transparent'}}>
                            <InlineMath math={fmtLatex(val)} />
                          </td>)}
                        </tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>1. Langkah Faktorisasi Cholesky (<InlineMath math="A = L \cdot L^T" />):</div>
                <div style={{display:'grid',gap:'10px',marginBottom:'16px',maxHeight:'320px',overflowY:'auto',background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                  {choleskyOut.steps.map((st, idx)=>(
                    <div key={idx} style={{fontSize:'0.88rem',background:'white',padding:'10px 14px',borderRadius:'8px',border:'1px solid #cbd5e1'}}>
                      <div style={{fontWeight:700,color:'#0f172a',marginBottom:'4px'}}>{st.title}</div>
                      <div style={{color:'#475569',marginBottom:'6px',lineHeight:1.5}}>{st.explanation}</div>
                      {st.explanationLatex&&<div style={{marginTop:'4px',padding:'8px 12px',background:'#ecfdf5',borderRadius:'6px',color:'#047857',fontSize:'1.1rem',overflowX:'auto'}}><InlineMath math={st.explanationLatex}/></div>}
                    </div>
                  ))}
                </div>

                {choleskyOut.forwardSteps && choleskyOut.forwardSteps.length > 0 && (
                  <>
                    <div style={{fontWeight:800,color:'#047857',marginBottom:'8px'}}>2. Langkah Substitusi Maju (<InlineMath math="L\mathbf{y} = \mathbf{b}" />):</div>
                    <div style={{display:'grid',gap:'10px',marginBottom:'16px',background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                      {choleskyOut.forwardSteps.map((st, idx)=>(
                        <div key={idx} style={{fontSize:'0.88rem',background:'white',padding:'10px 14px',borderRadius:'8px',border:'1px solid #cbd5e1'}}>
                          <div style={{fontWeight:700,color:'#0f172a',marginBottom:'4px',display:'flex',alignItems:'center',gap:'6px'}}>
                            <span>Baris {st.row}: Menghitung</span> <InlineMath math={st.latexVar || `y_{${st.row}}`} />
                          </div>
                          {st.latex ? <div style={{margin:'6px 0',padding:'8px 12px',background:'#f0fdf4',borderRadius:'6px',color:'#047857',fontSize:'1.1rem',overflowX:'auto'}}><InlineMath math={st.latex}/></div> : <div>{st.calculation}</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {choleskyOut.backwardSteps && choleskyOut.backwardSteps.length > 0 && (
                  <>
                    <div style={{fontWeight:800,color:'#b45309',marginBottom:'8px'}}>3. Langkah Substitusi Mundur (<InlineMath math="L^T\mathbf{x} = \mathbf{y}" />):</div>
                    <div style={{display:'grid',gap:'10px',marginBottom:'16px',background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                      {choleskyOut.backwardSteps.map((st, idx)=>(
                        <div key={idx} style={{fontSize:'0.88rem',background:'white',padding:'10px 14px',borderRadius:'8px',border:'1px solid #cbd5e1'}}>
                          <div style={{fontWeight:700,color:'#0f172a',marginBottom:'4px',display:'flex',alignItems:'center',gap:'6px'}}>
                            <span>Baris {st.row}: Menghitung</span> <InlineMath math={st.latexVar || `x_{${st.row}}`} />
                          </div>
                          {st.latex ? <div style={{margin:'6px 0',padding:'8px 12px',background:'#fffbeb',borderRadius:'6px',color:'#b45309',fontSize:'1.1rem',overflowX:'auto'}}><InlineMath math={st.latex}/></div> : <div>{st.calculation}</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {choleskyOut.verificationRows && choleskyOut.verificationRows.length > 0 && (
                  <>
                    <div style={{fontWeight:800,color:'#1e293b',marginBottom:'8px'}}>4. Verifikasi Solusi (<InlineMath math="A\mathbf{x} = \mathbf{b}" />):</div>
                    <div style={{background:'#f8fafc',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}>
                        <thead>
                          <tr style={{background:'#e2e8f0',textAlign:'left'}}>
                            <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Baris</th>
                            <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Evaluasi <InlineMath math="A_i \cdot \mathbf{x}" /></th>
                            <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Target <InlineMath math="b_i" /></th>
                            <th style={{padding:'8px 12px',border:'1px solid #cbd5e1'}}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {choleskyOut.verificationRows.map((vr, idx)=>(
                            <tr key={idx} style={{background:'white'}}>
                              <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',textAlign:'center',fontWeight:700}}>Baris {vr.row}</td>
                              <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',fontSize:'1.05rem'}}>
                                {vr.lhsLatex ? <InlineMath math={`${vr.lhsLatex} = ${fmtLatex(vr.lhsValue)}`} /> : `${vr.lhsExpression} = ${fmtFrac(vr.lhsValue)}`}
                              </td>
                              <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',textAlign:'center',fontSize:'1.05rem'}}>
                                <InlineMath math={fmtLatex(vr.rhsTarget)} />
                              </td>
                              <td style={{padding:'8px 12px',border:'1px solid #cbd5e1',textAlign:'center',color:'#10b981',fontWeight:700}}>
                                {Math.abs(vr.residual) < 1e-4 ? '✓ Cocok' : `Residu: ${fmtFrac(vr.residual)}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{background:'#fef2f2',border:'1.5px solid #ef4444',borderRadius:'10px',padding:'16px'}}>
                <div style={{fontWeight:800,color:'#991b1b',fontSize:'1rem',marginBottom:'8px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <AlertCircle size={20} color="#dc2626" />
                  <span>{choleskyOut.status === 'not-symmetric' ? 'Matriks Tidak Simetris!' : 'Matriks Tidak Definit Positif!'}</span>
                </div>
                <p style={{fontSize:'0.85rem',color:'#7f1d1d',lineHeight:1.5}}>{choleskyOut.message}</p>
                <div style={{marginTop:'12px',padding:'10px',background:'white',borderRadius:'6px',border:'1px solid #fca5a5',fontSize:'0.82rem',color:'#334155'}}>
                  <strong>Catatan Edukatif:</strong> Dekomposisi Cholesky <InlineMath math="A = L \cdot L^T" /> mensyaratkan dua hal mutlak:
                  <ul style={{margin:'6px 0 0 16px',padding:0}}>
                    <li><b>Simetris:</b> <InlineMath math="a_{ij} = a_{ji}" /> untuk seluruh elemen.</li>
                    <li><b>Definit Positif:</b> Semua minor utama berdeterminan positif, sehingga nilai di dalam akar <InlineMath math="\sqrt{a_{jj} - \sum l_{jk}^2}" /> selalu bernilai riil positif.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. DEFINIT POSITIF RESULT */}
        {definitOut && (
          <div>
            <div style={{
              background: definitOut.status === 'converged' ? '#ecfdf5' : '#fef2f2',
              border: `1.5px solid ${definitOut.status === 'converged' ? '#10b981' : '#ef4444'}`,
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '14px'
            }}>
              <div style={{
                fontWeight: 800,
                color: definitOut.status === 'converged' ? '#065f46' : '#991b1b',
                fontSize: '1rem',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {definitOut.status === 'converged' ? <CheckCircle2 size={20} color="#059669" /> : <AlertCircle size={20} color="#dc2626" />}
                <span>
                  {definitOut.status === 'converged'
                    ? 'Matriks Terbukti Definit Positif'
                    : definitOut.status === 'not-symmetric'
                    ? 'Matriks Tidak Simetris'
                    : 'Matriks Tidak Definit Positif'}
                </span>
              </div>
              <p style={{fontSize:'0.85rem',color: definitOut.status==='converged' ? '#047857' : '#7f1d1d',lineHeight:1.5,margin:0}}>
                {definitOut.message}
              </p>
            </div>

            <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>1. Uji Simetri Matriks (<InlineMath math="A = A^T" />):</div>
            <div style={{background:'#f8fafc',border:'1px solid #cbd5e1',borderRadius:'8px',padding:'12px',marginBottom:'14px'}}>
              {definitOut.isSymmetric ? (
                <div style={{color:'#047857',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'6px'}}>
                  <CheckCircle2 size={16} color="#059669"/>
                  <span><b>Matriks Simetris:</b> Seluruh elemen memenuhi <InlineMath math="a_{ij} = a_{ji}" /> untuk setiap <InlineMath math="i \neq j" />.</span>
                </div>
              ) : (
                <div style={{color:'#dc2626',fontSize:'0.85rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',fontWeight:700,marginBottom:'4px'}}>
                    <AlertCircle size={16} color="#dc2626"/> Matriks Tidak Simetris:
                  </div>
                  <div>Ditemukan ketidaksamaan pada elemen:</div>
                  <ul style={{margin:'4px 0 0 16px',padding:0}}>
                    {definitOut.differences?.map((d, idx)=>(
                      <li key={idx}>
                        <InlineMath math={`a_{${d.i}${d.j}} = ${fmtLatex(d.a_ij)} \\neq a_{${d.j}${d.i}} = ${fmtLatex(d.a_ji)}`} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>2. Kriteria Sylvester (Minor Utama Terkemuka <InlineMath math="\Delta_k" />):</div>
            <div style={{display:'grid',gap:'10px',marginBottom:'14px'}}>
              {definitOut.minors.map((m, idx)=>(
                <div key={idx} style={{
                  background: m.isPositive ? '#ffffff' : '#fff1f2',
                  border: `1.5px solid ${m.isPositive ? '#cbd5e1' : '#fca5a5'}`,
                  borderRadius:'8px',
                  padding:'12px 14px'
                }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                    <span style={{fontWeight:800,color:'#0f172a',fontSize:'0.92rem'}}>
                      Minor Utama ke-{m.k} (<InlineMath math={`\\Delta_{${m.k}}`} /> - Submatriks {m.k}×{m.k}):
                    </span>
                    <span style={{
                      fontSize:'0.82rem',
                      fontWeight:800,
                      padding:'3px 10px',
                      borderRadius:'6px',
                      background: m.isPositive ? '#dcfce7' : '#fee2e2',
                      color: m.isPositive ? '#166534' : '#991b1b',
                      border: `1px solid ${m.isPositive ? '#86efac' : '#fca5a5'}`
                    }}>
                      {m.isPositive ? <><InlineMath math={`\\Delta_{${m.k}} > 0`} /> (Positif)</> : <><InlineMath math={`\\Delta_{${m.k}} \\leq 0`} /> (Non-Positif)</>}
                    </span>
                  </div>

                  <div style={{display:'flex',gap:'16px',alignItems:'center',flexWrap:'wrap',margin:'10px 0'}}>
                    <table style={{borderCollapse:'collapse',fontSize:'1.05rem',background:'#f8fafc',border:'1.5px solid #cbd5e1'}}>
                      <tbody>
                        {m.matrix.map((row, ri)=>(
                          <tr key={ri}>
                            {row.map((val, ci)=>(
                              <td key={ci} style={{border:'1.5px solid #cbd5e1',padding:'8px 12px',minWidth:'50px',textAlign:'center',fontWeight:600}}>
                                <InlineMath math={fmtLatex(val)} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{flex:1,fontSize:'1.05rem'}}>
                      {m.explanationLatex ? (
                        <div style={{color:'#1e3a8a',padding:'6px 12px',background:'#eff6ff',borderRadius:'6px'}}><InlineMath math={m.explanationLatex}/></div>
                      ) : (
                        <div style={{fontFamily:'monospace'}}>{m.detFormula}</div>
                      )}
                      <div style={{fontSize:'0.85rem',color:'#64748b',marginTop:'6px',lineHeight:1.4}}>{m.explanation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: definitOut.choleskyFeasible ? '#f0fdf4' : '#fffbeb',
              border: `1.5px solid ${definitOut.choleskyFeasible ? '#86efac' : '#fde68a'}`,
              borderRadius: '8px',
              padding: '12px 14px'
            }}>
              <div style={{fontWeight:800,color: definitOut.choleskyFeasible ? '#166534' : '#92400e',fontSize:'0.85rem',marginBottom:'4px'}}>
                3. Kesimpulan Kelayakan Dekomposisi Cholesky:
              </div>
              <p style={{fontSize:'0.82rem',color: definitOut.choleskyFeasible ? '#15803d' : '#78350f',margin:0,lineHeight:1.5}}>
                {definitOut.choleskyFeasible
                  ? 'Matriks ini memenuhi seluruh syarat mutlak Dekomposisi Cholesky A = L · Lᵀ karena simetris dan seluruh minor utama bernilai positif riil.'
                  : 'Matriks ini TIDAK DAPAT didekomposisi dengan metode Cholesky A = L · Lᵀ karena melanggar syarat simetri atau menghasilkan nilai minor negatif (akar kuadrat dari bilangan non-positif).'}
              </p>
            </div>
          </div>
        )}

        {!croutOut&&!choleskyOut&&!definitOut&&<div style={{textAlign:'center',color:'#64748b',padding:'40px 10px'}}>
          Pilih metode di atas (Crout, Cholesky, atau Uji Definit Positif), tentukan nilai matriks, lalu klik <b>{matrixMode === 'definit' ? 'Uji Definit Positif & Simetri' : 'Hitung Solusi Lengkap'}</b>.
        </div>}
      </section>
    </div>
  </>
}

function SlideVisual({index}:{index:number}){
 return <div className="slide-visual">
  <svg viewBox="0 0 280 150" role="img" aria-label="Ilustrasi Visual Slide">
   {/* Slide 0: Cover Crout & Cholesky */}
   {index===0&&<g>
    <rect x="30" y="20" width="90" height="75" rx="8" fill="#bee3f8" stroke="#222" strokeWidth="2.5"/>
    <text x="75" y="65" textAnchor="middle" fontSize="24" fill="#1e3a8a">L</text>
    <text x="140" y="65" textAnchor="middle" fontSize="22" fill="#222">×</text>
    <rect x="160" y="20" width="90" height="75" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2.5"/>
    <text x="205" y="65" textAnchor="middle" fontSize="24" fill="#065f46">U / Lᵀ</text>
    <rect x="55" y="110" width="170" height="28" rx="6" fill="#feebc8" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="128" textAnchor="middle" fontSize="12" fill="#7c2d12">A = L · U &nbsp;|&nbsp; A = L · Lᵀ</text>
   </g>}

   {/* Slide 1: Mengapa Butuh Dekomposisi? O(n^3) vs O(n^2) */}
   {index===1&&<g>
    <rect x="35" y="20" width="85" height="95" rx="8" fill="#fee2e2" stroke="#222" strokeWidth="2"/>
    <text x="77" y="48" textAnchor="middle" fontSize="13" fill="#b91c1c">Gauss</text>
    <text x="77" y="78" textAnchor="middle" fontSize="20" fill="#b91c1c">O(n³)</text>
    <text x="77" y="100" textAnchor="middle" fontSize="9" fill="#7f1d1d">Ulang Total</text>
    <text x="140" y="68" textAnchor="middle" fontSize="16" fill="#059669">VS</text>
    <rect x="160" y="38" width="85" height="77" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2"/>
    <text x="202" y="62" textAnchor="middle" fontSize="13" fill="#047857">LU Sub</text>
    <text x="202" y="88" textAnchor="middle" fontSize="18" fill="#047857">O(n²)</text>
    <rect x="165" y="122" width="75" height="22" rx="5" fill="#059669" stroke="#222" strokeWidth="1"/>
    <text x="202" y="137" textAnchor="middle" fontSize="11" fill="#fff">⚡ Cepat!</text>
   </g>}

   {/* Slide 2: Tiga Pendekar Dekomposisi */}
   {index===2&&<g>
    <rect x="15" y="25" width="75" height="90" rx="6" fill="#fef3c7" stroke="#222" strokeWidth="1.5"/>
    <text x="52" y="50" textAnchor="middle" fontSize="10" fill="#92400e">Doolittle</text>
    <text x="52" y="80" textAnchor="middle" fontSize="13" fill="#78350f">lᵢᵢ = 1</text>
    <rect x="102" y="25" width="75" height="90" rx="6" fill="#e0f2fe" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="50" textAnchor="middle" fontSize="10" fill="#0369a1">Crout</text>
    <text x="140" y="80" textAnchor="middle" fontSize="13" fill="#075985">uᵢᵢ = 1</text>
    <rect x="190" y="25" width="75" height="90" rx="6" fill="#dcfce7" stroke="#222" strokeWidth="1.5"/>
    <text x="227" y="50" textAnchor="middle" fontSize="10" fill="#166534">Cholesky</text>
    <text x="227" y="80" textAnchor="middle" fontSize="13" fill="#14532d">L · Lᵀ</text>
    <rect x="35" y="122" width="210" height="22" rx="4" fill="#334155"/>
    <text x="140" y="137" textAnchor="middle" fontSize="10.5" fill="#fff">Ragam Faktorisasi Matriks</text>
   </g>}

   {/* Slide 3: Reduksi Crout u_ii = 1 */}
   {index===3&&<g>
    {/* Matriks L */}
    <rect x="20" y="15" width="110" height="92" rx="8" fill="#f0fdf4" stroke="#222" strokeWidth="2"/>
    <text x="75" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#166534">Matriks L (Bebas)</text>
    <path d="M 37 38 L 33 38 L 33 86 L 37 86" fill="none" stroke="#166534" strokeWidth="1.5"/>
    <path d="M 113 38 L 117 38 L 117 86 L 113 86" fill="none" stroke="#166534" strokeWidth="1.5"/>
    {/* Baris L */}
    <text x="49" y="52" fontSize="10" fontWeight="bold" fill="#15803d" textAnchor="middle">l₁₁</text>
    <text x="75" y="52" fontSize="10" fill="#94a3b8" textAnchor="middle">0</text>
    <text x="101" y="52" fontSize="10" fill="#94a3b8" textAnchor="middle">0</text>
    <text x="49" y="68" fontSize="10" fontWeight="bold" fill="#15803d" textAnchor="middle">l₂₁</text>
    <text x="75" y="68" fontSize="10" fontWeight="bold" fill="#15803d" textAnchor="middle">l₂₂</text>
    <text x="101" y="68" fontSize="10" fill="#94a3b8" textAnchor="middle">0</text>
    <text x="49" y="84" fontSize="10" fontWeight="bold" fill="#15803d" textAnchor="middle">l₃₁</text>
    <text x="75" y="84" fontSize="10" fontWeight="bold" fill="#15803d" textAnchor="middle">l₃₂</text>
    <text x="101" y="84" fontSize="10" fontWeight="bold" fill="#15803d" textAnchor="middle">l₃₃</text>
    <text x="75" y="100" textAnchor="middle" fontSize="8.5" fill="#166534" fontWeight="600">Segitiga Bawah</text>

    {/* Titik Perkalian */}
    <text x="140" y="65" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#222">·</text>

    {/* Matriks U */}
    <rect x="150" y="15" width="110" height="92" rx="8" fill="#dbeafe" stroke="#222" strokeWidth="2"/>
    <text x="205" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">Matriks U (Crout)</text>
    <path d="M 167 38 L 163 38 L 163 86 L 167 86" fill="none" stroke="#1e40af" strokeWidth="1.5"/>
    <path d="M 243 38 L 247 38 L 247 86 L 243 86" fill="none" stroke="#1e40af" strokeWidth="1.5"/>
    {/* Baris U */}
    <text x="179" y="52" fontSize="11" fontWeight="bold" fill="#dc2626" textAnchor="middle">1</text>
    <text x="205" y="52" fontSize="10" fontWeight="bold" fill="#2563eb" textAnchor="middle">u₁₂</text>
    <text x="231" y="52" fontSize="10" fontWeight="bold" fill="#2563eb" textAnchor="middle">u₁₃</text>
    <text x="179" y="68" fontSize="10" fill="#94a3b8" textAnchor="middle">0</text>
    <text x="205" y="68" fontSize="11" fontWeight="bold" fill="#dc2626" textAnchor="middle">1</text>
    <text x="231" y="68" fontSize="10" fontWeight="bold" fill="#2563eb" textAnchor="middle">u₂₃</text>
    <text x="179" y="84" fontSize="10" fill="#94a3b8" textAnchor="middle">0</text>
    <text x="205" y="84" fontSize="10" fill="#94a3b8" textAnchor="middle">0</text>
    <text x="231" y="84" fontSize="11" fontWeight="bold" fill="#dc2626" textAnchor="middle">1</text>
    <text x="205" y="100" textAnchor="middle" fontSize="8.5" fill="#1e40af" fontWeight="bold">Diagonal = 1</text>

    {/* Banner Bawah */}
    <rect x="25" y="116" width="230" height="24" rx="5" fill="#0284c7" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="132" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">Ciri Khas Crout: Diagonal U = 1</text>
   </g>}

   {/* Slide 4: Algoritma Rekursif Crout */}
   {index===4&&<g>
    {/* Langkah 1: Kolom k Matriks L */}
    <rect x="15" y="10" width="118" height="52" rx="7" fill="#e0f2fe" stroke="#222" strokeWidth="1.8"/>
    <text x="74" y="24" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#0369a1">1. Hitung Kolom k (L)</text>
    <text x="74" y="44" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#075985">lᵢₖ = aᵢₖ - ∑ lᵢₚ uₚₖ</text>
    <text x="74" y="56" textAnchor="middle" fontSize="7.5" fill="#0369a1">(i = k, k+1, ..., n)</text>

    {/* Panah alur bergantian */}
    <path d="M 133 36 L 148 36 L 148 84 L 152 84" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="150,80 157,84 150,88" fill="#ea580c"/>

    {/* Langkah 2: Baris k Matriks U (Pecahan Bertingkat) */}
    <rect x="152" y="58" width="116" height="56" rx="7" fill="#fef3c7" stroke="#222" strokeWidth="1.8"/>
    <text x="210" y="71" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#b45309">2. Hitung Baris k (U)</text>
    <text x="173" y="93" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350f">uₖⱼ =</text>
    <text x="222" y="85" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#78350f">aₖⱼ - ∑ lₖₚ uₚⱼ</text>
    <line x1="187" y1="89" x2="257" y2="89" stroke="#78350f" strokeWidth="1.2"/>
    <text x="222" y="102" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#dc2626">lₖₖ</text>

    {/* Banner Bawah */}
    <rect x="25" y="120" width="230" height="24" rx="5" fill="#0284c7" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="136" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#ffffff">Bergantian: Kolom L → Baris U (k = 1...n)</text>
   </g>}

   {/* Slide 5: Substitusi Maju Crout L y = b */}
   {index===5&&<g>
    {/* Card Matriks L */}
    <rect x="18" y="15" width="80" height="92" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2"/>
    <text x="58" y="30" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#065f46">Matriks L</text>
    <polygon points="28,42 28,84 88,84" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5"/>
    <text x="46" y="74" fontSize="14" fontWeight="bold" fill="#065f46">L</text>
    <text x="58" y="100" textAnchor="middle" fontSize="8" fontWeight="600" fill="#065f46">Segitiga Bawah</text>

    {/* Simbol Titik Perkalian · */}
    <text x="107" y="64" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#222">·</text>

    {/* Card Vektor y (Maju dari Atas ke Bawah) */}
    <rect x="116" y="15" width="54" height="92" rx="8" fill="#fed7aa" stroke="#222" strokeWidth="2"/>
    <text x="143" y="30" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#9a3412">Vektor y</text>
    <text x="135" y="50" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#c2410c">y₁</text>
    <text x="135" y="68" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#c2410c">y₂</text>
    <text x="135" y="86" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#c2410c">y₃</text>
    <path d="M 154 46 L 154 84" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/>
    <polygon points="151,80 154,86 157,80" fill="#ea580c"/>
    <text x="143" y="100" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#9a3412">Maju ↓</text>

    {/* Simbol Sama Dengan = */}
    <text x="179" y="64" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#222">=</text>

    {/* Card Vektor b (Ruas Kanan) */}
    <rect x="188" y="15" width="74" height="92" rx="8" fill="#e0f2fe" stroke="#222" strokeWidth="2"/>
    <text x="225" y="30" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#0369a1">Vektor b</text>
    <text x="225" y="50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0284c7">b₁</text>
    <text x="225" y="68" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0284c7">b₂</text>
    <text x="225" y="86" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0284c7">b₃</text>
    <text x="225" y="100" textAnchor="middle" fontSize="8" fontWeight="600" fill="#0369a1">Ruas Kanan</text>

    {/* Banner Bawah */}
    <rect x="25" y="118" width="230" height="24" rx="5" fill="#059669" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="134" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#fff">Substitusi Maju: L · y = b (Atas ke Bawah)</text>
   </g>}

   {/* Slide 6: Substitusi Mundur Crout U x = y */}
   {index===6&&<g>
    {/* Card Matriks U */}
    <rect x="18" y="15" width="80" height="92" rx="8" fill="#dbeafe" stroke="#222" strokeWidth="2"/>
    <text x="58" y="30" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#1e40af">Matriks U</text>
    <polygon points="28,42 88,42 88,84" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5"/>
    <text x="64" y="62" fontSize="14" fontWeight="bold" fill="#1e40af">U</text>
    <text x="58" y="100" textAnchor="middle" fontSize="8" fontWeight="600" fill="#1e40af">Segitiga Atas</text>

    {/* Simbol Titik Perkalian · */}
    <text x="107" y="64" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#222">·</text>

    {/* Card Vektor x (Mundur dari Bawah ke Atas) */}
    <rect x="116" y="15" width="54" height="92" rx="8" fill="#dcfce7" stroke="#222" strokeWidth="2"/>
    <text x="143" y="30" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#166534">Vektor x</text>
    <text x="135" y="50" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#15803d">x₁</text>
    <text x="135" y="68" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#15803d">x₂</text>
    <text x="135" y="86" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#15803d">x₃</text>
    <path d="M 154 84 L 154 46" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
    <polygon points="151,50 154,44 157,50" fill="#15803d"/>
    <text x="143" y="100" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#166534">Mundur ↑</text>

    {/* Simbol Sama Dengan = */}
    <text x="179" y="64" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#222">=</text>

    {/* Card Vektor y (Hasil Maju) */}
    <rect x="188" y="15" width="74" height="92" rx="8" fill="#fed7aa" stroke="#222" strokeWidth="2"/>
    <text x="225" y="30" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#9a3412">Vektor y</text>
    <text x="225" y="50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#c2410c">y₁</text>
    <text x="225" y="68" textAnchor="middle" fontSize="10" fontWeight="600" fill="#c2410c">y₂</text>
    <text x="225" y="86" textAnchor="middle" fontSize="10" fontWeight="600" fill="#c2410c">y₃</text>
    <text x="225" y="100" textAnchor="middle" fontSize="8" fontWeight="600" fill="#9a3412">Hasil Maju</text>

    {/* Banner Bawah */}
    <rect x="25" y="118" width="230" height="24" rx="5" fill="#2563eb" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="134" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#fff">Substitusi Mundur: U · x = y (Bebas Bagi!)</text>
   </g>}

   {/* Slide 7: Contoh Crout 3x3 */}
   {index===7&&<g>
    <rect x="25" y="20" width="105" height="50" rx="8" fill="#e0f2fe" stroke="#222" strokeWidth="1.5"/>
    <text x="77" y="42" textAnchor="middle" fontSize="11" fill="#0369a1">L · y = b</text>
    <text x="77" y="58" textAnchor="middle" fontSize="10" fill="#075985">y = [6, -1, 3]ᵀ</text>
    <path d="M 130 45 L 150 45 L 150 85 L 155 85" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="155" y="65" width="105" height="50" rx="8" fill="#dcfce7" stroke="#222" strokeWidth="1.5"/>
    <text x="207" y="87" textAnchor="middle" fontSize="11" fill="#15803d">U · x = y</text>
    <text x="207" y="103" textAnchor="middle" fontSize="10" fill="#14532d">x = [1, 2, 3]ᵀ ★</text>
    <rect x="40" y="122" width="200" height="22" rx="4" fill="#047857"/>
    <text x="140" y="137" textAnchor="middle" fontSize="10.5" fill="#fff">Solusi Eksak &amp; Bulat</text>
   </g>}

   {/* Slide 8: Jebakan Poros Nol Crout */}
   {index===8&&<g>
    <circle cx="140" cy="55" r="42" fill="#fee2e2" stroke="#dc2626" strokeWidth="2.5"/>
    <path d="M 140 28 L 140 62" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round"/>
    <circle cx="140" cy="74" r="4" fill="#b91c1c"/>
    <rect x="35" y="112" width="210" height="26" rx="6" fill="#ef4444" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="129" textAnchor="middle" fontSize="11" fill="#fff">Poros lₖₖ = 0 (Pembagian Nol)</text>
   </g>}

   {/* Slide 9: Dekomposisi Cholesky A = L · L^T */}
   {index===9&&<g>
    <rect x="30" y="20" width="85" height="75" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2.5"/>
    <text x="72" y="65" textAnchor="middle" fontSize="26" fill="#065f46">L</text>
    <text x="140" y="65" textAnchor="middle" fontSize="22" fill="#222">×</text>
    <rect x="165" y="20" width="85" height="75" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2.5"/>
    <text x="207" y="65" textAnchor="middle" fontSize="26" fill="#065f46">Lᵀ</text>
    <line x1="140" y1="18" x2="140" y2="100" stroke="#059669" strokeWidth="2" strokeDasharray="4,3"/>
    <rect x="50" y="112" width="180" height="26" rx="6" fill="#047857"/>
    <text x="140" y="129" textAnchor="middle" fontSize="12" fill="#fff">Cermin Transpos: A = L · Lᵀ</text>
   </g>}

   {/* Slide 10: Syarat Mutlak Cholesky */}
   {index===10&&<g>
    <rect x="25" y="20" width="105" height="85" rx="6" fill="#f8fafc" stroke="#222" strokeWidth="2"/>
    <text x="77" y="48" textAnchor="middle" fontSize="12" fill="#1e3a8a">1. Simetris</text>
    <text x="77" y="78" textAnchor="middle" fontSize="14" fill="#2563eb">A = Aᵀ</text>
    <rect x="150" y="20" width="105" height="85" rx="6" fill="#ecfdf5" stroke="#222" strokeWidth="2"/>
    <text x="202" y="48" textAnchor="middle" fontSize="12" fill="#065f46">2. Definit Positif</text>
    <text x="202" y="78" textAnchor="middle" fontSize="14" fill="#059669">xᵀ A x &gt; 0</text>
    <rect x="40" y="118" width="200" height="24" rx="5" fill="#166534"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fill="#fff">Dua Syarat Mutlak Terpenuhi</text>
   </g>}

   {/* Slide 11: Algoritma Akar Diagonal Cholesky */}
   {index===11&&<g>
    <rect x="25" y="15" width="230" height="90" rx="8" fill="#f0fdf4" stroke="#222" strokeWidth="2"/>
    <text x="140" y="45" textAnchor="middle" fontSize="18" fill="#15803d">lⱼⱼ = √(aⱼⱼ - ∑ lⱼₖ²)</text>
    <text x="140" y="75" textAnchor="middle" fontSize="10.5" fill="#475569">Akar kuadrat selalu riil jika definit positif</text>
    <rect x="25" y="116" width="230" height="24" rx="5" fill="#059669" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="132" textAnchor="middle" fontSize="11" fill="#fff">Akar Diagonal Khusus Cholesky</text>
   </g>}

   {/* Slide 12: Efisiensi 50% Memori & Kecepatan 2x */}
   {index===12&&<g>
    <rect x="26" y="18" width="100" height="88" rx="8" fill="#fee2e2" stroke="#222" strokeWidth="2"/>
    <text x="76" y="44" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#991b1b">LU Biasa</text>
    <text x="76" y="70" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#b91c1c">n³ / 3 Ops</text>
    <text x="76" y="88" textAnchor="middle" fontSize="9.5" fill="#7f1d1d">100% Beban</text>
    <circle cx="140" cy="62" r="13" fill="#f1f5f9" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="66" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">VS</text>
    <rect x="154" y="18" width="100" height="88" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2"/>
    <text x="204" y="44" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#065f46">Cholesky</text>
    <text x="204" y="70" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#047857">n³ / 6 Ops</text>
    <text x="204" y="88" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#059669">Hemat 50%</text>
    <rect x="30" y="118" width="220" height="24" rx="6" fill="#047857"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">⚡ 2× Lebih Cepat &amp; Hemat 50% RAM</text>
   </g>}

   {/* Slide 13: Contoh Cholesky 3x3 */}
   {index===13&&<g>
    <rect x="25" y="20" width="105" height="50" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="1.5"/>
    <text x="77" y="42" textAnchor="middle" fontSize="11" fill="#065f46">L · y = b</text>
    <text x="77" y="58" textAnchor="middle" fontSize="10" fill="#047857">y = [1, 7, -1]ᵀ</text>
    <path d="M 130 45 L 150 45 L 150 85 L 155 85" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="155" y="65" width="105" height="50" rx="8" fill="#dbeafe" stroke="#222" strokeWidth="1.5"/>
    <text x="207" y="87" textAnchor="middle" fontSize="11" fill="#1e40af">Lᵀ · x = y</text>
    <text x="207" y="103" textAnchor="middle" fontSize="10" fill="#1d4ed8">x = [-1, 2.5, -0.5]ᵀ ★</text>
    <rect x="40" y="122" width="200" height="22" rx="4" fill="#0284c7"/>
    <text x="140" y="137" textAnchor="middle" fontSize="10.5" fill="#fff">Solusi Eksak Cholesky</text>
   </g>}

   {/* Slide 14: Jebakan Akar Negatif */}
   {index===14&&<g>
    <rect x="25" y="14" width="230" height="86" rx="8" fill="#fee2e2" stroke="#222" strokeWidth="2"/>
    <circle cx="140" cy="44" r="24" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5"/>
    <text x="140" y="51" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#b91c1c">√(-Δ)</text>
    <text x="140" y="85" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#7f1d1d">⚠️ Muncul Bilangan Imajiner (i ∉ ℝ)</text>
    <rect x="25" y="108" width="230" height="32" rx="6" fill="#dc2626" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="122" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#ffffff">Bukan Definit Positif</text>
    <text x="140" y="134" textAnchor="middle" fontSize="9.5" fill="#fecaca">→ Metode Cholesky Gagal</text>
   </g>}

   {/* Slide 15: Perbandingan Tiga Metode */}
   {index===15&&<g>
    <rect x="15" y="20" width="75" height="95" rx="6" fill="#fef3c7" stroke="#222" strokeWidth="1.5"/>
    <text x="52" y="44" textAnchor="middle" fontSize="10" fill="#92400e">Doolittle</text>
    <text x="52" y="70" textAnchor="middle" fontSize="11" fill="#78350f">lᵢᵢ = 1</text>
    <text x="52" y="95" textAnchor="middle" fontSize="8.5" fill="#b45309">Umum</text>
    <rect x="102" y="20" width="75" height="95" rx="6" fill="#e0f2fe" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="44" textAnchor="middle" fontSize="10" fill="#0369a1">Crout</text>
    <text x="140" y="70" textAnchor="middle" fontSize="11" fill="#075985">uᵢᵢ = 1</text>
    <text x="140" y="95" textAnchor="middle" fontSize="8.5" fill="#0284c7">Umum</text>
    <rect x="190" y="20" width="75" height="95" rx="6" fill="#dcfce7" stroke="#222" strokeWidth="1.5"/>
    <text x="227" y="44" textAnchor="middle" fontSize="10" fill="#166534">Cholesky</text>
    <text x="227" y="70" textAnchor="middle" fontSize="11" fill="#14532d">A = L · Lᵀ</text>
    <text x="227" y="95" textAnchor="middle" fontSize="8.5" fill="#15803d">Simetris Definit</text>
   </g>}

   {/* Slide 16: Tantangan Esai HOTS */}
   {index===16&&<g>
    <rect x="35" y="22" width="210" height="96" rx="8" fill="#fef3c7" stroke="#222" strokeWidth="2.5"/>
    <text x="140" y="52" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350f">TANTANGAN ESAI HOTS</text>
    <text x="140" y="78" textAnchor="middle" fontSize="11" fill="#222">3 Soal Analitis C6 &amp; SPL Lab</text>
    <text x="140" y="100" textAnchor="middle" fontSize="10" fill="#ea580c">Crout · Cholesky · Sylvester</text>
   </g>}

   {/* Slide 17: Penutup Kelompok 4 */}
   {index===17&&<g>
    <rect x="25" y="20" width="65" height="85" rx="8" fill="#feebc8" stroke="#222" strokeWidth="2"/>
    <text x="57" y="55" textAnchor="middle" fontSize="24">👨‍💻</text>
    <text x="57" y="85" textAnchor="middle" fontSize="11" fill="#7c2d12">Ryan</text>
    <rect x="107" y="20" width="65" height="85" rx="8" fill="#ffbdc4" stroke="#222" strokeWidth="2"/>
    <text x="140" y="55" textAnchor="middle" fontSize="24">👩‍🏫</text>
    <text x="140" y="85" textAnchor="middle" fontSize="11" fill="#831843">Najla</text>
    <rect x="190" y="20" width="65" height="85" rx="8" fill="#bee3f8" stroke="#222" strokeWidth="2"/>
    <text x="222" y="55" textAnchor="middle" fontSize="24">👩‍💼</text>
    <text x="222" y="85" textAnchor="middle" fontSize="11" fill="#1e3a8a">Nabila</text>
    <rect x="35" y="118" width="210" height="24" rx="5" fill="#059669" stroke="#222" strokeWidth="1"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fill="#fff">Kelompok 4 Siap Presentasi</text>
   </g>}
  </svg>
 </div>
}

function Team(){
 return <section className="team">
  <div className="team-identity" style={{textAlign:'center',justifyContent:'center'}}>
   <Users/>
   <div>
    <small>IDENTITAS MATA KULIAH · {identity.group.toUpperCase()}</small>
    <h2>{identity.course}</h2>
    <p>{identity.code} · {identity.program} · {identity.meeting}</p>
    <p>{identity.faculty}</p>
    <strong>{identity.topic}</strong>
   </div>
  </div>
  <div className="profiles">
   {members.map(([name,npm],i)=><article className={`member-color-${i}`} key={npm}>
    <span className="profile-mark"><User aria-hidden="true"/></span>
    <div><strong>{name}</strong><span>NPM {npm}</span></div>
    <span className="member-badge">{name==='Ryan Wardiana'?'Ketua / Lead':'Anggota'}</span>
   </article>)}
  </div>
 </section>
}

function Knowledge(){
 const terms=[
  ['Dekomposisi Reduksi Crout','Pemfaktoran A = L · U dengan menetapkan elemen diagonal utama matriks segitiga atas U bernilai 1.','u_{ii} = 1'],
  ['Dekomposisi Cholesky','Pemfaktoran khusus matriks simetris definit positif menjadi A = L · Lᵀ (U identik transpos L).','A = L \cdot L^T'],
  ['Matriks Simetris','Matriks bujursangkar yang nilainya sama persis dengan matriks transposnya.','A = A^T \iff a_{ij} = a_{ji}'],
  ['Definit Positif','Sifat matriks di mana perkalian bentuk kuadrat xᵀ A x bernilai positif murni untuk semua vektor tak-nol x.','\mathbf{x}^T A \mathbf{x} > 0,\ \forall \mathbf{x} \ne \mathbf{0}'],
  ['Kriteria Sylvester (Minor Utama)','Pengujian definit positif dengan memastikan seluruh determinan submatriks utama berurutan bernilai positif.','\det(A_k) > 0,\ k=1,\dots,n'],
  ['Dekomposisi LU Doolittle','Metode faktorisasi LU standar dengan menetapkan elemen diagonal matriks segitiga bawah L bernilai 1.','l_{ii} = 1'],
  ['Substitusi Maju Crout & Cholesky','Menyelesaikan L y = b dari atas ke bawah untuk memperoleh vektor perantara y.','L\mathbf{y} = \mathbf{b}'],
  ['Substitusi Mundur Crout & Cholesky','Menyelesaikan U x = y (atau Lᵀ x = y) dari baris terbawah ke teratas untuk solusi akhir x.','U\mathbf{x} = \mathbf{y} \quad / \quad L^T\mathbf{x} = \mathbf{y}']
 ];
 const refs=[
  'Munir, Rinaldi. (2015). Metode Numerik (Revisi). Informatika Bandung. (Bab 4: Solusi Sistem Persamaan Lanjar, Sub-bab 4.5.2 Metode Reduksi Crout).',
  'Chapra, S. C., & Canale, R. P. (2015). Numerical Methods for Engineers (7th ed.). McGraw-Hill Education.',
  'Burden, R. L., & Faires, J. D. (2010). Numerical Analysis (9th ed.). Brooks/Cole.'
 ];
 return <section className="knowledge">
  <div className="pagehead">
   <div><small>GLOSARIUM &amp; REFERENSI</small><h1>Konsep Crout &amp; Cholesky</h1></div>
  </div>
  <div className="terms">
   {terms.map(([title,desc,math])=><article key={title}>
    <div><strong>{title}</strong><p>{desc}</p></div>
    <div className="math-badge"><InlineMath math={math}/></div>
   </article>)}
  </div>
  <div className="references">
   <h2>Buku Acuan &amp; Rujukan Resmi</h2>
   <ol>{refs.map(r=><li key={r}>{r}</li>)}</ol>
  </div>
 </section>
}
export default function App(){
 const [tab,setTab]=useState<'deck'|'lab'|'team'|'knowledge'>('deck');
 return <div className="app">
  <header>
   <div className="brand-unsil">
    <img src="/unsil_emblem.png" alt="Logo Universitas Siliwangi" className="unsil-header-logo"/>
    <span>Universitas Siliwangi</span>
   </div>
   <div className="badge">{identity.group.toUpperCase()} · {identity.meeting.toUpperCase()}</div>
   <div className="session">{identity.course}</div>
  </header>

  <nav>
   <button className={tab==='deck'?'active':''} onClick={()=>setTab('deck')}><Presentation/> Deck</button>
   <button className={tab==='lab'?'active':''} onClick={()=>setTab('lab')}><FlaskConical/> Numerical Lab</button>
   <button className={tab==='team'?'active':''} onClick={()=>setTab('team')}><Users/> Kelompok 4</button>
   <button className={tab==='knowledge'?'active':''} onClick={()=>setTab('knowledge')}><BookOpen/> Knowledge</button>
  </nav>

  <main>
   {tab==='deck'&&<SlideDeck/>}
   {tab==='lab'&&<Lab/>}
   {tab==='team'&&<Team/>}
   {tab==='knowledge'&&<Knowledge/>}
  </main>

  <footer>
   <span>{identity.course} · {identity.group} ({identity.meeting}) · FKIP Universitas Siliwangi</span>
  </footer>
 </div>
}
