/**
 * TwoF64 construction from different number reprentations.
 *
 * @module twofloat/twof64
 */

import { NaN2, type f64, type TwoF64 } from '../base/common.js';
import { fromBigInt } from './from-bigint.js';
import { fromLiteral } from './from-literal.js';
import { fromRational, type Rational } from './from-rational.js';
import { fromString } from './from-string.js';

export interface TwoF64Ctor {
  /**
   * Return the literal representation of `x` (read as a decimal string) as a
   * {@linkcode TwoF64} number.
   *
   * @see {@linkcode twof64.fromLiteral}
   */
  (x: f64): TwoF64;

  /**
   * Converts a decimal string to a {@linkcode TwoF64} number.
   *
   * @see {@linkcode twof64.fromString}
   */
  (str: string): TwoF64;

  /**
   * Converts a `bigint` number to a {@linkcode TwoF64} number.
   *
   * @see {@linkcode twof64.fromBigInt}
   */
  (n: bigint): TwoF64;

  /**
   * Converts a {@linkcode Rational} number to a {@linkcode TwoF64} number.
   *
   * @see {@linkcode twof64.fromRational}
   */
  (r: Rational): TwoF64;

  /**
   * Converts `x` to a {@linkcode TwoF64} number, where `x` can be either:
   * - a `f64` number literal: see {@linkcode twof64.fromLiteral}
   * - a decimal `string`: see {@linkcode twof64.fromString}
   * - a `bigint`: see {@linkcode twof64.fromBigInt}
   * - a `Rational`: see {@linkcode twof64.fromRational}
   *
   * If `x` is not representable or of the wrong type, return `NaN2`.
   */
  (x: any): TwoF64; // eslint-disable-line @typescript-eslint/unified-signatures

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
  fromLiteral(x: f64): TwoF64;

  /**
   * Converts a decimal string `str` to a {@linkcode TwoF64} number.
   *
   * The result `x` is the most accurate twice-precision representation of `str`:
   * when rounding occurs, the relative error is bounded at `2^-106`, except when
   * `x` overflows to `±Infinity` or when `x` lies in the subnormal range (in the
   * latter case, the maximum absolute roundoff error is `2^-1075`).
   *
   * NB. If the runtime environment doesn't support `bigint`, the relative error
   * bound is estimated at `~16u^2`.
   *
   * @param str The input string
   * @returns A {@linkcode TwoF64} number
   */
  fromString(str: string): TwoF64;

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
  fromBigInt(x: bigint): TwoF64;

  /**
   * Converts a {@linkcode Rational} number `r` to a {@linkcode TwoF64} number.
   *
   * The result `x` is the most accurate twice-precision representation of `r`:
   * when rounding occurs, the relative error is bounded at `2^-106`, except when
   * `x` overflows to `±Infinity` or when `x` lies in the subnormal range (in the
   * latter case, the maximum absolute roundoff error is `2^-1075`).
   *
   * @param r A rational number represented as a tuple `[num: bigint, den: bigint]`
   * @returns A {@linkcode TwoF64} number
   */
  fromRational(r: Rational): TwoF64;
}

/**
 * {@linkcode TwoF64} conversion from various number types.
 *
 * Usage: `twof64(x)` or `twof64.from<suffix>(x)`.
 *
 * @see {@linkcode TwoF64Ctor}
 */
const twof64: TwoF64Ctor = ((x: any): TwoF64 => {
  switch (typeof x) {
    case 'number':
      return fromLiteral(x);

    case 'string':
      return fromString(x);

    case 'bigint':
      return fromBigInt(x);

    case 'object':
      return fromRational(x as Rational);

    default:
      return NaN2;
  }
}) as TwoF64Ctor;

twof64.fromLiteral = fromLiteral;
twof64.fromString = fromString;
twof64.fromBigInt = fromBigInt;
twof64.fromRational = fromRational;

export { twof64 };
