# Test the accuracy of twofloat's math functions
# Function inputs/outputs dataset is created by /test/error-bound/math.ts

include("./common.jl")

json = read("$(@__DIR__)/math-testset.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

coverage = Dict(keys(fn_output) .=> false)
overflow = Dict(keys(fn_output) .=> 0)

println()
@testset verbose = true "Exponentiation ──────────" begin ######################

    @testset "square1" begin
        args = args_list.op1
        output = fn_output["square1"]
        coverage["square1"] = true
        @test length(args) == length(output)
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^2
            if abs(r) > floatmax(Float64)
                overflow["square1"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test z == r
            end
        end
    end

    @testset "square2" begin
        args = args_list.op2
        output = fn_output["square2"]
        coverage["square2"] = true
        @test length(args) == length(output)
        rel_err = 5u^2
        abs_err = r -> max(abs(rel_err * r), 2ε₀)
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo))^2
            if abs(r) > floatmax(Float64)
                overflow["square2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end

    @testset "cube1" begin
        args = args_list.op1
        output = fn_output["cube1"]
        coverage["cube1"] = true
        @test length(args) == length(output)
        rel_err = 3u^2/2 + 4u^3 # (3u^2 if underflow)
        abs_err = r -> max(abs(rel_err * r), 2ε₀)
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^3
            if abs(r) > floatmax(Float64)
                overflow["cube1"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end

    @testset "cube2" begin
        args = args_list.op2
        output = fn_output["cube2"]
        coverage["cube2"] = true
        @test length(args) == length(output)
        rel_err = 10u^2
        abs_err = r -> max(abs(rel_err * r), 2ε₀)
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo))^3
            if abs(r) > floatmax(Float64)
                overflow["cube2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err(r)
            end
        end
    end
end

println()
@testset verbose = true "Roots ───────────────────" begin ######################

    @testset "sqrt1" begin
        args = args_list.op1
        output = fn_output["sqrt1"]
        coverage["sqrt1"] = true
        @test length(args) == length(output)
        rel_err = 25u^2/8
        abs_err = r -> max(abs(rel_err * r), ε₀)
        for (i, (x,)) in enumerate(args)
            x = abs(x)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sqrt(big(x))
            @test abs(z - r) < abs_err(r)
        end
    end

    @testset "sqrt2" begin
        args = args_list.op2
        output = fn_output["sqrt2"]
        coverage["sqrt2"] = true
        @test length(args) == length(output)
        rel_err = 25u^2/8
        abs_err = r -> max(abs(rel_err * r), ε₀)
        for (i, ((xhi, xlo),)) in enumerate(args)
            xhi, xlo = xhi < 0 ? (-xhi, -xlo) : (xhi, xlo)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sqrt(big(xhi) + big(xlo))
            @test abs(z - r) < abs_err(r)
        end
    end
end

###

println()
@testset "Math functions coverage ──────" begin
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end

println()
@info ["overflow\n ", (rpad(k, 20, ' ') * "$v\n " for (k, v) in overflow)...] |> join
