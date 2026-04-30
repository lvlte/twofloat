/**
 * @file Pre-test for the well known EFTs and algorithms
 *
 * Generates inputs and collect outputs for each algorithm then export the whole
 * as JSON so we can import it and do proper tests in Julia using BigFloat.
 *
 * Derived algorithms that are just specialization of those ones are tested
 * separately).
 */

import {
  f64,
  TwoF64,
  F64_SPLITTER,
  normalize as _normalize,
  split,
  twoSum,
  twoProd,
} from '../../src/index';

import { exponent, FLOAT64_MIN } from '@lvlte/ulp';
import fs from 'node:fs';

import {
  DWPlusFP,
  AccurateDWPlusDW,
  DWTimesFP1,
  DWTimesDW1,
  DWDivFP3,
  DWDivDW2,
} from '../../src/base/algorithms';

import {
  UnionToIntersection,
  Expand,
  randomFn,
  pairsInRange,
  signCombinations
} from '../utils';

interface FnSig {
  'op1': (x: f64) => TwoF64;
  'op2': (x: TwoF64) => TwoF64;
  'op11': (x: f64, y: f64) => TwoF64;
  'op21': (x: TwoF64, y: f64) => TwoF64;
  'op22': (x: TwoF64, y: TwoF64) => TwoF64;
}

// Wrap normalize so it is tested with the |x| ≥ |y| condition satisfied
const normalize: typeof _normalize = (x, y) => {
  return Math.abs(x) >= Math.abs(y) ? _normalize(x, y) : _normalize(y, x);
};

// Functions to test grouped by signature
const fnBySig = {
  'op1': {split},
  'op11': {normalize, twoSum, twoProd},
  'op21': {DWPlusFP, DWTimesFP1, DWDivFP3},
  'op22': {AccurateDWPlusDW, DWTimesDW1, DWDivDW2},
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

// Lists of arguments (grouped by FnSig) to pass to the TestedFunctions
const argsList: ArgsListBySig = {
  'op1': [], 'op11': [], 'op21': [], 'op22': []
};

// split is not immune to overflow
const E_SPLIT_MAX = exponent(Number.MAX_VALUE/F64_SPLITTER);

// Exponent range for the generated numbers (roughly the largest window for
// which the error bounds can be checked properly since they assume no overflow
// /underflow occurs during calculations).
const e_shift = 0; // decrease to shift the window towards subnormals
const emin = Math.floor(exponent(FLOAT64_MIN)/2) + e_shift;
const emax = Math.min(0, emin) + E_SPLIT_MAX;

// Fill argsList with number combinations in the domain [±2^emin, ±2^emax]
for (const [e1, e2] of pairsInRange(emin, emax, 3)) {
  for (const [s1, s2] of signCombinations) {
    const w = random(e1, s1);
    const x = random(e1, s1);
    const y = random(e2, s2);
    const z = random(e2, s2);

    const wx = normalize(w, x);
    const yz = normalize(y, z);

    if ([w, x, y, z, ...wx, ...yz].some(v => !Number.isFinite(v))) {
      continue;
    }

    argsList['op1'].push([x]);
    argsList['op11'].push([x, y]);
    argsList['op21'].push([wx, z]);
    argsList['op22'].push([wx, yz]);
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
fs.writeFileSync('test/error-bound/algorithms-testset.json', testsetJSON, 'utf8');
