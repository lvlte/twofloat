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
} from './common.js';

import {
  normalize,
  twoSum,
  twoDiff,
  twoProd,
} from './eft.js';

/**
 * Extended-precision computation of `(xhi, xlo) + y`.
 *
 * Relative error bound: `2u²` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function DWPlusFP([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const [hi, lo] = twoSum(xhi, y);
  return normalize(hi, xlo + lo);
}

/**
 * Extended-precision computation of `(xhi, xlo) + (yhi, ylo)`.
 *
 * Relative error bound: `3u² + 13u³` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function AccurateDWPlusDW([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const [shi, slo] = twoSum(xhi, yhi);
  const [thi, tlo] = twoSum(xlo, ylo);
  const [vhi, vlo] = normalize(shi, slo + thi);
  return normalize(vhi, tlo + vlo);
}

/**
 * Extended-precision computation of `(xhi, xlo) * y`.
 *
 * Relative error bound: `3u²/2 + 4u³` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function DWTimesFP1([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const [shi, slo] = twoProd(xhi, y);
  const [hi, lo] = normalize(shi, xlo*y);
  return normalize(hi, lo + slo);
}

/**
 * Extended-precision computation of `(xhi, xlo) * (yhi, ylo)`.
 *
 * Relative error bound: `5u²` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function DWTimesDW1([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const [hi, lo] = twoProd(xhi, yhi);
  return normalize(hi, lo + (xhi*ylo + xlo*yhi));
}

/**
 * Extended-precision computation of `(xhi, xlo) / y`.
 *
 * Relative error bound: `3u²` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function DWDivFP3([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const hi = xhi/y;
  const [shi, slo] = twoProd(hi, y);
  return normalize(hi, (((xhi - shi) - slo) + xlo)/y);
}

/**
 * Extended-precision computation of `(xhi, xlo) / (yhi, ylo)`.
 *
 * Relative error bound: `15u² + 56u³` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function DWDivDW2([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const hi = xhi/yhi;
  const [rhi, rlo] = DWTimesFP1([yhi, ylo], hi);
  return normalize(hi, ((xhi - rhi) + (xlo - rlo))/yhi);
}

/**
 * Extended-precision computation of `(xhi, xlo) - y`.
 *
 * Relative error bound: `2u²` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function DWMinusFP([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  // based on DWPlusFP
  const [hi, lo] = twoDiff(xhi, y);
  return normalize(hi, xlo + lo);
}

/**
 * Extended-precision computation of `(xhi, xlo) - (yhi, ylo)`.
 *
 * Relative error bound: `3u² + 13u³` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function AccurateDWMinusDW([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  // based on AccurateDWPlusDW
  const [shi, slo] = twoDiff(xhi, yhi);
  const [thi, tlo] = twoDiff(xlo, ylo);
  const [vhi, vlo] = normalize(shi, slo + thi);
  return normalize(vhi, tlo + vlo);
}

/**
 * Extended-precision computation of `x/y`.
 *
 * Relative error bound: `3u²` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function twoDiv(x: f64, y: f64): TwoF64 {
  // based on DWDivFP3
  const hi = x/y;
  const [shi, slo] = twoProd(hi, y);
  return normalize(hi, (x - shi - slo)/y);
}

/**
 * Extended-precision computation of `1/x`.
 *
 * Relative error bound: `3u²` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function twoInv(x: f64): TwoF64 {
  // based on DWDivFP3
  const hi = 1/x;
  const [shi, slo] = twoProd(hi, x);
  return normalize(hi, (1 - shi - slo)/x);
}

/**
 * Extended-precision computation of `1 / (xhi, xlo)`.
 *
 * Relative error bound: `15u² + 56u³` with `u = 2^-53` (*J.M. Muller et al.*).
 */
export function DWInv([xhi, xlo]: TwoF64): TwoF64 {
  // based on DWDivDW2
  const hi = 1/xhi;
  const [rhi, rlo] = DWTimesFP1([xhi, xlo], hi);
  return normalize(hi, (1 - rhi - rlo)/xhi);
}
