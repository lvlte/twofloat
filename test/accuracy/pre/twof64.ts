/**
 * @file Pre-test for twof64 helpers
 */

import { xoroshiro128plus } from 'pure-rand/generator/xoroshiro128plus';
import { uniformBigInt } from 'pure-rand/distribution/uniformBigInt';
import { uniformInt } from 'pure-rand/distribution/uniformInt';
import {
  collectOutputs,
  initArgsList,
  randomSign,
  type FnBySigOpt,
  type FnSig,
  type UnionToIntersection,
} from '../../utils.js';

import { writeFileSync } from 'node:fs';
import { type TwoF64, twof64 } from '../../../src/index.js';
import { type Rational } from '../../../src/convert/from-rational.js';

const { fromLiteral, fromRational, fromString } = twof64;

const originalBigInt = BigInt;
const fromLiteralNoBigInt = (x: number): TwoF64 => {
  // @ts-expect-error mock env with no bigint
  delete globalThis.BigInt;
  const xx = fromLiteral(x);
  // eslint-disable-next-line unicorn/no-global-object-property-assignment
  globalThis.BigInt = originalBigInt;
  return xx;
};

const fromStringNoBigInt = (x: string): TwoF64 => {
  // @ts-expect-error mock env with no bigint
  delete globalThis.BigInt;
  const xx = fromString(x);
  // eslint-disable-next-line unicorn/no-global-object-property-assignment
  globalThis.BigInt = originalBigInt;
  return xx;
};

// Functions to test grouped by signature
const fnBySig = {
  op1: { fromLiteral, fromLiteralNoBigInt },
  str: { fromString, fromStringNoBigInt },
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

  // eslint-disable-next-line regexp/no-super-linear-move
  const nfstr = r.toString().padStart(Number(p) - 1, '0').replace(/0+$/, '');
  const nstr = `${n0}.${nfstr}`;

  return [n, nstr];
}

/**
 * Helper to generate various f64 numbers to be used as literal
 */
function f64Literal(precision: bigint, exp: number) {
  const [n, nstr] = randint(precision);
  const xabs = +`${n}e${exp}`;
  const xstr = xabs.toExponential().slice(0, nstr.length);

  if (xstr !== nstr) {
    // no f64 number has a literal representation matching +`${n}e${exp}`
    return false;
  }

  const sign = randomSign();
  const x = sign*xabs;

  return x;
}

const argsList = initArgsList<ArgsListBySig>(fnBySig);

// Generate and add numbers to argsList
for (let precision = 1n; precision < 18n; precision++) {
  let imax = 5*Number(precision);
  for (let exp = 0; exp < 70; exp++) {
    for (let i = 0; i < imax; i++) {
      const x = f64Literal(precision, randomSign(0.4)*exp);
      if (x === false) continue;
      argsList['op1'].push([x]);
    }
  }

  imax *= 5;
  for (let i = 0; i < imax; i++) {
    const exp = uniformInt(rng, 0, 200);
    const x = f64Literal(precision, randomSign()*exp);
    if (x === false) continue;
    argsList['op1'].push([x]);
  }
}

// Higher precision rational (rationals with smaller components are implicitly
// tested via fromLiteral/fromString)
const from = 10n**18n;
const to = BigInt(Number.MAX_VALUE);
for (let i = 0; i < 5e4; i++) {
  const p = uniformBigInt(rng, from, to);
  const q = uniformBigInt(rng, from, to);
  const sign = BigInt(randomSign());
  const r: Rational = [sign*p, q];
  argsList['r'].push([r]);
}

// Decimal strings
for (let precision = 1n; precision < 100n; precision++) {
  const [start, end] = [10n**(precision - 1n), 10n**precision - 1n];

  // simple strings
  let n = uniformBigInt(rng, start, end);
  let nstr = n.toString();
  argsList['str'].push([nstr], [`0.${nstr}`]);

  let sign = randomSign() < 0 ? '-' : '+';
  n = uniformBigInt(rng, start, end);
  nstr = n.toString();
  argsList['str'].push([`${sign}${nstr}`], [`${sign}0.${nstr}`]);

  // with zeroes
  for (let i = 0; i < 50; i++) {
    n = uniformBigInt(rng, start, end);
    nstr = n.toString();
    sign = randomSign() < 0 ? '-' : '';
    const lz = '0'.repeat(uniformInt(rng, 1, 1 + i*4));
    const tz = '0'.repeat(uniformInt(rng, 1, 1 + i*4));
    argsList['str'].push([`${sign}${nstr}${tz}`], [`${sign}0.${lz}${nstr}`]);
  }

  if (precision < 2n) continue;

  // exponential notation
  for (let i = 0; i < 150; i++) {
    n = uniformBigInt(rng, start, end);
    nstr = n.toString();
    nstr = `${nstr[0]}.${nstr.slice(1)}`;
    sign = randomSign() < 0 ? '-' : '';
    const exp = randomSign() * uniformInt(rng, 0, i);
    argsList['str'].push([`${sign}${nstr}e${exp}`]);
  }

  // significant ipart and fpart
  for (let i = 0; i < 150; i++) {
    n = uniformBigInt(rng, start, end);
    const m = 10n**uniformBigInt(rng, 1n, precision - 1n);
    const fpart = n % m;
    const ipart = n - fpart;
    sign = randomSign() < 0 ? '-' : '';
    const str = `${sign}${ipart}.${fpart}`;
    const exp = randomSign() * uniformInt(rng, 0, i);
    argsList['str'].push([str], [`${str}e${exp}`]);
  }
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
