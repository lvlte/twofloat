# Test the accuracy of twofloat's math functions
# Function inputs/outputs dataset is created by /test/error-bound/math.ts

json = read("$(@__DIR__)/testset/math.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

coverage = Dict(keys(fn_output) .=> false)
overflow = Dict(keys(fn_output) .=> 0)

println()
@testset verbose = true "Exponentiation ──────────" begin ######################

    @testset "square1 (EFT)" begin
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
        rel_err_bound = 5u^2
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo))^2
            if abs(r) > floatmax(Float64)
                overflow["square2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
            end
        end
    end

    @testset "cube1" begin
        args = args_list.op1
        output = fn_output["cube1"]
        coverage["cube1"] = true
        @test length(args) == length(output)
        rel_err_bound = 3u^2/2 + 4u^3 # (3u^2 if underflow)
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^3
            if abs(r) > floatmax(Float64)
                overflow["cube1"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
            end
        end
    end

    @testset "cube2" begin
        args = args_list.op2
        output = fn_output["cube2"]
        coverage["cube2"] = true
        @test length(args) == length(output)
        rel_err_bound = 10u^2 + 25u^4
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo))^3
            if abs(r) > floatmax(Float64)
                overflow["cube2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
            end
        end
    end

    @testset "_linpow" begin
        args = args_list.op1n
        output = fn_output["_linpow"]
        coverage["_linpow"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x, n)) in enumerate(args)
            n = abs(n)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^n
            if abs(r) > floatmax(Float64)
                overflow["_linpow"] += 1
                @test !isfinite(zhi + zlo)
            elseif abs(z - r) >= abs_err_bound(r)
                @error "_linpow" x n (zhi, zlo) z r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), x, n)
                end
            end
        end
        err, x, n = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "_linpow max rel err" err x n
        @info "_linpow avg rel err" avg
        println()
    end


    @testset "_logpow" begin
        args = args_list.op1n
        output = fn_output["_logpow"]
        coverage["_logpow"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x, n)) in enumerate(args)
            n = abs(n)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^n
            if abs(r) > floatmax(Float64)
                overflow["_logpow"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), x, n)
                end
            end
        end
        err, x, n = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "_logpow max rel err" err x n
        @info "_logpow avg rel err" avg
        println()
    end

    @testset "_logpowltr" begin
        args = args_list.op1n
        output = fn_output["_logpowltr"]
        coverage["_logpowltr"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x, n)) in enumerate(args)
            n = abs(n)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^n
            if abs(r) > floatmax(Float64)
                overflow["_logpowltr"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), x, n)
                end
            end
        end
        err, x, n = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "_logpowltr max rel err" err x n
        @info "_logpowltr avg rel err" avg
        println()
    end

    @testset "_linpow2" begin
        args = args_list.op2n
        output = fn_output["_linpow2"]
        coverage["_linpow2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, (0, 0), 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo), n)) in enumerate(args)
            n = abs(n)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo))^n
            if abs(r) > floatmax(Float64)
                overflow["_linpow2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), (xhi, xlo), n)
                end
            end
        end
        err, x, n = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "_linpow2 max rel err" err x n
        @info "_linpow2 avg rel err" avg
        println()
    end

    @testset "_logpow2" begin
        args = args_list.op2n
        output = fn_output["_logpow2"]
        coverage["_logpow2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, (0, 0), 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo), n)) in enumerate(args)
            n = abs(n)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = (big(xhi) + big(xlo))^n
            if abs(r) > floatmax(Float64)
                overflow["_logpow2"] += 1
                @test !isfinite(zhi + zlo)
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), (xhi, xlo), n)
                end
            end
        end
        err, x, n = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "_logpow2 max rel err" err x n
        @info "_logpow2 avg rel err" avg
        println()
    end

    @testset "pow1int" begin
        args = args_list.op1n
        output = fn_output["pow1int"]
        coverage["pow1int"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x, n)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^n
            if abs(r) > floatmax(Float64)
                overflow["pow1int"] += 1
                @test !isfinite(zhi + zlo)
            elseif abs(r) > 2^916 && isnan(z)
                overflow["pow1int"] += 1
                @error "NaN (overflow but could be avoided)" x n (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                n < 0 && abs(u^2 / r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), x, n)
                end
            end
        end
        err, x, n = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "pow1int max rel err" err x n
        @info "pow1int avg rel err" avg
        println()
    end

    @testset "pow2int" begin
        args = args_list.op2n
        output = fn_output["pow2int"]
        coverage["pow2int"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, (0, 0), 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo), n)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            x = big(xhi) + big(xlo)
            r = x^n
            if abs(r) > floatmax(Float64)
                overflow["pow2int"] += 1
                @test !isfinite(zhi + zlo)
            elseif abs(r) > 2^916 && isnan(z)
                overflow["pow2int"] += 1
                @error "NaN (overflow but could be avoided)" (xhi, xlo) n (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                n < 0 && abs(u^2 / r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), (xhi, xlo), n)
                end
            end
        end
        err, x, n = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "pow2int max rel err" err x n
        @info "pow2int avg rel err" avg
        println()
    end

    @testset "pow11" begin
        args = args_list.op11
        output = fn_output["pow11"]
        coverage["pow11"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 3ε₀)
        max_rel_err = (0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x, p)) in enumerate(args)
            x = abs(x)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^p
            if abs(r) > floatmax(Float64)
                overflow["pow11"] += 1
                @test !isfinite(zhi + zlo)
            elseif abs(r) > 2^916 && isnan(z)
                overflow["pow11"] += 1
                @error "NaN (overflow but could be avoided)" x p (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), x, p)
                end
            end
        end
        err, x, p = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "pow11 max rel err" err x p
        @info "pow11 avg rel err" avg
        println()
    end

    @testset "pow12" begin
        args = args_list.op12
        output = fn_output["pow12"]
        coverage["pow12"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 3ε₀)
        max_rel_err = (0, 0, (0, 0))
        avg_psum, avg_n = big(0.0), 0
        for (i, (x, (phi, plo))) in enumerate(args)
            x = abs(x)
            p = big(phi) + big(plo)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = big(x)^p
            if abs(r) > floatmax(Float64)
                overflow["pow12"] += 1
                @test !isfinite(zhi + zlo)
            elseif abs(r) > 2^916 && isnan(z)
                overflow["pow12"] += 1
                @error "NaN (overflow but could be avoided)" x (phi, plo) (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), x, (phi, plo))
                end
            end
        end
        err, x, p = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "pow12 max rel err" err x p
        @info "pow12 avg rel err" avg
        println()
    end

    @testset "pow21" begin
        args = args_list.op21
        output = fn_output["pow21"]
        coverage["pow21"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 3ε₀)
        max_rel_err = (0, (0, 0), 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo), p)) in enumerate(args)
            xhi, xlo = xhi < 0 ? (-xhi, -xlo) : (xhi, xlo)
            x = abs(big(xhi) + big(xlo))
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = x^p
            if abs(r) > floatmax(Float64)
                overflow["pow21"] += 1
                @test !isfinite(zhi + zlo)
            elseif abs(r) > 2^916 && isnan(z)
                overflow["pow21"] += 1
                @error "NaN (overflow but could be avoided)" (xhi, xlo) p (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), (xhi, xlo), p)
                end
            end
        end
        err, x, p = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "pow21 max rel err" err x p
        @info "pow21 avg rel err" avg
        println()
    end

    @testset "pow22" begin
        args = args_list.op22
        output = fn_output["pow22"]
        coverage["pow22"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-78
        abs_err_bound = r -> max(abs(rel_err_bound * r), 3ε₀)
        max_rel_err = (0, (0, 0), (0, 0))
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo), (phi, plo))) in enumerate(args)
            xhi, xlo = xhi < 0 ? (-xhi, -xlo) : (xhi, xlo)
            x = abs(big(xhi) + big(xlo))
            p = big(phi) + big(plo)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = x^p
            if abs(r) > floatmax(Float64)
                overflow["pow22"] += 1
                @test !isfinite(zhi + zlo)
            elseif abs(r) > 2^916 && isnan(z)
                overflow["pow22"] += 1
                @error "NaN (overflow but could be avoided)" (xhi, xlo) (phi, plo) (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                  max_rel_err = (Float64(rel_err), (xhi, xlo), (phi, plo))
                end
            end
        end
        err, x, p = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "pow22 max rel err" err x p
        @info "pow22 avg rel err" avg
        println()
    end

    @testset "exp1" begin
        args = args_list.exp1
        output = fn_output["exp1"]
        coverage["exp1"] = true
        @test length(args) == length(output)
        rel_err_bound = 10u^2
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = exp(big(x))
            if abs(r) > floatmax(Float64)
                overflow["exp1"] += 1
                @test !isfinite(zhi + zlo)
            elseif isnan(z)
                overflow["exp1"] += 1
                # @error "NaN (overflow but could be avoided)" x (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                    max_rel_err = (Float64(rel_err), x, z, r)
                end
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "exp1 max rel err" err x # z r
        @info "exp1 avg rel err" avg
        println()
    end

    @testset "exp2" begin
        args = args_list.exp2
        output = fn_output["exp2"]
        coverage["exp2"] = true
        @test length(args) == length(output)
        rel_err_bound = 10u^2
        abs_err_bound = r -> max(abs(rel_err_bound * r), 2.5ε₀)
        max_rel_err = (0, 0, 0,0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = exp(big(xhi) + big(xlo))
            if abs(r) > floatmax(Float64)
                overflow["exp2"] += 1
                @test !isfinite(zhi + zlo)
            elseif isnan(z)
                overflow["exp2"] += 1
                # @error "NaN (overflow but could be avoided)" (xhi, xlo) (zhi, zlo) r
            else
                @test abs(z - r) < abs_err_bound(r)
                abs(u^2 * r) < ε₀ && continue # underflow
                rel_err = abs((z - r) / r)
                avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
                if rel_err > max_rel_err[1]
                    max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
                end
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "exp2 max rel err" err x # z r
        @info "exp2 avg rel err" avg
        println()
    end
end

println()
@testset verbose = true "Logarithms ──────────────" begin ######################

    @testset "ln1" begin
        args = args_list.op1
        output = fn_output["ln1"]
        coverage["ln1"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-85
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            x = abs(x)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = log(big(x))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), x, z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "ln1 max rel err" err x z r
        @info "ln1 avg rel err" avg
        println()
    end

    @testset "ln2" begin
        args = args_list.op2
        output = fn_output["ln2"]
        coverage["ln2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-85
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0,0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            xhi, xlo = xhi < 0 ? (-xhi, -xlo) : (xhi, xlo)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = log(big(xhi) + big(xlo))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "ln2 max rel err" err x z r
        @info "ln2 avg rel err" avg
        println()
    end

    @testset "log2_1" begin
        args = args_list.op1
        output = fn_output["log2_1"]
        coverage["log2_1"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-85
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            x = abs(x)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = log2(big(x))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), x, z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "log2_1 max rel err" err x z r
        @info "log2_1 avg rel err" avg
        println()
    end

    @testset "log2_2" begin
        args = args_list.op2
        output = fn_output["log2_2"]
        coverage["log2_2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-85
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0,0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            xhi, xlo = xhi < 0 ? (-xhi, -xlo) : (xhi, xlo)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = log2(big(xhi) + big(xlo))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "log2_2 max rel err" err x z r
        @info "log2_2 avg rel err" avg
        println()
    end

    @testset "log10_1" begin
        args = args_list.op1
        output = fn_output["log10_1"]
        coverage["log10_1"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-85
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            x = abs(x)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = log10(big(x))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), x, z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "log10_1 max rel err" err x z r
        @info "log10_1 avg rel err" avg
        println()
    end

    @testset "log10_2" begin
        args = args_list.op2
        output = fn_output["log10_2"]
        coverage["log10_2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-85
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0,0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            xhi, xlo = xhi < 0 ? (-xhi, -xlo) : (xhi, xlo)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = log10(big(xhi) + big(xlo))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "log10_2 max rel err" err x z r
        @info "log10_2 avg rel err" avg
        println()
    end
end

println()
@testset verbose = true "Roots ───────────────────" begin ######################

    @testset "sqrt1" begin
        args = args_list.op1
        output = fn_output["sqrt1"]
        coverage["sqrt1"] = true
        @test length(args) == length(output)
        rel_err_bound = 25u^2/8
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        for (i, (x,)) in enumerate(args)
            x = abs(x)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sqrt(big(x))
            @test abs(z - r) < abs_err_bound(r)
        end
    end

    @testset "sqrt2" begin
        args = args_list.op2
        output = fn_output["sqrt2"]
        coverage["sqrt2"] = true
        @test length(args) == length(output)
        rel_err_bound = 25u^2/8
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        for (i, ((xhi, xlo),)) in enumerate(args)
            xhi, xlo = xhi < 0 ? (-xhi, -xlo) : (xhi, xlo)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sqrt(big(xhi) + big(xlo))
            @test abs(z - r) < abs_err_bound(r)
        end
    end
end

println()
@testset verbose = true "Modular Arithmetic ──────" begin ######################

    @testset "rempi_1" begin
        args = args_list.op1
        output = fn_output["rempi_1"]
        coverage["rempi_1"] = true
        @test length(args) == length(output)
        rel_err_bound = 10u^2
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = rem(big(x), big(pi), RoundToZero)
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), x, z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "rempi_1 max rel err" err x z r
        @info "rempi_1 avg rel err" avg
        println()
    end

    @testset "rempi_2" begin
        args = args_list.op2
        output = fn_output["rempi_2"]
        coverage["rempi_2"] = true
        @test length(args) == length(output)
        rel_err_bound = 25u^2
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = rem(big(xhi) + big(xlo), big(pi), RoundToZero)
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "rempi_2 max rel err" err x z r
        @info "rempi_2 avg rel err" avg
        println()
    end
    @testset "rem2pi_1" begin
        args = args_list.op1
        output = fn_output["rem2pi_1"]
        coverage["rem2pi_1"] = true
        @test length(args) == length(output)
        rel_err_bound = 10u^2
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = rem2pi(big(x), RoundToZero)
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), x, z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "rem2pi_1 max rel err" err x z r
        @info "rem2pi_1 avg rel err" avg
        println()
    end

    @testset "rem2pi_2" begin
        args = args_list.op2
        output = fn_output["rem2pi_2"]
        coverage["rem2pi_2"] = true
        @test length(args) == length(output)
        rel_err_bound = 25u^2
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = rem2pi(big(xhi) + big(xlo), RoundToZero)
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "rem2pi_2 max rel err" err x z r
        @info "rem2pi_2 avg rel err" avg
        println()
    end
end

println()
@testset verbose = true "Trigonometry ────────────" begin ######################

    @testset "sin1" begin
        args = args_list.op1
        output = fn_output["sin1"]
        coverage["sin1"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-90
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sin(big(x))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), x, z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "sin1 max rel err" err x z r
        @info "sin1 avg rel err" avg
        println()
    end

    @testset "sin2" begin
        args = args_list.op2
        output = fn_output["sin2"]
        coverage["sin2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-90
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = sin(big(xhi) + big(xlo))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "sin2 max rel err" err x z r
        @info "sin2 avg rel err" avg
        println()
    end

    @testset "cos1" begin
        args = args_list.op1
        output = fn_output["cos1"]
        coverage["cos1"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-90
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, (x,)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = cos(big(x))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), x, z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "cos1 max rel err" err x z r
        @info "cos1 avg rel err" avg
        println()
    end

    @testset "cos2" begin
        args = args_list.op2
        output = fn_output["cos2"]
        coverage["cos2"] = true
        @test length(args) == length(output)
        rel_err_bound = big(2.0)^-90
        abs_err_bound = r -> max(abs(rel_err_bound * r), ε₀)
        max_rel_err = (0, 0, 0, 0)
        avg_psum, avg_n = big(0.0), 0
        for (i, ((xhi, xlo),)) in enumerate(args)
            zhi, zlo = output[i]
            z = big(zhi) + big(zlo)
            r = cos(big(xhi) + big(xlo))
            @test abs(z - r) < abs_err_bound(r)
            abs(u^2 * r) < ε₀ && continue # underflow
            rel_err = abs((z - r) / r)
            avg_psum, avg_n = avg_psum + rel_err, avg_n + 1
            if rel_err > max_rel_err[1]
                max_rel_err = (Float64(rel_err), (xhi, xlo), z, r)
            end
        end
        err, x, z, r = max_rel_err
        avg = Float64(avg_psum / avg_n)
        @info "cos2 max rel err" err x z r
        @info "cos2 avg rel err" avg
        println()
    end
end

###

println()
@testset "Math functions coverage ─" begin
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end

println()
@info ["overflow\n ", (rpad(k, 20, ' ') * "$v\n " for (k, v) in overflow)...] |> join
