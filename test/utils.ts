/**
 * @file Test utils
 */

import { exponent } from '@lvlte/ulp';
import { type TwoF64, type f64, type int, F64_SPLITTER, normalize } from '../src';
import { type RandomGenerator } from 'pure-rand/types/RandomGenerator';
import { uniformFloat64 } from 'pure-rand/distribution/uniformFloat64';

type _UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  (k: infer I) => void
) ? I : never;

export type UnionToIntersection<U> = _UnionToIntersection<U> extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type Expand<T> = {} & T extends TwoF64 ? T : { [P in keyof T]: Expand<T[P]> };
export type Sign = -1 | 1;

type RandomFnDefault = () => number;
type RandomFnWithRangeOpt = (exp: number, sign: Sign) => number;
type RandomFn<T extends boolean> = T extends false
  ? RandomFnDefault
  : T extends true
    ? RandomFnWithRangeOpt
    : never;

type Rand2FnDefault = () => TwoF64;
type Rand2FnWithRangeOpt = (exp: number, sign: Sign, losign?: Sign) => TwoF64;
type Rand2Fn<T extends boolean> = T extends false
  ? Rand2FnDefault
  : T extends true
    ? Rand2FnWithRangeOpt
    : never;

export interface FnSig {
  'op1': (x: f64) => TwoF64;
  'op2': (x: TwoF64) => TwoF64;
  'op11': (x: f64, y: f64) => TwoF64;
  'op12': (x: f64, y: TwoF64) => TwoF64;
  'op21': (x: TwoF64, y: f64) => TwoF64;
  'op22': (x: TwoF64, y: TwoF64) => TwoF64;
  'op1n': (x: f64, n: int) => TwoF64;
  'op2n': (x: TwoF64, n: int) => TwoF64;
  'opa1': (x: f64[]) => TwoF64;
  'opa2': (x: TwoF64[]) => TwoF64;
  'exp1': (x: f64) => TwoF64;
  'exp2': (x: TwoF64) => TwoF64;
}

type FnBySig = {[K in keyof FnSig]: {[fnName: string]: FnSig[K]}};
export type FnBySigOpt = Partial<FnBySig>;
type ArgsListBySig = Partial<{[K in keyof FnBySig]: Parameters<FnSig[K]>[]}>;
type FnOutputList = Partial<{[key: string]: ReturnType<FnBySig[keyof FnBySig][string]>[]}>;

/**
 * Exponent of the maximum absolute value that can be splitted by `F64_SPLITTER`
 * (split is not immune to overflow).
 */
export const E_SPLIT_MAX = exponent(Number.MAX_VALUE/F64_SPLITTER);

/**
 * Compute x * 2^n.
 */
export function ldexp(x: number, n: number) {
  return x * 2**n;
}

/**
 * Compute x * 2^n.
 */
export function ldexp2([xhi, xlo]: TwoF64, n: number): TwoF64 {
  return [xhi * 2**n, xlo * 2**n];
}

/**
 * Return a function that generates pseudo-random `f64` numbers using the given
 * `rng`.
 * - if `rangeOpt` is `true`, the generator expects two arguments `exp` and
 *   `sign` that define its output range `[sign*2^exp, sign*2^(exp+1)]`
 * - otherwise the generated numbers are in the range `[0, 1]`.
 */
export function randomFn<T extends boolean>(rng: RandomGenerator, rangeOpt: T): RandomFn<T> {
  if (rangeOpt === true) {
    return function (exp: number, sign: Sign): number {
      const x = uniformFloat64(rng);
      const p = exp - exponent(x);
      return sign * ldexp(x, p);
    } as RandomFn<T>;
  }
  return function (): number {
    return uniformFloat64(rng);
  } as RandomFn<T>;
}

/**
 * Return a function that generates pseudo-random `TwoF64` numbers using the
 * given `rng`.
 * - if `rangeOpt` is `true`, the generator expects two arguments `exp` and
 *   `sign` that define its output range `[sign*2^exp, sign*2^(exp+1)]`, a third
 *   argument `losign` (optional, default is random) determines the sign of `lo`
 *   in the output
 * - otherwise the generated numbers are in the range `[0, 1]`.
 */
export function rand2Fn<T extends boolean>(rng: RandomGenerator, rangeOpt: T): Rand2Fn<T> {
  if (rangeOpt === true) {
    return function (exp: number, sign: Sign, losign?: Sign): TwoF64 {
      losign ??= uniformFloat64(rng) >= 0.5 ? 1 : -1;
      const x = uniformFloat64(rng);
      const y = uniformFloat64(rng);
      const px = exp - exponent(x);
      const py = exp - 53 - exponent(y);
      const hi = sign * ldexp(x, px);
      const lo = losign * ldexp(y, py);
      return normalize(hi, lo);
    } as Rand2Fn<T>;
  }
  return function (): TwoF64 {
    const losign = uniformFloat64(rng) >= 0.5 ? 1 : -1;
    const hi = uniformFloat64(rng);
    const x = uniformFloat64(rng);
    const px = exponent(hi) - 53 - exponent(x);
    const lo = losign * ldexp(x, px);
    return normalize(hi, lo);
  } as Rand2Fn<T>;
}

/**
 * In-place array shufling (Durstenfeld)
 */
export function shuffle<T>(rng: RandomGenerator, arr: Array<T>): Array<T> {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(uniformFloat64(rng) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

/**
 * Creates an empty argsList object (ie. with signature keys mapped to an empty
 * array) given `fnBySig`.
 */
export function initArgsList<T extends ArgsListBySig>(fnBySig: FnBySigOpt): Expand<T> {
  return Object.fromEntries(Object.keys(fnBySig).map(op => [op, []])) as Expand<T>;
}

/**
 * Produce the list of outputs keyed by function name given `fnBySig` and
 * `argsList`. A `processArgsFn` callback can be used to alter the arguments
 * for some specific function(s), in which case it needs to be replicated on
 * the julia side via "process_args".
 */
export function collectOutputs<T extends FnOutputList>(fnBySig: FnBySigOpt, argsList: ArgsListBySig, processArgsFn?: Function): Expand<T> {
  const fnOutput = {} as FnOutputList;

  for (const sid in fnBySig) {
    const fnGroup = fnBySig[sid as keyof FnBySigOpt];
    const argsGroup = argsList[sid as keyof FnBySigOpt]!;

    for (const fnName in fnGroup) {
      fnOutput[fnName] = [];
      const fn = fnGroup[fnName];
      const fnOut = fnOutput[fnName];

      if (processArgsFn) {
        const processArgs = processArgsFn(fnName);
        for (const args of argsGroup) {
          const _args = processArgs(...args) as typeof args;
          // @ts-ignore
          const result = fn(..._args);
          fnOut.push(result);
        }
      }
      else {
        for (const args of argsGroup) {
          // @ts-ignore
          const result = fn(...args);
          fnOut.push(result);
        }
      }
    }
  }

  return fnOutput as Expand<T>;
}
