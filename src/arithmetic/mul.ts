/**
 * @file Arithmetic - Multiplication
 */

import {
  type f64,
  type TwoF64,
  NaN2,
  ONE,
} from '../base/common.js';

import { normalize, twoProd } from '../base/eft.js';
import { DWTimesFP1, DWTimesDW1 } from '../base/algorithms.js';

export const mul11 = twoProd;
export const mul21 = DWTimesFP1;
export const mul22 = DWTimesDW1;

/**
 * Extended-precision product of a given sequence of floating-point numbers.
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is faithfully rounded as
 * long as `n < 2^25`, `n` being the number of terms in the sequence.
 *
 * @param {ArrayLike<f64>} factors Array-like object of `f64` summands
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function prod1(factors: ArrayLike<f64>): TwoF64 {
  switch (factors.length) {
    case 0:
      return ONE;

    case 1:
      return [factors[0], 0*factors[0]];

    case 2:
      return mul11(factors[0], factors[1]);

    case 3:
      return mul21(mul11(factors[0], factors[1]), factors[2]);

    case undefined:
      return NaN2;
  }

  // Compensated algorithm (Graillat; Ogita, Rump and Oishi)

  let hi = factors[0];
  let lo = 0;
  let lo_i = 0;

  for (let i = 1; i < factors.length; i++) {
    const a = factors[i];
    [hi, lo_i] = mul11(hi, a);
    lo = lo*a + lo_i;
  }

  return normalize(hi, lo);
}

/**
 * Extended-precision product of a given sequence of `TwoF64` numbers.
 *
 * @param {ArrayLike<TwoF64>} factors Array-like object of `TwoF64` summands
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function prod2(factors: ArrayLike<TwoF64>): TwoF64 {
  switch (factors.length) {
    case 0:
      return ONE;

    case 1:
      return factors[0];

    case 2:
      return mul22(factors[0], factors[1]);

    case undefined:
      return NaN2;
  }

  let p = mul22(factors[0], factors[1]);

  for (let i = 2; i < factors.length; i++) {
    p = mul22(p, factors[i]);
  }

  return p;
}

/**
 * Extended-precision multiplication `x * y`.
 *
 * @returns The {@link TwoF64|`TwoF64`} representation of `x * y`
 */
export function mul(x: f64 | TwoF64, y: f64 | TwoF64): TwoF64 {
  return typeof x === 'number'
    ? typeof y === 'number' ? mul11(x, y) : mul21(y, x)
    : typeof y === 'number' ? mul21(x, y) : mul22(x, y);
}

/**
 * Extended-precision product of a given sequence of numbers (that must all be
 * of the same type, either `f64` or `TwoF64`, no mix allowed).
 *
 * @param factors Array-like object of factors
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function prod(factors: ArrayLike<f64> | ArrayLike<TwoF64>): TwoF64 {
  return typeof factors[0] === 'number'
    ? prod1(factors as ArrayLike<f64>)
    : prod2(factors as ArrayLike<TwoF64>); // TwoF64 or undefined (empty)
}
