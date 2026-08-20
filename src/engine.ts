import { create, all } from 'mathjs'

const math = create(all, {})
export type Status = 'converged' | 'max-iterations' | 'zero-derivative' | 'zero-denominator' | 'diverged' | 'invalid'
export type Method = 'newton' | 'secant' | 'fixed'
export type Row = { r:number; x:number; fx:number; aux:number; next:number; error:number; status:Status; points:number[][] }
export type Result = { method:Method; rows:Row[]; status:Status; message:string; root?:number }
export type Config = { f:string; g:string; x0:number; x1:number; tolerance:number; maxIterations:number }

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
