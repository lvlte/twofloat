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
  F64_SPLITTER,
  sub12,
  div12,
} from '../../src/index';

import { exponent, FLOAT64_MIN } from '@lvlte/ulp';
import fs from 'node:fs';

import {
  FnSig,
  UnionToIntersection,
  Expand,
  randomFn,
  pairsInRange,
  signCombinations,
} from '../utils';

// Functions to test grouped by signature
const fnBySig = {
  'opa1': {sum1, prod1},
  'opa2': {sum2, prod2},
  'op12': {sub12, div12},
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
const argsList: ArgsListBySig = {'opa1': [], 'opa2': [], 'op12': []};

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

const E_SPLIT_MAX = exponent(Number.MAX_VALUE/F64_SPLITTER);
const e_shift = 0; // decrease to shift the window towards subnormals
const emin = Math.floor(exponent(FLOAT64_MIN)/2) + e_shift;
const emax = Math.min(0, emin) + E_SPLIT_MAX;

// Fill argsList with number combinations in the domain [±2^emin, ±2^emax]
for (const [e1, e2] of pairsInRange(emin, emax, 5)) {
  for (const [s1, s2] of signCombinations) {
    const x = random(e1, s1);
    const y = random(e2, s2);
    const z = random(e2 - 52, s2);
    const yz = normalize(y, z);

    if ([x, y, z, ...yz].some(v => !Number.isFinite(v))) {
      continue;
    }

    argsList['op12'].push([x, yz]);
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
