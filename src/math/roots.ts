/**
 * @file Roots
 */

import { type TwoF64, type f64, NaN2, ZERO } from '../base/common.js';
import { add21, div12, mul21 } from '../arithmetic/index.js';
import { normalize } from '../base/eft.js';
import { square1 } from '../math/exp.js';
import { INF, NINF } from './constants.js';


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
  if (x <= 0) {
    return x === 0 ? ZERO : NaN2;
  }

  const hi = Math.sqrt(x);
  const [shi, slo] = square1(hi);
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
    return xhi === 0 ? ZERO : NaN2;
  }

  const hi = Math.sqrt(xhi);
  const [shi, slo] = square1(hi);
  const eh = xhi - shi - slo;
  const lo = (xlo + eh)/(2*hi);

  return normalize(hi, lo);
}

/**
 * Computes `∛(x)`, the cube root of `x`, using extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function cbrt1(x: f64): TwoF64 {
  if (x === 0) {
    return ZERO;
  }

  if (!Number.isFinite(x)) {
    return x > 0 ? INF : (x < 0 ? NINF : NaN2);
  }

  // yₖ₊₁ = yₖ + (x - yₖ³) / 3yₖ²n√a
  const y = Math.cbrt(x);
  const y2 = square1(y);
  const [y3h, y3l] = mul21(y2, y);
  const p = x - y3h - y3l;
  const q = mul21(y2, 3);

  return add21(div12(p, q), y);
}

/**
 * Computes `∛(xₕᵢ + xₗₒ)`, the cube root of `x`, using extended precision
 * arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function cbrt2(x: TwoF64): TwoF64;
export function cbrt2([xhi, xlo]: TwoF64): TwoF64 {
  if (xhi === 0) {
    return ZERO;
  }

  if (!Number.isFinite(xhi)) {
    return xhi > 0 ? INF : (xhi < 0 ? NINF : NaN2);
  }

  const y = Math.cbrt(xhi);
  const y2 = square1(y);
  const [y3h, y3l] = mul21(y2, y);
  const p = xhi - y3h - y3l + xlo;
  const q = mul21(y2, 3);

  return add21(div12(p, q), y);
}
