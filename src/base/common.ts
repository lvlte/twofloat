
export type f64 = number;
export type TwoF64 = [hi: f64, lo: f64];

export const F64_PRECISION = 53;
export const F64_TRUNC_NB = Math.ceil(F64_PRECISION/2);
export const F64_SPLIT_K = 2**F64_TRUNC_NB + 1;
