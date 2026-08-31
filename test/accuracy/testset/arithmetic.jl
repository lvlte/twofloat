# Test the accuracy of twofloat's math functions
# Function inputs/outputs dataset is created by /test/accuracy/pre/math.ts

json = read("$(dirname(@__DIR__))/pre/output/arithmetic.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

merge!(coverage, OrderedDict(keys(fn_output) .=> false))

@testset verbose=verbose "Arithmetic (opa1, opa2)" begin

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

@testset verbose=verbose "Arithmetic (op12)" begin

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
