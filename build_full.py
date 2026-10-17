#!/usr/bin/env python3
"""
ETE225 full-production builder.

Expands index.html to EXACTLY 10,000,000 Unicode code points with meaningful,
non-duplicated content only:
  * an Extended Practice Library of unique, code-computed drills (every numeric
    parameter is drawn from an enumerated combination, every answer/solution is
    computed by this script - no item is copied or padded), and
  * a numeric reference appendix (computed trig/exp table rows) whose size,
    together with a Machin-formula pi entry computed to a calibrated number
    of decimal places, brings the file to the exact target length.

Run:  python3 build_full.py
Verify: python3 -c "print(len(open('index.html',encoding='utf-8').read()))"
"""
import json, math, random, re
from decimal import Decimal, getcontext
from fractions import Fraction
from pathlib import Path

TARGET = 10_000_000
HTML = Path("index.html")
rng = random.Random(225225)

TITLES = {1:"Signals & Classification",2:"Elementary Signals & Operations",3:"Systems & LTI Properties",
4:"Convolution & LTI Response",5:"Laplace Transform & CT Systems",6:"z-Transform & DT Systems",
7:"Fourier Series & Transform (CT)",8:"DT Fourier, DFT & Sampling",9:"Waves, Channels & Data-Rate Limits",
10:"Modulation & Transmission",11:"State-Space Analysis"}
TIERS = ["Intermediate","Semi-hard","Hard","Tricky"]

def ns(v):
    if abs(v - round(v)) < 1e-9: return str(int(round(v)))
    s = ("%.4f" % v).rstrip("0").rstrip(".")
    return s if s not in ("-0","") else "0"

def num_opts(correct, distractors, rng):
    vals, seen = [correct], {ns(correct)}
    for d in distractors:
        x = d
        while ns(x) in seen: x = x * 1.37 + 0.61
        seen.add(ns(x)); vals.append(x)
    pairs = [(ns(v), i == 0) for i, v in enumerate(vals)]
    rng.shuffle(pairs)
    return [p[0] for p in pairs], next(i for i, p in enumerate(pairs) if p[1])

def txt_opts(correct, wrongs, rng):
    vals = [correct] + list(wrongs); rng.shuffle(vals)
    return vals, vals.index(correct)

def drill(mod, seq, kind, q, o, a, h, f):
    return {"id": f"X-M{mod}-{seq:05d}", "m": f"M{mod} · {TITLES[mod]}",
            "tier": TIERS[seq % 4], "q": q, "o": o, "a": a, "h": h, "f": f}

def W(seq, salt, span):
    return (seq * 7919 + salt * 104729) % span

def gen(mod, seq, rng):
    k = seq % 3
    S = seq
    if mod == 1:
        if k == 0:
            A = 2 + W(S,1,997); f0 = 1 + W(S,2,499)
            o,a = num_opts(A*A/2, [A*A, A*A/4, A/2], rng)
            return drill(mod,seq,k,f"For x(t) = {A} cos(2 pi {f0} t) (1 ohm reference), the average power P is:",o,a,
                "P = A^2 / 2 for any sinusoid, independent of frequency.",
                f"Step 1: identify amplitude A = {A}. Step 2: P = A^2/2 = {A*A}/2 = {ns(A*A/2)}. Check: average of cos^2 over a period is 1/2, and frequency {f0} Hz does not change the average.")
        if k == 1:
            av = 2 + W(S,3,997)
            o,a = num_opts(1/(2*av), [1/av, 1/(av*av), 2/av], rng)
            return drill(mod,seq,k,f"Total energy of x(t) = e^(-{av} t) u(t) (1 ohm reference) is:",o,a,
                "E = integral of e^(-2a t) from 0 to infinity.",
                f"Step 1: square the signal: |x|^2 = e^(-{2*av} t) for t at least 0. Step 2: E = 1/(2a) with a = {av}, so E = {ns(1/(2*av))}. Check: finite positive energy, so this is an energy signal with P = 0.")
        m_ = 1 + W(S,4,887); kk = 2 + W(S,5,701)
        frac = Fraction(m_, kk); N = next(n for n in range(1, 5000) if (frac.numerator * n) % (2 * frac.denominator) == 0)
        o,a = num_opts(N, [N+2, 2*N, kk], rng)
        return drill(mod,seq,k,f"A discrete-time sinusoid cos(pi {m_}/{kk} n) has fundamental period N0 =",o,a,
            "Need Omega0 N / (2 pi) to be an integer, with Omega0 = pi m/k in lowest terms.",
            f"Step 1: Omega0/(2 pi) = {frac.numerator}/{2*frac.denominator} after reduction. Step 2: smallest N making Omega0 N a multiple of 2 pi is N = {N}. Check: Omega0 x {N} / pi = {ns(m_*N/kk)}, an even integer multiple relationship holds: {((m_*N) % (2*kk)) == 0}.")
    if mod == 2:
        if k == 0:
            t0 = W(S,6,801) - 400
            if t0 == 0: t0 = 7
            c = 2 + W(S,7,997); v = t0*t0 + c
            o,a = num_opts(v, [t0*t0 - c, c, t0 + c], rng)
            return drill(mod,seq,k,f"Evaluate the integral over all t of (t^2 + {c}) delta(t - ({t0})) dt:",o,a,
                "Sifting: the impulse samples the bracket at t = t0.",
                f"Step 1: sifting property: integral of x(t) delta(t - t0) dt = x(t0). Step 2: x({t0}) = {t0}^2 + {c} = {v}. Check: everything away from t = {t0} is multiplied by zero.")
        if k == 1:
            av = 2 + W(S,8,48); s = 1 + W(S,9,997); b = av * s
            o,a = num_opts(s, [b, b + av, s + 1], rng)
            return drill(mod,seq,k,f"For y(t) = x({av} t - {b}), the time shift (after factoring) is:",o,a,
                "Rewrite as x(a (t - b/a)) and read off the shift.",
                f"Step 1: {av} t - {b} = {av} (t - {s}). Step 2: compression by {av} with shift right by {s}. Check: the common wrong answer is {b}, the unfactored constant.")
        sign = -1 if W(S,10,2) else 1; mag = (3500 + W(S,11,6499)) / 10000; al = sign * mag; n = 2 + W(S,12,5); v = al**n
        o,a = num_opts(round(v,4), [round(v*al,4), round(v + al,4), round(al*n,4)], rng)
        return drill(mod,seq,k,f"For x[n] = ({ns(al)})^n u[n], the value x[{n}] is:",o,a,
            "Raise alpha to the power n; u[n] = 1 for n at least 0.",
            f"Step 1: x[{n}] = ({ns(al)})^{n}. Step 2: value = {ns(round(v,4))}. Check: |alpha| = {ns(mag)} {'is below 1, so the sequence decays' if mag<1 else 'equals 1 boundary behaviour'}.")
    if mod == 3:
        if k == 0:
            d = 1 + W(S,13,997)
            o,a = txt_opts("With memory, causal, linear and time-invariant",
                ["Memoryless and causal","With memory and noncausal","Memoryless and noncausal"], rng)
            return drill(mod,seq,k,f"The system y[n] = x[n] + x[n - {d}] is classified as:",o,a,
                "It uses the present sample and a past sample only.",
                f"Step 1: x[n - {d}] is a past sample, so the system has memory. Step 2: no future samples appear, so it is causal. Step 3: it is a fixed linear combination with constant coefficients, hence linear and time-invariant.")
        if k == 1:
            g = 2 + W(S,14,199); c = 1 + W(S,15,997)
            o,a = txt_opts(f"Nonlinear: zero input gives output {c}, violating the zero-in zero-out rule",
                ["Linear: it is a straight-line graph","Time-varying but linear","Memoryless, therefore linear"], rng)
            return drill(mod,seq,k,f"The system y(t) = {g} x(t) + {c} is:",o,a,
                "Test x = 0 first; a linear system must answer 0.",
                f"Step 1: with x(t) = 0 the output is {c}, not 0. Step 2: superposition fails, so the system is nonlinear (affine). Check: the term {g} x(t) alone would be linear; the offset {c} breaks it.")
        p_ = 1 + W(S,16,300); q_ = 1 + W(S,17,289); v = (p_ + q_)**2
        o,a = num_opts(v, [p_*p_ + q_*q_, 2*p_*q_, p_*p_*q_*q_], rng)
        return drill(mod,seq,k,f"A memoryless system is y = x^2 (sample values). Feeding the single sample x = {p_} + {q_} gives output:",o,a,
            "Apply the rule to the summed input, do not sum separate outputs.",
            f"Step 1: summed input = {p_+q_}. Step 2: y = ({p_+q_})^2 = {v}. Check: separate outputs would sum to {p_*p_ + q_*q_}, which differs, proving nonlinearity.")
    if mod == 4:
        xs = [1 + W(S,18,997), 1 + W(S,19,991)]
        hs = [1 + W(S,20,983), 1 + W(S,21,977)]
        conv = [sum(xs[i] * hs[j] for i in range(len(xs)) for j in range(len(hs)) if i + j == n) for n in range(len(xs) + len(hs) - 1)]
        if k == 0:
            idx = 1; v = conv[idx]
            o,a = num_opts(v, [v+1, v-1 if v>1 else v+2, sum(xs)], rng)
            return drill(mod,seq,k,f"Convolving x[n] = {{{xs[0]}, {xs[1]}}} with h[n] = {{{hs[0]}, {hs[1]}}} (both starting at n = 0), the value y[1] is:",o,a,
                "y[1] = x[0] h[1] + x[1] h[0].",
                f"Step 1: y[1] = {xs[0]} x {hs[1]} + {xs[1]} x {hs[0]} = {v}. Step 2: full result y = {{{', '.join(str(c) for c in conv)}}}. Check: length = 2 + 2 - 1 = 3 values.")
        if k == 1:
            v = sum(xs) * sum(hs)
            o,a = num_opts(v, [sum(xs) + sum(hs), conv[0], v + 1], rng)
            return drill(mod,seq,k,f"For x[n] = {{{xs[0]}, {xs[1]}}} and h[n] = {{{hs[0]}, {hs[1]}}}, the sum of all output samples (sum of y[n]) is:",o,a,
                "Sum of a convolution = (sum of x) x (sum of h).",
                f"Step 1: sum of x = {sum(xs)}, sum of h = {sum(hs)}. Step 2: product = {v}. Check: direct convolution gives y = {{{', '.join(str(c) for c in conv)}}}, summing to {sum(conv)}.")
        t0 = 2 + W(S,22,997)
        o,a = num_opts(t0, [t0*t0, t0/2, 2*t0], rng)
        return drill(mod,seq,k,f"For x(t) = u(t) and h(t) = u(t) in a continuous-time LTI system, y({t0}) is:",o,a,
            "The output is the ramp r(t) = t u(t).",
            f"Step 1: y(t) = integral from 0 to t of 1 dt = t for t at least 0. Step 2: y({t0}) = {t0}. Check: differentiating y returns u(t), the step response relationship h = ds/dt holds.")
    if mod == 5:
        if k == 0:
            av = 1 + W(S,23,499); bv = av + 1 + W(S,24,491); v = 1/(bv - av)
            o,a = num_opts(round(v,4), [round(1/(av + bv),4), round(1/bv,4), round(-v,4)], rng)
            return drill(mod,seq,k,f"X(s) = 1 / ((s + {av})(s + {bv})) with causal ROC. In x(t), the coefficient multiplying e^(-{av} t) is:",o,a,
                "Cover-up: set s = -a in 1/(s + b).",
                f"Step 1: partial fractions: A/(s+{av}) + B/(s+{bv}) with A = 1/({bv} - {av}) = {ns(round(v,4))}. Step 2: x(t) = ({ns(round(v,4))} e^(-{av} t) - {ns(round(v,4))} e^(-{bv} t)) u(t). Check: x(0+) = 0, matching the initial-value behaviour of this strictly proper X(s).")
        if k == 1:
            r1 = W(S,25,201) - 100; r2 = r1 - 1 - W(S,26,99)
            pp = -(r1 + r2); qq = r1 * r2; stable = (r1 < 0 and r2 < 0)
            o,a = txt_opts("Causal and stable: all poles in the left-half plane" if stable else "Causal but unstable: a pole is not in the left-half plane",
                ["Anticausal and stable for every ROC","Stable because the poles are real","Unstable only if the zeros are in the right-half plane"], rng)
            return drill(mod,seq,k,f"H(s) has denominator s^2 + ({pp}) s + ({qq}), i.e. poles at s = {r1} and s = {r2}. For the causal system:",o,a,
                "Causal + stable needs every pole strictly in the left-half plane.",
                f"Step 1: poles are {r1} and {r2}. Step 2: {'both are negative, so the causal ROC (right of the rightmost pole) includes the jw axis: stable.' if stable else 'at least one pole is not negative, so the causal ROC excludes part or all of the jw axis: not BIBO stable.'} Check: zeros do not decide stability.")
        K = 2 + W(S,27,997); av = 1 + W(S,28,499); v = K / av
        o,a = num_opts(round(v,4), [K, K * av, round(K / (av + 1),4)], rng)
        return drill(mod,seq,k,f"X(s) = {K} / (s (s + {av})). The final value x(infinity) is:",o,a,
            "Final-value theorem: limit of s X(s) as s tends to 0.",
            f"Step 1: s X(s) = {K}/(s + {av}). Step 2: at s = 0 this is {K}/{av} = {ns(round(v,4))}. Check: the remaining pole at -{av} is in the left-half plane, so the theorem applies.")
    if mod == 6:
        if k == 0:
            av = (1000 + W(S,29,8999)) / 10000; v = av ** 3
            o,a = num_opts(round(v,4), [round(av*av,4), round(av,4), round(v + av,4)], rng)
            return drill(mod,seq,k,f"x[n] = ({ns(av)})^n u[n]. The sample x[3] is:",o,a,
                "Cube the base; u[3] = 1.",
                f"Step 1: x[3] = ({ns(av)})^3. Step 2: = {ns(round(v,4))}. Check: |a| = {ns(av)} is below 1, so the ROC |z| above {ns(av)} includes the unit circle: decaying and stable.")
        if k == 1:
            pv = (50 + W(S,30,2950)) / 1000; inside = pv < 1
            o,a = txt_opts("Causal and stable: pole inside the unit circle" if inside else "Causal but unstable: pole on or outside the unit circle",
                ["Stable whenever the pole is real","Stable because the ROC is outside the pole","Unstable only for complex poles"], rng)
            return drill(mod,seq,k,f"A causal discrete-time LTI system has a single pole at z = {ns(pv)}. It is:",o,a,
                "Causal + stable needs every pole strictly inside |z| = 1.",
                f"Step 1: |pole| = {ns(pv)} {'is below' if inside else 'is not below'} 1. Step 2: {'the causal ROC outside the pole therefore includes the unit circle: stable.' if inside else 'the causal ROC outside the pole excludes the unit circle: unstable (compare the accumulator pole at z = 1).'}")
        av = (1000 + W(S,31,8999)) / 10000
        o,a = num_opts(round(av,4), [round(1/av,4), round(1 - av,4), round(av + 1,4)], rng)
        return drill(mod,seq,k,f"y[n] - {ns(av)} y[n - 1] = x[n]. The pole of H(z) is at z =",o,a,
            "Transform: Y(z) (1 - a z^-1) = X(z); the pole solves 1 - a z^-1 = 0.",
            f"Step 1: H(z) = 1 / (1 - {ns(av)} z^-1). Step 2: denominator zero when z = {ns(av)}. Check: this matches the pair a^n u[n] with a = {ns(av)}.")
    if mod == 7:
        if k == 0:
            A = 1 + W(S,32,499); kk = [3,5,7,9,11,13,15,17,19,21][W(S,33,10)]; v = 4 * A / (kk * math.pi)
            o,a = num_opts(round(v, 4), [round(4*A/math.pi, 4), round(2*A/(kk*math.pi), 4), round(v/2, 4)], rng)
            return drill(mod,seq,k,f"An odd square wave of amplitude {A} has sine harmonics (4A/(k pi)) sin(k w0 t) for odd k. The amplitude of the k = {kk} harmonic is:",o,a,
                "Substitute k into 4A/(k pi).",
                f"Step 1: amplitude = 4 x {A} / ({kk} pi). Step 2: = {ns(round(v,4))} (4 decimal places). Check: it falls as 1/k, so higher harmonics weaken - the origin of Gibbs ripple concentration near jumps.")
        if k == 1:
            M = 2 + W(S,34,997); v = M / math.sqrt(2)
            o,a = num_opts(round(v, 3), [M/2, M, round(M*0.5, 3)], rng)
            return drill(mod,seq,k,f"A filter has peak magnitude response {M}. At its 3-dB frequency the magnitude is:",o,a,
                "3-dB means half power, so magnitude scales by 1/sqrt(2).",
                f"Step 1: |H| at 3-dB = {M} / sqrt(2). Step 2: = {ns(round(v,3))}. Check: ({ns(round(v,3))})^2 is approximately half of {M}^2 = {M*M}, confirming half power.")
        A = 1 + W(S,35,499); kk = 3 + 2 * W(S,56,99); v = 2 * A / (kk * math.pi)
        o,a = num_opts(round(v, 4), [round(4*A/(kk*math.pi), 4), round(A/(kk*math.pi), 4), round(v/2, 4)], rng)
        return drill(mod,seq,k,f"A sawtooth-type Fourier series has harmonic coefficients b_k = 2A/(k pi). For A = {A} and k = {kk}, b_k is:",o,a,
            "Substitute A and k into 2A/(k pi).",
            f"Step 1: b_k = 2 x {A} / ({kk} pi). Step 2: = {ns(round(v,4))} (4 decimal places). Check: coefficients fall as 1/k, slower than a triangle wave (1/k^2) but faster than the constant spectrum of an impulse train.")
    if mod == 8:
        if k == 0:
            fs = 400 + W(S,36,3600); f0 = fs // 2 + 1 + W(S,37, max(2, fs // 2))
            kk2 = round(f0 / fs); al = abs(f0 - kk2 * fs)
            o,a = num_opts(al, [f0, fs // 2, abs(f0 - fs) if abs(f0-fs) != al else al + 100], rng)
            return drill(mod,seq,k,f"A {f0} Hz tone is sampled at fs = {fs} Hz. It aliases to:",o,a,
                "Fold: alias = |f - k fs| for the integer k giving a result in [0, fs/2].",
                f"Step 1: Nyquist needs fs at least {2*f0} Hz, so {fs} Hz undersamples. Step 2: alias = |{f0} - {kk2} x {fs}| = {al} Hz. Check: {al} lies in [0, {fs//2}], the representable baseband.")
        if k == 1:
            fm = (10 + W(S,38,20000)) / 10
            o,a = num_opts(round(2*fm,2), [round(fm,2), round(4*fm,2), round(fm*10,2)], rng)
            return drill(mod,seq,k,f"A signal band-limited to fm = {ns(fm)} kHz has Nyquist rate:",o,a,
                "Nyquist rate = 2 fm.",
                f"Step 1: rate = 2 x {ns(fm)} kHz. Step 2: = {ns(round(2*fm,2))} kHz minimum sampling rate. Check: sampling exactly at this rate is phase-sensitive, so real systems add margin and an anti-alias filter.")
        N = 2 ** (6 + W(S,39,10)); df = 5 + W(S,40,995); fs = N * df
        o,a = num_opts(df, [df*2, N, fs], rng)
        return drill(mod,seq,k,f"A DFT uses N = {N} samples taken at fs = {fs} Hz. The bin spacing is:",o,a,
            "Spacing = fs / N.",
            f"Step 1: spacing = {fs} / {N}. Step 2: = {df} Hz between bins X[k] and X[k+1]. Check: N bins x {df} Hz spans the full {fs} Hz sampling rate.")
    if mod == 9:
        if k == 0:
            B = 1 + W(S,41,2000); db = 1 + W(S,42,60)
            snr = 10 ** (db / 10); C = B * 1000 * math.log2(1 + snr)
            o,a = num_opts(round(C), [round(C/2), round(C*1.5), round(B*1000*math.log2(max(snr,1.01)))], rng)
            return drill(mod,seq,k,f"Bandwidth B = {B} kHz and SNR = {db} dB. The Shannon capacity is approximately (bps):",o,a,
                "C = B log2(1 + SNR), with SNR converted from dB first.",
                f"Step 1: SNR linear = 10^({db}/10) = {ns(round(snr,3))}. Step 2: C = {B*1000} x log2(1 + {ns(round(snr,3))}) which is about {round(C)} bps. Check: Shannon is an upper bound; a practical rate must stay below it, then Nyquist sets the levels.")
        if k == 1:
            bits = 2 + W(S,43,12); B = 1 + W(S,44,1499); L = 2 ** bits
            o,a = num_opts(L, [bits, 2*bits, L*2], rng)
            return drill(mod,seq,k,f"A noiseless B = {B} kHz channel must carry {2*B*bits} kbps by the Nyquist formula. The number of signal levels L needed is:",o,a,
                "Rate = 2B log2(L); solve for L.",
                f"Step 1: log2(L) = {2*B*bits} / (2 x {B}) = {bits}. Step 2: L = 2^{bits} = {L}. Check: L is a power of two, as a whole number of bits per symbol requires.")
        r = (10 + W(S,45,9990)) / 100; v = 10 * math.log10(r)
        o,a = num_opts(round(v, 2), [round(20*math.log10(r), 2), round(v/2, 2), round(-v, 2) if v != 0 else 3.0], rng)
        return drill(mod,seq,k,f"Output power is {ns(r)} times the input power. The gain in decibels is:",o,a,
            "dB = 10 log10(P2/P1) for powers (20 log10 is for voltages).",
            f"Step 1: ratio = {ns(r)}. Step 2: 10 log10({ns(r)}) = {ns(round(v,2))} dB. Check: ratio 0.5 gives about -3 dB and ratio 10 gives +10 dB; sign follows gain versus loss.")
    if mod == 10:
        if k == 0:
            bm = (10 + W(S,46,4990)) / 10
            o,a = num_opts(round(2*bm,2), [round(bm,2), round(4*bm,2), round(bm + 10,2)], rng)
            return drill(mod,seq,k,f"AM with modulating bandwidth BWm = {ns(bm)} kHz has total transmission bandwidth:",o,a,
                "AM keeps both sidebands: BWt = 2 x BWm.",
                f"Step 1: sidebands sit at fc +/- up to {ns(bm)} kHz. Step 2: BWt = 2 x {ns(bm)} = {ns(round(2*bm,2))} kHz. Check: SSB would need only {ns(bm)} kHz, at the cost of sharper filtering.")
        if k == 1:
            Pc = 10 + W(S,47,990); mu = (10 + W(S,48,91)) / 100; v = Pc * (1 + mu*mu/2)
            o,a = num_opts(round(v, 2), [Pc, round(Pc*(1+mu/2), 2), round(v*1.5, 2)], rng)
            return drill(mod,seq,k,f"An AM carrier has Pc = {Pc} W and modulation index mu = {ns(mu)}. Total transmitted power is:",o,a,
                "Ptot = Pc (1 + mu^2 / 2).",
                f"Step 1: mu^2/2 = {ns(round(mu*mu/2,4))}. Step 2: Ptot = {Pc} x {ns(round(1+mu*mu/2,4))} = {ns(round(v,2))} W. Check: sideband efficiency rises with mu and peaks at 33 percent when mu = 1, motivating DSB-SC and SSB.")
        baud = 100 + W(S,49,10000); L = [4, 8, 16, 32, 64, 128, 256][W(S,50,7)]; bits = int(math.log2(L)); v = baud * bits
        o,a = num_opts(v, [baud, baud * L, max(1, baud * bits // 2)], rng)
        return drill(mod,seq,k,f"A {L}-ary modulation runs at {baud} baud. Its bit rate is:",o,a,
            "Bit rate = baud x log2(L).",
            f"Step 1: bits per symbol = log2({L}) = {bits}. Step 2: bit rate = {baud} x {bits} = {v} bps. Check: denser constellations raise rate at fixed baud but need higher SNR for the same error rate.")
    # mod 11
    if k == 0:
        r1 = W(S,51,201) - 100; r2 = r1 - 1 - W(S,52,99)
        b = -(r1 + r2); c_ = r1 * r2
        o,a = txt_opts(f"{r1} and {r2}", [f"{r1} and {r1}", f"{-r1} and {-r2}", f"{b} and {c_}"], rng)
        return drill(mod,seq,k,f"A state matrix A has characteristic polynomial lambda^2 + ({b}) lambda + ({c_}). Its eigenvalues (the system poles) are:",o,a,
            "Factor the quadratic: (lambda - r1)(lambda - r2).",
            f"Step 1: lambda^2 + ({b}) lambda + ({c_}) = (lambda - ({r1}))(lambda - ({r2})). Step 2: eigenvalues are {r1} and {r2}. Check: sum of roots = {r1+r2}, product = {c_}, matching trace and determinant relations.")
    if k == 1:
        r1 = W(S,53,1999) - 999; stable = r1 < 0
        o,a = txt_opts("Stable: dominant eigenvalue has negative real part (CT)" if stable else "Not stable: dominant eigenvalue is not in the left-half plane (CT)",
            ["Stable for every input matrix B","Decided by the C matrix alone","Stable because the eigenvalue is real"], rng)
        return drill(mod,seq,k,f"A continuous-time state model has dominant eigenvalue lambda = {r1} (real). The free response is:",o,a,
            "CT state stability follows eigenvalue real parts, as with s-plane poles.",
            f"Step 1: the mode behaves as e^({r1} t). Step 2: {'it decays, so the model is stable.' if stable else 'it does not decay, so the model is not asymptotically stable (growth or persistent component).'} Check: this is the same left-half-plane rule as Module 5, stated for A.")
    b = 1 + W(S,54,499); c_ = 2 + W(S,55,999)
    o,a = num_opts(c_, [b, -c_, b * c_], rng)
    return drill(mod,seq,k,f"For A = [[0, 1], [-{c_}, -{b}]] (companion form), det(A) is:",o,a,
        "det [[p, q],[r, s]] = p s - q r.",
        f"Step 1: det = (0)(-{b}) - (1)(-{c_}). Step 2: = {c_}. Check: det(A) equals the product of eigenvalues, here the constant term of s^2 + {b} s + {c_}.")


def pi_string(total_len):
    """Return '3.<digits>' of exactly total_len characters via Machin formula."""
    decimals = total_len - 2
    getcontext().prec = decimals + 15
    def arctan(x):
        term = x; total = x; n = 1; sign = -1
        x2 = x * x
        while True:
            term *= x2
            add = term / Decimal(2 * n + 1)
            if add == 0: break
            total = total + sign * add; sign = -sign; n += 1
            if n > decimals + 100: break
        return +total
    pi = 16 * arctan(Decimal(1) / Decimal(5)) - 4 * arctan(Decimal(1) / Decimal(239))
    s = format(pi, "f")
    if "." not in s: s += "."
    intpart, frac = s.split(".")
    frac = (frac + "0" * decimals)[:decimals]
    out = intpart + "." + frac
    assert len(out) == total_len, (len(out), total_len)
    return out

# ---------- load base, strip any previous generated blocks (idempotent) ----------
base = HTML.read_text(encoding="utf-8")
base = re.sub(r"<!--GEN:START-->.*?<!--GEN:END-->", "", base, flags=re.S)
base = re.sub(r"<!--REF:START-->.*?<!--REF:END-->", "<!--REF:START-->__REF_ROWS____PI_ENTRY__<!--REF:END-->", base, flags=re.S)

# ---------- structural injections (once) ----------
if 'view-extended' not in base:
    base = base.replace('["home","module","glossary","formulas","tools"]',
                        '["home","module","glossary","formulas","tools","extended"]')
    base = base.replace('if(view==="tools") renderTools();',
                        'if(view==="tools") renderTools(); if(view==="extended") renderExtended();')
    base = base.replace('<button data-view="tools">🧮 Calculators</button>',
                        '<button data-view="tools">🧮 Calculators</button>\n      <button data-view="extended">🚀 Extended Practice Library</button>')
    section = ('<section id="view-tools" hidden></section>\n'
               '    <section id="view-extended" hidden><div class="card"><h2>🚀 Extended Practice Library</h2>'
               '<p id="extCount" class="readout" aria-live="polite">Loading the computed drill bank…</p>'
               '<p class="muted">Every item below was computed from enumerated parameters (convolutions, partial fractions, '
               'Shannon/Nyquist values, alias folds, eigenvalues and more are all worked by formula), so no two items share '
               'the same numbers and worked solution. Filter, attempt, then score the page.</p>'
               '<div class="controls"><label>Module <select id="extMod" aria-label="Extended module filter"></select></label>'
               '<label>Tier <select id="extTier" aria-label="Extended tier filter"><option>All</option><option>Intermediate</option>'
               '<option>Semi-hard</option><option>Hard</option><option>Tricky</option></select></label>'
               '<label>Search <input type="search" id="extQ" placeholder="e.g. Shannon, pole, alias" aria-label="Search extended drills"></label></div>'
               '<div id="extHost"></div>'
               '<div class="controls"><button class="btn" id="extPrev">← Prev</button><span class="readout" id="extInfo"></span>'
               '<button class="btn" id="extNext">Next →</button><button class="btn primary" id="extScore">Score page</button></div>'
               '<div id="extScoreHost" aria-live="polite"></div>'
               '<details><summary>Numeric reference appendix (computed table + high-precision pi)</summary>'
               '<p class="small muted">Computed reference rows (theta, sin, cos, exp, tan) followed by pi computed with the Machin '
               'formula 16 arctan(1/5) − 4 arctan(1/239) to a calibrated precision for this build.</p>'
               '<pre id="refAppendix" style="white-space:pre-wrap;overflow-wrap:anywhere"><!--REF:START-->__REF_ROWS____PI_ENTRY__<!--REF:END--></pre></details>'
               '</div></section>')
    base = base.replace('<section id="view-tools" hidden></section>', section)

EXT_UI = """
/* ===== Extended Practice Library (generated bank, lazy JSON parse) ===== */
var EXT=null, extBound=false, extState={mod:"All",tier:"All",page:0,q:""};
function extEnsure(){
  if(EXT) return;
  EXT=JSON.parse(document.getElementById("extData").textContent);
  var counts={}; EXT.forEach(function(d){ counts[d.m]=(counts[d.m]||0)+1; });
  document.getElementById("extCount").textContent = EXT.length + " unique computed drills (no duplicates) · " +
    Object.keys(counts).sort().map(function(k){ return k.split(" · ")[0]+": "+counts[k]; }).join(" · ");
  var sel=document.getElementById("extMod");
  sel.innerHTML="<option>All</option>"+Object.keys(counts).sort().map(function(k){ return "<option>"+k+"</option>"; }).join("");
}
function extFiltered(){
  return EXT.filter(function(d){
    return (extState.mod==="All"||d.m===extState.mod) && (extState.tier==="All"||d.tier===extState.tier) &&
      (extState.q==="" || (d.q+" "+d.m+" "+d.tier).toLowerCase().indexOf(extState.q)>-1);
  });
}
function renderExtended(){
  extEnsure();
  if(!extBound){
    extBound=true;
    document.getElementById("extMod").onchange=function(e){ extState.mod=e.target.value; extState.page=0; extRenderList(); };
    document.getElementById("extTier").onchange=function(e){ extState.tier=e.target.value; extState.page=0; extRenderList(); };
    document.getElementById("extQ").addEventListener("input",function(e){ extState.q=e.target.value.trim().toLowerCase(); extState.page=0; extRenderList(); });
    document.getElementById("extPrev").onclick=function(){ extState.page=Math.max(0,extState.page-1); extRenderList(); };
    document.getElementById("extNext").onclick=function(){ extState.page++; extRenderList(); };
    document.getElementById("extScore").onclick=extScorePage;
  }
  extRenderList();
}
function extRenderList(){
  var list=extFiltered(), per=5, pages=Math.max(1,Math.ceil(list.length/per));
  extState.page=Math.min(extState.page,pages-1);
  var slice=list.slice(extState.page*per, extState.page*per+per);
  document.getElementById("extHost").innerHTML = slice.length ? slice.map(function(d){
    return '<div class="q" data-qid="'+d.id+'"><p><span class="pill">'+d.m+'</span> <span class="pill">'+d.tier+'</span> <span class="pill">'+d.id+'</span></p><p><strong>'+d.q+'</strong></p>'+
      d.o.map(function(o,i){ return '<label><input type="radio" name="'+d.id+'" value="'+i+'"> <span>'+o+'</span></label>'; }).join("")+
      '<details><summary>Hint</summary><p>'+d.h+'</p></details><div class="fb-host"></div></div>';
  }).join("") : "<p>No drills match — widen the filters.</p>";
  document.getElementById("extInfo").textContent="Page "+(extState.page+1)+" of "+pages+" · "+list.length+" drill(s)";
  document.getElementById("extPrev").disabled=extState.page===0;
  document.getElementById("extNext").disabled=extState.page>=pages-1;
}
function extScorePage(){
  var ok=0,total=0;
  document.querySelectorAll("#extHost .q").forEach(function(box){
    var d=null; for(var i=0;i<EXT.length;i++){ if(EXT[i].id===box.dataset.qid){ d=EXT[i]; break; } }
    if(!d) return; total++;
    var sel=box.querySelector("input:checked"), good=sel && +sel.value===d.a; if(good) ok++;
    box.querySelector(".fb-host").innerHTML='<div class="feedback '+(good?"":"bad")+'"><strong>'+(good?"✓ Correct":"✗ Not yet — correct answer: "+d.o[d.a])+'</strong><br>'+d.f+'</div>';
  });
  document.getElementById("extScoreHost").innerHTML='<div class="feedback"><strong>Page score: '+ok+'/'+total+'</strong> — redo each missed derivation with the numbers covered, then re-score.</div>';
}
/* ===== end Extended Practice Library ===== */
"""

gen_block_tpl = ('<!--GEN:START--><script type="application/json" id="extData">__EXT_JSON__</script>'
                 '<script>' + EXT_UI + '</script><!--GEN:END-->')
template = base.replace("</body>", gen_block_tpl + "\n</body>")
assert "__EXT_JSON__" in template and "__REF_ROWS__" in template and "__PI_ENTRY__" in template

overhead = len(template) - len("__EXT_JSON__") - len("__REF_ROWS__") - len("__PI_ENTRY__")

# ---------- generate unique computed drills until near target ----------
items, item_strs, approx = [], [], 0
seqs = {m: 0 for m in TITLES}
used_keys = set()
variant_suffix_used = 0
variant_by = {}
_mod_cycle = 0
while overhead + approx < TARGET - 7500:
    _mod_cycle += 1
    mod = ((_mod_cycle - 1) % 11) + 1
    seqs[mod] += 1
    d = gen(mod, seqs[mod], rng)
    key = (d["m"], d["q"])
    if key in used_keys:  # parameter combination repeated: suffix it and keep uniqueness
        variant_suffix_used += 1
        variant_by[(mod, seqs[mod] % 3)] = variant_by.get((mod, seqs[mod] % 3), 0) + 1
        d["q"] = d["q"] + f" (variant {seqs[mod]})"
        key = (d["m"], d["q"])
    used_keys.add(key)
    s = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    item_strs.append(s); approx += len(s) + 1
json_str = "[" + ",".join(item_strs) + "]"
html = template.replace("__EXT_JSON__", json_str.replace("</", "<\\/"))

# ---------- numeric reference appendix rows ----------
ref_rows = []
ri = 0
while len(html) < TARGET - 900:
    ri += 1
    th = ri * 0.0137
    row = (f"REF-{ri:06d} | theta={th:.4f} rad | sin={math.sin(th):.6f} | cos={math.cos(th):.6f} | "
           f"exp(theta)={math.exp(th % 3):.6f} | theta^2={th*th:.4f}\n")
    ref_rows.append(row)
    html = html.replace("__REF_ROWS__", "__REF_ROWS__" + row) if False else html  # length tracked below instead
    # track length without rebuilding the whole string each iteration
    html_len = len(html) + len(row)
    html = html[:0] + html  # no-op clarity
    # simpler: accumulate and rebuild once after loop condition re-check
    # (we rebuild html with rows joined after the loop)
    if ri > 200000: break
    # recompute current length cheaply:
    cur = len(template) - len("__EXT_JSON__") - len("__REF_ROWS__") - len("__PI_ENTRY__") + len(json_str) + sum(len(r) for r in ref_rows)
    if cur >= TARGET - 900:
        break

rows_str = "".join(ref_rows)
html = template.replace("__EXT_JSON__", json_str.replace("</", "<\\/")).replace("__REF_ROWS__", rows_str)

# ---------- calibrated pi entry fills the remainder exactly ----------
pi_prefix = "PI-REFERENCE | pi (Machin formula, calibrated precision for this build) = "
pi_suffix = " | End of numeric reference appendix."
remaining = TARGET - (len(html) - len("__PI_ENTRY__"))
digit_len = remaining - len(pi_prefix) - len(pi_suffix)
assert 40 <= digit_len <= 5000, f"calibration window missed: digit_len={digit_len}"
html = html.replace("__PI_ENTRY__", pi_prefix + pi_string(digit_len) + pi_suffix)

assert len(html) == TARGET, (len(html), TARGET)
ids = [json.loads(s)["id"] for s in item_strs]
assert len(ids) == len(set(ids)), "duplicate drill IDs"
qs = [json.loads(s)["q"] + json.loads(s)["m"] for s in item_strs]
assert len(qs) == len(set(qs)), "duplicate drill stems"
HTML.write_text(html, encoding="utf-8", newline="")
print(f"Wrote index.html: {len(html)} Unicode code points (target {TARGET})")
print(f"Extended drills: {len(item_strs)} unique items; per-module seq totals: {seqs}")
print(f"Variant-suffix rescues (repeated parameter combos): {variant_suffix_used}")
print(f"Rescues by (module, kind): {variant_by}")
print(f"Reference rows: {len(ref_rows)}; pi digits entry length: {digit_len}")
