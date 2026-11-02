/// <reference lib='es2020.bigint'/>

import { NaN2, type TwoF64 } from '../base/common.js';

/**
 * Construct TwoF64 numbers from bigint
 *
 * @module twofloat/fromBigInt
 */

/**
 * Maximum absolute value before `twof64.fromBigInt` overflows:
 *
 * `const MAX_BIGINT_INPUT = (0xfffffffffffffcn << 968n) - 1n;`
 *
 * For comparison: `Number.MAX_VALUE == 0xfffffffffffff8n << 968n`
 */

/**
 * Converts a `bigint` number `x` to a {@linkcode TwoF64} number `[xhi, xlo]`.
 *
 * The result is guaranteed to be exact as long as the absolute value of `x`
 * doesn't exceed `162259276829213372398777265029120n` (2^107 + 2^53), otherwise
 * you can check `Number.isSafeInteger(xlo)`: if true, the result is exact. If
 * not, the maximum absolute error is `ulp(xlo)/2`. At worst, the relative error
 * is bounded at `2^-106` (except when `|x|` is greater than `Number.MAX_VALUE`,
 * in which case the result is very likely to overflow to `[±Infinity, 0]`).
 *
 * @param x The input number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x`
 */
export function fromBigInt(x: bigint): TwoF64 {
  const hi = Number(x);

  if (!Number.isFinite(hi)) {
    return Math.abs(hi) === Infinity ? [hi, 0] : NaN2;
  }

  const lo = Number(x - BigInt(hi));
  return [hi, lo];
}
