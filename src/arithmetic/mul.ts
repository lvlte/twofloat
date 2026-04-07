import { twoProd } from '../base/eft.js';
import { DWTimesFP1, DWTimesDW1 } from '../base/algorithms.js';

export const mul11 = twoProd;
export const mul21 = DWTimesFP1;
export const mul22 = DWTimesDW1;
