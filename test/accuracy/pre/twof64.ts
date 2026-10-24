/**
 * @file Pre-test for twof64 helpers
 */

import { xoroshiro128plus } from 'pure-rand/generator/xoroshiro128plus';
import { uniformBigInt } from 'pure-rand/distribution/uniformBigInt';
import {
  collectOutputs,
  initArgsList,
  randomSign,
  type FnBySigOpt,
  type FnSig,
  type UnionToIntersection,
} from '../../utils.js';

import { type TwoF64 } from '../../../src/index.js';
import { writeFileSync } from 'node:fs';
import { fromLiteral } from '../../../src/convert/from-literal.js';
import { twof64FromRational as fromRational, type Rational } from '../../../src/convert/from-rational.js';

const originalBigInt = BigInt;
const fromLiteralNoBigInt = (x: number): TwoF64 => {
  // @ts-expect-error mock env with no bigint
  delete globalThis.BigInt;
  const xx = fromLiteral(x);
  // eslint-disable-next-line unicorn/no-global-object-property-assignment
  globalThis.BigInt = originalBigInt;
  return xx;
};

// Functions to test grouped by signature
const fnBySig = {
  op1: { fromLiteral, fromLiteralNoBigInt },
  r: { fromRational },
} satisfies FnBySigOpt;

type FnBySig = typeof fnBySig;
type TestedFunctions = UnionToIntersection<FnBySig[keyof FnBySig]>;
type FnName = keyof TestedFunctions;
type ArgsListBySig = {[K in keyof FnBySig]: Array<Parameters<FnSig[K]>> };
type FnOutputList = {[K in FnName]: Array<ReturnType<TestedFunctions[K]>> };

const rng = xoroshiro128plus(45678);

/**
 * Generate a random positive bigint `n` of decimal precision `p`, that is, in
 * the range `[10^(p - 1), 10^p - 1]`.
 *
 * @returns `[n, str]` where `str` corresponds to the exponential notation
 * string of `n` but *without* the exponent part.
 */
function randint(p: bigint): [bigint, string] {
  const range: [bigint, bigint] = [10n**(p - 1n), 10n**p - 1n];
  const n = uniformBigInt(rng, ...range);
  const r = n % range[0];
  const n0 = (n - r) / range[0];

  if (r === 0n) {
    return [n, n0.toString()];
  }

  const nfstr = r.toString().padStart(Number(p) - 1, '0');
  const nstr = `${n0}.${nfstr.replace(/0$/, '')}`;

  return [n, nstr];
}

/**
 * Helper to generate various f64 numbers to be used as literal
 */
function f64Literal(precision: bigint, exp: bigint) {
  const [n, nstr] = randint(precision);
  const xabs = +`${n}e-${exp}`;
  const xstr = xabs.toExponential().slice(0, nstr.length);

  if (xstr !== nstr) {
    // There is no f64 number that has a literal representation matching `${p}e-${exp}`
    return false;
  }

  const sign = randomSign();
  const x = sign*xabs;

  return x;
}

const argsList = initArgsList<ArgsListBySig>(fnBySig);

// Generate and add numbers to argsList
for (let precision = 1n; precision < 18n; precision++) {
  const emax = precision + 25n;
  for (let exp = 0n; exp <= emax; exp++) {
    for (let i = 0; i < 50; i++) {
      const x = f64Literal(precision, exp);
      if (x !== false) {
        argsList['op1'].push([x]);
      }
    }
  }

  for (let i = 0; i < 1e3; i++) {
    const exp = uniformBigInt(rng, 0n, 100n);
    const x = f64Literal(precision, exp);
    if (x !== false) {
      argsList['op1'].push([x]);
    }
  }
}

// Higher precision rational
const from = 10n**18n;
const to = BigInt(Number.MAX_VALUE);
for (let i = 0; i < 5e4; i++) {
  const p = uniformBigInt(rng, from, to);
  const q = uniformBigInt(rng, from, to);
  const sign = BigInt(randomSign());
  const r: Rational = [sign*p, q];
  argsList['r'].push([r]);
}

// Produce the list of outputs keyed by function
const fnOutput = collectOutputs<FnOutputList>(fnBySig, argsList);
const testset = { argsList, fnOutput };

// Convert bigints to strings before serialization
argsList['r'] = argsList['r'].map(([[p, q]]) => [[p.toString(), q.toString()]] as unknown as [Rational]);

// Export as JSON
const testsetJSON = JSON.stringify(testset);
writeFileSync('test/accuracy/pre/output/twof64.json', testsetJSON, 'utf8');

console.log('prerun twof64.ts done');
