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
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function sum1(terms: ArrayLike<f64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ZERO2;

    case 1:
      return [terms[0], 0*terms[0]];

    case 2:
      return add11(terms[0], terms[1]);

    case 3:
      return add21(add11(terms[0], terms[1]), terms[2]);

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

/**
 * Extended-precision addition of a given sequence of `TwoF64` numbers.
 *
 * @param {ArrayLike<TwoF64>} terms Array-like object of `TwoF64` summands
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function sum2(terms: ArrayLike<TwoF64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ZERO2;

    case 1:
      return terms[0];

    case 2:
      return add22(terms[0], terms[1]);

    case undefined:
      return NaN2;
  }

  let s = add22(terms[0], terms[1]);
  for (let i = 2; i < terms.length; i++) {
    s = add22(s, terms[i]);
  }

  return s;
}

// Alternative sum2: sum1(hi) ++ sum1(lo)
// Appear to be more accurate (on average) when both :
// - terms.length < 100
// - eps(max_abs(terms) / min_abs(terms)) < 1
export function sum2_alt(terms: ArrayLike<TwoF64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ZERO2;

    case 1:
      return terms[0];

    case 2:
      return add22(terms[0], terms[1]);

    case undefined:
      return NaN2;
  }

  let hhi = terms[0][0];
  let hlo = 0;
  let hlo_i = 0;

  let lhi = terms[0][1];
  let llo = 0;
  let llo_i = 0;

  for (let i = 1; i < terms.length; i++) {
    [hhi, hlo_i] = add11(hhi, terms[i][0]);
    [lhi, llo_i] = add11(lhi, terms[i][1]);
    hlo += hlo_i;
    llo += llo_i;
  }

  const hi = normalize(hhi, hlo);
  const lo = normalize(lhi, llo);

  return add22(hi, lo);
}
