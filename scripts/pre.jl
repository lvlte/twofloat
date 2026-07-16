# Precompute some expressions / Generate TwoF64 constants
# Output to JSON (override)

using JSON
using DataStructures

include("./pade.jl")

TwoF64(x::Real) = TwoF64(BigFloat(x))
ThreeF64(x::Real) = ThreeF64(BigFloat(x))
TwoF64Int(x::Real) = TwoF64Int(BigFloat(x))

function TwoF64(x::BigFloat)
    hi = Float64(x)
    lo = Float64(x - big(hi))
    return (hi, lo)
end

function ThreeF64(x::BigFloat)
    hi = Float64(x)
    md = Float64(x - big(hi))
    lo = Float64(x - big(hi) - big(md))
    return (hi, md, lo)
end

function TwoF64Int(x::BigFloat)
    isinteger(x) || throw(DomainError(x, "x must be an integer"))
    hi, lo = TwoF64(x)
    y = big(hi) + big(lo)
    x == y || throw(InexactError(:TwoF64Int, TwoF64Int, x))
    return (hi, lo)
end

function F64Int(x::Real)
    hi, lo = TwoF64Int(x)
    lo != 0 && throw(InexactError(:F64Int, Float64, x))
    return hi
end

math_const = OrderedDict(
    "E" => big(ℯ),
    "LN2" => log(big(2.0)),
    "LN10" => log(big(10.0)),
    "LOG2E" => log2(big(ℯ)),
    "LOG10E" => log10(big(ℯ)),
    "PI" => big(π),
    "SQRT1_2" => sqrt(big(0.5)),
    "SQRT2" => sqrt(big(2.0)),
    "TAU" => 2*big(π),
)

two_const = OrderedDict(key => TwoF64(val) for (key, val) in math_const)
three_const = OrderedDict(key => ThreeF64(val) for (key, val) in math_const)

# exp(n)
nmax = 80
exp_n = [[n, TwoF64(exp(BigFloat(n)))] for n in -nmax:nmax]

# Padé [n/n] exp(x)
# Integer coefficients can be represented as f64 integers for n < 16, higher
# orders requires TwoF64 but won't bring more accuracy (except if we use more
# ie. triple, quad, etc.) precision to evaluate the approximant.
N = UnitRange{Int128}(10, 15)
exp_pade = OrderedDict(n => pade_exp(n,n)[1] for n in N)
exp_pade_int = OrderedDict(n => pade_exp_int(n) for n in N)
exp_pade_TwoF64 = OrderedDict(n => TwoF64.(exp_pade[n]) for n in N)
exp_pade_int_f64 = OrderedDict(n => F64Int.(exp_pade_int[n]) for n in N)

# Padé [n/n] expm1(x)
N = UnitRange{BigInt}(15, 20)
expm1_pade = OrderedDict(n => taylor_to_pade(taylor_expm1, n, n) for n in N)
expm1_pade_int = OrderedDict(n => reverse.(pade_int(expm1_pade[n]...)) for n in N)
expm1_pade_TwoF64 = OrderedDict(n => [TwoF64.(expm1_pade[n][1]), TwoF64.(expm1_pade[n][2])] for n in N)
expm1_pade_int_TwoF64 = OrderedDict(n => [TwoF64Int.(expm1_pade_int[n][1]), TwoF64Int.(expm1_pade_int[n][2])] for n in N)

pre_exp = OrderedDict(
    "exp_n" => [exp_n; [["nmax", nmax]]],
    "exp_pade" => exp_pade_TwoF64,
    "exp_pade_int" => exp_pade_int_f64,
    "expm1_pade" => expm1_pade_TwoF64,
    "expm1_pade_int" => expm1_pade_int_TwoF64
)

# Padé [n/n] ln(x + 1)
N = UnitRange{Int128}(12, 22)
ln1p_pade = OrderedDict(n => taylor_to_pade(taylor_ln1p, n, n) for n in N)
ln1p_pade_int = OrderedDict(n => reverse.(pade_int(ln1p_pade[n]...)) for n in N)
pre_log = OrderedDict(
    "ln1p_pade" => OrderedDict(n => [TwoF64.(ln1p_pade[n][1]), TwoF64.(ln1p_pade[n][2])] for n in N),
    "ln1p_pade_int" => OrderedDict(n => [TwoF64Int.(ln1p_pade_int[n][1]), TwoF64Int.(ln1p_pade_int[n][2])] for n in N)
)

# Padé [n/n] sin(x)
#   use m,n pairs instead of n to skip the trivial zeros (NB. given the vector
#   pair (P, Q) representing the Padé approximant R[n/n](x) = Pₙ(x)/Qₙ(x), P[k]
#   holds the coefficient of degree 2k+1, and Q[k] the coefficient of degree 2k)
# NB. Integer coefficients are too big to fit in TwoF64
N = UnitRange{BigInt}(15, 30)
MN = map(n -> (div(n-1, 2), div(n, 2)), N)
sin_pade = OrderedDict(m+n+1 => taylor_to_pade(taylor_sin, m, n) for (m,n) in MN)
sin_pade_TwoF64 = OrderedDict(n => [TwoF64.(sin_pade[n][1]), TwoF64.(sin_pade[n][2])] for n in N)

# Padé [2n/2n] cos(x)
#   Same logic here except both P[k] and Q[k] map to x^2k (like in tne Taylor
#   expansion, every odd power of x is 0 zero whatever the Padé order)
# NB. Integer coefficients are too big to fit in TwoF64
N = UnitRange{BigInt}(7, 15)
cos_pade = OrderedDict(2n => taylor_to_pade(taylor_cos, n, n) for n in N)
cos_pade_TwoF64 = OrderedDict(2n => [TwoF64.(cos_pade[2n][1]), TwoF64.(cos_pade[2n][2])] for n in N)

# Padé [n/n] tan(x)
#   use m,n pairs instead of n to skip the trivial zeros (NB. given the vector
#   pair (P, Q) representing the Padé approximant R[n/n](x) = Pₙ(x)/Qₙ(x), P[k]
#   holds the coefficient of degree 2k-1, and Q[k] the coefficient of degree 2k)
N = UnitRange{BigInt}(15, 25)
MN = map(n -> (div(n+1, 2), div(n, 2)), N)
tan_pade = OrderedDict(m+n => taylor_to_pade(taylor_tan, m, n) for (m,n) in MN)
tan_pade_TwoF64 = OrderedDict(n => [TwoF64.(tan_pade[n][1]), TwoF64.(tan_pade[n][2])] for n in N)
tan_pade_int = OrderedDict(n => reverse.(pade_int(tan_pade[n]...)) for n in N)
# tan_pade_int_f64 = OrderedDict(n => [F64Int.(tan_pade_int[n][1]), F64Int.(tan_pade_int[n][2])] for n in N)
tan_pade_int_TwoF64 = OrderedDict(n => [TwoF64Int.(tan_pade_int[n][1]), TwoF64Int.(tan_pade_int[n][2])] for n in N)

pre_trig = OrderedDict(
    "sin_pade" => sin_pade_TwoF64,
    "cos_pade" => cos_pade_TwoF64,
    "tan_pade" => tan_pade_TwoF64,
    "tan_pade_int" => tan_pade_int_TwoF64,
)

# Padé [n/n] asin(x) (same remarks as above for sin(x))
N = UnitRange{BigInt}(25, 30)
MN = map(n -> (div(n-1, 2), div(n, 2)), N)
asin_pade = OrderedDict(m+n+1 => taylor_to_pade(taylor_asin, m, n) for (m,n) in MN)
asin_pade_TwoF64 = OrderedDict(n => [TwoF64.(asin_pade[n][1]), TwoF64.(asin_pade[n][2])] for n in N)

# Padé [n/n] atan(x) (same remarks as above for sin(x))
N = UnitRange{BigInt}(25, 30)
MN = map(n -> (div(n-1, 2), div(n, 2)), N)
atan_pade = OrderedDict(m+n+1 => taylor_to_pade(taylor_atan, m, n) for (m,n) in MN)
atan_pade_TwoF64 = OrderedDict(n => [TwoF64.(atan_pade[n][1]), TwoF64.(atan_pade[n][2])] for n in N)
atan_pade_int = OrderedDict(n => reverse.(pade_int(atan_pade[n]...)) for n in N)
atan_pade_int_TwoF64 = OrderedDict(n => [TwoF64Int.(atan_pade_int[n][1]), TwoF64Int.(atan_pade_int[n][2])] for n in N)

pre_arctrig = OrderedDict(
    "asin_pade" => asin_pade_TwoF64,
    "atan_pade" => atan_pade_TwoF64,
    "atan_pade_int" => atan_pade_int_TwoF64,
)

# Padé [n/n] asinh(x) (same remarks as above for sin(x))
# NB. coefficients are absolute values of those for asin(x) (the needed range
# for n might be different in the end though)
N = UnitRange{BigInt}(20, 30)
MN = map(n -> (div(n-1, 2), div(n, 2)), N)
asinh_pade = OrderedDict(m+n+1 => taylor_to_pade(taylor_asinh, m, n) for (m,n) in MN)
asinh_pade_TwoF64 = OrderedDict(n => [TwoF64.(asinh_pade[n][1]), TwoF64.(asinh_pade[n][2])] for n in N)

pre_archyp = OrderedDict(
    "asinh_pade" => asinh_pade_TwoF64,
)

### Output

filemap = (
    "constants" => OrderedDict("TwoF64" => two_const, "ThreeF64" => three_const),
    "exp"       => pre_exp,
    "log"       => pre_log,
    "trig"      => pre_trig,
    "arctrig"   => pre_arctrig,
    "archyp"    => pre_archyp,
)

for (name, content) in filemap
    out = JSON.json(content; pretty=true)
    # pretty and compact format
    out = replace(out, r"\[\n\s+([0-9\-.e]+),\n\s+([0-9\-.e]+)\n\s+\]" => s"[\1, \2]")
    out = replace(out, r"\[\n\s+([0-9\-.e]+),\n\s+\[([0-9\-.e]+),\s([0-9\-.e]+)\]\n\s+\]" => s"[\1, [\2, \3]]")
    write("$(@__DIR__)/$name.json", out)
end
