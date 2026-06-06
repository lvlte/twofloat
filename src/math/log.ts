/**
 * @file Logarithms
 */

import { NaN2, ZERO, type f64, type TwoF64 } from "../base/common.js";
import { add21, add22, div22, sub12, sub21, sub22 } from "../arithmetic/index.js";
import { isNaN2 } from "../base/compare.js";
import { INF, NINF } from "./constants.js";
import { exp1 } from "./exp.js";

/**
 * Compute `ln(x)`, the natural logarithm of `x`, using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function ln1(x: f64): TwoF64 {
  switch (x) {
    case 0:
      return NINF;

    case 1:
      return ZERO;

    case Infinity:
      return INF;

    default:
      if (x < 0 || Number.isNaN(x)) {
        return NaN2;
      }
  }

  // Newton's method (cubic convergence)
  // yₙ₊₁ = yₙ − 2(e^yₙ − x)/(e^yₙ + x)
  const y = Math.log(x);
  const ey = exp1(y);
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
export function ln2(x: TwoF64): TwoF64 {
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
      if (xhi < 0 || isNaN2(x)) {
        return NaN2;
      }
      y = Math.log(xhi);
  }

  // Newton's method (cubic convergence)
  // yₙ₊₁ = yₙ − 2(e^yₙ − x)/(e^yₙ + x)
  const ey = exp1(y);
  const [rhi, rlo] = div22(sub22(ey, x), add22(ey, x));
  return sub12(y, [2*rhi, 2*rlo]);
}

