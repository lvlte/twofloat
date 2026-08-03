/**
 * @file Hyperbolic functions
 */

import { type f64, type TwoF64 } from "../base/common.js";
import { add21, add22, div22, inv2, sub21, sub22 } from "../arithmetic/index.js";
import { exp_1, exp_2, expm1_1, expm1_2} from "./exp.js";
import { sqrt_2 } from "./roots.js";

/**
 * Compute the hyperbolic sine of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function sinh_1(x: f64): TwoF64 {
  if (Math.abs(x) < Math.LN2) {
    // (e²ˣ - 1) / 2eˣ
    const e2xm1 = expm1_1(2*x);
    const [rhi, rlo] = sqrt_2(add21(e2xm1, 1));
    return div22(e2xm1, [2*rhi, 2*rlo]);
  }

  // (eˣ - e⁻ˣ) / 2
  const ex = exp_1(x);
  const [yhi, ylo] = sub22(ex, inv2(ex));
  return [yhi/2, ylo/2];
}

/**
 * Compute the hyperbolic sine of `x` using extended-precision arithmetic.
 *
 * @param x A `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function sinh_2(x: TwoF64): TwoF64;
export function sinh_2([xhi, xlo]: TwoF64): TwoF64 {
  if (Math.abs(xhi) < Math.LN2) {
    const e2xm1 = expm1_2([2*xhi, 2*xlo]);
    const [rhi, rlo] = sqrt_2(add21(e2xm1, 1));
    return div22(e2xm1, [2*rhi, 2*rlo]);
  }

  const ex = exp_2([xhi, xlo]);
  const [yhi, ylo] = sub22(ex, inv2(ex));
  return [yhi/2, ylo/2];
}

/**
 * Compute the hyperbolic cosine of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function cosh_1(x: f64): TwoF64 {
  const ex = exp_1(x);
  const [yhi, ylo] = add22(ex, inv2(ex));
  return [yhi/2, ylo/2];
}

/**
 * Compute the hyperbolic cosine of `x` using extended-precision arithmetic.
 *
 * @param x A `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function cosh_2(x: TwoF64): TwoF64 {
  const ex = exp_2(x);
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
    const ex = exp_1(x);
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
    const ex = exp_2(x);
    ex_m1 = sub21(ex, 1);
    ex_p1 = add21(ex, 1);
  }
  return [ex_m1, ex_p1];
}

/**
 * Compute the hyperbolic tangent of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function tanh_1(x: f64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_1(2*x);
  return div22(ex_m1, ex_p1);
}

/**
 * Compute the hyperbolic tangent of `x` using extended-precision arithmetic.
 *
 * @param x A `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function tanh_2(x: TwoF64): TwoF64;
export function tanh_2([xhi, xlo]: TwoF64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_2([2*xhi, 2*xlo]);
  return div22(ex_m1, ex_p1);
}

/**
 * Compute the hyperbolic cotangent of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function coth_1(x: f64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_1(2*x);
  return div22(ex_p1, ex_m1);
}

/**
 * Compute the hyperbolic cotangent of `x` using extended-precision arithmetic.
 *
 * @param x A `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function coth_2(x: TwoF64): TwoF64;
export function coth_2([xhi, xlo]: TwoF64): TwoF64 {
  const [ex_m1, ex_p1] = _exp_pm1_2([2*xhi, 2*xlo]);
  return div22(ex_p1, ex_m1);
}

/**
 * Compute the hyperbolic secant of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function sech_1(x: f64): TwoF64 {
  return inv2(cosh_1(x));
}

/**
 * Compute the hyperbolic secant of `x` using extended-precision arithmetic.
 *
 * @param x A `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function sech_2(x: TwoF64): TwoF64 {
  return inv2(cosh_2(x));
}

/**
 * Compute the hyperbolic cosecant of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function csch_1(x: f64): TwoF64 {
  return inv2(sinh_1(x));
}

/**
 * Compute the hyperbolic cosecant of `x` using extended-precision arithmetic.
 *
 * @param x A `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function csch_2(x: TwoF64): TwoF64 {
  return inv2(sinh_2(x));
}

/**
 * Compute the hyperbolic sine of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function sinh(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? sinh_1(x) : sinh_2(x);
}

/**
 * Compute the hyperbolic cosine of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function cosh(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? cosh_1(x) : cosh_2(x);
}

/**
 * Compute the hyperbolic tangent of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function tanh(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? tanh_1(x) : tanh_2(x);
}

/**
 * Compute the hyperbolic cotangent of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function coth(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? coth_1(x) : coth_2(x);
}

/**
 * Compute the hyperbolic secant of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function sech(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? sech_1(x) : sech_2(x);
}

/**
 * Compute the hyperbolic cosecant of `x` using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number representing an hyperbolic angle
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function csch(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? csch_1(x) : csch_2(x);
}
