/**
 * @file Hyperbolic functions
 */

import { type f64, type TwoF64 } from "../base/common.js";
import { add21, add22, div22, inv2, sub21, sub22 } from "../arithmetic/index.js";
import { exp1, exp2, expm1_1, expm1_2} from "./exp.js";
import { sqrt2 } from "./roots.js";

/**
 * Computes the hyperbolic sine of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function sinh1(x: f64): TwoF64 {
  if (Math.abs(x) < Math.LN2) {
    // (e²ˣ - 1) / 2eˣ
    const e2xm1 = expm1_1(2*x);
    const [rhi, rlo] = sqrt2(add21(e2xm1, 1));
    return div22(e2xm1, [2*rhi, 2*rlo]);
  }

  // (eˣ - e⁻ˣ) / 2
  const ex = exp1(x);
  const [yhi, ylo] = sub22(ex, inv2(ex));
  return [yhi/2, ylo/2];
}

/**
 * Computes the hyperbolic sine of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function sinh2(x: TwoF64): TwoF64;
export function sinh2([xhi, xlo]: TwoF64): TwoF64 {
  if (Math.abs(xhi) < Math.LN2) {
    const e2xm1 = expm1_2([2*xhi, 2*xlo]);
    const [rhi, rlo] = sqrt2(add21(e2xm1, 1));
    return div22(e2xm1, [2*rhi, 2*rlo]);
  }

  const ex = exp2([xhi, xlo]);
  const [yhi, ylo] = sub22(ex, inv2(ex));
  return [yhi/2, ylo/2];
}

/**
 * Computes the hyperbolic cosine of `x`, where `x` is expressed in radians,
 * using extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function cosh1(x: f64): TwoF64 {
  const ex = exp1(x);
  const [yhi, ylo] = add22(ex, inv2(ex));
  return [yhi/2, ylo/2];
}

/**
 * Computes the hyperbolic cosine of `x`, where `x` is expressed in radians,
 * using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function cosh2(x: TwoF64): TwoF64 {
  const ex = exp2(x);
  const [yhi, ylo] = add22(ex, inv2(ex));
  return [yhi/2, ylo/2];
}

/**
 * Return `[TwoF64(eˣ - 1), TwoF64(eˣ + 1)]`.
 */
function _exp_pm1_1(x: f64): [TwoF64, TwoF64]{
  let ex_m1: TwoF64;
  let ex_p1: TwoF64;
  if (Math.abs(x) < Math.LN2) {
    ex_m1 = expm1_1(x);
    ex_p1 = add21(ex_m1, 2);
  }
  else {
    const ex = exp1(x);
    ex_m1 = sub21(ex, 1);
    ex_p1 = add21(ex, 1);
  }
  return [ex_m1, ex_p1];
}

/**
 * Return `[TwoF64(eˣ - 1), TwoF64(eˣ + 1)]`.
 */
function _exp_pm1_2(x: TwoF64): [TwoF64, TwoF64]{
  let ex_m1: TwoF64;
  let ex_p1: TwoF64;
  if (Math.abs(x[0]) < Math.LN2) {
    ex_m1 = expm1_2(x);
    ex_p1 = add21(ex_m1, 2);
  }
  else {
    const ex = exp2(x);
    ex_m1 = sub21(ex, 1);
    ex_p1 = add21(ex, 1);
  }
  return [ex_m1, ex_p1];
}

/**
 * Computes the hyperbolic tangent of `x`, where `x` is expressed in radians,
 * using extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function tanh1(x: f64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_1(2*x);
  return div22(ex_m1, ex_p1);
}

/**
 * Computes the hyperbolic tangent of `x`, where `x` is expressed in radians,
 * using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function tanh2(x: TwoF64): TwoF64;
export function tanh2([xhi, xlo]: TwoF64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_2([2*xhi, 2*xlo]);
  return div22(ex_m1, ex_p1);
}

/**
 * Computes the hyperbolic cotangent of `x`, where `x` is expressed in radians,
 * using extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function coth1(x: f64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_1(2*x);
  return div22(ex_p1, ex_m1);
}

/**
 * Computes the hyperbolic cotangent of `x`, where `x` is expressed in radians,
 * using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function coth2(x: TwoF64): TwoF64;
export function coth2([xhi, xlo]: TwoF64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_2([2*xhi, 2*xlo]);
  return div22(ex_p1, ex_m1);
}
