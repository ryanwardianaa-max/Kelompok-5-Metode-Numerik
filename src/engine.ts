import { create, all } from 'mathjs'

const math = create(all, {})
export type Status = 'converged' | 'max-iterations' | 'zero-derivative' | 'zero-denominator' | 'diverged' | 'invalid' | 'singular' | 'not-symmetric' | 'not-positive-definite'
export type Method = 'newton' | 'secant' | 'fixed' | 'gauss' | 'lu' | 'crout' | 'cholesky'

// Types for 1D Root Finding (Legacy / Bonus)
export type Row = { r:number; x:number; fx:number; aux:number; next:number; error:number; status:Status; points:number[][] }
export type Result = { method:Method; rows:Row[]; status:Status; message:string; root?:number }
export type Config = { f:string; g:string; x0:number; x1:number; tolerance:number; maxIterations:number }

// Types for Linear Equation Systems (SPL)
export type MatrixStep = {
  title: string;
  formulaLatex?: string;
  matrix: number[][];
  b: number[];
  action: string;
  explanation: string;
  explanationLatex?: string;
}

export type SubstitutionStep = {
  row: number;
  variable: string;
  equation: string;
  calculation: string;
  latex?: string;
  value: number;
}

export type VerificationRow = {
  row: number;
  lhsExpression: string;
  lhsValue: number;
  rhsTarget: number;
  residual: number;
}

export type MinorStep = {
  k: number;
  matrix: number[][];
  detFormula: string;
  detValue: number;
  isPositive: boolean;
  explanation: string;
  explanationLatex?: string;
}

export type PositiveDefiniteResult = {
  status: 'converged' | 'not-symmetric' | 'not-positive-definite';
  message: string;
  A_initial: number[][];
  isSymmetric: boolean;
  differences?: { i: number; j: number; a_ij: number; a_ji: number }[];
  minors: MinorStep[];
  isPositiveDefinite: boolean;
  choleskyFeasible: boolean;
}

export type GaussResult = {
  status: Status;
  message: string;
  A_initial: number[][];
  b_initial: number[];
  steps: MatrixStep[];
  U: number[][];
  b_mod: number[];
  x: number[];
  residual: number[];
}

export type LUResult = {
  status: Status;
  message: string;
  A_initial: number[][];
  b_initial: number[];
  L: number[][];
  U: number[][];
  steps: MatrixStep[];
  y: number[]; // From L * y = b (forward substitution)
  x: number[]; // From U * x = y (backward substitution)
  residual: number[];
  forwardSteps?: SubstitutionStep[];
  backwardSteps?: SubstitutionStep[];
  verificationRows?: VerificationRow[];
}

export type CholeskyResult = {
  status: Status;
  message: string;
  A_initial: number[][];
  b_initial: number[];
  L: number[][];
  LT: number[][];
  steps: MatrixStep[];
  y: number[]; // From L * y = b
  x: number[]; // From L^T * x = y
  residual: number[];
  isSymmetric: boolean;
  isPositiveDefinite: boolean;
  forwardSteps?: SubstitutionStep[];
  backwardSteps?: SubstitutionStep[];
  verificationRows?: VerificationRow[];
  minors?: MinorStep[];
}

const validate = (source:string) => {
  if (!source.trim() || /(?:import|createUnit|evaluate|parse|derivative|assign|function|map|forEach)\s*\(/i.test(source)) throw new Error('Ekspresi tidak diizinkan.')
  return math.parse(source.replace(/\bln\s*\(/gi,'log('))
}

export function expression(source:string) {
  const compiled = validate(source).compile()
  return (x:number) => { const value = compiled.evaluate(Object.freeze({x})); if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Nilai tidak real atau di luar domain.'); return value }
}

export const expressionToTex = (source:string) => validate(source).toTex({parenthesis:'keep',implicit:'hide'})
const err = (a:number,b:number) => Math.abs(b-a) / Math.max(Math.abs(b), Number.EPSILON) * 100
const bad = (method:Method, rows:Row[], status:Status, message:string):Result => ({method,rows,status,message,root:rows.at(-1)?.next})

// 1D Solver
export function solve(method:Method, c:Config):Result {
 try {
  const f=expression(c.f)
  const g=method==='fixed'?expression(c.g):undefined
  const derivativeSource=method==='fixed'?g:f
  let derivativeNode:{evaluate:(scope:{x:number})=>unknown}|undefined
  if(method!=='secant')try{
   const source=(method==='fixed'?c.g:c.f).replace(/\bln\s*\(/gi,'log(')
   derivativeNode=math.derivative(source,'x').compile()
  }catch{derivativeNode=undefined}
  const derivative=(x:number)=>{const symbolic=derivativeNode?.evaluate({x});if(typeof symbolic==='number'&&Number.isFinite(symbolic))return symbolic;const h=Math.cbrt(Number.EPSILON)*Math.max(1,Math.abs(x)),v=(derivativeSource!(x+h)-derivativeSource!(x-h))/(2*h);if(!Number.isFinite(v))throw Error('Turunan tidak valid.');return v}
  const rows:Row[]=[]; let a=c.x0,b=c.x1
  for(let r=0;r<c.maxIterations;r++) {
   if(method==='newton') { const fa=f(a), d=derivative(a); if(Math.abs(d)<1e-12)return bad(method,rows,'zero-derivative','Turunan nol. Ubah tebakan awal.'); const n=a-fa/d,e=err(a,n); rows.push({r,x:a,fx:fa,aux:d,next:n,error:e,status:e<=c.tolerance*100?'converged':'max-iterations',points:[[a,fa],[n,0]]}); if(e<=c.tolerance*100)return {method,rows,status:'converged',message:'Konvergen.',root:n};a=n }
   else if(method==='secant') {const fa=f(a),fb=f(b),den=fb-fa;if(Math.abs(den)<1e-12)return bad(method,rows,'zero-denominator','Penyebut secant nol. Ubah dua tebakan.');const n=b-fb*(b-a)/den,e=err(b,n);rows.push({r,x:b,fx:fb,aux:fa,next:n,error:e,status:e<=c.tolerance*100?'converged':'max-iterations',points:[[a,fa],[b,fb],[n,0]]});if(e<=c.tolerance*100)return {method,rows,status:'converged',message:'Konvergen.',root:n};a=b;b=n}
   else {const fa=f(a),n=g!(a),e=err(a,n),d=Math.abs(derivative(a));rows.push({r,x:a,fx:fa,aux:n,next:n,error:e,status:e<=c.tolerance*100?'converged':'max-iterations',points:[[a,a],[a,n],[n,n]]});if(e<=c.tolerance*100)return {method,rows,status:'converged',message:'Konvergen.',root:n};if(d>1.2&&r>3)return bad(method,rows,'diverged',"|g'(x)| lebih besar dari 1.");a=n}
  }
  return bad(method,rows,'max-iterations','Batas iterasi tercapai.')
 } catch(e) { return {method,rows:[],status:'invalid',message:e instanceof Error?e.message:'Input tidak valid.'} }
}

// 2. SPL Solver: Modified Gaussian Elimination with Partial Pivoting
export function solveGauss(A_input: number[][], b_input: number[], pivoting = true): GaussResult {
  const n = A_input.length;
  const A = A_input.map(r => [...r]);
  const b = [...b_input];
  const steps: MatrixStep[] = [];

  steps.push({
    title: 'Matriks Augmentasi Awal [A | b]',
    matrix: A.map(r => [...r]),
    b: [...b],
    action: 'Inisialisasi',
    explanation: `Sistem ${n} persamaan linear dengan ${n} variabel peubah.`
  });

  for (let k = 0; k < n; k++) {
    // Partial pivoting
    if (pivoting) {
      let maxRow = k;
      let maxVal = Math.abs(A[k][k]);
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(A[i][k]) > maxVal) {
          maxVal = Math.abs(A[i][k]);
          maxRow = i;
        }
      }
      if (maxRow !== k) {
        [A[k], A[maxRow]] = [A[maxRow], A[k]];
        [b[k], b[maxRow]] = [b[maxRow], b[k]];
        steps.push({
          title: `Pivoting: Tukar Baris R_${k+1} ↔ R_${maxRow+1}`,
          formulaLatex: `R_{${k+1}} \\longleftrightarrow R_{${maxRow+1}}`,
          matrix: A.map(r => [...r]),
          b: [...b],
          action: `Pivoting Poros Kolom ${k+1}`,
          explanation: `Elemen poros terbesar di kolom ${k+1} adalah |a_${maxRow+1}${k+1}| = ${maxVal.toFixed(4)}.`,
          explanationLatex: `\\max_{i \\ge ${k+1}} |a_{i,${k+1}}| = |a_{${maxRow+1},${k+1}}| = ${Number(maxVal.toFixed(4))}`
        });
      }
    }

    if (Math.abs(A[k][k]) < 1e-12) {
      return {
        status: 'singular',
        message: `Elemen poros nol pada baris ${k+1}. Matriks singular atau tidak memiliki solusi unik.`,
        A_initial: A_input,
        b_initial: b_input,
        steps,
        U: A,
        b_mod: b,
        x: [],
        residual: []
      };
    }

    // Forward elimination
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(A[i][k]) < 1e-12) continue;
      const factor = A[i][k] / A[k][k];
      const origAik = A[i][k];
      const origAkk = A[k][k];
      for (let j = k; j < n; j++) {
        A[i][j] -= factor * A[k][j];
      }
      b[i] -= factor * b[k];
      A[i][k] = 0; // Exactly 0

      steps.push({
        title: `Eliminasi: R_${i+1} ← R_${i+1} - (${factor.toFixed(4)}) · R_${k+1}`,
        formulaLatex: `R_{${i+1}} \\leftarrow R_{${i+1}} - (${Number(factor.toFixed(4))}) R_{${k+1}}`,
        matrix: A.map(r => [...r]),
        b: [...b],
        action: `Eliminasi Baris ${i+1}`,
        explanation: `Faktor pengali m_${i+1}${k+1} = ${origAik} / ${origAkk} = ${factor.toFixed(4)}.`,
        explanationLatex: `m_{${i+1},${k+1}} = \\frac{${Number(origAik.toFixed(4))}}{${Number(origAkk.toFixed(4))}} = ${Number(factor.toFixed(4))}`
      });
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * x[j];
    }
    x[i] = sum / A[i][i];
  }

  // Compute residual r = A * x - b
  const residual = A_input.map((row, i) => {
    const ax = row.reduce((s, val, j) => s + val * x[j], 0);
    return Math.abs(ax - b_input[i]);
  });

  return {
    status: 'converged',
    message: 'Eliminasi Gauss selesai dengan sukses.',
    A_initial: A_input,
    b_initial: b_input,
    steps,
    U: A,
    b_mod: b,
    x,
    residual
  };
}

// 3. SPL Solver: LU Decomposition (Doolittle / LU Gauss)
export function solveLUGauss(A_input: number[][], b_input: number[]): LUResult {
  const n = A_input.length;
  // Lower triangular matrix L (starts with 1s on diagonal)
  const L: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  // Upper triangular matrix U (starts as clone of A)
  const U = A_input.map(r => [...r]);
  const steps: MatrixStep[] = [];

  steps.push({
    title: 'Inisialisasi Dekomposisi A = L · U',
    matrix: U.map(r => [...r]),
    b: [...b_input],
    action: 'Mulai Dekomposisi',
    explanation: 'Matriks L berdiagonal 1, Matriks U berawal dari matriks koefisien A.'
  });

  for (let k = 0; k < n - 1; k++) {
    if (Math.abs(U[k][k]) < 1e-12) {
      return {
        status: 'singular',
        message: `Poros nol pada U[${k+1}][${k+1}]. Membutuhkan pivoting sebelum dekomposisi LU Gauss.`,
        A_initial: A_input,
        b_initial: b_input,
        L,
        U,
        steps,
        y: [],
        x: [],
        residual: []
      };
    }

    for (let i = k + 1; i < n; i++) {
      const factor = U[i][k] / U[k][k];
      L[i][k] = factor; // Store in L
      for (let j = k; j < n; j++) {
        U[i][j] -= factor * U[k][j];
      }
      U[i][k] = 0; // Form upper triangular

      steps.push({
        title: `Langkah k=${k+1}: Pengali m_${i+1}${k+1} = ${factor.toFixed(4)}`,
        matrix: U.map(r => [...r]),
        b: [...b_input],
        action: `Simpan L[${i+1}][${k+1}] = ${factor.toFixed(4)}`,
        explanation: `Baris ${i+1} matriks U dieliminasi: U_${i+1} ← U_${i+1} - (${factor.toFixed(4)}) · U_${k+1}.`
      });
    }
  }

  // 1. Forward substitution: L * y = b
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = b_input[i];
    for (let j = 0; j < i; j++) {
      sum -= L[i][j] * y[j];
    }
    y[i] = sum / L[i][i]; // L[i][i] is 1
  }

  // 2. Backward substitution: U * x = y
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i];
    for (let j = i + 1; j < n; j++) {
      sum -= U[i][j] * x[j];
    }
    x[i] = sum / U[i][i];
  }

  // Compute residual r = A * x - b
  const residual = A_input.map((row, i) => {
    const ax = row.reduce((s, val, j) => s + val * x[j], 0);
    return Math.abs(ax - b_input[i]);
  });

  return {
    status: 'converged',
    message: 'Dekomposisi LU Gauss dan substitusi dua tahap selesai.',
    A_initial: A_input,
    b_initial: b_input,
    L,
    U,
    steps,
    y,
    x,
    residual
  };
}

// Helper konversi desimal/pecahan eksak rasional murni
export function toFraction(val: number, tolerance = 1e-7): { num: number; den: number; str: string; latex: string } {
  if (isNaN(val)) return { num: 0, den: 1, str: 'NaN', latex: '\\text{NaN}' };
  if (!isFinite(val)) return { num: val > 0 ? 1 : -1, den: 0, str: val > 0 ? '∞' : '-∞', latex: val > 0 ? '\\infty' : '-\\infty' };

  if (Math.abs(val) < 1e-11) {
    return { num: 0, den: 1, str: '0', latex: '0' };
  }

  const sign = val < 0 ? -1 : 1;
  const x = Math.abs(val);

  if (Math.abs(Math.round(x) - x) < tolerance) {
    const intVal = sign * Math.round(x);
    return { num: intVal, den: 1, str: `${intVal}`, latex: `${intVal}` };
  }

  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = x;

  do {
    const a = Math.floor(b);
    let h = a * h1 + h2;
    let k = a * k1 + k2;
    h2 = h1; h1 = h;
    k2 = k1; k1 = k;
    const diff = Math.abs(x - h / k);
    if (diff < tolerance || k > 10000) break;
    b = 1 / (b - a);
  } while (Math.abs(x - h1 / k1) > tolerance && k1 < 10000);

  const num = sign * h1;
  const den = k1;

  if (den === 1) {
    return { num, den: 1, str: `${num}`, latex: `${num}` };
  }

  const str = `${num}/${den}`;
  const latex = sign < 0 ? `-\\frac{${Math.abs(num)}}{${den}}` : `\\frac{${num}}{${den}}`;
  return { num, den, str, latex };
}

export function fmtFrac(val: number): string {
  return toFraction(val).str;
}

export function fmtLatex(val: number): string {
  return toFraction(val).latex;
}

export function formatSqrt(diff: number): { str: string; latex: string; val: number } {
  const root = Math.sqrt(diff);
  const fracRoot = toFraction(root);
  if (Math.abs((fracRoot.num / fracRoot.den) ** 2 - diff) < 1e-6) {
    return { str: fracRoot.str, latex: fracRoot.latex, val: root };
  }
  const fracDiff = toFraction(diff);
  if (fracDiff.den === 1) {
    return { str: `√(${fracDiff.num})`, latex: `\\sqrt{${fracDiff.num}}`, val: root };
  }
  return { str: `√(${fracDiff.str})`, latex: `\\sqrt{${fracDiff.latex}}`, val: root };
}

function fmt(val: number): string {
  return fmtFrac(val);
}

// 4. SPL Solver: Crout LU Decomposition (U has 1s on diagonal)
export function solveCrout(A_input: number[][], b_input: number[]): LUResult {
  const n = A_input.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const U: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  const steps: MatrixStep[] = [];

  steps.push({
    title: 'Inisialisasi Dekomposisi Reduksi Crout',
    matrix: A_input.map(r => [...r]),
    b: [...b_input],
    action: 'Mulai Crout: A = L · U',
    explanation: 'Pada metode Crout, diagonal matriks U ditetapkan bernilai 1 (u_ii = 1), sedangkan diagonal matriks L dihitung bebas.'
  });

  for (let k = 0; k < n; k++) {
    // 1. Hitung kolom k untuk L (dari baris k s/d n-1)
    for (let i = k; i < n; i++) {
      let sum = 0;
      const sumTermsArr: string[] = [];
      const sumTermsLatexArr: string[] = [];
      for (let m = 0; m < k; m++) {
        sum += L[i][m] * U[m][k];
        sumTermsArr.push(`${fmtFrac(L[i][m])} · ${fmtFrac(U[m][k])}`);
        sumTermsLatexArr.push(`(${fmtLatex(L[i][m])})(${fmtLatex(U[m][k])})`);
      }
      L[i][k] = A_input[i][k] - sum;

      const sumStr = sumTermsArr.length > 0 ? ` - (${sumTermsArr.join(' + ')})` : '';
      const sumLatexStr = sumTermsLatexArr.length > 0 ? ` - [${sumTermsLatexArr.join(' + ')}]` : '';

      steps.push({
        title: `Hitung Elemen L[${i + 1}][${k + 1}]`,
        matrix: L.map(r => [...r]),
        b: [...b_input],
        action: `L[${i + 1}][${k + 1}] = ${fmtFrac(L[i][k])}`,
        explanation: `l_${i+1}${k+1} = a_${i+1}${k+1}${k > 0 ? ` - ∑(l_${i+1}m · u_m${k+1})` : ''} = ${fmtFrac(A_input[i][k])}${sumStr} = ${fmtFrac(L[i][k])}.`,
        explanationLatex: `l_{${i+1},${k+1}} = a_{${i+1},${k+1}}${sumLatexStr} = ${fmtLatex(A_input[i][k])}${sumTermsLatexArr.length > 0 ? ` - ${fmtLatex(sum)}` : ''} = ${fmtLatex(L[i][k])}`
      });
    }

    if (Math.abs(L[k][k]) < 1e-12) {
      return {
        status: 'singular',
        message: `Poros nol terdeteksi pada L[${k + 1}][${k + 1}]. Metode Crout tidak dapat dilanjutkan karena pembagian dengan nol saat menghitung U.`,
        A_initial: A_input,
        b_initial: b_input,
        L,
        U,
        steps,
        y: [],
        x: [],
        residual: []
      };
    }

    // 2. Hitung baris k untuk U (dari kolom k+1 s/d n-1)
    for (let j = k + 1; j < n; j++) {
      let sum = 0;
      const sumTermsArr: string[] = [];
      const sumTermsLatexArr: string[] = [];
      for (let m = 0; m < k; m++) {
        sum += L[k][m] * U[m][j];
        sumTermsArr.push(`${fmtFrac(L[k][m])} · ${fmtFrac(U[m][j])}`);
        sumTermsLatexArr.push(`(${fmtLatex(L[k][m])})(${fmtLatex(U[m][j])})`);
      }
      const numDiff = A_input[k][j] - sum;
      U[k][j] = numDiff / L[k][k];

      const sumStr = sumTermsArr.length > 0 ? ` - (${sumTermsArr.join(' + ')})` : '';
      const sumLatexStr = sumTermsLatexArr.length > 0 ? ` - [${sumTermsLatexArr.join(' + ')}]` : '';

      steps.push({
        title: `Hitung Elemen U[${k + 1}][${j + 1}]`,
        matrix: U.map(r => [...r]),
        b: [...b_input],
        action: `U[${k + 1}][${j + 1}] = ${fmtFrac(U[k][j])}`,
        explanation: `u_${k+1}${j+1} = (a_${k+1}${j+1}${sumStr}) / l_${k+1}${k+1} = (${fmtFrac(numDiff)}) / ${fmtFrac(L[k][k])} = ${fmtFrac(U[k][j])}.`,
        explanationLatex: `u_{${k+1},${j+1}} = \\frac{a_{${k+1},${j+1}}${sumLatexStr}}{l_{${k+1},${k+1}}} = \\frac{${fmtLatex(numDiff)}}{${fmtLatex(L[k][k])}} = ${fmtLatex(U[k][j])}`
      });
    }
  }

  // Forward substitution: L * y = b
  const y = new Array(n).fill(0);
  const forwardSteps: SubstitutionStep[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    const prevParts: string[] = [];
    const prevPartsLatex: string[] = [];
    for (let j = 0; j < i; j++) {
      const termVal = L[i][j] * y[j];
      sum += termVal;
      prevParts.push(`${fmtFrac(L[i][j])}(${fmtFrac(y[j])})`);
      prevPartsLatex.push(`(${fmtLatex(L[i][j])})(${fmtLatex(y[j])})`);
    }
    const rhsRem = b_input[i] - sum;
    y[i] = rhsRem / L[i][i];

    let eqStr = '';
    let calcStr = '';
    let latexStr = '';

    if (i === 0) {
      eqStr = `${fmtFrac(L[0][0])} y_1 = ${fmtFrac(b_input[0])}`;
      calcStr = `y_1 = ${fmtFrac(b_input[0])} / ${fmtFrac(L[0][0])} = ${fmtFrac(y[0])}`;
      latexStr = `l_{11} y_1 = b_1 \\implies ${fmtLatex(L[0][0])} y_1 = ${fmtLatex(b_input[0])} \\implies y_1 = ${fmtLatex(y[0])}`;
    } else {
      const sumTerms = prevParts.join(' + ').replace(/\+ -/g, '- ');
      const sumTermsLatex = prevPartsLatex.join(' + ').replace(/\+ -/g, '- ');
      eqStr = `${sumTerms} + ${fmtFrac(L[i][i])} y_${i + 1} = ${fmtFrac(b_input[i])}`;
      calcStr = `${fmtFrac(L[i][i])} y_${i + 1} = ${fmtFrac(b_input[i])} - (${fmtFrac(sum)}) = ${fmtFrac(rhsRem)} => y_${i + 1} = ${fmtFrac(rhsRem)} / ${fmtFrac(L[i][i])} = ${fmtFrac(y[i])}`;
      latexStr = `${fmtLatex(L[i][i])} y_{${i + 1}} = ${fmtLatex(b_input[i])} - (${sumTermsLatex}) = ${fmtLatex(rhsRem)} \\implies y_{${i + 1}} = \\frac{${fmtLatex(rhsRem)}}{${fmtLatex(L[i][i])}} = ${fmtLatex(y[i])}`;
    }

    forwardSteps.push({
      row: i + 1,
      variable: `y_${i + 1}`,
      equation: eqStr,
      calculation: calcStr,
      latex: latexStr,
      value: y[i]
    });
  }

  // Backward substitution: U * x = y (diagonal U adalah 1)
  const x = new Array(n).fill(0);
  const backwardSteps: SubstitutionStep[] = [];
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    const nextParts: string[] = [];
    const nextPartsLatex: string[] = [];
    for (let j = i + 1; j < n; j++) {
      const termVal = U[i][j] * x[j];
      sum += termVal;
      nextParts.push(`${fmtFrac(U[i][j])}(${fmtFrac(x[j])})`);
      nextPartsLatex.push(`(${fmtLatex(U[i][j])})(${fmtLatex(x[j])})`);
    }
    const rhsRem = y[i] - sum;
    x[i] = rhsRem; // Karena U[i][i] === 1

    let eqStr = '';
    let calcStr = '';
    let latexStr = '';

    if (i === n - 1) {
      eqStr = `1 · x_${n} = ${fmtFrac(y[n - 1])}`;
      calcStr = `x_${n} = ${fmtFrac(y[n - 1])}`;
      latexStr = `u_{${n}${n}} x_{${n}} = y_{${n}} \\implies 1 \\cdot x_{${n}} = ${fmtLatex(y[n - 1])} \\implies x_{${n}} = ${fmtLatex(x[n - 1])}`;
    } else {
      const sumTerms = nextParts.join(' + ').replace(/\+ -/g, '- ');
      const sumTermsLatex = nextPartsLatex.join(' + ').replace(/\+ -/g, '- ');
      eqStr = `x_${i + 1} + ${sumTerms} = ${fmtFrac(y[i])}`;
      calcStr = `x_${i + 1} = ${fmtFrac(y[i])} - (${fmtFrac(sum)}) = ${fmtFrac(x[i])}`;
      latexStr = `x_{${i + 1}} = ${fmtLatex(y[i])} - (${sumTermsLatex}) = ${fmtLatex(x[i])}`;
    }

    backwardSteps.push({
      row: i + 1,
      variable: `x_${i + 1}`,
      equation: eqStr,
      calculation: calcStr,
      latex: latexStr,
      value: x[i]
    });
  }

  // Residual r = A * x - b
  const residual = A_input.map((row, i) => {
    const ax = row.reduce((s, val, j) => s + val * x[j], 0);
    return Math.abs(ax - b_input[i]);
  });

  const verificationRows: VerificationRow[] = A_input.map((row, i) => {
    let lhsSum = 0;
    const parts: string[] = [];
    row.forEach((val, j) => {
      lhsSum += val * x[j];
      parts.push(`${fmtFrac(val)}(${fmtFrac(x[j])})`);
    });
    return {
      row: i + 1,
      lhsExpression: parts.join(' + ').replace(/\+ -/g, '- '),
      lhsValue: lhsSum,
      rhsTarget: b_input[i],
      residual: Math.abs(lhsSum - b_input[i])
    };
  });

  return {
    status: 'converged',
    message: 'Dekomposisi Crout (U berdiagonal 1) dan penyelesaian dua tahap berhasil diselesaikan.',
    A_initial: A_input,
    b_initial: b_input,
    L,
    U,
    steps,
    y,
    x,
    residual,
    forwardSteps,
    backwardSteps,
    verificationRows
  };
}

// 5. SPL Solver: Cholesky Decomposition (A = L · L^T)
export function solveCholesky(A_input: number[][], b_input: number[]): CholeskyResult {
  const n = A_input.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const steps: MatrixStep[] = [];

  // 1. Cek Simetri Matriks
  let isSymmetric = true;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(A_input[i][j] - A_input[j][i]) > 1e-8) {
        isSymmetric = false;
        break;
      }
    }
    if (!isSymmetric) break;
  }

  if (!isSymmetric) {
    return {
      status: 'not-symmetric',
      message: 'Matriks A tidak simetris (A ≠ A^T). Dekomposisi Cholesky hanya berlaku untuk matriks simetris!',
      A_initial: A_input,
      b_initial: b_input,
      L,
      LT: L,
      steps: [],
      y: [],
      x: [],
      residual: [],
      isSymmetric: false,
      isPositiveDefinite: false
    };
  }

  steps.push({
    title: 'Uji Simetri Berhasil: Mulai Faktorisasi Cholesky A = L · L^T',
    matrix: A_input.map(r => [...r]),
    b: [...b_input],
    action: 'Cek Simetri OK',
    explanation: 'Matriks terbukti simetris. Algoritma Cholesky menghitung matriks segitiga bawah L sehingga A = L · L^T.'
  });

  // 2. Faktorisasi Cholesky
  for (let j = 0; j < n; j++) {
    let sumDiag = 0;
    const sumDiagParts: string[] = [];
    const sumDiagLatexParts: string[] = [];
    for (let k = 0; k < j; k++) {
      sumDiag += L[j][k] * L[j][k];
      sumDiagParts.push(`(${fmtFrac(L[j][k])})²`);
      sumDiagLatexParts.push(`(${fmtLatex(L[j][k])})^2`);
    }
    const diff = A_input[j][j] - sumDiag;

    if (diff <= 1e-12) {
      return {
        status: 'not-positive-definite',
        message: `Elemen diagonal L[${j + 1}][${j + 1}] menghasilkan nilai ${fmtFrac(diff)} ≤ 0 di dalam akar. Matriks A tidak definit positif sehingga Cholesky gagal!`,
        A_initial: A_input,
        b_initial: b_input,
        L,
        LT: L,
        steps,
        y: [],
        x: [],
        residual: [],
        isSymmetric: true,
        isPositiveDefinite: false
      };
    }

    const rad = formatSqrt(diff);
    L[j][j] = rad.val;

    const sumDiagStr = sumDiagParts.length > 0 ? ` - (${sumDiagParts.join(' + ')})` : '';
    const sumDiagLatexStr = sumDiagLatexParts.length > 0 ? ` - [${sumDiagLatexParts.join(' + ')}]` : '';

    steps.push({
      title: `Hitung Diagonal L[${j + 1}][${j + 1}] = √(${fmtFrac(diff)})`,
      matrix: L.map(r => [...r]),
      b: [...b_input],
      action: `L[${j + 1}][${j + 1}] = ${rad.str}`,
      explanation: `l_${j+1}${j+1} = √(a_${j+1}${j+1}${sumDiagStr}) = √(${fmtFrac(A_input[j][j])}${sumDiagParts.length > 0 ? ` - ${fmtFrac(sumDiag)}` : ''}) = √(${fmtFrac(diff)}) = ${rad.str}.`,
      explanationLatex: `l_{${j+1},${j+1}} = \\sqrt{a_{${j+1},${j+1}}${sumDiagLatexStr}} = \\sqrt{${fmtLatex(diff)}} = ${rad.latex}`
    });

    for (let i = j + 1; i < n; i++) {
      let sumOff = 0;
      const sumOffParts: string[] = [];
      const sumOffLatexParts: string[] = [];
      for (let k = 0; k < j; k++) {
        sumOff += L[i][k] * L[j][k];
        sumOffParts.push(`${fmtFrac(L[i][k])} · ${fmtFrac(L[j][k])}`);
        sumOffLatexParts.push(`(${fmtLatex(L[i][k])})(${fmtLatex(L[j][k])})`);
      }
      const diffOff = A_input[i][j] - sumOff;
      L[i][j] = diffOff / L[j][j];

      const sumOffStr = sumOffParts.length > 0 ? ` - (${sumOffParts.join(' + ')})` : '';
      const sumOffLatexStr = sumOffLatexParts.length > 0 ? ` - [${sumOffLatexParts.join(' + ')}]` : '';

      steps.push({
        title: `Hitung Elemen Segitiga Bawah L[${i + 1}][${j + 1}]`,
        matrix: L.map(r => [...r]),
        b: [...b_input],
        action: `L[${i + 1}][${j + 1}] = ${fmtFrac(L[i][j])}`,
        explanation: `l_${i+1}${j+1} = (a_${i+1}${j+1}${sumOffStr}) / l_${j+1}${j+1} = (${fmtFrac(diffOff)}) / ${rad.str} = ${fmtFrac(L[i][j])}.`,
        explanationLatex: `l_{${i+1},${j+1}} = \\frac{a_{${i+1},${j+1}}${sumOffLatexStr}}{l_{${j+1},${j+1}}} = \\frac{${fmtLatex(diffOff)}}{${rad.latex}} = ${fmtLatex(L[i][j])}`
      });
    }
  }

  // Transpose LT
  const LT: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => L[j][i])
  );

  // 3. Forward substitution: L * y = b
  const y = new Array(n).fill(0);
  const forwardSteps: SubstitutionStep[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    const prevParts: string[] = [];
    const prevPartsLatex: string[] = [];
    for (let j = 0; j < i; j++) {
      const termVal = L[i][j] * y[j];
      sum += termVal;
      prevParts.push(`${fmtFrac(L[i][j])}(${fmtFrac(y[j])})`);
      prevPartsLatex.push(`(${fmtLatex(L[i][j])})(${fmtLatex(y[j])})`);
    }
    const rhsRem = b_input[i] - sum;
    y[i] = rhsRem / L[i][i];

    let eqStr = '';
    let calcStr = '';
    let latexStr = '';

    if (i === 0) {
      eqStr = `${fmtFrac(L[0][0])} y_1 = ${fmtFrac(b_input[0])}`;
      calcStr = `y_1 = ${fmtFrac(b_input[0])} / ${fmtFrac(L[0][0])} = ${fmtFrac(y[0])}`;
      latexStr = `l_{11} y_1 = b_1 \\implies ${fmtLatex(L[0][0])} y_1 = ${fmtLatex(b_input[0])} \\implies y_1 = ${fmtLatex(y[0])}`;
    } else {
      const sumTerms = prevParts.join(' + ').replace(/\+ -/g, '- ');
      const sumTermsLatex = prevPartsLatex.join(' + ').replace(/\+ -/g, '- ');
      eqStr = `${sumTerms} + ${fmtFrac(L[i][i])} y_${i + 1} = ${fmtFrac(b_input[i])}`;
      calcStr = `${fmtFrac(L[i][i])} y_${i + 1} = ${fmtFrac(b_input[i])} - (${fmtFrac(sum)}) = ${fmtFrac(rhsRem)} => y_${i + 1} = ${fmtFrac(rhsRem)} / ${fmtFrac(L[i][i])} = ${fmtFrac(y[i])}`;
      latexStr = `${fmtLatex(L[i][i])} y_{${i + 1}} = ${fmtLatex(b_input[i])} - (${sumTermsLatex}) = ${fmtLatex(rhsRem)} \\implies y_{${i + 1}} = \\frac{${fmtLatex(rhsRem)}}{${fmtLatex(L[i][i])}} = ${fmtLatex(y[i])}`;
    }

    forwardSteps.push({
      row: i + 1,
      variable: `y_${i + 1}`,
      equation: eqStr,
      calculation: calcStr,
      latex: latexStr,
      value: y[i]
    });
  }

  // 4. Backward substitution: L^T * x = y
  const x = new Array(n).fill(0);
  const backwardSteps: SubstitutionStep[] = [];
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    const nextParts: string[] = [];
    const nextPartsLatex: string[] = [];
    for (let j = i + 1; j < n; j++) {
      const termVal = LT[i][j] * x[j];
      sum += termVal;
      nextParts.push(`${fmtFrac(LT[i][j])}(${fmtFrac(x[j])})`);
      nextPartsLatex.push(`(${fmtLatex(LT[i][j])})(${fmtLatex(x[j])})`);
    }
    const rhsRem = y[i] - sum;
    x[i] = rhsRem / LT[i][i];

    let eqStr = '';
    let calcStr = '';
    let latexStr = '';

    if (i === n - 1) {
      eqStr = `${fmtFrac(LT[n - 1][n - 1])} x_${n} = ${fmtFrac(y[n - 1])}`;
      calcStr = `x_${n} = ${fmtFrac(y[n - 1])} / ${fmtFrac(LT[n - 1][n - 1])} = ${fmtFrac(x[n - 1])}`;
      latexStr = `l_{${n}${n}} x_{${n}} = y_{${n}} \\implies ${fmtLatex(LT[n - 1][n - 1])} x_{${n}} = ${fmtLatex(y[n - 1])} \\implies x_{${n}} = \\frac{${fmtLatex(y[n - 1])}}{${fmtLatex(LT[n - 1][n - 1])}} = ${fmtLatex(x[n - 1])}`;
    } else {
      const sumTerms = nextParts.join(' + ').replace(/\+ -/g, '- ');
      const sumTermsLatex = nextPartsLatex.join(' + ').replace(/\+ -/g, '- ');
      eqStr = `${fmtFrac(LT[i][i])} x_${i + 1} + ${sumTerms} = ${fmtFrac(y[i])}`;
      calcStr = `${fmtFrac(LT[i][i])} x_${i + 1} = ${fmtFrac(y[i])} - (${fmtFrac(sum)}) = ${fmtFrac(rhsRem)} => x_${i + 1} = ${fmtFrac(rhsRem)} / ${fmtFrac(LT[i][i])} = ${fmtFrac(x[i])}`;
      latexStr = `${fmtLatex(LT[i][i])} x_{${i + 1}} = ${fmtLatex(y[i])} - (${sumTermsLatex}) = ${fmtLatex(rhsRem)} \\implies x_{${i + 1}} = \\frac{${fmtLatex(rhsRem)}}{${fmtLatex(LT[i][i])}} = ${fmtLatex(x[i])}`;
    }

    backwardSteps.push({
      row: i + 1,
      variable: `x_${i + 1}`,
      equation: eqStr,
      calculation: calcStr,
      latex: latexStr,
      value: x[i]
    });
  }

  // Residual r = A * x - b
  const residual = A_input.map((row, i) => {
    const ax = row.reduce((s, val, j) => s + val * x[j], 0);
    return Math.abs(ax - b_input[i]);
  });

  const verificationRows: VerificationRow[] = A_input.map((row, i) => {
    let lhsSum = 0;
    const parts: string[] = [];
    row.forEach((val, j) => {
      lhsSum += val * x[j];
      parts.push(`${fmtFrac(val)}(${fmtFrac(x[j])})`);
    });
    return {
      row: i + 1,
      lhsExpression: parts.join(' + ').replace(/\+ -/g, '- '),
      lhsValue: lhsSum,
      rhsTarget: b_input[i],
      residual: Math.abs(lhsSum - b_input[i])
    };
  });

  const pdResult = checkPositiveDefinite(A_input);

  return {
    status: 'converged',
    message: 'Matriks simetris & definit positif. Dekomposisi Cholesky A = L · L^T berhasil diselesaikan.',
    A_initial: A_input,
    b_initial: b_input,
    L,
    LT,
    steps,
    y,
    x,
    residual,
    isSymmetric: true,
    isPositiveDefinite: true,
    forwardSteps,
    backwardSteps,
    verificationRows,
    minors: pdResult.minors
  };
}

// 6. Uji Definit Positif & Kriteria Sylvester
export function checkPositiveDefinite(A_input: number[][]): PositiveDefiniteResult {
  const n = A_input.length;
  let isSymmetric = true;
  const differences: { i: number; j: number; a_ij: number; a_ji: number }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A_input[i][j] - A_input[j][i]) > 1e-8) {
        isSymmetric = false;
        differences.push({
          i: i + 1,
          j: j + 1,
          a_ij: A_input[i][j],
          a_ji: A_input[j][i]
        });
      }
    }
  }

  const minors: MinorStep[] = [];
  let isPositiveDefinite = isSymmetric;

  for (let k = 1; k <= n; k++) {
    const submatrix: number[][] = [];
    for (let r = 0; r < k; r++) {
      submatrix.push(A_input[r].slice(0, k));
    }

    let det = 0;
    let detFormula = '';
    let explanation = '';
    let explanationLatex = '';

    if (k === 1) {
      det = submatrix[0][0];
      detFormula = `\\Delta_1 = a_{11} = ${fmtLatex(det)}`;
      explanation = `Minor utama ke-1 adalah elemen sudut diagonal pertama: a_11 = ${fmtFrac(det)}.`;
      explanationLatex = `\\Delta_1 = \\det([a_{11}]) = a_{11} = ${fmtLatex(det)}`;
    } else if (k === 2) {
      const a11 = submatrix[0][0];
      const a12 = submatrix[0][1];
      const a21 = submatrix[1][0];
      const a22 = submatrix[1][1];
      det = a11 * a22 - a12 * a21;
      detFormula = `\\Delta_2 = (a_{11} \\cdot a_{22}) - (a_{12} \\cdot a_{21}) = (${fmtLatex(a11)} \\cdot ${fmtLatex(a22)}) - (${fmtLatex(a12)} \\cdot ${fmtLatex(a21)}) = ${fmtLatex(det)}`;
      explanation = `Minor utama ke-2 adalah determinan submatriks 2×2: (${fmtFrac(a11)} × ${fmtFrac(a22)}) - (${fmtFrac(a12)} × ${fmtFrac(a21)}) = ${fmtFrac(det)}.`;
      explanationLatex = `\\Delta_2 = \\det\\begin{bmatrix} ${fmtLatex(a11)} & ${fmtLatex(a12)} \\\\ ${fmtLatex(a21)} & ${fmtLatex(a22)} \\end{bmatrix} = (${fmtLatex(a11)})(${fmtLatex(a22)}) - (${fmtLatex(a12)})(${fmtLatex(a21)}) = ${fmtLatex(det)}`;
    } else if (k === 3) {
      const a11 = submatrix[0][0], a12 = submatrix[0][1], a13 = submatrix[0][2];
      const a21 = submatrix[1][0], a22 = submatrix[1][1], a23 = submatrix[1][2];
      const a31 = submatrix[2][0], a32 = submatrix[2][1], a33 = submatrix[2][2];

      const c11 = a22 * a33 - a23 * a32;
      const c12 = a21 * a33 - a23 * a31;
      const c13 = a21 * a32 - a22 * a31;

      det = a11 * c11 - a12 * c12 + a13 * c13;
      detFormula = `\\Delta_3 = a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13} = ${fmtLatex(a11)}(${fmtLatex(c11)}) - ${fmtLatex(a12)}(${fmtLatex(c12)}) + ${fmtLatex(a13)}(${fmtLatex(c13)}) = ${fmtLatex(det)}`;
      explanation = `Minor utama ke-3 adalah determinan matriks 3×3 (ekspansi kofaktor baris 1): ${fmtFrac(a11)}·(${fmtFrac(c11)}) - ${fmtFrac(a12)}·(${fmtFrac(c12)}) + ${fmtFrac(a13)}·(${fmtFrac(c13)}) = ${fmtFrac(det)}.`;
      explanationLatex = `\\Delta_3 = \\det(A) = ${fmtLatex(a11)}(${fmtLatex(c11)}) - ${fmtLatex(a12)}(${fmtLatex(c12)}) + ${fmtLatex(a13)}(${fmtLatex(c13)}) = ${fmtLatex(det)}`;
    }

    const isPositive = det > 1e-9;
    if (!isPositive) {
      isPositiveDefinite = false;
    }

    minors.push({
      k,
      matrix: submatrix,
      detFormula,
      detValue: det,
      isPositive,
      explanation,
      explanationLatex
    });
  }

  let status: 'converged' | 'not-symmetric' | 'not-positive-definite' = 'converged';
  let message = '';

  if (!isSymmetric) {
    status = 'not-symmetric';
    message = `Matriks A tidak simetris (A ≠ Aᵀ). Terdapat ketidaksamaan pada elemen (${differences.map(d => `a_${d.i}${d.j}=${d.a_ij} ≠ a_${d.j}${d.i}=${d.a_ji}`).join(', ')}). Kriteria Sylvester hanya berlaku untuk matriks simetris riil.`;
  } else if (!isPositiveDefinite) {
    status = 'not-positive-definite';
    const failedMinors = minors.filter(m => !m.isPositive).map(m => `Δ_${m.k} = ${fmt(m.detValue)} ≤ 0`);
    message = `Matriks A simetris tetapi TIDAK definit positif karena ditemukan minor utama non-positif: ${failedMinors.join(', ')}. Dekomposisi Cholesky akan gagal karena memuat akar bilangan non-positif.`;
  } else {
    status = 'converged';
    message = `Matriks A terbukti SIMETRIS dan DEFINIT POSITIF (seluruh minor utama terkemuka bernilai positif: ${minors.map(m => `Δ_${m.k}=${fmt(m.detValue)} > 0`).join(', ')}). Memenuhi syarat mutlak Dekomposisi Cholesky A = L · Lᵀ!`;
  }

  return {
    status,
    message,
    A_initial: A_input,
    isSymmetric,
    differences,
    minors,
    isPositiveDefinite: isSymmetric && isPositiveDefinite,
    choleskyFeasible: isSymmetric && isPositiveDefinite
  };
}
