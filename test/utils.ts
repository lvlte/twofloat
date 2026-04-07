import { exponent } from '@lvlte/ulp';

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
    return function (exp: number, sign: number): number {
      const x = Math.abs(Math.sin(n++));
      const p = exp - exponent(x);
      return sign * ldexp(x, p);
    } as RandomFn<T>;
  }
  return function (): number {
    return Math.abs(Math.sin(n++));
  } as RandomFn<T>;
}
