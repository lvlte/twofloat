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

    @testset "square_1 (EFT)" begin
        _test(Dict(
            "fn" => "square_1",
            "args" => args_list.op1,
            "rel_err_bound" => 0,
            "compute" => x -> big(x)^2,
        ))
    end

    @testset "square_2" begin
        _test(Dict(
            "fn" => "square_2",
            "args" => args_list.op2,
            "rel_err_bound" => 5u^2,
            "compute" => ((xhi, xlo),) -> (big(xhi) + big(xlo))^2
        ))
    end

    @testset "cube_1" begin
        _test(Dict(
            "fn" => "cube_1",
            "args" => args_list.op1,
            "rel_err_bound" => 3u^2/2 + 4u^3,
            "compute" => x -> big(x)^3
        ))
    end

    @testset "cube_2" begin
        _test(Dict(
            "fn" => "cube_2",
            "args" => args_list.op2,
            "rel_err_bound" => 10u^2 + 25u^4,
            "compute" => ((xhi, xlo),) -> (big(xhi) + big(xlo))^3
        ))
    end

    @testset "_linpow_1" begin
        _test(Dict(
            "fn" => "_linpow_1",
            "args" => args_list.op1n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => (x, n) -> (x, abs(n)),
            "compute" => (x, n) -> big(x)^n
        ))
    end


    @testset "_logpow_1" begin
        _test(Dict(
            "fn" => "_logpow_1",
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

    @testset "_linpow_2" begin
        _test(Dict(
            "fn" => "_linpow_2",
            "args" => args_list.op2n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => ((xhi, xlo), n) -> ((xhi, xlo), abs(n)),
            "compute" => ((xhi, xlo), n) -> (big(xhi) + big(xlo))^n
        ))
    end

    @testset "_logpow_2" begin
        _test(Dict(
            "fn" => "_logpow_2",
            "args" => args_list.op2n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => ((xhi, xlo), n) -> ((xhi, xlo), abs(n)),
            "compute" => ((xhi, xlo), n) -> (big(xhi) + big(xlo))^n
        ))
    end

    @testset "powint_1" begin
        _test(Dict(
            "fn" => "powint_1",
            "args" => args_list.op1n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "compute" => (x, n) -> big(x)^n,
            "underflow" => (r, (x, n)) -> n < 0 && abs(u^2/r) < ε₀
        ))
    end

    @testset "powint_2" begin
        _test(Dict(
            "fn" => "powint_2",
            "args" => args_list.op2n,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-95,
            "compute" => ((xhi, xlo), n) -> (big(xhi) + big(xlo))^n,
            "underflow" => (r, (x, n)) -> n < 0 && abs(u^2/r) < ε₀
        ))
    end

    @testset "pow_11" begin
        _test(Dict(
            "fn" => "pow_11",
            "args" => args_list.op11,
            "rel_err_bound_uf" => big(2.0)^-78, # 3ε₀
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => (x, p) -> (abs(x), p),
            "compute" => (x, p) -> big(x)^p
        ))
    end

    @testset "pow_12" begin
        _test(Dict(
            "fn" => "pow_12",
            "args" => args_list.op12,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => (x, p) -> (abs(x), p),
            "compute" => (x, (phi, plo)) -> big(x)^(big(phi) + big(plo))
        ))
    end

    @testset "pow_21" begin
        _test(Dict(
            "fn" => "pow_21",
            "args" => args_list.op21,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => ((xhi, xlo), p) -> xhi < 0 ? ((-xhi, -xlo), p) : ((xhi, xlo), p),
            "compute" => ((xhi, xlo), p) -> (big(xhi) + big(xlo))^p
        ))
    end

    @testset "pow_22" begin
        _test(Dict(
            "fn" => "pow_22",
            "args" => args_list.op22,
            "rel_err_bound_uf" => big(2.0)^-78,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => ((xhi, xlo), p) -> xhi < 0 ? ((-xhi, -xlo), p) : ((xhi, xlo), p),
            "compute" => ((xhi, xlo), (phi, plo)) -> (big(xhi) + big(xlo))^(big(phi) + big(plo))
        ))
    end

    @testset "exp_1" begin
        _test(Dict(
            "fn" => "exp_1",
            "args" => args_list.exp1,
            "rel_err_bound" => 10u^2,
            "compute" => x -> exp(big(x))
        ))
    end

    @testset "exp_2" begin
        _test(Dict(
            "fn" => "exp_2",
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

    @testset "ln_1" begin
        _test(Dict(
            "fn" => "ln_1",
            "args" => args_list.op1,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => x -> abs(x),
            "compute" => x -> log(big(x))
        ))
    end

    @testset "ln_2" begin
        _test(Dict(
            "fn" => "ln_2",
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

    @testset "sqrt_1" begin
        _test(Dict(
            "fn" => "sqrt_1",
            "args" => args_list.op1,
            "rel_err_bound" => 25u^2/8,
            "process_args" => x -> abs(x),
            "compute" => x -> sqrt(big(x))
        ))
    end

    @testset "sqrt_2" begin
        _test(Dict(
            "fn" => "sqrt_2",
            "args" => args_list.op2,
            "rel_err_bound" => 25u^2/8,
            "process_args" => ((xhi, xlo),) -> xhi < 0 ? ((-xhi, -xlo),) : ((xhi, xlo),),
            "compute" => ((xhi, xlo),) -> sqrt(big(xhi) + big(xlo))
        ))
    end

    @testset "cbrt_1" begin
        _test(Dict(
            "fn" => "cbrt_1",
            "args" => args_list.op1,
            "rel_err_bound" => 25u^2,
            "compute" => x -> cbrt(big(x))
        ))
    end

    @testset "cbrt_2" begin
        _test(Dict(
            "fn" => "cbrt_2",
            "args" => args_list.op2,
            "rel_err_bound" => 25u^2,
            "compute" => ((xhi, xlo),) -> cbrt(big(xhi) + big(xlo))
        ))
    end

    @testset "nthroot_1" begin
        _test(Dict(
            "fn" => "nthroot_1",
            "args" => args_list.op1n,
            "rel_err_bound" => big(2.0)^-95,
            "process_args" => (x, n) -> (x < 0 && iseven(n) ? -x : x, abs(n)),
            "compute" => (x, n) -> sign(x) * big(abs(x))^inv(big(n))
        ))
    end

    @testset "nthroot_2" begin
        _test(Dict(
            "fn" => "nthroot_2",
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
                p = 1 + e + (e % 2)
                return (x/2^p,)
            end,
            "compute" => x -> asin(big(x))
        ))
    end

    @testset "asin_2" begin
        _test(Dict(
            "fn" => "asin_2",
            "args" => args_list.op2,
            "rel_err_bound" => big(2.0)^-90,
            "process_args" => function((xhi, xlo),)
                x = big(xhi) + big(xlo)
                abs(x) <= 1 && return ((xhi, xlo),)
                e = exponent(x)
                p = 1 + e + (e % 2)
                return ((xhi/2^p, xlo/2^p),)
            end,
            "compute" => ((xhi, xlo),) -> asin(big(xhi) + big(xlo))
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
