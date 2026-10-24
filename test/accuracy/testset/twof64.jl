# Test the accuracy of the twof64 helpers
# Function inputs/outputs dataset is created by /test/accuracy/pre/twof64.ts

# import Base: BigInt, convert

# convert(::Type{BigInt}, x::AbstractString) = BigInt(x)
# BigInt(x::AbstractString) = parse(BigInt, x);

json = read("$(dirname(@__DIR__))/pre/output/twof64.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

merge!(coverage, OrderedDict(keys(fn_output) .=> false))

@testset verbose=verbose "TwoF64 from various number repr" begin

    @testset "fromLiteral" begin
        _test(Dict(
            "fn" => "fromLiteral",
            "args" => args_list.op1,
            "rel_err_bound" => u^2,
            "compute" => x -> BigFloat("$x"),
        ))
    end

    @testset "fromLiteral (no bigint)" begin
        _test(Dict(
            "fn" => "fromLiteralNoBigInt",
            "args" => args_list.op1,
            "rel_err_bound" => 8u^2,
            "compute" => x -> BigFloat("$x"),
        ))
    end

    @testset "fromRational" begin
        _test(Dict(
            "fn" => "fromRational",
            "args" => args_list.r,
            "rel_err_bound" => u^2,
            "process_args" => r -> Rational{BigInt}(r...),
            "compute" => r -> BigFloat(r),
        ))
    end
end
