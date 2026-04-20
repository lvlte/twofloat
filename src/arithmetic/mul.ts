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
 * @returns {TwoF64} A tuple `[hi, lo]` in its canonical form
 */
export function prod1(terms: ArrayLike<f64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ONE2;

    case 1:
      return [terms[0], 0];

    case 2:
      return twoProd(...terms as [f64, f64]);

    case undefined:
      return NaN2;
  }

  // Compensated algorithm (Graillat; Ogita, Rump and Oishi)

  let hi = terms[0];
  let lo = 0;
  let ei = 0;

  for (let i = 1; i < terms.length; i++) {
    const a = terms[i];
    [hi, ei] = twoProd(hi, a);
    lo = lo*a + ei;
  }

  return normalize(hi, lo);
}
