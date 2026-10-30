/// <reference lib='es2020.bigint'/>

/**
 * Construct TwoF64 numbers from rational
 * @see https://github.com/lvlte/rationalize
 *
 * @module twofloat/fromRational
 */

import { type f64, type TwoF64 } from '../base/common.js';

export type Rational = [num: bigint, den: bigint];

// Reusable 64-bit buffer / typed array (avoid allocations)
const BUF = new ArrayBuffer(8);
const F64_VIEW = new Float64Array(BUF);
const U64_VIEW = typeof BigUint64Array === 'function'
  ? new BigUint64Array(BUF)
  : [] as unknown as BigUint64Array;

/**
 * Returns the dyadic rational representation of `x` (error-free transform).
 *
 * Assume `x` is a finite number.
 */
export function dyadicRational(x: f64): Rational {
  const one = BigInt(1);
  if (Number.isInteger(x)) {
    return [BigInt(x), one];
  }

  F64_VIEW[0] = x;
  const bits = U64_VIEW[0];

  let m = bits & BigInt(0xFFFFFFFFFFFFF);               // raw mantissa
  let e = Number((bits >> BigInt(52)) & BigInt(0x7FF)); // raw exponent

  // normalized mantissa / unbiased exponent
  if (e === 0) {
    // subnormal
    e = -1074;
  }
  else {
    // normal (implicit leading 1)
    m |= BigInt(0x10000000000000);
    e -= 1075;
  }

  // Strip trailing zeroes to obttain an irreducible fraction
  const tz = ctz64(m);
  if (tz > 0) {
    m >>= BigInt(tz);
    e += tz;
  }

  // x is not an integer so we know the exponent is negative
  return [BigInt(Math.sign(x)) * m, one << BigInt(-e)];
}

/**
 * Count the number of trailing zero bits in the binary representation of `x`.
 *
 * Assume `x` is a non-zero 64-bit integer.
 */
function ctz64(x: bigint): number {
  let tz = 0;

  // Extract the lowest 32 bits as a signed int32
  let x32 = Number(x & BigInt(0xFFFFFFFF)) | 0;

  if (x32 === 0) {
    // empty, check the upper 32 bits
    tz = 32;
    x32 = Number(x >> BigInt(32)) | 0;
  }

  // Count lz of the two's complement to deduce the number of tz
  tz += 31 - Math.clz32(x32 & -x32);

  return tz;
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
  // const d = p.toString(2).length - q.toString(2).length; // TODO perf
  const d = bitlen(p) - bitlen(q);
  let k = Math.min(52 - d, 1074); // maximum subnormal shift limit

  let m: bigint; // mantissa
  let pp = p;
  let qq = q;

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  k >= 0 ? (pp = p << BigInt(k)) : (qq = q << BigInt(-k));
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
 * Converts a rational number `r` into a {@link TwoF64|`TwoF64`} number.
 *
 * The result `x` is the most accurate twice-precision representation of `r`:
 * when rounding occurs, the relative error is bounded at `u²` with `u = 2^-53`,
 * except when `x` overflows to `±Infinity` or when `x` lies in the subnormal
 * range (in the latter case, the maximum absolute roundoff error is `2^-1075`).
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

  // @ts-expect-error - intentional (avoid bigint literal)
  // eslint-disable-next-line eqeqeq
  return q == 0 ? [Infinity*(p < 0 ? -1 : 1), 0] : _twof64FromRational([p, q]);
}

/**
 * twof64FromRational no-check (assume q > 0)
 */
export function _twof64FromRational([p, q]: Rational): TwoF64 {
  const hi = f64FromRational([p, q]);

  if (hi === 0 || Math.abs(hi) === Infinity) {
    return [hi, 0];
  }

  const [p_hi, q_hi] = dyadicRational(hi);

  p = p*q_hi - p_hi*q;
  q *= q_hi;
  const lo = f64FromRational([p, q]);

  return [hi, lo];
}

/**
 * Construct a rational from an integer string and a base-10 exponent (output
 * fraction is not reduced).
 */
export function decimalRatio(nstr: string, exp: number): Rational {
  const bign = BigInt(nstr);
  const pow10 = BigInt(10)**BigInt(Math.abs(exp));
  return exp < 0 ? [bign, pow10] : [bign*pow10, BigInt(1)];
}

// Bit lengths of hex digits 0x0 through 0xf
const HEX_BIT_LENGTHS = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4];

/**
 * Assume x > 0
 */
function bitlen(x: bigint) {
  const hex = x.toString(16);
  const firstDigitBits = HEX_BIT_LENGTHS[Number(`0x${hex[0]}`)];
  return (hex.length - 1) * 4 + firstDigitBits;
}
