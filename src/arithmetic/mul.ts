/**
 * @file Arithmetic - Multiplication
 */

import {
  type f64,
  type TwoF64,
  NaN2,
  ONE2,
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
 * @param {ArrayLike<f64>} terms Array-like object of `f64` summands
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function prod1(terms: ArrayLike<f64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ONE2;

    case 1:
      return [terms[0], 0*terms[0]];

    case 2:
      return mul11(terms[0], terms[1]);

    case 3:
      return mul21(mul11(terms[0], terms[1]), terms[2]);

    case undefined:
      return NaN2;
  }

  // Compensated algorithm (Graillat; Ogita, Rump and Oishi)

  let hi = terms[0];
  let lo = 0;
  let lo_i = 0;

  for (let i = 1; i < terms.length; i++) {
    const a = terms[i];
    [hi, lo_i] = mul11(hi, a);
    lo = lo*a + lo_i;
  }

  return normalize(hi, lo);
}

/**
 * Extended-precision product of a given sequence of `TwoF64` numbers.
 *
 * @param {ArrayLike<TwoF64>} terms Array-like object of `TwoF64` summands
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function prod2(terms: ArrayLike<TwoF64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ONE2;

    case 1:
      return terms[0];

    case 2:
      return mul22(terms[0], terms[1]);

    case undefined:
      return NaN2;
  }

  let p = mul22(terms[0], terms[1]);

  for (let i = 2; i < terms.length; i++) {
    p = mul22(p, terms[i]);
  }

  return p;
}
