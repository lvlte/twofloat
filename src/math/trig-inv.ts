/**
 * @file Inverse trigonometric functions
 */

import { NaN2, ZERO, type f64, type TwoF64 } from "../base/common.js";
import { add21, add22, div12, div22, inv1, inv2, mul11, mul21, mul22, sub12, sub22 } from "../arithmetic/index.js";
import { abs2, neg2 } from "./sign.js";
import { asin_pade, atan_pade } from "../pre/trig-inv.js";
import { square_1, square_2 } from "./exp.js";
import { sqrt_1, sqrt_2 } from "./roots.js";
import { normalize } from "../base/eft.js";
import { eq21, eq22, ge21, gt21, isFinite2, isNaN2, isZero, lt21 } from "../base/compare.js";
import { SQRT1_2 } from "./constants.js";

/**
 * TwoF64 representation of `π/2` (`PI$2 > π/2`).
 */
const PI$2: TwoF64 = [1.5707963267948966, 6.123233995736766e-17];

/**
 * TwoF64 representation of `π/3` (`PI$3 > π/3`).
 */
const PI$3: TwoF64 = [1.0471975511965979, -1.072081766451091e-16];

/**
 * TwoF64 representation of `π/4` (`PI$4 > π/4`).
 */
const PI$4: TwoF64 = [0.7853981633974483, 3.061616997868383e-17];

/**
 * TwoF64 representation of `π/6` (`PI$6 > π/6`).
 */
const PI$6: TwoF64 = [0.5235987755982989, -5.360408832255455e-17];

/**
 * TwoF64 representation of `√3/2` (`SQRT3_$2 > √3/2`).
 */
const SQRT3_$2: TwoF64 = [0.8660254037844386, 5.0175421109034514e-17];

/**
 * Computes the inverse sine of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {f64} x A `f64` number in the domain `[-1, 1]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[-π/2, +π/2]`
 */
export function asin_1(x: f64): TwoF64 {

  switch (x) {
    case 0:
      return [x, 0];

    case 0.5:
      return PI$6;

    case -0.5:
      return neg2(PI$6);

    case 1:
      return PI$2;

    case -1:
      return neg2(PI$2);
  }

  const xabs = Math.abs(x);
  if (xabs <= 1 === false) {
    return NaN2;
  }

  // asin(x) = atan(x/√(1 − x²))

  // asin(x) = π/2 −  asin(√(1 − x²))      |√(1 − x²)|    < |x| for |x| > √(1/2)
  // asin(x) = π/2 − 2asin(√((1 − x)/2))   |√((1 − x)/2)| < |x| for |x| > 1/2
  // asin(x) = π/4 +  asin(2x² - 1)/2      |2x² - 1|      < |x| for |x| > 1/2

  if (xabs > 0.5) {
    // Argument reduction
    //   √((1 − x)/2) and 2x² - 1 intersect at x ≈ 0.8090169943749473

    if (xabs > 0.8090169943749473) {
      // asin(x) = π/2 − 2asin(√((1 − x)/2))
      const y = sqrt_1((1 - xabs)/2);
      const [hi, lo] = div22(..._asin_padé_2(y));
      return x > 0 ? sub22(PI$2, [2*hi, 2*lo]) : sub22([2*hi, 2*lo], PI$2);
    }

    // asin(x) = π/4 + asin(2x² - 1)/2
    const [x2h, x2l] = mul11(2*xabs, xabs);
    const y = normalize(x2h - 1, x2l);
    const [hi, lo] = div22(..._asin_padé_2(y));
    const r = add22(PI$4, [0.5*hi, 0.5*lo]);
    return x > 0 ? r : neg2(r);
  }

  const [p, q] = _asin_padé_1(x);
  return div22(p, q);
}

/**
 * Computes the inverse sine of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {TwoF64} x A `TwoF64` number in the domain `[-1, 1]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[-π/2, +π/2]`
 */
export function asin_2(x: TwoF64): TwoF64 {
  const [xhi, xlo] = x;
  if (xhi + xlo === 0) {
    return [xhi, xlo];
  }

  const xabs = abs2(x);
  if (isNaN2(x) || gt21(xabs, 1)) {
    return NaN2;
  }

  if (eq21(xabs, 0.5)) {
    return xhi > 0 ? PI$6 : neg2(PI$6);
  }

  if (eq22(xabs, SQRT1_2)) {
    return xhi > 0 ? PI$4 : neg2(PI$4);
  }

  if (eq22(xabs, SQRT3_$2)) {
    return xhi > 0 ? PI$3 : neg2(PI$3);
  }

  if (eq21(xabs, 1)) {
    return xhi > 0 ? PI$2 : neg2(PI$2);
  }

  if (gt21(xabs, 0.5)) {
    if (gt21(xabs, 0.8090169943749473)) {
      // asin(x) = π/2 − 2asin(√((1 − x)/2))
      const [shi, slo] = sub12(1, xabs);
      const y = sqrt_2([shi/2, slo/2]);
      const [hi, lo] = div22(..._asin_padé_2(y));
      return xhi > 0 ? sub22(PI$2, [2*hi, 2*lo]) : sub22([2*hi, 2*lo], PI$2);
    }

    // asin(x) = π/4 + asin(2x² - 1)/2
    const [shi, slo] = square_2(xabs);
    const y = normalize(2*shi - 1, 2*slo);
    const [hi, lo] = div22(..._asin_padé_2(y));
    const r = add22(PI$4, [0.5*hi, 0.5*lo]);
    return xhi > 0 ? r : neg2(r);
  }

  const [p, q] = _asin_padé_2(x);
  return div22(p, q);
}

/**
 * Return a Padé approximant of `asin(x)`, where `|x| ≤ 1`, as a rational `p/q`
 * represented as `[p, q]`.
 * NB. Accurate for `|x| ≤ 0.5` (~31-33 digits precision), above this value the
 * relative error starts to grow significantly.
 */
function _asin_padé_1(x: f64): [TwoF64, TwoF64] {
  // Padé [n/n] -> if n is odd, |P| = |Q|, otherwise |P| = |Q| - 1
  //
  //  p = x + P₁x³ + P₂x⁵ + ... + Pₖ*x²ᵏ⁺¹ + ...
  //  q = 1 + Q₁x² + Q₂x⁴ + ... + Qₖ*x²ᵏ   + ...

  const [P, Q] = asin_pade[27];
  let xpow = square_1(x);

  if (P.length < Q.length) {
    let p: TwoF64 = [x, 0];
    let q = mul22(Q[1], xpow);

    for (let k = 1; k < P.length; k++) {
      p = add22(p, mul22(P[k], xpow = mul21(xpow, x)));
      q = add22(q, mul22(Q[k+1], xpow = mul21(xpow, x)));
    }

    return [p, add21(q, 1)];
  }

  let q = mul22(Q[1], xpow);
  let p = mul22(P[1], xpow = mul21(xpow, x));

  for (let k = 2; k < P.length; k++) {
    q = add22(q, mul22(Q[k], xpow = mul21(xpow, x)));
    p = add22(p, mul22(P[k], xpow = mul21(xpow, x)));
  }

  return [add21(p, x), add21(q, 1)];
}

/**
 * @see _asin_padé_1
 */
function _asin_padé_2(x: TwoF64): [TwoF64, TwoF64] {
  const [P, Q] = asin_pade[27];
  let xpow = square_2(x);

  if (P.length < Q.length) {
    let p: TwoF64 = x;
    let q = mul22(Q[1], xpow);

    for (let k = 1; k < P.length; k++) {
      p = add22(p, mul22(P[k], xpow = mul22(xpow, x)));
      q = add22(q, mul22(Q[k+1], xpow = mul22(xpow, x)));
    }

    return [p, add21(q, 1)];
  }

  let q = mul22(Q[1], xpow);
  let p = mul22(P[1], xpow = mul22(xpow, x));

  for (let k = 2; k < P.length; k++) {
    q = add22(q, mul22(Q[k], xpow = mul22(xpow, x)));
    p = add22(p, mul22(P[k], xpow = mul22(xpow, x)));
  }

  return [add22(p, x), add21(q, 1)];
}

/**
 * Computes the inverse cosine of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {f64} x A `f64` number in the domain `[-1, 1]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[0, π]`
 */
export function acos_1(x: f64): TwoF64 {
  // acos(x) = π/2 − asin(x)
  return sub22(PI$2, asin_1(x));
}

/**
 * Computes the inverse cosine of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {TwoF64} x A `TwoF64` number in the domain `[-1, 1]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[0, π]`
 */
export function acos_2(x: TwoF64): TwoF64 {
  // acos(x) = π/2 − asin(x)
  return sub22(PI$2, asin_2(x));
}

/**
 * Computes the inverse tangent of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[-π/2, +π/2]`
 */
export function atan_1(x: f64): TwoF64 {
  if (Math.abs(x) <= 0.6) {
    if (x === 0) {
      return ZERO;
    }
    const [p, q] = _atan_padé_1(x);
    return div22(p, q);
  }

  if (!Number.isFinite(x)) {
    return Number.isNaN(x) ? NaN2 : x >= 0 ? PI$2 : neg2(PI$2);
  }

  // atan(x) = 2*atan( x / (1 + √(1 + x²)) )
  // -> for x ∈ ℝ, x/(1 + √(1 + x²)) ∈ [-1, 1]
  const x2p1 = add21(square_1(x), 1);
  const s = add21(sqrt_2(x2p1), 1);
  const [hi, lo] = atan_2(div12(x, s));

  return [2*hi, 2*lo];
}

/**
 * Computes the inverse tangent of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {TwoF64} x A `TwoF64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[-π/2, +π/2]`
 */
export function atan_2(x: TwoF64): TwoF64 {
  if (lt21(abs2(x), 0.6)) {
    if (isZero(x)) {
      return ZERO;
    }
    const [p, q] = _atan_padé_2(x);
    return div22(p, q);
  }

  if (!isFinite2(x)) {
    return isNaN2(x) ? NaN2 : ge21(x, 0) ? PI$2 : neg2(PI$2);
  }

  const x2p1 = add21(square_2(x), 1);
  const s = add21(sqrt_2(x2p1), 1);
  const [hi, lo] = atan_2(div22(x, s));

  return [2*hi, 2*lo];
}

/**
 * Return a Padé approximant of `atan(x)` as a rational `p/q` represented as
 * `[p, q]`.
 * NB. Accurate for `|x| ≤ 0.6` (~31-33 digits precision), above this value the
 * relative error starts to grow significantly.
 */
function _atan_padé_1(x: f64): [TwoF64, TwoF64] {
  // NB. Coefficients aside, the expansion is the same as for asin(x)
  const [P, Q] = atan_pade[28];
  let xpow = square_1(x);

  if (P.length < Q.length) {
    let p: TwoF64 = [x, 0];
    let q = mul22(Q[1], xpow);

    for (let k = 1; k < P.length; k++) {
      p = add22(p, mul22(P[k], xpow = mul21(xpow, x)));
      q = add22(q, mul22(Q[k+1], xpow = mul21(xpow, x)));
    }

    return [p, add21(q, 1)];
  }

  let q = mul22(Q[1], xpow);
  let p = mul22(P[1], xpow = mul21(xpow, x));

  for (let k = 2; k < P.length; k++) {
    q = add22(q, mul22(Q[k], xpow = mul21(xpow, x)));
    p = add22(p, mul22(P[k], xpow = mul21(xpow, x)));
  }

  return [add21(p, x), add21(q, 1)];
}

/**
 * @see _atan_padé_1
 */
function _atan_padé_2(x: TwoF64): [TwoF64, TwoF64] {
  const [P, Q] = atan_pade[28];
  let xpow = square_2(x);

  if (P.length < Q.length) {
    let p = x;
    let q = mul22(Q[1], xpow);

    for (let k = 1; k < P.length; k++) {
      p = add22(p, mul22(P[k], xpow = mul22(xpow, x)));
      q = add22(q, mul22(Q[k+1], xpow = mul22(xpow, x)));
    }

    return [p, add21(q, 1)];
  }

  let q = mul22(Q[1], xpow);
  let p = mul22(P[1], xpow = mul22(xpow, x));

  for (let k = 2; k < P.length; k++) {
    q = add22(q, mul22(Q[k], xpow = mul22(xpow, x)));
    p = add22(p, mul22(P[k], xpow = mul22(xpow, x)));
  }

  return [add22(p, x), add21(q, 1)];
}

/**
 * Computes the inverse cotangent of `x` using extended precision arithmetic.
 * The output is expressed in radians.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `(0, π)`
 */
export function acot_1(x: f64): TwoF64 {
  if (x === 0) {
    return PI$2;
  }

  if (!Number.isFinite(x)) {
    return Number.isNaN(x) ? NaN2 : ZERO;
  }

  return atan_2(inv1(x));
}

/**
 * Computes the inverse cotangent of `x` using extended precision arithmetic.
 * The output is expressed in radians.
 *
 * @param {TwoF64} x A `TwoF64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `(0, π)`
 */
export function acot_2(x: TwoF64): TwoF64 {
  if (isZero(x)) {
    return PI$2;
  }

  if (!isFinite2(x)) {
    return isNaN2(x) ? NaN2 : ZERO;
  }

  return atan_2(inv2(x));
}

/**
 * Computes the inverse secant of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {f64} x A `f64` number in the domain `ℝ ∖ (-1, 1)`
 * @returns {TwoF64} A `TwoF64` number in the range `[0, π]`
 */
export function asec_1(x: f64): TwoF64 {
  if (Math.abs(x) < 1 || Number.isNaN(x)) {
    return NaN2;
  }

  if (!Number.isFinite(x)) {
    return PI$2;
  }

  return acos_2(inv1(x));
}

/**
 * Computes the inverse secant of `x` using extended precision arithmetic. The
 * output is expressed in radians.
 *
 * @param {TwoF64} x A `TwoF64` number in the domain `ℝ ∖ (-1, 1)`
 * @returns {TwoF64} A `TwoF64` number in the range `[0, π]`
 */
export function asec_2(x: TwoF64): TwoF64 {
  if (lt21(abs2(x), 1) || isNaN2(x)) {
    return NaN2;
  }

  if (!isFinite2(x)) {
    return PI$2;
  }

  return acos_2(inv2(x));
}
