import {useCallback,useEffect,useRef,useState,type ChangeEvent} from 'react'
import {BlockMath,InlineMath} from 'react-katex'
import {BookOpen,ChartNoAxesCombined,ChevronLeft,ChevronRight,Clipboard,Download,FlaskConical,Maximize2,MessageCircle,Pause,Play,Presentation,Search,Target,Trophy,User,Users,ZoomIn,ZoomOut} from 'lucide-react'
import {expression,expressionToTex,solve,type Config,type Method,type Result} from './engine'
import 'katex/dist/katex.min.css'
import './App.css'

const defaults:Config={f:'x^3-2*x-5',g:'(2*x+5)^(1/3)',x0:2,x1:3,tolerance:1e-6,maxIterations:50}
const presets=[
 ['Polinomial Standar','x^3-2*x-5=0','x^3-2*x-5','(2*x+5)^(1/3)',2,3],
 ['Eksponensial','e^{-x}-x=0','exp(-x)-x','exp(-x)',0,1],
 ['Trigonometri','\\cos(x)-x=0','cos(x)-x','cos(x)',1,0],
 ['Logaritma Alami','x\\ln(x)-1=0','x*ln(x)-1','exp(1/x)',2,1]
] as const

const identity={
 course:'Metode Numerik (Kelas C)',
 code:'KP21517001',
 program:'Pendidikan Matematika',
 faculty:'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)',
 group:'Kelompok 4',
 meeting:'Pertemuan 05',
 topic:'Solusi Persamaan & Sistem Persamaan Nirlanjar (Newton-Raphson, Secant, & SPNL)'
} as const

const members=[
 ['Ryan Wardiana','232151098'],
 ['Najla Aisyah','232151087'],
 ['Nabila Fitria Nuroktavianty Rosadi','232151088']
] as const

const slides=[
 ['Solusi Persamaan & SPNL','f(x)=0\\quad\\&\\quad \\mathbf{F}(\\mathbf{x})=\\mathbf{0}',[
  'Kelompok 4 · Presentasi Pertemuan 05 Metode Numerik (Kelas C).',
  'Membahas tuntas Metode Newton-Raphson, Metode Secant, dan Sistem Persamaan Nirlanjar (SPNL).'
 ]],
 ['Mengapa metode numerik?','f(x)=x^3-2x-5=0',[
  'Banyak persamaan sains & rekayasa tidak punya solusi analitis rumus tertutup.',
  'Metode numerik mencari akar lewat lelaran (iterasi) terarah sampai galat memenuhi toleransi.'
 ]],
 ['Peta metode: Tertutup vs Terbuka','\\text{Tertutup}\\quad\\text{vs}\\quad\\text{Terbuka}',[
  'Metode tertutup (Bisection & Regula Falsi): Mengurung akar di selang [a,b], pasti konvergen tetapi lambat.',
  'Metode terbuka (Newton, Secant, SPNL): Memakai tebakan lokal tanpa kurungan, jauh lebih cepat melesat ke akar.'
 ]],
 ['Newton: garis singgung','x_{r+1}=x_r-\\frac{f(x_r)}{f\'(x_r)}',[
  'Tarik garis singgung kurva f(x) di titik (x_r, f(x_r)) dengan kemiringan gradien f\'(x_r).',
  'Titik potong garis singgung tersebut dengan sumbu-x menjadi hampiran akar baru x_{r+1}.'
 ]],
 ['Newton dari deret Taylor','f(x_{r+1})\\approx f(x_r)+f\'(x_r)(x_{r+1}-x_r)=0',[
  'Uraian Taylor orde-1 melinierkan fungsi f di sekitar tebakan x_r.',
  'Menetapkan f(x_{r+1})=0 langsung menghasilkan rumus lelaran Newton-Raphson.'
 ]],
 ['Kapan Newton berhasil?','p=2\\quad(\\text{Konvergensi Kuadratik})',[
  'Konvergensi kuadratik: Jumlah digit desimal benar berlipat ganda pada setiap iterasi.',
  'Kelemahan: Gagal bila f\'(x_r)=0 (pembagian nol), berosilasi, atau tebakan awal terlalu jauh.'
 ]],
 ['Contoh Newton-Raphson','f(x)=x^3-2x-5=0',[
  'Penyelesaian bertahap: Rumus variabel → Substitusi nilai → Evaluasi galat relatif.'
 ]],
 ['Secant: tali busur','x_{r+1}=x_r-\\frac{f(x_r)(x_r-x_{r-1})}{f(x_r)-f(x_{r-1})}',[
  'Dua titik (x_{r-1}, f(x_{r-1})) dan (x_r, f(x_r)) dihubungkan oleh garis tali busur (secant).',
  'Kemiringan tali busur menggantikan turunan analitis f\'(x) yang seringkali rumit dicari.'
 ]],
 ['Karakter & ordo Secant','p\\approx1.618\\quad(\\text{Rasio Emas }\\phi)',[
  'Membutuhkan dua tebakan awal x_0 dan x_1 (tidak harus mengurung akar).',
  'Konvergensi superlinier (p ≈ 1.618), mendekati kecepatan Newton tanpa beban turunan analitis.'
 ]],
 ['Contoh Secant','f(x)=x^3-2x-5=0',[
  'Simulasi perhitungan angka tali busur bertahap dengan dua tebakan awal.'
 ]],
 ['Sistem Persamaan Nirlanjar (SPNL)','\\begin{cases} f_1(x, y) = 0 \\\\ f_2(x, y) = 0 \\end{cases}',[
  'Mencari titik potong simultan dari dua atau lebih persamaan nirlanjar multivariabel.',
  'Contoh: Titik potong lingkaran x^2+y^2-4=0 dan garis linier x-y-1=0.'
 ]],
 ['SPNL: Matriks Jacobian','J(\\mathbf{x})\\cdot\\Delta\\mathbf{x}=-\\mathbf{F}(\\mathbf{x})',[
  'Matriks Jacobian J memuat turunan parsial tingkat satu terhadap semua variabel peubah.',
  'Vektor koreksi Δx dihitung per iterasi, lalu diperbarui: x_{r+1} = x_r + Δx.'
 ]],
 ['Contoh SPNL (Jacobian)','\\begin{cases} x^2+y^2-4=0 \\\\ x-y-1=0 \\end{cases}',[
  'Penyelesaian numerik SPNL multivariabel dengan Matriks Jacobian langkah demi langkah.'
 ]],
 ['Fixed-Point & Jaring Cobweb','f(x)=0\\iff x=g(x)',[
  'Mengubah persamaan f(x)=0 menjadi bentuk eksplisit x = g(x), lalu diiterasi x_{r+1} = g(x_r).',
  'Teorema Kontraksi: Konvergen jika |g\'(x)| < 1 di sekitar akar (visual jaring laba-laba cobweb).'
 ]],
 ['Bandingkan metode','\\text{Kecepatan vs Kebutuhan Komputasi}',[
  'Newton: Ordo 2 (sangat cepat, wajib turunan f\'). Secant: Ordo 1.618 (cepat, tanpa turunan).',
  'SPNL: Menyelesaikan sistem multi-variabel simultan melalui invers atau eliminasi Jacobian.'
 ]],
 ['Panduan memilih metode','\\text{Kriteria Praktis}',[
  'Pilih Newton jika f\'(x) mudah didiferensialkan analitis. Pilih Secant jika fungsi rumit/data sensor.',
  'Gunakan skema SPNL Jacobian jika berhadapan dengan model multidimensi simultan.'
 ]],
 ['Latihan & Kuis Interaktif','\\text{Uji Pemahaman Audiens}',[
  'Kuis interaktif 3 pertanyaan konsep untuk menguji pemahaman materi kelompok.'
 ]],
 ['Kesimpulan & diskusi','\\mathbf{x}^*\\text{ Solusi Numerik Terverifikasi}',[
  'Metode terbuka efisien tinggi dengan syarat pemilihan tebakan awal yang dekat.',
  'Sesi tanya jawab, diskusi kelas, dan demonstrasi komputasi interaktif di Numerical Lab.'
 ]]
] as const

const examples={
 'Contoh Newton-Raphson':{
  prompt:['\\text{Tentukan akar }f(x)=x^3-2x-5=0','x_0=2,\\qquad\\varepsilon=0.001'],
  steps:[
   ['f\'(x)=3x^2-2'],
   ['f(2)=2^3-2(2)-5=-1', 'f\'(2)=3(2)^2-2=10', 'x_1=2-\\frac{-1}{10}=2.1000', '|\\varepsilon_a|=\\left|\\frac{2.1-2}{2.1}\\right|\\times100\\%=4.76\\%'],
   ['f(2.1)=0.061,\\qquad f\'(2.1)=11.23', 'x_2=2.1-\\frac{0.061}{11.23}=2.0945', '|\\varepsilon_a|=\\left|\\frac{2.0945-2.1}{2.0945}\\right|\\times100\\%=0.26\\%', '\\text{Mendekati konvergen!}']
  ],
  conclusion:['Hasil lelaran ', 'x_2 = 2.0945', ' menghasilkan galat relatif ', '0.26\\% < 1\\%', '. Nilai akar sejati analitis adalah ', 'x^* \\approx 2.09455149', '.']
 },
 'Contoh Secant':{
  prompt:['\\text{Selesaikan }f(x)=x^3-2x-5=0','x_0=1,\\qquad x_1=2'],
  steps:[
   ['f(1)=1^3-2(1)-5=-6', 'f(2)=2^3-2(2)-5=-1'],
   ['x_2=x_1-\\frac{f(x_1)(x_1-x_0)}{f(x_1)-f(x_0)}'],
   ['x_2=2-\\frac{(-1)(2-1)}{-1-(-6)}=2-\\frac{-1}{5}=2.2000', '|\\varepsilon_a|=\\left|\\frac{2.2-2}{2.2}\\right|\\times100\\%=9.09\\%']
  ],
  conclusion:['Hasil ', 'x_2 = 2.2000', ' sudah mendekati akar. Iterasi berlanjut memakai ', 'x_1 = 2', ' dan ', 'x_2 = 2.2', ' tanpa perlu mencari turunan analitis.']
 },
 'Contoh SPNL (Jacobian)':{
  prompt:[
   '\\begin{cases} f_1(x, y) = x^2 + y^2 - 4 = 0 \\\\ f_2(x, y) = x - y - 1 = 0 \\end{cases}',
   '\\mathbf{x}_0 = (x_0, y_0) = (2, 1)'
  ],
  steps:[
   [
    '\\text{Matriks Jacobian } J(x, y) = \\begin{bmatrix} \\frac{\\partial f_1}{\\partial x} & \\frac{\\partial f_1}{\\partial y} \\\\[6pt] \\frac{\\partial f_2}{\\partial x} & \\frac{\\partial f_2}{\\partial y} \\end{bmatrix} = \\begin{bmatrix} 2x & 2y \\\\ 1 & -1 \\end{bmatrix}'
   ],
   [
    'J(2, 1) = \\begin{bmatrix} 2(2) & 2(1) \\\\ 1 & -1 \\end{bmatrix} = \\begin{bmatrix} 4 & 2 \\\\ 1 & -1 \\end{bmatrix}',
    '\\mathbf{F}(2, 1) = \\begin{bmatrix} 2^2 + 1^2 - 4 \\\\ 2 - 1 - 1 \\end{bmatrix} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}'
   ],
   [
    '\\det(J) = (4)(-1) - (2)(1) = -4 - 2 = -6',
    'J^{-1} = \\frac{1}{-6} \\begin{bmatrix} -1 & -2 \\\\ -1 & 4 \\end{bmatrix}'
   ],
   [
    '\\begin{bmatrix} \\Delta x \\\\ \\Delta y \\end{bmatrix} = -J^{-1} \\mathbf{F} = -\\frac{1}{-6} \\begin{bmatrix} -1 & -2 \\\\ -1 & 4 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} = \\begin{bmatrix} -1/6 \\\\ -1/6 \\end{bmatrix} \\approx \\begin{bmatrix} -0.1667 \\\\ -0.1667 \\end{bmatrix}'
   ],
   [
    '\\mathbf{x}_1 = \\begin{bmatrix} x_0 \\\\ y_0 \\end{bmatrix} + \\begin{bmatrix} \\Delta x \\\\ \\Delta y \\end{bmatrix} = \\begin{bmatrix} 2 - 0.1667 \\\\ 1 - 0.1667 \\end{bmatrix} = \\begin{bmatrix} 1.8333 \\\\ 0.8333 \\end{bmatrix}'
   ]
  ],
  conclusion:['Hampiran iterasi 1 adalah ', '(x_1, y_1) = (1.8333, 0.8333)', '. Titik potong sejati analitis adalah ', '(1.8229, 0.8229)', ', galat sangat kecil hanya dalam 1 langkah!']
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
  prompt:'\\text{Diberikan }f(x)=x^2-4,\\ f\'(x)=2x,\\ x_0=3.\\text{ Berapakah hampiran }x_1\\text{ dengan Newton-Raphson?}',
  options:['2.150', '2.333', '2.500', '2.000'],
  answer:1
 },
 {
  prompt:'\\text{Mengapa metode Secant sering lebih dipilih di komputasi industri dibanding Newton-Raphson?}',
  options:['Selalu pasti konvergen tanpa syarat', "Tidak memerlukan rumus turunan analitis f'(x)", 'Hanya butuh 1 titik tebakan awal', 'Ordo konvergensinya kubik (p=3)'],
  answer:1
 },
 {
  prompt:'\\text{Pada SPNL dengan 2 persamaan }f_1(x,y)=0\\text{ dan }f_2(x,y)=0,\\text{ apa peran Matriks Jacobian }J\\text{?}',
  options:['Menggantikan tebakan awal titik x_0', 'Menyimpan nilai kuadrat fungsi', 'Menjadi matriks gradien turunan parsial pembagi koreksi lelaran', 'Menghilangkan semua suku nirlanjar secara mutlak'],
  answer:2
 }
] as const

function QuizExplanation({question}:{question:number}){
 return <p>{
  question===0?<>Rumus Newton-Raphson: <InlineMath math={'x_1 = x_0 - \\frac{f(x_0)}{f\'(x_0)} = 3 - \\frac{3^2 - 4}{2(3)} = 3 - \\frac{5}{6} = 2.333'} /></>:
  question===1?<>Metode Secant mengganti turunan <InlineMath math="f'(x)"/> dengan kemiringan tali busur dari dua titik, sehingga sangat ideal jika rumus turunan rumit didapat atau berupa data diskrit.</>:
  <>Matriks Jacobian <InlineMath math="J"/> memuat seluruh turunan parsial orde satu yang berperan sebagai gradien multivariabel penentu arah koreksi lelaran <InlineMath math="J \\cdot \\Delta \\mathbf{x} = -\\mathbf{F}"/>.</>
 }</p>
}

function Quiz({answers,onChange}:{answers:(number|undefined)[];onChange:(answers:(number|undefined)[])=>void}){
 return <div className="quiz">
  {questions.map((q,n)=>{
   const picked=answers[n];
   return <article key={q.prompt}>
    <BlockMath math={`${n+1}.\\quad${q.prompt}`}/>
    <div className="options">
     {q.options.map((o,j)=><button className={picked===j?(j===q.answer?'correct':'wrong'):''} onClick={()=>{const next=[...answers];next[n]=j;onChange(next)}} key={o}><b>{String.fromCharCode(65+j)}.</b><span>{o}</span></button>)}
    </div>
    {picked!==undefined&&<div className={`feedback ${picked===q.answer?'correct':'wrong'}`}>
     <b>{picked===q.answer?'Tepat Sekali!':'Kurang Tepat'}</b>
     <QuizExplanation question={n}/>
    </div>}
   </article>
  })}
 </div>
}

function SlideVisual({index,score=0}:{index:number;score?:number}){
 if(index===16)return <div className="slide-visual quiz-score"><Trophy/><strong>{score} / 3</strong><Target/><span>SKOR LIVE</span></div>;
 if(index===17)return <div className="slide-visual discussion"><MessageCircle/><strong>Diskusi & Tanya Jawab</strong></div>;
 if(index===2)return <div className="slide-visual method-branches"><article>TERTUTUP</article><article>TERBUKA</article><small>PETA METODE</small></div>;
 if(index===5)return <div className="slide-visual speed-visual"><div className="speed-bars"><i/><i/><i/></div><InlineMath math="p=2"/><small>KONVERGENSI KUADRATIK</small></div>;
 if(index===8)return <div className="slide-visual phi-visual"><strong>1.618</strong><InlineMath math="\phi\approx1.618"/><small>RASIO EMAS</small></div>;
 if(index===10||index===11)return <div className="slide-visual method-matrix"><span>f₁(x,y)=0</span><span>Jacobian J</span><span>f₂(x,y)=0</span><span>Δx = -J⁻¹F</span></div>;
 if(index===15)return <div className="slide-visual method-matrix"><span>Newton</span><span>f'(x) Ordo 2</span><span>Secant</span><span>2 Titik φ=1.618</span><span>SPNL</span><span>Matriks J</span><span>Fixed-Point</span><span>{'|g\'| < 1'}</span></div>;
 
 const secant=index===7,cobweb=[13].includes(index),comparison=index===14;
 return <div className={`slide-visual visual-${index}`}>
  <svg viewBox="0 0 260 140" aria-hidden="true">
   <path d="M15 110H248M42 12V128"/>
   {index===1&&<><path className="curve" d="M20 35C75 25 80 125 145 105S205 30 240 42"/><circle className="root" cx="145" cy="110" r="6"/></>}
   {[3,4].includes(index)&&<><path className="curve" d="M25 110C75 100 95 20 225 30"/><path className="accent" d="M55 105L215 10"/></>}
   {secant&&<><path className="curve" d="M20 105C65 20 105 125 235 35"/><path className="accent" d="M55 88L210 30"/></>}
   {cobweb&&<><path className="diagonal" d="M25 120L225 20"/><path className="curve" d="M25 95C85 25 155 35 225 45"/><path className="accent" d="M55 105V72H105V58H145V48H175"/></>}
   {comparison&&<><path className="newton-line" d="M25 25L80 65L130 92L180 108L230 116"/><path className="secant-line" d="M25 35L80 55L130 78L180 96L230 108"/><path className="fixed-line" d="M25 45L80 60L130 70L180 80L230 90"/></>}
  </svg>
 </div>
}

function CursorFollower(){
 const dotRef=useRef<HTMLDivElement>(null),trailRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let mx=-100,my=-100,tx=-100,ty=-100,hovered=false,clicking=false,visible=false;
  const onMove=(e:MouseEvent)=>{
   mx=e.clientX;my=e.clientY;
   if(!visible){visible=true;tx=mx;ty=my}
   if(dotRef.current){dotRef.current.style.transform=`translate3d(${mx}px,${my}px,0)`;dotRef.current.style.opacity='1'}
   const target=e.target as HTMLElement|null;
   hovered=Boolean(target?.closest('button,a,input,select,textarea,[role="button"],canvas,.tab'))
  };
  const onDown=()=>{clicking=true},onUp=()=>{clicking=false},onLeave=()=>{visible=false;if(dotRef.current)dotRef.current.style.opacity='0';if(trailRef.current)trailRef.current.style.opacity='0'};
  let rafId:number;
  const loop=()=>{
   if(visible){
    tx+=(mx-tx)*0.22;ty+=(my-ty)*0.22;
    if(trailRef.current){
     const scale=clicking?0.75:hovered?1.8:1;
     trailRef.current.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${scale})`;
     trailRef.current.style.opacity='1';
     trailRef.current.dataset.hovered=hovered?'true':'false'
    }
   }
   rafId=requestAnimationFrame(loop)
  };
  rafId=requestAnimationFrame(loop);
  window.addEventListener('mousemove',onMove,{passive:true});
  window.addEventListener('mousedown',onDown,{passive:true});
  window.addEventListener('mouseup',onUp,{passive:true});
  document.addEventListener('mouseleave',onLeave);
  return()=>{
   cancelAnimationFrame(rafId);
   window.removeEventListener('mousemove',onMove);
   window.removeEventListener('mousedown',onDown);
   window.removeEventListener('mouseup',onUp);
   document.removeEventListener('mouseleave',onLeave)
  }
 },[]);
 return <><div ref={dotRef} className="cursor-dot" aria-hidden="true"/><div ref={trailRef} className="cursor-trail" aria-hidden="true"/></>
}

function DeveloperLogo(){
 return <svg className="developer-logo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <path fill="#faae2b" stroke="#222" strokeWidth="3" d="M18 29V18a14 14 0 0 1 28 0v11z"/>
  <circle cx="32" cy="20" r="11" fill="#bee3f8" stroke="#222" strokeWidth="3"/>
  <path fill="#4299e1" stroke="#222" strokeWidth="3" strokeLinejoin="round" d="M9 58l4-25h38l4 25z"/>
  <rect x="17" y="34" width="30" height="20" rx="2" fill="#fff" stroke="#222" strokeWidth="3"/>
  <text x="32" y="48" textAnchor="middle" fontFamily="monospace" fontSize="12" fontWeight="700" fill="#222">{'</>'}</text>
  <path d="M5 58h54" stroke="#222" strokeWidth="4" strokeLinecap="round"/>
 </svg>
}

function App(){
 const [route,setRoute]=useState(location.hash.slice(1)||'/deck');
 useEffect(()=>{
  const h=()=>setRoute(location.hash.slice(1)||'/deck');
  addEventListener('hashchange',h);
  return()=>removeEventListener('hashchange',h)
 },[]);

 return <>
  <CursorFollower/>
  <header>
   <a className="brand brand-unsil" href="#/deck" aria-label="Universitas Siliwangi, kembali ke deck">
    <img src="/unsil_emblem.png" alt="Logo Universitas Siliwangi" className="unsil-header-logo"/>
    <span className="brand-text">Universitas Siliwangi</span>
   </a>
   <span className="badge">KELOMPOK 4 · PERTEMUAN 05</span>
   <button className="icon" aria-label="Layar penuh" onClick={()=>document.documentElement.requestFullscreen()}>
    <Maximize2/>
   </button>
  </header>
  <nav>
   {[
    ['/deck',Presentation,'Deck'],
    ['/lab',FlaskConical,'Numerical Lab'],
    ['/arena',ChartNoAxesCombined,'Arena'],
    ['/knowledge',BookOpen,'Knowledge']
   ].map(([p,I,n])=><button className={route.startsWith(p as string)?'active':''} onClick={()=>location.hash=p as string} key={p as string}><I/>{n as string}</button>)}
  </nav>
  <main>
   {route.startsWith('/deck')?<Deck/>:route.startsWith('/lab')?<Lab/>:route==='/arena'?<Arena/>:<Knowledge/>}
  </main>
  <footer>
   <span className="footer-brand"><DeveloperLogo/> Librayn Dev · Kelas C Pendidikan Matematika FKIP UNSIL</span>
  </footer>
 </>
}

function Deck(){
 const last=slides.length-1,
  [i,setI]=useState(Math.min(last,Math.max(0,+location.hash.split('/')[2]||0))),
  [open,setOpen]=useState(false),
  [answers,setAnswers]=useState<(number|undefined)[]>([]);

 const score=answers.reduce<number>((total,picked,n)=>total+(picked===questions[n].answer?1:0),0);
 const move=useCallback((n:number)=>{
  n=Math.min(last,Math.max(0,n));
  setI(n);
  history.replaceState(null,'',`#/deck/${n}`)
 },[last]);

 useEffect(()=>{
  const k=(e:KeyboardEvent)=>{
   if((e.target as HTMLElement).matches('button,input,select,textarea'))return;
   if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();move(i+1)}
   if(e.key==='ArrowLeft')move(i-1);
   if(e.key.toLowerCase()==='f')document.documentElement.requestFullscreen();
   if(e.key.toLowerCase()==='i')setOpen(x=>!x)
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
   <div style={{marginTop:'8px',display:'inline-flex',gap:'8px',alignItems:'center'}}>
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

const tools=[['x','x'],['+','+'],['-','-'],['×','*'],['÷','/'],['²','^2'],['³','^3'],['ⁿ','^()'],['√x','sqrt()'],['∛x','cbrt()'],['eˣ','exp()'],['ln(x)','ln()'],['sin(x)','sin()'],['cos(x)','cos()']] as const

function MathInput({label,value,onChange}:{label:React.ReactNode;value:string;onChange:(v:string)=>void}){
 const ref=useRef<HTMLInputElement>(null);
 const insert=(syntax:string)=>{
  const input=ref.current;
  if(!input)return;
  const a=input.selectionStart??value.length,b=input.selectionEnd??a,inside=syntax.indexOf(')');
  const next=value.slice(0,a)+syntax+value.slice(b);
  onChange(next);
  requestAnimationFrame(()=>{
   input.focus();
   const caret=a+(inside<0?syntax.length:inside);
   input.setSelectionRange(caret,caret)
  })
 };
 let tex='';
 try{tex=expressionToTex(value)}catch{tex=''}
 return <label className="math-input">
  <span>{label}</span>
  <div className="math-tools">
   {tools.map(([name,syntax])=><button type="button" title={`Sisipkan ${name}`} onMouseDown={e=>e.preventDefault()} onClick={()=>insert(syntax)} key={name}>{name}</button>)}
  </div>
  <input ref={ref} value={value} onChange={e=>onChange(e.target.value)}/>
  <div className={`math-preview ${tex?'':'invalid'}`}>{tex?<BlockMath math={tex}/>:<span>Ekspresi belum valid.</span>}</div>
 </label>
}

function Presets({set}:{set:(c:Config)=>void}){
 return <div className="presets">
  {presets.map(p=><button key={p[0]} onClick={()=>set({...defaults,f:p[2],g:p[3],x0:p[4],x1:p[5]})}><b>{p[0]}</b><InlineMath math={p[1]}/></button>)}
 </div>
}

function NumberInput({name,math,value,onChange}:{name:string;math:string;value:number;onChange:(n:number)=>void}){
 return <label>{name} <InlineMath math={math}/><input type="number" value={value} onChange={e=>onChange(+e.target.value)}/></label>
}

function Lab(){
 const [c,setC]=useState<Config>(()=>{
  try{return {...defaults,...JSON.parse(localStorage.getItem('numerical-studio:last-session')||'{}')}}catch{return defaults}
 }),[method,setMethod]=useState<Method>('newton'),[result,setResult]=useState<Result|undefined>(undefined),[step,setStep]=useState(0),[play,setPlay]=useState(false);

 useEffect(()=>localStorage.setItem('numerical-studio:last-session',JSON.stringify(c)),[c]);
 useEffect(()=>{
  if(!play||!result)return;
  const id=setInterval(()=>setStep(x=>{
   if(x>=result.rows.length-1){setPlay(false);return x}
   return x+1
  }),600);
  return()=>clearInterval(id)
 },[play,result]);

 const run=()=>{
  const r=solve(method,c);
  setResult(r);
  setStep(Math.max(0,r.rows.length-1))
 };
 const row=result?.rows[step];

 return <>
  <div className="pagehead">
   <div><small>LABORATORIUM NUMERIK</small><h1>Eksperimen langkah demi langkah.</h1></div>
   <span className={`status ${result?.status==='converged'?'ok':''}`}>{result?.status||'siap eksperimen'}</span>
  </div>
  <Presets set={setC}/>
  <div className="methods">
   {(['newton','secant','fixed'] as Method[]).map(m=><button className={`${m} ${method===m?'chosen':''}`} onClick={()=>setMethod(m)} key={m}>{m==='newton'?'Newton-Raphson':m==='secant'?'Metode Secant':'Fixed-Point'}</button>)}
  </div>
  <div className="labgrid">
   <section className="panel controls">
    <h2>Konfigurasi Masukan</h2>
    <MathInput label={<>Fungsi <InlineMath math="f(x)"/></>} value={c.f} onChange={f=>setC({...c,f})}/>
    {method==='fixed'&&<MathInput label={<>Transformasi <InlineMath math="g(x)"/></>} value={c.g} onChange={g=>setC({...c,g})}/>}
    <div className="formgrid">
     <NumberInput name="Tebakan Awal" math="x_0" value={c.x0} onChange={x0=>setC({...c,x0})}/>
     {method==='secant'&&<NumberInput name="Tebakan Kedua" math="x_1" value={c.x1} onChange={x1=>setC({...c,x1})}/>}
     <NumberInput name="Batas Galat Toleransi" math="\\varepsilon" value={c.tolerance} onChange={tolerance=>setC({...c,tolerance})}/>
     <NumberInput name="Maksimum Iterasi" math="N_{\\max}" value={c.maxIterations} onChange={maxIterations=>setC({...c,maxIterations})}/>
    </div>
    <button className="primary" onClick={run}><Play/> Jalankan Simulasi</button>
   </section>
   <section className="panel display">
    <Plot config={c} method={method} result={result} step={step}/>
    {result&&<div className="playback">
     <button onClick={()=>setPlay(!play)}>{play?<Pause/>:<Play/>}{play?'Jeda':'Jalankan Animasi'}</button>
     <button disabled={!step} onClick={()=>setStep(step-1)}><ChevronLeft/>Mundur</button>
     <span>Iterasi ke-<b>{step}</b> dari {result.rows.length-1}</span>
     <button disabled={step===result.rows.length-1} onClick={()=>setStep(step+1)}>Maju<ChevronRight/></button>
    </div>}
    {row&&<div className="current-step">
     <article><small>Hampiran x_r</small><strong>{row.x.toFixed(6)}</strong></article>
     <article><small>Nilai f(x_r)</small><strong>{row.fx.toExponential(4)}</strong></article>
     <article><small>Galat Relatif |ε_a|</small><strong>{row.error.toFixed(4)}%</strong></article>
    </div>}
   </section>
  </div>
  {result&&<Table result={result}/>}
 </>
}

function Plot({config,method,result,step}:{config:Config;method:Method;result?:Result;step:number}){
 const canvas=useRef<HTMLCanvasElement>(null),view=useRef({cx:0,cy:0,scale:55});
 const draw=()=>{
  const el=canvas.current;
  if(!el)return;
  const d=devicePixelRatio,w=el.clientWidth,h=el.clientHeight;
  el.width=w*d;el.height=h*d;
  const q=el.getContext('2d')!;
  q.scale(d,d);
  q.clearRect(0,0,w,h);
  const v=view.current,X=(x:number)=>w/2+(x-v.cx)*v.scale,Y=(y:number)=>h/2-(y-v.cy)*v.scale;
  q.strokeStyle='#e2e8f0';q.lineWidth=1;
  for(let x=Math.floor(v.cx-w/v.scale/2);x<v.cx+w/v.scale/2;x++)line(q,X(x),0,X(x),h);
  for(let y=Math.floor(v.cy-h/v.scale/2);y<v.cy+h/v.scale/2;y++)line(q,0,Y(y),w,Y(y));
  q.strokeStyle='#222';q.lineWidth=1.5;
  line(q,0,Y(0),w,Y(0));line(q,X(0),0,X(0),h);
  if(method==='fixed'){
   q.setLineDash([8,6]);line(q,X(-20),Y(-20),X(20),Y(20));q.setLineDash([])
  }
  let fn:((x:number)=>number)|undefined;
  try{fn=expression(method==='fixed'?config.g:config.f)}catch{fn=undefined}
  if(fn){
   q.beginPath();
   q.strokeStyle=method==='newton'?'#4299e1':method==='secant'?'#d58a00':'#e56172';
   q.lineWidth=3;
   let connected=false;
   for(let px=0;px<w;px++){
    try{
     const py=Y(fn((px-w/2)/v.scale+v.cx));
     if(!Number.isFinite(py)||py<-h*4||py>h*5){connected=false;continue}
     if(connected)q.lineTo(px,py);else q.moveTo(px,py);
     connected=true
    }catch{connected=false}
   }
   q.stroke()
  }
  const row=result?.rows[step];
  if(row){
   q.strokeStyle='#222';q.lineWidth=2;q.setLineDash([7,5]);
   q.beginPath();
   row.points.forEach(([x,y],i)=>{if(i)q.lineTo(X(x),Y(y));else q.moveTo(X(x),Y(y))});
   q.stroke();q.setLineDash([]);
   row.points.forEach(([x,y])=>{
    q.fillStyle='#fe98a3';
    q.beginPath();
    q.arc(X(x),Y(y),5,0,Math.PI*2);
    q.fill();
    q.stroke()
   })
  }
 };
 useEffect(draw,[config,method,result,step]);
 useEffect(()=>{
  const r=new ResizeObserver(draw);
  if(canvas.current)r.observe(canvas.current);
  return()=>r.disconnect()
 });
 const zoom=(n:number)=>{view.current.scale*=n;draw()};
 return <div className="plot">
  <canvas ref={canvas} aria-label="Visualisasi kurva dan hampiran akar"/>
  <div className="zoom-controls">
   <button onClick={()=>zoom(1.2)} title="Perbesar"><ZoomIn/></button>
   <button onClick={()=>zoom(0.8)} title="Perkecil"><ZoomOut/></button>
  </div>
 </div>
}

const line=(q:CanvasRenderingContext2D,a:number,b:number,c:number,d:number)=>{q.beginPath();q.moveTo(a,b);q.lineTo(c,d);q.stroke()}

function Table({result}:{result:Result}){
 const csv=['r,x_r,f(x_r),aux,x_next,error,status',...result.rows.map(x=>[x.r,x.x,x.fx,x.aux,x.next,x.error,x.status].join(','))].join('\n');
 const copy=()=>{void navigator.clipboard.writeText(csv)};
 const download=()=>{
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=`${result.method}-iterasi-kelompok-4.csv`;
  a.click();
  URL.revokeObjectURL(a.href)
 };
 return <section className="tablepanel">
  <div className="tablehead">
   <h2>Tabel Iterasi Numerik</h2>
   <button onClick={copy}><Clipboard/> Salin Teks</button>
   <button onClick={download}><Download/> Unduh CSV</button>
  </div>
  <div className="scroll">
   <table>
    <thead>
     <tr>
      <th>r</th>
      <th><InlineMath math="x_r"/></th>
      <th><InlineMath math="f(x_r)"/></th>
      <th>Turunan / <InlineMath math="g(x_r)"/></th>
      <th><InlineMath math="x_{r+1}"/></th>
      <th><InlineMath math="|\\varepsilon_a|\\%"/></th>
      <th>Status</th>
     </tr>
    </thead>
    <tbody>
     {result.rows.map(x=><tr key={x.r}>
      <td>{x.r}</td>
      <td>{x.x.toPrecision(8)}</td>
      <td>{x.fx.toExponential(3)}</td>
      <td>{x.aux.toExponential(3)}</td>
      <td>{x.next.toPrecision(8)}</td>
      <td>{x.error.toExponential(3)}</td>
      <td>{x.status}</td>
     </tr>)}
    </tbody>
   </table>
  </div>
 </section>
}

function Arena(){
 const [c,setC]=useState(defaults),[all,setAll]=useState<Result[]>();
 return <>
  <div className="pagehead">
   <div><small>HEAD-TO-HEAD BENCHMARK</small><h1>Komparasi Tiga Metode Terbuka.</h1></div>
  </div>
  <Presets set={setC}/>
  <section className="arenaform">
   <MathInput label={<>Fungsi <InlineMath math="f(x)"/></>} value={c.f} onChange={f=>setC({...c,f})}/>
   <MathInput label={<>Transformasi <InlineMath math="g(x)"/></>} value={c.g} onChange={g=>setC({...c,g})}/>
   <NumberInput name="Tebakan Awal" math="x_0" value={c.x0} onChange={x0=>setC({...c,x0})}/>
   <NumberInput name="Tebakan Kedua" math="x_1" value={c.x1} onChange={x1=>setC({...c,x1})}/>
   <button className="primary" onClick={()=>setAll((['newton','secant','fixed'] as Method[]).map(m=>solve(m,c)))}>Jalankan Perbandingan</button>
  </section>
  {all?<><Chart results={all}/><div className="metrics">{all.map(r=><article className={r.method} key={r.method}><small>{r.method.toUpperCase()}</small><h2>{r.status}</h2><BlockMath math={`x^*\\approx ${r.root?.toPrecision(9)||'\\text{—}'}`}/><b>{r.rows.length} iterasi</b><span>Galat: {r.rows.at(-1)?.error.toExponential(2)||'—'}%</span><p>{r.message}</p></article>)}</div></>:<div className="empty"><ChartNoAxesCombined/><h2>Belum ada hasil uji coba</h2><p>Pilih salah satu preset fungsi di atas, lalu klik Jalankan Perbandingan.</p></div>}
 </>
}

function Chart({results}:{results:Result[]}){
 const w=900,h=280,p=35,max=Math.max(2,...results.map(x=>x.rows.length)),color={newton:'#4299e1',secant:'#d58a00',fixed:'#e56172'};
 return <section className="chart">
  <h2>Grafik Laju Konvergensi Galat Logaritmik</h2>
  <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Grafik logaritma galat terhadap iterasi">
   <path d={`M${p} 10V${h-p}H${w}`} stroke="#222" fill="none"/>
   {results.map(r=><polyline key={r.method} fill="none" stroke={color[r.method]} strokeWidth="4" points={r.rows.map((x,i)=>`${p+i/(max-1)*(w-p-10)},${Math.max(15,Math.min(h-p,130-Math.log10(Math.max(x.error,1e-12))*20))}`).join(' ')}/>)}
  </svg>
 </section>
}

function Team(){
 return <section className="team">
  <div className="team-identity">
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
  ['Akar Persamaan','Nilai peubah x* yang menyebabkan nilai fungsi f(x*) bernilai persis nol.','f(x^*)=0'],
  ['Galat Relatif Hampiran','Persentase perubahan relatif antara dua hampiran lelaran berurutan.','|\\varepsilon_a|=\\left|\\frac{x_{r+1}-x_r}{x_{r+1}}\\right|\\times100\\%'],
  ['Konvergensi Kuadratik','Laju konvergensi di mana jumlah digit desimal benar bertambah dua kali lipat per iterasi (p=2).','|e_{r+1}| \\le c|e_r|^2'],
  ['Metode Secant','Metode hampiran akar yang menggantikan turunan analitis f\'(x) dengan gradien tali busur dua titik.','x_{r+1}=x_r-\\frac{f(x_r)(x_r-x_{r-1})}{f(x_r)-f(x_{r-1})}'],
  ['Sistem Persamaan Nirlanjar (SPNL)','Kumpulan dua atau lebih persamaan nonlinier simultan yang diselesaikan bersamaan.','\\mathbf{F}(\\mathbf{x})=\\mathbf{0}'],
  ['Matriks Jacobian','Matriks turunan parsial tingkat satu penentu arah koreksi lelaran multivariabel.','J(\\mathbf{x}) = \\left[\\frac{\\partial f_i}{\\partial x_j}\\right]'],
  ['Teorema Kontraksi','Syarat mutlak agar iterasi titik tetap x=g(x) konvergen menuju akar tunggal.','|g\'(x)|<1'],
  ['Toleransi Galat','Ambang batas penghentian lelaran numerik jika presisi yang diinginkan telah tercapai.','|\\varepsilon_a|<\\varepsilon']
 ];
 const refs=[
  'Chapra, S. C., & Canale, R. P. (2015). Numerical Methods for Engineers (7th ed.). McGraw-Hill Education.',
  'Munir, Rinaldi. (2015). Metode Numerik (Revisi). Informatika Bandung.',
  'Burden, R. L., & Faires, J. D. (2010). Numerical Analysis (9th ed.). Cengage Learning.',
  'Triatmodjo, Bambang. (2002). Metode Numerik Dilengkapi dengan Program Komputer. Beta Offset.'
 ];
 const [q,setQ]=useState(''),[tab,setTab]=useState<'terms'|'refs'|'team'>('terms');

 return <>
  <div className="pagehead">
   <div><small>KNOWLEDGE BASE · KELOMPOK 4</small><h1>Glosarium, Referensi, & Identitas.</h1></div>
   {tab==='terms'&&<label className="search"><Search/><input aria-label="Cari glosarium" placeholder="Cari istilah numerik…" value={q} onChange={(e:ChangeEvent<HTMLInputElement>)=>setQ(e.target.value)}/></label>}
  </div>
  <div className="tabs">
   <button className={tab==='terms'?'active':''} onClick={()=>setTab('terms')}>Glosarium</button>
   <button className={tab==='refs'?'active':''} onClick={()=>setTab('refs')}>Referensi Pustaka</button>
   <button className={tab==='team'?'active':''} onClick={()=>setTab('team')}>Identitas Tim</button>
  </div>
  {tab==='terms'?<div className="glossary">
   {terms.filter(x=>x[0].toLowerCase().includes(q.toLowerCase())).map(x=><article key={x[0]}>
    <h2>{x[0]}</h2>
    <p>{x[1]}</p>
    <BlockMath math={x[2]}/>
   </article>)}
  </div>:tab==='refs'?<ol className="references">
   {refs.map(x=><li key={x}>{x}</li>)}
  </ol>:<Team/>}
 </>
}

export default App
