/// <reference lib='es2020.bigint'/>

/**
 * Construct TwoF64 numbers from decimal string
 *
 * @module twofloat/fromString
 */

import { NaN2, type TwoF64 } from '../base/common.js';
import { add21, add22 } from '../arithmetic/add.js';
import { div } from '../arithmetic/div.js';
import { mul, mul11 } from '../arithmetic/mul.js';
import { neg } from '../math/basic.js';
import { powint_1 } from '../math/exp-impl.js';
import { _decimalRatio, twof64FromRational } from './from-rational.js';

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

  m[2] = m[2]?.replace(LZERO_MATCHER, '') ?? '';
  m[3] = m[3]?.replace(TZERO_MATCHER, '') ?? '';

  const sign = (m[1] ?? '+') === '+' ? 1 : -1;
  const exp = +(m[4] ?? '0') - m[3].length;

  const nstr = m[2] + m[3];
  const n = +nstr;

  if (exp >= 0 && exp < 23 && (
    n <= Number.MAX_SAFE_INTEGER || (n <= F64_MAX_INT_LITERAL && n.toString() === nstr))
  ) {
    return mul11(sign*n, 10**exp);
  }

  let xx: TwoF64;

  if (typeof BigInt === 'function') {
    const bign = BigInt(nstr);
    const pow10 = BigInt(10)**BigInt(Math.abs(exp));
    const r: [bigint, bigint] = exp < 0 ? [bign, pow10] : [bign * pow10, BigInt(1)];
    xx = twof64FromRational(r);
  }
  else {
    const absexp = Math.abs(exp);
    const pow10 = absexp < 23 ? 10**absexp : powint_1(10, absexp);
    if (n <= Number.MAX_SAFE_INTEGER) {
      xx = exp < 0 ? div(n, pow10) : mul(pow10, n);
    }
    else {
      // todo: strip nstr trailing zeroes
      const nn = twoFromIntStr(nstr);
      xx = exp < 0 ? div(nn, pow10) : mul(pow10, nn);
    }
  }

  return sign < 0 ? neg(xx) : xx;
}

function twoFromIntStr(nstr: string): TwoF64 {
  const len = nstr.length;
  if (nstr.length <= 30) {
    return add21(mul11(+nstr.slice(0, 15), 10**(len - 15)), +nstr.slice(15));
  }

  const n1 = mul11(+nstr.slice(0, 15), 10**(len - 15));
  const n2 = mul11(+nstr.slice(15, 30), 10**(len - 30));
  const lo = +nstr.slice(30);

  return add21(add22(n1, n2), lo);
}
