/**
 * Main algorithms with formally proven error bounds
 *
 * References:
 * - {@link https://csclub.uwaterloo.ca/~pbarfuss/dekker1971.pdf     | T.J. Dekker        }
 * - {@link https://people.eecs.berkeley.edu/~jrs/papers/robustr.pdf | J.R. Shewchuk      }
 * - {@link https://hal.science/hal-01351529v3/document              | J.M. Muller et al. }
 */

import {
  type f64,
  type TwoF64,
  normalize,
  twoSum,
  twoProd
} from '../index.js';

// η = relative error bound
// u = 2^-53

// η = 2u²
export function DWPlusFP([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const [hi, lo] = twoSum(xhi, y);
  return normalize(hi, xlo + lo);
}

// η = 3u² + 13u³
export function AccurateDWPlusDW([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const [shi, slo] = twoSum(xhi, yhi);
  const [thi, tlo] = twoSum(xlo, ylo);
  const [vhi, vlo] = normalize(shi, slo + thi);
  return normalize(vhi, tlo + vlo);
}

// η = 3u²/2 + 4u³
export function DWTimesFP1([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const [shi, slo] = twoProd(xhi, y);
  const [hi, lo] = normalize(shi, xlo*y);
  return normalize(hi, lo + slo);
}

// η = 5u²
export function DWTimesDW1([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const [hi, lo] = twoProd(xhi, yhi);
  return normalize(hi, lo + (xhi*ylo + xlo*yhi));
}

// η = 3u²
export function DWDivFP3([xhi, xlo]: TwoF64, y: f64): TwoF64 {
  const hi = xhi/y;
  const [shi, slo] = twoProd(hi, y);
  return normalize(hi, (((xhi - shi) - slo) + xlo)/y);
}

// η = 15u² + 56u³
export function DWDivDW2([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): TwoF64 {
  const hi = xhi/yhi;
  const [rhi, rlo] = DWTimesFP1([yhi, ylo], hi);
  return normalize(hi, ((xhi - rhi) + (xlo - rlo))/yhi);
}
