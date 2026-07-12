/**
 * @file Pre-test for math functions
 */

import {
  F64_SPLITTER, normalize, abs2, add11, gt21,
  square_1, square_2, cube_1, cube_2,
  exp_1, exp_2, expm1_1, expm1_2, powint_1, powint_2, pow_11, pow_12, pow_21, pow_22,
  _linpow_1, _logpow_1, _logpowltr, _linpow_2, _logpow_2,
  sqrt_1, sqrt_2, cbrt_1, cbrt_2, nthroot_1, nthroot_2,
  ln_1, ln_2, log2_1, log2_2, log10_1, log10_2,
  rem2pi_1, rem2pi_2, rempi_1, rempi_2,
  sin_1, sin_2, cos_1, cos_2, tan_1, tan_2, cot_1, cot_2, sec_1, csc_1, sec_2, csc_2,
  sinh_1, sinh_2, cosh_1, cosh_2, tanh_1, tanh_2, coth_1, coth_2, sech_1, sech_2, csch_1, csch_2,
  asin_1, asin_2, acos_1, acos_2, atan_1, atan_2,
} from '../../src/index';

import { FnSig, UnionToIntersection, Expand, randomFn } from '../utils';
import { exponent } from '@lvlte/ulp';
import fs from 'node:fs';

// Functions to test grouped by signature
const fnBySig = {
  'op1': {square_1, cube_1, sqrt_1, cbrt_1, ln_1, log2_1, log10_1, rempi_1, rem2pi_1,
          sin_1, cos_1, tan_1, cot_1, sec_1, csc_1, asin_1, acos_1, atan_1},
  'op2': {square_2, cube_2, sqrt_2, cbrt_2, ln_2, log2_2, log10_2, rempi_2, rem2pi_2,
          sin_2, cos_2, tan_2, cot_2, sec_2, csc_2, asin_2, acos_2, atan_2},
  'op1n': {_linpow_1, _logpow_1, _logpowltr, powint_1, nthroot_1},
  'op2n': {_linpow_2, _logpow_2, powint_2, nthroot_2},
  // e^x and functions defined in terms of e^x have a restricted domain so we
  // test them apart from op1/op2 group
  'exp1': {exp_1, expm1_1, sinh_1, cosh_1, tanh_1, coth_1, sech_1, csch_1},
  'exp2': {exp_2, expm1_2, sinh_2, cosh_2, tanh_2, coth_2, sech_2, csch_2},
  'op11': {pow_11},
  'op12': {pow_12},
  'op21': {pow_21},
  'op22': {pow_22}
} satisfies Partial<{
  [K in keyof FnSig]: { [fnName: string]: FnSig[K] }
}>;

type FnBySig = typeof fnBySig;
type TestedFunctions = UnionToIntersection<FnBySig[keyof FnBySig]>;
type FnName = keyof TestedFunctions;

type ArgsListBySig = { [K in keyof FnBySig]: Parameters<FnSig[K]>[] };
type FnOutputList = { [K in FnName]: ReturnType<TestedFunctions[K]>[] }
type FnArgs = { [K in FnName]: Parameters<TestedFunctions[K]> };

// Return the appropriate processArgs callback for the given function. The role
// of the callback is to make the function parameters fit its domain if needed.
function processArgsFn(fnName: FnName): Function {
  switch (fnName) {
    case 'sqrt_1':
    case 'ln_1':
    case 'log2_1':
    case 'log10_1':
    case 'pow_11':
    case 'pow_12':
      return (...args: FnArgs[typeof fnName]) => (args[0] = Math.abs(args[0]), args);

    case 'sqrt_2':
    case 'ln_2':
    case 'log2_2':
    case 'log10_2':
    case 'pow_21':
    case 'pow_22':
      return (...args: FnArgs[typeof fnName]) => (args[0] = abs2(args[0]), args);

    case '_linpow_1':
    case '_logpow_1':
    case '_logpowltr':
    case '_linpow_2':
    case '_logpow_2':
      return (...args: FnArgs[typeof fnName]) => (args[1] = Math.abs(args[1]), args);

    case 'nthroot_1':
      return (...args: FnArgs[typeof fnName]) => {
        const [x, n] = args;
        args[1] = Math.abs(n);
        if (x < 0 && n % 2 === 0) {
          args[0] = -x;
        }
        return args;
      }

    case 'nthroot_2':
      return (...args: FnArgs[typeof fnName]) => {
        const [[xhi, xlo], n] = args;
        args[1] = Math.abs(n);
        if (xhi < 0 && n % 2 === 0) {
          args[0] = [-xhi, -xlo];
        }
        return args;
      }

    case 'tanh_1':
    case 'coth_1':
      // f(x) = 1 + ε with |ε| < u² for |x| > 37.09
      return (...args: FnArgs[typeof fnName]) => (args[0] = args[0] % 37, args);

    case 'tanh_2':
    case 'coth_2':
      return (...args: FnArgs[typeof fnName]) => {
        const [xhi, xlo] = args[0];
        args[0] = add11(xhi % 37, xlo);
        return args;
      }

    case 'asin_1':
    case 'acos_1':
      return (...args: FnArgs[typeof fnName]) => {
        if (Math.abs(args[0]) > 1) {
          const e = exponent(args[0]);
          const p = 1 + e + (e % 2);
          args[0] = args[0] / 2**p;
        }
        return args;
      }

    case 'asin_2':
    case 'acos_2':
      return (...args: FnArgs[typeof fnName]) => {
        const [xhi, xlo] = args[0];
        if (gt21(abs2([xhi, xlo]), 1)) {
          const e = exponent(xhi);
          const p = 1 + e + (e % 2);
          args[0] = [xhi/2**p, xlo/2**p];
        }
        return args;
      }
  }

  return (...args: FnArgs[typeof fnName]) => args;
}

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
    const processArgs = processArgsFn(fnName as FnName);
    const fnOut = fnOutput[fnName as FnName];
    for (const args of argsGroup) {
      const _args = processArgs(...args) as typeof args;
      // @ts-ignore (TS doesn't understand correlated unions)
      const result = fn(..._args);
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
