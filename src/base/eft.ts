
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
 * Canonical representation of `x + y` (error-free transform).
 *
 * Return a tuple `[hi, lo]` where the non-zero bits in `hi` and `lo` don't
 * overlap and such that mathematically `hi + lo = x + y`.
 *
 * **NB. Assumes the absolute value of `x` is larger than that of `y`. Use
 * `twoSum(x, y)` if this condition is not satisfied.**
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
 * Error-free transform of `x - y`.
 *
 * Return a tuple `[hi, lo]` where the non-zero bits in `hi` and `lo` don't
 * overlap and such that mathematically `hi + lo = x - y`.
 *
 * **NB. Assumes the absolute value of `x` is larger than that of `y`. Use
 * `twoDiff(x, y)` if this condition is not satisfied.**
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
 * `hi` and `lo` don't overlap and such that mathematically `hi + lo = x` .
 *
 * @see {@link F64_SPLITTER}
 */
export function split(x: f64): TwoF64 {
  const c = F64_SPLITTER*x;
  const hi = c + (x - c);
  return [hi, x - hi];
}

/**
 * Error-free transform of `x + y` (Møller & Knuth algorithm).
 *
 * Return a tuple `[hi, lo]` where the non-zero bits in `hi` and `lo` don't
 * overlap and such that mathematically `hi + lo = x + y`.
 */
export function twoSum(x: f64, y: f64): TwoF64 {
  const hi = x + y;
  const x1 = hi - y;
  const y1 = hi - x1;
  return [hi, x - x1 + (y - y1)];
}

/**
 * Error-free transform of `x - y` (Møller & Knuth algorithm).
 *
 * Return a tuple `[hi, lo]` where the non-zero bits in `hi` and `lo` don't
 * overlap and such that mathematically `hi + lo = x - y`.
 */
export function twoDiff(x: f64, y: f64): TwoF64 {
  const hi = x - y;
  const x1 = hi + y;
  const y1 = hi - x1;
  return [hi, x - x1 - (y + y1)];
}

/**
 * Error-free transform of `x * y` (Dekker/Veltkamp product).
 *
 * Return a high precision representation of `x * y` as a tuple `[hi, lo]`
 * where the non-zero bits in `hi` and `lo` don't overlap and such that
 * mathematically `hi + lo = x * y`.
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
 * Error-free transform of `x²` (Dekker/Veltkamp product).
 *
 * Return a high precision representation of the square of `x` as a tuple
 * `[hi, lo]` where the non-zero bits in `hi` and `lo` don't overlap and such
 * that mathematically `hi + lo = x²`.
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
