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
        args = args_list.opa1
        output = fn_output["sum1"]
        coverage["sum1"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-88
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, 0)
        for (i, (list,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sum(big.(list))
            if abs(r) > floatmax(Float64)
                overflow["sum1"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                rel_err = abs((z - r) / r)
                if abs(r) ≥ ε₀ && rel_err > max_rel_err[1]
                  max_rel_err = ((rel_err), length(list))
                end
            end
        end
        @info "sum1 max_rel_err" err=max_rel_err[1] n=max_rel_err[2]
    end

    @testset "prod1" begin
        args = args_list.opa1
        output = fn_output["prod1"]
        coverage["prod1"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-88
        abs_err_bound = r -> max(abs(rel_err_bound * r), 3ε₀)
        max_rel_err = (0, 0)
        for (i, (list,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = prod(big.(list))
            if abs(r) > floatmax(Float64)
                overflow["prod1"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                rel_err = abs((z - r) / r)
                if abs(r) ≥ ε₀ && rel_err > max_rel_err[1]
                  max_rel_err = ((rel_err), length(list))
                end
            end
        end
        @info "prod1 max_rel_err" err=max_rel_err[1] n=max_rel_err[2]
        println()
    end

    @testset "sum2" begin
        args = args_list.opa2
        output = fn_output["sum2"]
        coverage["sum2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-88
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, 0)
        for (i, (list,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sum(map(((hi, lo),) -> big(hi) + big(lo), list))
            if abs(r) > floatmax(Float64)
                overflow["sum2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                rel_err = abs((z - r) / r)
                if abs(r) ≥ ε₀ && rel_err > max_rel_err[1]
                  max_rel_err = ((rel_err), length(list))
                end
            end
        end
        @info "sum2 max_rel_err" err=max_rel_err[1] n=max_rel_err[2]
    end

    @testset "prod2" begin
        args = args_list.opa2
        output = fn_output["prod2"]
        coverage["prod2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-88
        abs_err_bound = r -> max(abs(rel_err_bound * r), 3ε₀)
        max_rel_err = (0, 0)
        for (i, (list,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = prod(map(((hi, lo),) -> big(hi) + big(lo), list))
            if abs(r) > floatmax(Float64)
                overflow["prod2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                rel_err = abs((z - r) / r)
                if abs(r) ≥ ε₀ && rel_err > max_rel_err[1]
                  max_rel_err = ((rel_err), length(list))
                end
            end
        end
        @info "prod2 max_rel_err" err=max_rel_err[1] n=max_rel_err[2]
        println()
    end
end

###

println()
@testset "Arithmetic functions coverage ──────" begin
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end

println()
@info ["overflow\n ", (rpad(k, 20, ' ') * "$v\n " for (k, v) in overflow)...] |> join
