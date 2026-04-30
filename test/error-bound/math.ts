/**
 * @file Pre-test for math functions
 */

import {
  F64_SPLITTER,
  normalize as _normalize,
  abs2,
  square1,
  square2,
  cube1,
  cube2,
  pow1int,
  sqrt1 as _sqrt1,
  sqrt2 as _sqrt2,
  add11,
} from '../../src/index';

import { exponent } from '@lvlte/ulp';
import fs from 'node:fs';

import {
  FnSig,
  UnionToIntersection,
  Expand,
  randomFn,
} from '../utils';

// Wrap sqrt functions so that they are tested with positive values only
const sqrt1: typeof _sqrt1 = x => _sqrt1(Math.abs(x));
const sqrt2: typeof _sqrt2 = x => _sqrt2(abs2(x));

// Functions to test grouped by signature
const fnBySig = {
  'op1': {square1, cube1, sqrt1},
  'op2': {square2, cube2, sqrt2},
  // 'op1n': {pow1int},
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
  'op1': [], 'op2': [], // 'op1n': []
};

// split is not immune to overflow
const E_SPLIT_MAX = exponent(Number.MAX_VALUE/F64_SPLITTER);
const emin = -106;
const emax = 53;

for (let e1 = emin; e1 <= emax; e1++) {
  for (const sign of [1, -1]) {
    for (let r = 0; r < 50; r++) {
      const x = random(e1, sign);
      const y = random(e1, sign);
      const xy = add11(x, y);

      if ([x, y, ...xy].some(v => !Number.isFinite(v))) {
        continue;
      }

      argsList['op1'].push([x]);
      argsList['op2'].push([xy]);
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
fs.writeFileSync('test/error-bound/math-testset.json', testsetJSON, 'utf8');
