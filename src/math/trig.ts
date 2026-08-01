/**
 * @file Trigonometric functions
 */

import { type f64, type TwoF64 } from "../base/common.js";
import { add21, add22, div22, mul21, mul22, sub22 } from "../arithmetic/index.js";
import { ge22, lt22 } from "../base/compare.js";
import { sin_pade, cos_pade, tan_pade_int } from "../pre/trig.js";
import { PI } from "./constants.js";
import { square_1, square_2 } from "./exp.js";
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
export function sin_1(x: f64): TwoF64 {
  let sign = Math.sign(x);
  const xabs = Math.abs(x);

  if (xabs <= PI_HALF[0]) {
    return _sin_1(x);
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

  return sign < 0 ? _sin_2(neg2(r)) : _sin_2(r);
}

/**
 * Computes the sine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function sin_2(x: TwoF64): TwoF64 {
  let sign = Math.sign(x[0]);
  const xabs = abs2(x);

  if (lt22(xabs, PI_HALF)) {
    return _sin_2(x);
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

  return sign < 0 ? _sin_2(neg2(r)) : _sin_2(r);
}

/**
 * Compute the sine of `x` using Padé approximant. Accurate for `|x| < π/2`
 * (the relative error grows significantly as `x` moves away from that range).
 */
function _sin_1(x: f64): TwoF64 {
  const [p, q] = _sin_padé_1(x);
  return div22(p, q);
}

/**
 * Return a Padé approximant of `sin(x)`, where `|x| < π/2`, as a rational `p/q`
 * represented as `[p, q]`.
 */
function _sin_padé_1(x: f64): [TwoF64, TwoF64] {
  // Padé [n/n] -> if n is odd, |P| = |Q|, otherwise |P| = |Q| - 1
  //
  //  p = x + P₁x³ + P₂x⁵ + ... + Pₖ*x²ᵏ⁺¹ + ...
  //  q = 1 + Q₁x² + Q₂x⁴ + ... + Qₖ*x²ᵏ   + ...

  const [P, Q] = sin_pade[17];
  let xpow = square_1(x);

  if (P.length < Q.length) {
    let p = [x, 0] as TwoF64;
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
 * Compute the sine of `x` using Padé approximant. Accurate for `|x| < π/2`
 * (the relative error grows significantly as `x` moves away from that range).
 */
function _sin_2(x: TwoF64): TwoF64 {
  const [p, q] = _sin_padé_2(x);
  return div22(p, q);
}

/**
 * @see _sin_padé_1
 */
function _sin_padé_2(x: TwoF64): [TwoF64, TwoF64] {
  const [P, Q] = sin_pade[17];
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
 * Computes the cosine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function cos_1(x: f64): TwoF64 {
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
    return sign < 0 ? _sin_2(r) : _sin_2(neg2(r));
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
export function cos_2(x: TwoF64): TwoF64 {
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
    return sign < 0 ? _sin_2(r) : _sin_2(neg2(r));
  }

  return sign < 0 ? neg2(_cos(r)) : _cos(r);
}

/**
 * Compute the cosine of `x` using Padé approximant. Accurate for `|x| < π/2`
 * (the relative error grows significantly as `x` moves away from that range).
 */
function _cos(x: f64 | TwoF64): TwoF64 {
  const [p, q] = _cos_padé(x);
  return div22(p, q);
}

/**
 * Return a Padé approximant of `cos(x)`, where `|x| < π/2`, as a rational `p/q`
 * represented as `[p, q]`.
 */
function _cos_padé(x: f64 | TwoF64): [TwoF64, TwoF64] {
  const [P, Q] = cos_pade[16];
  const x2 = typeof x === 'number' ? square_1(x) : square_2(x);

  let p = mul22(P[1], x2)   // p = 1 + P₁x² + P₂x⁴ + ... + Pₖ*x²ᵏ
  let q = mul22(Q[1], x2);  // q = 1 + Q₁x² + Q₂x⁴ + ... + Qₖ*x²ᵏ

  for (let i = 2, xpow = x2; i < P.length; i++) {
    xpow = mul22(xpow, x2);
    p = add22(p, mul22(P[i], xpow));
    q = add22(q, mul22(Q[i], xpow));
  }

  return [add21(p, 1), add21(q, 1)];
}

/**
 * Computes the tangent of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function tan_1(x: f64): TwoF64 {
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
export function tan_2(x: TwoF64): TwoF64 {
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
 * Return a Padé approximant of `tan(x)`, where `|x| < π/2`, as a rational `p/q`
 * represented as `[p, q]`.
 */
function _tan_padé(x: f64 | TwoF64): [TwoF64, TwoF64] {
  const [P, Q] = tan_pade_int[18]; // (17, 18, 19)
  const [x2, pmulx] = typeof x === 'number'
    ? [square_1(x), mul21 as ((x:TwoF64, y:f64 | TwoF64) => TwoF64)]
    : [square_2(x), mul22 as ((x:TwoF64, y:f64 | TwoF64) => TwoF64)];

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

  return [p, q];
}

/**
 * Compute the tangent of `x` using Padé approximant, where `|x| < π/2`.
 */
function _tan(x: f64 | TwoF64): TwoF64 {
  const [p, q] = _tan_padé(x);
  return div22(p, q);
}

/**
 * Computes the cotangent of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function cot_1(x: f64): TwoF64 {
  let sign = Math.sign(x);
  const xabs = Math.abs(x);

  if (xabs <= PI_HALF[0]) {
    return _cot(x);
  }

  let r = rempi_1(xabs);

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    sign *= -1;
    return sign < 0 ? neg2(_tan(r)) : _tan(r);
  }

  return sign < 0 ? neg2(_cot(r)) : _cot(r);
}

/**
 * Computes the cotangent of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function cot_2(x: TwoF64): TwoF64 {
  let sign = Math.sign(x[0]);
  const xabs = abs2(x);

  if (lt22(xabs, PI_HALF)) {
    return _cot(x);
  }

  let r = rempi_2(xabs);

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    sign *= -1;
    return sign < 0 ? neg2(_tan(r)) : _tan(r);
  }

  return sign < 0 ? neg2(_cot(r)) : _cot(r);
}

/**
 * Compute the cotangent of `x` using Padé approximant, where `|x| < π/2`.
 */
function _cot(x: f64 | TwoF64): TwoF64 {
  const [p, q] = _tan_padé(x);
  return div22(q, p);
}

/**
 * Computes the secant of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function sec_1(x: f64): TwoF64 {
  const xabs = Math.abs(x);
  let sign = 1;

  if (xabs <= PI_HALF[0]) {
    return _sec(xabs);
  }

  let r = rem2pi_1(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign = -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? _csc_2(r) : neg2(_csc_2(r));
  }

  return sign < 0 ? neg2(_sec(r)) : _sec(r);
}

/**
 * Computes the secant of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function sec_2(x: TwoF64): TwoF64 {
  const xabs = abs2(x);
  let sign = 1;

  if (lt22(xabs, PI_HALF)) {
    return _sec(x);
  }

  let r = rem2pi_2(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign = -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? _csc_2(r) : neg2(_csc_2(r));
  }

  return sign < 0 ? neg2(_sec(r)) : _sec(r);
}

/**
 * Compute the secant of `x` using Padé approximant, where `|x| < π/2`.
 */
function _sec(x: f64 | TwoF64): TwoF64 {
  const [p, q] = _cos_padé(x);
  return div22(q, p);
}

/**
 * Computes the cosecant of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function csc_1(x: f64): TwoF64 {
  let sign = Math.sign(x);
  const xabs = Math.abs(x);

  if (xabs <= PI_HALF[0]) {
    return _csc_1(x);
  }

  let r = rem2pi_1(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign *= -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? neg2(_sec(r)) : _sec(r);
  }

  return sign < 0 ? neg2(_csc_2(r)) : _csc_2(r);
}

/**
 * Computes the cosecant of `x`, where `x` is expressed in radians, using
 * extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function csc_2(x: TwoF64): TwoF64 {
  let sign = Math.sign(x[0]);
  const xabs = abs2(x);

  if (lt22(xabs, PI_HALF)) {
    return _csc_2(x);
  }

  let r = rem2pi_2(xabs);

  if (ge22(r, PI)) {
    r = sub22(r, PI);
    sign *= -1;
  }

  if (ge22(r, PI_HALF)) {
    r = sub22(r, PI_HALF);
    return sign < 0 ? neg2(_sec(r)) : _sec(r);
  }

  return sign < 0 ? neg2(_csc_2(r)) : _csc_2(r);
}

/**
 * Compute the cosecant of `x` using Padé approximant, where `|x| < π/2`.
 */
function _csc_1(x: f64): TwoF64 {
  const [p, q] = _sin_padé_1(x);
  return div22(q, p);
}

/**
 * Compute the cosecant of `x` using Padé approximant, where `|x| < π/2`.
 */
function _csc_2(x: TwoF64): TwoF64 {
  const [p, q] = _sin_padé_2(x);
  return div22(q, p);
}

/**
 * Compute the sine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns A {@link TwoF64|`TwoF64`} number in the range `[-1, 1]`
 */
export function sin(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? sin_1(x) : sin_2(x);
}

/**
 * Compute the cosine of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns A {@link TwoF64|`TwoF64`} number in the range `[-1, 1]`
 */
export function cos(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? cos_1(x) : cos_2(x);
}

/**
 * Compute the tangent of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function tan(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? tan_1(x) : tan_2(x);
}

/**
 * Compute the cotangent of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns A {@link TwoF64|`TwoF64`} number
 */
export function cot(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? cot_1(x) : cot_2(x);
}

/**
 * Compute the secant of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns A {@link TwoF64|`TwoF64`} number in the range `(-∞, -1] ∪ [1, ∞)`
 */
export function sec(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? sec_1(x) : sec_2(x);
}

/**
 * Compute the cosecant of `x`, where `x` is expressed in radians, using extended
 * precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns A {@link TwoF64|`TwoF64`} number in the range `(-∞, -1] ∪ [1, ∞)`
 */
export function csc(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? csc_1(x) : csc_2(x);
}
