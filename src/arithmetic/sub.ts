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
 * Extended-precision computation of `x - (yₕᵢ + yₗₒ)`.
 *
 * Relative error bound: `2u²` with `u = 2^-53`
 */
export function sub12(x: f64, [yhi, ylo]: TwoF64): TwoF64 {
  const [hi, lo] = sub11(x, yhi);
  return normalize(hi, lo - ylo);
}
