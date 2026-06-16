# Utils for computing Padé approximants

using RowEchelon

"""
Coefficients of the Padé approximant of order [p/q] for e^x, from lowest to
highest degree.
"""
function pade_exp(p::T, q::T) where {T<:Integer}
    P = Vector{Rational{T}}() # numerator
    Q = Vector{Rational{T}}() # denominator
    for i in zero(T):p
        num = factorial(p) // factorial(p - i)
        den = (factorial(p + q) // factorial(p + q - i)) * factorial(i)
        push!(P, num//den)
    end
    for i in zero(T):q
        num = factorial(q) // factorial(q - i)
        den = (factorial(p + q) // factorial(p + q - i)) * factorial(i)
        push!(Q, (-1)^i * num//den)
    end
    return (P, Q)
end

"""
Integer coefficients of the Padé approximant of order [n/n] for e^x, from
highest to lowest degree (absolute values, one vector represent both num & den).
"""
function pade_exp_int(n::T) where {T<:Integer}
    A = Vector{Rational{T}}()
    for k in zero(T):n
        push!(A, convert(T, factorial(n + k) // (factorial(n - k) * factorial(k))))
    end
    return A
end

"""
Padé `R[m/n](x)` computed from a truncated Taylor series `Tₘ₊ₙ(x)` of degree m+n

  `R[m/n](x) = Pₘ(x)/Qₙ(x) = Tₘ₊ₙ(x) = ∑[k=0..m+n](cₖxᵏ)`

The passed-in function `fn` must return the coefficient `cₖ` of the Taylor
expansion, given some integer parameter `k::T` in the range `[0..m+n]`.

Return a tuple `(P, Q)` where `P` and `Q` represent respectively the coefficients
of the polynomials `Pₘ(x)` and `Qₙ(x)`, ordered from lowest to highest degree.
"""
function taylor_to_pade(fn::F, m::T, n::T) where {T<:Integer, F<:Function}
    m ≥ 0 && n ≥ 0 || throw(ArgumentError("Padé order (m and n) must be greater or equal to zero"))
    C = map(fn, zero(T):m+n)

    # https://www.colorado.edu/amath/sites/default/files/attached-files/pade.pdf

    M = []
    for k in m+1:m+n, j=k-n
        cₖ, Qrow... = C[k+1:-1:max(0,j)+1]
        j < 0 && push!(Qrow, zeros(typeof(cₖ), abs(j))...)
        push!(M, [Qrow..., -cₖ])
    end

    Q = [ one(C[1]), (isempty(M) ? [] : rref(stack(M, dims=1))[:,n+1])... ]
    P = [ sum((C[k-i+1]*Q[i+1] for i in 0:min(k,n))) for k in 0:m ]

    return P, Q
end

"""
Transform the given Padé `Pₘ(x)/Qₙ(x)` with rational coefficients into its
alernate form with integer coefficients.
"""
function pade_int(::Type{T}, P::Vector{Rational{U}}, Q::Vector{Rational{U}}) where {T<:Integer, U<:Integer}
    den = map(r -> r.den, (P..., Q...))
    k = lcm(den...)
    P = [ T(k*p) for p in P ]
    Q = [ T(k*q) for q in Q ]
    return P, Q
end
pade_int(P::Vector{Rational{T}}, Q::Vector{Rational{T}}) where {T<:Integer} = pade_int(T, P, Q)


# Taylor series are represented below with functions that return the coefficient
# `cₙ` (in the expansion of the series) given some integer `n ≥ 0`.

taylor_ln1p(n::Integer) = iszero(n) ? zero(n)//one(n) : (-one(n))^(n+1)//n
taylor_ln1m(n::Integer) = iszero(n) ? zero(n)//one(n) : -one(n)//n
taylor_exp(n::Integer) = one(n)//factorial(n)

# taylor_sin(n::Integer) = isodd(n) ? oftype(n,(-1)^((n-1)/2))//factorial(n) : zero(n)//one(n)
# taylor_cos(n::Integer) = iseven(n) ? oftype(n,(-1)^(n/2))//factorial(n) : zero(n)//one(n)

# skip zero coefficients (n maps to 2n+1 for sin and 2n for cos)
taylor_sin(n::T) where {T<:Integer} = T(-1)^n//factorial(T(2n+1))
taylor_cos(n::T) where {T<:Integer} = T(-1)^n//factorial(T(2n))

