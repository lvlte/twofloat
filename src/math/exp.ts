/**
 * @file Exponentiation functions
 */

import {
  type TwoF64,
  type f64,
  type int,
  ONE,
  NaN2,
  ZERO
} from '../base/common.js';

import { twoSquare, normalize, fast2Diff, fast2Sum } from '../base/eft.js';
import { add21, sub12, sub21, mul11, mul21, mul22, div22, inv1, inv2, add22 } from '../arithmetic/index.js';
import { exp_n, exp_nmax, exp_pade_int, expm1_pade_int } from '../pre/exp.js';
import { INF } from './constants.js';
import { isFinite2, isSafeInteger2, isZero } from '../base/compare.js';
import { ln1, ln2 } from './log.js';

/**
 * Computes `x²` using extended precision arithmetic.
 *
 * Error-free transform.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export const square1 = twoSquare;

/**
 * Computes `(xₕᵢ + xₗₒ)²` using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 *
 * Relative error bound: `5u²`.
 */
export function square2(x: TwoF64): TwoF64;
export function square2([xhi, xlo]: TwoF64): TwoF64 {
  const [hi, lo] = square1(xhi);
  return normalize(hi, lo + (2*xhi*xlo));
}

/**
 * Computes `x³` using extended precision arithmetic.
 *
 * Relative error bound: `3u²/2 + 4u³`.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function cube1(x: f64): TwoF64 {
  return mul21(square1(x), x);
}

/**
 * Computes `(xₕᵢ + xₗₒ)³` using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 *
 * Relative error bound: `10u² + 25u⁴`.
 */
export function cube2(x: TwoF64): TwoF64 {
  return mul22(square2(x), x);
}

/**
 * Integer power of `x` - Computes `xⁿ` using extended precision arithmetic.
 * `n` must be an integer.
 *
 * Error bound:
 *  - for `|n| ≤ 3`, see {@link square1 | `square1`}, {@link cube1 | `cube1`}.
 *  - for positive `n`, the result `[hi, lo]` is such that `f64([hi, lo])` is a
 * faithful rounding of `xⁿ` as long as `n ≤ 2⁴⁹`.
 *
 * @param {f64} x `f64` number (base)
 * @param {int} n `int` number (integer exponent)
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function pow1int(x: f64, n: int): TwoF64 {
  switch (n) {
    case 0:
      return ONE;

    case 1:
      return [x, 0*x];

    case 2:
      return square1(x);

    case 3:
      return cube1(x);

    case -1:
      return inv1(x);

    case -2:
      return inv2(square1(x));

    case -3:
      return inv2(cube1(x));

    default:
      if (!Number.isSafeInteger(n)) {
        return NaN2; // or throw ?
      }
  }

  const p = Math.abs(n);
  const xn = p > 31 ? _logpowltr(x, p) : _linpow(x, p);

  return n < 0 ? inv2(xn) : xn;
}

/**
 * Integer power using compensated linear product (Horner scheme applied to the
 * polynomial `p(x) = xⁿ`).
 *
 * **Assumes `n` is a {@link int | safe integer} such that `n ≥ 3`.**
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is a faithful rounding
 * of `xⁿ` as long as `n < 2^25`.
 */
export function _linpow(x: f64, n: int): TwoF64 {
  let [hi, lo] = cube1(x);
  let ei = 0;
  let i = 3;

  while (i++ < n) {
    [hi, ei] = mul11(hi, x);
    lo = lo*x + ei;
  }

  return normalize(hi, lo);
}

/**
 * Integer power using compensated logarithmic product, based on successive
 * squarings (RTL binary exponentiation).
 * Faster than {@link _linpow | `_linpow(x,n)`} for (roughly) `n > 30`.
 *
 * **Assumes `n` is a {@link int | safe integer} such that `n ≥ 3`.**
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is a faithful rounding
 * of `xⁿ` as long as `n ≤ 2^49`.
 */
export function _logpow(x: f64, n: int): TwoF64 {
  let sn: TwoF64 = square1(x);
  let xn: TwoF64 = [n % 2 ? x : 1, 0];
  let i = Math.floor(n/2);

  while (i > 1) {
    if (i % 2) {
      xn = mul22(xn, sn);
    }
    sn = square2(sn);
    i = Math.floor(i/2);
  }

  return mul22(xn, sn);
}

/**
 * Integer power using compensated logarithmic product, based on successive
 * squarings (LTR binary exponentiation).
 * Faster than {@link _linpow | `_linpow(x,n)`} for (roughly) `n > 30`.
 *
 * **Assumes `n` is an integer (supports unsafe int) such that `n ≥ 2`.**
 *
 * The result `[hi, lo]` is such that `f64([hi, lo])` is a faithful rounding
 * of `xⁿ` as long as `n ≤ 2^49`.
 */
export function _logpowltr(x: f64, n: int): TwoF64 {
  let bits = n.toString(2);
  let xn = square1(x);
  let i = 1;

  if (+bits[i]) {
    xn = mul21(xn, x);
  }

  while (++i < bits.length) {
    xn = square2(xn);
    if (+bits[i]) {
      xn = mul21(xn, x);
    }
  }

  return xn;
}

/**
 * Integer power of `x` - Computes `(xₕᵢ + xₗₒ)ⁿ` using extended precision
 * arithmetic. `n` must be an integer.
 *
 * @param {TwoF64} x `TwoF64` number (base)
 * @param {int} n `int` number (integer exponent)
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function pow2int(x: TwoF64, n: int): TwoF64 {
  switch (n) {
    case 0:
      return ONE;

    case 1:
      return x;

    case 2:
      return square2(x);

    case 3:
      return cube2(x);

    case -1:
      return inv2(x);

    case -2:
      return inv2(square2(x));

    case -3:
      return inv2(cube2(x));

    default:
      if (!Number.isSafeInteger(n)) {
        return NaN2;
      }
  }

  const p = Math.abs(n);
  const xn = p > 31 ? _logpow2(x, p) : _linpow2(x, p);

  return n < 0 ? inv2(xn) : xn;
}

/**
 * Integer power using linear product.
 *
 * **Assumes `n` is a {@link int | safe integer} such that `n ≥ 3`.**
 */
export function _linpow2(x: TwoF64, n: int): TwoF64 {
  let r = cube2(x);
  let i = 3;

  while (i++ < n) {
    r = mul22(r, x);
  }

  return r;
}

/**
 * Integer power using compensated logarithmic product, based on successive
 * squarings (RTL binary exponentiation).
 * Faster than {@link _linpow2 | `_linpow2(x,n)`} for (roughly) `n > 30`.
 *
 * **Assumes `n` is a {@link int | safe integer} such that `n ≥ 3`.**
 */
export function _logpow2(x: TwoF64, n: int): TwoF64 {
  let sn = square2(x);
  let xn = n % 2 ? x : ONE;
  let i = Math.floor(n/2);

  while (i > 1) {
    if (i % 2) {
      xn = mul22(xn, sn);
    }
    sn = square2(sn);
    i = Math.floor(i/2);
  }

  return mul22(xn, sn);
}

/**
 * Computes `xᵖ` using extended precision arithmetic.
 *
 * @param {f64} x `f64` number (base)
 * @param {f64} p `f64` number (exponent)
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function pow11(x: f64, p: f64): TwoF64 {
  if (Number.isSafeInteger(p)) {
    return pow1int(x, p);
  }
  return exp2(mul21(ln1(x), p));
}

/**
 * Computes `xᵖ` using extended precision arithmetic.
 *
 * @param {f64} x `f64` number (base)
 * @param {TwoF64} p `TwoF64` number (exponent)
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function pow12(x: f64, p: TwoF64): TwoF64 {
  if (isSafeInteger2(p)) {
    return pow1int(x, p[0]);
  }
  return exp2(mul22(ln1(x), p));
}

/**
 * Computes `xᵖ` using extended precision arithmetic.
 *
 * @param {TwoF64} x `TwoF64` number (base)
 * @param {f64} p `f64` number (exponent)
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function pow21(x: TwoF64, p: f64): TwoF64 {
  if (Number.isSafeInteger(p)) {
    return pow2int(x, p);
  }
  return exp2(mul21(ln2(x), p));
}

/**
 * Computes `xᵖ` using extended precision arithmetic.
 *
 * @param {TwoF64} x `TwoF64` number (base)
 * @param {TwoF64} p `TwoF64` number (exponent)
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function pow22(x: TwoF64, p: TwoF64): TwoF64 {
  if (isSafeInteger2(p)) {
    return pow2int(x, p[0]);
  }
  return exp2(mul22(ln2(x), p));
}

/**
 * Compute `e^x`, the natural base exponential of `x`, using extended precision
 * arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function exp1(x: f64): TwoF64 {
  if (Number.isInteger(x)) {
    return _exp1i(x);
  }

  if (Math.abs(x) < 1) {
    return _exp1f(x);
  }

  if (!Number.isFinite(x)) {
    return x < 0 ? ZERO : x > 0 ? INF : NaN2;
  }

  const e_xi = _exp1i(Math.trunc(x));
  const e_xf = _exp1f(x % 1);

  return mul22(e_xi, e_xf);
}

/**
 * Compute `eˣ`, assuming `x` is an integer.
 */
function _exp1i(x: int): TwoF64 {
  if (exp_n.has(x))  {
    return exp_n.get(x) as TwoF64;
  }

  if (x > 709) {
    return INF;
  }

  if (x < -745) {
    return ZERO;
  }

  const m = Math.sign(x) * exp_nmax;
  const [a, r] = divrem(x, m);
  const e_xi = pow2int(exp_n.get(m) as TwoF64, a);

  return r !== 0 ? mul22(e_xi, exp_n.get(r) as TwoF64) : e_xi;
}

/**
 * Compute `eˣ` using Padé approximant (meant to be used for `-1 < x < 1`, ie.
 * the relative error grows significantly as `x` moves away from that range).
 */
function _exp1f(x: f64): TwoF64 {
  const coeff = exp_pade_int[15];

  let p = fast2Sum(coeff[1], x);
  let q = fast2Diff(coeff[1], x);
  for (let i = 2, s = -1; i < coeff.length; i++, s*=-1) {
    p = add21(mul21(p, x), coeff[i]);
    q = add21(mul21(q, x), coeff[i] * s);
  }

  return div22(p, q);
}

function divrem(x: f64, y: f64): [int, f64] {
  const r = x % y;
  const q = Math.round(x/y - r/y);
  return [q, r];
}

/**
 * Computes `e^(xₕᵢ + xₗₒ)` using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function exp2([xhi, xlo]: TwoF64): TwoF64 {
  if (Number.isInteger(xhi)) {
    const e_xhi = _exp1i(xhi);
    if (xlo === 0 || !isFinite2(e_xhi) || isZero(e_xhi)) {
      return e_xhi;
    }
    return mul22(e_xhi, _exp1f(xlo));
  }

  const xf64 = xhi + xlo;
  if (!Number.isFinite(xf64)) {
    return xf64 < 0 ? ZERO : xf64 > 0 ? INF : NaN2;
  }

  // If xlo is an integer, then |xhi| ≥ 2^53 so the result will be the same (0
  // or inf) whether or not we consider xlo in the integer part, so we don't.
  const xi = Math.trunc(xhi);
  if (xi === 0) {
    return _exp2f([xhi, xlo]);
  }

  const e_xi = _exp1i(xi);
  if (!isFinite2(e_xi) || isZero(e_xi)) {
    return e_xi;
  }

  // xhi - xi is exact and |xhi - xi| > xlo
  const xf = normalize(xhi - xi, xlo);
  const e_xf = _exp2f(xf);

  return mul22(e_xi, e_xf);
}

/**
 * Compute `eˣ` using Padé approximant (meant to be used for `-1 < x < 1`, ie.
 * the relative error grows significantly as `x` moves away from that range).
 */
function _exp2f(x: TwoF64): TwoF64 {
  const coeff = exp_pade_int[15];

  let p = add21(x, coeff[1]);
  let q = sub12(coeff[1], x);
  for (let i = 2, s = -1; i < coeff.length; i++, s*=-1) {
    p = add21(mul22(p, x), coeff[i]);
    q = add21(mul22(q, x), coeff[i] * s);
  }

  return div22(p, q);
}

/**
 * Compute `eˣ - 1`, the natural base exponential of `x` subtracted by `1`,
 * using extended precision arithmetic.
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function expm1_1(x: f64): TwoF64 {
  if (Math.abs(x) < Math.LN2) {
    return x === 0 ? ZERO : _expm1_1f(x);
  }

  return sub21(exp1(x), 1);
}

/**
 * Compute `eˣ - 1` using Padé approximant (meant to be used for `x` close to 0)
 */
function _expm1_1f(x: f64): TwoF64 {
  const [P, Q] = expm1_pade_int[16];
  const x2 = square1(x);

  let k = 1; // 0 for odd n/n, 1 otherwise
  let p = add22(mul22(x2, P[k]), P[k+=2]);
  for (k+=2; k < P.length; k+=2) {
    p = add22(mul22(p, x2), P[k]);
  }

  let q = add21(Q[1], x);
  for (let i = 2; i < Q.length; i++) {
    q = add22(mul21(q, x), Q[i]);
  }

  return div22(mul21(p, x), q);
}

/**
 * Compute `eˣ - 1`, the natural base exponential of `x` subtracted by `1`,
 * using extended precision arithmetic.
 *
 * Expects and returns a {@link TwoF64|`TwoF64`} number (a tuple `[hi, lo]` in
 * its canonical form).
 */
export function expm1_2(x: TwoF64): TwoF64{
  if (Math.abs(x[0]) < Math.LN2) {
    return x[0] === 0 ? ZERO : _expm1_2f(x);
  }

  return sub21(exp2(x), 1);
}

/**
 * Compute `eˣ - 1` using Padé approximant (meant to be used for `x` close to 0)
 */
function _expm1_2f(x: TwoF64): TwoF64 {
  const [P, Q] = expm1_pade_int[16];
  const x2 = square2(x);

  let k = 1; // 0 for odd n/n, 1 otherwise
  let p = add22(mul22(x2, P[k]), P[k+=2]);
  for (k+=2; k < P.length; k+=2) {
    p = add22(mul22(p, x2), P[k]);
  }

  let q = add22(Q[1], x);
  for (let i = 2; i < Q.length; i++) {
    q = add22(mul22(q, x), Q[i]);
  }

  return div22(mul22(p, x), q);
}
