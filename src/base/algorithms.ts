/**
 * @file Main algorithms with formally proven error bounds (*J.M. Muller et al.*).
 *
 * References:
 * - {@link https://csclub.uwaterloo.ca/~pbarfuss/dekker1971.pdf     | T.J. Dekker        }
 * - {@link https://people.eecs.berkeley.edu/~jrs/papers/robustr.pdf | J.R. Shewchuk      }
 * - {@link https://hal.science/hal-01351529v3/document              | J.M. Muller et al. }
 */

import {
  type f64,
  type TwoF64,
  ZERO
} from './common.js';

import {
  normalize,
  twoSum,
  twoDiff,
  twoProd,
} from './eft.js';

/**
 * Extended-precision addition `x + y`.
 *
 * Relative error bound: `2u²` (`u²` for positive operands), with `u = 2^-53`
 *
 * FP ops: 10
 *
 * @param x A `TwoF64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x + y`
 */
export function DWPlusFP(x: TwoF64, y: f64): TwoF64;
export function DWPlusFP([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const [hi, lo] = twoSum(xhi, y);
  return normalize(hi, xlo + lo);
}

/**
 * Extended-precision addition `x + y`.
 *
 * Relative error bound: `3u² + 13u³` with `u = 2^-53`
 *
 * FP ops: 20
 *
 * @param x A `TwoF64` number
 * @param y A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x + y`
 */
export function AccurateDWPlusDW(x: TwoF64, y: TwoF64): TwoF64;
export function AccurateDWPlusDW([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const [shi, slo] = twoSum(xhi, yhi);
  const [thi, tlo] = twoSum(xlo, ylo);
  const [vhi, vlo] = normalize(shi, slo + thi);
  return normalize(vhi, tlo + vlo);
}

/**
 * Extended-precision multiplication `x * y`.
 *
 * Relative error bound: `1.5u² + 4u³` with `u = 2^-53`
 *
 * FP ops: 25
 *
 * @param x A `TwoF64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x * y`
 */
export function DWTimesFP1(x: TwoF64, y: f64): TwoF64;
export function DWTimesFP1([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const [shi, slo] = twoProd(xhi, y);
  const [hi, lo] = normalize(shi, xlo*y);
  return normalize(hi, lo + slo);
}

/**
 * Extended-precision multiplication `x * y`.
 *
 * Relative error bound: `5u²` with `u = 2^-53`
 *
 * FP ops: 24
 *
 * @param x A `TwoF64` number
 * @param y A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x * y`
 */
export function DWTimesDW1(x: TwoF64, y: TwoF64): TwoF64;
export function DWTimesDW1([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const [hi, lo] = twoProd(xhi, yhi);
  return normalize(hi, lo + (xhi*ylo + xlo*yhi));
}

/**
 * Extended-precision division `x/y`.
 *
 * Relative error bound: `3u²` with `u = 2^-53`
 *
 * FP ops: 25
 *
 * @param x A `TwoF64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x/y`
 */
export function DWDivFP3(x: TwoF64, y: f64): TwoF64;
export function DWDivFP3([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const hi = xhi/y;
  const [shi, slo] = twoProd(hi, y);
  return normalize(hi, (((xhi - shi) - slo) + xlo)/y);
}

/**
 * Extended-precision division `x/y`.
 *
 * Relative error bound: `15u² + 56u³` with `u = 2^-53`
 *
 * FP ops: 33
 *
 * @param x A `TwoF64` number
 * @param y A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x/y`
 */
export function DWDivDW2(x: TwoF64, y: TwoF64): TwoF64;
export function DWDivDW2([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const hi = xhi/yhi;
  const [rhi, rlo] = DWTimesFP1([yhi, ylo], hi);
  return normalize(hi, ((xhi - rhi) + (xlo - rlo))/yhi);
}

/**
 * Extended-precision subtraction `x - y`.
 *
 * Relative error bound: `2u²` with `u = 2^-53`
 *
 * FP ops: 10
 *
 * @param x A `TwoF64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x - y`
 */
export function DWMinusFP(x: TwoF64, y: f64): TwoF64;
export function DWMinusFP([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  // based on DWPlusFP
  const [hi, lo] = twoDiff(xhi, y);
  return normalize(hi, xlo + lo);
}

/**
 * Extended-precision subtraction `x - y`.
 *
 * Relative error bound: `3u² + 13u³` with `u = 2^-53`
 *
 * FP ops: 17
 *
 * @param x A `TwoF64` number
 * @param y A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x - y`
 */
export function AccurateDWMinusDW(x: TwoF64, y: TwoF64): TwoF64;
export function AccurateDWMinusDW([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  // based on AccurateDWPlusDW
  const [shi, slo] = twoDiff(xhi, yhi);
  const [thi, tlo] = twoDiff(xlo, ylo);
  const [vhi, vlo] = normalize(shi, slo + thi);
  return normalize(vhi, tlo + vlo);
}

/**
 * Extended-precision division `x/y`.
 *
 * Relative error bound: `3u²` with `u = 2^-53`
 *
 * FP ops: 24
 *
 * @param x A `f64` number
 * @param y A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x/y`
 */
export function twoDiv(x: f64, y: f64): TwoF64 {
  // based on DWDivFP3
  const hi = x/y;
  const [shi, slo] = twoProd(hi, y);
  return normalize(hi, (x - shi - slo)/y);
}

/**
 * Extended-precision multiplicative inverse of `x`, `1/x`.
 *
 * Relative error bound: `3u²` with `u = 2^-53`
 *
 * FP ops: 24
 *
 * @param x A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `1/x`
 */
export function twoInv(x: f64): TwoF64 {
  // based on DWDivFP3
  const hi = 1/x;
  const [shi, slo] = twoProd(hi, x);
  return normalize(hi, (1 - shi - slo)/x);
}

/**
 * Extended-precision multiplicative inverse of `x`, `1/x`.
 *
 * Relative error bound: `15u² + 56u³` with `u = 2^-53`
 *
 * FP ops: 32
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `1/x`
 */
export function DWInv(x: TwoF64): TwoF64;
export function DWInv([xhi, xlo]: TwoF64): TwoF64 {
  // based on DWDivDW2
  const hi = 1/xhi;
  const [rhi, rlo] = DWTimesFP1([xhi, xlo], hi);
  return normalize(hi, (1 - rhi - rlo)/xhi);
}
