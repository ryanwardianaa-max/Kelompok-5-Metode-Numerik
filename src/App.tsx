import {useCallback,useEffect,useState} from 'react'
import {BlockMath,InlineMath} from 'react-katex'
import {BookOpen,ChevronLeft,ChevronRight,FlaskConical,Play,Presentation,User,Users} from 'lucide-react'
import {
  solveGauss,
  solveLUGauss,
  type GaussResult,
  type LUResult
} from './engine'
import 'katex/dist/katex.min.css'
import './App.css'

const identity={
 course:'Metode Numerik (Kelas C)',
 code:'KP21517001',
 program:'Pendidikan Matematika',
 faculty:'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)',
 group:'Kelompok 4',
 meeting:'Pertemuan 05',
 topic:'Sistem Persamaan Lanjar: Eliminasi Gauss Dimodifikasi & Dekomposisi LU Gauss'
} as const

const members=[
 ['Ryan Wardiana','232151098'],
 ['Najla Aisyah','232151087'],
 ['Nabila Fitria Nuroktavianty Rosadi','232151088']
] as const

const slides=[
 ['SPL & Dekomposisi LU','A\\mathbf{x} = \\mathbf{b} \\iff L U \\mathbf{x} = \\mathbf{b}',[
  'Kelompok 4 · Presentasi Pertemuan 05 Metode Numerik (Kelas C).',
  'Membahas tuntas Eliminasi Gauss Dimodifikasi (Pivoting Sebagian) dan Dekomposisi LU Gauss (Doolittle).'
 ]],
 ['Mengapa Sistem Persamaan Lanjar?','A\\mathbf{x} = \\mathbf{b}',[
  'Persoalan sains, jaringan listrik, struktur rekayasa, dan ekonomi memuat puluhan peubah simultan.',
  'Bentuk matriks koefisien A dan vektor ruas kanan b diselesaikan serentak untuk mencari nilai x.'
 ]],
 ['Eliminasi Gauss Naif & Kelemahannya','a_{kk} = 0 \\implies \\text{Pembagian Nol}',[
  'Gauss naif mengeliminasi segitiga bawah secara berurutan tanpa memeriksa nilai poros (pivot).',
  'Kelemahan fatal: Gagal jika elemen poros bernilai nol (pembagian nol) atau galat pembulatan membesar.'
 ]],
 ['Modifikasi: Tata Ancang Pivoting Sebagian','\\max_{i \\ge k} |a_{ik}| \\implies R_k \\leftrightarrow R_p',[
  'Sebelum eliminasi kolom k, cari baris dengan nilai mutlak koefisien terbesar di bawah diagonal.',
  'Tukar baris tersebut dengan baris poros untuk menjamin stabilitas numerik dan mencegah pembagian nol.'
 ]],
 ['Langkah Eliminasi Maju Menuju Segitiga Atas','R_i \\leftarrow R_i - m_{ik} R_k,\\quad m_{ik} = \\frac{a_{ik}}{a_{kk}}',[
  'Faktor pengali m_{ik} mengeliminasi elemen di bawah poros menjadi nol bertahap.',
  'Matriks augmentasi [A | b] ditransformasikan menjadi matriks segitiga atas [U | b\'].'
 ]],
 ['Contoh Eliminasi Gauss Modifikasi','[A | \\mathbf{b}] \\to [U | \\mathbf{b}\']',[
  'Simulasi numerik eliminasi Gauss dengan tata ancang pivoting sebagian langkah demi langkah.'
 ]],
 ['Filosofi Dekomposisi LU: Mengapa Perlu?','A = L \\cdot U',[
  'Pada rekayasa riil, matriks A seringkali tetap sama, tetapi vektor beban b berubah-ubah berkali-kali.',
  'Dekomposisi LU memfaktorkan matriks A HANYA SEKALI menjadi matriks segitiga bawah L dan segitiga atas U.'
 ]],
 ['Keunggulan LU dibanding Gauss','O(n^3) \\to O(n^2)',[
  'Gauss biasa: Setiap ganti vektor b, harus mengulang seluruh eliminasi dari awal (biaya komputasi O(n³)).',
  'Dekomposisi LU: Cukup 1 kali faktorisasi, setiap ganti b hanya perlu substitusi cepat berbiaya O(n²).'
 ]],
 ['Metode LU Gauss (Metode Doolittle)','A = L \\cdot U,\\quad l_{ii} = 1',[
  'Metode LU Gauss menetapkan elemen diagonal utama matriks L bernilai 1 (l_{ii} = 1).',
  'Matriks U adalah matriks segitiga atas hasil eliminasi Gauss, sedangkan L menyimpan faktor pengali m_{ik}.'
 ]],
 ['Struktur Matriks L dan Matriks U','L = [m_{ik}],\\quad U = \\text{Segitiga Atas}',[
  'Elemen di bawah diagonal L berisi faktor pengali m_{ik} yang digunakan saat eliminasi Gauss.',
  'Perkalian L dan U dijamin menghasilkan kembali matriks asal A secara eksak: A = L · U.'
 ]],
 ['Tahap 1: Substitusi Maju (Forward)','L\\mathbf{y} = \\mathbf{b}',[
  'Menyelesaikan sistem segitiga bawah L y = b dari baris pertama ke baris terakhir.',
  'Karena L berbentuk segitiga bawah, nilai y₁, y₂, ..., yₙ langsung diperoleh berurutan dari atas ke bawah.'
 ]],
 ['Tahap 2: Substitusi Mundur (Backward)','U\\mathbf{x} = \\mathbf{y}',[
  'Menyelesaikan sistem segitiga atas U x = y dari baris terakhir ke baris pertama.',
  'Diperoleh solusi akhir xₙ, x_{n-1}, ..., x₁ dengan sangat cepat dan presisi tinggi.'
 ]],
 ['Contoh Lengkap Dekomposisi LU Gauss','A = L \\cdot U,\\quad L\\mathbf{y}=\\mathbf{b},\\quad U\\mathbf{x}=\\mathbf{y}',[
  'Simulasi lengkap pemfaktoran LU matriks 3x3 dan penyelesaian dua tahap forward/backward.'
 ]],
 ['Verifikasi Solusi & Vektor Residu','\\mathbf{r} = A\\mathbf{x} - \\mathbf{b} \\approx \\mathbf{0}',[
  'Solusi x diuji keasliannya dengan menghitung residual: r = Ax - b.',
  'Jika norma ||r|| mendekati nol dalam toleransi mesin, solusi terbukti valid dan akurat.'
 ]],
 ['Perbandingan Metode: Gauss vs LU','\\text{Efisiensi Komputasi & Stabilitas}',[
  'Gauss Naif: Rawan gagal poros nol. Gauss Modifikasi: Stabil dengan pivoting sebagian.',
  'Dekomposisi LU: Paling unggul untuk sistem invers matriks dan multi-vektor beban ruas kanan.'
 ]],
 ['Rangkuman & Glosarium Konsep Kunci','\\text{Fondasi Aljabar Linear Numerik}',[
  'Poros (Pivot), Faktor Pengali (Multiplier), Matriks Segitiga, Substitusi Maju/Mundur, dan Residu.'
 ]],
 ['Latihan & Kuis Interaktif','\\text{Uji Pemahaman Audiens}',[
  'Kuis 3 babak konsep: Kenapa butuh pivoting? Apa peran matriks L? Bagaimana alur substitusi dua tahap?'
 ]],
 ['Kesimpulan & Pembagian Peran Tim','\\mathbf{x}^*\\text{ Solusi Terverifikasi}',[
  'Sistem Persamaan Lanjar diselesaikan secara kokoh dan modular.',
  'Ryan: Pengantar & Demo Lab, Najla: Gauss Pivoting, Nabila: Dekomposisi LU & Tanya Jawab.'
 ]]
] as const

const examples={
 'Contoh Eliminasi Gauss Modifikasi':{
  prompt:[
   '\\begin{bmatrix} 2 & 1 & 1 \\\\ 4 & -6 & 0 \\\\ -2 & 7 & 2 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ -2 \\\\ 9 \\end{bmatrix}',
   '\\text{Selesaikan dengan Eliminasi Gauss Tata Ancang Pivoting Sebagian}'
  ],
  steps:[
   [
    '\\text{Langkah 1: Periksa kolom 1. Elemen terbesar adalah } |4| \\text{ pada baris 2.}',
    '\\text{Tukar baris } R_1 \\leftrightarrow R_2 \\text{ (Pivoting):}',
    '\\begin{bmatrix} 4 & -6 & 0 & \\big| & -2 \\\\ 2 & 1 & 1 & \\big| & 5 \\\\ -2 & 7 & 2 & \\big| & 9 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 2: Eliminasi kolom 1 di bawah poros } a_{11} = 4:',
    'm_{21} = 2/4 = 0.5 \\implies R_2 \\leftarrow R_2 - 0.5 R_1',
    'm_{31} = -2/4 = -0.5 \\implies R_3 \\leftarrow R_3 - (-0.5) R_1',
    '\\begin{bmatrix} 4 & -6 & 0 & \\big| & -2 \\\\ 0 & 4 & 1 & \\big| & 6 \\\\ 0 & 4 & 2 & \\big| & 8 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 3: Periksa kolom 2 di bawah poros. Poros } a_{22} = 4.',
    'm_{32} = 4/4 = 1 \\implies R_3 \\leftarrow R_3 - (1) R_2',
    '\\begin{bmatrix} 4 & -6 & 0 & \\big| & -2 \\\\ 0 & 4 & 1 & \\big| & 6 \\\\ 0 & 0 & 1 & \\big| & 2 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 4: Substitusi Mundur (Back Substitution):}',
    'R_3: x_3 = 2',
    'R_2: 4x_2 + (1)(2) = 6 \\implies 4x_2 = 4 \\implies x_2 = 1',
    'R_1: 4x_1 - 6(1) + 0 = -2 \\implies 4x_1 = 4 \\implies x_1 = 1'
   ]
  ],
  conclusion:['Solusi tunggal SPL adalah ', '\\mathbf{x} = \\begin{bmatrix} 1 \\\\ 1 \\\\ 2 \\end{bmatrix}', '. Terbukti memenuhi seluruh persamaan sistem!']
 },
 'Contoh Lengkap Dekomposisi LU Gauss':{
  prompt:[
   'A = \\begin{bmatrix} 2 & 1 & 1 \\\\ 4 & -6 & 0 \\\\ -2 & 7 & 2 \\end{bmatrix},\\qquad \\mathbf{b} = \\begin{bmatrix} 5 \\\\ -2 \\\\ 9 \\end{bmatrix}',
   '\\text{Faktorkan } A = L \\cdot U \\text{ lalu selesaikan } L\\mathbf{y} = \\mathbf{b} \\text{ dan } U\\mathbf{x} = \\mathbf{y}'
  ],
  steps:[
   [
    '\\text{Langkah 1: Eliminasi Gauss membentuk Matriks } U \\text{ dan pengali } L:',
    'm_{21} = 4/2 = 2 \\implies U_2 \\leftarrow U_2 - 2 U_1',
    'm_{31} = -2/2 = -1 \\implies U_3 \\leftarrow U_3 - (-1) U_1',
    'U^{(1)} = \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & -8 & -2 \\\\ 0 & 8 & 3 \\end{bmatrix}, \\quad L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ -1 & ? & 1 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 2: Eliminasi baris 3 kolom 2: } m_{32} = 8 / (-8) = -1',
    'U_3 \\leftarrow U_3 - (-1) U_2',
    'U = \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & -8 & -2 \\\\ 0 & 0 & 1 \\end{bmatrix}, \\quad L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ -1 & -1 & 1 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 3: Tahap 1 Substitusi Maju } L\\mathbf{y} = \\mathbf{b}:',
    '\\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ -1 & -1 & 1 \\end{bmatrix} \\begin{bmatrix} y_1 \\\\ y_2 \\\\ y_3 \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ -2 \\\\ 9 \\end{bmatrix}',
    'y_1 = 5',
    '2(5) + y_2 = -2 \\implies y_2 = -12',
    '-1(5) - 1(-12) + y_3 = 9 \\implies 7 + y_3 = 9 \\implies y_3 = 2',
    '\\mathbf{y} = \\begin{bmatrix} 5 \\\\ -12 \\\\ 2 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 4: Tahap 2 Substitusi Mundur } U\\mathbf{x} = \\mathbf{y}:',
    '\\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & -8 & -2 \\\\ 0 & 0 & 1 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ -12 \\\\ 2 \\end{bmatrix}',
    'x_3 = 2',
    '-8x_2 - 2(2) = -12 \\implies -8x_2 = -8 \\implies x_2 = 1',
    '2x_1 + 1(1) + 1(2) = 5 \\implies 2x_1 = 2 \\implies x_1 = 1'
   ]
  ],
  conclusion:['Diperoleh solusi eksak ', '\\mathbf{x} = \\begin{bmatrix} 1 \\\\ 1 \\\\ 2 \\end{bmatrix}', '. Jika vektor b berganti, faktorisasi LU tidak perlu diulang!']
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
  prompt:'\\text{Mengapa pada eliminasi Gauss naif perlu dimodifikasi dengan tata ancang pivoting sebagian?}',
  options:['Untuk mengubah matriks menjadi matriks identitas seketika', 'Mencegah pembagian dengan nol (poros = 0) dan meminimalkan galat pembulatan', 'Menghilangkan kebutuhan substitusi mundur', 'Supaya matriks otomatis berbentuk simetris'],
  answer:1
 },
 {
  prompt:'\\text{Apa keunggulan utama Dekomposisi LU dibanding Eliminasi Gauss biasa dalam rekayasa riil?}',
  options:['Hanya berlaku untuk matriks diagonal', 'Faktorisasi A = L · U cukup dilakukan 1 kali saat vektor ruas kanan b berubah-ubah', 'Tidak membutuhkan operasi baris sama sekali', 'Selalu menghasilkan determinan bernilai satu'],
  answer:1
 },
 {
  prompt:'\\text{Pada Dekomposisi LU metode Gauss (Doolittle), elemen apa yang berada pada diagonal utama matriks L?}',
  options:['Semua elemen diagonal utama L bernilai nol', 'Elemen bernilai bebas sesuai invers matriks', 'Semua elemen diagonal utama bernilai satu (l_{ii} = 1)', 'Elemen diagonal sama persis dengan matriks asal A'],
  answer:2
 }
] as const

function QuizExplanation({question}:{question:number}){
 return <p>{
  question===0?<>Pivoting sebagian mencari elemen bernilai mutlak terbesar <InlineMath math="|a_{ik}|"/> di bawah diagonal dan menukarnya ke posisi poros. Ini mencegah pembagian dengan nol dan menghindari lonjakan galat pembulatan.</>:
  question===1?<>Pada persoalan riil seperti beban listrik atau struktur statis, matriks koefisien <InlineMath math="A"/> konstan sedangkan beban <InlineMath math="\\mathbf{b}"/> berubah berkali-kali. Faktorisasi <InlineMath math="A = LU"/> cukup 1 kali <InlineMath math="O(n^3)"/>, lalu tiap <InlineMath math="\\mathbf{b}"/> hanya butuh substitusi cepat <InlineMath math="O(n^2)"/>.</>:
  <>Metode Doolittle (LU Gauss) menetapkan diagonal utama matriks segitiga bawah <InlineMath math="L"/> bernilai 1 (<InlineMath math="l_{ii} = 1"/>), sedangkan bagian bawahnya menyimpan faktor pengali <InlineMath math="m_{ik}"/> dari eliminasi Gauss.</>
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
  example=examples[slide[0] as keyof typeof examples],
  quiz=slide[0]==='Latihan & Kuis Interaktif',
  fullWidth=i===0||Boolean(example),
  special=Boolean(example)||quiz;

 return <section className="deck">
  <article className={`slide ${i===0?'cover-slide':''} ${special?'special':''} ${fullWidth?'full-width':''}`}>
   <div className="progress" style={{width:`${(i+1)/slides.length*100}%`}}/>
   <div>
    <small>METODE NUMERIK · SLIDE {i+1} DARI {slides.length}</small>
    <h1>{slide[0]}</h1>
    {i===0?<Cover/>:example?<StepExample key={slide[0]} data={example}/>:quiz?<Quiz answers={answers} onChange={setAnswers}/>:<><BlockMath math={slide[1]}/><ul>{slide[2].map(x=><li key={x}>{x}</li>)}</ul></>}
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

// Numerical Lab: Dedicated SPL Solver for Gauss & LU
function Lab(){
 const [matrixMode, setMatrixMode] = useState<'gauss' | 'lu'>('gauss');
 const [pivoting, setPivoting] = useState<boolean>(true);
 const [dim, setDim] = useState<number>(3);
 
 const [matrixA, setMatrixA] = useState<number[][]>([
  [2, 1, 1],
  [4, -6, 0],
  [-2, 7, 2]
 ]);
 const [vectorB, setVectorB] = useState<number[]>([5, -2, 9]);

 const [gaussOut, setGaussOut] = useState<GaussResult | null>(null);
 const [luOut, setLuOut] = useState<LUResult | null>(null);
 const [errText, setErrText] = useState<string>('');

 const setPreset = (presetA: number[][], presetB: number[]) => {
  setDim(presetA.length);
  setMatrixA(presetA);
  setVectorB(presetB);
  setGaussOut(null);
  setLuOut(null);
  setErrText('');
 };

 const runSolve = () => {
  setErrText('');
  try {
   if (matrixMode === 'gauss') {
    const res = solveGauss(matrixA, vectorB, pivoting);
    setGaussOut(res);
    setLuOut(null);
    if (res.status === 'singular') setErrText(res.message);
   } else {
    const res = solveLUGauss(matrixA, vectorB);
    setLuOut(res);
    setGaussOut(null);
    if (res.status === 'singular') setErrText(res.message);
   }
  } catch (e) {
   setErrText(e instanceof Error ? e.message : 'Terjadi kesalahan komputasi matriks.');
  }
 };

 return <>
  <div className="pagehead">
   <div><small>LABORATORIUM NUMERIK SPL</small><h1>Kalkulator Eliminasi Gauss &amp; Dekomposisi LU</h1></div>
   <span className={`status ${(gaussOut?.status==='converged'||luOut?.status==='converged')?'ok':''}`}>
    {gaussOut ? 'Gauss Selesai' : luOut ? 'LU Selesai' : 'Siap Komputasi'}
   </span>
  </div>

  <div className="presets" style={{marginBottom:'14px'}}>
   <button onClick={()=>setPreset([[2,1,1],[4,-6,0],[-2,7,2]], [5,-2,9])}>
    <b>Preset 1: Standar 3×3</b><small>Solusi bulat (1, 1, 2)</small>
   </button>
   <button onClick={()=>setPreset([[0,2,3],[4,6,7],[2,1,-1]], [8,-3,5])}>
    <b>Preset 2: Poros Nol (Wajib Pivoting)</b><small>a₁₁ = 0 uji ketahanan</small>
   </button>
   <button onClick={()=>setPreset([[3,2],[1,4]], [13,11])}>
    <b>Preset 3: Sistem 2×2</b><small>Solusi (3, 2)</small>
   </button>
  </div>

  <div className="methods">
   <button className={`newton ${matrixMode==='gauss'?'chosen':''}`} onClick={()=>setMatrixMode('gauss')}>
    Eliminasi Gauss (Pivoting Sebagian)
   </button>
   <button className={`secant ${matrixMode==='lu'?'chosen':''}`} onClick={()=>setMatrixMode('lu')}>
    Dekomposisi LU Gauss (A = L · U)
   </button>
  </div>

  <div className="labgrid">
   <section className="panel controls">
    <h2>Matriks Koefisien A dan Vektor b</h2>
    <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'12px'}}>
     <label style={{fontSize:'0.82rem',fontWeight:700}}>Ukuran Matriks:</label>
     <button type="button" className={`pill ${dim===2?'active':''}`} onClick={()=>{setDim(2);setMatrixA([[3,2],[1,4]]);setVectorB([13,11])}}>2 × 2</button>
     <button type="button" className={`pill ${dim===3?'active':''}`} onClick={()=>{setDim(3);setMatrixA([[2,1,1],[4,-6,0],[-2,7,2]]);setVectorB([5,-2,9])}}>3 × 3</button>
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
       {Array.from({length:dim}).map((_, i)=><div key={i} style={{height:'36px',display:'grid',placeItems:'center',background:'#f1f5f9',borderRadius:'6px',fontWeight:800,fontSize:'0.85rem',color:'#475569'}}>
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

    {errText&&<div className="error" style={{color:'#dc2626',marginTop:'10px',fontWeight:700}}>{errText}</div>}

    <button className="primary" style={{marginTop:'14px',width:'100%'}} onClick={runSolve}>
     <Play/> Hitung Solusi Sistem Persamaan
    </button>
   </section>

   <section className="panel display">
    <h2>Hasil &amp; Langkah Transformasi</h2>

    {gaussOut&&gaussOut.status==='converged'&&(
     <div>
      <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
       <div style={{fontWeight:800,color:'#065f46',marginBottom:'4px'}}>Solusi Vektor x (Eliminasi Gauss):</div>
       <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
        {gaussOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'6px 12px',borderRadius:'6px',border:'1px solid #a7f3d0',fontWeight:800}}>
         x_{idx+1} = {Number.isInteger(val)?val:val.toFixed(6)}
        </div>)}
       </div>
      </div>

      <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>Langkah-Langkah Eliminasi:</div>
      <div style={{display:'grid',gap:'10px',maxHeight:'420px',overflowY:'auto'}}>
       {gaussOut.steps.map((st, sidx)=>(
        <div key={sidx} style={{background:'#f8fafc',border:'1px solid #cbd5e1',borderRadius:'8px',padding:'10px 14px'}}>
         <div style={{fontWeight:800,color:'#0f172a',fontSize:'0.88rem'}}>{sidx+1}. {st.title}</div>
         <small style={{color:'#64748b',display:'block',marginBottom:'6px'}}>{st.explanation}</small>
         <div style={{display:'flex',gap:'4px',alignItems:'center',overflowX:'auto'}}>
          <table style={{borderCollapse:'collapse',fontSize:'0.82rem'}}>
           <tbody>
            {st.matrix.map((row, ri)=>(
             <tr key={ri}>
              {row.map((cv, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'3px 7px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci===ri?'#fef3c7':'transparent'}}>
               {cv.toFixed(2)}
              </td>)}
              <td style={{borderLeft:'2px solid #222',borderRight:'1px solid #cbd5e1',borderTop:'1px solid #cbd5e1',borderBottom:'1px solid #cbd5e1',padding:'3px 7px',textAlign:'center',background:'#f0fdf4',fontWeight:700}}>
               {st.b[ri].toFixed(2)}
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

    {luOut&&luOut.status==='converged'&&(
     <div>
      <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
       <div style={{fontWeight:800,color:'#065f46',marginBottom:'4px'}}>Solusi Akhir Vektor x (Dekomposisi LU):</div>
       <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'8px'}}>
        {luOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'6px 12px',borderRadius:'6px',border:'1px solid #a7f3d0',fontWeight:800}}>
         x_{idx+1} = {Number.isInteger(val)?val:val.toFixed(6)}
        </div>)}
       </div>
       <div style={{fontWeight:700,fontSize:'0.8rem',color:'#047857'}}>
        Vektor perantara y (dari L · y = b): [{luOut.y.map(v=>Number.isInteger(v)?v:v.toFixed(4)).join(', ')}]
       </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#1e3a8a',fontSize:'0.82rem',marginBottom:'6px'}}>Matriks Segitiga Bawah L:</div>
        <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
         <tbody>
          {luOut.L.map((row, ri)=><tr key={ri}>
           {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci<=ri?'#ecfdf5':'transparent'}}>
            {val.toFixed(2)}
           </td>)}
          </tr>)}
         </tbody>
        </table>
       </div>

       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#047857',fontSize:'0.82rem',marginBottom:'6px'}}>Matriks Segitiga Atas U:</div>
        <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
         <tbody>
          {luOut.U.map((row, ri)=><tr key={ri}>
           {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci>=ri?'#eff6ff':'transparent'}}>
            {val.toFixed(2)}
           </td>)}
          </tr>)}
         </tbody>
        </table>
       </div>
      </div>

      <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>Tahapan Penyelesaian 2 Tahap:</div>
      <div style={{background:'#fff',border:'1px solid #cbd5e1',borderRadius:'8px',padding:'10px 14px',fontSize:'0.85rem'}}>
       <div><b>Tahap 1 (Substitusi Maju L · y = b):</b> Menemukan vektor perantara y dari baris 1 ke baris {dim}.</div>
       <div style={{marginTop:'4px'}}><b>Tahap 2 (Substitusi Mundur U · x = y):</b> Menemukan solusi akhir x dari baris {dim} ke baris 1.</div>
      </div>
     </div>
    )}

    {!gaussOut&&!luOut&&<div style={{textAlign:'center',color:'#64748b',padding:'40px 10px'}}>
     Pilih metode di atas, atur matriks atau gunakan preset, lalu tekan <b>Hitung Solusi</b>.
    </div>}
   </section>
  </div>
 </>
}

function SlideVisual({index,score}:{index:number;score:number}){
 return <div className="slide-visual">
  <svg viewBox="0 0 200 120" role="img" aria-label="Ilustrasi Visual Slide">
   {index===0&&<g>
    <rect x="20" y="20" width="70" height="70" rx="8" fill="#bee3f8" stroke="#222" strokeWidth="2.5"/>
    <text x="55" y="60" textAnchor="middle" fontWeight="800" fontSize="22" fill="#1e3a8a">L</text>
    <rect x="110" y="20" width="70" height="70" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2.5"/>
    <text x="145" y="60" textAnchor="middle" fontWeight="800" fontSize="22" fill="#065f46">U</text>
    <text x="100" y="60" textAnchor="middle" fontWeight="800" fontSize="18" fill="#222">·</text>
   </g>}
   {index>0&&index<16&&<g>
    <path d="M 20 100 L 90 20 L 170 100 Z" fill="rgba(66, 153, 225, 0.2)" stroke="#222" strokeWidth="2"/>
    <line x1="20" y1="100" x2="170" y2="100" stroke="#059669" strokeWidth="3"/>
    <circle cx="90" cy="20" r="6" fill="#faae2b" stroke="#222" strokeWidth="2"/>
    <text x="90" y="15" textAnchor="middle" fontWeight="700" fontSize="11" fill="#222">Pivot</text>
   </g>}
   {index===16&&<g>
    <circle cx="100" cy="60" r="45" fill="#fef3c7" stroke="#222" strokeWidth="2"/>
    <text x="100" y="55" textAnchor="middle" fontWeight="800" fontSize="16" fill="#b45309">Skor Kuis</text>
    <text x="100" y="78" textAnchor="middle" fontWeight="800" fontSize="20" fill="#222">{score}/3</text>
   </g>}
   {index===17&&<g>
    <rect x="30" y="30" width="140" height="60" rx="10" fill="#bee3f8" stroke="#222" strokeWidth="2"/>
    <text x="100" y="65" textAnchor="middle" fontWeight="800" fontSize="16" fill="#1e3a8a">Tuntas &amp; Siap</text>
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
  ['Sistem Persamaan Lanjar (SPL)','Kumpulan n persamaan linier simultan dengan n peubah yang diselesaikan bersamaan.','A\\mathbf{x}=\\mathbf{b}'],
  ['Elemen Poros (Pivot)','Koefisien a_kk yang digunakan sebagai basis pembagi untuk mengeliminasi variabel pada kolom k.','a_{kk} \\ne 0'],
  ['Pivoting Sebagian (Partial)','Strategi menukar baris untuk menempatkan koefisien bernilai mutlak terbesar pada posisi poros.','\\max_{i\\ge k} |a_{ik}|'],
  ['Faktor Pengali (Multiplier)','Rasio m_ik = a_ik / a_kk yang digunakan untuk mengalikan baris poros sebelum dikurangkan.','m_{ik} = \\frac{a_{ik}}{a_{kk}}'],
  ['Matriks Segitiga Atas (U)','Matriks hasil eliminasi maju di mana semua elemen di bawah diagonal bernilai tepat nol.','u_{ij} = 0,\\ \\forall i > j'],
  ['Matriks Segitiga Bawah (L)','Matriks yang menyimpan riwayat faktor pengali m_ik dengan diagonal bernilai 1.','l_{ii} = 1,\\ l_{ij} = m_{ij}'],
  ['Dekomposisi LU (Doolittle)','Pemfaktoran matriks A menjadi perkalian L dan U, memisahkan operasi eliminasi dan substitusi.','A = L \\cdot U'],
  ['Substitusi Maju & Mundur','Dua tahap efisien O(n²) menyelesaikan sistem segitiga L y = b lalu U x = y.','L\\mathbf{y}=\\mathbf{b} \\implies U\\mathbf{x}=\\mathbf{y}']
 ];
 const refs=[
  'Chapra, S. C., & Canale, R. P. (2015). Numerical Methods for Engineers (7th ed.). McGraw-Hill Education.',
  'Munir, Rinaldi. (2015). Metode Numerik (Revisi). Informatika Bandung.',
  'Burden, R. L., & Faires, J. D. (2010). Numerical Analysis (9th ed.). Brooks/Cole.'
 ];
 return <section className="knowledge">
  <div className="pagehead">
   <div><small>GLOSARIUM &amp; REFERENSI</small><h1>Konsep Dasar SPL &amp; Dekomposisi LU</h1></div>
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
    <img src="/logo_unsil.png" alt="Logo Universitas Siliwangi" className="unsil-header-logo"/>
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
