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
 * A safe integer `number`: an integer whose absolute value is less than `2^53`.
 */
export type int = number;

/**
 * Canonical representation of a twofloat number. As its name implies, a `TwoF64`
 * is a tuple made of two `f64` components (ie. `hi` and `lo`, which represent
 * the unevaluated but mathematically exact sum `hi + lo`) and can represent
 * values with *at least** twice the precision of one single float64 number
 * (* because `lo` is not necessarilly adjacent to `hi`).
 *
 * Here "canonical" means :
 * - `hi` contains the most significant bits and `lo` the least significant,
 * - the non-zero bits in `lo` don't overlap with the 53 bits of `hi` (the most
 *   significant bit in `lo` is less than the ulp of `hi`).
 *
 * This non-overlapping representation is what guarantees the best accuracy
 * during calculations. Do not use arbitrary values like `[x, y] as TwoF64`
 * unless those two conditions are satisfied.
 */
export type TwoF64 = readonly [hi: f64, lo: f64];

/**
 * Canonical representation of a floating-point number expansion with three
 * components (similar to `TwoF64` but for triple precision)/
 *
 * Here "canonical" means :
 * - `hi` contains the most significant bits and `lo` the least significant,
 * - `[hi, md]` and `[md, lo]` are valid `TwoF64` (`hi`, `md` and `lo` don't
 *    overlap).
 */
export type ThreeF64 = readonly [hi: f64, md: f64, lo: f64];

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
export const ONE: TwoF64 = [1, 0];

/**
 * `TwoF64` number equal to `0`
 */
export const ZERO: TwoF64 = [0, 0];

/**
 * `TwoF64` number representing `NaN`
 */
export const NaN2: TwoF64 = [NaN, NaN];
