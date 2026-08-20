import { solve } from './src/engine.ts'
const presets=[
 {f:'x^3-2*x-5',g:'(2*x+5)^(1/3)',x0:2,x1:3,root:2.0945514815},
 {f:'exp(-x)-x',g:'exp(-x)',x0:0,x1:1,root:.5671432904},
 {f:'cos(x)-x',g:'cos(x)',x0:1,x1:0,root:.7390851332},
 {f:'x*ln(x)-1',g:'exp(1/x)',x0:2,x1:1,root:1.7632228344}
]
for(const c of presets)for(const method of ['newton','secant','fixed'] as const){const result=solve(method,{...c,tolerance:1e-6,maxIterations:100});if(result.status!=='converged'||Math.abs((result.root??0)-c.root)>1e-4)throw Error(`${c.f} ${method}: ${result.status}`)}
console.log('engine preset self-check: passed')
