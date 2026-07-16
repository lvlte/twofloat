# Test the accuracy of twofloat's trigonometric/hyperbolic functions
# Function inputs/outputs dataset is created by /test/error-bound/trig-hyp.ts

json = read("$(@__DIR__)/testset/trig-hyp.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

coverage = OrderedDict(keys(fn_output) .=> false)
overflow = OrderedDict(keys(fn_output) .=> 0)

println()
@testset verbose = true "Trigonometric functions ─" begin ######################

    @testset "sin_1" begin
        _test(Dict(
            "fn" => "sin_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> sin(big(x))
        ))
    end

    @testset "sin_2" begin
        _test(Dict(
            "fn" => "sin_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> sin(big(xhi) + big(xlo))
        ))
    end

    @testset "cos_1" begin
        _test(Dict(
            "fn" => "cos_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> cos(big(x))
        ))
    end

    @testset "cos_2" begin
        _test(Dict(
            "fn" => "cos_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> cos(big(xhi) + big(xlo))
        ))
    end

    @testset "tan_1" begin
        _test(Dict(
            "fn" => "tan_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> tan(big(x))
        ))
    end

    @testset "tan_2" begin
        _test(Dict(
            "fn" => "tan_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> tan(big(xhi) + big(xlo))
        ))
    end

    @testset "cot_1" begin
        _test(Dict(
            "fn" => "cot_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> cot(big(x))
        ))
    end

    @testset "cot_2" begin
        _test(Dict(
            "fn" => "cot_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> cot(big(xhi) + big(xlo))
        ))
    end

    @testset "sec_1" begin
        _test(Dict(
            "fn" => "sec_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> sec(big(x))
        ))
    end

    @testset "sec_2" begin
        _test(Dict(
            "fn" => "sec_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> sec(big(xhi) + big(xlo))
        ))
    end

    @testset "csc_1" begin
        _test(Dict(
            "fn" => "csc_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> csc(big(x))
        ))
    end

    @testset "csc_2" begin
        _test(Dict(
            "fn" => "csc_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> csc(big(xhi) + big(xlo))
        ))
    end
end

println()
@testset verbose = true "Inverse Trigonometric functions ─" begin ######################

    @testset "asin_1" begin
        _test(Dict(
            "fn" => "asin_1",
            "args" => args_list.op1,
            "process_args" => function(x)
                abs(x) <= 1 && return (x,)
                e = exponent(x)
                p = -(1 + e + (e % 2))
                return (x*2.0^p,)
            end,
            "compute" => x -> asin(big(x))
        ))
    end

    @testset "asin_2" begin
        _test(Dict(
            "fn" => "asin_2",
            "args" => args_list.op2,
            "process_args" => function((xhi, xlo),)
                x = big(xhi) + big(xlo)
                abs(x) <= 1 && return ((xhi, xlo),)
                e = exponent(x)
                p = -(1 + e + (e % 2))
                return ((xhi*2.0^p, xlo*2.0^p),)
            end,
            "compute" => ((xhi, xlo),) -> asin(big(xhi) + big(xlo))
        ))
    end

    @testset "acos_1" begin
        _test(Dict(
            "fn" => "acos_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => function(x)
                abs(x) <= 1 && return (x,)
                e = exponent(x)
                p = -(1 + e + (e % 2))
                return (x*2.0^p,)
            end,
            "compute" => x -> acos(big(x))
        ))
    end

    @testset "acos_2" begin
        _test(Dict(
            "fn" => "acos_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => function((xhi, xlo),)
                x = big(xhi) + big(xlo)
                abs(x) <= 1 && return ((xhi, xlo),)
                e = exponent(x)
                p = -(1 + e + (e % 2))
                return ((xhi*2.0^p, xlo*2.0^p),)
            end,
            "compute" => ((xhi, xlo),) -> acos(big(xhi) + big(xlo))
        ))
    end

    @testset "atan_1" begin
        _test(Dict(
            "fn" => "atan_1",
            "args" => args_list.op1,
            "compute" => x -> atan(big(x))
        ))
    end

    @testset "atan_2" begin
        _test(Dict(
            "fn" => "atan_2",
            "args" => args_list.op2,
            "compute" => ((xhi, xlo),) -> atan(big(xhi) + big(xlo))
        ))
    end

    @testset "acot_1" begin
        _test(Dict(
            "fn" => "acot_1",
            "args" => args_list.op1,
            "compute" => x -> acot(big(x))
        ))
    end

    @testset "acot_2" begin
        _test(Dict(
            "fn" => "acot_2",
            "args" => args_list.op2,
            "compute" => ((xhi, xlo),) -> acot(big(xhi) + big(xlo))
        ))
    end

    @testset "asec_1" begin
        _test(Dict(
            "fn" => "asec_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => function(x)
                abs(x) ≥ 1 && return (x,)
                return (ldexp(x, -exponent(x)),)
            end,
            "compute" => x -> asec(big(x))
        ))
    end

    @testset "asec_2" begin
        _test(Dict(
            "fn" => "asec_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => function((xhi, xlo),)
                abs(big(xhi) + big(xlo)) ≥ 1 && return ((xhi, xlo),)
                p = -exponent(xhi)
                return ((ldexp(xhi, p), ldexp(xlo, p)),)
            end,
            "compute" => ((xhi, xlo),) -> asec(big(xhi) + big(xlo))
        ))
    end
end

println()
@testset verbose = true "Hyperbolic functions ────" begin ######################

    @testset "sinh_1" begin
        _test(Dict(
            "fn" => "sinh_1",
            "args" => args_list.exp1,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => x -> sinh(big(x)),
            "underflow" => (r, (x,)) -> abs(u^2 * exp(big(x))) < ε₀
        ))
    end

    @testset "sinh_2" begin
        _test(Dict(
            "fn" => "sinh_2",
            "args" => args_list.exp2,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => ((xhi, xlo),) -> sinh(big(xhi) + big(xlo)),
            "underflow" => (r, ((xhi, xlo),)) -> abs(u^2 * exp(big(xhi) + big(xlo))) < ε₀
        ))
    end

    @testset "cosh_1" begin
        _test(Dict(
            "fn" => "cosh_1",
            "args" => args_list.exp1,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => x -> cosh(big(x)),
            "underflow" => (r, (x,)) -> abs(u^2 * exp(big(x))) < ε₀
        ))
    end

    @testset "cosh_2" begin
        _test(Dict(
            "fn" => "cosh_2",
            "args" => args_list.exp2,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => ((xhi, xlo),) -> cosh(big(xhi) + big(xlo)),
            "underflow" => (r, ((xhi, xlo),)) -> abs(u^2 * exp(big(xhi) + big(xlo))) < ε₀
        ))
    end

    @testset "tanh_1" begin
        _test(Dict(
            "fn" => "tanh_1",
            "args" => args_list.exp1,
            # "rel_err_bound" => big(2.0)^-95,
            "process_args" => x -> x % 37,
            "compute" => x -> tanh(big(x))
        ))
    end

    @testset "tanh_2" begin
        _test(Dict(
            "fn" => "tanh_2",
            "args" => args_list.exp2,
            "process_args" => ((xhi, xlo),) -> (twosum(xhi % 37, xlo),),
            "compute" => ((xhi, xlo),) -> tanh(big(xhi) + big(xlo))
        ))
    end

    @testset "coth_1" begin
        _test(Dict(
            "fn" => "coth_1",
            "args" => args_list.exp1,
            "process_args" => x -> x % 37,
            "compute" => x -> coth(big(x)),
            "underflow" => (r, (x,)) -> abs(u^2 * exp(big(x))) < ε₀
        ))
    end

    @testset "coth_2" begin
        _test(Dict(
            "fn" => "coth_2",
            "args" => args_list.exp2,
            "process_args" => ((xhi, xlo),) -> (twosum(xhi % 37, xlo),),
            "compute" => ((xhi, xlo),) -> coth(big(xhi) + big(xlo)),
            "underflow" => (r, ((xhi, xlo),)) -> abs(u^2 * exp(big(xhi) + big(xlo))) < ε₀
        ))
    end

    @testset "sech_1" begin
        _test(Dict(
            "fn" => "sech_1",
            "args" => args_list.exp1,
            "compute" => x -> sech(big(x))
        ))
    end

    @testset "sech_2" begin
        _test(Dict(
            "fn" => "sech_2",
            "args" => args_list.exp2,
            "compute" => ((xhi, xlo),) -> sech(big(xhi) + big(xlo))
        ))
    end

    @testset "csch_1" begin
        _test(Dict(
            "fn" => "csch_1",
            "args" => args_list.exp1,
            "compute" => x -> csch(big(x))
        ))
    end

    @testset "csch_2" begin
        _test(Dict(
            "fn" => "csch_2",
            "args" => args_list.exp2,
            "compute" => ((xhi, xlo),) -> csch(big(xhi) + big(xlo))
        ))
    end
end

##

println()
@testset "Trig functions coverage ─" begin
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end

overflowed = filter(((fn , ov_count),) -> ov_count > 0, overflow)
if !isempty(overflowed)
    println()
    @info ["overflow\n ", (rpad(k, 20, ' ') * "$v\n " for (k, v) in overflowed)...] |> join
end
