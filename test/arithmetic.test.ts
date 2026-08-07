/**
 * @file Tests - Basic arithmetic functions
 */

import {
  TwoF64,
  twoSum,
  twoDiff,
  fast2Sum,
  fast2Diff,
  neg,
  ONE,
  normalize,
  add,
  sub,
  mul,
  twoProd,
  div,
  inv
} from '../src/index';

import {
  DWPlusFP,
  DWMinusFP,
  AccurateDWPlusDW,
  AccurateDWMinusDW,
  DWDivDW2,
  DWInv,
  twoDiv,
  twoInv,
  DWDivFP3,
  DWTimesFP1,
  DWTimesDW1,
} from '../src/base/algorithms';

import {
  randomFn,
  pairsInRange,
  signCombinations
} from './utils';

// Pseudo-random number generator
const SEED = Math.sqrt(5);
const random = randomFn(SEED, true);
const exponentPairs = pairsInRange(-100, 60, 7);

describe('Derived Algorithms', () => {
  test('twoDiff', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = random(e1, s1);
        const y = random(e2, s2);
        expect(twoDiff(x, y)).toEqual(twoSum(x, -y));
      }
    }
  });

  test('fast2Diff', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const a = random(e1, s1);
        const b = random(e2, s2);
        const [x, y] = Math.abs(a) >= Math.abs(b) ? [a, b] : [b, a];
        expect(fast2Diff(x, y)).toEqual(fast2Sum(x, -y));
      }
    }
  });

  test('DWMinusFP', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = normalize(random(e1, s1), random(e1 - 1, s1));
        const y = random(e2, s2);
        expect(DWMinusFP(x, y)).toEqual(DWPlusFP(x, -y));
      }
    }
  });

  test('AccurateDWMinusDW', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = normalize(random(e1, s1), random(e1 - 1, s1));
        const y = normalize(random(e2, s2), random(e2 - 1, s2));
        expect(AccurateDWMinusDW(x, y)).toEqual(AccurateDWPlusDW(x, neg(y)));
      }
    }
  });

  test('twoDiv', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = random(e1, s1);
        const y = random(e2, s2);
        expect(twoDiv(x, y)).toEqual(DWDivFP3([x, 0], y));
      }
    }
  });

  test('twoInv', () => {
    for (let exp = -100; exp <= 60; exp++) {
      const x = random(exp, 1);
      expect(twoInv(x)).toEqual(DWDivFP3(ONE, x));
      expect(twoInv(-x)).toEqual(DWDivFP3(neg(ONE), x));
    }
  });

  test('DWInv', () => {
    for (let exp = -100; exp <= 60; exp++) {
      const x = normalize(random(exp, 1), random(exp - 1, 1));
      const mx = neg(x);
      expect(DWInv(x)).toEqual(DWDivDW2(ONE, x));
      expect(DWInv(mx)).toEqual(DWDivDW2(neg(ONE), x));
    }
  });
});

// sum1, prod1

describe('Basic Arithmetic Functions', () => {

  test('Addition', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = random(e1, s1);
        const y = random(e2, s2);
        const xx = normalize(random(e1, s1), random(e1 - 1, s1));
        const yy = normalize(random(e2, s2), random(e2 - 1, s2));
        expect(add(x, y)).toEqual(twoSum(x, y));
        expect(add(x, yy)).toEqual(DWPlusFP(yy, x));
        expect(add(xx, y)).toEqual(DWPlusFP(xx, y));
        expect(add(xx, yy)).toEqual(AccurateDWPlusDW(xx, yy));
      }
    }
  });

  test('Subtraction', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = random(e1, s1);
        const y = random(e2, s2);
        const xx = normalize(random(e1, s1), random(e1 - 1, s1));
        const yy = normalize(random(e2, s2), random(e2 - 1, s2));
        expect(sub(x, y)).toEqual(twoDiff(x, y));
        expect(sub(x, yy)).toEqual(DWPlusFP(neg(yy), x));
        expect(sub(xx, y)).toEqual(DWMinusFP(xx, y));
        expect(sub(xx, yy)).toEqual(AccurateDWMinusDW(xx, yy));
      }
    }
  });

  test('Multiplication', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = random(e1, s1);
        const y = random(e2, s2);
        const xx = normalize(random(e1, s1), random(e1 - 1, s1));
        const yy = normalize(random(e2, s2), random(e2 - 1, s2));
        expect(mul(x, y)).toEqual(twoProd(x, y));
        expect(mul(x, yy)).toEqual(DWTimesFP1(yy, x));
        expect(mul(xx, y)).toEqual(DWTimesFP1(xx, y));
        expect(mul(xx, yy)).toEqual(DWTimesDW1(xx, yy));
      }
    }
  });

  test('Division', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = random(e1, s1);
        const y = random(e2, s2);
        const xx = normalize(random(e1, s1), random(e1 - 1, s1));
        const yy = normalize(random(e2, s2), random(e2 - 1, s2));
        expect(div(x, y)).toEqual(twoDiv(x, y));
        expect(div(x, yy)).toEqual(DWDivDW2([x, 0], yy));
        expect(div(xx, y)).toEqual(DWDivFP3(xx, y));
        expect(div(xx, yy)).toEqual(DWDivDW2(xx, yy));
        expect(inv(y)).toEqual(DWDivFP3([1, 0], y));
        expect(inv(yy)).toEqual(DWDivDW2([1, 0], yy));
      }
    }
  });
});
