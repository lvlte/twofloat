/**
 * @file Tests - Basic arithmetic functions
 */

import {
  TwoF64,
  twoSum,
  twoDiff,
  fast2Sum,
  fast2Diff,
  neg2,
  ONE2
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
} from '../src/base/algorithms';

import {
  randomFn,
  pairsInRange,
  signCombinations
} from './utils';

// Pseudo-random number generator
const SEED = Math.sqrt(5);
const random = randomFn(SEED, true);

describe('Derived Algorithms', () => {
  const exponentPairs = pairsInRange(-100, 60, 7);

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
        const x = twoSum(random(e1, s1), random(e1, s1));
        const y = random(e2, s2);
        expect(DWMinusFP(x, y)).toEqual(DWPlusFP(x, -y));
      }
    }
  });

  test('AccurateDWMinusDW', () => {
    for (const [e1, e2] of exponentPairs) {
      for (const [s1, s2] of signCombinations) {
        const x = twoSum(random(e1, s1), random(e1, s1));
        const y = twoSum(random(e2, s2), random(e2, s2));
        expect(AccurateDWMinusDW(x, y)).toEqual(AccurateDWPlusDW(x, neg2(y)));
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
      expect(twoInv(x)).toEqual(DWDivFP3(ONE2, x));
      expect(twoInv(-x)).toEqual(DWDivFP3(neg2(ONE2), x));
      expect(twoInv(-x)).toEqual(DWDivFP3(ONE2, -x));
    }
  });

  test('DWInv', () => {
    for (let exp = -100; exp <= 60; exp++) {
      const x = twoSum(random(exp, 1), random(exp, 1));
      const mx = neg2(x);
      expect(DWInv(x)).toEqual(DWDivDW2(ONE2, x));
      expect(DWInv(mx)).toEqual(DWDivDW2(neg2(ONE2), x));
      expect(DWInv(mx)).toEqual(DWDivDW2(ONE2, mx));
    }
  });
});
