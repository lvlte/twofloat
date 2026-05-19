# Precompute some expressions / Generate TwoF64 constants
# Output to JSON (override)

using JSON
include("./pade.jl")

TwoF64(x::Real) = TwoF64(BigFloat(x))
TwoF64Int(x::Real) = TwoF64Int(BigFloat(x))

function TwoF64(x::BigFloat)
    hi = Float64(x)
    lo = Float64(x - big(hi))
    return (hi, lo)
end

function TwoF64Int(x::BigFloat)
    isinteger(x) || throw(DomainError(x, "x must be an integer"))
    hi, lo = TwoF64(x)
    y = big(hi) + big(lo)
    x == y || throw(InexactError(:TwoF64Int, TwoF64Int, x))
    return (hi, lo)
end

math_const = Dict(
    "E" => big(ℯ),
    "LN2" => log(big(2.0)),
    "LN10" => log(big(10.0)),
    "LOG2E" => log2(big(ℯ)),
    "LOG10E" => log10(big(ℯ)),
    "PI" => big(π),
    "SQRT1_2" => sqrt(big(0.5)),
    "SQRT2" => sqrt(big(2.0)),
)

exp_n = [exp(BigFloat(n)) for n in 0:80]

N = UnitRange{Int128}(10, 16)
exp_pade = Dict(n => pade_exp(n,n)[1] for n in N)
exp_pade_int = Dict(n => pade_exp_int(n) for n in N)

two_const = Dict(key => TwoF64(val) for (key, val) in math_const)
pre_exp = Dict(
    "exp_n" => TwoF64.(exp_n),
    "exp_pade" => Dict(n => TwoF64.(exp_pade[n]) for n in N),
    "exp_pade_int" => Dict(n => TwoF64Int.(exp_pade_int[n]) for n in N)
)

JSON.json("$(@__DIR__)/constants.json", two_const; pretty=true)
JSON.json("$(@__DIR__)/exp.json", pre_exp)
