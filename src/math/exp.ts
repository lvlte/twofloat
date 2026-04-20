/**
 * @file Exponentiation functions
 */

import {
  type TwoF64,
  type f64,
  type i32,
  ONE2,
  NaN2
} from '../base/common.js';

import { twoSquare, normalize } from '../base/eft.js';
import { inv1, inv2 } from '../arithmetic/div.js';
import { mul11, mul21, mul22 } from '../arithmetic/mul.js';

export const square1 = twoSquare;

// based on DWTimesDW1
// `5u²` with `u = 2^-53`
export function square2([xhi, xlo]: TwoF64) {
  const [hi, lo] = square1(xhi);
  return normalize(hi, lo + (2*xhi*xlo));
}

export function cube1(x: f64) {
  let [hi, lo, e=0] = square1(x); // EFT (twoProd)
  // return mul21([hi, lo], x);   // 3u²/2 + 4u³
  [hi, e] = mul11(hi, x);         // EFT (twoProd)
  return normalize(hi, lo*x + e); // 2u²
}

export function cube2([xhi, xlo]: TwoF64) {
  return mul22(square2([xhi, xlo]), [xhi, xlo]);
}

/**
 * Integer power using compensated linear product (Horner scheme evaluation
 * applied to the polynomial `p(x) = x^n`)
 *
 * if `n < 2^25` then `f64([hi, lo])` is faithfully rounded.
 */
export function _linpow(x: f64, n: i32): TwoF64 {
  switch (n) {
    case 0:
      return ONE2;

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
      if (n !== (n | 0)) {
        return NaN2;
      }
  }

  const p = Math.abs(n);
  let [hi, lo] = cube1(x);
  let ei = 0;
  let i = 3;

  while (i++ < p) {
    [hi, ei] = mul11(hi, x);
    lo = lo*x + ei;
  }

  return n < 0 ? inv2([hi, lo]) : normalize(hi, lo);
}


/**
 * Integer power using compensated logarithmic product, based on successive
 * squarings (rtl binary exponentiation).
 *
 * result `f64([hi, lo])` is a faithful rounding of `x^n` as long as `n ≤ 2^49`
 *
 * faster than _linpow for (roughly) |n| > 30
 */
export function _logpow(x: f64, n: i32): TwoF64 {
  // assuming |n| is an integer > 1

  const p = Math.abs(n);
  let [u, v] = square1(x);
  let [h, l] = [p % 2 ? x : 1, 0];

  let i = Math.floor(p/2);

  while (i > 1) {
    if (i % 2) {
      [h, l] = mul22([h, l], [u, v]);
    }
    [u, v] = square2([u, v]);
    i = Math.floor(i/2);
  }

  [h, l] = mul22([h, l], [u, v]);

  return n < 0 ? inv2([h, l]) : [h, l];
}

// same as above but using ltr binary exponentiation
// (ltr allows using mul21 instead of mul22)
export function _logpowltr(x: f64, n: i32): TwoF64 {
  // assuming |n| is an int32 > 1

  const p = Math.abs(n);
  let bits = p.toString(2);
  let [h, l] = square1(x);
  let i = 1;

  if (+bits[i]) {
    [h, l] = mul21([h, l], x);
  }

  while (++i < bits.length) {
    [h, l] = square2([h, l]);
    if (+bits[i]) {
      [h, l] = mul21([h, l], x);
    }
  }

  return n < 0 ? inv2([h, l]) : [h, l];
}
