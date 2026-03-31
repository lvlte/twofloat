import {
  normalize,
  split,
  twoSum,
  twoProd
} from './eft.js';

import {
  DWPlusFP,
  AccurateDWPlusDW,
  DWTimesFP1,
  DWTimesDW1,
  DWDivFP3,
  DWDivDW2,
} from './algorithms.js';

export const add11 = twoSum;
export const add21 = DWPlusFP;
export const add22 = AccurateDWPlusDW;

export const mul11 = twoProd;
export const mul21 = DWTimesFP1;
export const mul22 = DWTimesDW1;

export const div21 = DWDivFP3;
export const div22 = DWDivDW2;
