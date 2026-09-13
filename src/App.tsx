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
 ['Perbandingan Metode: Gauss vs LU','\\mathcal{O}_{\\text{Gauss}}(n^3) \\quad \\longleftrightarrow \\quad \\mathcal{O}_{\\text{LU}}(n^2)',[
  'Gauss Naif: Rawan gagal poros nol. Gauss Modifikasi: Stabil dengan pivoting sebagian.',
  'Dekomposisi LU: Paling unggul untuk sistem invers matriks dan multi-vektor beban ruas kanan.'
 ]],
 ['Rangkuman & Glosarium Konsep Kunci','A\\mathbf{x} = \\mathbf{b} \\iff L(U\\mathbf{x}) = \\mathbf{b}',[
  'Poros (Pivot), Faktor Pengali (Multiplier), Matriks Segitiga, Substitusi Maju/Mundur, dan Residu.'
 ]],
 ['Latihan & Kuis Interaktif','\\text{Kuis Konseptual: } 3\\text{ Babak}',[
  'Kuis 3 babak konsep: Kenapa butuh pivoting? Apa peran matriks L? Bagaimana alur substitusi dua tahap?'
 ]],
 ['Kesimpulan & Pembagian Peran Tim','A\\mathbf{x}^* = \\mathbf{b} \\implies \\mathbf{r} = \\mathbf{0}',[
  'Sistem Persamaan Lanjar diselesaikan secara kokoh dan modular.',
  'Ryan: Pengantar & Demo Lab, Najla: Gauss Pivoting, Nabila: Dekomposisi LU & Tanya Jawab.'
 ]],
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
    'm_{21} = \\frac{2}{4} = 0.5 \\implies R_2 \\leftarrow R_2 - 0.5 R_1',
    'm_{31} = \\frac{-2}{4} = -0.5 \\implies R_3 \\leftarrow R_3 - (-0.5) R_1',
    '\\begin{bmatrix} 4 & -6 & 0 & \\big| & -2 \\\\ 0 & 4 & 1 & \\big| & 6 \\\\ 0 & 4 & 2 & \\big| & 8 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 3: Periksa kolom 2 di bawah poros. Poros } a_{22} = 4.',
    'm_{32} = \\frac{4}{4} = 1 \\implies R_3 \\leftarrow R_3 - (1) R_2',
    '\\begin{bmatrix} 4 & -6 & 0 & \\big| & -2 \\\\ 0 & 4 & 1 & \\big| & 6 \\\\ 0 & 0 & 1 & \\big| & 2 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 4: Substitusi Mundur (Back Substitution):}',
    'R_3 :\\quad x_3 = 2',
    'R_2 :\\quad 4x_2 + (1)(2) = 6 \\implies 4x_2 = 4 \\implies x_2 = 1',
    'R_1 :\\quad 4x_1 - 6(1) + 0 = -2 \\implies 4x_1 = 4 \\implies x_1 = 1'
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
    'm_{21} = \\frac{4}{2} = 2 \\implies U_2 \\leftarrow U_2 - 2 U_1',
    'm_{31} = \\frac{-2}{2} = -1 \\implies U_3 \\leftarrow U_3 - (-1) U_1',
    'U^{(1)} = \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & -8 & -2 \\\\ 0 & 8 & 3 \\end{bmatrix}, \\quad L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ -1 & ? & 1 \\end{bmatrix}'
   ],
   [
    '\\text{Langkah 2: Eliminasi baris 3 kolom 2: } m_{32} = \\frac{8}{-8} = -1 \\implies U_3 \\leftarrow U_3 - (-1) U_2',
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
    <span>Dekomposisi LU Gauss (</span><InlineMath math="A = L \cdot U" /><span>)</span>
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
      <div style={{display:'grid',gap:'10px',maxHeight:'420px',overflowY:'auto'}}>
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
         {st.explanationLatex ? (
          <div style={{color:'#475569',fontSize:'0.82rem',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
           <span>{st.action.includes('Pivoting') ? 'Tata Ancang Poros:' : 'Faktor Pengali:'}</span>
           <InlineMath math={st.explanationLatex} />
          </div>
         ) : (
          <small style={{color:'#64748b',display:'block',marginBottom:'6px'}}>{st.explanation}</small>
         )}
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

    {luOut&&luOut.status==='converged'&&(
     <div>
      <div style={{background:'#ecfdf5',border:'1.5px solid #10b981',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px'}}>
       <div style={{fontWeight:800,color:'#065f46',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
        <span>Solusi Akhir Vektor</span> <InlineMath math="\mathbf{x}" /> <span>(Dekomposisi LU):</span>
       </div>
       <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}}>
        {luOut.x.map((val, idx)=><div key={idx} style={{background:'white',padding:'6px 14px',borderRadius:'8px',border:'1.5px solid #10b981',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',display:'inline-flex',alignItems:'center'}}>
         <InlineMath math={`x_{${idx+1}} = ${Number.isInteger(val)?val:Number(val.toFixed(4))}`} />
        </div>)}
       </div>
       <div style={{fontWeight:700,fontSize:'0.85rem',color:'#047857',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
        <span>Vektor perantara</span> <InlineMath math="\mathbf{y}" /> <span>(dari</span> <InlineMath math="L\mathbf{y} = \mathbf{b}" /><span>):</span>
        <InlineMath math={`\\mathbf{y} = [${luOut.y.map(v=>Number.isInteger(v)?v:Number(v.toFixed(4))).join(', ')}]^T`} />
       </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#1e3a8a',fontSize:'0.82rem',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
         <span>Matriks Segitiga Bawah</span> <InlineMath math="L" />:
        </div>
        <table style={{borderCollapse:'collapse',width:'100%',fontSize:'0.8rem'}}>
         <tbody>
          {luOut.L.map((row, ri)=><tr key={ri}>
           {row.map((val, ci)=><td key={ci} style={{border:'1px solid #cbd5e1',padding:'4px',textAlign:'center',fontWeight:ci===ri?800:400,background:ci<=ri?'#ecfdf5':'transparent'}}>
            {Number.isInteger(val) ? val : val.toFixed(2)}
           </td>)}
          </tr>)}
         </tbody>
        </table>
       </div>

       <div style={{background:'#f8fafc',border:'1.5px solid #cbd5e1',borderRadius:'8px',padding:'10px'}}>
        <div style={{fontWeight:800,color:'#047857',fontSize:'0.82rem',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
         <span>Matriks Segitiga Atas</span> <InlineMath math="U" />:
        </div>
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

      <div style={{fontWeight:800,color:'#1e3a8a',marginBottom:'8px'}}>Tahapan Penyelesaian 2 Tahap:</div>
      <div style={{background:'#fff',border:'1px solid #cbd5e1',borderRadius:'8px',padding:'10px 14px',fontSize:'0.85rem'}}>
       <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
        <b>Tahap 1 (Substitusi Maju</b> <InlineMath math="L\mathbf{y} = \mathbf{b}" /><b>):</b>
        <span>Menemukan vektor perantara y dari baris 1 ke {dim}.</span>
       </div>
       <div style={{marginTop:'6px',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
        <b>Tahap 2 (Substitusi Mundur</b> <InlineMath math="U\mathbf{x} = \mathbf{y}" /><b>):</b>
        <span>Menemukan solusi akhir x dari baris {dim} ke 1.</span>
       </div>
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
  <svg viewBox="0 0 280 150" role="img" aria-label="Ilustrasi Visual Slide">
   {/* Slide 0: Cover SPL & LU */}
   {index===0&&<g>
    <rect x="35" y="20" width="85" height="75" rx="8" fill="#bee3f8" stroke="#222" strokeWidth="2.5"/>
    <text x="77" y="66" textAnchor="middle" fontSize="28" fill="#1e3a8a">L</text>
    <text x="140" y="65" textAnchor="middle" fontSize="24" fill="#222">×</text>
    <rect x="160" y="20" width="85" height="75" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2.5"/>
    <text x="202" y="66" textAnchor="middle" fontSize="28" fill="#065f46">U</text>
    <rect x="75" y="110" width="130" height="28" rx="6" fill="#feebc8" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="128" textAnchor="middle" fontSize="13" fill="#7c2d12">A = L · U</text>
   </g>}

   {/* Slide 1: Mengapa SPL? Ax = b */}
   {index===1&&<g>
    <rect x="25" y="20" width="95" height="100" rx="8" fill="#f8fafc" stroke="#222" strokeWidth="2"/>
    <text x="72" y="44" textAnchor="middle" fontSize="12" fill="#1e3a8a">Matriks A</text>
    <circle cx="48" cy="68" r="5" fill="#3b82f6"/><circle cx="72" cy="68" r="5" fill="#3b82f6"/><circle cx="96" cy="68" r="5" fill="#3b82f6"/>
    <circle cx="48" cy="94" r="5" fill="#3b82f6"/><circle cx="72" cy="94" r="5" fill="#3b82f6"/><circle cx="96" cy="94" r="5" fill="#3b82f6"/>
    <text x="135" y="75" textAnchor="middle" fontSize="20" fill="#222">·</text>
    <rect x="150" y="20" width="40" height="100" rx="8" fill="#ecfdf5" stroke="#222" strokeWidth="2"/>
    <text x="170" y="74" textAnchor="middle" fontSize="16" fill="#047857">x</text>
    <text x="205" y="75" textAnchor="middle" fontSize="18" fill="#222">=</text>
    <rect x="220" y="20" width="40" height="100" rx="8" fill="#fef3c7" stroke="#222" strokeWidth="2"/>
    <text x="240" y="74" textAnchor="middle" fontSize="16" fill="#b45309">b</text>
   </g>}

   {/* Slide 2: Kelemahan Gauss Naif - Poros Nol & Error */}
   {index===2&&<g>
    <circle cx="140" cy="55" r="42" fill="#fee2e2" stroke="#dc2626" strokeWidth="2.5"/>
    <path d="M 140 28 L 140 62" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round"/>
    <circle cx="140" cy="74" r="4" fill="#b91c1c"/>
    <rect x="35" y="112" width="210" height="26" rx="6" fill="#ef4444" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="129" textAnchor="middle" fontSize="11" fill="#fff">Poros a_kk = 0 (Pembagian Nol)</text>
   </g>}

   {/* Slide 3: Tata Ancang Pivoting Sebagian */}
   {index===3&&<g>
    <rect x="30" y="15" width="220" height="36" rx="8" fill="#fed7aa" stroke="#222" strokeWidth="2"/>
    <text x="140" y="38" textAnchor="middle" fontSize="12" fill="#7c2d12">Baris R_k (Poros Kecil)</text>
    <path d="M 55 58 Q 45 74 55 90" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="58,87 55,94 50,89" fill="#ea580c"/>
    <path d="M 225 90 Q 235 74 225 58" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="222,61 225,54 230,59" fill="#ea580c"/>
    <text x="140" y="78" textAnchor="middle" fontSize="12" fill="#ea580c">TUKAR BARIS R_k ↔ R_p</text>
    <rect x="30" y="98" width="220" height="36" rx="8" fill="#bbf7d0" stroke="#222" strokeWidth="2"/>
    <text x="140" y="121" textAnchor="middle" fontSize="12" fill="#14532d">Baris R_p (Max |a_ik|)</text>
   </g>}

   {/* Slide 4: Eliminasi Maju Menuju Segitiga Atas */}
   {index===4&&<g>
    <rect x="40" y="12" width="200" height="100" rx="8" fill="#f8fafc" stroke="#222" strokeWidth="2"/>
    <polygon points="42,14 238,14 238,110" fill="rgba(59, 130, 246, 0.25)"/>
    <polygon points="42,16 42,110 236,110" fill="rgba(16, 185, 129, 0.25)"/>
    <line x1="42" y1="14" x2="238" y2="110" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5,4"/>
    <text x="180" y="50" textAnchor="middle" fontSize="15" fill="#1e3a8a">u_ij</text>
    <text x="95" y="92" textAnchor="middle" fontSize="17" fill="#047857">0 0 0</text>
    <rect x="50" y="120" width="180" height="24" rx="5" fill="#059669" stroke="#222" strokeWidth="1"/>
    <text x="140" y="136" textAnchor="middle" fontSize="11" fill="#fff">Segitiga Bawah = Nol</text>
   </g>}

   {/* Slide 5: Contoh Eliminasi Gauss Modifikasi */}
   {index===5&&<g>
    <rect x="20" y="15" width="95" height="95" rx="8" fill="#f1f5f9" stroke="#222" strokeWidth="2"/>
    <text x="67" y="40" textAnchor="middle" fontSize="13" fill="#334155">[ A | b ]</text>
    <line x1="80" y1="22" x2="80" y2="102" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,2"/>
    <path d="M 125 62 L 145 62" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
    <polygon points="143,57 152,62 143,67" fill="#2563eb"/>
    <rect x="160" y="15" width="95" height="95" rx="8" fill="#ecfdf5" stroke="#222" strokeWidth="2"/>
    <text x="207" y="40" textAnchor="middle" fontSize="13" fill="#047857">[ U | b' ]</text>
    <polygon points="162,75 162,108 215,108" fill="#a7f3d0"/>
    <text x="185" y="98" textAnchor="middle" fontSize="13" fill="#065f46">0</text>
    <rect x="50" y="120" width="180" height="24" rx="5" fill="#1e293b" stroke="#222" strokeWidth="1"/>
    <text x="140" y="136" textAnchor="middle" fontSize="11" fill="#fff">Substitusi Mundur</text>
   </g>}

   {/* Slide 6: Filosofi Dekomposisi LU */}
   {index===6&&<g>
    <rect x="25" y="20" width="65" height="85" rx="8" fill="#fee2e2" stroke="#222" strokeWidth="2"/>
    <text x="57" y="70" textAnchor="middle" fontSize="24" fill="#991b1b">A</text>
    <text x="105" y="68" textAnchor="middle" fontSize="20" fill="#222">=</text>
    <polygon points="120,105 120,20 160,105" fill="#bee3f8" stroke="#222" strokeWidth="2"/>
    <text x="135" y="80" textAnchor="middle" fontSize="18" fill="#1e3a8a">L</text>
    <text x="175" y="68" textAnchor="middle" fontSize="20" fill="#222">·</text>
    <polygon points="190,20 230,20 230,105" fill="#d1fae5" stroke="#222" strokeWidth="2"/>
    <text x="215" y="55" textAnchor="middle" fontSize="18" fill="#065f46">U</text>
    <rect x="35" y="118" width="210" height="26" rx="6" fill="#1e3a8a" stroke="#222" strokeWidth="1"/>
    <text x="140" y="135" textAnchor="middle" fontSize="11" fill="#fff">Dua Modul Segitiga L dan U</text>
   </g>}

   {/* Slide 7: Keunggulan LU (O(n3) vs O(n2)) */}
   {index===7&&<g>
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

   {/* Slide 8: Metode LU Gauss (Doolittle l_ii = 1) */}
   {index===8&&<g>
    <rect x="35" y="8" width="210" height="134" rx="8" fill="#f0fdf4" stroke="#222" strokeWidth="2"/>
    <text x="140" y="28" textAnchor="middle" fontSize="12" fill="#065f46">Matriks Segitiga Bawah L</text>
    <text x="80" y="58" fontSize="15" fill="#047857">1</text>
    <text x="140" y="58" fontSize="15" fill="#94a3b8">0</text>
    <text x="200" y="58" fontSize="15" fill="#94a3b8">0</text>
    <text x="70" y="88" fontSize="13" fill="#ea580c">m₂₁</text>
    <text x="140" y="88" fontSize="15" fill="#047857">1</text>
    <text x="200" y="88" fontSize="15" fill="#94a3b8">0</text>
    <text x="70" y="118" fontSize="13" fill="#ea580c">m₃₁</text>
    <text x="130" y="118" fontSize="13" fill="#ea580c">m₃₂</text>
    <text x="200" y="118" fontSize="15" fill="#047857">1</text>
    <line x1="75" y1="46" x2="208" y2="124" stroke="#10b981" strokeWidth="2" strokeDasharray="4,3"/>
   </g>}

   {/* Slide 9: Struktur L dan U Sempurna */}
   {index===9&&<g>
    <rect x="45" y="15" width="190" height="98" rx="8" fill="#fff" stroke="#222" strokeWidth="2.5"/>
    <polygon points="47,17 233,17 233,111" fill="rgba(59, 130, 246, 0.3)"/>
    <polygon points="47,19 47,111 231,111" fill="rgba(16, 185, 129, 0.3)"/>
    <line x1="47" y1="17" x2="233" y2="111" stroke="#f59e0b" strokeWidth="2.5"/>
    <text x="180" y="55" fontSize="24" fill="#1e3a8a">U</text>
    <text x="95" y="90" fontSize="24" fill="#047857">L</text>
    <rect x="50" y="120" width="180" height="24" rx="5" fill="#0f172a" stroke="#222" strokeWidth="1"/>
    <text x="140" y="136" textAnchor="middle" fontSize="11" fill="#fff">A = L · U Terpenuhi</text>
   </g>}

   {/* Slide 10: Tahap 1 Substitusi Maju Ly = b */}
   {index===10&&<g>
    <rect x="25" y="10" width="230" height="130" rx="10" fill="#ecfdf5" stroke="#222" strokeWidth="2"/>
    <text x="140" y="34" textAnchor="middle" fontSize="13" fill="#065f46">Tahap 1: L · y = b</text>
    <circle cx="65" cy="72" r="18" fill="#a7f3d0" stroke="#047857" strokeWidth="2"/>
    <text x="65" y="78" textAnchor="middle" fontSize="14" fill="#065f46">y₁</text>
    <path d="M 88 72 L 112 72" stroke="#047857" strokeWidth="3" strokeLinecap="round"/>
    <polygon points="109,67 118,72 109,77" fill="#047857"/>
    <circle cx="140" cy="72" r="18" fill="#a7f3d0" stroke="#047857" strokeWidth="2"/>
    <text x="140" y="78" textAnchor="middle" fontSize="14" fill="#065f46">y₂</text>
    <path d="M 163 72 L 187 72" stroke="#047857" strokeWidth="3" strokeLinecap="round"/>
    <polygon points="184,67 193,72 184,77" fill="#047857"/>
    <circle cx="215" cy="72" r="18" fill="#a7f3d0" stroke="#047857" strokeWidth="2"/>
    <text x="215" y="78" textAnchor="middle" fontSize="14" fill="#065f46">y₃</text>
    <text x="140" y="122" textAnchor="middle" fontSize="11" fill="#047857">Substitusi Maju (Atas ke Bawah)</text>
   </g>}

   {/* Slide 11: Tahap 2 Substitusi Mundur Ux = y */}
   {index===11&&<g>
    <rect x="25" y="10" width="230" height="130" rx="10" fill="#eff6ff" stroke="#222" strokeWidth="2"/>
    <text x="140" y="34" textAnchor="middle" fontSize="13" fill="#1e3a8a">Tahap 2: U · x = y</text>
    <circle cx="65" cy="72" r="18" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2"/>
    <text x="65" y="78" textAnchor="middle" fontSize="14" fill="#1e3a8a">x₁</text>
    <path d="M 112 72 L 88 72" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round"/>
    <polygon points="91,67 82,72 91,77" fill="#1d4ed8"/>
    <circle cx="140" cy="72" r="18" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2"/>
    <text x="140" y="78" textAnchor="middle" fontSize="14" fill="#1e3a8a">x₂</text>
    <path d="M 187 72 L 163 72" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round"/>
    <polygon points="166,67 157,72 166,77" fill="#1d4ed8"/>
    <circle cx="215" cy="72" r="18" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2"/>
    <text x="215" y="78" textAnchor="middle" fontSize="14" fill="#1e3a8a">x₃</text>
    <text x="140" y="122" textAnchor="middle" fontSize="11" fill="#1e40af">Substitusi Mundur (Bawah ke Atas)</text>
   </g>}

   {/* Slide 12: Contoh Lengkap 3x3 */}
   {index===12&&<g>
    <rect x="20" y="15" width="105" height="50" rx="8" fill="#d1fae5" stroke="#222" strokeWidth="2"/>
    <text x="72" y="38" textAnchor="middle" fontSize="12" fill="#065f46">L · y = b</text>
    <text x="72" y="55" textAnchor="middle" fontSize="10" fill="#047857">y = [5, -12, 2]</text>
    <path d="M 130 40 L 145 40 L 145 95 L 155 95" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="155" y="70" width="105" height="50" rx="8" fill="#dbeafe" stroke="#222" strokeWidth="2"/>
    <text x="207" y="93" textAnchor="middle" fontSize="12" fill="#1e40af">U · x = y</text>
    <text x="207" y="110" textAnchor="middle" fontSize="10" fill="#1d4ed8">x = [1, 1, 2] ★</text>
   </g>}

   {/* Slide 13: Verifikasi Residu r = Ax - b */}
   {index===13&&<g>
    <circle cx="140" cy="55" r="45" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5"/>
    <circle cx="140" cy="55" r="30" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5"/>
    <circle cx="140" cy="55" r="15" fill="#34d399"/>
    <path d="M 130 55 L 137 62 L 152 47" stroke="#064e3b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="40" y="115" width="200" height="24" rx="5" fill="#059669" stroke="#222" strokeWidth="1"/>
    <text x="140" y="131" textAnchor="middle" fontSize="11" fill="#fff">r = Ax - b ≈ 0 (VALID)</text>
   </g>}

   {/* Slide 14: Perbandingan Karakteristik Metode */}
   {index===14&&<g>
    <rect x="20" y="20" width="70" height="95" rx="6" fill="#fee2e2" stroke="#222" strokeWidth="1.5"/>
    <text x="55" y="44" textAnchor="middle" fontSize="11" fill="#991b1b">Naif</text>
    <text x="55" y="75" textAnchor="middle" fontSize="24">⚠️</text>
    <text x="55" y="102" textAnchor="middle" fontSize="9" fill="#7f1d1d">Rawan 0</text>
    <rect x="105" y="20" width="70" height="95" rx="6" fill="#fef3c7" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="44" textAnchor="middle" fontSize="11" fill="#92400e">Pivoting</text>
    <text x="140" y="75" textAnchor="middle" fontSize="24">⚖️</text>
    <text x="140" y="102" textAnchor="middle" fontSize="9" fill="#78350f">Stabil</text>
    <rect x="190" y="20" width="70" height="95" rx="6" fill="#d1fae5" stroke="#222" strokeWidth="1.5"/>
    <text x="225" y="44" textAnchor="middle" fontSize="11" fill="#065f46">LU</text>
    <text x="225" y="75" textAnchor="middle" fontSize="24">🚀</text>
    <text x="225" y="102" textAnchor="middle" fontSize="9" fill="#064e3b">Multi-b</text>
   </g>}

   {/* Slide 15: Rangkuman & Glosarium Konsep Kunci */}
   {index===15&&<g>
    <rect x="35" y="15" width="210" height="90" rx="8" fill="#fdf4ff" stroke="#222" strokeWidth="2"/>
    <circle cx="85" cy="50" r="22" fill="#f5d0fe" stroke="#86198f" strokeWidth="2"/>
    <text x="85" y="57" textAnchor="middle" fontSize="18" fill="#86198f">Σ</text>
    <circle cx="195" cy="50" r="22" fill="#fed7aa" stroke="#c2410c" strokeWidth="2"/>
    <text x="195" y="57" textAnchor="middle" fontSize="16" fill="#c2410c">LU</text>
    <rect x="45" y="115" width="190" height="24" rx="5" fill="#a21caf"/>
    <text x="140" y="131" textAnchor="middle" fontSize="10.5" fill="#fff">Fondasi Linear Numerik</text>
   </g>}

   {/* Slide 16: Skor Kuis */}
   {index===16&&<g>
    <circle cx="140" cy="58" r="48" fill="#fef3c7" stroke="#222" strokeWidth="2.5"/>
    <circle cx="140" cy="58" r="38" fill="#faae2b" stroke="#222" strokeWidth="1.5"/>
    <text x="140" y="50" textAnchor="middle" fontSize="13" fill="#78350f">SKOR KUIS</text>
    <text x="140" y="76" textAnchor="middle" fontSize="24" fill="#222">{score} / 3</text>
    <text x="140" y="128" textAnchor="middle" fontSize="12" fill="#ea580c">Evaluasi Materi Kelompok</text>
   </g>}

   {/* Slide 17: Penutup & Pembagian Peran Tim */}
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
