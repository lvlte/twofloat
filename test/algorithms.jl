# Test the accuracy of twofloat's main algorithms
# Relative error bounds: cf. paper from J.M. Muller et al.
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

const u = big(2.0)^-precision(Float64)
const e = big(eps(0.0))

println()
@testset verbose = true "Error-free transforms ───" begin

    @testset "split" begin
        output = fn_output["split"]
        args = args_list.s1
        @test length(args) == length(output)
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            @test x == zhi + zlo == big(zhi) + big(zlo)
        end
    end

    @testset "normalize" begin
        output = fn_output["normalize"]
        args = args_list.s11
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            @test big(x) + big(y) == big(zhi) + big(zlo)
        end
    end

    @testset "twoSum" begin
        output = fn_output["twoSum"]
        args = args_list.s11
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            @test big(x) + big(y) == big(zhi) + big(zlo)
        end
    end

    @testset "twoProd" begin
        output = fn_output["twoProd"]
        args = args_list.s11
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            @test big(x) * big(y) == big(zhi) + big(zlo)
        end
    end
end

println()
@testset verbose = true "Error bounds op21 ───────" begin
    args = args_list.s21

    @testset "add21" begin
        output = fn_output["add21"]
        @test length(args) == length(output)
        rel_err = 2u^2
        abs_err = r -> max(abs(rel_err * r), e)
        for (i, ((xhi, xlo), y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi) + big(y) + big(xlo)
            @test abs(z - r) < abs_err(r)
        end
    end

    @testset "mul21" begin
        output = fn_output["mul21"]
        @test length(args) == length(output)
        rel_err = 3u^2/2 + 4u^3
        abs_err = r -> max(abs(rel_err * r), 2e)
        for (i, ((xhi, xlo), y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi)*big(y) + big(xlo)*big(y)
            @test abs(z - r) < abs_err(r)
        end
    end

    @testset "div21" begin
        output = fn_output["div21"]
        @test length(args) == length(output)
        rel_err = 3u^2
        abs_err = r -> max(abs(rel_err * r), 2e)
        for (i, ((xhi, xlo), y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi)/big(y) + big(xlo)/big(y)
            @test abs(z - r) < abs_err(r)
        end
    end
end

println()
@testset verbose = true "Error bounds op22 ───────" begin
    args = args_list.s22

    @testset "add22" begin
        output = fn_output["add22"]
        @test length(args) == length(output)
        rel_err = 3u^2 + 13u^3
        abs_err = r -> max(abs(rel_err * r), e)
        for (i, ((xhi, xlo), (yhi, ylo))) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi) + big(yhi) + big(xlo) + big(ylo)
            @test abs(z - r) < abs_err(r)
        end
    end

    @testset "mul22" begin
        output = fn_output["mul22"]
        @test length(args) == length(output)
        rel_err = 5u^2
        abs_err = r -> max(abs(rel_err * r), 2.5e)
        for (i, ((xhi, xlo), (yhi, ylo))) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo)) * (big(yhi) + big(ylo))
            @test abs(z - r) < abs_err(r)
        end
    end

    @testset "div22" begin
        output = fn_output["div22"]
        @test length(args) == length(output)
        rel_err = 15u^2 + 56u^3
        abs_err = r -> max(abs(rel_err * r), 2.5e)
        for (i, ((xhi, xlo), (yhi, ylo))) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo)) / (big(yhi) + big(ylo))
            @test abs(z - r) < abs_err(r)
        end
    end
end
