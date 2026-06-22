/**
 * @file Pre-test for math functions
 */

import {
  F64_SPLITTER,
  normalize,
  abs2,
  square1,
  square2,
  cube1,
  cube2,
  _linpow as __linpow,
  _logpow as __logpow,
  _logpowltr as __logpowltr,
  _linpow2 as __linpow2,
  _logpow2 as __logpow2,
  sqrt1 as _sqrt1,
  sqrt2 as _sqrt2,
  add11,
  exp1,
  exp2,
  ln1 as _ln1,
  ln2 as _ln2,
  log2_1 as _log2_1,
  log2_2 as _log2_2,
  log10_1 as _log10_1,
  log10_2 as _log10_2,
  pow1int,
  pow2int,
  pow11 as _pow11,
  pow12 as _pow12,
  pow21 as _pow21,
  pow22 as _pow22,
  rem2pi_1,
  rem2pi_2,
  sin1,
  sin2
} from '../../src/index';

import { exponent } from '@lvlte/ulp';
import fs from 'node:fs';

import {
  FnSig,
  UnionToIntersection,
  Expand,
  randomFn,
} from '../utils';

// Wrap some functions so that they are tested with inputs that fit their domain
const sqrt1: typeof _sqrt1 = x => _sqrt1(Math.abs(x));
const sqrt2: typeof _sqrt2 = x => _sqrt2(abs2(x));
const ln1: typeof _ln1 = x => _ln1(Math.abs(x));
const ln2: typeof _ln2 = x => _ln2(abs2(x));
const log2_1: typeof _log2_1 = x => _log2_1(Math.abs(x));
const log2_2: typeof _log2_2 = x => _log2_2(abs2(x));
const log10_1: typeof _log10_1 = x => _log10_1(Math.abs(x));
const log10_2: typeof _log10_2 = x => _log10_2(abs2(x));
const _linpow: typeof __linpow = (x, n) => __linpow(x, Math.abs(n));
const _logpow: typeof __logpow = (x, n) => __logpow(x, Math.abs(n));
const _logpowltr: typeof __logpowltr = (x, n) => __logpowltr(x, Math.abs(n));
const _linpow2: typeof __linpow2 = (x, n) => __linpow2(x, Math.abs(n));
const _logpow2: typeof __logpow2 = (x, n) => __logpow2(x, Math.abs(n));
const pow11: typeof _pow11 = (x, p) => _pow11(Math.abs(x), p);
const pow12: typeof _pow12 = (x, p) => _pow12(Math.abs(x), p);
const pow21: typeof _pow21 = (x, p) => _pow21(abs2(x), p);
const pow22: typeof _pow22 = (x, p) => _pow22(abs2(x), p);

// Functions to test grouped by signature
const fnBySig = {
  'op1': {square1, cube1, sqrt1, ln1, log2_1, log10_1, rem2pi_1, sin1},
  'op2': {square2, cube2, sqrt2, ln2, log2_2, log10_2, rem2pi_2, sin2},
  'op1n': {_linpow, _logpow, _logpowltr, pow1int},
  'op2n': {_linpow2, _logpow2, pow2int},
  'exp1': {exp1},
  'exp2': {exp2},
  'op11': {pow11},
  'op12': {pow12},
  'op21': {pow21},
  'op22': {pow22}
} satisfies Partial<{
  [K in keyof FnSig]: { [fnName: string]: FnSig[K] }
}>;

type FnBySig = typeof fnBySig;
type TestedFunctions = UnionToIntersection<FnBySig[keyof FnBySig]>;
type FnName = keyof TestedFunctions;

type ArgsListBySig = { [K in keyof FnBySig]: Parameters<FnSig[K]>[] };
type FnOutputList = { [K in FnName]: ReturnType<TestedFunctions[K]>[] }

// Pseudo-random number generator
const SEED = Math.sqrt(2);
const random = randomFn(SEED, true);
const rand = randomFn(SEED, false);

// Lists of arguments (grouped by FnSig) to pass to the TestedFunctions
const argsList: ArgsListBySig = {
  'op1': [], 'op2': [], 'op1n': [], 'op2n': [], 'exp1': [], 'exp2': [],
  'op11': [], 'op12': [], 'op21': [], 'op22': []
};

// split is not immune to overflow
const E_SPLIT_MAX = exponent(Number.MAX_VALUE/F64_SPLITTER);
const emin = -106;
const emax = 53;

for (let exp = emin; exp <= emax; exp++) {
  for (const sign of [1, -1]) {
    for (let r = 0; r < 100; r++) {
      const x = random(exp, sign);
      const y = random(exp - 52, sign);
      const xy = add11(x, y);

      if ([x, y, ...xy].some(v => !Number.isFinite(v))) {
        continue;
      }

      argsList['op1'].push([x]);
      argsList['op2'].push([xy]);
    }

    // power functions
    const exp_max = Math.min(Math.trunc(1022 / Math.abs(exp)), 1022);
    for (let n = 3; n <= exp_max;) {
      for (let r = 0; r < 10; r++) {
        const x = random(exp, sign);
        if (Number.isFinite(x**n) && Math.abs(exponent(x**n)) < E_SPLIT_MAX) {
          const xx = normalize(x, random(exp - 52, -1*sign));
          const exp_sign = r % 2 ? -1 : 1;
          const sn = exp_sign * n;
          const p = exp_sign * (n - rand());
          const pp = normalize(p, random(exponent(p) - 52, 1));
          argsList['op1n'].push([x, sn]);
          argsList['op2n'].push([xx, sn]);
          argsList['op11'].push([x, p]);
          argsList['op12'].push([x, pp]);
          argsList['op21'].push([xx, p]);
          argsList['op22'].push([xx, pp]);
        }
      }
      n = n > 50 ? Math.trunc(n * (1 + random(-2, 1))) : n + 1;
    }
  }
}

// e^x specific input range
// - e^-745.134 < Number.MIN_VALUE
// - e^+709.783 > Number.MAX_VALUE
const e_negx = Math.log2(-Math.log(Number.MIN_VALUE)) - 1;
const e_posx = Math.log2(+Math.log(Number.MAX_VALUE)) - 1;
for (const [sign, emax] of [[1, e_posx], [-1, e_negx]]) {
  const emaxint = Math.floor(emax);
  for (let exp = emin; exp <= emax; exp = exp == emaxint ? emax : exp+1) {
    for (let r = 0; r < 200; r++) {
      const x = random(exp, sign);
      const y = random(exp - 52, sign);
      const xy = add11(x, y);
      argsList['exp1'].push([x]);
      argsList['exp2'].push([xy]);
    }
  }
}

// Produce the list of outputs keyed by function given argsList
const fnOutput = {} as FnOutputList;
for (const sid in fnBySig) {
  const fnGroup = fnBySig[sid as keyof FnBySig];
  const argsGroup = argsList[sid as keyof FnBySig]
  for (const fnName in fnGroup) {
    fnOutput[fnName as FnName] = [];
    const fn = (fnGroup as TestedFunctions)[fnName as FnName];
    const fnOut = fnOutput[fnName as FnName]!;
    for (const args of argsGroup) {
      // @ts-ignore (TS doesn't understand correlated unions)
      const result = fn(...args);
      fnOut.push(result);
    }
  }
}

// Inputs/Outputs object
const testset = { argsList, fnOutput} as Expand<{
  argsList: ArgsListBySig, fnOutput: FnOutputList
}>;

// Export as JSON
const testsetJSON = JSON.stringify(testset);
fs.writeFileSync('test/error-bound/testset/math.json', testsetJSON, 'utf8');

console.log('prerun math.ts done');
