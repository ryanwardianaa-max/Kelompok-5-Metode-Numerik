import { create, all } from 'mathjs'

const math = create(all, {})
export type Status = 'converged' | 'max-iterations' | 'zero-derivative' | 'zero-denominator' | 'diverged' | 'invalid' | 'singular'
export type Method = 'newton' | 'secant' | 'fixed' | 'gauss' | 'lu'

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
