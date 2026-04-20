/**
 * @file Arithmetic - Addition
 */

import {
  type f64,
  type TwoF64,
  NaN2,
  ZERO2,
} from '../base/common.js';

import { normalize, twoSum } from '../base/eft.js';
import { DWPlusFP, AccurateDWPlusDW } from '../base/algorithms.js';

export const add11 = twoSum;
export const add21 = DWPlusFP;
export const add22 = AccurateDWPlusDW;

/**
 * Extended-precision addition of a given sequence of floating-point numbers.
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is faithfully rounded.
 *
 * @param {ArrayLike<f64>} terms Array-like object of `f64` summands
 * @returns {TwoF64} A tuple `[hi, lo]` in its canonical form
 */
export function sum1(terms: ArrayLike<f64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ZERO2;

    case 1:
      return [terms[0], 0*terms[0]];

    case 2:
      return add11(terms[0], terms[1]);

    case undefined:
      return NaN2;
  }

  // Kahan-Babuška's compensated summation algorithm, except we use `twoSum` EFT
  // instead of `fast2Sum` (cf. Ogita, Rump and Oishi).

  let hi = terms[0];
  let lo = 0;
  let lo_i = 0;

  for (let i = 1; i < terms.length; i++) {
    [hi, lo_i] = add11(hi, terms[i]);
    lo += lo_i;
  }

  return normalize(hi, lo);
}
