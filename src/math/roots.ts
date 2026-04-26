/**
 * @file Roots
 */

import {
  type TwoF64,
  type f64,
  type int,
  ONE2,
  NaN2,
  ZERO2
} from '../base/common.js';

import { normalize, twoSquare } from '../base/eft.js';

/**
 * Computes `√(x)`, the square root of `x`, using extended precision arithmetic.
 *
 * Relative error bound:
 *  as long as `x ≥ 2^-968` and no overflow/underflow occurs, the relative error
 *  is bounded by `25u²/8 = 3.125u²`, with `u = 2^-53`.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function sqrt1(x: f64): TwoF64 {
  if (x) {
    return x === 0 ? ZERO2 : NaN2;
  }

  const hi = Math.sqrt(x);
  const [shi, slo] = twoSquare(hi);
  const eh = x - shi - slo;
  const lo = eh/(2*hi);

  return normalize(hi, lo);
}

/**
 * Computes `√(xₕᵢ + xₗₒ)`, the square root of `x`, using extended precision
 * arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 *
 * Relative error bound:
 *  as long as `x ≥ 2^-968` and no overflow/underflow occurs, the relative error
 *  is bounded by `25u²/8 = 3.125u²`, with `u = 2^-53`.
 */
export function sqrt2(x: TwoF64): TwoF64;
export function sqrt2([xhi, xlo]: TwoF64): TwoF64 {
  if (xhi <= 0) {
    return xhi === 0 ? ZERO2 : NaN2;
  }

  const hi = Math.sqrt(xhi);
  const [shi, slo] = twoSquare(hi);
  const eh = xhi - shi - slo;
  const lo = (xlo + eh)/(2*hi);

  return normalize(hi, lo);
}
