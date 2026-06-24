/**
 * @file Trigonometry
 */

import { type f64, type int, type TwoF64 } from "../base/common.js";
import { add21, add22, div22, mul21, mul22, sub22 } from "../arithmetic/index.js";
import { ge22, lt22 } from "../base/compare.js";
import { sin_pade, cos_pade, tan_pade_int } from "../pre/trig.js";
import { PI } from "./constants.js";
import { square1, square2 } from "./exp.js";
import { rem2pi_1, rem2pi_2, rempi_1, rempi_2 } from "./mod.js";
import { abs2, neg2 } from "./sign.js";

/**
 * TwoF64 representation of `π/2` (`PI_HALF > π/2`).
 */
const PI_HALF: TwoF64 = [1.5707963267948966, 6.123233995736766e-17];

/**
 * Computes the sine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function sin1(x: f64): TwoF64 {
  let sign = Math.sign(x);
  const xabs = Math.abs(x);

  if (xabs <= PI_HALF[0]) {
    return _sin1(x);
  }

  let r = rem2pi_1(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign *= -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? neg2(_cos(r)) : _cos(r);
  }

  return sign < 0 ? _sin2(neg2(r)) : _sin2(r);
}

/**
 * Computes the sine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function sin2(x: TwoF64): TwoF64 {
  let sign = Math.sign(x[0]);
  const xabs = abs2(x);

  if (lt22(xabs, PI_HALF)) {
    return _sin2(x);
  }

  let r = rem2pi_2(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign *= -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? neg2(_cos(r)) : _cos(r);
  }

  return sign < 0 ? _sin2(neg2(r)) : _sin2(r);
}

/**
 * Compute the sine of `x` using Padé approximant. Accurate for `|x| < π/2`
 * (the relative error grows significantly as `x` moves away from that range).
 */
export function _sin1(x: f64): TwoF64 {
  // Padé [n/n] -> if n is odd, |P| = |Q|, otherwise |P| = |Q| - 1
  //
  //  p = P₀x + P₁x³ + P₂x⁵ + ... + Pₖ*x²ᵏ⁺¹
  //  q =   1 + Q₁x² + Q₂x⁴ + ... + Qₖ*x²ᵏ

  const [P, Q] = sin_pade[17];
  let xpow = square1(x);

  if (P.length < Q.length) {
    let p = [x, 0] as TwoF64;
    let q = mul22(Q[1], xpow);

    for (let k = 1; k < P.length; k++) {
      p = add22(p, mul22(P[k], xpow = mul21(xpow, x)));
      q = add22(q, mul22(Q[k+1], xpow = mul21(xpow, x)));
    }

    return div22(p, add21(q, 1));
  }

  let q = mul22(Q[1], xpow);
  let p = mul22(P[1], xpow = mul21(xpow, x));

  for (let k = 2; k < P.length; k++) {
    q = add22(q, mul22(Q[k], xpow = mul21(xpow, x)));
    p = add22(p, mul22(P[k], xpow = mul21(xpow, x)));
  }

  return div22(add21(p, x), add21(q, 1));
}

/**
 * Compute the sine of `x` using Padé approximant. Accurate for `|x| < π/2`
 * (the relative error grows significantly as `x` moves away from that range).
 */
export function _sin2(x: TwoF64): TwoF64 {
  // Padé [n/n] -> if n is odd, |P| = |Q|, otherwise |P| = |Q| - 1
  //
  //  p = P₀x + P₁x³ + P₂x⁵ + ... + Pₖ*x²ᵏ⁺¹
  //  q =   1 + Q₁x² + Q₂x⁴ + ... + Qₖ*x²ᵏ

  const [P, Q] = sin_pade[17];
  let xpow = square2(x);

  if (P.length < Q.length) {
    let p = x;
    let q = mul22(Q[1], xpow);

    for (let k = 1; k < P.length; k++) {
      p = add22(p, mul22(P[k], xpow = mul22(xpow, x)));
      q = add22(q, mul22(Q[k+1], xpow = mul22(xpow, x)));
    }

    return div22(p, add21(q, 1));
  }

  let q = mul22(Q[1], xpow);
  let p = mul22(P[1], xpow = mul22(xpow, x));

  for (let k = 2; k < P.length; k++) {
    q = add22(q, mul22(Q[k], xpow = mul22(xpow, x)));
    p = add22(p, mul22(P[k], xpow = mul22(xpow, x)));
  }

  return div22(add22(p, x), add21(q, 1));
}

/**
 * Computes the cosine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function cos1(x: f64): TwoF64 {
  const xabs = Math.abs(x);
  let sign = 1;

  if (xabs <= PI_HALF[0]) {
    return _cos(xabs);
  }

  let r = rem2pi_1(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign = -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? _sin2(r) : _sin2(neg2(r));
  }

  return sign < 0 ? neg2(_cos(r)) : _cos(r);
}

/**
 * Computes the cosine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function cos2(x: TwoF64): TwoF64 {
  const xabs = abs2(x);
  let sign = 1;

  if (lt22(xabs, PI_HALF)) {
    return _cos(x);
  }

  let r = rem2pi_2(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign = -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? _sin2(r) : _sin2(neg2(r));
  }

  return sign < 0 ? neg2(_cos(r)) : _cos(r);
}

/**
 * Compute the cosine of `x` using Padé approximant. Accurate for `|x| < π/2`
 * (the relative error grows significantly as `x` moves away from that range).
 */
export function _cos(x: f64 | TwoF64): TwoF64 {
  const [P, Q] = cos_pade[16];
  const x2 = typeof x === 'number' ? square1(x) : square2(x);

  let p = mul22(P[1], x2)   // p = 1 + P₁x² + P₂x⁴ + ... + Pₖ*x²ᵏ
  let q = mul22(Q[1], x2);  // q = 1 + Q₁x² + Q₂x⁴ + ... + Qₖ*x²ᵏ

  for (let i = 2, xpow = x2; i < P.length; i++) {
    xpow = mul22(xpow, x2);
    p = add22(p, mul22(P[i], xpow));
    q = add22(q, mul22(Q[i], xpow));
  }

  return div22(add21(p, 1), add21(q, 1));
}

/**
 * Computes the tangent of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function tan1(x: f64): TwoF64 {
  let sign = Math.sign(x);
  const xabs = Math.abs(x);

  if (xabs <= PI_HALF[0]) {
    return _tan(x);
  }

  let r = rempi_1(xabs);

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    sign *= -1;
    return sign < 0 ? neg2(_cot(r)) : _cot(r);
  }

  return sign < 0 ? neg2(_tan(r)) : _tan(r);
}

/**
 * Computes the tangent of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function tan2(x: TwoF64): TwoF64 {
  let sign = Math.sign(x[0]);
  const xabs = abs2(x);

  if (lt22(xabs, PI_HALF)) {
    return _tan(x);
  }

  let r = rempi_2(xabs);

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    sign *= -1;
    return sign < 0 ? neg2(_cot(r)) : _cot(r);
  }

  return sign < 0 ? neg2(_tan(r)) : _tan(r);
}

/**
 * Return a partially evaluated Padé approximant of `tan(x)`, or `cot(x)` if
 * `co` is true, where `|x| < π/2`, as a rational `P/Q` represented as `[P, Q]`.
 */
function _tan_padé(x: f64 | TwoF64, co: boolean = false): [TwoF64, TwoF64] {
  const [P, Q] = tan_pade_int[18]; // (17, 18, 19)
  const [x2, pmulx] = typeof x === 'number'
    ? [square1(x), mul21 as ((x:TwoF64, y:f64 | TwoF64) => TwoF64)]
    : [square2(x), mul22 as ((x:TwoF64, y:f64 | TwoF64) => TwoF64)];

  let p = add22(mul22(x2, P[0]), P[1]);
  let q = add22(mul22(x2, Q[0]), Q[1]);

  const k = P.length - 1;
  let i = 2;
  for (i; i < k; i++) {
    p = add22(mul22(p, x2), P[i]);
    q = add22(mul22(q, x2), Q[i]);
  }

  p = pmulx(p, x);
  if (P.length === Q.length) {
    q = add22(mul22(q, x2), Q[i]);
  }

  return co ? [q, p] : [p, q];
}

/**
 * Compute the tangent of `x` using Padé approximant, where `|x| < π/2`.
 */
function _tan(x: f64 | TwoF64): TwoF64 {
  const [p, q] = _tan_padé(x);
  return div22(p, q);
}

/**
 * Compute the cotangent of `x` using Padé approximant, where `|x| < π/2`.
 */
function _cot(x: f64 | TwoF64): TwoF64 {
  const [p, q] = _tan_padé(x, true);
  return div22(p, q);
}
