/* ============================================================
   ETE225 — practice bank, modules 5 and 6
   Fourier analysis; Laplace transforms and the s-plane.
   ============================================================ */
(function () {
  'use strict';
  var B = window.ETE.Bank;
  var h = B.h, n = h.n, mc = h.mc, U = h.withUnit;
  var D = function (x, d) { return n(x, d === undefined ? 3 : d); };

  /* ---------------- Module 5: Fourier analysis ---------------- */
  var M5 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var f0 = 1 + (k % 12), h1 = 2 + (k % 4), h2 = 3 + (Math.floor(k / 4) % 5);
        return mc('A periodic signal contains only the harmonics <span class="mono">' + h1 + 'f₀</span> and <span class="mono">' + h2 + 'f₀</span>, where <span class="mono">f₀ = ' + f0 + ' Hz</span>. What is the fundamental period of the sum?', U(1 / f0, 's', 4),
          [U(1 / (h1 * f0), 's', 4), U(1 / (h2 * f0), 's', 4), U((h1 + h2) / f0, 's', 4)], {
            concept: 'Harmonics and periodicity', type: 'Calculation', rot: k,
            hint: 'All components are integer multiples of f₀, so the sum repeats at f₀.',
            explain: 'Both terms are harmonics of the same fundamental, so the sum is periodic with fundamental frequency ' + f0 + ' Hz and period 1/' + f0 + ' = ' + D(1 / f0, 4) + ' s.',
            steps: ['Identify the common fundamental f₀ = ' + f0 + ' Hz.', 'The fundamental period is T₀ = 1/f₀.', 'T₀ = ' + D(1 / f0, 4) + ' s.']
          });
      }
      if (form === 1) {
        var A = 2 + (k % 9), duty = 10 + 5 * (k % 15), dc = A * duty / 100;
        return mc('A rectangular pulse train swings between 0 and <span class="mono">' + A + ' V</span> with a duty cycle of <span class="mono">' + duty + '%</span>. What is its DC (average) value?', U(dc, 'V', 3),
          [U(A, 'V', 3), U(A * duty / 50, 'V', 3), U(A * (100 - duty) / 100, 'V', 3)], {
            concept: 'DC value from a duty cycle', type: 'Calculation', rot: k + 1,
            hint: 'The average of a two-level waveform is its high value multiplied by the fraction of time it spends high.',
            explain: 'The pulse is high for ' + duty + '% of each period, so the average is ' + A + '×0.' + (duty < 10 ? '0' + duty : duty) + ' = ' + D(dc, 3) + ' V. Fourier theory calls this the a₀ coefficient.',
            steps: ['Convert the duty cycle to a fraction: ' + D(duty / 100, 2) + '.', 'Multiply by the high level: ' + A + ' V.', 'DC value = ' + D(dc, 3) + ' V.']
          });
      }
      if (form === 2) {
        var amp = 1 + (k % 20), rms = amp / Math.SQRT2;
        return mc('A sinusoid has a peak amplitude of <span class="mono">' + amp + ' V</span>. What is its RMS value?', U(rms, 'V', 3),
          [U(amp, 'V', 3), U(amp / 2, 'V', 3), U(amp * Math.SQRT2, 'V', 3)], {
            concept: 'RMS of a sinusoid', type: 'Calculation', rot: k + 2,
            hint: 'For a pure sinusoid, V_rms = V_peak/√2.',
            explain: 'V_rms = ' + amp + '/√2 = ' + D(rms, 3) + ' V. The same sinusoid delivers the same heating power as a DC source of this value.',
            steps: ['Write V_rms = V_p/√2.', 'Divide ' + amp + ' by 1.4142.', 'V_rms = ' + D(rms, 3) + ' V.']
          });
      }
      var A2 = 1 + (k % 20), f0b = 1 + (Math.floor(k / 20) % 5), coef = 4 * A2 / (3 * Math.PI);
      return mc('A square wave alternates between <span class="mono">+' + A2 + ' V</span> and <span class="mono">−' + A2 + ' V</span> at a fundamental frequency of <span class="mono">' + f0b + ' kHz</span>. What is the amplitude of the sine term at <span class="mono">3f₀</span>?', U(coef, 'V', 3),
        [U(4 * A2 / Math.PI, 'V', 3), U(A2 / 3, 'V', 3), U(2 * A2 / (3 * Math.PI), 'V', 3)], {
          concept: 'Square-wave Fourier coefficients', type: 'Calculation', rot: k + 3,
          hint: 'For a ±A square wave, b_n = 4A/(nπ) for odd n; the third harmonic has n = 3.',
          explain: 'b₃ = 4×' + A2 + '/(3π) = ' + D(coef, 3) + ' V at ' + (3 * f0b) + ' kHz. Even harmonics vanish, and the 1/n fall-off is why a square wave needs many terms to reproduce its edges.',
          steps: ['Use b_n = 4A/(nπ).', 'Substitute A = ' + A2 + ' and n = 3.', 'b₃ = ' + D(coef, 3) + ' V.']
        });
    } },

    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a0 = 1 + (k % 6), a1 = 1 + (k % 9), a2 = 1 + (Math.floor(k / 9) % 8);
        var p = a0 * a0 + a1 * a1 / 2 + a2 * a2 / 2;
        return mc('A periodic voltage is <span class="mono">v(t) = ' + a0 + ' + ' + a1 + 'cos(ω₀t) + ' + a2 + 'cos(2ω₀t)</span> V. What is its average power in a 1 Ω resistor?', U(p, 'W', 3),
          [U(a1 * a1 / 2 + a2 * a2 / 2, 'W', 3), U(Math.pow(a0 + a1 + a2, 2), 'W', 3), U(p / 2, 'W', 3)], {
            concept: 'Power in a Fourier series', type: 'Calculation', rot: k,
            hint: 'Average power is a₀² plus half the square of every sinusoidal amplitude.',
            explain: 'P = ' + a0 + '² + ' + a1 + '²/2 + ' + a2 + '²/2 = ' + a0 * a0 + ' + ' + D(a1 * a1 / 2, 3) + ' + ' + D(a2 * a2 / 2, 3) + ' = ' + D(p, 3) + ' W. Cross terms average to zero because the harmonics are orthogonal.',
            steps: ['DC contributes a₀².', 'Each sinusoid contributes A²/2.', 'Add: ' + D(p, 3) + ' W.']
          });
      }
      if (form === 1) {
        var W = 1 + (k % 10), tau = 1 + (Math.floor(k / 10) % 9);
        return mc('A rectangular pulse of width <span class="mono">' + tau + ' ms</span> and height <span class="mono">' + W + ' V</span> has a sinc-shaped spectrum. At what frequency does the first spectral zero occur?', U(1 / (tau / 1000), 'Hz', 1),
          [U(1 / (2 * tau / 1000), 'Hz', 1), U(tau / 1000, 'Hz', 1), U(W / (tau / 1000), 'Hz', 1)], {
            concept: 'Sinc spectrum of a pulse', type: 'Calculation', rot: k + 1,
            hint: 'The transform of A rect(t/τ) is Aτ sinc(fτ); zeros occur at f = n/τ.',
            explain: 'The first zero is at f = 1/τ = 1/(' + D(tau / 1000, 3) + ') = ' + D(1 / (tau / 1000), 1) + ' Hz. A narrower pulse spreads its spectrum wider — the time–bandwidth product is fixed.',
            steps: ['Write the spectrum Aτ sinc(fτ).', 'Set fτ = 1 for the first zero.', 'f = 1/τ = ' + D(1 / (tau / 1000), 1) + ' Hz.']
          });
      }
      if (form === 2) {
        var A = 1 + (k % 15), tau = 1 + (Math.floor(k / 15) % 10), dc = A * tau;
        return mc('The Fourier transform of <span class="mono">x(t) = ' + A + 'rect(t/' + tau + ')</span> is evaluated at DC. What is X(0)?', U(dc, 'V·s', 3),
          [U(A, 'V·s', 3), U(tau, 'V·s', 3), U(A / tau, 'V·s', 3)], {
            concept: 'DC value of a Fourier transform', type: 'Calculation', rot: k + 2,
            hint: 'X(0) is the total area under x(t).',
            explain: 'X(0) = ∫x(t)dt = height × width = ' + A + '×' + tau + ' = ' + D(dc, 3) + ' V·s. This area also sets the density of spectral lines for a periodic repetition of the pulse.',
            steps: ['Set ω = 0 in X(jω) = ∫x(t)e<sup>−jωt</sup>dt.', 'The exponential becomes 1.', 'X(0) = area = ' + D(dc, 3) + ' V·s.']
          });
      }
      var B2 = 1 + (k % 14), f1 = 1 + (k % 10), f2 = f1 + 1 + (Math.floor(k / 10) % 9);
      return mc('A periodic signal has amplitude <span class="mono">' + B2 + '</span> at <span class="mono">' + f1 + ' kHz</span> and <span class="mono">' + B2 + '</span> at <span class="mono">' + f2 + ' kHz</span>, with all other components zero. What is the spacing between adjacent spectral lines?', U(f1, 'kHz', 2),
        [U(f2 - f1, 'kHz', 2), U(f2, 'kHz', 2), U(1, 'kHz', 2)], {
          concept: 'Line spacing in a line spectrum', type: 'Interpretation', rot: k + 3,
          hint: 'The line spacing equals the fundamental frequency of the waveform, the greatest common divisor of the harmonic frequencies.',
          explain: 'The greatest common divisor of ' + f1 + ' and ' + f2 + ' is ' + (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(f1, f2) + ' kHz, so lines appear every ' + (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(f1, f2) + ' kHz.',
          steps: ['List the harmonic frequencies.', 'The spacing is their gcd.', 'Spacing = ' + (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(f1, f2) + ' kHz.']
        });
    } },

    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var A = 2 + (k % 8), a = 1 + (k % 5), w = 1 + (Math.floor(k / 5) % 12), mag = A / Math.sqrt(a * a + w * w);
        return mc('The signal <span class="mono">x(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span> has transform X(jω) = ' + A + '/(jω + ' + a + '). What is |X(jω)| at <span class="mono">ω = ' + w + ' rad/s</span>?', D(mag, 4),
          [D(A / (a + w), 4), D(A * Math.sqrt(a * a + w * w), 4), D(A / (a * a + w * w), 4)], {
            concept: 'Magnitude spectrum', type: 'Calculation', rot: k,
            hint: '|A/(a + jω)| = A/√(a² + ω²).',
            explain: '|X(j' + w + ')| = ' + A + '/√(' + a + '² + ' + w + '²) = ' + A + '/√(' + (a * a + w * w) + ') = ' + D(mag, 4) + '. The magnitude falls as 1/ω far from the origin.',
            steps: ['Separate real and imaginary parts of the denominator.', 'Take the square root of the sum of squares.', '|X| = ' + D(mag, 4) + '.']
          });
      }
      if (form === 1) {
        var t0 = 1 + (k % 12), w2 = 1 + (Math.floor(k / 12) % 9), ph = -w2 * t0;
        return mc('The signal <span class="mono">x(t) = δ(t − ' + t0 + ')</span> is delayed. Its transform is e<sup>−jω' + t0 + '</sup>. What is the phase at <span class="mono">ω = ' + w2 + ' rad/s</span>?', D(ph, 3) + ' rad',
          [D(-ph, 3) + ' rad', D(w2 / t0, 3) + ' rad', D(-w2 / t0, 3) + ' rad'], {
            concept: 'Phase of a time delay', type: 'Calculation', rot: k + 1,
            hint: 'A delay multiplies the spectrum by e<sup>−jωt₀</sup>, which contributes phase −ωt₀.',
            explain: 'φ = −ωt₀ = −' + w2 + '×' + t0 + ' = ' + D(ph, 3) + ' rad. A pure delay changes phase only; the magnitude stays at 1 for every frequency.',
            steps: ['Write the transform e<sup>−jωt₀</sup>.', 'Read the phase as −ωt₀.', 'φ = ' + D(ph, 3) + ' rad.']
          });
      }
      if (form === 2) {
        var odd = 1 + 2 * (k % 12), target = odd + 2;
        var ratio = target / odd;
        return mc('For a symmetric square wave, the harmonic amplitudes fall as 1/n. What is the ratio of the amplitude of the <span class="mono">' + odd + '.</span> harmonic to that of the <span class="mono">' + target + '.</span> harmonic?', D(ratio, 3),
          [D(target / odd * 2, 3), D(odd / target, 3), D(1, 3)], {
            concept: 'Harmonic fall-off', type: 'Analysis', rot: k + 2,
            hint: 'b_n ∝ 1/n, so the ratio is the inverse ratio of the harmonic orders.',
            explain: 'b_' + odd + '/b_' + target + ' = ' + target + '/' + odd + ' = ' + D(ratio, 3) + '. Higher harmonics carry progressively less power, which is why bandwidth can be limited with modest distortion.',
            steps: ['Write b_n = 4A/(nπ).', 'Form the ratio: n₂/n₁.', 'Ratio = ' + D(ratio, 3) + '.']
          });
      }
      var fc = 2 + (k % 20), f = 1 + (Math.floor(k / 20) % 30);
      return mc('An ideal low-pass filter has a cutoff of <span class="mono">' + fc + ' kHz</span>. A sinusoid at <span class="mono">' + (fc + f) + ' kHz</span> is applied. What is the output amplitude?', '0 V',
        ['The same as the input amplitude', 'Half the input amplitude', D(f / fc, 3) + ' times the input amplitude'], {
          concept: 'Ideal filter response', type: 'Interpretation', rot: k + 3,
          hint: 'An ideal brick-wall low-pass filter has zero gain above its cutoff.',
          explain: 'The input frequency ' + (fc + f) + ' kHz lies above the ' + fc + ' kHz cutoff, where the ideal characteristic is exactly zero. A real filter would attenuate rather than null it completely.',
          steps: ['Compare the input frequency with the cutoff.', 'Above cutoff the ideal gain is 0.', 'Output amplitude = 0 V.']
        });
    } },

    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a = 2 + (k % 8), sc = 2 + (Math.floor(k / 8) % 6);
        return mc('A signal with bandwidth <span class="mono">' + a + ' kHz</span> is time-compressed by a factor of <span class="mono">' + sc + '</span>, so y(t) = x(' + sc + 't). What is the new bandwidth?', U(a * sc, 'kHz', 2),
          [U(a / sc, 'kHz', 3), U(a, 'kHz', 2), U(a * sc * sc, 'kHz', 2)], {
            concept: 'Time-scaling property', type: 'Analysis', rot: k,
            hint: 'Compressing time by a factor a expands the spectrum by the same factor.',
            explain: 'x(at) ↔ (1/|a|)X(jω/a), so every frequency is multiplied by ' + sc + '. The bandwidth becomes ' + a + '×' + sc + ' = ' + (a * sc) + ' kHz while the amplitude scales by 1/' + sc + '.',
            steps: ['Apply the time-scaling property.', 'Frequencies scale by ' + sc + '.', 'New bandwidth = ' + (a * sc) + ' kHz.']
          });
      }
      if (form === 1) {
        var fc = 5 + (k % 40), fm = 1 + (Math.floor(k / 40) % 8);
        return mc('A baseband signal occupying <span class="mono">0 to ' + fm + ' kHz</span> multiplies a <span class="mono">' + fc + ' kHz</span> carrier. Which band does the product occupy?', (fc - fm) + ' to ' + (fc + fm) + ' kHz',
        ['0 to ' + (fc + fm) + ' kHz', (fc) + ' to ' + (fc + fm) + ' kHz', (fc - 2 * fm) + ' to ' + (fc + 2 * fm) + ' kHz'], {
          concept: 'Modulation property', type: 'Interpretation', rot: k + 1,
          hint: 'Multiplying by cos(2πf_ct) copies the spectrum to ±f_c.',
          explain: 'The product spectrum is ½X(f − f_c) + ½X(f + f_c), so the band ' + fm + ' kHz wide is translated to ' + (fc - fm) + '–' + (fc + fm) + ' kHz. No energy remains at baseband.',
          steps: ['Start with the baseband band 0–' + fm + ' kHz.', 'Shift it up by f_c.', 'The result is ' + (fc - fm) + '–' + (fc + fm) + ' kHz.']
        });
      }
      if (form === 2) {
        var A = 1 + (k % 10), a2 = 1 + (Math.floor(k / 10) % 9), E = A * A / (2 * a2);
        return mc('What is the total energy of <span class="mono">x(t) = ' + A + 'e<sup>−' + a2 + 't</sup>u(t)</span>?', U(E, 'J', 4),
          [U(A * A / a2, 'J', 4), U(A / a2, 'J', 4), U(E / 2, 'J', 4)], {
            concept: 'Energy by Parseval', type: 'Calculation', rot: k + 2,
            hint: 'E = ∫|x|²dt = A²/(2a) for a one-sided decaying exponential.',
            explain: 'E = ∫₀^∞ ' + (A * A) + 'e<sup>−' + (2 * a2) + 't</sup>dt = ' + (A * A) + '/(' + (2 * a2) + ') = ' + D(E, 4) + ' J. The same value is obtained by integrating |X(jω)|²/2π over all frequencies.',
            steps: ['Square the signal.', 'Integrate the exponential.', 'E = ' + D(E, 4) + ' J.']
          });
      }
      var A3 = 2 + (k % 9);
      return mc('A square wave alternates between <span class="mono">+' + A3 + ' V</span> and <span class="mono">−' + A3 + ' V</span> with a 50% duty cycle. What is its average power in a 1 Ω resistor?', U(A3 * A3, 'W', 1),
        [U(A3 * A3 / 2, 'W', 1), U(A3, 'W', 1), U(2 * A3 * A3, 'W', 1)], {
          concept: 'Power of a two-level waveform', type: 'Calculation', rot: k + 3,
          hint: 'The square is always A², so the average power is A².',
          explain: 'v²(t) = ' + (A3 * A3) + ' at every instant, so P = ' + (A3 * A3) + ' W. A sinusoid of the same peak would carry only half this power.',
          steps: ['Square the waveform.', 'It is constant at ' + (A3 * A3) + '.', 'Average power = ' + (A3 * A3) + ' W.']
        });
    } }
  };

  /* ---------------- Module 6: Laplace transform ---------------- */
  var M6 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var A = 1 + (k % 8), a = 1 + (Math.floor(k / 8) % 12);
        return mc('What is the Laplace transform of <span class="mono">x(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span>?', A + '/(s + ' + a + ')',
          [A + '/(s − ' + a + ')', (A * a) + '/(s + ' + a + ')', A + '/(s² + ' + (a * a) + ')'], {
            concept: 'Laplace transform of an exponential', type: 'Recall', rot: k,
            hint: 'Linearity plus the standard pair e<sup>−at</sup>u(t) ↔ 1/(s + a).',
            explain: 'L{' + A + 'e<sup>−' + a + 't</sup>u(t)} = ' + A + '/(s + ' + a + ') with ROC Re(s) > −' + a + '. The pole at −' + a + ' is in the left half-plane, so the signal decays.',
            steps: ['Form ∫₀^∞ ' + A + 'e<sup>−(s+' + a + ')t</sup>dt.', 'Integrate to ' + A + '/(s + ' + a + ').', 'ROC: Re(s) > −' + a + '.']
          });
      }
      if (form === 1) {
        var t0 = 1 + (k % 9), G = 1 + (Math.floor(k / 9) % 8);
        return mc('What is the Laplace transform of <span class="mono">' + G + 'δ(t − ' + t0 + ')</span>?', G + 'e<sup>−' + t0 + 's</sup>',
          [G + 'e<sup>' + t0 + 's</sup>', G + '/(s + ' + t0 + ')', (G * t0) + '/s'], {
            concept: 'Transform of a shifted impulse', type: 'Recall', rot: k + 1,
            hint: 'Use the sift property: the impulse picks out e<sup>−st</sup> at t = t₀.',
            explain: 'L{' + G + 'δ(t−' + t0 + ')} = ' + G + 'e<sup>−' + t0 + 's</sup>, with ROC the entire s-plane. The exponential factor is a pure delay, so it changes phase but not magnitude on the jω axis.',
            steps: ['Apply the definition.', 'The impulse samples e<sup>−st</sup> at t = ' + t0 + '.', 'Result: ' + G + 'e<sup>−' + t0 + 's</sup>.']
          });
      }
      if (form === 2) {
        var amp = 1 + (k % 10), w = 1 + (Math.floor(k / 10) % 12);
        return mc('What is the Laplace transform of <span class="mono">x(t) = ' + amp + 'cos(' + w + 't)u(t)</span>?', amp + 's/(s² + ' + (w * w) + ')',
          [amp + '/(s² + ' + (w * w) + ')', amp + 'w/(s² + ' + (w * w) + ')', amp + 's/(s + ' + w + ')²'], {
            concept: 'Transform of a cosine', type: 'Recall', rot: k + 2,
            hint: 'cos(ωt)u(t) ↔ s/(s² + ω²).',
            explain: 'L{' + amp + 'cos(' + w + 't)u(t)} = ' + amp + 's/(s² + ' + (w * w) + ') with ROC Re(s) > 0. The pair has poles on the jω axis at ±j' + w + ', so the signal oscillates forever.',
            steps: ['Start from the standard cosine pair.', 'Multiply by the amplitude ' + amp + '.', 'Result: ' + amp + 's/(s² + ' + (w * w) + ').']
          });
      }
      var A2 = 1 + (k % 8), p = 1 + (Math.floor(k / 8) % 12);
      return mc('The transform <span class="mono">F(s) = ' + A2 + '/(s + ' + p + ')</span> has ROC <span class="mono">Re(s) > −' + p + '</span>. What is f(t)?', A2 + 'e<sup>−' + p + 't</sup>u(t)',
        [A2 + 'e<sup>' + p + 't</sup>u(t)', A2 + 'δ(t − ' + p + ')', A2 + 'sin(' + p + 't)u(t)'], {
          concept: 'Inverse Laplace transform', type: 'Calculation', rot: k + 3,
          hint: 'A first-order pole at s = −p with a right-sided ROC inverts to a decaying exponential.',
          explain: 'The right-sided ROC places the signal at t ≥ 0, so f(t) = ' + A2 + 'e<sup>−' + p + 't</sup>u(t). The pole itself gives the decay rate and the numerator gives the initial amplitude.',
          steps: ['Match the form A/(s + p).', 'Use the right-sided ROC.', 'f(t) = ' + A2 + 'e<sup>−' + p + 't</sup>u(t).']
        });
    } },

    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a = 2 + (k % 12), b = 1 + (Math.floor(k / 12) % 9);
        return mc('Use the initial-value theorem on <span class="mono">F(s) = ' + a + '/(s + ' + b + ')</span>. What is f(0⁺)?', String(a),
          [String(b), '0', String(a / b)], {
            concept: 'Initial-value theorem', type: 'Calculation', rot: k,
            hint: 'f(0⁺) = lim<sub>s→∞</sub> sF(s).',
            explain: 'sF(s) = ' + a + 's/(s + ' + b + ') → ' + a + ' as s → ∞. The value ' + a + ' is the coefficient of the impulse/step jump at the origin.',
            steps: ['Multiply F(s) by s.', 'Take the limit s → ∞.', 'f(0⁺) = ' + a + '.']
          });
      }
      if (form === 1) {
        var a2 = 1 + (k % 9), b2 = 1 + (Math.floor(k / 9) % 9);
        return mc('Use the final-value theorem on <span class="mono">F(s) = ' + a2 + '/[s(s + ' + b2 + ')]</span>. What is f(∞)?', D(a2 / b2, 3),
          [String(a2), '0', D(b2 / a2, 3)], {
            concept: 'Final-value theorem', type: 'Calculation', rot: k + 1,
            hint: 'f(∞) = lim<sub>s→0</sub> sF(s), provided all poles of sF(s) are in the left half-plane.',
            explain: 'sF(s) = ' + a2 + '/(s + ' + b2 + '), so as s → 0 the limit is ' + a2 + '/' + b2 + ' = ' + D(a2 / b2, 3) + '. This is the steady state of a first-order step response.',
            steps: ['Multiply by s and cancel.', 'Set s = 0.', 'f(∞) = ' + D(a2 / b2, 3) + '.']
          });
      }
      if (form === 2) {
        var a3 = 1 + (k % 10);
        return mc('Find the inverse Laplace transform of <span class="mono">F(s) = 1/(s + ' + a3 + ')</span>, known to be right-sided.', 'e<sup>−' + a3 + 't</sup>u(t)',
          ['e<sup>' + a3 + 't</sup>u(t)', 'δ(t) + ' + a3 + 'u(t)', 'sin(' + a3 + 't)u(t)'], {
            concept: 'Inverse Laplace transform', type: 'Calculation', rot: k + 2,
            hint: 'A first-order pole at s = −a with a right-sided ROC gives a decaying exponential.',
            explain: 'The pole at −' + a3 + ' with ROC Re(s) > −' + a3 + ' corresponds to e<sup>−' + a3 + 't</sup>u(t). Choosing the left-sided ROC would give the growing exponential instead.',
            steps: ['Match 1/(s + a) to the standard pair.', 'Use the right-sided ROC.', 'f(t) = e<sup>−' + a3 + 't</sup>u(t).']
          });
      }
      var a4 = 1 + (k % 8), b4 = 1 + (Math.floor(k / 8) % 8);
      return mc('A system has <span class="mono">H(s) = ' + a4 + '/(s + ' + b4 + ')</span>. What is the final value of its unit-step response?', D(a4 / b4, 3),
        [String(a4), D(b4 / a4, 3), '0'], {
          concept: 'DC gain', type: 'Calculation', rot: k + 3,
          hint: 'The final value of the step response is H(0).',
          explain: 'H(0) = ' + a4 + '/' + b4 + ' = ' + D(a4 / b4, 3) + '. This equals the product of the pole distance and the gain, and is the DC gain of the low-pass system.',
          steps: ['Evaluate H(s) at s = 0.', 'H(0) = ' + a4 + '/' + b4 + '.', 'Final value = ' + D(a4 / b4, 3) + '.']
        });
    } },

    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var wn = 2 + (k % 12), z = (1 + (Math.floor(k / 12) % 9)) / 10;
        var wd = wn * Math.sqrt(1 - z * z);
        return mc('A second-order system has <span class="mono">s² + ' + D(2 * z * wn, 2) + 's + ' + (wn * wn) + '</span>. What is its damped natural frequency?', D(wd, 3) + ' rad/s',
          [String(wn) + ' rad/s', D(z * wn, 3) + ' rad/s', D(wn / z, 3) + ' rad/s'], {
            concept: 'Second-order poles', type: 'Calculation', rot: k,
            hint: 'Compare with s² + 2ζω_ns + ω_n², then use ω_d = ω_n√(1 − ζ²).',
            explain: 'ω_n = ' + wn + ' rad/s and 2ζω_n = ' + D(2 * z * wn, 2) + ' gives ζ = ' + z + '. Then ω_d = ' + wn + '√(1 − ' + D(z * z, 2) + ') = ' + D(wd, 3) + ' rad/s.',
            steps: ['Read ω_n² = ' + (wn * wn) + ', so ω_n = ' + wn + '.', 'Read ζ = ' + z + '.', 'ω_d = ω_n√(1−ζ²) = ' + D(wd, 3) + '.']
          });
      }
      if (form === 1) {
        var A = 2 + (k % 9), a = 1 + (k % 5), b = a + 1 + (Math.floor(k / 5) % 4), t = 1 + (Math.floor(k / 20) % 5);
        var y = A * (Math.exp(-a * t) - Math.exp(-b * t)) / (b - a);
        return mc('Find y(t) for <span class="mono">Y(s) = ' + A + '/[(s + ' + a + ')(s + ' + b + ')]</span> at <span class="mono">t = ' + t + ' s</span>.', D(y, 4),
          [D(A * (Math.exp(-a * t) + Math.exp(-b * t)) / 2, 4), D(A * Math.exp(-a * t), 4), D(A * (b - a) * t, 4)], {
            concept: 'Partial fractions', type: 'Calculation', rot: k + 1,
            hint: 'Write Y(s) = A/(b−a)[1/(s+a) − 1/(s+b)] and invert term by term.',
            explain: 'The expansion gives y(t) = ' + A + '/' + (b - a) + '(e<sup>−' + a + 't</sup> − e<sup>−' + b + 't</sup>). At t = ' + t + ' this is ' + D(y, 4) + '.',
            steps: ['Resolve into two first-order terms.', 'Invert each to an exponential.', 'Evaluate at t = ' + t + ': ' + D(y, 4) + '.']
          });
      }
      if (form === 2) {
        var kdc = 2 + (k % 10), a2 = 1 + (k % 7), b2 = a2 + 1 + (Math.floor(k / 7) % 6);
        return mc('A system has poles at <span class="mono">s = −' + a2 + '</span> and <span class="mono">s = −' + b2 + '</span> and DC gain <span class="mono">' + kdc + '</span>. Which transfer function is consistent?', (kdc * a2 * b2) + '/[(s + ' + a2 + ')(s + ' + b2 + ')]',
          [kdc + '/[(s + ' + a2 + ')(s + ' + b2 + ')]', (kdc * (a2 + b2)) + '/[(s + ' + a2 + ')(s + ' + b2 + ')]', kdc + '/[s² + ' + (a2 * b2) + ']'], {
            concept: 'Building a transfer function', type: 'Design', rot: k + 2,
            hint: 'Write K/[(s−p₁)(s−p₂)] and choose K so that H(0) equals the stated DC gain.',
            explain: 'With the stated poles, H(0) = K/(a·b) = K/' + (a2 * b2) + '. Setting that equal to ' + kdc + ' requires K = ' + (kdc * a2 * b2) + ', so H(s) = ' + (kdc * a2 * b2) + '/[(s+' + a2 + ')(s+' + b2 + ')] has the required DC gain.',
            steps: ['Write the denominator from the poles.', 'Evaluate at s = 0.', 'Choose the numerator to match the DC gain.']
          });
      }
      var a3 = 2 + (k % 10);
      return mc('For which values of <span class="mono">a</span> is the system <span class="mono">H(s) = 1/(s² + a s + ' + (a3 * a3) + ')</span> stable?', 'a > 0',
        ['a < 0', 'All real a', 'a > ' + a3], {
          concept: 'Routh–Hurwitz condition', type: 'Analysis', rot: k + 3,
          hint: 'A second-order polynomial s² + a₁s + a₀ has both roots in the left half-plane iff a₁ > 0 and a₀ > 0.',
          explain: 'Here a₀ = ' + (a3 * a3) + ' > 0 always, so stability requires the s coefficient a > 0. If a = 0 the poles sit on the jω axis and the system is marginally stable, not stable.',
          steps: ['Write the characteristic polynomial.', 'Apply the second-order stability test.', 'Stable iff a > 0.']
        });
    } },

    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var p1 = 1 + (k % 8), p2 = 2 + (Math.floor(k / 8) % 8);
        return mc('A transform has a pole at <span class="mono">s = ' + p1 + '</span> from a right-sided term and a pole at <span class="mono">s = −' + p2 + '</span> from a left-sided term. What is the ROC of the sum?', '−' + p2 + ' < Re(s) < ' + p1,
        ['Re(s) > ' + p1, 'Re(s) < −' + p2, 'The entire s-plane'], {
          concept: 'ROC of a two-sided signal', type: 'Analysis', rot: k,
          hint: 'The ROC of a sum is the intersection of the individual ROCs.',
          explain: 'The right-sided term converges for Re(s) > ' + p1 + ' only if the pole is at +' + p1 + ' with a left-sided signal; careful reading gives the strip −' + p2 + ' < Re(s) < ' + p1 + '. The strip contains the jω axis only when ' + p1 + ' > 0, which it is, so the sum is stable.',
          steps: ['Sketch both half-planes.', 'Intersect them.', 'The strip is −' + p2 + ' < Re(s) < ' + p1 + '.']
        });
      }
      if (form === 1) {
        var a = 1 + (k % 9), b = 1 + (Math.floor(k / 9) % 9);
        return mc('Two systems with <span class="mono">H₁(s) = 1/(s + ' + a + ')</span> and <span class="mono">H₂(s) = 1/(s + ' + b + ')</span> are cascaded. What is the Laplace transform of the combined impulse response?', '1/[(s + ' + a + ')(s + ' + b + ')]',
        ['1/(s + ' + (a + b) + ')', '(s + ' + a + ')/(s + ' + b + ')', '1/(s² + ' + (a * b) + ')'], {
          concept: 'Convolution property', type: 'Analysis', rot: k + 1,
          hint: 'Convolution in time becomes multiplication in the s-domain.',
          explain: 'H(s) = H₁(s)H₂(s) = 1/[(s+' + a + ')(s+' + b + ')]. Cascading adds the orders and multiplies the denominators; the impulse response is the convolution of the two exponentials.',
          steps: ['Convolution in time ↔ multiplication in s.', 'Multiply the two transforms.', 'H(s) = 1/[(s+' + a + ')(s+' + b + ')].']
        });
      }
      if (form === 2) {
        var z = 1 + (k % 6), p = z;
        return mc('A transfer function has a pole and a zero both at <span class="mono">s = −' + p + '</span>. What is the effect on the system?', 'They cancel; the reduced system has lower order',
        ['The system becomes unstable', 'The zero creates a growing exponential', 'The DC gain becomes infinite'], {
          concept: 'Pole–zero cancellation', type: 'Analysis', rot: k + 2,
          hint: 'A common factor (s + p) in numerator and denominator cancels algebraically.',
          explain: 'The factor cancels because both are at the same location. The input–output behaviour is that of the reduced transfer function, although an unreachable internal mode may remain hidden in a state-space realization.',
          steps: ['Factor numerator and denominator.', 'Cancel the common (s + ' + p + ') factor.', 'The realized order drops by one.']
        });
      }
      var a2 = 1 + (k % 9), w = 1 + (Math.floor(k / 9) % 20);
      var mag = 1 / Math.sqrt(a2 * a2 + w * w);
      return mc('A first-order system <span class="mono">H(s) = 1/(s + ' + a2 + ')</span> is driven by <span class="mono">cos(' + w + 't)</span> for a long time. What is the steady-state amplitude?', D(mag, 4),
        [D(1 / a2, 4), D(a2 / Math.sqrt(a2 * a2 + w * w), 4), D(1 / w, 4)], {
          concept: 'Sinusoidal steady state', type: 'Analysis', rot: k + 3,
          hint: 'The steady-state amplitude is |H(jω)| at the input frequency.',
          explain: '|H(j' + w + ')| = 1/√(' + a2 + '² + ' + w + '²) = ' + D(mag, 4) + '. The output lags the input by tan⁻¹(ω/a) and decays only if the input is switched off.',
          steps: ['Set s = jω.', 'Compute the magnitude.', 'Amplitude = ' + D(mag, 4) + '.']
        });
    } }
  };

  B.addFamilies({ 5: M5, 6: M6 });
})();
