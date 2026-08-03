
/**
 * @file Error-Free Transforms
 *
 * References:
 * - {@link https://csclub.uwaterloo.ca/~pbarfuss/dekker1971.pdf     | T.J. Dekker        }
 * - {@link https://people.eecs.berkeley.edu/~jrs/papers/robustr.pdf | J.R. Shewchuk      }
 * - {@link https://hal.science/hal-01351529v3/document              | J.M. Muller et al. }
 */

import {
  type f64,
  type TwoF64,
  F64_SPLITTER
} from './common.js';

/**
 * Return the canonical {@link TwoF64|`TwoF64`} representation of `x + y`
 * (`fast2Sum` error-free transform).
 *
 * **NB. Assumes `|x| ≥ |y|`. Use `add(x, y)` if this condition is not
 * satisfied.**
 *
 * FP ops: 3
 *
 * @param x A `f64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x + y`
 */
export function normalize(x: f64, y: f64): TwoF64 {
  const hi = x + y;
  return [hi, x - hi + y];
}

/**
 * @borrows normalize as fast2Sum
 */
export const fast2Sum = normalize;

/**
 * Fast extended-precision subtraction `x - y` (error-free transform).
 *
 * **NB. Assumes `|x| ≥ |y|`. Use `sub(x, y)` if this condition is not
 * satisfied.**
 *
 * FP ops: 3
 *
 * @param x A `f64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x - y`
 */
export function fast2Diff(x: f64, y: f64): TwoF64 {
  const hi = x - y;
  return [hi, x - hi - y];
}

/**
 * Dekker/Veltkamp splitter function (error-free transform).
 *
 * Split the given number into two halves, `hi` and `lo`, using the splitting
 * constant `F64_SPLITTER`. Return a tuple `[hi, lo]` where the non-zero bits in
 * `hi` and `lo` don't overlap and such that mathematically `hi + lo = x`.
 *
 * FP ops: 4
 *
 * @see {@link F64_SPLITTER}
 * @param x A `f64` number
 * @returns A tuple `[hi, lo]` such that `hi + lo = x`
 */
export function split(x: f64): [f64, f64] {
  const c = F64_SPLITTER*x;
  const hi = c + (x - c);
  return [hi, x - hi];
}

/**
 * Extended-precision addition `x + y` (error-free transform - Møller & Knuth
 * algorithm).
 *
 * FP ops: 6
 *
 * @param x A `f64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x + y`
 */
export function twoSum(x: f64, y: f64): TwoF64 {
  const hi = x + y;
  const x1 = hi - y;
  const y1 = hi - x1;
  return [hi, x - x1 + (y - y1)];
}

/**
 * Extended-precision subtraction `x - y` (error-free transform - Møller & Knuth
 * algorithm).
 *
 * FP ops: 6
 *
 * @param x A `f64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x - y`
 */
export function twoDiff(x: f64, y: f64): TwoF64 {
  const hi = x - y;
  const x1 = hi + y;
  const y1 = hi - x1;
  return [hi, x - x1 - (y + y1)];
}

/**
 * Extended-precision multiplication `x * y` (error-free transform - Dekker /
 * Veltkamp product).
 *
 * FP ops: 17
 *
 * @param x A `f64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x * y`
 */
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

/**
 * Extended-precision multiplication `x * x` (error-free transform - Dekker /
 * Veltkamp product).
 *
 * FP ops: 12
 *
 * @param x A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x²`
 */
export function twoSquare(x: f64): TwoF64 {
  const [xhi, xlo] = split(x);
  const hi = x*x;
  const lh = xhi*xlo;
  const e1 = hi - xhi*xhi;
  const e2 = e1 - lh - lh;
  const lo = xlo*xlo - e2;
  return [hi, lo];
}
