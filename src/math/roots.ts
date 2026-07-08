/**
 * @file Roots
 */

import { type TwoF64, type f64, type int, NaN2, ZERO } from '../base/common.js';
import { add21, add22, div12, div21, div22, mul11 } from '../arithmetic/index.js';
import { normalize } from '../base/eft.js';
import { powint_1, square_1 } from '../math/exp.js';
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
export function sqrt_1(x: f64): TwoF64 {
  if (x <= 0) {
    return x === 0 ? ZERO : NaN2;
  }

  if (!Number.isFinite(x)) {
    return x > 0 ? INF : NaN2;
  }

  // yₖ₊₁ = yₖ + (x - yₖ²) / 2yₖ

  const hi = Math.sqrt(x);
  const [shi, slo] = square_1(hi);
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
export function sqrt_2(x: TwoF64): TwoF64;
export function sqrt_2([xhi, xlo]: TwoF64): TwoF64 {
  if (xhi <= 0) {
    return xhi === 0 ? ZERO : NaN2;
  }

  if (!Number.isFinite(xhi)) {
    return xhi > 0 ? INF : NaN2;
  }

  const hi = Math.sqrt(xhi);
  const [shi, slo] = square_1(hi);
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
export function cbrt_1(x: f64): TwoF64 {
  if (x === 0) {
    return ZERO;
  }

  if (!Number.isFinite(x)) {
    return x > 0 ? INF : (x < 0 ? NINF : NaN2);
  }

  // yₖ₊₁ = (2yₖ + x/yₖ²) / 3

  const yₖ = Math.cbrt(x);
  const yₖ2 = square_1(yₖ);
  const x_yₖ2 = div12(x, yₖ2);

  return div21(add21(x_yₖ2, 2*yₖ), 3);
}

/**
 * Computes `∛(xₕᵢ + xₗₒ)`, the cube root of `x`, using extended precision
 * arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function cbrt_2(x: TwoF64): TwoF64;
export function cbrt_2([xhi, xlo]: TwoF64): TwoF64 {
  if (xhi === 0) {
    return ZERO;
  }

  if (!Number.isFinite(xhi)) {
    return xhi > 0 ? INF : (xhi < 0 ? NINF : NaN2);
  }

  const yₖ = Math.cbrt(xhi);
  const yₖ2 = square_1(yₖ);
  const x_yₖ2 = div22([xhi, xlo], yₖ2);

  return div21(add21(x_yₖ2, 2*yₖ), 3);
}

/**
 * Computes `ⁿ√(x)`, the nth root of `x`, using extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @param {int} x A `int` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function nthroot_1(x: f64, n: int): TwoF64 {
  if (x === 0) {
    return ZERO;
  }

  if (x < 0 && n % 2 === 0 || !Number.isInteger(n) || n < 1) {
    return NaN2;
  }

  if (!Number.isFinite(x)) {
    return x > 0 ? INF : (x < 0 ? NINF : NaN2);
  }

  // yₖ₊₁ = (yₖ*(n - 1) + x/yₖⁿ⁻¹) / n

  const m = n - 1;
  const yₖ = Math.sign(x) * Math.abs(x)**(1/n);
  const x_yₖm = div12(x, powint_1(yₖ, m));
  const num = add22(mul11(yₖ, m), x_yₖm);

  return div21(num, n);
}

/**
 * Computes `ⁿ√(x)`, the nth root of `x`, using extended precision arithmetic.
 *
 * @param {TwoF64} x A `TwoF64` number
 * @param {int} n A positive integer
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function nthroot_2(x: TwoF64, n: int): TwoF64;
export function nthroot_2([xhi, xlo]: TwoF64, n: int): TwoF64 {
  if (xhi === 0) {
    return ZERO;
  }

  if (xhi < 0 && n % 2 === 0 || !Number.isInteger(n) || n < 1) {
    return NaN2;
  }

  if (!Number.isFinite(xhi)) {
    return xhi > 0 ? INF : (xhi < 0 ? NINF : NaN2);
  }

  const m = n - 1;
  const yₖ = Math.sign(xhi) * Math.abs(xhi)**(1/n);
  const x_yₖm = div22([xhi, xlo], powint_1(yₖ, m));
  const num = add22(mul11(yₖ, m), x_yₖm);

  return div21(num, n);
}
