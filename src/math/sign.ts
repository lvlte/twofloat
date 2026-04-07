/**
 * @fileoverview Sign-related functions
 */

import {
  type f64,
  type TwoF64,
} from '../base/common.js'

export function abs2([xhi, xlo]: [f64, f64]): TwoF64 {
  return xhi < 0 ? [-xhi, -xlo] : [xhi, xlo];
}

export function neg2([xhi, xlo]: [f64, f64]): TwoF64 {
  return [-xhi, -xlo];
}
