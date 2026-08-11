/**
 * Comparison functions (equality/ordering/is* predicates)
 *
 * @module
 */

import {
  type f64,
  type TwoF64,
} from './common.js';

/**
 * Return a boolean indicating whether `x` is equal to `y`.
 */
export function eq21(x: TwoF64, y: f64): boolean;
export function eq21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi === y && xlo === 0;
}

/**
 * Return a boolean indicating whether `x` is equal to `y`.
 */
export function eq22(x: TwoF64, y: TwoF64): boolean;
export function eq22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi === yhi && xlo === ylo;
}

/**
 * `x < y` — Return a boolean indicating whether `x` is less than `y`.
 */
export function lt12(x: f64, y: TwoF64): boolean;
export function lt12(x: f64, [yhi, ylo]: TwoF64): boolean {
  return x < yhi || (x === yhi && ylo > 0);
}

/**
 * `x < y` — Return a boolean indicating whether `x` is less than `y`.
 */
export function lt21(x: TwoF64, y: f64): boolean;
export function lt21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi < y || (xhi === y && xlo < 0);
}

/**
 * `x < y` — Return a boolean indicating whether `x` is less than `y`.
 */
export function lt22(x: TwoF64, y: TwoF64): boolean;
export function lt22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi < yhi || (xhi === yhi && xlo < ylo);
}

/**
 * `x ≤ y` — Return a boolean indicating whether `x` is less than or equal to `y`.
 */
export function le12(x: f64, y: TwoF64): boolean;
export function le12(x: f64, [yhi, ylo]: TwoF64): boolean {
  return x < yhi || (x === yhi && ylo >= 0);
}

/**
 * `x ≤ y` — Return a boolean indicating whether `x` is less than or equal to `y`.
 */
export function le21(x: TwoF64, y: f64): boolean;
export function le21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi < y || (xhi === y && xlo <= 0);
}

/**
 * `x ≤ y` — Return a boolean indicating whether `x` is less than or equal to `y`.
 */
export function le22(x: TwoF64, y: TwoF64): boolean
export function le22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi < yhi || (xhi === yhi && xlo <= ylo);
}

/**
 * `x > y` — Return a boolean indicating whether `x` is greater than `y`.
 */
export function gt12(x: f64, y: TwoF64): boolean;
export function gt12(x: f64, [yhi, ylo]: TwoF64): boolean {
  return x > yhi || (x === yhi && ylo < 0);
}

/**
 * `x > y` — Return a boolean indicating whether `x` is greater than `y`.
 */
export function gt21(x: TwoF64, y: f64): boolean;
export function gt21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi > y || (xhi === y && xlo > 0);
}

/**
 * `x > y` — Return a boolean indicating whether `x` is greater than `y`.
 */
export function gt22(x: TwoF64, y: TwoF64): boolean;
export function gt22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi > yhi || (xhi === yhi && xlo > ylo);
}

/**
 * `x ≥ y` — Return a boolean indicating whether `x` is greater than or equal to `y`.
 */
export function ge12(x: f64, y: TwoF64): boolean;
export function ge12(x: f64, [yhi, ylo]: TwoF64): boolean {
  return x > yhi || (x === yhi && ylo <= 0);
}

/**
 * `x ≥ y` — Return a boolean indicating whether `x` is greater than or equal to `y`.
 */
export function ge21(x: TwoF64, y: f64): boolean;
export function ge21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi > y || (xhi === y && xlo >= 0);
}

/**
 * `x ≥ y` — Return a boolean indicating whether `x` is greater than or equal to `y`.
 */
export function ge22(x: TwoF64, y: TwoF64): boolean;
export function ge22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi > yhi || (xhi === yhi && xlo >= ylo);
}

/**
 * Return a boolean indicating whether `x` is equal to `0`.
 */
export function isZero(x: TwoF64): boolean;
export function isZero([xhi, xlo]: TwoF64): boolean {
  // xhi = 0 implies xlo = 0, but we ensure xlo is not NaN even if it should
  // not happen.
  return xhi === 0 && xlo === 0;
}

/**
 * Return a boolean indicating whether `x` is equal to `1`.
 */
export function isOne(x: TwoF64): boolean;
export function isOne([xhi, xlo]: TwoF64): boolean {
  return xhi === 1 && xlo === 0;
}

/**
 * Return a boolean indicating whether `x` represents a finite number.
 */
export function isFinite2(x: TwoF64): boolean;
export function isFinite2([xhi, xlo]: TwoF64): boolean {
  return Number.isFinite(xhi) && Number.isFinite(xlo);
}

/**
 * Return a boolean indicating whether `x` represents an integer.
 */
export function isInteger2(x: TwoF64): boolean;
export function isInteger2([xhi, xlo]: TwoF64): boolean {
  return Number.isInteger(xlo) && Number.isInteger(xhi);
}

/**
 * Return a boolean indicating whether `x` represents a safe f64 integer (ie.
 * can be converted to a float64 number without loosing precision).
 */
export function isSafeInteger2(x: TwoF64): boolean;
export function isSafeInteger2([xhi, xlo]: TwoF64): boolean {
  return Number.isSafeInteger(xhi) && xlo === 0;
}

/**
 * Return a boolean indicating whether `x` is a safe twofloat integer (ie. such
 * that `x` and `x ± 1` are integers that can be represented exactly using
 * extended precision).
 */
export function isSafeTwoInteger(x: TwoF64): boolean;
export function isSafeTwoInteger([xhi, xlo]: TwoF64): boolean {
  return Number.isInteger(xhi) && Number.isSafeInteger(xlo);
}

/**
 * Return a boolean indicating whether `x` should be considered as `NaN2` (not a
 * number), that is, `true` if `xₕᵢ + xₗₒ` evaluates to `NaN`, `false` otherwise.
 *
 * The exception to this rule is with infinite `x`: because `normalize(INF)`
 * returns `[Infinity, NaN]` we consider infinite any twofloat number having an
 * infinite hi part, although `Infinity + NaN` evaluates to `NaN`.
 */
export function isNaN2(x: TwoF64): boolean;
export function isNaN2([xhi, xlo]: TwoF64): boolean {
  return Number.isNaN(xhi + xlo) && Math.abs(xhi) !== Infinity;
}

/**
 * Return a boolean indicating whether `x` represents ±Infinity, that is, any
 * twofloat number having an infinite hi part, including `[Infinity, NaN]` (the
 * reason for this is that `normalize(INF)` returns `[Infinity, NaN]`).
 */
export function isInfinite2(x: TwoF64): boolean;
export function isInfinite2([xhi,]: TwoF64): boolean {
  return Math.abs(xhi) === Infinity;
}

/**
 * Return a boolean indicating whether `x` is equal to `y`.
 */
export function eq(x: f64 | TwoF64, y: f64 | TwoF64): boolean {
  return typeof x === 'number'
    ? typeof y === 'number' ? x === y : eq21(y, x)
    : typeof y === 'number' ? eq21(x, y) : eq22(x, y);
}

/**
 * `x < y` — Return a boolean indicating whether `x` is less than `y`.
 */
export function lt(x: f64 | TwoF64, y: f64 | TwoF64): boolean {
  return typeof x === 'number'
    ? typeof y === 'number' ? x < y : lt12(x, y)
    : typeof y === 'number' ? lt21(x, y) : lt22(x, y)
}

/**
 * `x ≤ y` — Return a boolean indicating whether `x` is less than or equal to `y`.
 */
export function le(x: f64 | TwoF64, y: f64 | TwoF64): boolean {
  return typeof x === 'number'
    ? typeof y === 'number' ? x <= y : le12(x, y)
    : typeof y === 'number' ? le21(x, y) : le22(x, y)
}

/**
 * `x > y` — Return a boolean indicating whether `x` is greater than `y`.
 */
export function gt(x: f64 | TwoF64, y: f64 | TwoF64): boolean {
  return typeof x === 'number'
    ? typeof y === 'number' ? x > y : gt12(x, y)
    : typeof y === 'number' ? gt21(x, y) : gt22(x, y)
}

/**
 * `x ≥ y` — Return a boolean indicating whether `x` is greater than or equal to `y`.
 */
export function ge(x: f64 | TwoF64, y: f64 | TwoF64): boolean {
  return typeof x === 'number'
    ? typeof y === 'number' ? x >= y : ge12(x, y)
    : typeof y === 'number' ? ge21(x, y) : ge22(x, y)
}
