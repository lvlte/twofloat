/**
 * Pre-test for the main algorithms
 *
 * Generates inputs and collect outputs for each algorithm then export the whole
 * as JSON so we can import it and do proper tests in Julia using BigFloat.
 */

import {
  f64,
  TwoF64,
  normalize as _normalize,
  split,
  twoSum,
  twoProd,
} from '../src/index';

import { exponent } from '@lvlte/ulp';
import fs from 'node:fs';

import {
  DWPlusFP,
  AccurateDWPlusDW,
  DWTimesFP1,
  DWTimesDW1,
  DWDivFP3,
  DWDivDW2,
} from '../src/base/algorithms';

type Expand<T> = {} & { [P in keyof T]: Expand<T[P]> };

type _UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  (k: infer I) => void
) ? I : never;

type UnionToIntersection<U> = _UnionToIntersection<U> extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

interface FnSig {
  'op1': (x: f64) => TwoF64;
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
} satisfies {
  [K in keyof FnSig]: { [fnName: string]: FnSig[K] }
};

type FnBySig = typeof fnBySig;
type TestedFunctions = UnionToIntersection<FnBySig[keyof FnBySig]>;
type FnName = keyof TestedFunctions;

type ArgsListBySig = { [K in keyof FnBySig]: Parameters<FnSig[K]>[] };
type FnOutputList = { [K in FnName]: ReturnType<TestedFunctions[K]>[] }

// Pseudo-random number generator
const SEED = Math.sqrt(2);
const random = (function () {
  let n = SEED;
  return function(): number {
    return Math.abs(Math.sin(n++));
  }
})();

// Lists of arguments (grouped by FnSig) to pass to the TestedFunctions
const argsList: ArgsListBySig = {'op1': [], 'op11': [], 'op21': [], 'op22': []};

// Exponent range for the generated numbers
const [emin, emax] = [-128, 127];

// Fill argsList with number combinations in the domain [±2^emin, ±2^emax]
for (let e1 = emin; e1 <= emax; e1+=3) {
  for (let e2 = emin+1; e2 <= emax; e2+=3) {
    for (const [s1, s2] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const sw = random();
      const sx = random();
      const sy = random();
      const sz = random();

      const w = s1 * sw * 2**(e1 - exponent(sw));
      const x = s1 * sx * 2**(e1 - exponent(sx));
      const y = s2 * sy * 2**(e2 - exponent(sy));
      const z = s2 * sz * 2**(e2 - exponent(sz));

      const xy = normalize(x, y);
      const wz = normalize(w, z);

      argsList['op1'].push([z]);
      argsList['op11'].push([x, y]);
      argsList['op21'].push([xy, z]);
      argsList['op22'].push([xy, wz]);
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
fs.writeFileSync('test/algorithms-testset.json', testsetJSON, 'utf8');
