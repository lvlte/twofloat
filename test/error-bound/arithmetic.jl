# Test the accuracy of twofloat's math functions
# Function inputs/outputs dataset is created by /test/error-bound/math.ts

json = read("$(@__DIR__)/testset/arithmetic.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

coverage = Dict(keys(fn_output) .=> false)
overflow = Dict(keys(fn_output) .=> 0)

println()
@testset verbose = true "Arithmetic (opa1, opa2) ─" begin ######################
    @testset "sum1" begin
        _test(Dict(
            "fn" => "sum1",
            "args" => args_list.opa1,
            "rel_err_bound" => big(2.0)^-88,
            "compute" => list -> sum(big.(list))
        ))
    end

    @testset "prod1" begin
        _test(Dict(
            "fn" => "prod1",
            "args" => args_list.opa1,
            "rel_err_bound" => big(2.0)^-88,
            "compute" => list -> prod(big.(list))
        ))
    end

    @testset "sum2" begin
        _test(Dict(
            "fn" => "sum2",
            "args" => args_list.opa2,
            "rel_err_bound" => big(2.0)^-88,
            "compute" => list -> sum(map(((hi, lo),) -> big(hi) + big(lo), list))
        ))
    end

    @testset "prod2" begin
        _test(Dict(
            "fn" => "prod2",
            "args" => args_list.opa2,
            "rel_err_bound" => big(2.0)^-88,
            "compute" => list -> prod(map(((hi, lo),) -> big(hi) + big(lo), list))
        ))
    end
end

println()
@testset verbose = true "Arithmetic (op12) ───────" begin ######################

    @testset "sub12" begin
        _test(Dict(
            "fn" => "sub12",
            "args" => args_list.op12,
            "rel_err_bound" => 2u^2,
            "compute" => (x, (yhi, ylo)) -> big(x) - (big(yhi) + big(ylo))
        ))
    end
    @testset "div12" begin
        _test(Dict(
            "fn" => "div12",
            "args" => args_list.op12,
            "rel_err_bound" => 15u^2 + 56u^3,
            "compute" => (x, (yhi, ylo)) -> big(x) / (big(yhi) + big(ylo))
        ))
    end
end
###

println()
@testset "Arithmetic coverage ─────" begin
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end

overflowed = filter(((fn , ov_count),) -> ov_count > 0, overflow)
if !isempty(overflowed)
    println()
    @info ["overflow\n ", (rpad(k, 20, ' ') * "$v\n " for (k, v) in overflowed)...] |> join
end
