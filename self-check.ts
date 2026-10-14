import { solve, solveGauss, solveLUGauss, solveCrout, solveCholesky, checkPositiveDefinite } from './src/engine.ts'

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

// 4. Test Dekomposisi Crout
const croutRes = solveCrout([
  [1, 1, 1],
  [2, 3, 1],
  [1, -1, -1]
], [6, 11, -4])
if (croutRes.status !== 'converged') throw new Error('Crout solver failed')
if (Math.abs(croutRes.x[0] - 1) > 1e-5 || Math.abs(croutRes.x[1] - 2) > 1e-5 || Math.abs(croutRes.x[2] - 3) > 1e-5) {
  throw new Error(`Crout solution mismatch: ${JSON.stringify(croutRes.x)}`)
}
if (!croutRes.forwardSteps || croutRes.forwardSteps.length !== 3) throw new Error('Crout forwardSteps missing')
if (!croutRes.backwardSteps || croutRes.backwardSteps.length !== 3) throw new Error('Crout backwardSteps missing')
if (!croutRes.verificationRows || croutRes.verificationRows.length !== 3) throw new Error('Crout verificationRows missing')

// 5. Test Dekomposisi Cholesky
const cholA = [
  [4, 2, -2],
  [2, 10, 2],
  [-2, 2, 6]
]
const cholB = [2, 22, 4]
const cholRes = solveCholesky(cholA, cholB)
if (cholRes.status !== 'converged') throw new Error('Cholesky solver failed')
if (Math.abs(cholRes.x[0] - (-1)) > 1e-5 || Math.abs(cholRes.x[1] - 2.5) > 1e-5 || Math.abs(cholRes.x[2] - (-0.5)) > 1e-5) {
  throw new Error(`Cholesky solution mismatch: ${JSON.stringify(cholRes.x)}`)
}
if (!cholRes.forwardSteps || cholRes.forwardSteps.length !== 3) throw new Error('Cholesky forwardSteps missing')
if (!cholRes.backwardSteps || cholRes.backwardSteps.length !== 3) throw new Error('Cholesky backwardSteps missing')
if (!cholRes.verificationRows || cholRes.verificationRows.length !== 3) throw new Error('Cholesky verificationRows missing')

// 6. Test Uji Definit Positif & Kriteria Sylvester
const pdPass = checkPositiveDefinite(cholA)
if (!pdPass.isPositiveDefinite || !pdPass.isSymmetric || pdPass.status !== 'converged') {
  throw new Error('Sylvester check failed on valid positive definite matrix')
}
if (pdPass.minors.length !== 3 || pdPass.minors[0].detValue !== 4 || pdPass.minors[1].detValue !== 36) {
  throw new Error('Sylvester minor values mismatch')
}

const nonSym = checkPositiveDefinite([[1, 2], [3, 4]])
if (nonSym.isSymmetric || nonSym.status !== 'not-symmetric') {
  throw new Error('Sylvester failed to detect asymmetric matrix')
}

const nonPd = checkPositiveDefinite([[1, 2], [2, 1]])
if (nonPd.isPositiveDefinite || nonPd.status !== 'not-positive-definite') {
  throw new Error('Sylvester failed to detect non-positive-definite matrix')
}

console.log('engine preset, Crout, Cholesky, & Sylvester positive-definite self-check: passed!')
