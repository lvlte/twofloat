/**
 * @file Inverse Hyperbolic functions
 */

import { NaN2, type f64, type TwoF64 } from "../base/common.js";
import { add21, add22, div12, div22, mul21, mul22, sub12, sub21 } from "../arithmetic/index.js";
import { square_1, square_2 } from "./exp.js";
import { sqrt_2 } from "./roots.js";
import { ln_2 } from "./log.js";
import { abs2, neg2 } from "./sign.js";
import { asinh_pade } from "../pre/hyp-inv.js";
import { isFinite2, le21, lt21 } from "../base/compare.js";

/**
 * Computes the inverse hyperbolic sine of `x` using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function asinh_1(x: f64): TwoF64 {
  if (!Number.isFinite(x)) {
    return [x, x];
  }

  const xabs = Math.abs(x);
  if (xabs < 0.5) {
    const [p, q] = _asinh_padé_1(x);
    return div22(p, q);
  }

  // asinh(x) = sign(x) * ln(|x| + √(x² + 1))
  const x2p1 = add21(square_1(xabs), 1);
  const y = add21(sqrt_2(x2p1), xabs);
  const ln_y = ln_2(y);

  return x > 0 ? ln_y : neg2(ln_y);
}

/**
 * Computes the inverse hyperbolic sine of `x` using extended precision
 * arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function asinh_2(x: TwoF64): TwoF64 {
  if (!isFinite2(x)) {
    return [...x];
  }

  const xabs = abs2(x);
  if (lt21(xabs, 0.5)) {
    const [p, q] = _asinh_padé_2(x);
    return div22(p, q);
  }

  // asinh(x) = sign(x) * ln(|x| + √(x² + 1))
  const x2p1 = add21(square_2(xabs), 1);
  const y = add22(sqrt_2(x2p1), xabs);
  const ln_y = ln_2(y);

  return x[0] > 0 ? ln_y : neg2(ln_y);
}

/**
 * Return a Padé approximant of `asinh(x)`, where `|x| ≤ 1`, as a rational `p/q`
 * represented as `[p, q]`.
 * NB. Accurate for `|x| ≤ 0.5` (~31-33 digits precision), above this value the
 * relative error starts to grow significantly.
 */
function _asinh_padé_1(x: f64): [TwoF64, TwoF64] {
  const [P, Q] = asinh_pade[25];
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
 * @see _asinh_padé_1
 */
function _asinh_padé_2(x: TwoF64): [TwoF64, TwoF64] {
  const [P, Q] = asinh_pade[25];
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
 * Computes the inverse hyperbolic cosine of `x` using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number in the domain `[1, ∞]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[0, ∞]`
 */
export function acosh_1(x: f64): TwoF64 {
  if (!Number.isFinite(x)) {
    return [x, x];
  }

  if (x < 1) {
    return NaN2;
  }

  // acosh(x) = ln(x + √(x² - 1))
  const x2m1 = sub21(square_1(x), 1);
  const y = add21(sqrt_2(x2m1), x);

  return ln_2(y);
}

/**
 * Computes the inverse hyperbolic cosine of `x` using extended precision
 * arithmetic.
 *
 * @param {TwoF64} x A `TwoF64` number in the domain `[1, ∞]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number in the range `[0, ∞]`
 */
export function acosh_2(x: TwoF64): TwoF64 {
  if (!isFinite2(x)) {
    return [...x];
  }

  if (lt21(x, 1)) {
    return NaN2;
  }

  const x2m1 = sub21(square_2(x), 1);
  const y = add22(sqrt_2(x2m1), x);

  return ln_2(y);
}

/**
 * Computes the inverse hyperbolic tangent of `x` using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number in the domain `[-1, 1]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function atanh_1(x: f64): TwoF64 {
  const xabs = Math.abs(x);
  if (!(xabs <= 1)) {
    return NaN2;
  }

  // atanh(x) = asinh(x / √(1 - x²))
  const y = sqrt_2(sub12(1, square_1(x)));
  return asinh_2(div12(x, y));
}

/**
 * Computes the inverse hyperbolic tangent of `x` using extended precision
 * arithmetic.
 *
 * @param {TwoF64} x A `TwoF64` number in the domain `[-1, 1]`
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function atanh_2(x: TwoF64): TwoF64 {
  const xabs = abs2(x);
  if (!le21(xabs, 1)) {
    return NaN2;
  }

  // atanh(x) = asinh(x / √(1 - x²))
  const y = sqrt_2(sub12(1, square_2(x)));
  return asinh_2(div22(x, y));
}
