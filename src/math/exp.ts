/**
 * Exponentiation functions
 *
 * @module
 */

import {
  type TwoF64,
  type f64,
  type int,
} from '../base/common.js';

import { mul21, mul22 } from '../arithmetic/index.js';
import { isSafeInteger2 } from '../base/compare.js';
import { ln_1, ln_2 } from './log.js';

// NB. This file contains only wrapper functions that dispacth to more specific
// functions. Those functions are implemented in a separate module in order to
// avoid the dependency cicle `exp.ts -> log.ts -> exp.ts`.

import {
  square_1, square_2, cube_1, cube_2, exp_1, exp_2, expm1_1, expm1_2,
  powint_1, powint_2,
} from './exp-impl.js';

export * from './exp-impl.js';

/**
 * Compute `xᵖ`, `x` raised to the power of `p`, using extended-precision
 * arithmetic.
 *
 * @param x A `f64` number representing the base
 * @param p A `f64` number representing the exponent
 * @returns The {@link TwoF64|`TwoF64`} representation of `xᵖ`
 */
export function pow_11(x: f64, p: f64): TwoF64 {
  if (Number.isSafeInteger(p)) {
    return powint_1(x, p);
  }
  return exp_2(mul21(ln_1(x), p));
}

/**
 * Compute `xᵖ`, `x` raised to the power of `p`, using extended-precision
 * arithmetic.
 *
 * @param x A `f64` number representing the base
 * @param p A `TwoF64` number representing the exponent
 * @returns The {@link TwoF64|`TwoF64`} representation of `xᵖ`
 */
export function pow_12(x: f64, p: TwoF64): TwoF64 {
  if (isSafeInteger2(p)) {
    return powint_1(x, p[0]);
  }
  return exp_2(mul22(ln_1(x), p));
}

/**
 * Compute `xᵖ`, `x` raised to the power of `p`, using extended-precision
 * arithmetic.
 *
 * @param x A `TwoF64` number representing the base
 * @param p A `f64` number representing the exponent
 * @returns The {@link TwoF64|`TwoF64`} representation of `xᵖ`
 */
export function pow_21(x: TwoF64, p: f64): TwoF64 {
  if (Number.isSafeInteger(p)) {
    return powint_2(x, p);
  }
  return exp_2(mul21(ln_2(x), p));
}

/**
 * Compute `xᵖ`, `x` raised to the power of `p`, using extended-precision
 * arithmetic.
 *
 * @param x A `TwoF64` number representing the base
 * @param p A `TwoF64` number representing the exponent
 * @returns The {@link TwoF64|`TwoF64`} representation of `xᵖ`
 */
export function pow_22(x: TwoF64, p: TwoF64): TwoF64 {
  if (isSafeInteger2(p)) {
    return powint_2(x, p[0]);
  }
  return exp_2(mul22(ln_2(x), p));
}

/**
 * Compute `x²`, the square of `x`, using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x²`
 */
export function square(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? square_1(x) : square_2(x);
}

/**
 * Compute `x³`, the cube of `x`, using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `x³`
 */
export function cube(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? cube_1(x) : cube_2(x);
}

/**
 * Integer power of `x` - Compute `xⁿ` using extended-precision arithmetic.
 * `n` must be an integer.
 *
 * @param x A `f64` or `TwoF64` number representing the base
 * @param n A `f64` integer representing the exponent
 * @returns The {@link TwoF64|`TwoF64`} representation of `xⁿ`
 */
export function powint(x: f64 | TwoF64, n: int): TwoF64 {
  return typeof x === 'number' ? powint_1(x, n) : powint_2(x, n);
}

/**
 * Compute `xᵖ`, `x` raised to the power of `p`, using extended-precision
 * arithmetic.
 *
 * @param x A `f64` or `TwoF64` number representing the base
 * @param p A `f64` or `TwoF64` number representing the exponent
 * @returns The {@link TwoF64|`TwoF64`} representation of `xᵖ`
 */
export function pow(x: f64 | TwoF64, p: f64 | TwoF64): TwoF64 {
  return typeof x === 'number'
    ? typeof p === 'number' ? pow_11(x, p) : pow_12(x, p)
    : typeof p === 'number' ? pow_21(x, p) : pow_22(x, p);
}

/**
 * Compute `eˣ`, the natural base exponential of `x`, using extended-precision
 * arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `eˣ`
 */
export function exp(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? exp_1(x) : exp_2(x);
}

/**
 * Compute `eˣ - 1`, the natural base exponential of `x` subtracted by `1`,
 * using extended-precision arithmetic.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `eˣ - 1`
 */
export function expm1(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? expm1_1(x) : expm1_2(x);
}
