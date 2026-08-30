/**
 * Arithmetic - Addition
 *
 * @module twofloat/arithmetic/add
 */

import {
  type f64,
  type TwoF64,
  NaN2,
  ZERO,
} from '../base/common.js';

import { normalize, twoSum } from '../base/eft.js';
import { DWPlusFP, AccurateDWPlusDW } from '../base/algorithms.js';

export const add11 = twoSum;
export const add21 = DWPlusFP;
export const add22 = AccurateDWPlusDW;

/**
 * Extended-precision addition of a given sequence of floating-point numbers.
 *
 * @param terms `ArrayLike` object of `f64` summands
 * @returns The sum of the given `terms` as a {@link TwoF64|`TwoF64`} number
 */
export function sum1(terms: ArrayLike<f64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ZERO;

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
 * @param terms `ArrayLike` object of `TwoF64` summands
 * @returns The sum of the given `terms` as a {@link TwoF64|`TwoF64`} number
 */
export function sum2(terms: ArrayLike<TwoF64>): TwoF64 {
  switch (terms.length) {
    case 0:
      return ZERO;

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

/**
 * Extended-precision addition of a given sequence of `TwoF64` numbers.
 *
 * @param terms `ArrayLike` object of `TwoF64` summands
 * @returns The sum of the given `terms` as a {@link TwoF64|`TwoF64`} number
 */
export function sum2_alt(terms: ArrayLike<TwoF64>): TwoF64 {
  // Alternative sum2: sum1(hi) ++ sum1(lo)
  // Appear to be more accurate (on average) when both :
  // - terms.length < 100
  // - eps(max_abs(terms) / min_abs(terms)) < 1
  switch (terms.length) {
    case 0:
      return ZERO;

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

/**
 * Extended-precision addition `x + y`.
 *
 * @param x A `f64` or `TwoF64` number
 * @param y A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x + y`
 */
export function add(x: f64 | TwoF64, y: f64 | TwoF64): TwoF64 {
  return typeof x === 'number'
    ? typeof y === 'number' ? add11(x, y) : add21(y, x)
    : typeof y === 'number' ? add21(x, y) : add22(x, y);
}

/**
 * Extended-precision addition of a given sequence of numbers (that must all be
 * of the same type, either `f64` or `TwoF64`, no mix allowed).
 *
 * @param terms Array-like object of summands
 * @returns The sum of the given `terms` as a {@link TwoF64|`TwoF64`} number
 */
export function sum(terms: ArrayLike<f64> | ArrayLike<TwoF64>): TwoF64 {
  return typeof terms[0] === 'number'
    ? sum1(terms as ArrayLike<f64>)
    : sum2(terms as ArrayLike<TwoF64>);
}
