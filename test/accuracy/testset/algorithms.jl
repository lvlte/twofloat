# Test the accuracy of twofloat's main algorithms
# Relative error bounds: cf. paper from Joldes et al.
# Function inputs/outputs dataset is created by /test/accuracy/pre/algorithms.ts

json = read("$(dirname(@__DIR__))/pre/output/algorithms.json", String)
testset = JSON.parse(json, TestSet; null=NaN)

args_list = testset.argsList
fn_output = testset.fnOutput

merge!(coverage, OrderedDict(keys(fn_output) .=> false))

@testset verbose=verbose "Error-Free Transforms" begin

    @testset "split" begin
        _test(Dict(
            "fn" => "split",
            "args" => args_list.op1,
            "rel_err_bound" => 0,
            "compute" => x -> big(x)
        ))
    end

    @testset "normalize" begin # (fast2Sum, fast2Diff)
        _test(Dict(
            "fn" => "normalize",
            "args" => args_list.op11,
            "rel_err_bound" => 0,
            "compute" => (x, y) -> big(x) + big(y)
        ))
    end

    @testset "twoSum" begin # (twoDiff, add11, sub11)
        _test(Dict(
            "fn" => "twoSum",
            "args" => args_list.op11,
            "rel_err_bound" => 0,
            "compute" => (x, y) -> big(x) + big(y)
        ))
    end

    @testset "twoProd" begin # (mul11, twoSquare, square_1)
        _test(Dict(
            "fn" => "twoProd",
            "args" => args_list.op11,
            "rel_err_bound" => 0,
            "compute" => (x, y) -> big(x) * big(y)
        ))
    end
end

@testset verbose=verbose "<op21>(TwoF64, f64)" begin

    @testset "DWPlusFP" begin # (add21, sub21)
        _test(Dict(
            "fn" => "DWPlusFP",
            "args" => args_list.op21,
            "rel_err_bound" => 2u^2,
            "compute" => ((xhi, xlo), y) -> big(y) + big(xhi) + big(xlo)
        ))
    end

    @testset "DWTimesFP1" begin # (mul21)
        _test(Dict(
            "fn" => "DWTimesFP1",
            "args" => args_list.op21,
            "rel_err_bound" => 1.5u^2 + 4u^3,
            "compute" => ((xhi, xlo), y) -> big(xhi)*big(y) + big(xlo)*big(y)
        ))
    end
    @testset "DWDivFP3" begin # (div11, div21, inv1)
        _test(Dict(
            "fn" => "DWDivFP3",
            "args" => args_list.op21,
            "rel_err_bound" => 3u^2,
            "compute" => ((xhi, xlo), y) -> big(xhi)/big(y) + big(xlo)/big(y)
        ))
    end
end

@testset verbose=verbose "<op22>(TwoF64, TwoF64)" begin #########

    @testset "AccurateDWPlusDW" begin # (add22, sub22)
        _test(Dict(
            "fn" => "AccurateDWPlusDW",
            "args" => args_list.op22,
            "rel_err_bound" => 3u^2 + 13u^3,
            "compute" => ((xhi,xlo),(yhi,ylo)) -> big(xhi) + big(yhi) + big(xlo) + big(ylo)
        ))
    end

    @testset "DWTimesDW1" begin # (mul22, square_2)
        _test(Dict(
            "fn" => "DWTimesDW1",
            "args" => args_list.op22,
            "rel_err_bound" => 5u^2,
            "compute" => ((xhi,xlo),(yhi,ylo)) -> (big(xhi) + big(xlo)) * (big(yhi) + big(ylo))
        ))
    end

    @testset "DWDivDW2" begin # (div22, inv2)
        _test(Dict(
            "fn" => "DWDivDW2",
            "args" => args_list.op22,
            "rel_err_bound" => 15u^2 + 56u^3,
            "compute" => ((xhi,xlo),(yhi,ylo)) -> (big(xhi) + big(xlo)) / (big(yhi) + big(ylo))
        ))
    end
end
