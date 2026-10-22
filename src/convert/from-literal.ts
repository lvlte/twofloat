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
import { twof64FromRational } from './from-rational.js';

/**
 * Return the literal (base 10) representation of `x` as a `TwoF64` number.
 *
 * @param x The input number
 * @returns The {@link TwoF64|`TwoF64`} representation of `"${x}"`
 */
export function fromLiteral(x: f64): TwoF64 {
  // https://github.com/lvlte/twofloat/issues/5
  // Parse `x` decimals as `n * 10^exp`, where n is an integer, then use the
  // best strategy to compute the output:
  // - for integer `x` not too big, and if `n` is safe: use twoProd EFT
  // - for other inputs:
  //  - use twof64FromRational from @lvlte/rationalize if supported (bigint)
  //  - or fall back with twofloat operations, splitting `n` if necessary

  if (!Number.isFinite(x)) {
    return Math.abs(x) === Infinity ? [x, 0] : NaN2;
  }

  const sign = Math.sign(x);
  x = Math.abs(x);

  if (Number.isInteger(x) && x <= Number.MAX_SAFE_INTEGER) {
    return [sign*x, 0];
  }

  const xstr = x.toExponential();
  const m = xstr.match(/([1-9])(?:\.(\d+))?e([+-]\d+)/)!;
  m[2] ??= '';

  const exp = +m[3] - m[2].length;
  const nstr = m[1] + m[2];
  const n = +nstr;

  if (exp >= 0 && exp < 23 && n <= Number.MAX_SAFE_INTEGER) {
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
      const nn = add21(mul11(+nstr.slice(0, -4), 1e4), +nstr.slice(-4));
      xx = exp < 0 ? div(nn, pow10) : mul(pow10, nn);
    }
  }

  return sign < 0 ? neg(xx) : xx;
}
