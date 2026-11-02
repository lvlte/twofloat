/// <reference lib='es2020.bigint'/>

/**
 * Construct TwoF64 numbers from literal float64
 *
 * @module twofloat/fromLiteral
 */

import { NaN2, type f64, type TwoF64 } from '../base/common.js';
import { add21 } from '../arithmetic/add.js';
import { div } from '../arithmetic/div.js';
import { mul, mul11 } from '../arithmetic/mul.js';
import { neg } from '../math/basic.js';
import { powint_1 } from '../math/exp-impl.js';
import { _fromRational, decimalRatio } from './from-rational.js';

/**
 * Largest Float64 integer whose literal (decimal) representation is guaranteed
 * to match its binary representation exactly.
 */
export const F64_MAX_INT_LITERAL = 18014398509481988;

/**
 * Absolute values less than this threshold cannot be extended/corrected by a
 * `lo` part (`ulp(x) = Number.MIN_VALUE` if `|x| < F64_HILO_THRESHOLD`).
 */
export const F64_HILO_THRESHOLD = 4.450147717014403e-308;

/**
 * Regex for matching the output of `x.toExponential()` where `x > 0`.
 */
const F64_TO_EXP_MATCHER = /([1-9])(?:\.(\d+))?e([+-]\d+)/;

/**
 * Return the literal representation of `x` (read as a decimal string) as a
 * {@link TwoF64|`TwoF64`} number.
 *
 * The result is the most accurate twice-precision representation of `"${x}"`:
 * when rounding occurs, the relative error is bounded at `u²` with `u = 2^-53`
 * for normal `x` (for subnormals the max absolute roundoff error is `2^-1075`).
 *
 * NB. If the runtime environment doesn't support `bigint`, the relative error
 * bound is estimated at `~16u^2`.
 *
 * @param x The input number. Must be a `f64` number literal.
 * @returns The {@link TwoF64|`TwoF64`} representation of `"${x}"`
 */
export function fromLiteral(x: f64): TwoF64 {
  if (!Number.isFinite(x)) {
    return Math.abs(x) === Infinity ? [x, 0] : NaN2;
  }

  const sign = Math.sign(x);
  x = Math.abs(x);

  if (x < F64_HILO_THRESHOLD || (Number.isInteger(x) && x <= F64_MAX_INT_LITERAL)) {
    return [sign*x, 0];
  }

  const xstr = x.toExponential();
  const m = F64_TO_EXP_MATCHER.exec(xstr)!;
  m[2] ||= '';

  const exp = +m[3] - m[2].length;
  const nstr = m[1] + m[2];
  const n = +nstr;

  if (exp >= 0 && exp < 23 && isSafeIntStr(n, nstr)) {
    return mul11(sign*n, 10**exp);
  }

  let xx: TwoF64;

  if (typeof BigInt === 'function') {
    xx = _fromRational(decimalRatio(nstr, exp));
  }
  else {
    const pow10 = tenpow(exp);
    if (isSafeIntStr(n, nstr)) {
      xx = exp < 0 ? div(n, pow10) : mul(pow10, n);
    }
    else {
      const nn = add21(mul11(+nstr.slice(0, -4), 1e4), +nstr.slice(-4));
      xx = exp < 0 ? div(nn, pow10) : mul(pow10, nn);
    }
  }

  return sign < 0 ? neg(xx) : xx;
}

/**
 * Checks whether `nstr`, coerced to number `n`, is a safe integer literal (safe
 * in this context means the decimal and the binary representations match).
 * Expects absolute values.
 */
export function isSafeIntStr(n: f64, nstr: string): boolean {
  return n <= Number.MAX_SAFE_INTEGER || (
    n <= F64_MAX_INT_LITERAL && n.toString() === nstr
  );
}

/**
 * Return 10^|n|
 */
export function tenpow(n: f64): f64 | TwoF64 {
  n = Math.abs(n);
  return n < 23 ? 10**n : powint_1(10, n);
}
