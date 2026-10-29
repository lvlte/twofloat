/// <reference lib='es2020.bigint'/>

/**
 * Construct TwoF64 numbers from decimal string
 *
 * @module twofloat/fromString
 */

import { NaN2, type f64, type TwoF64 } from '../base/common.js';
import { add, add21, add22 } from '../arithmetic/add.js';
import { div } from '../arithmetic/div.js';
import { mul, mul11 } from '../arithmetic/mul.js';
import { neg } from '../math/basic.js';
import { powint_1 } from '../math/exp-impl.js';
import { twof64FromRational } from './from-rational.js';

/**
 * Largest Float64 integer whose literal (decimal) representation is guaranteed
 * to match its binary representation exactly.
 */
const F64_MAX_INT_LITERAL = 18014398509481988;

/**
 * Absolute values less than this threshold cannot be extended/corrected by a
 * `lo` part (`ulp(x) = Number.MIN_VALUE` if `|x| < F64_HILO_THRESHOLD`).
 */
const F64_HILO_THRESHOLD = 4.450147717014403e-308;

/**
 * Regex for matching a decimal string.
 */
const DEC_STR_MATCHER = /^([+-])?(\d*)(?:\.(\d+))?(?:e([+-]?\d+))?$/i;

/**
 * Match leading zeroes
 */
const LZERO_MATCHER = /^0+/;

/**
 * Match trailing zeroes
 */
const TZERO_MATCHER = /0+$/; // eslint-disable-line regexp/no-super-linear-move

/**
 * Converts a decimal string `str` into a {@link TwoF64|`TwoF64`} number.
 *
 * The result `x` is the most accurate twice-precision representation of `str`:
 * when rounding occurs, the relative error is bounded at `u²` with `u = 2^-53`
 * except when `x` overflows to `±Infinity` or when `x` lies in the subnormal
 * range (in the latter case, the maximum absolute roundoff error is `2^-1075`).
 *
 * NB. If the runtime environment doesn't support `bigint`, the relative error
 * bound is estimated at `~16u^2`.
 *
 * @param str the input string
 * @returns a {@link TwoF64|`TwoF64`} number
 */
export function fromString(str: string): TwoF64 {
  const s = Number(str);
  if (!Number.isFinite(s)) {
    return Math.abs(s) === Infinity ? [s, 0] : NaN2;
  }

  if (Math.abs(s) < F64_HILO_THRESHOLD) {
    return [s, 0];
  }

  const m = str.trim().match(DEC_STR_MATCHER);
  if (!m) {
    return NaN2;
  }

  m[2] ??= '';
  m[3] ??= '';
  m[4] ??= '0';

  const sign = m[1] === '-' ? -1 : 1;
  let exp = +m[4] - m[3].length;
  let nstr = (m[2] + m[3]).replace(LZERO_MATCHER, '');

  if (nstr.endsWith('0')) {
    const len = nstr.length;
    nstr = nstr.replace(TZERO_MATCHER, '');
    exp += len - nstr.length;
  }

  const n = +nstr;

  if (exp >= 0 && exp < 23 && isSafeIntStr(n, nstr)) {
    return mul11(sign*n, 10**exp);
  }

  let xx: TwoF64;

  if (typeof BigInt === 'function') {
    const bign = BigInt(nstr);
    const pow10 = BigInt(10)**BigInt(Math.abs(exp));
    const r: [bigint, bigint] = exp < 0 ? [bign, pow10] : [bign * pow10, BigInt(1)];
    xx = twof64FromRational(r);
  }
  else if (isSafeIntStr(n, nstr)) {
    const pow10 = tenpow(exp);
    xx = exp < 0 ? div(n, pow10) : mul(pow10, n);
  }
  else {
    xx = twoFromIntStr(nstr, exp);
  }

  return sign < 0 ? neg(xx) : xx;
}

/**
 * Checks whether `nstr`, coerced to number `n`, is a safe integer literal (safe
 * in this context means the decimal and the binary representations match).
 * Expects absolute values.
 */
function isSafeIntStr(n: f64, nstr: string): boolean {
  return n <= Number.MAX_SAFE_INTEGER || (
    n <= F64_MAX_INT_LITERAL && n.toString() === nstr
  );
}

/**
 * Return 10^|n|
 */
function tenpow(n: f64): f64 | TwoF64 {
  n = Math.abs(n);
  return n < 23 ? 10**n : powint_1(10, n);
}

/**
 * Decimal string to `TwoF64` conversion (no bigint fallback).
 *
 * Returns `n`, an integer represented by the decimal string `nstr`, multiplied
 * by `10^exp`, as a `TwoF64` number. Assume `nstr` is unsigned with no trailing
 * zeroes.
 */
function twoFromIntStr(nstr: string, exp: f64): TwoF64 {
  const len = nstr.length;
  const pow10 = tenpow(exp);
  let n: TwoF64;

  // split in 15-digits chunks (safe int)
  if (nstr.length <= 30) {
    n = add21(mul11(+nstr.slice(0, 15), 10**(len - 15)), +nstr.slice(15));
  }
  else {
    const n1 = mul(+nstr.slice(0, 15), tenpow(len - 15));
    const n2 = mul(+nstr.slice(15, 30), tenpow(len - 30));
    const n3 = nstr.length > 45 ? fromString(nstr.slice(30)) : +nstr.slice(30);
    n = add22(add(n3, n2), n1);
  }

  return exp < 0 ? div(n, pow10) : mul(pow10, n);
}
