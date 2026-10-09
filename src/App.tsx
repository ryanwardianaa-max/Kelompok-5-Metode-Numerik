import {useCallback,useEffect,useState} from 'react'
import {BlockMath,InlineMath} from 'react-katex'
import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Film,
  FlaskConical,
  Layers,
  Play,
  Presentation,
  User,
  Users,
  Zap
} from 'lucide-react'
import {
  solveGauss,
  solveLUGauss,
  solveCrout,
  solveCholesky,
  type GaussResult,
  type LUResult,
  type CholeskyResult
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
  'Doolittle: Diagonal L = 1, diagonal U bebas (standar LU Gauss).',
  'Crout: Diagonal U = 1, diagonal L bebas. Cholesky: Khusus simetris definit positif, A = L · Lᵀ.'
 ]],
 ['Metode Reduksi Crout','A = L \\cdot U,\\quad u_{ii} = 1',[
  'Metode Crout mengunci semua elemen diagonal utama matriks segitiga atas U bernilai tepat 1.',
  'Matriks segitiga bawah L memuat elemen diagonal bebas yang menanggung bobot pembagian numerik.'
 ]],
 ['Algoritma Rekursif Crout','l_{ik} = a_{ik} - \\sum l_{im}u_{mk},\\quad u_{kj} = \\frac{a_{kj} - \\sum l_{km}u_{mj}}{l_{kk}}',[
  'Pola pengerjaan teratur: Tentukan kolom ke-k matriks L, lalu tentukan baris ke-k matriks U.',
  'Langkah bergantian kolom-baris ini berlanjut dari k = 1 hingga k = n tanpa perlu eliminasi baris manual.'
 ]],
 ['Tahap 1: Substitusi Maju Crout','L\\mathbf{y} = \\mathbf{b}',[
  'Menyelesaikan sistem segitiga bawah L y = b dari baris teratas (i = 1) ke baris terbawah (i = n).',
  'Karena l_ii ≠ 1 pada Crout, setiap elemen y_i dihitung dengan pembagian: y_i = (b_i - ∑ l_ij y_j) / l_ii.'
 ]],
 ['Tahap 2: Substitusi Mundur Crout','U\\mathbf{x} = \\mathbf{y},\\quad u_{ii} = 1',[
  'Menyelesaikan sistem segitiga atas U x = y dari baris terbawah (i = n) ke baris teratas (i = 1).',
  'Karena diagonal U tepat 1, tidak ada pembagian pada tahap ini: x_i = y_i - ∑ u_ij x_j.'
 ]],
 ['Contoh Numerik Crout 3×3','A\\mathbf{x} = \\mathbf{b} \\implies \\mathbf{x} = [1, 2, 3]^T',[
  'Simulasi lengkap pemfaktoran Crout pada matriks 3x3 dengan solusi eksak bulat dan residu nol.'
 ]],
 ['Jebakan Poros Nol pada Crout','l_{kk} = 0 \\implies \\text{Pembagian Nol}',[
  'Jika elemen diagonal L bernilai nol (l_kk = 0), rumus baris U akan mengalami pembagian dengan nol.',
  'Pencegahan: Lakukan pertukaran baris (pivoting) pada matriks awal A sebelum menerapkan algoritma Crout.'
 ]],
 ['Metode Dekomposisi Cholesky','A = L \\cdot L^T',[
  'Faktorisasi khusus untuk matriks bujursangkar simetris dan definit positif.',
  'Matriks atas U tidak perlu dicari terpisah karena U identik dengan transpos L, yaitu U = Lᵀ.'
 ]],
 ['Syarat Mutlak Metode Cholesky','A = A^T \\quad \\& \\quad \\mathbf{x}^T A \\mathbf{x} > 0',[
  '1. Simetris: Elemen a_ij harus sama persis dengan a_ji.',
  '2. Definit Positif: Semua determinan submatriks utama (kriteria Sylvester) bernilai positif strictly > 0.'
 ]],
 ['Algoritma Faktorisasi Cholesky','l_{jj} = \\sqrt{a_{jj} - \\sum l_{jk}^2}',[
  'Elemen diagonal L dihitung menggunakan akar kuadrat dari selisih koefisien asal dengan kuadrat elemen sebelumnya.',
  'Elemen di bawah diagonal diperoleh dengan membagi selisih produk silang terhadap elemen diagonal l_jj.'
 ]],
 ['Efisiensi Komputasi Cholesky','50\\% \\text{ Lebih Hemat Memori & Waktu}',[
  'Hanya perlu menyimpan satu matriks segitiga L (hemat memori 50%).',
  'Jumlah operasi perkalian/pembagian hanya sekitar n³/6, dua kali lebih cepat dibanding Gauss/Doolittle/Crout.'
 ]],
 ['Contoh Numerik Cholesky 3×3','A = L \\cdot L^T \\implies \\mathbf{x} = [-1, 2.5, -0.5]^T',[
  'Simulasi pemfaktoran sistem simetris definit positif 3x3 dengan akurasi tinggi dan residu mendekati nol.'
 ]],
 ['Jebakan Fatal: Bilangan Non-Positif dalam Akar','a_{jj} - \\sum l_{jk}^2 \\le 0 \\implies \\text{Gagal Cholesky}',[
  'Jika matriks tidak definit positif, nilai di dalam akar menjadi negatif atau nol (menghasilkan bilangan imajiner).',
  'Algoritma komputer akan melempar galat domain matematika jika matriks gagal memenuhi syarat definit positif.'
 ]],
 ['Perbandingan Komparatif Tiga Metode','\\text{Doolittle vs Crout vs Cholesky}',[
  'Doolittle: Umum, l_ii = 1. Crout: Umum, u_ii = 1 (cocok bila substitusi balik dioptimalkan).',
  'Cholesky: Spesifik simetris definit positif, paling cepat dan paling stabil secara numerik.'
 ]],
 ['Latihan & Kuis Interaktif','\\text{Kuis Konseptual: } 3\\text{ Babak}',[
  'Uji pemahaman konsep: Diagonal Crout, syarat Cholesky, dan analisis efisiensi komputasi numerik.'
 ]],
 ['Kesimpulan & Pembagian Peran Kelompok 4','A = L \\cdot U \\quad \\longleftrightarrow \\quad A = L \\cdot L^T',[
  'Kelompok 4 siap mempresentasikan Dekomposisi Crout & Cholesky secara interaktif.',
  'Ryan: Konsep Teori & Demo Lab, Najla: Metode Crout, Nabila: Metode Cholesky & Tanya Jawab.'
 ]]
] as const

const examples={
 'Contoh Metode Reduksi Crout':{
  prompt:[
   '\\begin{bmatrix} 1 & 1 & 1 \\\\ 2 & 3 & 1 \\\\ 1 & -1 & -1 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 6 \\\\ 11 \\\\ -4 \\end{bmatrix}',
   '\\text{Faktorkan } A = L \\cdot U \\text{ dengan syarat } u_{ii} = 1 \\text{ (Metode Crout)}'
  ],
  steps:[
   [
    '\\text{Langkah 1: Kolom 1 matriks } L \\text{ sama dengan kolom 1 matriks } A:',
    'l_{11} = 1, \\quad l_{21} = 2, \\quad l_{31} = 1',
    '\\text{Baris 1 matriks } U \\text{ dibagi dengan } l_{11} = 1:',
    'u_{12} = \\frac{1}{1} = 1, \\quad u_{13} = \\frac{1}{1} = 1 \\quad (u_{11} = 1)'
   ],
   [
    '\\text{Langkah 2: Kolom 2 matriks } L \\text{ dan Baris 2 matriks } U:',
    'l_{22} = a_{22} - (l_{21} u_{12}) = 3 - (2)(1) = 1',
    'l_{32} = a_{32} - (l_{31} u_{12}) = -1 - (1)(1) = -2',
    'u_{23} = \\frac{a_{23} - l_{21} u_{13}}{l_{22}} = \\frac{1 - (2)(1)}{1} = -1 \\quad (u_{22} = 1)'
   ],
   [
    '\\text{Langkah 3: Kolom 3 matriks } L:',
    'l_{33} = a_{33} - (l_{31} u_{13} + l_{32} u_{23}) = -1 - [(1)(1) + (-2)(-1)] = -1 - 3 = -4',
    'L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ 1 & -2 & -4 \\end{bmatrix}, \\quad U = \\begin{bmatrix} 1 & 1 & 1 \\\\ 0 & 1 & -1 \\\\ 0 & 0 & 1 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 4: Tahap 1 Substitusi Maju } L\\mathbf{y} = \\mathbf{b}:',
    '1 y_1 = 6 \\implies y_1 = 6',
    '2(6) + 1 y_2 = 11 \\implies y_2 = 11 - 12 = -1',
    '1(6) - 2(-1) - 4 y_3 = -4 \\implies 8 - 4 y_3 = -4 \\implies y_3 = 3',
    '\\mathbf{y} = \\begin{bmatrix} 6 \\\\ -1 \\\\ 3 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 5: Tahap 2 Substitusi Mundur } U\\mathbf{x} = \\mathbf{y}:',
    'x_3 = 3',
    'x_2 - 1(3) = -1 \\implies x_2 = 2',
    'x_1 + 1(2) + 1(3) = 6 \\implies x_1 = 1',
    '\\mathbf{x} = \\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}'
   ]
  ],
  conclusion:['Solusi eksak metode Crout adalah ', '\\mathbf{x} = \\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}', '. Terbukti memenuhi seluruh persamaan sistem dengan residu nol!']
 },
 'Contoh Metode Dekomposisi Cholesky':{
  prompt:[
   '\\begin{bmatrix} 4 & 2 & -2 \\\\ 2 & 10 & 2 \\\\ -2 & 2 & 6 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 22 \\\\ 4 \\end{bmatrix}',
   '\\text{Uji Simetri & Definit Positif, lalu faktorkan } A = L \\cdot L^T \\text{ (Cholesky)}'
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

function StepExample({data}:{data:(typeof examples)[keyof typeof examples]}){
 const [step,setStep]=useState(0);
 return <div className="example">
  <div className="example-prompt">{data.prompt.map(line=><BlockMath math={line} key={line}/>)}</div>
  <div className="step">
   <small>LANGKAH {step + 1} DARI {data.steps.length}</small>
   {data.steps[step].map(line=><BlockMath math={line} key={line}/>)}
  </div>
  {'conclusion' in data&&step===data.steps.length-1&&<div className="conclusion">
   <strong>Kesimpulan Matematis</strong>
   <p>{data.conclusion.map((part,n)=>n%2?<InlineMath math={part} key={part}/>:part)}</p>
  </div>}
  <div className="step-controls">
   <button disabled={!step} onClick={()=>setStep(step-1)}><ChevronLeft/>Langkah Sebelumnya</button>
   <button disabled={step===data.steps.length-1} onClick={()=>setStep(step+1)}>Langkah Berikutnya<ChevronRight/></button>
  </div>
 </div>
}

const questions=[
 {
  prompt:'\\text{Pada Dekomposisi LU metode Reduksi Crout, komponen manakah yang diagonal utamanya bernilai 1?}',
  options:['Matriks segitiga bawah L (l_{ii} = 1)', 'Matriks segitiga atas U (u_{ii} = 1)', 'Matriks koefisien asal A (a_{ii} = 1)', 'Vektor ruas kanan b (b_i = 1)'],
  answer:1
 },
 {
  prompt:'\\text{Apa dua syarat mutlak matriks A agar dapat difaktorkan dengan Dekomposisi Cholesky } A = L \\cdot L^T\\text{?}',
  options:['Matriks diagonal dan determinannya 0', 'Matriks harus simetris (A = A^T) dan definit positif (x^T A x > 0)', 'Matriks harus ortogonal dan berordo ganjil', 'Matriks segitiga atas dan berdeterminan 1'],
  answer:1
 },
 {
  prompt:'\\text{Mengapa metode Cholesky kira-kira 2 kali lebih cepat dibanding metode LU biasa (Doolittle/Crout)?}',
  options:['Karena tidak memerlukan proses substitusi maju', 'Karena hanya perlu menghitung matriks L; penutup atasnya cukup transpos L^T tanpa hitung ulang', 'Karena semua nilai koefisiennya langsung bernilai nol', 'Karena determinannya selalu bernilai konstan'],
  answer:1
 }
] as const

function QuizExplanation({question}:{question:number}){
 return <p>{
  question===0?<>Metode Crout mengunci diagonal matriks segitiga atas <InlineMath math="U"/> bernilai 1 (<InlineMath math="u_{ii} = 1"/>), sehingga matriks segitiga bawah <InlineMath math="L"/> menampung seluruh beban pembagian elemen.</>:
  question===1?<>Cholesky mensyaratkan matriks <InlineMath math="A"/> harus simetris (<InlineMath math="A = A^T"/>) dan definit positif (<InlineMath math="\\mathbf{x}^T A \\mathbf{x} > 0"/>). Jika tidak definit positif, nilai di dalam akar kuadrat akan bernilai negatif sehingga komputasi gagal.</>:
  <>Karena matriks atas <InlineMath math="U = L^T"/> identik dengan transpos dari <InlineMath math="L"/>, algoritma tidak perlu menghitung atau menyimpan matriks kedua secara terpisah. Ini menghemat memori 50% dan memangkas operasi perkalian/pembagian menjadi <InlineMath math="n^3 / 6"/>.</>
 }</p>
}

function Quiz({answers,onChange}:{answers:(number|undefined)[];onChange:(answers:(number|undefined)[])=>void}){
 return <div className="quiz">
  {questions.map((q,n)=>{
   const picked=answers[n];
   return <article key={q.prompt}>
    <small>PERTANYAAN {n+1} DARI {questions.length}</small>
    <BlockMath math={q.prompt}/>
    <div className="options">
     {q.options.map((opt,idx)=>{
      const isPicked=picked===idx,isCorrect=idx===q.answer;
      return <button
       key={opt}
       className={picked!==undefined?isCorrect?'correct':isPicked?'wrong':'':''}
       onClick={()=>picked===undefined&&onChange(answers.map((x,i)=>i===n?idx:x))}
      >
       <span>{String.fromCharCode(65+idx)}.</span> {opt}
      </button>
     })}
    </div>
    {picked!==undefined&&<div className={`feedback ${picked===q.answer?'correct':'wrong'}`}>
     <strong>{picked===q.answer?'Jawaban Anda Benar!':'Jawaban Belum Tepat'}</strong>
     <QuizExplanation question={n}/>
    </div>}
   </article>
  })}
 </div>
}

function SlideDeck(){
 const [i,setI]=useState(0),last=slides.length-1,[open,setOpen]=useState(false),[answers,setAnswers]=useState<(number|undefined)[]>(Array(questions.length).fill(undefined));
 const move=useCallback((to:number)=>setI(Math.max(0,Math.min(last,to))),[last]);

 const score=answers.filter((ans,idx)=>ans===questions[idx].answer).length;

 useEffect(()=>{
  const k=(e:KeyboardEvent)=>{
   if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();move(i+1)}
   if(e.key==='ArrowLeft'){e.preventDefault();move(i-1)}
  };
  addEventListener('keydown',k);
  return()=>removeEventListener('keydown',k)
 },[i,move]);

 const slide=slides[i],
  isHook=i===1,
  example=examples[slide[0] as keyof typeof examples],
  quiz=slide[0]==='Latihan & Kuis Interaktif',
  fullWidth=i===0||isHook||Boolean(example),
  special=isHook||Boolean(example)||quiz;

 return <section className="deck">
  <article className={`slide ${i===0?'cover-slide':''} ${special?'special':''} ${fullWidth?'full-width':''}`}>
   <div className="progress" style={{width:`${(i+1)/slides.length*100}%`}}/>
   <div>
    <small>METODE NUMERIK · SLIDE {i+1} DARI {slides.length}</small>
    <h1>{slide[0]}</h1>
    {i===0?<Cover/>:isHook?<HookSection/>:example?<StepExample key={slide[0]} data={example}/>:quiz?<Quiz answers={answers} onChange={setAnswers}/>:<><BlockMath math={slide[1]}/><ul>{slide[2].map(x=><li key={x}>{x}</li>)}</ul></>}
   </div>
   {!fullWidth&&<aside className={special?'compact-visual':''}>
    <SlideVisual index={i} score={score}/>
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

// Interactive Hook: Real-world engineering context (Warren Truss Bridge & Load Scenarios)
function HookSection() {
  const [tab, setTab] = useState<'sim' | 'video' | 'analogi'>('sim');
  const [scenario, setScenario] = useState<'truk' | 'angin' | 'gempa'>('truk');
  const [isVibrating, setIsVibrating] = useState(false);
  const [solveCount, setSolveCount] = useState(1);
  const [gaussOps, setGaussOps] = useState(666_666_667);
  const [gaussBusy, setGaussBusy] = useState(false);

  const NODES: [number, number, string][] = [
    [50, 145, '0'], [175, 145, '1'], [300, 145, '2'], [425, 145, '3'], [550, 145, '4'],
    [112.5, 65, '5'], [237.5, 65, '6'], [362.5, 65, '7'], [487.5, 65, '8']
  ];
  const EDGES: [string, string][] = [
    ['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'],
    ['5', '6'], ['6', '7'], ['7', '8'],
    ['0', '5'], ['5', '1'], ['1', '6'], ['6', '2'], ['2', '7'], ['7', '3'], ['3', '8'], ['8', '4']
  ];
  const DEFORM: Record<string, Record<string, [number, number]>> = {
    truk:  { '1': [0, 7],  '2': [0, 15], '3': [0, 7], '5': [0, 3], '6': [0, 8], '7': [0, 5], '8': [0, 2] },
    angin: { '5': [16, -3], '6': [19, -4], '7': [17, -3], '8': [15, -2], '1': [6, 0], '2': [9, 1], '3': [6, 0] },
    gempa: { '0': [7, 0], '4': [-7, 0], '5': [11, -1], '6': [14, 2], '7': [11, -1], '8': [9, 0], '1': [5, 1], '2': [8, 4], '3': [5, 1] }
  };
  const nodePos = (id: string): [number, number] => {
    const base = NODES.find(n => n[2] === id)!;
    const d = DEFORM[scenario][id];
    return [base[0] + (d ? d[0] : 0), base[1] + (d ? d[1] : 0)];
  };
  const fmt = (n: number) => n.toLocaleString('id-ID');
  const cholTotal = 333_333_333 + solveCount * 1_000_000;

  const triggerLoad = (scen: 'truk' | 'angin' | 'gempa') => {
    setScenario(scen);
    setIsVibrating(true);
    setSolveCount(prev => prev + 1);
    setGaussOps(prev => prev + 666_666_667);
    setGaussBusy(true);
    setTimeout(() => setIsVibrating(false), 850);
    setTimeout(() => setGaussBusy(false), 1300);
  };

  const scenarioData = {
    truk: {
      title: 'Truk Kontainer 40 Ton Melintas',
      targetNode: 'Node 2 (Gelagar Tengah Bawah)',
      forceVector: 'F_y = -392 \\text{ kN} \\quad (\\text{Beban Terpusat})',
      arrowColor: '#f59e0b',
      desc: 'Beban gravitasi mendadak di bentang tengah menyebabkan defleksi vertikal maksimum.',
      delta: '15.0 mm ↓ di Node 2',
      xvec: '[0, 7.2, 15.0, 7.2, 0, 3.1, 8.4, 5.0, 2.3]',
      btnLabel: '🚚 Beban Truk 40T'
    },
    angin: {
      title: 'Hembusan Angin Badai 95 km/jam',
      targetNode: 'Node 5, 6, 7, 8 (Rangka Atas)',
      forceVector: 'F_x = +180 \\text{ kN} \\quad (\\text{Gaya Lateral})',
      arrowColor: '#38bdf8',
      desc: 'Tekanan geser horizontal mendorong puncak jembatan, menguji stabilitas lateral.',
      delta: '19.0 mm → di Node 6',
      xvec: '[0, 5.4, 8.6, 5.4, 0, 16.1, 19.0, 17.2, 15.0]',
      btnLabel: '🌪️ Angin Badai'
    },
    gempa: {
      title: 'Getaran Gempa Tektonik 6.2 SR',
      targetNode: 'Node 0 & 4 (Fondasi Tumpuan)',
      forceVector: 'F_{xy} = \\pm 450 \\text{ kN} \\quad (\\text{Osilasi Siklik})',
      arrowColor: '#ef4444',
      desc: 'Akselerasi gelombang seismik dari tanah mengguncang seluruh tumpuan struktur jembatan.',
      delta: '14.0 mm ↔ di Node 6',
      xvec: '[7.0, 5.1, 8.2, 5.1, -7.0, 11.0, 14.0, 11.2, 9.0]',
      btnLabel: '🌋 Getaran Gempa'
    }
  };

  const cur = scenarioData[scenario];

  return (
    <div className="hook-container">
      <div className="hook-tabs">
        <button 
          className={`hook-tab-btn ${tab === 'sim' ? 'active' : ''}`}
          onClick={() => setTab('sim')}
        >
          <Activity size={16} />
          <span>⚡ Simulasi Jembatan Interaktif</span>
        </button>
        <button 
          className={`hook-tab-btn ${tab === 'video' ? 'active' : ''}`}
          onClick={() => setTab('video')}
        >
          <Film size={16} />
          <span>🎬 Video Animasi Manim 3B1B</span>
        </button>
        <button 
          className={`hook-tab-btn ${tab === 'analogi' ? 'active' : ''}`}
          onClick={() => setTab('analogi')}
        >
          <Layers size={16} />
          <span>🏢 3 Kasus Nyata di Industri</span>
        </button>
      </div>

      {tab === 'sim' && (
        <div className="hook-sim-card">
          <div className="hook-sim-header">
            <div>
              <span className="sticker" style={{ background: '#fef08a' }}>HOOK · KENAPA DEKOMPOSISI LU?</span>
              <h3 style={{ margin: '6px 0 2px', fontSize: '1.15rem' }}>Jembatan 9 Simpul: 1 Matriks K, Beban b Ganti Terus</h3>
              <small style={{ color: '#64748b' }}>Klik beban → jembatan MENYANGGA (bentuk luruh, angka x muncul), lalu bandingkan meteran FLOPs Gauss vs Cholesky di bawah.</small>
            </div>
            <div className="scenario-controls">
              <button 
                className={`scenario-btn ${scenario === 'truk' ? 'active-truk' : ''}`}
                onClick={() => triggerLoad('truk')}
              >
                🚚 Beban Truk 40T
              </button>
              <button 
                className={`scenario-btn ${scenario === 'angin' ? 'active-angin' : ''}`}
                onClick={() => triggerLoad('angin')}
              >
                🌪️ Angin Badai
              </button>
              <button 
                className={`scenario-btn ${scenario === 'gempa' ? 'active-gempa' : ''}`}
                onClick={() => triggerLoad('gempa')}
              >
                🌋 Getaran Gempa
              </button>
              <span className="scenario-hint">Δb ≠ 0 · K tetap</span>
            </div>
          </div>

          <div className={`bridge-canvas-box ${isVibrating ? 'bridge-vibrate' : ''}`}>
            <svg viewBox="0 0 600 190" className="bridge-svg">
              <defs>
                <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <line x1="20" y1="145" x2="580" y2="145" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
              
              <polygon points="50,145 40,160 60,160" fill="#64748b" stroke="#334155" strokeWidth="2" />
              <polygon points="550,145 540,160 560,160" fill="#64748b" stroke="#334155" strokeWidth="2" />
              <circle cx="545" cy="164" r="3" fill="#475569" />
              <circle cx="555" cy="164" r="3" fill="#475569" />

              <g className="ghost-shape">
                {EDGES.map(([a, b]) => {
                  const [gx1, gy1] = NODES.find(n => n[2] === a)!;
                  const [gx2, gy2] = NODES.find(n => n[2] === b)!;
                  return <line key={`g-${a}-${b}`} x1={gx1} y1={gy1} x2={gx2} y2={gy2} />;
                })}
              </g>

              <g className="deformed-shape">
                {EDGES.map(([a, b]) => {
                  const [x1, y1] = nodePos(a);
                  const [x2, y2] = nodePos(b);
                  const isBottom = ['0','1','2','3','4'].includes(a) && ['0','1','2','3','4'].includes(b);
                  return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isBottom ? 'url(#bridgeGrad)' : '#38bdf8'} strokeWidth={isBottom ? 4 : 3} strokeLinecap="round" />;
                })}
              </g>

              {NODES.map(([bx, by, id]) => {
                const [x, y] = nodePos(id);
                const dx = x - bx, dy = y - by;
                const moved = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
                const isTarget = (scenario === 'truk' && id === '2') || (scenario === 'gempa' && (id === '0' || id === '4')) || (scenario === 'angin' && ['5','6','7','8'].includes(id));
                return (
                  <g key={id}>
                    {moved && (
                      <line x1={bx} y1={by} x2={x} y2={y} stroke={cur.arrowColor} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.9" />
                    )}
                    <circle cx={bx} cy={by} r="3" fill="none" stroke="#64748b" strokeWidth="1.2" opacity="0.75" />
                    <circle
                      cx={x}
                      cy={y}
                      r={isTarget ? 7 : 5}
                      fill={isTarget ? cur.arrowColor : '#1e293b'}
                      stroke="#fff"
                      strokeWidth="2"
                      filter={isTarget ? 'url(#glow)' : undefined}
                    />
                    <text x={x + (id === "0" ? 8 : id === "4" ? -8 : 0)} y={y > 100 ? y + 17 : y - 11} textAnchor="middle" fontSize="13" fill="#f1f5f9" fontWeight="bold" stroke="#0f172a" strokeWidth="3.5" paintOrder="stroke" strokeLinejoin="round">N{id}</text>
                  </g>
                );
              })}

              {scenario === 'truk' && (
                <g>
                  <path d="M 300 122 L 300 152" stroke={cur.arrowColor} strokeWidth="4" />
                  <polygon points="300,158 294,146 306,146" fill={cur.arrowColor} />
                  <path d="M 300 122 L 150 122 L 150 44" stroke={cur.arrowColor} strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
                  <rect x="60" y="14" width="180" height="24" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                  <text x="150" y="31" textAnchor="middle" fontSize="13" fill="#92400e" fontWeight="bold">Beban Truk b₁ (-392 kN)</text>
                </g>
              )}
              {scenario === 'angin' && (
                <g>
                  <path d="M 30 46 L 100 46" stroke={cur.arrowColor} strokeWidth="4" />
                  <polygon points="105,46 93,40 93,52" fill={cur.arrowColor} />
                  <rect x="12" y="14" width="150" height="20" rx="4" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
                  <text x="87" y="28" textAnchor="middle" fontSize="12" fill="#0369a1" fontWeight="bold">Angin Lateral b₂ (+180 kN)</text>
                </g>
              )}
              {scenario === 'gempa' && (
                <g>
                  <path d="M 20 150 L 45 150 M 555 150 L 580 150" stroke={cur.arrowColor} strokeWidth="3" strokeDasharray="3 3" />
                  <polygon points="48,150 40,146 40,154" fill={cur.arrowColor} />
                  <polygon points="552,150 560,146 560,154" fill={cur.arrowColor} />
                  <rect x="210" y="146" width="180" height="20" rx="4" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
                  <text x="300" y="160" textAnchor="middle" fontSize="10.5" fill="#991b1b" fontWeight="bold">Osilasi Seismik b₃ (±450 kN)</text>
                </g>
              )}
            </svg>
            <div className="canvas-badge-strip">
              <span><strong>Persamaan Struktur:</strong> <InlineMath math="K_{1000 \times 1000} \cdot \mathbf{x} = \mathbf{b}" /></span>
              <span className="live-trigger-badge">Uji ke-{solveCount}: {cur.title}</span>
            </div>
          </div>

          <div className="result-readout">
            <div className="readout-cell readout-delta">
              <span className="readout-label">LENTUTAN TERUKUR (hasil solve)</span>
              <strong style={{ color: cur.arrowColor }}>{cur.delta}</strong>
              <small>Garis putus-putus = bentuk awal · lingkaran kosong = posisi asli node</small>
            </div>
            <div className="readout-cell readout-x">
              <span className="readout-label">VEKTOR SOLUSI x (9 simpul)</span>
              <code>x = {cur.xvec}</code>
              <small>Dihitung Cholesky dari b = [{scenario === 'truk' ? '0,…,-392,…,0' : scenario === 'angin' ? '0,+180,…,0' : '±450,…,0'}]</small>
            </div>
          </div>

          <div className="hook-compare-grid">
            <div className={`compare-card compare-gauss ${gaussBusy ? 'is-busy' : ''}`}>
              <div className="compare-header">
                <span className="compare-tag tag-gauss">METODE GAUSS BIASA</span>
                <span className="compare-complexity">O(n³) Ulang Total</span>
              </div>
              <div className="pipeline-steps">
                <span className="pipe-step pipe-step-loop">Ganti b → HAPUS K → eliminasi ulang → solve</span>
                <span className="pipe-step pipe-step-loop">Ganti b → HAPUS K → eliminasi ulang → solve</span>
                <span className="pipe-step pipe-step-loop">Ganti b → HAPUS K → eliminasi ulang → solve</span>
              </div>
              <div className="compare-metric">
                <strong>{fmt(gaussOps)}</strong>
                <small>FLOPs kumulatif setelah {solveCount} beban (diulang penuh tiap klik)</small>
              </div>
              <div className="ops-meter">
                <div className="ops-fill ops-fill-slow" style={{ width: '100%' }} />
              </div>
              <p>Matriks jembatan <InlineMath math="K" /> dihitung ulang dari nol tiap kali beban berubah.</p>
              <div className="compare-footer status-slow">
                <span>{gaussBusy ? '⚙️ CPU: 100% — menghitung ulang…' : '⏱️ ~1.33 detik per beban'}</span>
                <span className={`status-label ${gaussBusy ? 'pulse-warn' : ''}`}>{gaussBusy ? '❌ SIBUK…' : '❌ Terlalu lambat!'}</span>
              </div>
            </div>

            <div className="compare-card compare-cholesky">
              <div className="compare-header">
                <span className="compare-tag tag-cholesky">DEKOMPOSISI LU / CHOLESKY</span>
                <span className="compare-complexity">O(n²) Substitusi Kilat</span>
              </div>
              <div className="pipeline-steps">
                <span className="pipe-step pipe-step-once">1× Faktorisasi K = L·Lᵀ (sekali, terkunci 🔒)</span>
                <span className="pipe-step pipe-step-fast">b baru → maju Ly=b → mundur Lᵀx=y ✓</span>
                <span className="pipe-step pipe-step-fast">b baru → maju Ly=b → mundur Lᵀx=y ✓</span>
              </div>
              <div className="compare-metric">
                <strong style={{ color: '#059669' }}>{fmt(cholTotal)}</strong>
                <small>FLOPs kumulatif setelah {solveCount} beban (faktor sekali 333 jt + 1 jt/beban)</small>
              </div>
              <div className="ops-meter">
                <div className="ops-fill ops-fill-fast" style={{ width: `${Math.max(2, (cholTotal / gaussOps) * 100)}%` }} />
              </div>
              <p><InlineMath math="K" /> difaktorkan sekali; tiap beban baru hanya substitusi.</p>
              <div className="compare-footer status-fast">
                <span>⚡ ~2 milidetik per beban</span>
                <span className="status-label">✓ Siap beban berikutnya</span>
              </div>
            </div>
          </div>

          <div className="hook-speedup-banner">
            <div className="speedup-lead">
              <Zap size={22} className="zap-icon" />
              <div>
                <strong>SELISIH KUMULATIF: {fmt(gaussOps - cholTotal)} FLOPs TERBUANG {gaussBusy ? '— GAUSS MASIH MENGHITUNG…' : 'SIA-SIA'}</strong>
                <p>Gauss menghitung ulang {fmt(666_666_667)} FLOPs tiap beban. Cholesky cukup {fmt(1_000_000)} FLOPs + faktorisasi sekali di awal. Matriks kekakuan selalu simetris definit positif → Cholesky standar baku rekayasa gempa.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'video' && (
        <div className="hook-video-card">
          <div className="video-player-frame">
            <video 
              src="/videos/hook_dekomposisi_lu.mp4" 
              controls 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="manim-video-element"
            />
          </div>
          <div className="video-meta-box">
            <div className="video-meta-head">
              <span className="sticker" style={{ background: '#c7d2fe' }}>ANIMASI 3BLUE1BROWN (MANIM CE)</span>
              <span className="creator-watermark">Karya: @librayn</span>
            </div>
            <h4>Visualisasi Pemisahan Matriks Struktur vs Vektor Beban Dinamis</h4>
            <p>
              Animasi memperlihatkan bagaimana matriks kekakuan jembatan <InlineMath math="K" /> tetap kokoh berada di memori, sementara beban gempa dinamis <InlineMath math="\mathbf{b}" /> diselesaikan seketika lewat cetakan segitiga <InlineMath math="L" /> dan <InlineMath math="L^T" />.
            </p>
          </div>
        </div>
      )}

      {tab === 'analogi' && (
        <div className="hook-analogi-grid">
          <article className="analogi-card">
            <div className="analogi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>🏢</div>
            <h4>1. Gedung & Jembatan Tahan Gempa (Cholesky)</h4>
            <p>
              Matriks kekakuan struktur <InlineMath math="K" /> bernilai <strong>simetris definit positif</strong>. Sensor IoT mengirimkan getaran gempa setiap 10 ms. Dekomposisi Cholesky memungkinkan peredam aktif merespons sebelum struktur roboh.
            </p>
          </article>
          <article className="analogi-card">
            <div className="analogi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>🗺️</div>
            <h4>2. Server Navigasi & Rute Macet (Crout / LU)</h4>
            <p>
              Topologi jalan raya suatu kota (matriks <InlineMath math="A" />) konstan. Yang berubah tiap menit adalah kepadatan kendaraan (<InlineMath math="\mathbf{b}" />). Server Google Maps/Waze memfaktorkan graf sekali, lalu menghitung rute tercepat jutaan pengguna.
            </p>
          </article>
          <article className="analogi-card">
            <div className="analogi-icon" style={{ background: '#dcfce7', color: '#166534' }}>🛰️</div>
            <h4>3. Radar Cuaca & Dinamika Fluida (BMKG)</h4>
            <p>
              Kisi diskritisasi atmosfer bumi tidak pernah berpindah posisi. Perubahan tekanan udara, kelembapan, dan arah angin dipecahkan melalui pemfaktoran matriks berskala masif secara kontinu.
            </p>
          </article>
        </div>
      )}
    </div>
  );
}

// Numerical Lab: Dedicated SPL Solver for Crout, Cholesky, LU Doolittle, and Gauss
function Lab(){
 const [matrixMode, setMatrixMode] = useState<'crout' | 'cholesky' | 'lu' | 'gauss'>('crout');
 const [pivoting, setPivoting] = useState<boolean>(true);
 const [dim, setDim] = useState<number>(3);
 
 const [matrixA, setMatrixA] = useState<number[][]>([
  [1, 1, 1],
  [2, 3, 1],
  [1, -1, -1]
 ]);
 const [vectorB, setVectorB] = useState<number[]>([6, 11, -4]);

 const [croutOut, setCroutOut] = useState<LUResult | null>(null);
 const [choleskyOut, setCholeskyOut] = useState<CholeskyResult | null>(null);
 const [gaussOut, setGaussOut] = useState<GaussResult | null>(null);
 const [luOut, setLuOut] = useState<LUResult | null>(null);
 const [errText, setErrText] = useState<string>('');

 const setPreset = (presetA: number[][], presetB: number[], mode: 'crout' | 'cholesky' | 'lu' | 'gauss' = 'crout') => {
  setDim(presetA.length);
  setMatrixA(presetA);
  setVectorB(presetB);
  setMatrixMode(mode);
  setCroutOut(null);
  setCholeskyOut(null);
  setGaussOut(null);
  setLuOut(null);
  setErrText('');
 };

 const runSolve = () => {
  setErrText('');
  try {
   if (matrixMode === 'crout') {
    const res = solveCrout(matrixA, vectorB);
    setCroutOut(res);
    setCholeskyOut(null);
    setGaussOut(null);
    setLuOut(null);
    if (res.status === 'singular') setErrText(res.message);
   } else if (matrixMode === 'cholesky') {
    const res = solveCholesky(matrixA, vectorB);
    setCholeskyOut(res);
    setCroutOut(null);
    setGaussOut(null);
    setLuOut(null);
    if (res.status !== 'converged') setErrText(res.message);
   } else if (matrixMode === 'lu') {
    const res = solveLUGauss(matrixA, vectorB);
    setLuOut(res);
    setCroutOut(null);
    setCholeskyOut(null);
    setGaussOut(null);
    if (res.status === 'singular') setErrText(res.message);
   } else {
    const res = solveGauss(matrixA, vectorB, pivoting);
    setGaussOut(res);
    setCroutOut(null);
    setCholeskyOut(null);
    setLuOut(null);
    if (res.status === 'singular') setErrText(res.message);
   }
  } catch (e) {
   setErrText(e instanceof Error ? e.message : 'Terjadi kesalahan komputasi matriks.');
  }
 };

 return <>
  <div className="pagehead">
   <div>
    <small>LABORATORIUM NUMERIK SPL · KELOMPOK 4</small>
    <h1>Kalkulator Dekomposisi Crout &amp; Cholesky</h1>
   </div>
   <span className={`status ${(croutOut?.status==='converged'||choleskyOut?.status==='converged'||gaussOut?.status==='converged'||luOut?.status==='converged')?'ok':''}`}>
    {croutOut?.status==='converged' ? 'Crout Selesai' : choleskyOut?.status==='converged' ? 'Cholesky Selesai' : luOut ? 'LU Selesai' : gaussOut ? 'Gauss Selesai' : 'Siap Komputasi'}
   </span>
  </div>

  <div className="presets" style={{marginBottom:'14px'}}>
   <button onClick={()=>setPreset([[1,1,1],[2,3,1],[1,-1,-1]], [6,11,-4], 'crout')}>
    <b>Preset 1: Crout 3×3 (Solusi Bulat)</b><small>Solusi (1, 2, 3), U diagonal 1</small>
   </button>
   <button onClick={()=>setPreset([[4,2,-2],[2,10,2],[-2,2,6]], [2,22,4], 'cholesky')}>
    <b>Preset 2: Cholesky 3×3 (Simetris &amp; Definit Positif)</b><small>A = L · Lᵀ, solusi (-1, 2.5, -0.5)</small>
   </button>
   <button onClick={()=>setPreset([[1,2,3],[2,1,4],[3,4,1]], [6,7,8], 'cholesky')}>
    <b>Preset 3: Uji Gagal Cholesky (Tak Definit)</b><small>Simetris tapi det &lt; 0 (akar negatif)</small>
   </button>
   <button onClick={()=>setPreset([[4,2],[2,5]], [8,13], 'cholesky')}>
    <b>Preset 4: Sistem 2×2 Simetris</b><small>Solusi (0.875, 2.25)</small>
   </button>
  </div>

  <div className="methods">
   <button className={`newton ${matrixMode==='crout'?'chosen':''}`} onClick={()=>setMatrixMode('crout')}>
    <span>Dekomposisi Crout (</span><InlineMath math="u_{ii}=1" /><span>)</span>
   </button>
   <button className={`secant ${matrixMode==='cholesky'?'chosen':''}`} onClick={()=>setMatrixMode('cholesky')}>
    <span>Dekomposisi Cholesky (</span><InlineMath math="A = L \cdot L^T" /><span>)</span>
   </button>
   <button className={`fixed ${matrixMode==='lu'?'chosen':''}`} onClick={()=>setMatrixMode('lu')}>
    <span>LU Doolittle (</span><InlineMath math="l_{ii}=1" /><span>)</span>
   </button>
   <button className={`fixed ${matrixMode==='gauss'?'chosen':''}`} onClick={()=>setMatrixMode('gauss')}>
    Eliminasi Gauss
   </button>
  </div>

  <div className="labgrid">
   <section className="panel controls">
    <h2>Matriks Koefisien A dan Vektor b</h2>
    <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'12px'}}>
     <label style={{fontSize:'0.82rem',fontWeight:700}}>Ukuran Matriks:</label>
     <button type="button" className={`pill ${dim===2?'active':''}`} onClick={()=>{setDim(2);setMatrixA([[4,2],[2,5]]);setVectorB([8,13])}}>2 × 2</button>
     <button type="button" className={`pill ${dim===3?'active':''}`} onClick={()=>{setDim(3);setMatrixA([[1,1,1],[2,3,1],[1,-1,-1]]);setVectorB([6,11,-4])}}>3 × 3</button>
     {matrixMode==='gauss'&&<label style={{marginLeft:'auto',fontSize:'0.8rem',display:'flex',alignItems:'center',gap:'4px'}}>
      <input type="checkbox" checked={pivoting} onChange={e=>setPivoting(e.target.checked)}/>
      Pivoting Sebagian
     </label>}
    </div>

    <div style={{display:'flex',gap:'14px',alignItems:'center',overflowX:'auto',paddingBottom:'8px'}}>
     <div>
      <div style={{fontSize:'0.8rem',fontWeight:800,marginBottom:'4px',color:'#1e3a8a'}}>Matriks A:</div>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${dim}, 62px)`,gap:'6px'}}>
       {matrixA.map((row, r)=>row.map((val, c)=><input
        key={`${r}-${c}`}
        type="number"
        value={val}
        onChange={e=>{
         const next=matrixA.map(row=>[...row]);
         next[r][c]=Number(e.target.value);
         setMatrixA(next);
        }}
        style={{padding:'7px 4px',textAlign:'center',border:'1.5px solid #cbd5e1',borderRadius:'6px',fontWeight:700}}
       />))}
      </div>
     </div>

     <div style={{fontSize:'1.4rem',color:'#64748b'}}>·</div>

     <div>
      <div style={{fontSize:'0.8rem',fontWeight:800,marginBottom:'4px',color:'#047857'}}>Vektor x:</div>
      <div style={{display:'grid',gap:'6px'}}>
       {Array.from({length:dim}).map((_, i)=><div
        key={i}
        style={{width:'52px',padding:'7px 0',textAlign:'center',background:'#f1f5f9',borderRadius:'6px',border:'1px dashed #94a3b8',fontSize:'0.82rem',fontWeight:800,color:'#475569'}}
       >
        x_{i+1}
       </div>)}
      </div>
     </div>

     <div style={{fontSize:'1.4rem',color:'#64748b'}}>=</div>

     <div>
      <div style={{fontSize:'0.8rem',fontWeight:800,marginBottom:'4px',color:'#b45309'}}>Vektor b:</div>
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
        style={{width:'62px',padding:'7px 4px',textAlign:'center',border:'1.5px solid #cbd5e1',borderRadius:'6px',fontWeight:700}}
       />)}
      </div>
     </div>
    </div>

    {errText&&<div className="error" style={{color:'#dc2626',marginTop:'10px',fontWeight:700,background:'#fef2f2',padding:'10px',borderRadius:'8px',border:'1px solid #fca5a5'}}>{errText}</div>}

    <button className="primary" style={{marginTop:'14px',width:'100%'}} onClick={runSolve}>
     <Play/> Hitung Solusi Sistem Persamaan
    </button>
   </section>

   <section className="panel display">
    <h2>Hasil &amp; Langkah Transformasi</h2>

    {/* CROUT RESULT */}
    {croutOut&&croutOut.status==='converged'&&(
     <div>
      <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
       <div style={{fontWeight:800,color:'#065f46',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
        <span>Solusi Vektor</span> <InlineMath math="\mathbf{x}" /> <span>(Metode Crout):</span>
       </div>
       <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}}>
        {croutOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'6px 14px',borderRadius:'8px',border:'1.5px solid #10b981',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',display:'inline-flex',alignItems:'center'}}>
         <InlineMath math={`x_{${idx+1}} = ${Number.isInteger(val)?val:Number(val.toFixed(4))}`} />
        </div>)}
       </div>
       <div style={{fontWeight:700,fontSize:'0.85rem',color:'#047857',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
        <span>Vektor perantara</span> <InlineMath math="\mathbf{y}" /> <span>(dari</span> <InlineMath math="L\mathbf{y} = \mathbf{b}" /><span>):</span>
        <InlineMath math={`\mathbf{y} = [${croutOut.y.map(v=>Number.isInteger(v)?v:Number(v.toFixed(4))).join(', ')}]^T`} />
       </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#1e3a8a',fontSize:'0.82rem',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
         <span>Matriks Segitiga Bawah</span> <InlineMath math="L" /> (Diagonal Bebas):
        </div>
        <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
         <tbody>
          {croutOut.L.map((row, ri)=><tr key={ri}>
           {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci<=ri?'#ecfdf5':'transparent'}}>
            {Number.isInteger(val) ? val : val.toFixed(2)}
           </td>)}
          </tr>)}
         </tbody>
        </table>
       </div>

       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#047857',fontSize:'0.82rem',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
         <span>Matriks Segitiga Atas</span> <InlineMath math="U" /> <b>(Diagonal 1):</b>
        </div>
        <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
         <tbody>
          {croutOut.U.map((row, ri)=><tr key={ri}>
           {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci===ri?'#dbeafe':ci>=ri?'#eff6ff':'transparent'}}>
            {Number.isInteger(val) ? val : val.toFixed(2)}
           </td>)}
          </tr>)}
         </tbody>
        </table>
       </div>
      </div>

      <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>Langkah Faktorisasi Crout:</div>
      <div style={{display:'grid',gap:'8px',maxHeight:'320px',overflowY:'auto',background:'#f8fafc',padding:'10px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
       {croutOut.steps.map((st, idx)=>(
        <div key={idx} style={{fontSize:'0.82rem',background:'white',padding:'8px 12px',borderRadius:'6px',border:'1px solid #cbd5e1'}}>
         <div style={{fontWeight:700,color:'#0f172a'}}>{st.title}</div>
         <div style={{color:'#475569',marginTop:'2px'}}>{st.explanation}</div>
         {st.explanationLatex&&<div style={{marginTop:'4px',color:'#2563eb'}}><InlineMath math={st.explanationLatex}/></div>}
        </div>
       ))}
      </div>
     </div>
    )}

    {/* CHOLESKY RESULT */}
    {choleskyOut&&(
     <div>
      {choleskyOut.status==='converged' ? (
       <div>
        <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
         <div style={{fontWeight:800,color:'#065f46',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
          <span>Solusi Vektor</span> <InlineMath math="\mathbf{x}" /> <span>(Metode Cholesky</span> <InlineMath math="A = L \cdot L^T" /><span>):</span>
         </div>
         <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}}>
          {choleskyOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'6px 14px',borderRadius:'8px',border:'1.5px solid #10b981',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',display:'inline-flex',alignItems:'center'}}>
           <InlineMath math={`x_{${idx+1}} = ${Number.isInteger(val)?val:Number(val.toFixed(4))}`} />
          </div>)}
         </div>
         <div style={{fontWeight:700,fontSize:'0.85rem',color:'#047857',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
          <span>Vektor perantara</span> <InlineMath math="\mathbf{y}" /> <span>(dari</span> <InlineMath math="L\mathbf{y} = \mathbf{b}" /><span>):</span>
          <InlineMath math={`\mathbf{y} = [${choleskyOut.y.map(v=>Number.isInteger(v)?v:Number(v.toFixed(4))).join(', ')}]^T`} />
         </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
         <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
          <div style={{fontWeight:800,color:'#1e3a8a',fontSize:'0.82rem',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
           <span>Matriks Segitiga Bawah</span> <InlineMath math="L" />:
          </div>
          <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
           <tbody>
            {choleskyOut.L.map((row, ri)=><tr key={ri}>
             {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci<=ri?'#ecfdf5':'transparent'}}>
              {Number.isInteger(val) ? val : val.toFixed(2)}
             </td>)}
            </tr>)}
           </tbody>
          </table>
         </div>

         <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
          <div style={{fontWeight:800,color:'#047857',fontSize:'0.82rem',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
           <span>Matriks Segitiga Atas</span> <InlineMath math="L^T" /> <b>(Transpos L):</b>
          </div>
          <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
           <tbody>
            {choleskyOut.LT.map((row, ri)=><tr key={ri}>
             {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci>=ri?'#eff6ff':'transparent'}}>
              {Number.isInteger(val) ? val : val.toFixed(2)}
             </td>)}
            </tr>)}
           </tbody>
          </table>
         </div>
        </div>

        <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>Langkah Faktorisasi Cholesky (Akar Diagonal):</div>
        <div style={{display:'grid',gap:'8px',maxHeight:'320px',overflowY:'auto',background:'#f8fafc',padding:'10px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
         {choleskyOut.steps.map((st, idx)=>(
          <div key={idx} style={{fontSize:'0.82rem',background:'white',padding:'8px 12px',borderRadius:'6px',border:'1px solid #cbd5e1'}}>
           <div style={{fontWeight:700,color:'#0f172a'}}>{st.title}</div>
           <div style={{color:'#475569',marginTop:'2px'}}>{st.explanation}</div>
           {st.explanationLatex&&<div style={{marginTop:'4px',color:'#10b981'}}><InlineMath math={st.explanationLatex}/></div>}
          </div>
         ))}
        </div>
       </div>
      ) : (
       <div style={{background:'#fef2f2',border:'1.5px solid #ef4444',borderRadius:'10px',padding:'16px'}}>
        <div style={{fontWeight:800,color:'#991b1b',fontSize:'1rem',marginBottom:'8px'}}>
         {choleskyOut.status === 'not-symmetric' ? 'Matriks Tidak Simetris!' : 'Matriks Tidak Definit Positif!'}
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

    {/* GAUSS RESULT */}
    {gaussOut&&gaussOut.status==='converged'&&(
     <div>
      <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
       <div style={{fontWeight:800,color:'#065f46',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
        <span>Solusi Vektor</span> <InlineMath math="\mathbf{x}" /> <span>(Eliminasi Gauss):</span>
       </div>
       <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
        {gaussOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'6px 14px',borderRadius:'8px',border:'1.5px solid #10b981',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',display:'inline-flex',alignItems:'center'}}>
         <InlineMath math={`x_{${idx+1}} = ${Number.isInteger(val)?val:Number(val.toFixed(4))}`} />
        </div>)}
       </div>
      </div>

      <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>Langkah-Langkah Eliminasi:</div>
      <div style={{display:'grid',gap:'10px',maxHeight:'320px',overflowY:'auto'}}>
       {gaussOut.steps.map((st, sidx)=>(
        <div key={sidx} style={{background:'#f8fafc',border:'1px solid #cbd5e1',borderRadius:'8px',padding:'10px 14px'}}>
         <div style={{fontWeight:800,color:'#0f172a',fontSize:'0.88rem',display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}}>
          <span>{sidx+1}.</span>
          {st.formulaLatex ? (
           <span style={{background:'#e0f2fe',color:'#0369a1',padding:'2px 8px',borderRadius:'4px',border:'1px solid #bae6fd'}}>
            <InlineMath math={st.formulaLatex} />
           </span>
          ) : (
           <span>{st.title}</span>
          )}
         </div>
         {st.explanationLatex&&<div style={{color:'#475569',fontSize:'0.82rem',marginBottom:'8px'}}><InlineMath math={st.explanationLatex}/></div>}
         <div style={{display:'flex',gap:'4px',alignItems:'center',overflowX:'auto'}}>
          <table style={{borderCollapse:'collapse',fontSize:'0.82rem'}}>
           <tbody>
            {st.matrix.map((row, ri)=>(
             <tr key={ri}>
              {row.map((cv, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'3px 7px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci===ri?'#fef3c7':'transparent'}}>
               {Number.isInteger(cv) ? cv : cv.toFixed(2)}
              </td>)}
              <td style={{borderLeft:'2px solid #222',borderRight:'1px solid #cbd5e1',borderTop:'1px solid #cbd5e1',borderBottom:'1px solid #cbd5e1',padding:'3px 7px',textAlign:'center',background:'#f0fdf4',fontWeight:700}}>
               {Number.isInteger(st.b[ri]) ? st.b[ri] : st.b[ri].toFixed(2)}
              </td>
             </tr>
            ))}
           </tbody>
          </table>
         </div>
        </div>
       ))}
      </div>
     </div>
    )}

    {/* LU DOOLITTLE RESULT */}
    {luOut&&luOut.status==='converged'&&(
     <div>
      <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
       <div style={{fontWeight:800,color:'#065f46',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
        <span>Solusi Akhir Vektor</span> <InlineMath math="\mathbf{x}" /> <span>(LU Doolittle):</span>
       </div>
       <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}}>
        {luOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'6px 14px',borderRadius:'8px',border:'1.5px solid #10b981',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',display:'inline-flex',alignItems:'center'}}>
         <InlineMath math={`x_{${idx+1}} = ${Number.isInteger(val)?val:Number(val.toFixed(4))}`} />
        </div>)}
       </div>
       <div style={{fontWeight:700,fontSize:'0.85rem',color:'#047857',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
        <span>Vektor perantara</span> <InlineMath math="\mathbf{y}" />:
        <InlineMath math={`\mathbf{y} = [${luOut.y.map(v=>Number.isInteger(v)?v:Number(v.toFixed(4))).join(', ')}]^T`} />
       </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#1e3a8a',fontSize:'0.82rem',marginBottom:'6px'}}>Matriks L (Diagonal 1):</div>
        <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
         <tbody>
          {luOut.L.map((row, ri)=><tr key={ri}>
           {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci===ri?'#dbeafe':ci<=ri?'#ecfdf5':'transparent'}}>
            {Number.isInteger(val) ? val : val.toFixed(2)}
           </td>)}
          </tr>)}
         </tbody>
        </table>
       </div>

       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#047857',fontSize:'0.82rem',marginBottom:'6px'}}>Matriks U (Diagonal Bebas):</div>
        <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
         <tbody>
          {luOut.U.map((row, ri)=><tr key={ri}>
           {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci>=ri?'#eff6ff':'transparent'}}>
            {Number.isInteger(val) ? val : val.toFixed(2)}
           </td>)}
          </tr>)}
         </tbody>
        </table>
       </div>
      </div>
     </div>
    )}

    {!croutOut&&!choleskyOut&&!gaussOut&&!luOut&&<div style={{textAlign:'center',color:'#64748b',padding:'40px 10px'}}>
     Pilih metode Crout atau Cholesky di atas, gunakan preset yang tersedia, lalu klik <b>Hitung Solusi</b>.
    </div>}
   </section>
  </div>
 </>
}

function SlideVisual({index,score}:{index:number;score:number}){
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
    <text x="52" y="80" textAnchor="middle" fontSize="13" fill="#78350f">l_ii = 1</text>
    <rect x="102" y="25" width="75" height="90" rx="6" fill="#e0f2fe" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="50" textAnchor="middle" fontSize="10" fill="#0369a1">Crout</text>
    <text x="140" y="80" textAnchor="middle" fontSize="13" fill="#075985">u_ii = 1</text>
    <rect x="190" y="25" width="75" height="90" rx="6" fill="#dcfce7" stroke="#222" strokeWidth="1.5"/>
    <text x="227" y="50" textAnchor="middle" fontSize="10" fill="#166534">Cholesky</text>
    <text x="227" y="80" textAnchor="middle" fontSize="13" fill="#14532d">L · Lᵀ</text>
    <rect x="35" y="122" width="210" height="22" rx="4" fill="#334155"/>
    <text x="140" y="137" textAnchor="middle" fontSize="10.5" fill="#fff">Ragam Faktorisasi Matriks</text>
   </g>}

   {/* Slide 3: Reduksi Crout u_ii = 1 */}
   {index===3&&<g>
    <rect x="35" y="15" width="95" height="90" rx="8" fill="#f0fdf4" stroke="#222" strokeWidth="2"/>
    <text x="82" y="40" textAnchor="middle" fontSize="13" fill="#166534">Matriks L</text>
    <text x="82" y="65" textAnchor="middle" fontSize="11" fill="#15803d">l_11, l_21...</text>
    <text x="82" y="88" textAnchor="middle" fontSize="10" fill="#65a30d">Bebas</text>
    <text x="140" y="65" textAnchor="middle" fontSize="20" fill="#222">·</text>
    <rect x="150" y="15" width="95" height="90" rx="8" fill="#dbeafe" stroke="#222" strokeWidth="2"/>
    <text x="197" y="40" textAnchor="middle" fontSize="13" fill="#1e40af">Matriks U</text>
    <text x="197" y="68" textAnchor="middle" fontSize="18" fill="#1d4ed8">1 &nbsp; 1 &nbsp; 1</text>
    <text x="197" y="90" textAnchor="middle" fontSize="9.5" fill="#2563eb">Diagonal = 1</text>
    <rect x="40" y="118" width="200" height="24" rx="5" fill="#0284c7"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fill="#fff">Ciri Khas Crout: Diagonal U = 1</text>
   </g>}

   {/* Slide 4: Algoritma Rekursif Crout */}
   {index===4&&<g>
    <rect x="25" y="20" width="105" height="50" rx="6" fill="#e0f2fe" stroke="#222" strokeWidth="1.5"/>
    <text x="77" y="42" textAnchor="middle" fontSize="11" fill="#0369a1">Kolom k matriks L</text>
    <text x="77" y="58" textAnchor="middle" fontSize="9" fill="#075985">l_ik = a_ik - ∑...</text>
    <path d="M 130 45 L 150 45 L 150 85 L 155 85" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="153,81 160,85 153,89" fill="#ea580c"/>
    <rect x="160" y="65" width="105" height="50" rx="6" fill="#fef3c7" stroke="#222" strokeWidth="1.5"/>
    <text x="212" y="87" textAnchor="middle" fontSize="11" fill="#b45309">Baris k matriks U</text>
    <text x="212" y="103" textAnchor="middle" fontSize="9" fill="#78350f">u_kj = (...) / l_kk</text>
    <rect x="40" y="122" width="200" height="22" rx="4" fill="#0f172a"/>
    <text x="140" y="137" textAnchor="middle" fontSize="10.5" fill="#fff">Bergantian Kolom L → Baris U</text>
   </g>}

   {/* Slide 5: Substitusi Maju Crout L y = b */}
   {index===5&&<g>
    <rect x="35" y="15" width="85" height="90" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2"/>
    <polygon points="40,20 40,95 110,95" fill="#a7f3d0"/>
    <text x="77" y="55" textAnchor="middle" fontSize="14" fill="#065f46">L</text>
    <text x="140" y="65" textAnchor="middle" fontSize="18" fill="#222">· y = b</text>
    <rect x="175" y="15" width="70" height="90" rx="8" fill="#fed7aa" stroke="#222" strokeWidth="2"/>
    <text x="210" y="62" textAnchor="middle" fontSize="16" fill="#9a3412">y</text>
    <rect x="35" y="118" width="210" height="24" rx="5" fill="#059669"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fill="#fff">Maju: Atas ke Bawah (i = 1 → n)</text>
   </g>}

   {/* Slide 6: Substitusi Mundur Crout U x = y */}
   {index===6&&<g>
    <rect x="35" y="15" width="85" height="90" rx="8" fill="#dbeafe" stroke="#222" strokeWidth="2"/>
    <polygon points="40,20 115,20 115,95" fill="#bfdbfe"/>
    <text x="77" y="55" textAnchor="middle" fontSize="14" fill="#1e40af">U</text>
    <text x="140" y="65" textAnchor="middle" fontSize="18" fill="#222">· x = y</text>
    <rect x="175" y="15" width="70" height="90" rx="8" fill="#bbf7d0" stroke="#222" strokeWidth="2"/>
    <text x="210" y="62" textAnchor="middle" fontSize="16" fill="#166534">x</text>
    <rect x="35" y="118" width="210" height="24" rx="5" fill="#2563eb"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fill="#fff">Mundur: Bawah ke Atas (Bebas Bagi!)</text>
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
    <text x="140" y="129" textAnchor="middle" fontSize="11" fill="#fff">Poros l_kk = 0 (Pembagian Nol)</text>
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
    <rect x="35" y="15" width="210" height="90" rx="8" fill="#f0fdf4" stroke="#222" strokeWidth="2"/>
    <text x="140" y="45" textAnchor="middle" fontSize="18" fill="#15803d">l_jj = √(a_jj - ∑ l_jk²)</text>
    <text x="140" y="75" textAnchor="middle" fontSize="11" fill="#475569">Akar kuadrat selalu riil jika definit positif</text>
    <rect x="45" y="118" width="190" height="24" rx="5" fill="#059669"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fill="#fff">Akar Diagonal Khusus Cholesky</text>
   </g>}

   {/* Slide 12: Efisiensi 50% Memori & Kecepatan 2x */}
   {index===12&&<g>
    <rect x="30" y="20" width="100" height="85" rx="8" fill="#fee2e2" stroke="#222" strokeWidth="2"/>
    <text x="80" y="50" textAnchor="middle" fontSize="12" fill="#991b1b">LU Biasa</text>
    <text x="80" y="80" textAnchor="middle" fontSize="16" fill="#b91c1c">n³ / 3 Ops</text>
    <text x="140" y="65" textAnchor="middle" fontSize="16" fill="#059669">VS</text>
    <rect x="150" y="20" width="100" height="85" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2"/>
    <text x="200" y="50" textAnchor="middle" fontSize="12" fill="#065f46">Cholesky</text>
    <text x="200" y="80" textAnchor="middle" fontSize="16" fill="#047857">n³ / 6 Ops ⚡</text>
    <rect x="35" y="118" width="210" height="24" rx="5" fill="#047857"/>
    <text x="140" y="134" textAnchor="middle" fontSize="11" fill="#fff">2× Lebih Cepat &amp; Hemat 50% RAM</text>
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
    <circle cx="140" cy="55" r="45" fill="#fee2e2" stroke="#dc2626" strokeWidth="2.5"/>
    <text x="140" y="50" textAnchor="middle" fontSize="22" fill="#b91c1c">√(-Δ)</text>
    <text x="140" y="75" textAnchor="middle" fontSize="11" fill="#7f1d1d">Bilangan Imajiner!</text>
    <rect x="35" y="112" width="210" height="26" rx="6" fill="#dc2626"/>
    <text x="140" y="129" textAnchor="middle" fontSize="11" fill="#fff">Bukan Definit Positif → Cholesky Gagal</text>
   </g>}

   {/* Slide 15: Perbandingan Tiga Metode */}
   {index===15&&<g>
    <rect x="15" y="20" width="75" height="95" rx="6" fill="#fef3c7" stroke="#222" strokeWidth="1.5"/>
    <text x="52" y="44" textAnchor="middle" fontSize="10" fill="#92400e">Doolittle</text>
    <text x="52" y="70" textAnchor="middle" fontSize="11" fill="#78350f">l_ii = 1</text>
    <text x="52" y="95" textAnchor="middle" fontSize="8.5" fill="#b45309">Umum</text>
    <rect x="102" y="20" width="75" height="95" rx="6" fill="#e0f2fe" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="44" textAnchor="middle" fontSize="10" fill="#0369a1">Crout</text>
    <text x="140" y="70" textAnchor="middle" fontSize="11" fill="#075985">u_ii = 1</text>
    <text x="140" y="95" textAnchor="middle" fontSize="8.5" fill="#0284c7">Umum</text>
    <rect x="190" y="20" width="75" height="95" rx="6" fill="#dcfce7" stroke="#222" strokeWidth="1.5"/>
    <text x="227" y="44" textAnchor="middle" fontSize="10" fill="#166534">Cholesky</text>
    <text x="227" y="70" textAnchor="middle" fontSize="11" fill="#14532d">A = L · Lᵀ</text>
    <text x="227" y="95" textAnchor="middle" fontSize="8.5" fill="#15803d">Simetris Definit</text>
   </g>}

   {/* Slide 16: Skor Kuis Interaktif */}
   {index===16&&<g>
    <circle cx="140" cy="58" r="48" fill="#fef3c7" stroke="#222" strokeWidth="2.5"/>
    <circle cx="140" cy="58" r="38" fill="#faae2b" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="50" textAnchor="middle" fontSize="13" fill="#78350f">SKOR KUIS</text>
    <text x="140" y="76" textAnchor="middle" fontSize="24" fill="#222">{score} / 3</text>
    <text x="140" y="128" textAnchor="middle" fontSize="12" fill="#ea580c">Evaluasi Materi Crout &amp; Cholesky</text>
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
