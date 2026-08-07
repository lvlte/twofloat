/**
 * @file Modular Arithmetic
 */

import { add11, add21, div12, div22, mul11, sub11, sub12, sub21, sub22 } from "../arithmetic/index.js";
import type { f64, ThreeF64, TwoF64 } from "../base/common.js";
import { le22, lt22 } from "../base/compare.js";
import { THREE } from "./constants.js";
import { abs2 } from "./basic.js";

/**
 * Return the remainder left over after integer division of `x` by `π`, with the
 * quotient rounded towards zero (cf. `%` operator). Mathematically, the value
 * `r` such that `r = x - a*π` where `a = trunc(x/π)`
 *
 * @param x A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `r`
 */
export function rempi_1(x: f64): TwoF64 {
  return _rem_npi_13(x, THREE.PI);
}

/**
 * Return the remainder left over after integer division of `x` by `π`, with the
 * quotient rounded towards zero (cf. `%` operator). Mathematically, the value
 * `r` such that `r = x - a*π` where `a = trunc(x/π)`
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `r`
 */
export function rempi_2(x: TwoF64): TwoF64 {
  return _rem_npi_23(x, THREE.PI);
}

/**
 * Return the remainder left over after integer division of `x` by `2π`, with
 * the quotient rounded towards zero (cf. `%` operator). Mathematically, the
 * value `r` such that `r = x - a*2π` where `a = trunc(x/2π)`.
 *
 * @param x A `f64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `r`
 */
export function rem2pi_1(x: f64): TwoF64 {
  return _rem_npi_13(x, THREE.TAU);
}

/**
 * Return the remainder left over after integer division of `x` by `2π`, with
 * the quotient rounded towards zero (cf. `%` operator). Mathematically, the
 * value `r` such that `r = x - a*2π` where `a = trunc(x/2π)`.
 *
 * @param x A `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `r`
 */
export function rem2pi_2(x: TwoF64): TwoF64 {
  return _rem_npi_23(x, THREE.TAU);
}

/**
 * Return the remainder left over after integer division by a multiple of `π`.
 */
function _rem_npi_13(x: f64, npi: ThreeF64): TwoF64 {
  const [yhi, ymd, ylo] = npi;

  const xabs = Math.abs(x);
  if (ymd > 0) {
    if (xabs <= 2*yhi) {
      return xabs <= yhi ? [x, 0] : x > 0
        ? sub21(sub21(sub11(x, yhi), ymd), ylo)
        : add21(add21(add11(x, yhi), ymd), ylo);
    }
  }
  else if (xabs < 2*yhi) {
    return xabs < yhi ? [x, 0] : x > 0
      ? sub21(sub21(sub11(x, yhi), ymd), ylo)
      : add21(add21(add11(x, yhi), ymd), ylo);
  }

  const [qhi, qlo] = div12(x, [yhi, ymd]);

  let a = Math.trunc(qhi);
  if (Number.isInteger(qhi) && Math.sign(qhi) === -Math.sign(qlo)) {
    a += Math.sign(qlo);
  }

  const ayhi = mul11(yhi, a);
  const aymd = mul11(ymd, a);
  const aylo = mul11(ylo, a);

  return sub22(sub22(sub12(x, ayhi), aymd), aylo);
}

/**
 * Return the remainder left over after integer division by a multiple of `π`.
 */
function _rem_npi_23(x: TwoF64, npi: ThreeF64): TwoF64 {
  const [yhi, ymd, ylo] = npi;

  const xabs = abs2(x);

  if (ylo > 0) {
    if (le22(xabs, [2*yhi, 2*ymd])) {
      return le22(xabs, [yhi, ymd]) ? x : Math.sign(x[0]) > 0
        ? sub21(sub21(sub21(x, yhi), ymd), ylo)
        : add21(add21(add21(x, yhi), ymd), ylo);
    }
  }
  else if (lt22(xabs, [2*yhi, 2*ymd])) {
    return lt22(xabs, [yhi, ymd]) ? x : Math.sign(x[0]) > 0
      ? sub21(sub21(sub21(x, yhi), ymd), ylo)
      : add21(add21(add21(x, yhi), ymd), ylo);
  }

  const [qhi, qlo] = div22(x, [yhi, ymd]);

  let a = Math.trunc(qhi);
  if (Number.isInteger(qhi) && Math.sign(qhi) === -Math.sign(qlo)) {
    a += Math.sign(qlo);
  }

  const ayhi = mul11(yhi, a);
  const aymd = mul11(ymd, a);
  const aylo = mul11(ylo, a);

  return sub22(sub22(sub22(x, ayhi), aymd), aylo);
}

/**
 * Return the remainder left over after integer division of `x` by `π`, with the
 * quotient rounded towards zero (cf. `%` operator). Mathematically, the value
 * `r` such that `r = x - a*π` where `a = trunc(x/π)`
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `r`
 */
export function rempi(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? _rem_npi_13(x, THREE.PI) : _rem_npi_23(x, THREE.PI);
}

/**
 * Return the remainder left over after integer division of `x` by `2π`, with
 * the quotient rounded towards zero (cf. `%` operator). Mathematically, the
 * value `r` such that `r = x - a*2π` where `a = trunc(x/2π)`.
 *
 * @param x A `f64` or `TwoF64` number
 * @returns The {@link TwoF64|`TwoF64`} representation of `r`
 */
export function rem2pi(x: f64 | TwoF64): TwoF64 {
  return typeof x === 'number' ? _rem_npi_13(x, THREE.TAU) : _rem_npi_23(x, THREE.TAU);
}
