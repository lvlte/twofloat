/**
 * @file Arithmetic - Subtraction
 */

import { normalize, twoDiff } from '../base/eft.js';
import { DWMinusFP, AccurateDWMinusDW } from '../base/algorithms.js';
import type { f64, TwoF64 } from '../base/common.js';

export const sub11 = twoDiff;
export const sub21 = DWMinusFP;
export const sub22 = AccurateDWMinusDW;

/**
 * Extended-precision subtraction `x - y`.
 *
 * Relative error bound: `2u²` with `u = 2^-53`
 *
 * @returns The {@link TwoF64|`TwoF64`} representation of `x - y`
 */
export function sub12(x: f64, y: TwoF64): TwoF64;
export function sub12(x: f64, [yhi, ylo]: TwoF64): TwoF64 {
  const [hi, lo] = sub11(x, yhi);
  return normalize(hi, lo - ylo);
}

/**
 * Extended-precision subtraction `x - y`.
 *
 * @returns The {@link TwoF64|`TwoF64`} representation of `x - y`
 */
export function sub(x: f64 | TwoF64, y: f64 | TwoF64): TwoF64 {
  return typeof x === 'number'
    ? typeof y === 'number' ? sub11(x, y) : sub12(x, y)
    : typeof y === 'number' ? sub21(x, y) : sub22(x, y);
}
