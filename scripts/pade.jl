# Utils for computing Padé approximants

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
