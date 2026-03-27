
/**
 * Double-double arithmetic implementation for TS/JS
 * @module twofloat
 *
 * References:
 * - {@link https://csclub.uwaterloo.ca/~pbarfuss/dekker1971.pdf     | T.J. Dekker        }
 * - {@link https://people.eecs.berkeley.edu/~jrs/papers/robustr.pdf | J.R. Shewchuk      }
 * - {@link https://hal.science/hal-01351529v3/document              | J.M. Muller et al. }
 */

/***/

export type f64 = number;
export type TwoF64 = [hi: f64, lo: f64];

export const F64_PRECISION = 53;
export const F64_TRUNC_NB = Math.ceil(F64_PRECISION/2);
export const F64_SPLIT_K = 2**F64_TRUNC_NB + 1;

// EFT - Dekker "fast2Sum" algorithm (NB. assumes |x| ≥ |y|)
export function normalize(x: f64, y: f64): TwoF64 {
  const hi = x + y;
  return [hi, x - hi + y];
}

// EFT - Dekker/Veltkamp splitter
export function split(x: f64): TwoF64 {
  const c = F64_SPLIT_K*x;
  const hi = c + (x - c);
  return [hi, x - hi];
}

// EFT - Møller & Knuth "2Sum" algorithm
export function twoSum(x: f64, y: f64): TwoF64 {
  const hi = x + y;
  const x1 = hi - y;
  const y1 = hi - x1;
  return [hi, x - x1 + (y - y1)];
}

// EFT - Dekker/Veltkamp product
export function twoProd(x: f64, y: f64): TwoF64 {
  const [xhi, xlo] = split(x);
  const [yhi, ylo] = split(y);
  const hi = x*y;
  const e1 = hi - xhi*yhi;
  const e2 = e1 - xlo*yhi;
  const e3 = e2 - xhi*ylo;
  const lo = xlo*ylo - e3;
  return [hi, lo];
}
