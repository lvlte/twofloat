# Test the accuracy of twofloat's main algorithms
# Relative error bounds: cf. paper from J.M. Muller et al.
# Function inputs/outputs dataset is created by /test/algorithms.ts

json = read("$(@__DIR__)/testset/algorithms.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

coverage = Dict(keys(fn_output) .=> false)
overflow = Dict(keys(fn_output) .=> 0)

println()
@testset verbose = true "Error-Free Transforms ────────────────" begin #########

    @testset "split" begin
        _test(Dict(
            "fn" => "split",
            "args" => args_list.op1,
            "rel_err_bound" => 0,
            "compute" => x -> big(x)
        ))
    end

    @testset "normalize (fast2Sum, fast2Diff)" begin
        _test(Dict(
            "fn" => "normalize",
            "args" => args_list.op11,
            "rel_err_bound" => 0,
            "compute" => (x, y) -> big(x) + big(y)
        ))
    end

    @testset "twoSum (twoDiff, add11, sub11)" begin
        _test(Dict(
            "fn" => "twoSum",
            "args" => args_list.op11,
            "rel_err_bound" => 0,
            "compute" => (x, y) -> big(x) + big(y)
        ))
    end

    @testset "twoProd (mul11, twoSquare, square_1)" begin
        _test(Dict(
            "fn" => "twoProd",
            "args" => args_list.op11,
            "rel_err_bound" => 0,
            "compute" => (x, y) -> big(x) * big(y)
        ))
    end
end

println()
@testset verbose = true "Error bounds op21 ────────────────────" begin #########

    @testset "DWPlusFP (add21, sub21)" begin
        _test(Dict(
            "fn" => "DWPlusFP",
            "args" => args_list.op21,
            "rel_err_bound" => 2u^2,
            "compute" => ((xhi, xlo), y) -> big(y) + big(xhi) + big(xlo)
        ))
    end

    @testset "DWTimesFP1 (mul21)" begin
        _test(Dict(
            "fn" => "DWTimesFP1",
            "args" => args_list.op21,
            "rel_err_bound" => 1.5u^2 + 4u^3,
            "compute" => ((xhi, xlo), y) -> big(xhi)*big(y) + big(xlo)*big(y)
        ))
    end
    @testset "DWDivFP3 (div11, div21, inv1)" begin
        _test(Dict(
            "fn" => "DWDivFP3",
            "args" => args_list.op21,
            "rel_err_bound" => 3u^2,
            "compute" => ((xhi, xlo), y) -> big(xhi)/big(y) + big(xlo)/big(y)
        ))
    end
end

println()
@testset verbose = true "Error bounds op22 ────────────────────" begin #########

    @testset "AccurateDWPlusDW (add22, sub22)" begin
        _test(Dict(
            "fn" => "AccurateDWPlusDW",
            "args" => args_list.op22,
            "rel_err_bound" => 3u^2 + 13u^3,
            "compute" => ((xhi,xlo),(yhi,ylo)) -> big(xhi) + big(yhi) + big(xlo) + big(ylo)
        ))
    end

    @testset "DWTimesDW1 (mul22, square_2)" begin
        _test(Dict(
            "fn" => "DWTimesDW1",
            "args" => args_list.op22,
            "rel_err_bound" => 5u^2,
            "compute" => ((xhi,xlo),(yhi,ylo)) -> (big(xhi) + big(xlo)) * (big(yhi) + big(ylo))
        ))
    end

    @testset " (div22, inv2)" begin
        _test(Dict(
            "fn" => "DWDivDW2",
            "args" => args_list.op22,
            "rel_err_bound" => 15u^2 + 56u^3,
            "compute" => ((xhi,xlo),(yhi,ylo)) -> (big(xhi) + big(xlo)) / (big(yhi) + big(ylo))
        ))
    end
end

###

println()
@testset "Algorithm coverage ───────────────────" begin ########################
    for (fn, covered) in coverage
        @test (fn, covered) == (fn, true)
    end
end

overflowed = filter(((fn , ov_count),) -> ov_count > 0, overflow)
if !isempty(overflowed)
    println()
    @info ["overflow\n ", (rpad(k, 20, ' ') * "$v\n " for (k, v) in overflowed)...] |> join
end
