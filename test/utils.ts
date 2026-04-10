/**
 * @file Test utils
 */

import { exponent } from '@lvlte/ulp';
import { f64 } from '../src';

type _UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  (k: infer I) => void
) ? I : never;

export type UnionToIntersection<U> = _UnionToIntersection<U> extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type Expand<T> = {} & { [P in keyof T]: Expand<T[P]> };

type RandomFnDefault = () => number;
type RandomFnWithDomainOpt = (exp: number, sign: number) => number;
type RandomFn<T extends boolean> = T extends false
  ? RandomFnDefault
  : T extends true
    ? RandomFnWithDomainOpt
    : never;


/**
 * Computes x * 2^n.
 */
export function ldexp(x: number, n: number) {
  return x * 2**n;
}

/**
 * Return a function that returns pseudo-random numbers using the given `seed`.
 * If `domainOpt` is `true`, the function expects two arguments `exp` and `sign`
 * that define its output range `[sign*2^exp, sign*2^(exp+1)]`, otherwise the
 * the generated numbers are in the range `[0, 1]`.
 */
export function randomFn<T extends boolean>(seed: number, domainOpt: T): RandomFn<T> {
  let n = seed;
  if (domainOpt === true) {
    return function (exp: number, sign: -1 | 1): number {
      const x = Math.abs(Math.sin(n++));
      const p = exp - exponent(x);
      return sign * ldexp(x, p);
    } as RandomFn<T>;
  }
  return function (): number {
    return Math.abs(Math.sin(n++));
  } as RandomFn<T>;
}

/**
 * Return pairs of numbers in the range [emin, emax] according to the given step.
 */
export function pairsInRange(emin: f64, emax: f64, step: f64): Array<[f64, f64]> {
  const pairs: Array<[f64, f64]> = [];
  for (let e1 = emin; e1 <= emax; e1+=step) {
    for (let e2 = emin+1; e2 <= emax; e2+=step) {
      pairs.push([e1, e2]);
    }
  }
  return pairs;
}

/**
 * Sign pairs used for generating pairs of number/twofloat args.
 */
export const signCombinations = [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const;

