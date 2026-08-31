# TwoFloat accuracy tests

include("./setup.jl")

debug = "--debug" in ARGS
verbose = debug || "--verbose" in ARGS
ENV["JULIA_DEBUG"] = debug ? "all" : ""

@testset verbose=true "TwoFloat - Acccuracy // Error Bound" begin

    @testset verbose=true "Main Algorithms ────────────────────" begin
        include("./testset/algorithms.jl")
    end

    @testset verbose=true "Basic Arithmetic ───────────────────" begin
        include("./testset/arithmetic.jl")
    end

    @testset verbose=true "Math Functions ─────────────────────" begin
        include("./testset/math.jl")
        include("./testset/trig-hyp.jl")
    end

    @testset verbose=true "Test Coverage ──────────────────────" begin
        # Ensure all functions that have produced outputs are actually tested
        # (independently of code coverage)
        for (fn, covered) in coverage
            @test (fn, covered) == (fn, true)
        end
    end
end
println()
