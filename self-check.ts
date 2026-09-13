import { solve, solveGauss, solveLUGauss } from './src/engine.ts'

// 1. Test 1D root presets
const presets = [
  { f: 'x^3-2*x-5', g: '(2*x+5)^(1/3)', x0: 2, x1: 3, root: 2.0945514815 },
  { f: 'exp(-x)-x', g: 'exp(-x)', x0: 0, x1: 1, root: 0.5671432904 },
  { f: 'cos(x)-x', g: 'cos(x)', x0: 1, x1: 0, root: 0.7390851332 },
  { f: 'x*ln(x)-1', g: 'exp(1/x)', x0: 2, x1: 1, root: 1.7632228344 }
]

for (const c of presets) {
  for (const method of ['newton', 'secant', 'fixed'] as const) {
    const result = solve(method, { ...c, tolerance: 1e-6, maxIterations: 100 })
    if (result.status !== 'converged' || Math.abs((result.root ?? 0) - c.root) > 1e-4) {
      throw Error(`${c.f} ${method}: ${result.status}`)
    }
  }
}

// 2. Test SPL Gauss Elimination with Partial Pivoting
const A = [
  [2, 1, 1],
  [4, -6, 0],
  [-2, 7, 2]
]
const b = [5, -2, 9]

const gRes = solveGauss(A, b, true)
if (gRes.status !== 'converged') throw new Error('Gauss solver failed')
if (Math.abs(gRes.x[0] - 1) > 1e-5 || Math.abs(gRes.x[1] - 1) > 1e-5 || Math.abs(gRes.x[2] - 2) > 1e-5) {
  throw new Error(`Gauss solution mismatch: ${JSON.stringify(gRes.x)}`)
}

// 3. Test Dekomposisi LU Gauss
const luRes = solveLUGauss(A, b)
if (luRes.status !== 'converged') throw new Error('LU solver failed')
if (Math.abs(luRes.x[0] - 1) > 1e-5 || Math.abs(luRes.x[1] - 1) > 1e-5 || Math.abs(luRes.x[2] - 2) > 1e-5) {
  throw new Error(`LU solution mismatch: ${JSON.stringify(luRes.x)}`)
}

console.log('engine preset & SPL Gauss/LU self-check: passed!')
