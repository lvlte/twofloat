# Test the accuracy of twofloat's math functions
# Function inputs/outputs dataset is created by /test/error-bound/math.ts

json = read("$(@__DIR__)/testset/math.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

coverage = OrderedDict(keys(fn_output) .=> false)
overflow = OrderedDict(keys(fn_output) .=> 0)

println()
@testset verbose = true "Exponentiation ──────────" begin ######################

    @testset "square1 (EFT)" begin
        _test(Dict(
            "fn" => "square1",
            "args" => args_list.op1,
            "rel_err_bound" => 0,
            "compute" => x -> big(x)^2,
        ))
    end

    @testset "square2" begin
        _test(Dict(
            "fn" => "square2",
            "args" => args_list.op2,
            "rel_err_bound" => 5u^2,
            "compute" => ((xhi, xlo),) -> (big(xhi) + big(xlo))^2
        ))
    end

    @testset "cube1" begin
        _test(Dict(
            "fn" => "cube1",
            "args" => args_list.op1,
            "rel_err_bound" => 3u^2/2 + 4u^3,
            "compute" => x -> big(x)^3
        ))
    end

    @testset "cube2" begin
        _test(Dict(
            "fn" => "cube2",
            "args" => args_list.op2,
            "rel_err_bound" => 10u^2 + 25u^4,
            "compute" => ((xhi, xlo),) -> (big(xhi) + big(xlo))^3
        ))
    end

    @testset "_linpow" begin
        _test(Dict(
            "fn" => "_linpow",
            "args" => args_list.op1n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => (x, n) -> (x, abs(n)),
            "compute" => (x, n) -> big(x)^n
        ))
    end


    @testset "_logpow" begin
        _test(Dict(
            "fn" => "_logpow",
            "args" => args_list.op1n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => (x, n) -> (x, abs(n)),
            "compute" => (x, n) -> big(x)^n
        ))
    end

    @testset "_logpowltr" begin
        _test(Dict(
            "fn" => "_logpowltr",
            "args" => args_list.op1n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => (x, n) -> (x, abs(n)),
            "compute" => (x, n) -> big(x)^n
        ))
    end

    @testset "_linpow2" begin
        _test(Dict(
            "fn" => "_linpow2",
            "args" => args_list.op2n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => ((xhi, xlo), n) -> ((xhi, xlo), abs(n)),
            "compute" => ((xhi, xlo), n) -> (big(xhi) + big(xlo))^n
        ))
    end

    @testset "_logpow2" begin
        _test(Dict(
            "fn" => "_logpow2",
            "args" => args_list.op2n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => ((xhi, xlo), n) -> ((xhi, xlo), abs(n)),
            "compute" => ((xhi, xlo), n) -> (big(xhi) + big(xlo))^n
        ))
    end

    @testset "pow1int" begin
        _test(Dict(
            "fn" => "pow1int",
            "args" => args_list.op1n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "compute" => (x, n) -> big(x)^n,
            "underflow" => (r, (x, n)) -> n < 0 && abs(u^2/r) < ε₀
        ))
    end

    @testset "pow2int" begin
        _test(Dict(
            "fn" => "pow2int",
            "args" => args_list.op2n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "compute" => ((xhi, xlo), n) -> (big(xhi) + big(xlo))^n,
            "underflow" => (r, (x, n)) -> n < 0 && abs(u^2/r) < ε₀
        ))
    end

    @testset "pow11" begin
        _test(Dict(
            "fn" => "pow11",
            "args" => args_list.op11,
            "rel_err_bound_uf" => big(2.0)^-78, # 3ε₀
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => (x, p) -> (abs(x), p),
            "compute" => (x, p) -> big(x)^p
        ))
    end

    @testset "pow12" begin
        _test(Dict(
            "fn" => "pow12",
            "args" => args_list.op12,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => (x, p) -> (abs(x), p),
            "compute" => (x, (phi, plo)) -> big(x)^(big(phi) + big(plo))
        ))
    end

    @testset "pow21" begin
        _test(Dict(
            "fn" => "pow21",
            "args" => args_list.op21,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => ((xhi, xlo), p) -> xhi < 0 ? ((-xhi, -xlo), p) : ((xhi, xlo), p),
            "compute" => ((xhi, xlo), p) -> (big(xhi) + big(xlo))^p
        ))
    end

    @testset "pow22" begin
        _test(Dict(
            "fn" => "pow22",
            "args" => args_list.op22,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => ((xhi, xlo), p) -> xhi < 0 ? ((-xhi, -xlo), p) : ((xhi, xlo), p),
            "compute" => ((xhi, xlo), (phi, plo)) -> (big(xhi) + big(xlo))^(big(phi) + big(plo))
        ))
    end

    @testset "exp1" begin
        _test(Dict(
            "fn" => "exp1",
            "args" => args_list.exp1,
            "rel_err_bound" => 10u^2,
            "compute" => x -> exp(big(x))
        ))
    end

    @testset "exp2" begin
        _test(Dict(
            "fn" => "exp2",
            "args" => args_list.exp2,
            "rel_err_bound" => 10u^2,
            "compute" => ((xhi, xlo),) -> exp(big(xhi) + big(xlo))
        ))
    end

    @testset "expm1_1" begin
        _test(Dict(
            "fn" => "expm1_1",
            "args" => args_list.exp1,
            "rel_err_bound" => 10u^2,
            "compute" => x -> expm1(big(x))
        ))
    end

    @testset "expm1_2" begin
        _test(Dict(
            "fn" => "expm1_2",
            "args" => args_list.exp2,
            "rel_err_bound" => 10u^2,
            "compute" => ((xhi, xlo),) -> expm1(big(xhi) + big(xlo))
        ))
    end
end

println()
@testset verbose = true "Logarithms ──────────────" begin ######################

    @testset "ln1" begin
        _test(Dict(
            "fn" => "ln1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => x -> abs(x),
            "compute" => x -> log(big(x))
        ))
    end

    @testset "ln2" begin
        _test(Dict(
            "fn" => "ln2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => ((xhi, xlo),) -> xhi < 0 ? ((-xhi, -xlo),) : ((xhi, xlo),),
            "compute" => ((xhi, xlo),) -> log(big(xhi) + big(xlo))
        ))
    end

    @testset "log2_1" begin
        _test(Dict(
            "fn" => "log2_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => x -> abs(x),
            "compute" => x -> log2(big(x))
        ))
    end

    @testset "log2_2" begin
        _test(Dict(
            "fn" => "log2_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => ((xhi, xlo),) -> xhi < 0 ? ((-xhi, -xlo),) : ((xhi, xlo),),
            "compute" => ((xhi, xlo),) -> log2(big(xhi) + big(xlo))
        ))
    end

    @testset "log10_1" begin
        _test(Dict(
            "fn" => "log10_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => x -> abs(x),
            "compute" => x -> log10(big(x))
        ))
    end

    @testset "log10_2" begin
        _test(Dict(
            "fn" => "log10_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => ((xhi, xlo),) -> xhi < 0 ? ((-xhi, -xlo),) : ((xhi, xlo),),
            "compute" => ((xhi, xlo),) -> log10(big(xhi) + big(xlo))
        ))
    end
end

println()
@testset verbose = true "Roots ───────────────────" begin ######################

    @testset "sqrt1" begin
        _test(Dict(
            "fn" => "sqrt1",
            "args" => args_list.op1,
            "rel_err_bound" => 25u^2/8,
            "process_args" => x -> abs(x),
            "compute" => x -> sqrt(big(x))
        ))
    end

    @testset "sqrt2" begin
        _test(Dict(
            "fn" => "sqrt2",
            "args" => args_list.op2,
            "rel_err_bound" => 25u^2/8,
            "process_args" => ((xhi, xlo),) -> xhi < 0 ? ((-xhi, -xlo),) : ((xhi, xlo),),
            "compute" => ((xhi, xlo),) -> sqrt(big(xhi) + big(xlo))
        ))
    end

    @testset "cbrt1" begin
        _test(Dict(
            "fn" => "cbrt1",
            "args" => args_list.op1,
            "rel_err_bound" => 25u^2,
            "compute" => x -> cbrt(big(x))
        ))
    end

    @testset "cbrt2" begin
        _test(Dict(
            "fn" => "cbrt2",
            "args" => args_list.op2,
            "rel_err_bound" => 25u^2,
            "compute" => ((xhi, xlo),) -> cbrt(big(xhi) + big(xlo))
        ))
    end

    @testset "nthroot1" begin
        _test(Dict(
            "fn" => "nthroot1",
            "args" => args_list.op1n,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => (x, n) -> (x < 0 && iseven(n) ? -x : x, abs(n)),
            "compute" => (x, n) -> sign(x) * big(abs(x))^inv(big(n))
        ))
    end

    @testset "nthroot2" begin
        _test(Dict(
            "fn" => "nthroot2",
            "args" => args_list.op2n,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => ((xhi,xlo), n) -> (xhi<0 && iseven(n) ? (-xhi,-xlo) : (xhi,xlo), abs(n)),
            "compute" => function((xhi, xlo), n)
                x = big(xhi) + big(xlo)
                sign(x) * big(abs(x))^inv(big(n))
            end
        ))
    end
end

println()
@testset verbose = true "Modular Arithmetic ──────" begin ######################

    @testset "rempi_1" begin
        _test(Dict(
            "fn" => "rempi_1",
            "args" => args_list.op1,
            "rel_err_bound" => 10u^2,
            "compute" => x -> rem(big(x), big(pi), RoundToZero)
        ))
    end

    @testset "rempi_2" begin
        _test(Dict(
            "fn" => "rempi_2",
            "args" => args_list.op2,
            "rel_err_bound" => 25u^2,
            "compute" => ((xhi, xlo),) -> rem(big(xhi) + big(xlo), big(pi), RoundToZero)
        ))
    end
    @testset "rem2pi_1" begin
        _test(Dict(
            "fn" => "rem2pi_1",
            "args" => args_list.op1,
            "rel_err_bound" => 10u^2,
            "compute" => x -> rem2pi(big(x), RoundToZero)
        ))
    end

    @testset "rem2pi_2" begin
        _test(Dict(
            "fn" => "rem2pi_2",
            "args" => args_list.op2,
            "rel_err_bound" => 25u^2,
            "compute" => ((xhi, xlo),) -> rem2pi(big(xhi) + big(xlo), RoundToZero)
        ))
    end
end

println()
@testset verbose = true "Trigonometric functions ─" begin ######################

    @testset "sin1" begin
        _test(Dict(
            "fn" => "sin1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> sin(big(x))
        ))
    end

    @testset "sin2" begin
        _test(Dict(
            "fn" => "sin2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> sin(big(xhi) + big(xlo))
        ))
    end

    @testset "cos1" begin
        _test(Dict(
            "fn" => "cos1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> cos(big(x))
        ))
    end

    @testset "cos2" begin
        _test(Dict(
            "fn" => "cos2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> cos(big(xhi) + big(xlo))
        ))
    end

    @testset "tan1" begin
        _test(Dict(
            "fn" => "tan1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> tan(big(x))
        ))
    end

    @testset "tan2" begin
        _test(Dict(
            "fn" => "tan2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> tan(big(xhi) + big(xlo))
        ))
    end

    @testset "cot1" begin
        _test(Dict(
            "fn" => "cot1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> cot(big(x))
        ))
    end

    @testset "cot2" begin
        _test(Dict(
            "fn" => "cot2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> cot(big(xhi) + big(xlo))
        ))
    end

    @testset "sec1" begin
        _test(Dict(
            "fn" => "sec1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> sec(big(x))
        ))
    end

    @testset "sec2" begin
        _test(Dict(
            "fn" => "sec2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> sec(big(xhi) + big(xlo))
        ))
    end

    @testset "csc1" begin
        _test(Dict(
            "fn" => "csc1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => x -> csc(big(x))
        ))
    end

    @testset "csc2" begin
        _test(Dict(
            "fn" => "csc2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "compute" => ((xhi, xlo),) -> csc(big(xhi) + big(xlo))
        ))
    end
end

println()
@testset verbose = true "Hyperbolic functions ────" begin ######################

    @testset "sinh1" begin
        _test(Dict(
            "fn" => "sinh1",
            "args" => args_list.exp1,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => x -> sinh(big(x)),
            "underflow" => (r, (x,)) -> abs(u^2 * exp(big(x))) < ε₀
        ))
    end

    @testset "sinh2" begin
        _test(Dict(
            "fn" => "sinh2",
            "args" => args_list.exp2,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => ((xhi, xlo),) -> sinh(big(xhi) + big(xlo)),
            "underflow" => (r, ((xhi, xlo),)) -> abs(u^2 * exp(big(xhi) + big(xlo))) < ε₀
        ))
    end

    @testset "cosh1" begin
        _test(Dict(
            "fn" => "cosh1",
            "args" => args_list.exp1,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => x -> cosh(big(x)),
            "underflow" => (r, (x,)) -> abs(u^2 * exp(big(x))) < ε₀
        ))
    end

    @testset "cosh2" begin
        _test(Dict(
            "fn" => "cosh2",
            "args" => args_list.exp2,
            "rel_err_bound_uf" => big(2.0)^-75,
            "compute" => ((xhi, xlo),) -> cosh(big(xhi) + big(xlo)),
            "underflow" => (r, ((xhi, xlo),)) -> abs(u^2 * exp(big(xhi) + big(xlo))) < ε₀
        ))
    end

    @testset "tanh1" begin
        _test(Dict(
            "fn" => "tanh1",
            "args" => args_list.exp1,
            # "rel_err_bound" => big(2.0)^-95,
            "process_args" => x -> x % 37,
            "compute" => x -> tanh(big(x))
        ))
    end

    @testset "tanh2" begin
        _test(Dict(
            "fn" => "tanh2",
            "args" => args_list.exp2,
            "process_args" => ((xhi, xlo),) -> (twosum(xhi % 37, xlo),),
            "compute" => ((xhi, xlo),) -> tanh(big(xhi) + big(xlo))
        ))
    end

    @testset "coth1" begin
        _test(Dict(
            "fn" => "coth1",
            "args" => args_list.exp1,
            "process_args" => x -> x % 37,
            "compute" => x -> coth(big(x)),
            "underflow" => (r, (x,)) -> abs(u^2 * exp(big(x))) < ε₀
        ))
    end

    @testset "coth2" begin
        _test(Dict(
            "fn" => "coth2",
            "args" => args_list.exp2,
            "process_args" => ((xhi, xlo),) -> (twosum(xhi % 37, xlo),),
            "compute" => ((xhi, xlo),) -> coth(big(xhi) + big(xlo)),
            "underflow" => (r, ((xhi, xlo),)) -> abs(u^2 * exp(big(xhi) + big(xlo))) < ε₀
        ))
    end

    @testset "sech1" begin
        _test(Dict(
            "fn" => "sech1",
            "args" => args_list.exp1,
            "compute" => x -> sech(big(x))
        ))
    end

    @testset "sech2" begin
        _test(Dict(
            "fn" => "sech2",
            "args" => args_list.exp2,
            "compute" => ((xhi, xlo),) -> sech(big(xhi) + big(xlo))
        ))
    end

    @testset "csch1" begin
        _test(Dict(
            "fn" => "csch1",
            "args" => args_list.exp1,
            "compute" => x -> csch(big(x))
        ))
    end

    @testset "csch2" begin
        _test(Dict(
            "fn" => "csch2",
            "args" => args_list.exp2,
            "compute" => ((xhi, xlo),) -> csch(big(xhi) + big(xlo))
        ))
    end
end

###

println()
@testset "Math functions coverage ─" begin
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end

overflowed = filter(((fn , ov_count),) -> ov_count > 0, overflow)
if !isempty(overflowed)
    println()
    @info ["overflow\n ", (rpad(k, 20, ' ') * "$v\n " for (k, v) in overflowed)...] |> join
end
