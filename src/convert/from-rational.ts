/// <reference lib='es2020.bigint'/>

/**
 * Construct TwoF64 numbers from rational
 * @see https://github.com/lvlte/rationalize
 *
 * @module twofloat/fromRational
 */

import { type f64, type TwoF64 } from '../base/common.js';

export type Rational = [num: bigint, den: bigint];

const FLOAT64_EMAX = 1023;

/**
 * Returns the dyadic rational representation of `x` (error-free transform).
 *
 * Assume `x` is a finite number.
 */
function dyadicRational(x: f64): Rational {
  const k = x.toString(2).split('.', 2)[1]?.length ?? 0;

  if (k > FLOAT64_EMAX) {
    // prevent spurious overflow
    const m = k - FLOAT64_EMAX;
    const p = BigInt(x * 2**FLOAT64_EMAX * 2**m);
    const q = BigInt(1) << BigInt(k);
    return [p, q];
  }

  const q = 2**k;
  const p = x*q;

  return [BigInt(p), BigInt(q)];
}

/**
 * Returns the closest IEEE 754 Float64 to the exact rational `p/q`, assuming
 * `q > 0`.
 */
function f64FromRational([p, q]: Rational): f64 {
  const zero = BigInt(0);
  if (p === zero) {
    return 0;
  }

  const one = BigInt(1);
  if (q === one) {
    return Number(p);
  }

  const pf = Number(p);
  const qf = Number(q);
  // @ts-expect-error - comparison is intentional
  if (pf == p && qf == q) { // eslint-disable-line eqeqeq
    return pf/qf;
  }

  let sign: number;
  [sign, p] = p < zero ? [-1, -p] : [1, p];

  // We want to scale p/q by 2^k so that (p * 2^k)/q is a 53-bit integer.
  const d = p.toString(2).length - q.toString(2).length; // TODO perf
  let k = Math.min(52 - d, 1074); // maximum subnormal shift limit

  let m: bigint; // mantissa
  let pp = p;
  let qq = q;

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  k >= 0 ? pp = p << BigInt(k) : qq = q << BigInt(-k);
  m = pp/qq;

  // Align the fraction to exactly 53 bits
  if (m < BigInt(0x10000000000000) && k < 1074) {
    k++;
    pp <<= one;
    m = pp/qq;
  }

  const r = pp % qq;

  // IEEE 754 rounding (tie to even)
  const twiceR = r * BigInt(2);
  if (twiceR > qq || (twiceR === qq && (m & one) === one)) {
    m++;
  }

  return sign * Number(m) * 2**-k;
}

/**
 * Returns the closest `TwoF64` number to the exact rational number `r`.
 *
 * Closest means the relative error is bounded at `u²`, with `u = 2^-53` (ie.
 * the result `x` is such that `|(x - r)/r| ≤ 2^-106`), except obviously when
 * `x` overflows to `±Infinity`, and for subnormals the max roundoff error is
 * `|x - r| < ulp(ulp(x))`).
 *
 * @param r a rational number represented as a tuple `[num: bigint, den: bigint]`
 * @returns a {@link TwoF64|`TwoF64`} number
 */
export function twof64FromRational(r: Rational): TwoF64;
export function twof64FromRational([p, q]: Rational): TwoF64 {
  if (typeof p !== 'bigint' || typeof q !== 'bigint') {
    throw new TypeError(
      'The given argument must be a bigint rational: [num: bigint, den: bigint]'
      + `(received [${typeof p}, ${typeof q}])`);
  }

  if (q < 0) {
    [p, q] = [-p, -q];
  }

  const hi = q > 0 ? f64FromRational([p, q]) : Infinity*(p < 0 ? -1 : 1);

  if (hi === 0 || Math.abs(hi) === Infinity) {
    return [hi, 0];
  }

  const [p_hi, q_hi] = dyadicRational(hi);

  const p_rem = p*q_hi - p_hi*q;
  const q_rem = q*q_hi;
  const lo = f64FromRational([p_rem, q_rem]);

  return [hi, lo];
}
