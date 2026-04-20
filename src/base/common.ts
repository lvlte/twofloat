/**
 * @file Common types and constants
 */

/**
 * Alias for the `number` type.
 */
export type f64 = number;

/**
 * A `number` that holds the value of a 32-bit integer.
 */
export type i32 = number;

/**
 * Canonical representation of a floating-point number with extended precision,
 * ie. whose value is mathematically equal to `hi + lo` and where the non-zero
 * bits in `hi` and `lo` don't overlap. `hi` contains the most significant bits
 * and `lo` the least significant.
 */
export type TwoF64 = [hi: f64, lo: f64];

/**
 * Precision of a float64 number (effective number of bits in the significand).
 */
export const F64_PRECISION = 53;

/**
 * Number of bits that determines the splitting point `F64_SPLITTER` used by the
 * `split` function.
 */
export const F64_SPLIT_NB = 27;           // Math.ceil(F64_PRECISION/2);

/**
 * Number used to `split` a given number into two halves `hi` and `lo`.
 */
export const F64_SPLITTER = 134217729;    // 2**F64_SPLIT_NB + 1;

/**
 * `TwoF64` number equal to `1`
 */
export const ONE2: TwoF64 = [1, 0];

/**
 * `TwoF64` number equal to `0`
 */
export const ZERO2: TwoF64 = [0, 0];

/**
 * `TwoF64` number representing `NaN`
 */
export const NaN2: TwoF64 = [NaN, NaN];

/**
 * `TwoF64` number representing `Infinity`
 */
export const Inf2: TwoF64 = [Infinity, Infinity];
