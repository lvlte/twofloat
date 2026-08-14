/**
 * @file Tests basic math functions
 */

import { randomFn } from "../utils";
import { nextFloat, prevFloat } from "@lvlte/ulp";
import {
  type TwoF64,
  INF,
  NINF,
  NaN2,
  ONE,
  PI,
  ZERO,
  abs,
  ceil,
  floor,
  neg,
  sign,
  trunc,
} from '../../src';

const SEED = Math.sqrt(7);
const random = randomFn(SEED, true);
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
      for (const s of [1, -1]) {
        const [xhi, xlo] = [random(e, s), random(e - 53, s)];
        const [yhi, ylo] = [random(e, s), random(e - 53, -s)];
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
      for (const s of [1, -1]) {
        const x: TwoF64 = [random(e, s), random(e - 53, s)];
        const y: TwoF64 = [random(e, s), random(e - 53, -s)];
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

});
