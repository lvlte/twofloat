import {
  DWDivFP3,
  DWDivDW2,
  twoDiv,
  twoInv,
  DWInv,
} from '../base/algorithms.js';
import type { f64, TwoF64 } from '../base/common.js';
import { normalize } from '../base/eft.js';
import { mul21 } from './mul.js';

export const div11 = twoDiv;
export const div21 = DWDivFP3;
export const div22 = DWDivDW2;

export const inv1 = twoInv;
export const inv2 = DWInv;

/**
 * Extended-precision computation of `x / (yₕᵢ + yₗₒ)`.
 *
 * Relative error bound: `15u² + 56u³` with `u = 2^-53`
 */
export function div12(x: f64, [yhi, ylo]: TwoF64): TwoF64 {
  const hi = x/yhi;
  const [rhi, rlo] = mul21([yhi, ylo], hi);
  return normalize(hi, ((x - rhi) - rlo)/yhi);
}
