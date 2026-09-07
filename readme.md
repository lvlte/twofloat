# twofloat

`twofloat` is a comprehensive math library for TS/JS that implements [double-double arithmetic](https://en.wikipedia.org/wiki/Quadruple-precision_floating-point_format#Double-double_arithmetic), delivering **106 bits of significand precision** with minimal overhead (~31–33 significant decimal digits, without requiring bigint, strings, or heavy arbitrary-precision libraries).

## Features

- All the standard JS [`Math`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math) functions/constants (and more) with twice the precision of 64-bit floats.
- Core algorithms with formally proven error bounds (Joldes et al., 2017).
- Extensively tested against 512-bit `BigFloat` operations via [Julia](https://github.com/julialang/julia).
- Pure functions operating directly on lightweight tuples.
- Seamless integration in Node.js, browsers and bundlers (ESM/CJS).
- Well documented (TSDoc/Intellisense) - full API reference coming soon.

## Install

```bash
npm install twofloat
```

## What is Double-Double Arithmetic ?

Standard IEEE 754 double-precision numbers (64-bit floats, `number` in JS, aliased `f64` in this library) provide 53 bits of significand precision (~15–17 decimal digits).

In high-precision scientific computing, especially when dealing with sensitive iterative algorithms, 53 bits can be insufficient and lead to catastrophic cancellation and cumulative rounding errors.

Double-double arithmetic represents a number `x` as an unevaluated sum of two standard `f64` numbers `x = [xₕᵢ, xₗₒ]` such that mathematically `x = xₕᵢ + xₗₒ`, and where `|xₗₒ| < ulp(xₕᵢ)` after normalization. This representation enables the effective significand to reach at least 106 bits of precision while still taking advantage of native floating-point hardware instructions (_at least_ because the bits of `xₕᵢ` and `xₗₒ` are not necessarily adjacent).

### Canonical Representation

A normalized twofloat number is represented by the `TwoF64` tuple:

```typescript
type TwoF64 = readonly [hi: number, lo: number];
```

Where canonical/normalized means:
- `hi` contains the most significant bits and `lo` contains the least significant bits.
- The bits of `hi` and `lo` do not overlap: the most significant bit in `lo` is less than the least significant bit in `hi`.

Every twofloat operation returns a canonical result, which allows maintaining the highest possible accuracy during subsequent calculations. This also guarantees that `hi` is always the closest `f64` approximation of the mathematical sum `hi + lo`.

A threefloat type `ThreeF64` (triple-double expansion) is also provided and used internally for high-accuracy intermediate computations and range reduction.

## Basic Example

*More than an example, this is the first thing you should know before using this library.*

Let's consider the classic case `0.1 * 3 = 0.30000000000000004`.

Like `1/3` in decimal, the binary representation of `1/10` doesn't end, like most of the rationals in binary. So **when you write or see the (IEEE 754 64-bit float) value `0.1`, remember it's only the closest float64 approximation of the mathematical value `0.1`**, ie.

```typescript
// See the hidden digits wrapped in square brackets
const x = 0.1;    // 0.10000000000000000[55511151231257827021181583404541015625]

// These are hidden to preserve developer sanity, until they come across:
const y = x * 3;  // 0.30000000000000004[44089209850062616169452667236328125]

console.log(
  x === 0.1,      // true
  y === 0.3,      // false 🤯
);
```

There is no bug, it's just that a non-significant (hidden) part of `x` multiplied by `3` becomes significant relative to the float64 representation of `0.3`, so we actually see the approximation error we didn't see earlier.

When using double-double arithmetic, a common mistake is to think this case will be addressed with `mul(0.1, 3)`. While the result will be better than `0.1 * 3`, this is still wrong because you start with a float64 approximation of `1/10` while you could start with a twofloat approximation. The key is to actually *not* use the `f64` value `0.1` at all, but instead the `TwoF64` result of `div(1, 10)`:

```typescript
import { div, mul } from 'twofloat';

const x = div(1, 10);         // [0.1, -5.551115123125783e-18]
const [yhi, ylo] = mul(x, 3); // [0.3, 1.1102230246251563e-17]

console.log(yhi === 0.3);     // true 🎉
);
```

In most cases, when done with twice-precision calculations, you can go with the high part. In our example `yhi`.

## API Reference Overview

### Twofloat Constants

Constants names are consistent with those from the standard JS `Math` library.

```typescript
import {
  // basic constants
  ZERO, ONE, NaN2, INF, NINF,

  // math constants
  PI, TAU, E, LN2, LN10, LOG2E, LOG10E, SQRT2, SQRT3, SQRT1_2,

  // ThreeF64 math constants (THREE.*: THREE.PI, THREE.TAU, THREE.E, etc.)
  THREE
} from 'twofloat';
```

### Basic Arithmetic

```typescript
import { add, sub, mul, div, inv, sum, prod } from 'twofloat';
```

### Exponentiation

```typescript
import { square, cube, pow, powint, exp, expm1 } from 'twofloat';
```

### Roots

```typescript
import { sqrt, cbrt, nthRoot } from 'twofloat';
```

### Logarithms

```typescript
import { ln, log2, log10 } from 'twofloat';
```

### Trigonometric Functions

Trigonometric functions accept angles in radians and perform exact argument reduction using triple-precision constants.

```typescript
import { sin, cos, tan, cot, sec, csc } from 'twofloat';
```

### Inverse Trigonometric Functions

```typescript
import { asin, acos, atan, acot, asec, acsc } from 'twofloat';
```

### Hyperbolic Functions

```typescript
import { sinh, cosh, tanh, coth, sech, csch } from 'twofloat';
```

### Inverse Hyperbolic Functions

```typescript
import { asinh, acosh, atanh, acoth, asech, acsch } from 'twofloat';
```

### Modular Arithmetic

```typescript
// Remainder after division by π or 2π
import { rempi, rem2pi } from 'twofloat';
```

### Rounding & Utilities

```typescript
import { abs, neg, sign, floor, ceil, trunc, round, min, max } from 'twofloat';
```

### Comparisons & Predicates

```typescript
import {
  eq, lt, le, gt, ge,
  isZero, isOne, isFinite2, isInfinite2, isNaN2, isInteger2, isSafeInteger2, isSafeTwoInteger
} from 'twofloat';
```

### Function Signature and Naming Convention

Every operation is implemented by type-specific functions that accept `f64` and/or `TwoF64` operands, and a main function with more flexible signature that dispatches to the specific implementation depending on the input arguments.

Type-specific functions follow the naming convention `<op><suffix>` (modulo minor exceptions), where `<op>` is the name of the main function and `<suffix>` is a n-digits sequence where `n` is the number of expected arguments and where each digit is either `1` for `f64`, `2` for `TwoF64`, or in rare cases `3` for `ThreeF64`. Because some math functions have a digit in their name, their suffix has a leading underscore `_` to prevent confusion.

For example, binary operations have a two-digits suffix:

```typescript
// Commutative (`mul12` not implemented since redundant with `mul21`)
function mul(x: f64 | TwoF64, y: f64 | TwoF64): TwoF64;
function mul11(x: f64, y: f64): TwoF64;
function mul21(x: TwoF64, y: f64): TwoF64;
function mul22(x: TwoF64, y: TwoF64): TwoF64;

// Non-commutative
function div(x: f64 | TwoF64, y: f64 | TwoF64): TwoF64;
function div11(x: f64, y: f64): TwoF64;
function div12(x: f64, y: TwoF64): TwoF64;
function div21(x: TwoF64, y: f64): TwoF64;
function div22(x: TwoF64, y: TwoF64): TwoF64;
```

Unary operations have a one-digit suffix:

```typescript
function expm1(x: f64 | TwoF64): TwoF64;
function expm1_1(x: f64): TwoF64;
function expm1_2(x: TwoF64): TwoF64;
```

We recommend using the main functions by default, and opting for type-specific implementations where performance is a concern.

## References

- T.J. Dekker (1971), A floating-point technique for extending the available precision, *Numerische Mathematik*, 18, 224–242.
- J.R. Shewchuk (1997), Adaptive precision floating-point arithmetic and fast robust geometric predicates, *Discrete Computational Geometry*, 18, 305–363.
- M. Joldeş, J.-M. Muller and V. Popescu (2017), Tight and rigorous error bounds for basic
building blocks of double-word arithmetic, *ACM Transactions on Mathematical Software*, 44, 1–27.
- S. Graillat (2009), Accurate Floating Point Product and Exponentiation, *IEEE Transactions on Computers*, 58 (7), 994–1000.
- D. E. Knuth (1998), *The Art of Computer Programming*, Vol. 2, 3rd edition, Addison–Wesley.
- W. Kahan (2006), Lecture Notes on the Status of IEEE Standard 754 for Binary Floating-Point Arithmetic, EECS Department, University of California, Berkeley.

## License

[MIT](LICENSE) © [lvlte](https://github.com/lvlte)
