/**
 * @file Pre-test for trigonometric and hyperbolic functions and their inverses
 */

import {
  abs2, add11, gt21,
  sin_1, sin_2, tan_1, tan_2, sec_1, sec_2,
  cos_1, cos_2, cot_1, cot_2, csc_1, csc_2,
  sinh_1, sinh_2, tanh_1, tanh_2, sech_1, sech_2,
  cosh_1, cosh_2, coth_1, coth_2, csch_1, csch_2,
  asin_1, asin_2, atan_1, atan_2, asec_1, asec_2,
  acos_1, acos_2, acot_1, acot_2, acsc_1, acsc_2,
  asinh_1, asinh_2,
  lt21,
} from '../../src/index';

import {
  FnSig, UnionToIntersection, randomFn, collectOutputs, initArgsList, FnBySigOpt,
  ldexp,
  ldexp2,
  // ldexp,
} from '../utils';

import { exponent } from '@lvlte/ulp';
import fs from 'node:fs';

// Functions to test grouped by signature
const fnBySig = {
  'op1': {sin_1, cos_1, tan_1, cot_1, sec_1, csc_1,
          asin_1, acos_1, atan_1, acot_1, asec_1, acsc_1,
          asinh_1},
  'op2': {sin_2, cos_2, tan_2, cot_2, sec_2, csc_2,
          asin_2, acos_2, atan_2, acot_2, asec_2, acsc_2,
          asinh_2},
  // functions defined in terms of e^x are tested apart from op1/op2 group
  'exp1': {sinh_1, cosh_1, tanh_1, coth_1, sech_1, csch_1},
  'exp2': {sinh_2, cosh_2, tanh_2, coth_2, sech_2, csch_2},
} satisfies FnBySigOpt;

type FnBySig = typeof fnBySig;
type TestedFunctions = UnionToIntersection<FnBySig[keyof FnBySig]>;
type FnName = keyof TestedFunctions;
type ArgsListBySig = { [K in keyof FnBySig]: Parameters<FnSig[K]>[] };
type FnOutputList = { [K in FnName]: ReturnType<TestedFunctions[K]>[] };
type FnArgs = { [K in FnName]: Parameters<TestedFunctions[K]> };

/**
 * Return the appropriate processArgs callback for the given function. The role
 * of the callback is to make the function parameters fit its domain if needed.
 */
function processArgsFn(fnName: FnName): Function {
  switch (fnName) {
    case 'asin_1':
    case 'acos_1':
      return (...args: FnArgs[typeof fnName]) => {
        if (Math.abs(args[0]) > 1) {
          const e = exponent(args[0]);
          args[0] = ldexp(args[0], -(1 + e + (e % 2)));
        }
        return args;
      }

    case 'asin_2':
    case 'acos_2':
      return (...args: FnArgs[typeof fnName]) => {
        const x = args[0];
        if (gt21(abs2(x), 1)) {
          const e = exponent(x[0]);
          args[0] = ldexp2(x, -(1 + e + (e % 2)));
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

    case 'asec_1':
    case 'acsc_1':
      return (...args: FnArgs[typeof fnName]) => {
        if (Math.abs(args[0]) < 1) {
          args[0] = ldexp(args[0], -exponent(args[0]));
        }
        return args;
      }

    case 'asec_2':
    case 'acsc_2':
      return (...args: FnArgs[typeof fnName]) => {
        const x = args[0];
        if (lt21(abs2(x), 1)) {
          args[0] = ldexp2(x, -exponent(x[0]));
        }
        return args;
      }
  }

  return (...args: FnArgs[typeof fnName]) => args;
}

// Pseudo-random number generator
const SEED = Math.sqrt(2);
const random = randomFn(SEED, true);

// Lists of arguments (grouped by FnSig) to pass to the TestedFunctions
const argsList = initArgsList<ArgsListBySig>(fnBySig);

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
  }
}

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

const fnOutput = collectOutputs<FnOutputList>(fnBySig, argsList, processArgsFn);
const testset = { argsList, fnOutput };

// Export as JSON
const testsetJSON = JSON.stringify(testset);
fs.writeFileSync('test/error-bound/testset/trig-hyp.json', testsetJSON, 'utf8');

console.log('prerun trig.ts done');
