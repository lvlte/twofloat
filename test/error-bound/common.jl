using Test
using JSON

setprecision(BigFloat, 512)

const TwoF64 = Tuple{Float64, Float64}
const VecF64 = Vector{Float64}
const VecTwo = Vector{TwoF64}

const split_max = prevfloat(floatmax(Float64)/(2^27 + 1))
const u = big(2.0)^-precision(Float64)
const ε₀ = big(eps(0.0))

struct ArgsList
    op1::Union{Vector{Tuple{Float64}},Nothing}
    op2::Union{Vector{Tuple{TwoF64}},Nothing}
    op11::Union{Vector{Tuple{Float64,Float64}},Nothing}
    op21::Union{Vector{Tuple{TwoF64,Float64}},Nothing}
    op22::Union{Vector{Tuple{TwoF64,TwoF64}},Nothing}
    op1n::Union{Vector{Tuple{Float64,Int64}},Nothing}
    op2n::Union{Vector{Tuple{TwoF64,Int64}},Nothing}
    opa1::Union{Vector{Tuple{VecF64}},Nothing}
    opa2::Union{Vector{Tuple{VecTwo}},Nothing}
end

struct TestSet
    argsList::ArgsList
    fnOutput::Dict{String, Vector{TwoF64}}
end
