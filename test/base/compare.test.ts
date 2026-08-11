/**
 * @file Tests - Comparison functions (equality/ordering/is* predicates)
 */

import { randomFn } from "../utils";
import { nextFloat, prevFloat } from "@lvlte/ulp";
import {
  type TwoF64,
  eq, lt, le, gt, ge, neg,
  isZero, isOne, isFinite2, isInteger2, isSafeInteger2, isSafeTwoInteger, isNaN2,
  ZERO, ONE, INF, NINF, NaN2, PI,
  isInfinite2,
  normalize,
} from '../../src';

// Pseudo-random number generator
const SEED = Math.sqrt(7);
const random = randomFn(SEED, true);
const exponents = [-80, -53, 0, 52, 76];

describe('Comparison functions', () => {

  test('Equality', () => {
    for (const e of exponents) {
      for (const s of [1, -1]) {
        const x = random(e, s);
        const w = prevFloat(x);
        const y = nextFloat(x);
        const x2: TwoF64 = [x, 0];
        const y2: TwoF64 = [y, random(e - 53, s)];
        const w2: TwoF64 = [w, random(e - 53, -s)];

        for (const fn of [eq, le, ge]) {
          expect(fn(x, x2)).toBe(true);
          expect(fn(x2, x)).toBe(true);
          expect(fn(w2, w2)).toBe(true);
          expect(fn(x2, x2)).toBe(true);
          expect(fn(y2, y2)).toBe(true);
        }

        const w2p: TwoF64 = [w, nextFloat(w2[1])];
        const x2p: TwoF64 = [x, nextFloat(x2[1])];
        const y2p: TwoF64 = [y, nextFloat(y2[1])];

        const unequals = [
          // different hi
          [w, x2], [w, y2], [x, w2], [x, y2], [y, w2], [y, x2],
          [w2, x2], [w2, y2], [x2, y2],
          // same hi / different lo
          [w2, w2p], [x2, x2p], [y2, y2p]
        ];

        for (const [a, b] of unequals) {
          expect(eq(a, b)).toBe(false);
          expect(eq(b, a)).toBe(false);
        }
      }
    }
  });

  test('Ordering', () => {
    for (const e of exponents) {
      for (const s of [1, -1]) {
        // w < x < y
        const x = random(e, s);
        const w = prevFloat(x);
        const y = nextFloat(x);

        // w2 < x2 < y2
        const x2: TwoF64 = [x, 0];                  // x == x2
        const y2: TwoF64 = [y, random(e - 53, s)];  // y < y2 if s > 0
        const w2: TwoF64 = [w, random(e - 53, -s)]; // w < w2 if s < 0

        const w2p: TwoF64 = [w, nextFloat(w2[1])]; // w < w2p
        const x2p: TwoF64 = [x, nextFloat(x2[1])]; // x < x2p
        const y2p: TwoF64 = [y, nextFloat(y2[1])]; // y < y2p

        const lessThan = [
          // different hi
          [w, x2], [w2, x], [w2, x2],
          [w, y2], [w2, y], [w2, y2],
          [x, y2], [x2, y], [x2, y2],
          // same hi / different lo
          [w2, w2p], [x2, x2p], [y2, y2p],
          ...(s > 0 ? [[w2, w], [y, y2]] : [[w, w2], [y2, y]])
        ];

        for (const [a, b] of lessThan) {
          expect(lt(a, b)).toBe(true);
          expect(le(a, b)).toBe(true);
          expect(gt(b, a)).toBe(true);
          expect(ge(b, a)).toBe(true);
          expect(lt(b, a)).toBe(false);
          expect(le(b, a)).toBe(false);
          expect(gt(a, b)).toBe(false);
          expect(ge(a, b)).toBe(false);
        }

        for (const fn of [lt, gt]) {
          expect(fn(x, x2)).toBe(false);
          expect(fn(x2, x)).toBe(false);
          expect(fn(w2, w2)).toBe(false);
          expect(fn(x2, x2)).toBe(false);
          expect(fn(y2, y2)).toBe(false);
        }
      }
    }
  });

  test('Other predicates', () => {
    expect(isZero(ZERO)).toBe(true);
    expect(isZero(neg(ZERO))).toBe(true);
    expect(isZero([nextFloat(0), 0])).toBe(false);

    expect(isOne(ONE)).toBe(true);
    expect(isOne([1, nextFloat(0)])).toBe(false);

    expect(isFinite2(ONE)).toBe(true);
    expect(isFinite2([prevFloat(Infinity), 2**969])).toBe(true);
    expect(isFinite2(INF)).toBe(false);
    expect(isFinite2(NINF)).toBe(false);
    expect(isFinite2(NaN2)).toBe(false);

    expect(isInteger2(ONE)).toBe(true);
    expect(isInteger2([2**53, 1])).toBe(true);
    expect(isInteger2([prevFloat(Infinity), 123456])).toBe(true);
    expect(isInteger2(PI)).toBe(false);
    expect(isInteger2([2**53, 0.5])).toBe(false);

    expect(isSafeInteger2(ONE)).toBe(true);
    expect(isSafeInteger2(PI)).toBe(false);
    expect(isSafeInteger2([2**53 - 1, 0])).toBe(true);
    expect(isSafeInteger2([2**53, 0])).toBe(false);

    expect(isSafeTwoInteger(ONE)).toBe(true);
    expect(isSafeTwoInteger([1e23, 1])).toBe(true);
    expect(isSafeTwoInteger([prevFloat(Infinity), 2**53 - 1])).toBe(true);
    expect(isSafeTwoInteger([prevFloat(Infinity), 2**53])).toBe(false);
    expect(isSafeTwoInteger([2**52, 0.5])).toBe(false);
    expect(isSafeTwoInteger(PI)).toBe(false);

    expect(isNaN2(NaN2)).toBe(true);
    expect(isNaN2(INF)).toBe(false);
    expect(isNaN2(normalize(...INF))).toBe(false);
    expect(isNaN2(PI)).toBe(false);

    expect(isInfinite2(INF)).toBe(true);
    expect(isInfinite2(NINF)).toBe(true);
    expect(isInfinite2(normalize(...INF))).toBe(true);
    expect(isInfinite2(ONE)).toBe(false);
    expect(isInfinite2(NaN2)).toBe(false);
    expect(isInfinite2([prevFloat(Infinity), 2**969])).toBe(false);

    // malformed numbers
    expect(isZero([0, nextFloat(0)])).toBe(false);
    expect(isZero([0, NaN])).toBe(false);
    expect(isOne([1, NaN])).toBe(false);
    expect(isFinite2(['1', '0'] as unknown as TwoF64)).toBe(false); // no coercion
    expect(isFinite2([42, NaN])).toBe(false);
    expect(isInteger2([42, NaN])).toBe(false);
    expect(isSafeInteger2([42, NaN])).toBe(false);
    expect(isSafeInteger2([2**53, -1])).toBe(false); // non-canonical
    expect(isNaN2([1, NaN])).toBe(true);
    expect(isNaN2([NaN, 0])).toBe(true);
    expect(isNaN2([null, undefined] as unknown as TwoF64)).toBe(true); // coercion
  });
});
