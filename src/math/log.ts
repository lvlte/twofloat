/**
 * @file Logarithms
 */

import { NaN2, ONE, ZERO, type f64, type TwoF64 } from "../base/common.js";
import { add21, add22, div22, sub12, sub21, sub22 } from "../arithmetic/index.js";
import { INF, LN10, LN2, NINF } from "./constants.js";
import { exp_1 } from "./exp.js";

/**
 * Compute `ln(x)`, the natural logarithm of `x`, using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function ln_1(x: f64): TwoF64 {
  switch (x) {
    case 0:
      return NINF;

    case 1:
      return ZERO;

    case Infinity:
      return INF;
  }

  // Newton's method (cubic convergence)
  // yₙ₊₁ = yₙ − 2(e^yₙ − x)/(e^yₙ + x)
  const y = Math.log(x);
  const ey = exp_1(y);
  const [rhi, rlo] = div22(sub21(ey, x), add21(ey, x));
  return sub12(y, [2*rhi, 2*rlo]);
}

/**
 * Compute `ln(xₕᵢ + xₗₒ)`, the natural logarithm of `x`, using extended
 * precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function ln_2(x: TwoF64): TwoF64 {
  const [xhi, xlo] = x;
  let y: f64;

  switch (xhi) {
    case 0:
      return NINF;

    case 1:
      if (xlo === 0) {
        return ZERO;
      }
      y = Math.log1p(xlo);
      break;

    case Infinity:
      return INF;

    default:
      y = Math.log(xhi);
  }

  const ey = exp_1(y);
  const [rhi, rlo] = div22(sub22(ey, x), add22(ey, x));
  return sub12(y, [2*rhi, 2*rlo]);
}

/**
 * Compute `log₂(x)`, the base-2 logarithm of `x`, using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function log2_1(x: f64): TwoF64 {
  switch (x) {
    case 0:
      return NINF;

    case 1:
      return ZERO;

    case 2:
      return ONE;

    case Infinity:
      return INF;
  }

  const y = Math.log2(x);
  if (Number.isInteger(y) && 2**y === x) {
    return [y, 0];
  }

  return div22(ln_1(x), LN2);
}

/**
 * Compute `log₂(xₕᵢ + xₗₒ)`, the base-2 logarithm of `x`, using extended
 * precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function log2_2(x: TwoF64): TwoF64 {
  const [xhi, xlo] = x;

  if (xlo === 0) {
    return log2_1(xhi);
  }

  if (!Number.isFinite(xhi)) {
    return xhi > 0 ? INF : NaN2;
  }

  return div22(ln_2(x), LN2);
}

/**
 * Compute `log₁₀(x)`, the base-10 logarithm of `x`, using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function log10_1(x: f64): TwoF64 {
  switch (x) {
    case 0:
      return NINF;

    case 1:
      return ZERO;

    case 10:
      return ONE;

    case Infinity:
      return INF;
  }

  if (Number.isInteger(x)) {
    const y = Math.log10(x);
    if (Number.isInteger(y) && 10**y === x) {
      return [y, 0];
    }
  }

  return div22(ln_1(x), LN10);
}

/**
 * Compute `log₁₀(xₕᵢ + xₗₒ)`, the base-10 logarithm of `x`, using extended
 * precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function log10_2(x: TwoF64): TwoF64 {
  const [xhi, xlo] = x;

  if (xlo === 0) {
    return log10_1(xhi);
  }

  if (!Number.isFinite(xhi)) {
    return xhi > 0 ? INF : NaN2;
  }

  return div22(ln_2(x), LN10);
}
