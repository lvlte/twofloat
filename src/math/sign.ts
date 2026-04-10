/**
 * @file Sign-related functions
 */

import { type TwoF64 } from '../base/common.js';

/**
 * Return the absolute value of `x`. Expect and return a `TwoF64` number tuple
 * `[hi, lo]` in its canonical form.
 */
export function abs2(x: TwoF64): TwoF64;
export function abs2([xhi, xlo]: TwoF64): TwoF64 {
  return xhi < 0 ? [-xhi, -xlo] : [xhi, xlo];
}

/**
 * Negates the sign of `x` (non-mutating, return a `TwoF64` value equal to `x`
 * but with the opposite sign).
 */
export function neg2(x: TwoF64): TwoF64
export function neg2([xhi, xlo]: TwoF64): TwoF64 {
  return [-xhi, -xlo];
}

/**
 * Return the sign of `x` as a `TwoF64`. Expect and return a `TwoF64` number
 * tuple `[hi, lo]` in its canonical form.
 */
export function sign2(x: TwoF64): TwoF64;
export function sign2([xhi]: TwoF64): TwoF64 {
  const sign = Math.sign(xhi);
  return [sign, 0*xhi];
}
