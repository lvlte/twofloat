/**
 * Basic math functions
 *
 * @module
 */

import { NaN2, type TwoF64 } from '../base/common.js';
import { normalize } from '../base/eft.js';

/**
 * Return the absolute value of `x`.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `|x|`
 */
export function abs(x: TwoF64): TwoF64;
export function abs([xhi, xlo]: TwoF64): TwoF64 {
  const hi = Math.abs(xhi);
  const lo = hi > xhi ? (xlo === 0 ? 0 : -xlo) : xlo;
  return [hi, lo];
}

/**
 * Return the negative of `x`.
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `-x`
 */
export function neg(x: TwoF64): TwoF64
export function neg([xhi, xlo]: TwoF64): TwoF64 {
  return [-xhi, xlo === 0 ? 0 : -xlo];
}

/**
 * Return the sign of `x`, that is, `[<sign>, 0]` where `<sign>` is either `-1`,
 * `-0`, `0` or `1` (or return `NaN2` if `x` is not a number).
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of the sign of `x`
 */
export function sign(x: TwoF64): TwoF64;
export function sign([xhi, xlo]: TwoF64): TwoF64 {
  const sign = Math.sign(xhi + xlo);
  return Number.isFinite(sign) ? [sign, 0] : NaN2;
}

/**
 * Return the integral part of `x`, removing any fractional digits.
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of the integer part of `x`
 */
export function trunc(x: TwoF64): TwoF64;
export function trunc([xhi, xlo]: TwoF64): TwoF64 {
  if (!Number.isFinite(xhi)) {
    return Number.isNaN(xhi) || Math.abs(xhi) !== Infinity ? NaN2 : [xhi, 0];
  }

  if (Number.isInteger(xhi)) {
    return Number.isInteger(xlo) ? [xhi, xlo] : normalize(xhi, Math.trunc(xlo));
  }

  return [Math.trunc(xhi), 0];
}

/**
 * Return `⌊x⌋`, the greatest integer less than or equal to `x`.
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `⌊x⌋`
 */
export function floor(x: TwoF64): TwoF64;
export function floor([xhi, xlo]: TwoF64): TwoF64 {
  if (!Number.isFinite(xhi)) {
    return Number.isNaN(xhi) || Math.abs(xhi) !== Infinity ? NaN2 : [xhi, 0];
  }

  if (Number.isInteger(xhi)) {
    return Number.isInteger(xlo) ? [xhi, xlo] : normalize(xhi, Math.floor(xlo));
  }

  return [Math.floor(xhi), 0];
}

/**
 * Return `⌈x⌉`, the least integer greater than or equal to `x`.
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `⌈x⌉`
 */
export function ceil(x: TwoF64): TwoF64;
export function ceil([xhi, xlo]: TwoF64): TwoF64 {
  if (!Number.isFinite(xhi)) {
    return Number.isNaN(xhi) || Math.abs(xhi) !== Infinity ? NaN2 : [xhi, 0];
  }

  if (Number.isInteger(xhi)) {
    return Number.isInteger(xlo) ? [xhi, xlo] : normalize(xhi, Math.ceil(xlo));
  }

  return [Math.ceil(xhi), 0];
}

/**
 * Return the nearest integer to `x`, with ties (fractional values of `0.5`)
 * being rounded to the nearest **even** integer.
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x`
 */
export function round(x: TwoF64): TwoF64;
export function round([xhi, xlo]: TwoF64): TwoF64 {
  if (!Number.isFinite(xhi)) {
    return Number.isNaN(xhi) || Math.abs(xhi) !== Infinity ? NaN2 : [xhi, 0];
  }

  if (Number.isInteger(xhi)) {
    return Number.isInteger(xlo) ? [xhi, xlo] : normalize(xhi, Math.round(xlo));
  }

  return [Math.round(xhi), 0];
}
