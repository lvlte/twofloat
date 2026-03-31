import {
  type f64,
  type TwoF64,
} from './index.js'

export function eq21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi === y && xlo === 0;
}

export function eq22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi === yhi && xlo === ylo;
}

export function lt21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi < y || (xhi === y && xlo < 0);
}

export function lt22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi < yhi || (xhi === yhi && xlo < ylo);
}

export function le21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi < y || (xhi === y && xlo <= 0);
}

export function le22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi < yhi || (xhi === yhi && xlo <= ylo);
}

export function gt21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi > y || (xhi === y && xlo > 0);
}

export function gt22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi > yhi || (xhi === yhi && xlo > ylo);
}

export function ge21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi > y || (xhi === y && xlo >= 0);
}

export function ge22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi > yhi || (xhi === yhi && xlo >= ylo);
}

export function ne21([xhi, xlo]: TwoF64, y: f64): boolean {
  return xhi !== y || xlo !== 0;
}

export function ne22([xhi, xlo]: TwoF64, [yhi, ylo]: TwoF64): boolean {
  return xhi !== yhi || xlo !== ylo;
}
