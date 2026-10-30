/**
 * TwoF64 construction from different number reprentations.
 *
 * @module twofloat/twof64
 */

import type { f64, TwoF64 } from '../base/common.js';
import { twof64FromLiteral } from './from-literal.js';
import { twof64FromRational, type Rational } from './from-rational.js';
import { twof64FromString } from './from-string.js';

export interface twof64Ctor {
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
   * @param x The input number
   * @returns The {@link TwoF64|`TwoF64`} representation of `"${x}"`
   */
  (x: f64): TwoF64;

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
   * @param x The input number
   * @returns The {@link TwoF64|`TwoF64`} representation of `"${x}"`
   */
  fromLiteral(x: f64): TwoF64;

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
  fromRational(r: Rational): TwoF64;

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
  fromString(str: string): TwoF64;
}

// NB. redundant jsdoc is needed for the unminified umd bundle

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
 * @param x The input number
 * @returns The {@link TwoF64|`TwoF64`} representation of `"${x}"`
 */
const twof64 = ((x: f64): TwoF64 => twof64FromLiteral(x)) as twof64Ctor;

twof64.fromLiteral = twof64FromLiteral;
twof64.fromRational = twof64FromRational;
twof64.fromString = twof64FromString;

export { twof64 };
