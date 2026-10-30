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
import { _twof64FromRational, decimalRatio } from './from-rational.js';
import { F64_HILO_THRESHOLD, isSafeIntStr, tenpow } from './from-literal.js';

/**
 * Regex for matching a decimal string.
 */
const DEC_STR_MATCHER = /^([+-])?(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i;

/**
 * Match leading zeroes
 */
const L_ZERO_MATCHER = /^0+/;

/**
 * Match trailing zeroes
 */
const T_ZERO_MATCHER = /0+$/; // eslint-disable-line regexp/no-super-linear-move

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

  const m = DEC_STR_MATCHER.exec(str.trim());
  if (!m) {
    return NaN2;
  }

  m[2] ||= '';
  m[3] ||= '';
  m[4] ||= '0';

  const sign = m[1] === '-' ? -1 : 1;
  const [nstr, exp] = stripZeros(m[2] + m[3], +m[4] - m[3].length);
  const n = +nstr;

  if (exp >= 0 && exp < 23 && isSafeIntStr(n, nstr)) {
    return mul11(sign*n, 10**exp);
  }

  let xx: TwoF64;

  if (typeof BigInt === 'function') {
    xx = _twof64FromRational(decimalRatio(nstr, exp));
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
 * Decimal string to `TwoF64` conversion (no bigint fallback).
 *
 * Returns `n`, an integer represented by the decimal string `nstr`, multiplied
 * by `10^exp`, as a `TwoF64` number. Assume `nstr` is unsigned with no leading
 * or trailing zeroes.
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

/**
 * Strip leading and trailing zeroes from `s` and shift `exp` accordingly.
 * Assume `s` is unsigned.
 */
function stripZeros(s: string, exp: f64): [string, f64] {
  if (s.endsWith('0')) {
    const len = s.length;
    s = s.replace(T_ZERO_MATCHER, '');
    exp += len - s.length;
  }

  return [s.startsWith('0') ? s.replace(L_ZERO_MATCHER, '') : s, exp];
}
