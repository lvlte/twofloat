/**
 * @file Exponentiation functions
 */

import {
  type TwoF64,
  type f64,
  type int,
  ONE2,
  NaN2
} from '../base/common.js';

import { twoSquare, normalize } from '../base/eft.js';
import { inv1, inv2 } from '../arithmetic/div.js';
import { mul11, mul21, mul22 } from '../arithmetic/mul.js';

/**
 * Computes `x²` using extended precision arithmetic.
 *
 * Error-free transform.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export const square1 = twoSquare;

/**
 * Computes `(xₕᵢ + xₗₒ)²` using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 *
 * Relative error bound: `5u²`.
 */
export function square2(x: TwoF64): TwoF64;
export function square2([xhi, xlo]: TwoF64): TwoF64 {
  const [hi, lo] = square1(xhi);
  return normalize(hi, lo + (2*xhi*xlo));
}

/**
 * Computes `x³` using extended precision arithmetic.
 *
 * Relative error bound: `3u²/2 + 4u³`.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function cube1(x: f64): TwoF64 {
  let [hi, lo, e=0] = square1(x); // EFT (twoProd)
  return mul21([hi, lo], x);   // 3u²/2 + 4u³
  // [hi, e] = mul11(hi, x);         // EFT (twoProd)
  // return normalize(hi, lo*x + e); // 2u²
}

/**
 * Computes `(xₕᵢ + xₗₒ)³` using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function cube2(x: TwoF64): TwoF64 {
  return mul22(square2(x), x);
}

/**
 * Integer power of `x` - Computes `xⁿ` using extended precision arithmetic.
 * `n` must be an integer.
 *
 * Error bound:
 *  - for `|n| ≤ 3`, see {@link square1 | `square1`}, {@link cube1 | `cube1`}.
 *  - for positive `n`, the result `[hi, lo]` is such that `f64([hi, lo])` is a
 * faithful rounding of `x^n` as long as `n ≤ 2^49`.
 *
 * @param {f64} x `f64` number (base)
 * @param {int} n `int` number (integer exponent)
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function pow1int(x: f64, n: int): TwoF64 {
  switch (n) {
    case 0:
      return ONE2;

    case 1:
      return [x, 0*x];

    case 2:
      return square1(x);

    case 3:
      return cube1(x);

    case -1:
      return inv1(x);

    case -2:
      return inv2(square1(x));

    case -3:
      return inv2(cube1(x));

    default:
      if (!Number.isSafeInteger(n)) {
        return NaN2; // or throw ?
      }
  }

  const p = Math.abs(n);
  const xn = p > 30 ? _logpow(x, p) : _linpow(x, p);

  return n < 0 ? inv2(xn) : xn;
}

/**
 * Integer power using compensated linear product (Horner scheme applied to the
 * polynomial `p(x) = x^n`).
 *
 * **Assumes `n` is a {@link int | safe integer} such that `n ≥ 3`.**
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is a faithful rounding
 * of `x^n` as long as `n < 2^25`.
 */
export function _linpow(x: f64, n: int): TwoF64 {
  let [hi, lo] = cube1(x);
  let ei = 0;
  let i = 3;

  while (i++ < n) {
    [hi, ei] = mul11(hi, x);
    lo = lo*x + ei;
  }

  return normalize(hi, lo);
}

/**
 * Integer power using compensated logarithmic product, based on successive
 * squarings (RTL binary exponentiation).
 * Faster than {@link _linpow | `_linpow(x,n)`} for (roughly) `n > 30`.
 *
 * **Assumes `n` is a {@link int | safe integer} such that `n ≥ 3`.**
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is a faithful rounding
 * of `x^n` as long as `n ≤ 2^49`.
 */
export function _logpow(x: f64, n: int): TwoF64 {
  let sn: TwoF64 = square1(x);
  let xn: TwoF64 = [n % 2 ? x : 1, 0];
  let i = Math.floor(n/2);

  while (i > 1) {
    if (i % 2) {
      xn = mul22(xn, sn);
    }
    sn = square2(sn);
    i = Math.floor(i/2);
  }

  return mul22(xn, sn);
}

/**
 * Integer power using compensated logarithmic product, based on successive
 * squarings (LTR binary exponentiation).
 * Faster than {@link _linpow | `_linpow(x,n)`} for (roughly) `n > 30`.
 *
 * **Assumes `n` is an integer (supports unsafe int) such that `n ≥ 2`.**
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is a faithful rounding
 * of `x^n` as long as `n ≤ 2^49`.
 */
export function _logpowltr(x: f64, n: int): TwoF64 {
  let bits = n.toString(2);
  let xn = square1(x);
  let i = 1;

  if (+bits[i]) {
    xn = mul21(xn, x);
  }

  while (++i < bits.length) {
    xn = square2(xn);
    if (+bits[i]) {
      xn = mul21(xn, x);
    }
  }

  return xn;
}
