/**
 * @file Tests basic math functions
 */

import { type Sign, rand2Fn, shuffle } from "../utils";
import { nextFloat, prevFloat } from "@lvlte/ulp";
import { xoroshiro128plus } from 'pure-rand/generator/xoroshiro128plus';
import {
  type TwoF64, INF, NINF, NaN2, ONE, PI, ZERO,
  abs, ceil, floor, max, min, neg, normalize, round, sign, trunc,
} from '../../src';

const rng = xoroshiro128plus(1234);
const rand2 = rand2Fn(rng, true);
const exponents = [-80, -53, 0, 52, 76];

describe('Basic math functions', () => {

  test('abs / neg', () => {
    expect(neg(ZERO)).toEqual([-0, 0]);
    expect(neg(ONE)).toEqual([-1, 0]);
    expect(neg([-0, 0])).toEqual(ZERO);
    expect(neg([-1, 0])).toEqual(ONE);

    expect(abs([-0, 0])).toEqual(ZERO);
    expect(abs([-1, 0])).toEqual(ONE);

    expect(neg(neg(PI))).toEqual(PI);
    expect(abs(neg(PI))).toEqual(PI);

    expect(neg(INF)).toEqual(NINF);
    expect(neg(NINF)).toEqual(INF);
    expect(abs(NINF)).toEqual(INF);

    expect(abs(NaN2)).toEqual(NaN2);
    expect(neg(NaN2)).toEqual(NaN2);

    for (const e of exponents) {
      for (const s of [1, -1] as const) {
        const [xhi, xlo] = rand2(e, s, s);
        const [yhi, ylo] = rand2(e, s, -s as Sign);
        expect(abs([xhi, xlo])).toEqual([s*xhi, s*xlo]);
        expect(abs([yhi, ylo])).toEqual([s*yhi, s*ylo]);
        expect(neg([xhi, xlo])).toEqual([-xhi, -xlo]);
        expect(neg([yhi, ylo])).toEqual([-yhi, -ylo]);
        expect(abs(neg([xhi, xlo]))).toEqual([s*xhi, s*xlo]);
        expect(abs(neg([yhi, ylo]))).toEqual([s*yhi, s*ylo]);
      }
    }
  });

  test('sign', () => {
    expect(sign(ZERO)).toEqual(ZERO);
    expect(sign(neg(ZERO))).toEqual(neg(ZERO));

    expect(sign(ONE)).toEqual(ONE);
    expect(sign(neg(ONE))).toEqual(neg(ONE));

    expect(sign(PI)).toEqual(ONE);
    expect(sign(neg(PI))).toEqual(neg(ONE));

    expect(sign(INF)).toEqual(ONE);
    expect(sign(NINF)).toEqual(neg(ONE));

    expect(sign(NaN2)).toEqual(NaN2);

    for (const e of exponents) {
      for (const s of [1, -1] as const) {
        const x: TwoF64 = rand2(e, s, s);
        const y: TwoF64 = rand2(e, s, -s as Sign);
        expect(sign(x)).toEqual([s*1, 0]);
        expect(sign(y)).toEqual([s*1, 0]);
      }
    }
  });

  test('trunc', () => {
    expect(trunc(ZERO)).toEqual(ZERO);
    expect(trunc(neg(ZERO))).toEqual(neg(ZERO));
    expect(trunc([nextFloat(0), 0])).toEqual(ZERO);
    expect(trunc([prevFloat(0), 0])).toEqual(neg(ZERO));

    expect(trunc(ONE)).toEqual(ONE);
    expect(trunc(neg(ONE))).toEqual(neg(ONE));
    expect(trunc([1, nextFloat(0)])).toEqual(ONE);
    expect(trunc([1, prevFloat(0)])).toEqual(ZERO);
    expect(trunc([-1, nextFloat(0)])).toEqual(neg(ZERO));
    expect(trunc([-1, prevFloat(0)])).toEqual(neg(ONE));

    expect(trunc(PI)).toEqual([3, 0]);
    expect(trunc(neg(PI))).toEqual([-3, 0]);

    // xhi safe int
    const [xhi, xlo] = [2**53 - 1, 0.5];
    expect(trunc([xhi, xlo])).toEqual([xhi, 0]);
    expect(trunc([xhi, -xlo])).toEqual([xhi - 1, 0]);
    expect(trunc([-xhi, xlo])).toEqual([-xhi + 1, 0]);
    expect(trunc([-xhi, -xlo])).toEqual([-xhi, 0]);

    // yhi unsafe int
    const [yhi, ylo] = [1e20, Math.PI];
    expect(trunc([yhi, ylo])).toEqual([yhi, 3]);
    expect(trunc([yhi, -ylo])).toEqual([yhi, -4]);
    expect(trunc([-yhi, ylo])).toEqual([-yhi, 4]);
    expect(trunc([-yhi, -ylo])).toEqual([-yhi, -3]);

    expect(trunc(INF)).toEqual(INF);
    expect(trunc(NINF)).toEqual(NINF);
    expect(trunc(NaN2)).toEqual(NaN2);
  });

  test('floor', () => {
    expect(floor(ZERO)).toEqual(ZERO);
    expect(floor(neg(ZERO))).toEqual(neg(ZERO));
    expect(floor([nextFloat(0), 0])).toEqual(ZERO);
    expect(floor([prevFloat(0), 0])).toEqual(neg(ONE));

    expect(floor(ONE)).toEqual(ONE);
    expect(floor(neg(ONE))).toEqual(neg(ONE));
    expect(floor([1, nextFloat(0)])).toEqual(ONE);
    expect(floor([1, prevFloat(0)])).toEqual(ZERO);
    expect(floor([-1, nextFloat(0)])).toEqual([-1, 0]);
    expect(floor([-1, prevFloat(0)])).toEqual([-2, 0]);

    expect(floor(PI)).toEqual([3, 0]);
    expect(floor(neg(PI))).toEqual([-4, 0]);

    // xhi safe int
    const [xhi, xlo] = [2**53 - 1, 0.5];
    expect(floor([xhi, xlo])).toEqual([xhi, 0]);
    expect(floor([xhi, -xlo])).toEqual([xhi - 1, 0]);
    expect(floor([-xhi, xlo])).toEqual([-xhi, 0]);
    expect(floor([-xhi, -xlo])).toEqual([-xhi - 1, 0]);

    // yhi unsafe int
    const [yhi, ylo] = [1e20, Math.PI];
    expect(floor([yhi, ylo])).toEqual([yhi, 3]);
    expect(floor([yhi, -ylo])).toEqual([yhi, -4]);
    expect(floor([-yhi, ylo])).toEqual([-yhi, 3]);
    expect(floor([-yhi, -ylo])).toEqual([-yhi, -4]);

    expect(floor(INF)).toEqual(INF);
    expect(floor(NINF)).toEqual(NINF);
    expect(floor(NaN2)).toEqual(NaN2);
  });

  test('ceil', () => {
    expect(ceil(ZERO)).toEqual(ZERO);
    expect(ceil(neg(ZERO))).toEqual(neg(ZERO));
    expect(ceil([nextFloat(0), 0])).toEqual(ONE);
    expect(ceil([prevFloat(0), 0])).toEqual(neg(ZERO));

    expect(ceil(ONE)).toEqual(ONE);
    expect(ceil(neg(ONE))).toEqual(neg(ONE));
    expect(ceil([1, nextFloat(0)])).toEqual([2, 0]);
    expect(ceil([1, prevFloat(0)])).toEqual(ONE);
    expect(ceil([-1, nextFloat(0)])).toEqual(neg(ZERO));
    expect(ceil([-1, prevFloat(0)])).toEqual(neg(ONE));

    expect(ceil(PI)).toEqual([4, 0]);
    expect(ceil(neg(PI))).toEqual([-3, 0]);

    // xhi safe int
    const [xhi, xlo] = [2**53 - 1, 0.5];
    expect(ceil([xhi, xlo])).toEqual([xhi + 1, 0]);
    expect(ceil([xhi, -xlo])).toEqual([xhi, 0]);
    expect(ceil([-xhi, xlo])).toEqual([-xhi + 1, 0]);
    expect(ceil([-xhi, -xlo])).toEqual([-xhi, 0]);

    // yhi unsafe int
    const [yhi, ylo] = [1e20, Math.PI];
    expect(ceil([yhi, ylo])).toEqual([yhi, 4]);
    expect(ceil([yhi, -ylo])).toEqual([yhi, -3]);
    expect(ceil([-yhi, ylo])).toEqual([-yhi, 4]);
    expect(ceil([-yhi, -ylo])).toEqual([-yhi, -3]);

    expect(ceil(INF)).toEqual(INF);
    expect(ceil(NINF)).toEqual(NINF);
    expect(ceil(NaN2)).toEqual(NaN2);
  });

  test('round', () => {
    expect(round(ZERO)).toEqual(ZERO);
    expect(round(neg(ZERO))).toEqual(neg(ZERO));
    expect(round([nextFloat(0), 0])).toEqual(ZERO);
    expect(round([prevFloat(0), 0])).toEqual(neg(ZERO));

    expect(round(ONE)).toEqual(ONE);
    expect(round(neg(ONE))).toEqual(neg(ONE));
    expect(round([1, nextFloat(0)])).toEqual(ONE);
    expect(round([1, prevFloat(0)])).toEqual(ONE);
    expect(round([-1, nextFloat(0)])).toEqual(neg(ONE));
    expect(round([-1, prevFloat(0)])).toEqual(neg(ONE));

    expect(round(PI)).toEqual([3, 0]);
    expect(round(neg(PI))).toEqual([-3, 0]);

    // xhi safe int
    const xhi = 2**53 - 1;
    expect(round([xhi, 0.4])).toEqual([xhi, 0]);
    expect(round([xhi, 0.6])).toEqual([xhi + 1, 0]);
    expect(round([xhi, -0.4])).toEqual([xhi, 0]);
    expect(round([xhi, -0.6])).toEqual([xhi - 1, 0]);
    expect(round([-xhi, 0.4])).toEqual([-xhi, 0]);
    expect(round([-xhi, 0.6])).toEqual([-xhi + 1, 0]);
    expect(round([-xhi, -0.4])).toEqual([-xhi, 0]);
    expect(round([-xhi, -0.6])).toEqual([-xhi - 1, 0]);
    // tie
    expect(round([xhi, 0.5])).toEqual([xhi + 1, 0]);
    expect(round([xhi, -0.5])).toEqual([xhi, 0]);
    expect(round([-xhi, 0.5])).toEqual([-xhi + 1, 0]);
    expect(round([-xhi, -0.5])).toEqual([-xhi, 0]);

    // yhi unsafe int
    const yhi = 1e20;
    expect(round([yhi, 3.4])).toEqual([yhi, 3]);
    expect(round([yhi, 3.6])).toEqual([yhi, 4]);
    expect(round([yhi, -3.4])).toEqual([yhi, -3]);
    expect(round([yhi, -3.6])).toEqual([yhi, -4]);
    expect(round([-yhi, 3.4])).toEqual([-yhi, 3]);
    expect(round([-yhi, 3.6])).toEqual([-yhi, 4]);
    expect(round([-yhi, -3.4])).toEqual([-yhi, -3]);
    expect(round([-yhi, -3.6])).toEqual([-yhi, -4]);
    // tie
    expect(round([yhi, 3.5])).toEqual([yhi, 4]);
    expect(round([yhi, -3.5])).toEqual([yhi, -3]);
    expect(round([-yhi, 3.5])).toEqual([-yhi, 4]);
    expect(round([-yhi, -3.5])).toEqual([-yhi, -3]);

    expect(round(INF)).toEqual(INF);
    expect(round(NINF)).toEqual(NINF);
    expect(round(NaN2)).toEqual(NaN2);
  });

  test('min/max', () => {

    // one arg
    for (const x of [ZERO, ONE, neg(ONE), PI, neg(PI), INF, NINF, NaN2]) {
      expect(max(x)).toEqual(x);
      expect(min(x)).toEqual(x);
    }

    // two args
    expect(max(ZERO, ONE)).toEqual(ONE);
    expect(max(ZERO, neg(ONE))).toEqual(ZERO);
    expect(max(ONE, NaN2)).toEqual(NaN2);
    expect(max(NaN2, ONE)).toEqual(NaN2);
    expect(min(ZERO, ONE)).toEqual(ZERO);
    expect(min(ZERO, neg(ONE))).toEqual(neg(ONE));
    expect(min(ONE, NaN2)).toEqual(NaN2);
    expect(min(NaN2, ONE)).toEqual(NaN2);
    // with same hi
    const [phi, plo] = PI;
    const pnext: TwoF64 = [phi, nextFloat(plo)];
    const pprev: TwoF64 = [phi, prevFloat(plo)];
    const Xs = [[PI, pnext], [pprev, PI], [neg(pnext), neg(PI)], [neg(PI), neg(pprev)]];
    for (const [x1, x2] of Xs) { // x1 < x2
      expect(max(x1, x2)).toEqual(x2);
      expect(max(x2, x1)).toEqual(x2);
      expect(min(x1, x2)).toEqual(x1);
      expect(min(x2, x1)).toEqual(x1);
    }

    // more args
    let repeat = 3;
    do {
      const posArgs = exponents.map(e => rand2(e, 1));
      const negArgs = exponents.map(e => rand2(e, -1));
      const maxPos = posArgs.at(-1) as TwoF64;
      const minPos = posArgs[0];
      const maxNeg = negArgs[0];
      const minNeg = negArgs.at(-1) as TwoF64;

      expect(max(...shuffle(rng, posArgs))).toEqual(maxPos);
      expect(max(...shuffle(rng, negArgs))).toEqual(maxNeg);
      expect(min(...posArgs)).toEqual(minPos);
      expect(min(...negArgs)).toEqual(minNeg);

      const args = shuffle(rng, [...posArgs, ...negArgs]);
      expect(max(...args)).toEqual(maxPos);
      expect(min(...args)).toEqual(minNeg);

      const maxPos2 = normalize(maxPos[0], nextFloat(maxPos[1]));
      const minNeg2 = normalize(minNeg[0], prevFloat(minNeg[1]));
      const args2 = shuffle(rng, [...args, maxPos2, minNeg2]);
      expect(max(...args2)).toEqual(maxPos2);
      expect(min(...args2)).toEqual(minNeg2);

      const argsInf = shuffle(rng, [...args2, INF, NINF]);
      expect(max(...argsInf)).toEqual(INF);
      expect(min(...argsInf)).toEqual(NINF);

      const argsNaN = shuffle(rng, [...argsInf, NaN2]);
      expect(max(...argsNaN)).toEqual(NaN2);
      expect(min(...argsNaN)).toEqual(NaN2);
    } while (repeat-- > 0);
  });

});
