/**
 * @file Test utils
 */

import { exponent } from '@lvlte/ulp';
import { f64, F64_SPLITTER, int, TwoF64 } from '../src';

type _UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  (k: infer I) => void
) ? I : never;

export type UnionToIntersection<U> = _UnionToIntersection<U> extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type Expand<T> = {} & T extends TwoF64 ? T : { [P in keyof T]: Expand<T[P]> };

type RandomFnDefault = () => number;
type RandomFnWithDomainOpt = (exp: number, sign: number) => number;
type RandomFn<T extends boolean> = T extends false
  ? RandomFnDefault
  : T extends true
    ? RandomFnWithDomainOpt
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
