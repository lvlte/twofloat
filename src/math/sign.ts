/**
 * @file Sign-related functions
 */

import { NaN2, type TwoF64 } from '../base/common.js';

/**
 * Return the absolute value of `x`.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `|x|`
 */
export function abs2(x: TwoF64): TwoF64;
export function abs2([xhi, xlo]: TwoF64): TwoF64 {
  return xhi < 0 ? [-xhi, -xlo] : [xhi, xlo];
}

/**
 * Return the negative of `x`.
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `-x`
 */
export function neg2(x: TwoF64): TwoF64
export function neg2([xhi, xlo]: TwoF64): TwoF64 {
  return [-xhi, -xlo];
}

/**
 * Return the sign of `x`, that is, `[<sign>, 0]` where `<sign>` is either `-1`,
 * `-0`, `0` or `1` (or return `NaN2` if `x` is not a number).
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of the sign of `x`
 */
export function sign2(x: TwoF64): TwoF64;
export function sign2([xhi, xlo]: TwoF64): TwoF64 {
  const sign = Math.sign(xhi + xlo);
  return Number.isFinite(sign) ? [sign, 0] : NaN2;
}
