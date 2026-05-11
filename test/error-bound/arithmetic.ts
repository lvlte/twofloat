/**
 * @file Pre-test for math functions
 */

import {
  f64,
  TwoF64,
  normalize,
  sum1,
  prod1,
  sum2,
  prod2,
} from '../../src/index';

import { exponent, FLOAT64_MIN } from '@lvlte/ulp';
import fs from 'node:fs';

import {
  FnSig,
  UnionToIntersection,
  Expand,
  randomFn,
} from '../utils';

// Functions to test grouped by signature
const fnBySig = {
  'opa1': {sum1, prod1},
  'opa2': {sum2, prod2},
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
function randWithin(min: number, max: number) {
  return (max - min) * (random(0, 1) - 1) + min;
}

// Lists of arguments (grouped by FnSig) to pass to the TestedFunctions
const argsList: ArgsListBySig = {'opa1': [], 'opa2': []};

// Fill argsList with number sequences of increasing length
for (let len = 3; len < 1e4; len = Math.floor(len*1.5)) {
  const emin = Math.max(-52, exponent(Math.pow(FLOAT64_MIN, 1/len))) - 0.25;
  const emax = Math.min(+52, exponent(Math.pow(Number.MAX_VALUE, 1/len))) - 0.25;
  const rmax = len < 100 ? 500 : len < 1000 ? 50 : 5;
  for (let r = 0; r < rmax; r++) {
    const list: f64[] = [];
    const list2: TwoF64[] = [];
    for (let i = 0; i < len; i++) {
      // randWithin(2**emin, 2**emax) yields sequences whose sum1 have no error
      const exp = randWithin(emin, emax);
      const sign = random(0, 1) - 1 > 0.4 ? 1 : -1;
      const x = random(exp, sign);
      const xx = normalize(x, random(exp - 53, sign));
      list.push(x);
      list2.push(xx);
    }
    argsList['opa1'].push([list]);
    argsList['opa2'].push([list2]);
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
fs.writeFileSync('test/error-bound/testset/arithmetic.json', testsetJSON, 'utf8');

console.log('prerun arithmetic.ts done');
