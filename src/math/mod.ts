/**
 * @file Modular Arithmetic
 */

import { add11, add21, div12, div22, mul11, sub11, sub12, sub21, sub22 } from "../arithmetic/index.js";
import type { f64, TwoF64 } from "../base/common.js";
import { lt22 } from "../base/compare.js";
import { THREE } from "./constants.js";
import { abs2 } from "./sign.js";

/**
 * Return the remainder left over after integer division by `2π`, in other words
 * the value `r` such that :
 *
 *  `r = x - a*2π` where `a = trunc(x/2π)` (round towards zero)
 *
 * @param {f64} x A `f64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function rem2pi_1(x: f64): TwoF64 {
  const [yhi, ymd, ylo] = THREE.TAU;

  const xabs = Math.abs(x);
  if (xabs <= 2*yhi) {
    return xabs <= yhi ? [x, 0] : x > 0
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
 * Return the remainder left over after integer division by `2π`, in other words
 * the value `r` such that :
 *
 *  `r = x - a*2π` where `a = trunc(x/2π)` (round towards zero)
 *
 * @param {f64} x A `TwoF64` number
 * @returns {TwoF64} A {@link TwoF64|`TwoF64`} number
 */
export function rem2pi_2(x: TwoF64): TwoF64 {
  const [yhi, ymd, ylo] = THREE.TAU;

  const xabs = abs2(x);
  if (lt22(xabs, [2*yhi, 2*ymd])) {
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
