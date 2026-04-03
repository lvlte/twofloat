# Test the accuracy of twofloat's main algorithms
# Relative error bounds: cf. paper from J.M. Muller et al.
# Function inputs/outputs dataset is created by /test/algorithms.ts

using Test
using JSON

setprecision(BigFloat, 512)

const TwoF64 = Tuple{Float64, Float64}

struct ArgsList
    op1::Vector{Tuple{Float64}}
    op2::Vector{Tuple{TwoF64}}
    op11::Vector{Tuple{Float64, Float64}}
    op21::Vector{Tuple{TwoF64, Float64}}
    op22::Vector{Tuple{TwoF64, TwoF64}}
end

struct TestSet
    argsList::ArgsList
    fnOutput::Dict{String, Vector{TwoF64}}
end

json = read("$(@__DIR__)/algorithms-testset.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

coverage = Dict(keys(fn_output) .=> false)

const split_max = prevfloat(floatmax(Float64)/(2^27 + 1))
const u = big(2.0)^-precision(Float64)
const ε₀ = big(eps(0.0))

println()
@testset verbose = true "Error-Free Transforms ───" begin ######################

    @testset "split" begin
        output = fn_output["split"]
        args = args_list.op1
        coverage["split"] = true
        @test length(args) == length(output)
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            if abs(x) > split_max
                # overflow
                @test isnan(zhi + zlo)
            else
                @test x == zhi + zlo == big(zhi) + big(zlo)
            end
        end
    end

    @testset "normalize" begin
        output = fn_output["normalize"]
        args = args_list.op11
        coverage["normalize"] = true
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x) + big(y)
            if abs(z) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test z == r
            end
        end
    end

    @testset "twoSum" begin
        output = fn_output["twoSum"]
        args = args_list.op11
        coverage["twoSum"] = true
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x) + big(y)
            if abs(z) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test z == r
            end
        end
    end

    @testset "twoProd" begin
        output = fn_output["twoProd"]
        args = args_list.op11
        coverage["twoProd"] = true
        @test length(args) == length(output)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x) * big(y)
            if abs(r) > floatmax(Float64) || abs(x) > split_max || abs(y) > split_max
                # overflow
                @test !isfinite(zhi + zlo)
            elseif abs(zlo) < floatmin(Float64)
                # most likely underflow
                @test abs(z - r) < 1.5ε₀
            else
                @test z == r
            end
        end
    end
end

println()
@testset verbose = true "Error bounds op21 ───────" begin ######################
    args = args_list.op21

    @testset "DWPlusFP" begin
        output = fn_output["DWPlusFP"]
        coverage["DWPlusFP"] = true
        @test length(args) == length(output)
        rel_err = 2u^2
        abs_err = r -> max(abs(rel_err * r), ε₀)
        for (i, ((xhi, xlo), y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi) + big(y) + big(xlo)
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end

    @testset "DWTimesFP1" begin
        output = fn_output["DWTimesFP1"]
        coverage["DWTimesFP1"] = true
        @test length(args) == length(output)
        rel_err = 1.5u^2 + 4u^3
        abs_err = r -> max(abs(rel_err * r), 2ε₀)
        for (i, ((xhi, xlo), y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi)*big(y) + big(xlo)*big(y)
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end

    @testset "DWDivFP3" begin
        output = fn_output["DWDivFP3"]
        coverage["DWDivFP3"] = true
        @test length(args) == length(output)
        rel_err = 3u^2
        abs_err = r -> max(abs(rel_err * r), 2ε₀)
        for (i, ((xhi, xlo), y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi)/big(y) + big(xlo)/big(y)
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end
end

println()
@testset verbose = true "Error bounds op22 ───────" begin ######################
    args = args_list.op22

    @testset "AccurateDWPlusDW" begin
        output = fn_output["AccurateDWPlusDW"]
        coverage["AccurateDWPlusDW"] = true
        @test length(args) == length(output)
        rel_err = 3u^2 + 13u^3
        abs_err = r -> max(abs(rel_err * r), ε₀)
        for (i, ((xhi, xlo), (yhi, ylo))) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(xhi) + big(yhi) + big(xlo) + big(ylo)
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end

    @testset "DWTimesDW1" begin
        output = fn_output["DWTimesDW1"]
        coverage["DWTimesDW1"] = true
        @test length(args) == length(output)
        rel_err = 5u^2
        abs_err = r -> max(abs(rel_err * r), 2.5ε₀)
        for (i, ((xhi, xlo), (yhi, ylo))) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo)) * (big(yhi) + big(ylo))
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end

    @testset "DWDivDW2" begin
        output = fn_output["DWDivDW2"]
        coverage["DWDivDW2"] = true
        @test length(args) == length(output)
        rel_err = 15u^2 + 56u^3
        abs_err = r -> max(abs(rel_err * r), 2.5ε₀)
        for (i, ((xhi, xlo), (yhi, ylo))) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo)) / (big(yhi) + big(ylo))
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end
end

println()
@testset verbose = true "Error bounds op1 ────────" begin ######################
    args = args_list.op1

    @testset "twoInv" begin
        output = fn_output["twoInv"]
        coverage["twoInv"] = true
        @test length(args) == length(output)
        rel_err = 3u^2
        abs_err = r -> max(abs(rel_err * r), ε₀)
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = inv(big(x))
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end
end

println()
@testset verbose = true "Error bounds op11 ───────" begin ######################
    args = args_list.op11

    @testset "twoDiv" begin
        output = fn_output["twoDiv"]
        coverage["twoDiv"] = true
        @test length(args) == length(output)
        rel_err = 3u^2
        abs_err = r -> max(abs(rel_err * r), ε₀)
        for (i, (x, y)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x) / big(y)
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end
end

println()
@testset verbose = true "Error bounds op2 ────────" begin ######################
    args = args_list.op2

    @testset "DWInv" begin
        output = fn_output["DWInv"]
        coverage["DWInv"] = true
        @test length(args) == length(output)
        rel_err = 15u^2 + 56u^3
        abs_err = r -> max(abs(rel_err * r), ε₀)
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(1.0) / (big(xhi) + big(xlo))
            if abs(r) > floatmax(Float64)
                # overflow
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end
end

###

println()
@testset "Algorithm coverage ──────" begin
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end
