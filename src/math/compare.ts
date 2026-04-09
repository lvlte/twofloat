/**
 * @file Comparison/min/max/is* functions
 */

import {
  type f64,
  type TwoF64,
} from '../base/common.js';

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
 * Return a boolean indicating whether `x` is less than `y`.
 */
export function lt21(x: TwoF64, y: f64): boolean;
export function lt21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi < y || (xhi === y && xlo < 0);
}

/**
 * Return a boolean indicating whether `x` is less than `y`.
 */
export function lt22(x: TwoF64, y: TwoF64): boolean;
export function lt22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi < yhi || (xhi === yhi && xlo < ylo);
}

/**
 * Return a boolean indicating whether `x` is less than or equal to `y`.
 */
export function le21(x: TwoF64, y: f64): boolean;
export function le21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi < y || (xhi === y && xlo <= 0);
}

/**
 * Return a boolean indicating whether `x` is less than or equal to `y`.
 */
export function le22(x: TwoF64, y: TwoF64): boolean
export function le22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi < yhi || (xhi === yhi && xlo <= ylo);
}

/**
 * Return a boolean indicating whether `x` is greater than `y`.
 */
export function gt21(x: TwoF64, y: f64): boolean;
export function gt21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi > y || (xhi === y && xlo > 0);
}

/**
 * Return a boolean indicating whether `x` is greater than `y`.
 */
export function gt22(x: TwoF64, y: TwoF64): boolean;
export function gt22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi > yhi || (xhi === yhi && xlo > ylo);
}

/**
 * Return a boolean indicating whether `x` is greater than or equal to `y`.
 */
export function ge21(x: TwoF64, y: f64): boolean;
export function ge21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi > y || (xhi === y && xlo >= 0);
}

/**
 * Return a boolean indicating whether `x` is greater than or equal to `y`.
 */
export function ge22(x: TwoF64, y: TwoF64): boolean;
export function ge22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi > yhi || (xhi === yhi && xlo >= ylo);
}
