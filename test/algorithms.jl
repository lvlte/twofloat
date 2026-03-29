# Test the accuracy of twofloat's main algorithms
# Function inputs/outputs dataset is created by /test/algorithms.ts

using Test
using JSON

setprecision(BigFloat, 512)

const TwoF64 = Tuple{Float64, Float64}

struct ArgsList
    s1::Vector{Tuple{Float64}}
    s11::Vector{Tuple{Float64, Float64}}
    s21::Vector{Tuple{TwoF64, Float64}}
    s22::Vector{Tuple{TwoF64, TwoF64}}
end

struct TestSet
    argsList::ArgsList
    fnOutput::Dict{String, Vector{TwoF64}}
end

json = read("test/algorithms-testset.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

@testset "Error-free transforms" begin

    @testset "split is error-free" begin
        output = fn_output["split"]
        args = args_list.s1
        @test length(args) == length(output)
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            @test x == zhi + zlo == big(zhi) + big(zlo)
        end
    end

    @testset "normalize is error-free" begin
        output = fn_output["normalize"]
        args = args_list.s11
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            @test big(x) + big(y) == big(zhi) + big(zlo)
        end
    end

    @testset "twoSum is error-free" begin
        output = fn_output["twoSum"]
        args = args_list.s11
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            @test big(x) + big(y) == big(zhi) + big(zlo)
        end
    end

    @testset "twoProd is error-free" begin
        output = fn_output["twoProd"]
        args = args_list.s11
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            big(x) * big(y) == big(zhi) + big(zlo)
        end
    end
end
