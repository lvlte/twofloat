/**
 * @file TwoF64 mathematical constants
 */

import type { TwoF64 } from "../base/common.js";

/**
 * `TwoF64` representation of the mathematical constant `e`, Euler's number,
 * the base of natural logarithms.
 */
export const E: TwoF64 = [2.718281828459045, 1.4456468917292502e-16];

/**
 * `TwoF64` representation of `ln(2)`, the natural logarithm of `2`.
 */
export const LN2: TwoF64 = [0.6931471805599453, 2.3190468138462996e-17];

/**
 * `TwoF64` representation of `ln(10)`, the natural logarithm of `10`.
 */
export const LN10: TwoF64 = [2.302585092994046, -2.1707562233822494e-16];

/**
 * `TwoF64` representation of `log2(e)`, the base-2 logarithm of {@link E|`e`}.
 */
export const LOG2E: TwoF64 = [1.4426950408889634, 2.0355273740931033e-17];

/**
 * `TwoF64` representation of `log10(e)`, the base-10 logarithm of {@link E|`e`}.
 */
export const LOG10E: TwoF64 = [0.4342944819032518, 1.098319650216765e-17];

/**
 * `TwoF64` representation of the mathematical constant `π`, the ratio of a
 * circle's circumference to its diameter.
 */
export const PI: TwoF64 = [3.141592653589793, 1.2246467991473532e-16];

/**
 * `TwoF64` representation of `√½`, the square root of `½`.
 */
export const SQRT1_2: TwoF64 = [0.7071067811865476, -4.833646656726457e-17];

/**
 * `TwoF64` representation of `√2`, the square root of `2`.
 */
export const SQRT2: TwoF64 = [1.4142135623730951, -9.667293313452913e-17];

/**
 * `TwoF64` representation of `∞` (positive infinity).
 */
export const INF: TwoF64 = [Infinity, Infinity];

/**
 * `TwoF64` representation of `-∞` (negative infinity).
 */
export const NINF: TwoF64 = [-Infinity, -Infinity];
