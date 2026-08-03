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
 * Extended-precision division `x/y`.
 *
 * Relative error bound: `15u² + 56u³` with `u = 2^-53`
 *
 * FP ops: 32
 *
 * @param x A `f64` number
 * @param y A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x/y`
 */
export function div12(x: f64, y: TwoF64): TwoF64;
export function div12(x: f64, [yhi, ylo]: TwoF64): TwoF64 {
  const hi = x/yhi;
  const [rhi, rlo] = mul21([yhi, ylo], hi);
  return normalize(hi, ((x - rhi) - rlo)/yhi);
}

/**
 * Extended-precision division `x/y`.
 *
 * @param x A `f64` or `TwoF64` number
 * @param y A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x/y`
 */
export function div(x: f64 | TwoF64, y: f64 | TwoF64): TwoF64 {
  return typeof x === 'number'
    ? typeof y === 'number' ? div11(x, y) : div12(x, y)
    : typeof y === 'number' ? div21(x, y) : div22(x, y);
}

/**
 * Compute the multiplicative inverse of `x`, `1/x`, using extended-precision
 * arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `1/x`
 */
export function inv(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? inv1(x) : inv2(x);
}
