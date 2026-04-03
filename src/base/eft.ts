
/**
 * Error-free transforms
 *
 * References:
 * - {@link https://csclub.uwaterloo.ca/~pbarfuss/dekker1971.pdf     | T.J. Dekker        }
 * - {@link https://people.eecs.berkeley.edu/~jrs/papers/robustr.pdf | J.R. Shewchuk      }
 * - {@link https://hal.science/hal-01351529v3/document              | J.M. Muller et al. }
 */

import {
  type f64,
  type TwoF64,
  F64_SPLIT_K
} from '../utils.js';

// Dekker "fast2Sum" algorithm - NB. assumes |x| ≥ |y|
export function normalize(x: f64, y: f64): TwoF64 {
  const hi = x + y;
  return [hi, x - hi + y];
}

export const fast2Sum = normalize;

// fast2Sum(x, -y) - NB. assumes |x| ≥ |y|)
export function fast2Diff(x: f64, y: f64): TwoF64 {
  const hi = x - y;
  return [hi, x - hi - y];
}

// Dekker/Veltkamp splitter
export function split(x: f64): TwoF64 {
  const c = F64_SPLIT_K*x;
  const hi = c + (x - c);
  return [hi, x - hi];
}

// Møller & Knuth "2Sum" algorithm
export function twoSum(x: f64, y: f64): TwoF64 {
  const hi = x + y;
  const x1 = hi - y;
  const y1 = hi - x1;
  return [hi, x - x1 + (y - y1)];
}

// twoSum(x, -y)
export function twoDiff(x: f64, y: f64): TwoF64 {
  const hi = x - y;
  const x1 = hi + y;
  const y1 = hi - x1;
  return [hi, x - x1 - (y + y1)];
}

// Dekker/Veltkamp product
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

// twoProd(x, x)
export function twoSquare(x: f64): TwoF64 {
  const [xhi, xlo] = split(x);
  const hi = x*x;
  const lh = xhi*xlo;
  const e1 = hi - xhi*xhi;
  const e2 = e1 - lh - lh;
  const lo = xlo*xlo - e2;
  return [hi, lo];
}
