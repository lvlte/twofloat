using Test
using JSON
using DataStructures

setprecision(BigFloat, 512)

const TwoF64 = Tuple{Float64, Float64}
const VecF64 = Vector{Float64}
const VecTwo = Vector{TwoF64}

const split_max = prevfloat(floatmax(Float64)/(2^27 + 1))
const u = big(2.0)^-precision(Float64)
const ε₀ = big(eps(0.0))

const rel_err_default = big(1e-30)
const rel_err_uf_default = big(1e-25)
const abs_err_min_default = 2.5ε₀

coverage = OrderedDict{String, Bool}()
overflow = OrderedDict{String, Int}()

struct ArgsList
    op1::Union{Vector{Tuple{Float64}},Nothing}
    op2::Union{Vector{Tuple{TwoF64}},Nothing}
    op11::Union{Vector{Tuple{Float64,Float64}},Nothing}
    op12::Union{Vector{Tuple{Float64,TwoF64}},Nothing}
    op21::Union{Vector{Tuple{TwoF64,Float64}},Nothing}
    op22::Union{Vector{Tuple{TwoF64,TwoF64}},Nothing}
    op1n::Union{Vector{Tuple{Float64,Int64}},Nothing}
    op2n::Union{Vector{Tuple{TwoF64,Int64}},Nothing}
    opa1::Union{Vector{Tuple{VecF64}},Nothing}
    opa2::Union{Vector{Tuple{VecTwo}},Nothing}
    exp1::Union{Vector{Tuple{Float64}},Nothing}
    exp2::Union{Vector{Tuple{TwoF64}},Nothing}
end

struct TestSet
    argsList::ArgsList
    fnOutput::OrderedDict{String, Vector{TwoF64}}
end

iscallable(f) = !isempty(methods(f))

function twosum(x::Float64, y::Float64):: TwoF64
    hi = x + y;
    x1 = hi - y;
    y1 = hi - x1;
    return (hi, x - x1 + (y - y1))
end

function _test(fn_data::Dict{String, Any})
    fn = fn_data["fn"]
    args = fn_data["args"]
    compute = fn_data["compute"]
    output = fn_output[fn]
    process_args = get(fn_data, "process_args", nothing)
    abs_err_min = get(fn_data, "abs_err_min", abs_err_min_default)
    rel_err_bound = get(fn_data, "rel_err_bound", rel_err_default)
    rel_err_bound_uf = get(fn_data, "rel_err_bound_uf", rel_err_uf_default)
    abs_err_bound = get(fn_data, "abs_err_bound", (r, _) -> max(abs(rel_err_bound * r), abs_err_min))
    abs_err_bound_uf = get(fn_data, "abs_err_bound_uf", (r, _) -> max(abs(rel_err_bound_uf * r), abs_err_min))
    _uf = get(fn_data, "underflow", nothing)
    underflow = iscallable(_uf) ? (r, _args) -> abs(u^2*r) < ε₀ || _uf(r, _args) : (r, _) -> abs(u^2*r) < ε₀

    max_rel_err = (0.0, ())
    avg_psum = big(0.0)
    avg_count = 0

    @test length(args) == length(output)

    for (i, fnargs) in enumerate(args)
        if iscallable(process_args)
            fnargs = process_args(fnargs...)
        end
        zhi, zlo = output[i]
        z = big(zhi) + big(zlo)
        r = compute(fnargs...)
        if abs(r) > floatmax(Float64) || !isfinite(r)
            @test !isfinite(zhi + zlo)
        elseif isnan(z)
            overflow[fn] += 1 # spurious overflow
        elseif underflow(r, fnargs)
            @test abs(z - r) ≤ abs_err_bound_uf(r, fnargs)
        else
            @test abs(z - r) ≤ abs_err_bound(r, fnargs)
            rel_err = abs((z - r) / r)
            avg_psum, avg_count = avg_psum + rel_err, avg_count + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), fnargs)
            end
        end
    end

    coverage[fn] = true
    max_err, max_args = max_rel_err
    avg = Float64(avg_psum / avg_count)
    @info "$fn relative error" max=max_err avg
    println()
end
