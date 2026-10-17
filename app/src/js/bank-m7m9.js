/* ============================================================
   ETE225 — practice bank, modules 7 to 9
   z-transforms and discrete systems; sampling and digital
   transmission; state-space models.
   ============================================================ */
(function () {
  'use strict';
  var B = window.ETE.Bank;
  var h = B.h, n = h.n, mc = h.mc, U = h.withUnit;
  var D = function (x, d) { return n(x, d === undefined ? 3 : d); };
  var gcd = function (a, b) { return b ? gcd(b, a % b) : a; };

  /* ---------------- Module 7: the z-transform ---------------- */
  var M7 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var A = 1 + (k % 6), a = 2 + (Math.floor(k / 6) % 11);
        return mc('What is the z-transform of <span class="mono">x[n] = ' + A + '·' + a + '<sup>n</sup>u[n]</span>?', A + 'z/(z − ' + a + ')',
          [A + 'z/(z + ' + a + ')', A + '/(z − ' + a + ')', A + 'z/(z − 1)'], {
            concept: 'z-transform of a geometric sequence', type: 'Recall', rot: k,
            hint: 'Use a<sup>n</sup>u[n] ↔ z/(z − a) and apply linearity.',
            explain: 'X(z) = ' + A + 'z/(z − ' + a + ') with ROC |z| > ' + a + '. The pole at z = ' + a + ' sets the growth rate; because ' + a + ' > 1 the sequence diverges.',
            steps: ['Write the standard pair a<sup>n</sup>u[n] ↔ z/(z−a).', 'Multiply by the amplitude ' + A + '.', 'ROC: |z| > ' + a + '.']
          });
      }
      if (form === 1) {
        var d = 1 + (k % 10), G = 1 + (Math.floor(k / 10) % 6);
        return mc('What is the z-transform of <span class="mono">' + G + 'δ[n − ' + d + ']</span>?', G + 'z<sup>−' + d + '</sup>',
          [G + 'z<sup>' + d + '</sup>', G + '/(z − ' + d + ')', G + 'z/(z − ' + d + ')'], {
            concept: 'z-transform of a shifted impulse', type: 'Recall', rot: k + 1,
            hint: 'δ[n−k] ↔ z<sup>−k</sup>, so a delay of k samples becomes multiplication by z<sup>−k</sup>.',
            explain: 'The sequence is zero except at n = ' + d + ', where it equals ' + G + '. Therefore X(z) = ' + G + 'z<sup>−' + d + '</sup>, with ROC the whole z-plane except possibly z = 0.',
            steps: ['Apply X(z) = Σ x[n]z<sup>−n</sup>.', 'Only n = ' + d + ' contributes.', 'X(z) = ' + G + 'z<sup>−' + d + '</sup>.']
          });
      }
      if (form === 2) {
        var a2 = 2 + (k % 12), b2 = 3 + (Math.floor(k / 12) % 9);
        var outer = Math.max(a2, b2);
        return mc('A causal sequence has poles at <span class="mono">z = ' + a2 + '</span> and <span class="mono">z = ' + b2 + '</span>. What is the ROC of its z-transform?', '|z| > ' + outer,
          ['|z| < ' + Math.min(a2, b2), '|z| > ' + Math.min(a2, b2), 'All z'], {
            concept: 'ROC of a right-sided sequence', type: 'Interpretation', rot: k + 2,
            hint: 'A right-sided sequence converges outside the outermost pole.',
            explain: 'The ROC is |z| > ' + outer + ', the exterior of the larger-magnitude pole. Because ' + outer + ' > 1, the sequence grows with n and the system is not stable.',
            steps: ['Compare the pole magnitudes: ' + a2 + ' and ' + b2 + '.', 'A causal sequence uses the exterior of the outermost pole.', 'ROC: |z| > ' + outer + '.']
          });
      }
      var amp = 1 + (k % 8), sh = 1 + (Math.floor(k / 8) % 6);
      return mc('What is the z-transform of the delayed step <span class="mono">x[n] = ' + amp + 'u[n − ' + sh + ']</span>?', amp + 'z<sup>−' + (sh - 1) + '</sup>z/(z − 1)',
        [amp + 'z/(z − 1)', amp + 'z<sup>−' + sh + '</sup>/(z − 1)', amp + 'z<sup>' + sh + '</sup>z/(z − 1)'], {
          concept: 'Time shift in the z-domain', type: 'Recall', rot: k + 3,
          hint: 'A delay of one sample multiplies the transform by z<sup>−1</sup>; u[n−k] ↔ z<sup>−k</sup>z/(z−1).',
          explain: 'Shifting the step by ' + sh + ' samples multiplies its transform by z<sup>−' + sh + '</sup>, giving ' + amp + 'z<sup>−' + sh + '</sup>z/(z−1) with ROC |z| > 1. Delays change phase, not the pole locations.',
          steps: ['Start from ' + amp + 'u[n] ↔ ' + amp + 'z/(z−1).', 'Apply the shift property for ' + sh + ' samples.', 'Multiply by z<sup>−' + sh + '</sup>.']
        });
    } },

    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a = 1 + (k % 10), b = 1 + (Math.floor(k / 10) % 6);
        return mc('A system obeys <span class="mono">y[n] = ' + b + 'x[n] + ' + a + 'y[n − 1]</span>. What is its transfer function H(z)?', b + '/(1 − ' + a + 'z<sup>−1</sup>)',
          [b + '/(1 + ' + a + 'z<sup>−1</sup>)', b + 'z<sup>−1</sup>/(1 − ' + a + 'z<sup>−1</sup>)', b + '/(z − ' + a + ')'], {
            concept: 'Difference equation to transfer function', type: 'Calculation', rot: k,
            hint: 'Take the z-transform of both sides and solve for Y(z)/X(z).',
            explain: 'Y(z)(1 − ' + a + 'z⁻¹) = ' + b + 'X(z), so H(z) = ' + b + '/(1 − ' + a + 'z⁻¹) = ' + b + 'z/(z − ' + a + '). The pole at z = ' + a + ' controls stability.',
            steps: ['Transform each term with the delay property.', 'Collect Y(z) on the left.', 'H(z) = ' + b + '/(1 − ' + a + 'z⁻¹).']
          });
      }
      if (form === 1) {
        var c = 2 + (k % 9), idx = 1 + (Math.floor(k / 9) % 6);
        var val = Math.pow(c, idx);
        return mc('The impulse response of <span class="mono">H(z) = z/(z − ' + c + ')</span> is h[n] = ' + c + '<sup>n</sup>u[n]. What is h[' + idx + ']?', String(val),
          [String(c * idx), String(Math.pow(c, idx - 1)), String(c + idx)], {
            concept: 'Impulse response from H(z)', type: 'Calculation', rot: k + 1,
            hint: 'Evaluate the geometric sequence at the stated index.',
            explain: 'h[' + idx + '] = ' + c + '<sup>' + idx + '</sup> = ' + val + '. The first sample h[0] = 1 is the direct path; later samples are the feedback accumulating.',
            steps: ['Identify h[n] = ' + c + '<sup>n</sup>u[n].', 'Substitute n = ' + idx + '.', 'h[' + idx + '] = ' + val + '.']
          });
      }
      if (form === 2) {
        var a2 = (1 + (k % 9)) / 10, b2 = 2 + (Math.floor(k / 9) % 9);
        return mc('A system has <span class="mono">H(z) = ' + b2 + '/(1 − ' + a2 + 'z<sup>−1</sup>)</span> with |' + a2 + '| < 1. A unit step is applied. What is the steady-state output?', D(b2 / (1 - a2), 3),
          [D(b2, 3), '0', D(b2 / (1 + a2), 3)], {
            concept: 'Steady state from a z-domain model', type: 'Calculation', rot: k + 2,
            hint: 'The final value is H(1) = b/(1 − a) for a stable first-order system.',
            explain: 'H(1) = ' + b2 + '/(1 − ' + a2 + ') = ' + D(b2 / (1 - a2), 3) + '. This is the DC gain: after the transient a<sup>n</sup> dies away, the output settles to that constant.',
            steps: ['Check stability: |' + a2 + '| < 1.', 'Evaluate H(z) at z = 1.', 'Steady state = ' + D(b2 / (1 - a2), 3) + '.']
          });
      }
      var num = 1 + (k % 8), p = 2 + (Math.floor(k / 8) % 6), at = p + 1 + (k % 3);
      return mc('Evaluate <span class="mono">H(z) = ' + num + '/(z − ' + p + ')</span> at <span class="mono">z = ' + at + '</span>.', D(num / (at - p), 4),
        [D(num / (at + p), 4), D(num * at / p, 4), D(p / num, 4)], {
          concept: 'Evaluating a transfer function', type: 'Calculation', rot: k + 3,
          hint: 'Substitute z directly into the rational expression.',
          explain: 'H(' + at + ') = ' + num + '/(' + at + ' − ' + p + ') = ' + D(num / (at - p), 4) + '. The magnitude grows as z approaches the pole at ' + p + '.',
          steps: ['Substitute z = ' + at + '.', 'Compute the denominator.', 'H = ' + D(num / (at - p), 4) + '.']
        });
    } },

    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a = 2 + (k % 8), b = 1 + (Math.floor(k / 8) % 6), x0 = 2 + (Math.floor(k / 48) % 6), t = 1 + (Math.floor(k / 288) % 4);
        var y = x0 * Math.pow(b, t);
        return mc('Solve <span class="mono">y[n] = ' + b + 'y[n−1]</span> with y[0] = ' + x0 + ' for <span class="mono">n = ' + t + '</span>.', D(y, 3),
          [D(x0 * Math.pow(b, t - 1), 3), D(x0 * b * t, 3), D(x0 + b * t, 3)], {
            concept: 'Iterating a difference equation', type: 'Calculation', rot: k,
            hint: 'The closed form is y[n] = y[0] b<sup>n</sup>.',
            explain: 'Repeated substitution gives y[n] = ' + x0 + '·' + b + '<sup>n</sup>. At n = ' + t + ' that is ' + D(y, 3) + '. Each step multiplies the previous value by ' + b + '.',
            steps: ['Write y[n] = ' + b + 'y[n−1].', 'Close the recursion: y[n] = ' + x0 + '·' + b + '<sup>n</sup>.', 'At n = ' + t + ': ' + D(y, 3) + '.']
          });
      }
      if (form === 1) {
        var a2 = 1 + (k % 9), b2 = 1 + (Math.floor(k / 9) % 9);
        return mc('A system has <span class="mono">H(z) = z/(z − ' + a2 + ')</span> and receives <span class="mono">x[n] = ' + b2 + 'u[n]</span>. What is y[0]?', String(b2),
          ['0', String(a2 * b2), D(b2 / (1 + a2), 3)], {
            concept: 'Initial response', type: 'Analysis', rot: k + 1,
            hint: 'The direct path carries b₂x[n] to the output at the same instant.',
            explain: 'At n = 0 the only contribution is the direct term ' + b2 + 'x[0] = ' + b2 + '. The feedback term needs y[−1], which is zero for a system at rest, so y[0] = ' + b2 + '.',
            steps: ['Set n = 0 in the recursion.', 'y[−1] = 0 by the rest condition.', 'y[0] = ' + b2 + '.']
          });
      }
      if (form === 2) {
        var p1 = 2 + (k % 8), p2 = 2 + (Math.floor(k / 8) % 8);
        return mc('A second-order system has poles at <span class="mono">z = ' + p1 + '</span> and <span class="mono">z = ' + p2 + '</span>. Is it stable?', 'No: both poles lie outside the unit circle',
          ['Yes: both poles are causal', 'Yes: the poles are real', 'Only if the input is bounded'], {
            concept: 'Stability in the z-plane', type: 'Analysis', rot: k + 2,
            hint: 'A discrete-time system is stable only when every pole lies strictly inside the unit circle.',
            explain: 'The stability boundary is |z| = 1. Both poles have magnitude ' + p1 + ' and ' + p2 + ', which exceed 1, so the impulse response grows as ' + Math.max(p1, p2) + '<sup>n</sup> and the system is unstable.',
            steps: ['Draw the unit circle.', 'Compare each pole magnitude with 1.', 'Both exceed 1 ⇒ unstable.']
          });
      }
      var a3 = 1 + (k % 7), b3 = 1 + (Math.floor(k / 7) % 8), c3 = 1 + (Math.floor(k / 56) % 7);
      return mc('A system has <span class="mono">H(z) = (' + b3 + 'z + ' + c3 + ')/(z − ' + a3 + ')</span>. What is the coefficient of z in the numerator after writing H(z) in positive powers?', String(b3),
        [String(c3), String(a3), String(b3 + c3)], {
          concept: 'Reading polynomial coefficients', type: 'Interpretation', rot: k + 3,
          hint: 'The numerator bz + c is already in positive powers of z.',
          explain: 'The numerator is ' + b3 + 'z + ' + c3 + ', so the coefficient of z is ' + b3 + '. The constant term ' + c3 + ' shifts the zero to z = −' + c3 + '/' + b3 + '.',
          steps: ['Write the numerator in descending powers.', 'Read the coefficient of z.', 'Coefficient = ' + b3 + '.']
        });
    } },

    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a = 1 + (k % 12), b = 1 + (Math.floor(k / 12) % 12), c = 1 + (Math.floor(k / 144) % 6);
        return mc('A second-order system has <span class="mono">H(z) = 1/[(z − ' + a + ')(z − ' + b + ')]</span>. For which condition is it stable?', '|a| < 1 and |b| < 1 (both poles inside the unit circle)',
          ['|a| > 1 and |b| > 1', '|a·b| < 1', '|a + b| < 1'], {
            concept: 'Stability of a second-order system', type: 'Analysis', rot: k,
            hint: 'Check each pole individually against the unit circle.',
            explain: 'With poles at ' + a + ' and ' + b + ', stability requires |' + a + '| < 1 and |' + b + '| < 1. A product or sum condition can be satisfied while one pole is still outside the circle.',
            steps: ['Locate both poles.', 'Test each against |z| = 1.', 'Both must be inside.']
          });
      }
      if (form === 1) {
        var a2 = 1 + (k % 10), b2 = 2 + (Math.floor(k / 10) % 9);
        var val = (1 - a2) / (1 - b2);
        return mc('A system has <span class="mono">H(z) = (1 + ' + a2 + 'z<sup>−1</sup>)/(1 + ' + b2 + 'z<sup>−1</sup>)</span>. What is the gain at the half-sampling frequency, <span class="mono">ω = π</span>?', D(val, 4),
          [D((1 + a2) / (1 + b2), 4), D((1 - a2) / (1 + b2), 4), '0'], {
            concept: 'Frequency response at ω = π', type: 'Calculation', rot: k + 1,
            hint: 'At ω = π, z = e<sup>jπ</sup> = −1.',
            explain: 'Substituting z = −1 gives H(−1) = (1 − ' + a2 + ')/(1 − ' + b2 + '). Since z⁻¹ = −1, the numerator is 1 − ' + a2 + ' and the denominator 1 − ' + b2 + '.',
            steps: ['Set z = −1.', 'Evaluate numerator and denominator.', 'H(−1) = ' + D((1 - a2) / (1 - b2), 4) + '.']
          });
      }
      if (form === 2) {
        var g1 = 1 + (k % 6), g2 = 1 + (Math.floor(k / 6) % 8);
        return mc('Two systems <span class="mono">H₁(z) = ' + g1 + '/(z − 0.5)</span> and <span class="mono">H₂(z) = ' + g2 + '/(z − 0.25)</span> are cascaded. What is the numerator constant of the combined transfer function?', String(g1 * g2),
          [D(g1 + g2, 2), D(g1 * g2 / 2, 2), D(g1 / g2, 3)], {
            concept: 'Cascade in the z-domain', type: 'Analysis', rot: k + 2,
            hint: 'Cascading multiplies the transfer functions, so the numerator gains multiply.',
            explain: 'H(z) = H₁(z)H₂(z) = ' + (g1 * g2) + '/[(z − 0.5)(z − 0.25)]. The numerator constant is the product ' + g1 + '×' + g2 + ' = ' + (g1 * g2) + '; the poles remain where they were.',
            steps: ['Multiply the two rational functions.', 'Multiply the numerator constants.', 'Result: ' + (g1 * g2) + '/[(z − 0.5)(z − 0.25)].']
          });
      }
      var a3 = 1 + (k % 8), b3 = 1 + (Math.floor(k / 8) % 8);
      return mc('A difference equation is <span class="mono">y[n] − ' + a3 + 'y[n−1] = ' + b3 + 'x[n]</span>. What is the order of the system and the pole location?', 'First order, pole at z = ' + a3,
        ['Second order, pole at z = ' + b3, 'First order, pole at z = −' + a3, 'Zero order, no poles'], {
          concept: 'Order and poles from a difference equation', type: 'Interpretation', rot: k + 3,
          hint: 'The order is the largest delay of y; the pole is the root of the denominator.',
          explain: 'The highest output delay is one sample, so the system is first order. The denominator 1 − ' + a3 + 'z⁻¹ vanishes at z = ' + a3 + '.',
          steps: ['Identify the largest delay of y: ' + a3 + 'y[n−1].', 'Write the denominator in z.', 'Pole at z = ' + a3 + '.']
        });
    } }
  };

  /* ---------------- Module 8: sampling and digital transmission ---------------- */
  var M8 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var fm = 1 + (k % 40), fs = 2 * fm;
        return mc('A signal is bandlimited to <span class="mono">' + fm + ' kHz</span>. What is the minimum sampling rate that avoids aliasing?', U(fs, 'kHz', 2),
          [U(fm, 'kHz', 2), U(4 * fm, 'kHz', 2), U(fm / 2, 'kHz', 3)], {
            concept: 'Nyquist rate', type: 'Calculation', rot: k,
            hint: 'The sampling rate must be at least twice the highest frequency: f_s ≥ 2f_m.',
            explain: 'f_s,min = 2×' + fm + ' = ' + fs + ' kHz. Sampling exactly at the Nyquist rate requires ideal brick-wall reconstruction; practical systems oversample.',
            steps: ['Identify f_m = ' + fm + ' kHz.', 'Apply f_s ≥ 2f_m.', 'f_s,min = ' + fs + ' kHz.']
          });
      }
      if (form === 1) {
        var fs2 = 4 + (k % 60), T = 1 / fs2;
        return mc('A signal is sampled at <span class="mono">' + fs2 + ' kSa/s</span>. What is the sampling interval?', U(T * 1000, 'µs', 3),
          [U(1000 / (2 * fs2), 'µs', 3), U(fs2, 'µs', 2), U(1000 / (fs2 * fs2), 'µs', 4)], {
            concept: 'Sampling interval', type: 'Calculation', rot: k + 1,
            hint: 'T_s = 1/f_s; convert kHz to Hz carefully.',
            explain: 'T_s = 1/' + (fs2 * 1000) + ' = ' + D(T * 1e6, 2) + ' µs. Every ' + D(T * 1e6, 2) + ' µs a new sample is taken.',
            steps: ['Convert ' + fs2 + ' kSa/s to ' + (fs2 * 1000) + ' Sa/s.', 'T_s = 1/f_s.', 'T_s = ' + D(T * 1e6, 2) + ' µs.']
          });
      }
      if (form === 2) {
        var fs3 = 8 + (k % 32), f = 1 + (Math.floor(k / 32) % 30);
        var alias = Math.abs(f - fs3 * Math.round(f / fs3));
        return mc('A <span class="mono">' + f + ' kHz</span> tone is sampled at <span class="mono">' + fs3 + ' kHz</span>. What is its alias frequency?', U(alias, 'kHz', 2),
          [U(f, 'kHz', 2), U(fs3 - f, 'kHz', 2), U(fs3, 'kHz', 2)], {
            concept: 'Aliasing', type: 'Calculation', rot: k + 2,
            hint: 'The alias is the input frequency folded into 0–f_s/2: f_alias = |f − k f_s| for the nearest integer k.',
            explain: 'With f = ' + f + ' kHz and f_s = ' + fs3 + ' kHz, folding gives ' + D(alias, 2) + ' kHz. The alias is indistinguishable from a genuine tone at that frequency.',
            steps: ['Compute the nearest multiple of f_s.', 'Take the absolute difference.', 'Alias = ' + D(alias, 2) + ' kHz.']
          });
      }
      var bits = 2 + (k % 7), L = Math.pow(2, bits);
      return mc('A PCM system uses <span class="mono">' + bits + '</span> bits per sample. How many quantization levels can it represent?', String(L),
        [String(bits * 2), String(bits * bits), String(2 * bits)], {
          concept: 'Quantization levels', type: 'Calculation', rot: k + 3,
          hint: 'Each bit doubles the number of levels: L = 2<sup>n</sup>.',
          explain: 'L = 2<sup>' + bits + '</sup> = ' + L + ' levels. Adding one bit doubles the resolution and lowers quantization noise by about 6 dB.',
          steps: ['Start with L = 2<sup>n</sup>.', 'Substitute n = ' + bits + '.', 'L = ' + L + '.']
        });
    } },

    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var Bw = 1 + (k % 20), bits = 1 + (Math.floor(k / 20) % 6), C = 2 * Bw * bits;
        return mc('A noiseless channel has bandwidth <span class="mono">' + Bw + ' kHz</span> and uses <span class="mono">' + Math.pow(2, bits) + '</span> signal levels. What is the maximum bit rate?', U(C, 'kbps', 2),
          [U(Bw * bits, 'kbps', 2), U(2 * Bw, 'kbps', 2), U(2 * Bw * Math.pow(2, bits), 'kbps', 2)], {
            concept: 'Nyquist bit rate', type: 'Calculation', rot: k,
            hint: 'Nyquist: C = 2B log₂L.',
            explain: 'log₂' + Math.pow(2, bits) + ' = ' + bits + '. C = 2×' + Bw + '×' + bits + ' = ' + C + ' kbps. The factor 2 comes from the two independent samples per hertz of bandwidth.',
            steps: ['Compute log₂L = ' + bits + '.', 'Multiply 2B log₂L.', 'C = ' + C + ' kbps.']
          });
      }
      if (form === 1) {
        var Bw2 = 1 + (k % 20), snr = 1 + (Math.floor(k / 20) % 40), C2 = Bw2 * Math.log2(1 + snr) / 1000;
        return mc('A noisy channel has <span class="mono">' + Bw2 + ' kHz</span> of bandwidth and a linear SNR of <span class="mono">' + snr + '</span>. What is the Shannon capacity?', U(C2, 'Mbps', 3),
          [U(Bw2 * Math.log2(snr) / 1000, 'Mbps', 3), U(2 * Bw2 * Math.log2(1 + snr) / 1000, 'Mbps', 3), U(Bw2 * snr / 1000, 'Mbps', 3)], {
            concept: 'Shannon capacity', type: 'Calculation', rot: k + 1,
            hint: 'C = B log₂(1 + SNR), with B in hertz for bits per second.',
            explain: 'C = ' + Bw2 + '×10³ × log₂(1 + ' + snr + ') = ' + Bw2 + '×10³ × ' + D(Math.log2(1 + snr), 3) + ' = ' + D(C2, 3) + ' Mbps.',
            steps: ['Compute 1 + SNR = ' + (1 + snr) + '.', 'Take log₂ = ' + D(Math.log2(1 + snr), 3) + '.', 'Multiply by B = ' + Bw2 + ' kHz: ' + D(C2, 3) + ' Mbps.']
          });
      }
      if (form === 2) {
        var fs = 2 + (k % 40), bits2 = 2 + (Math.floor(k / 40) % 7), rb = fs * bits2;
        return mc('A PCM system samples at <span class="mono">' + fs + ' kHz</span> with <span class="mono">' + bits2 + '</span> bits per sample. What is the bit rate?', U(rb, 'kbps', 2),
          [U(fs, 'kbps', 2), U(bits2, 'kbps', 2), U(fs / bits2, 'kbps', 3)], {
            concept: 'PCM bit rate', type: 'Calculation', rot: k + 2,
            hint: 'R_b = f_s × n bits per sample.',
            explain: 'R_b = ' + fs + '×' + bits2 + ' = ' + rb + ' kbps. Raising the sample rate or the bit depth raises the bit rate proportionally.',
            steps: ['Identify f_s = ' + fs + ' kHz and n = ' + bits2 + '.', 'Multiply.', 'R_b = ' + rb + ' kbps.']
          });
      }
      var ratio = 2 + (k % 60), db = 10 * Math.log10(ratio);
      return mc('A channel has a power ratio <span class="mono">S/N = ' + ratio + '</span>. What is the SNR in decibels?', U(db, 'dB', 2),
        [U(20 * Math.log10(ratio), 'dB', 2), U(ratio, 'dB', 2), U(10 * ratio, 'dB', 2)], {
          concept: 'SNR in decibels', type: 'Calculation', rot: k + 3,
          hint: 'SNR_dB = 10 log₁₀(SNR_linear).',
          explain: 'SNR_dB = 10 log₁₀(' + ratio + ') = ' + D(db, 2) + ' dB. A 3 dB increase corresponds to doubling the linear power ratio.',
          steps: ['Take log₁₀ of ' + ratio + ' = ' + D(Math.log10(ratio), 3) + '.', 'Multiply by 10.', 'SNR = ' + D(db, 2) + ' dB.']
        });
    } },

    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var Bw = 1 + (k % 15), rb = 4 + (Math.floor(k / 15) % 30), L = Math.pow(2, Math.ceil(rb / (2 * Bw)));
        return mc('A noiseless <span class="mono">' + Bw + ' kHz</span> channel must carry <span class="mono">' + rb + ' kbps</span>. What is the minimum number of signal levels required by the Nyquist formula?', String(L),
          [String(Math.ceil(rb / Bw)), String(rb), String(2 * Bw)], {
            concept: 'Levels from the Nyquist rate', type: 'Design', rot: k,
            hint: 'Solve 2B log₂L ≥ R_b for L, then round up to a power of two.',
            explain: 'R_b/(2B) = ' + rb + '/' + (2 * Bw) + ' = ' + D(rb / (2 * Bw), 3) + ', so log₂L ≥ ' + D(rb / (2 * Bw), 3) + '. The next power of two gives L = ' + L + '.',
            steps: ['Compute R_b/(2B) = ' + D(rb / (2 * Bw), 3) + '.', 'Round up to an integer number of bits.', 'L = 2<sup>' + Math.ceil(rb / (2 * Bw)) + '</sup> = ' + L + '.']
          });
      }
      if (form === 1) {
        var Bw2 = 1 + (k % 12), C3 = 2 + (Math.floor(k / 12) % 40);
        var snr = Math.pow(2, C3 / Bw2) - 1;
        return mc('A <span class="mono">' + Bw2 + ' MHz</span> channel must support <span class="mono">' + C3 + ' Mbps</span> using the Shannon bound. What linear SNR is required?', D(snr, 1),
          [D(Math.pow(2, C3) - 1, 1), D(C3 / Bw2, 2), D(Math.pow(2, C3 / Bw2), 1)], {
            concept: 'SNR from the Shannon bound', type: 'Design', rot: k + 1,
            hint: 'Rearrange C = B log₂(1 + SNR) to SNR = 2<sup>C/B</sup> − 1.',
            explain: 'C/B = ' + D(C3 / Bw2, 3) + ' bits per symbol, so SNR = 2<sup>' + D(C3 / Bw2, 3) + '</sup> − 1 = ' + D(snr, 1) + '. This is a fundamental bound; no coding can beat it.',
            steps: ['Divide C by B.', 'Raise 2 to that power.', 'Subtract 1: SNR = ' + D(snr, 1) + '.']
          });
      }
      if (form === 2) {
        var range = 2 + (k % 12), bits2 = 2 + (Math.floor(k / 12) % 8), L = Math.pow(2, bits2), step = range / L;
        return mc('A PCM quantizer covers a range of <span class="mono">' + range + ' V</span> with <span class="mono">' + bits2 + '</span> bits. What is the quantization step size?', U(step, 'V', 4),
          [U(range / bits2, 'V', 3), U(range / (2 * L), 'V', 4), U(L / range, 'V', 3)], {
            concept: 'Quantization step', type: 'Calculation', rot: k + 2,
            hint: 'Δ = full-scale range / number of levels, with L = 2<sup>n</sup>.',
            explain: 'L = 2<sup>' + bits2 + '</sup> = ' + L + '. Δ = ' + range + '/' + L + ' = ' + D(step, 4) + ' V. The maximum quantization error is half a step.',
            steps: ['Compute L = ' + L + '.', 'Divide the range by L.', 'Δ = ' + D(step, 4) + ' V.']
          });
      }
      var rb2 = 8 + (k % 50), bits3 = 2 + (Math.floor(k / 50) % 7), fs = rb2 / bits3;
      return mc('A link carries <span class="mono">' + rb2 + ' kbps</span> using <span class="mono">' + bits3 + '</span> bits per sample. What sampling rate does this imply?', U(fs, 'kSa/s', 3),
        [U(rb2, 'kSa/s', 2), U(rb2 * bits3, 'kSa/s', 2), U(bits3, 'kSa/s', 2)], {
          concept: 'Sampling rate from a bit budget', type: 'Application', rot: k + 3,
          hint: 'Divide the bit rate by the bits per sample.',
          explain: 'f_s = ' + rb2 + '/' + bits3 + ' = ' + D(fs, 3) + ' kSa/s. This may exceed the Nyquist rate, in which case the extra samples improve SNR or allow a simpler anti-alias filter.',
          steps: ['Start from R_b = f_s n.', 'Divide by n = ' + bits3 + '.', 'f_s = ' + D(fs, 3) + ' kSa/s.']
        });
    } },

    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var fm = 1 + (k % 20), fs = 2 + (Math.floor(k / 20) % 30);
        var ok = fs >= 2 * fm;
        return mc('A signal contains frequencies up to <span class="mono">' + fm + ' kHz</span>. It is sampled at <span class="mono">' + fs + ' kHz</span>. What happens?', ok ? 'No aliasing: f_s ≥ 2f_m' : 'Aliasing occurs: f_s < 2f_m',
        [ok ? 'Aliasing occurs because f_s is too high' : 'No aliasing because any sampling rate works', 'The signal is perfectly reconstructed in both cases', 'Aliasing only affects the phase'], {
          concept: 'Checking the sampling theorem', type: 'Analysis', rot: k,
          hint: 'Compare f_s with 2f_m directly.',
          explain: '2f_m = ' + (2 * fm) + ' kHz and f_s = ' + fs + ' kHz. ' + (ok ? 'The sampling rate meets or exceeds the Nyquist rate, so the spectrum copies do not overlap.' : 'The sampling rate is below the Nyquist rate, so the spectrum copies overlap and high frequencies fold down as aliases.') ,
          steps: ['Compute 2f_m = ' + (2 * fm) + ' kHz.', 'Compare with f_s = ' + fs + ' kHz.', ok ? 'f_s ≥ 2f_m ⇒ no aliasing.' : 'f_s < 2f_m ⇒ aliasing.']
        });
      }
      if (form === 1) {
        var Bw = 1 + (k % 10), snrdb = 10 + 2 * (Math.floor(k / 10) % 30);
        var C4 = Bw * Math.log2(1 + Math.pow(10, snrdb / 10)) / 1000;
        return mc('A channel has <span class="mono">' + Bw + ' MHz</span> bandwidth and <span class="mono">' + snrdb + ' dB</span> SNR. What is the Shannon capacity?', U(C4, 'Mbps', 2),
          [U(Bw * snrdb / 1000, 'Mbps', 2), U(2 * Bw * Math.log2(1 + snrdb) / 1000, 'Mbps', 2), U(Bw * Math.log2(1 + Math.pow(10, snrdb / 20)) / 1000, 'Mbps', 2)], {
            concept: 'Shannon capacity with dB SNR', type: 'Calculation', rot: k + 1,
            hint: 'Convert dB to a linear ratio first, then use C = B log₂(1 + SNR).',
            explain: 'SNR = 10<sup>' + D(snrdb / 10, 2) + '</sup> = ' + D(Math.pow(10, snrdb / 10), 1) + '. Then C = ' + Bw + '×10⁶×log₂(1 + ' + D(Math.pow(10, snrdb / 10), 1) + ') = ' + D(C4, 2) + ' Mbps.',
            steps: ['Convert ' + snrdb + ' dB to linear: ' + D(Math.pow(10, snrdb / 10), 1) + '.', 'Apply C = B log₂(1 + SNR).', 'C = ' + D(C4, 2) + ' Mbps.']
          });
      }
      if (form === 2) {
        var rb = 10 + (k % 60), n = 2 + (Math.floor(k / 60) % 6), bw = rb / (2 * n);
        return mc('A PCM system with <span class="mono">' + n + '</span> bits per sample and bit rate <span class="mono">' + rb + ' kbps</span> uses binary baseband transmission with Nyquist shaping. What minimum bandwidth is needed?', U(bw, 'kHz', 3),
          [U(rb, 'kHz', 2), U(2 * rb, 'kHz', 2), U(rb / n, 'kHz', 3)], {
            concept: 'PCM transmission bandwidth', type: 'Design', rot: k + 2,
            hint: 'Binary baseband Nyquist bandwidth is half the bit rate.',
            explain: 'The bit rate is ' + rb + ' kbps, so B_min = R_b/2 = ' + D(bw, 3) + ' kHz. Multilevel transmission could reduce this bandwidth at the cost of SNR.',
            steps: ['Use B_min = R_b/2 for binary baseband.', 'Substitute R_b = ' + rb + ' kbps.', 'B_min = ' + D(bw, 3) + ' kHz.']
          });
      }
      var Bw3 = 1 + (k % 12), L = Math.pow(2, 2 + (Math.floor(k / 12) % 5));
      var cny = 2 * Bw3 * Math.log2(L);
      return mc('A noiseless <span class="mono">' + Bw3 + ' kHz</span> channel uses <span class="mono">' + L + '</span> levels. What is the Nyquist limit?', U(cny, 'kbps', 2),
        [U(Bw3 * Math.log2(L), 'kbps', 2), U(2 * Bw3, 'kbps', 2), U(Bw3 * L, 'kbps', 2)], {
          concept: 'Nyquist versus Shannon', type: 'Analysis', rot: k + 3,
          hint: 'Nyquist depends only on bandwidth and levels; Shannon depends on bandwidth and SNR.',
          explain: 'C = 2B log₂L = 2×' + Bw3 + '×' + Math.log2(L) + ' = ' + D(cny, 2) + ' kbps. This is an upper bound for a noiseless channel; a noisy channel would cap it lower through Shannon.',
          steps: ['Compute log₂L = ' + Math.log2(L) + '.', 'Multiply by 2B.', 'C = ' + D(cny, 2) + ' kbps.']
        });
    } }
  };

  /* ---------------- Module 9: state-space models ---------------- */
  var M9 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var nst = 2 + (k % 7), nin = 1 + (Math.floor(k / 7) % 4), nout = 1 + (Math.floor(k / 28) % 3);
        return mc('A state-space model has <span class="mono">' + nst + '</span> states, <span class="mono">' + nin + '</span> inputs and <span class="mono">' + nout + '</span> outputs. What is the size of the A matrix?', nst + ' × ' + nst,
          [nst + ' × ' + nin, nout + ' × ' + nst, nin + ' × ' + nout], {
            concept: 'State-space dimensions', type: 'Recall', rot: k,
            hint: 'A maps the state vector to its derivative, so it is square with one row per state.',
            explain: 'A is ' + nst + '×' + nst + '. B is ' + nst + '×' + nin + ', C is ' + nout + '×' + nst + ' and D is ' + nout + '×' + nin + '.',
            steps: ['Count the states: ' + nst + '.', 'A acts on the state vector.', 'A is ' + nst + '×' + nst + '.']
          });
      }
      if (form === 1) {
        var l1 = -(1 + (k % 8)), l2 = -(1 + (Math.floor(k / 8) % 8));
        return mc('A diagonal state matrix has entries <span class="mono">' + l1 + '</span> and <span class="mono">' + l2 + '</span>. What are its eigenvalues?', l1 + ' and ' + l2,
          [String(-l1) + ' and ' + String(-l2), l1 + ' and ' + String(-l2), '0 and ' + (l1 + l2)], {
            concept: 'Eigenvalues of a diagonal matrix', type: 'Recall', rot: k + 1,
            hint: 'The eigenvalues of a diagonal matrix are its diagonal entries.',
            explain: 'Both eigenvalues are negative (' + l1 + ' and ' + l2 + '), so every state decays and the system is stable. The eigenvectors are the coordinate axes.',
            steps: ['Read the diagonal entries.', 'They are the eigenvalues.', 'Both are negative ⇒ stable.']
          });
      }
      if (form === 2) {
        var a = 1 + (k % 6), b = 1 + (Math.floor(k / 6) % 6), c = 1 + (Math.floor(k / 36) % 6), d = 1 + (Math.floor(k / 216) % 6);
        return mc('For <span class="mono">A = [' + a + ' ' + b + '; ' + c + ' ' + d + ']</span>, what are the trace and determinant?', 'Trace ' + (a + d) + ', determinant ' + (a * d - b * c),
        ['Trace ' + (a * d - b * c) + ', determinant ' + (a + d), 'Trace ' + (a + d) + ', determinant ' + (a * d + b * c), 'Trace ' + (a + b + c + d) + ', determinant ' + (a * d)], {
          concept: 'Trace and determinant', type: 'Calculation', rot: k + 2,
          hint: 'Trace is the sum of the diagonal entries; determinant of a 2×2 is ad − bc.',
          explain: 'Trace = ' + a + ' + ' + d + ' = ' + (a + d) + '. Determinant = ' + a + '×' + d + ' − ' + b + '×' + c + ' = ' + (a * d - b * c) + '. The characteristic polynomial is s² − (trace)s + det.',
          steps: ['Add the diagonal entries.', 'Compute ad − bc.', 'Trace ' + (a + d) + ', det ' + (a * d - b * c) + '.']
        });
      }
      var e1 = -(1 + (k % 10)), e2 = 1 + (Math.floor(k / 10) % 10);
      return mc('A continuous-time system has eigenvalues <span class="mono">' + e1 + '</span> and <span class="mono">' + e2 + '</span>. Is it stable?', 'No: one eigenvalue has a positive real part',
        ['Yes: both eigenvalues are real', 'Yes: the trace is negative', 'Marginally stable: one pole is at the origin'], {
          concept: 'Stability from eigenvalues', type: 'Analysis', rot: k + 3,
          hint: 'A continuous-time LTI system is stable only if every eigenvalue has a strictly negative real part.',
          explain: 'The eigenvalues are ' + e1 + ' and ' + e2 + '. Since ' + e2 + ' > 0, the mode e<sup>' + e2 + 't</sup> grows without bound and the system is unstable even though the other mode decays.',
          steps: ['List the eigenvalues.', 'Check the sign of each real part.', 'A positive real part ⇒ unstable.']
        });
    } },

    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a = 1 + (k % 6), b = 1 + (Math.floor(k / 6) % 6), c = 1 + (Math.floor(k / 36) % 4), d = 1 + (Math.floor(k / 144) % 4);
        var tr = a + d, det = a * d - b * c;
        return mc('For <span class="mono">A = [' + a + ' ' + b + '; ' + c + ' ' + d + ']</span>, what is the characteristic polynomial?', 's² − ' + tr + 's + ' + det,
          ['s² + ' + tr + 's + ' + det, 's² − ' + det + 's + ' + tr, 's² + ' + (a + b + c + d) + 's + ' + det], {
            concept: 'Characteristic polynomial', type: 'Calculation', rot: k,
            hint: 'det(sI − A) = s² − (trace)s + det(A).',
            explain: 'det(sI − A) = s² − ' + tr + 's + ' + det + '. Its roots are the eigenvalues; their sum is the trace ' + tr + ' and their product is the determinant ' + det + '.',
            steps: ['Write sI − A.', 'Take the determinant.', 's² − (trace)s + det = s² − ' + tr + 's + ' + det + '.']
          });
      }
      if (form === 1) {
        var l1 = 1 + (k % 9), l2 = 1 + (Math.floor(k / 9) % 9), l3 = 1 + (Math.floor(k / 81) % 6);
        return mc('A triangular state matrix has diagonal entries <span class="mono">' + l1 + ', ' + l2 + ', ' + l3 + '</span>. What are the eigenvalues?', l1 + ', ' + l2 + ' and ' + l3,
        ['0, 0 and ' + (l1 + l2 + l3), String(l1 * l2 * l3) + ' only', String(l1) + ' and ' + String(l2)], {
          concept: 'Eigenvalues of triangular matrices', type: 'Recall', rot: k + 1,
          hint: 'The eigenvalues of a triangular matrix are its diagonal entries.',
          explain: 'The characteristic polynomial is (s − ' + l1 + ')(s − ' + l2 + ')(s − ' + l3 + '), so the eigenvalues are exactly the diagonal entries. All are positive, so this system is unstable.',
          steps: ['Expand det(sI − A) for a triangular matrix.', 'It factors into the diagonal terms.', 'Eigenvalues: ' + l1 + ', ' + l2 + ', ' + l3 + '.']
        });
      }
      if (form === 2) {
        var a2 = 1 + (k % 8), b2 = 1 + (Math.floor(k / 8) % 8), c2 = 1 + (Math.floor(k / 64) % 8);
        var det = a2 * c2;
        return mc('A state matrix is <span class="mono">A = [' + a2 + ' ' + b2 + '; 0 ' + c2 + ']</span>. What is det(sI − A)?', '(s − ' + a2 + ')(s − ' + c2 + ')',
        ['(s − ' + a2 + ')(s − ' + c2 + ') − ' + b2, 's² + ' + (a2 + c2) + 's + ' + det, '(s + ' + a2 + ')(s + ' + c2 + ')'], {
          concept: 'Resolvent determinant', type: 'Calculation', rot: k + 2,
          hint: 'For an upper-triangular matrix, the determinant is the product of the diagonal entries of sI − A.',
          explain: 'sI − A = [s−' + a2 + ' −' + b2 + '; 0 s−' + c2 + '], whose determinant is (s−' + a2 + ')(s−' + c2 + '). The off-diagonal ' + b2 + ' does not affect the eigenvalues.',
          steps: ['Form sI − A.', 'Use the determinant of a triangular matrix.', 'Result: (s − ' + a2 + ')(s − ' + c2 + ').']
        });
      }
      var l1b = -(1 + (k % 8)), l2b = -(1 + (Math.floor(k / 8) % 8)), t = 1 + (Math.floor(k / 64) % 4);
      return mc('A diagonal system has eigenvalues <span class="mono">' + l1b + '</span> and <span class="mono">' + l2b + '</span>. What is the state transition value along the first mode at <span class="mono">t = ' + t + '</span>?', 'e<sup>' + (l1b * t) + '</sup>',
        ['e<sup>' + (l2b * t) + '</sup>', String(l1b * t), '1 − e<sup>' + (l1b * t) + '</sup>'], {
          concept: 'State transition matrix', type: 'Calculation', rot: k + 3,
          hint: 'For a diagonal A, e<sup>At</sup> is diagonal with entries e<sup>λt</sup>.',
          explain: 'The first mode evolves as e<sup>' + l1b + 't</sup>, which at t = ' + t + ' is e<sup>' + (l1b * t) + '</sup>. Negative eigenvalues give decaying modes.',
          steps: ['Write e<sup>At</sup> for a diagonal A.', 'Take the first diagonal entry.', 'Evaluate at t = ' + t + '.']
        });
    } },

    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var sigma = -(1 + (k % 6)), wd = 1 + (Math.floor(k / 6) % 10);
        var wn = Math.sqrt(sigma * sigma + wd * wd);
        return mc('A system has complex eigenvalues <span class="mono">' + sigma + ' ± j' + wd + '</span>. What is the damped oscillation frequency?', D(wd, 3) + ' rad/s',
          [D(wn, 3) + ' rad/s', D(sigma, 3) + ' rad/s', D(2 * wd, 3) + ' rad/s'], {
            concept: 'Complex eigenvalues', type: 'Interpretation', rot: k,
            hint: 'For λ = σ ± jω_d, the imaginary part is the damped oscillation frequency.',
            explain: 'The response contains e<sup>' + sigma + 't</sup>cos(' + wd + 't + φ), so it oscillates at ' + wd + ' rad/s while decaying at rate |' + sigma + '|. The natural frequency is √(σ² + ω_d²) = ' + D(wn, 3) + ' rad/s.',
            steps: ['Read the imaginary part: ' + wd + '.', 'It sets the oscillation rate.', 'The real part sets the decay.']
          });
      }
      if (form === 1) {
        var a = 1 + (k % 5), b = 1 + (Math.floor(k / 5) % 5), c = 1 + (Math.floor(k / 25) % 5);
        var det = -(c * c);
        return mc('A system has <span class="mono">A = [0 1; ' + (-a) + ' ' + (-b) + ']</span> and <span class="mono">B = [0; ' + c + ']</span>. What is det[B AB]?', String(det),
        [String(c * c), String(-b * c), '0'], {
          concept: 'Controllability matrix', type: 'Calculation', rot: k + 1,
          hint: 'AB = [0·0 + 1·B₂; …] = [' + c + '; −' + b + '·' + c + '], so det[B AB] = 0·(−' + (b * c) + ') − ' + c + '·' + c + ' = −' + (c * c) + '.',
          explain: 'B = [0; ' + c + '] and AB = [' + c + '; −' + (b * c) + ']. The determinant is 0×(−' + (b * c) + ') − ' + c + '×' + c + ' = −' + (c * c) + '. It is nonzero, so the pair is controllable.',
          steps: ['Compute AB.', 'Form the 2×2 matrix [B AB].', 'det = −' + (c * c) + ' ≠ 0 ⇒ controllable.']
        });
      }
      if (form === 2) {
        var c1 = 1 + (k % 6), c2 = 1 + (Math.floor(k / 6) % 6), a2 = 1 + (Math.floor(k / 36) % 5);
        var det2 = c1 * c1 + a2 * c2 * c2;
        return mc('A system has <span class="mono">C = [' + c1 + ' ' + c2 + ']</span> and <span class="mono">A = [0 1; ' + (-a2) + ' 0]</span>. What is det[C; CA]?', String(det2),
        [String(c1 * c2), String(-det2), '0'], {
          concept: 'Observability matrix', type: 'Calculation', rot: k + 2,
          hint: 'CA = [' + (-a2 * c2) + ' ' + c1 + ']; stack C above CA and take the determinant.',
          explain: 'CA = [' + (-a2 * c2) + ' ' + c1 + ']. The observability matrix is [' + c1 + ' ' + c2 + '; ' + (-a2 * c2) + ' ' + c1 + '], with determinant ' + c1 + '·' + c1 + ' − ' + c2 + '·(−' + (a2 * c2) + ') = ' + (c1 * c1 + a2 * c2 * c2) + '. It is positive, so the pair is observable.',
          steps: ['Compute CA.', 'Stack C and CA.', 'det = ' + (c1 * c1 + a2 * c2 * c2) + ' ≠ 0.']
        });
      }
      var a3 = 1 + (k % 5), b3 = 1 + (Math.floor(k / 5) % 5), c3 = 1 + (Math.floor(k / 25) % 5), d3 = 1 + (Math.floor(k / 125) % 5);
      return mc('A system has <span class="mono">A = [' + a3 + ' ' + b3 + '; ' + c3 + ' ' + d3 + ']</span>. What is the denominator of its transfer function?', 's² − ' + (a3 + d3) + 's + ' + (a3 * d3 - b3 * c3),
      ['s² + ' + (a3 + d3) + 's + ' + (a3 * d3 - b3 * c3), 's² − ' + (a3 * d3 - b3 * c3) + 's + ' + (a3 + d3), 's² + ' + (a3 + d3) + 's + ' + (a3 * d3 + b3 * c3)], {
        concept: 'Transfer function from state space', type: 'Calculation', rot: k + 3,
        hint: 'The denominator is det(sI − A), the characteristic polynomial of A.',
        explain: 'For a 2×2 A the denominator is s² − (trace)s + det = s² − ' + (a3 + d3) + 's + ' + (a3 * d3 - b3 * c3) + '. State-space realization never changes the poles.',
        steps: ['Compute trace = ' + (a3 + d3) + '.', 'Compute det = ' + (a3 * d3 - b3 * c3) + '.', 'Denominator: s² − ' + (a3 + d3) + 's + ' + (a3 * d3 - b3 * c3) + '.']
      });
    } },

    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var a = 1 + (k % 6), b = 1 + (Math.floor(k / 6) % 6), c = 1 + (Math.floor(k / 36) % 6), d = 1 + (Math.floor(k / 216) % 6);
        var tr = a + d, det = a * d - b * c;
        return mc('Cayley–Hamilton for <span class="mono">A = [' + a + ' ' + b + '; ' + c + ' ' + d + ']</span> states that A² equals which expression?', tr + 'A − ' + det + 'I',
        [det + 'A − ' + tr + 'I', tr + 'A + ' + det + 'I', String(tr) + 'I − ' + String(det) + 'A'], {
          concept: 'Cayley–Hamilton theorem', type: 'Proof', rot: k,
          hint: 'A satisfies its own characteristic polynomial: A² − (trace)A + det I = 0.',
          explain: 'The characteristic polynomial is s² − ' + tr + 's + ' + det + ', so A² − ' + tr + 'A + ' + det + 'I = 0. Rearranging gives A² = ' + tr + 'A − ' + det + 'I. Powers of A can therefore always be reduced to a linear combination of A and I.',
          steps: ['Write the characteristic polynomial.', 'Replace s by A and add the identity term.', 'A² = ' + tr + 'A − ' + det + 'I.']
        });
      }
      if (form === 1) {
        var a2 = 1 + (k % 9), b2 = 1 + (Math.floor(k / 9) % 9);
        return mc('Two state matrices are related by a similarity transform <span class="mono">Ã = T A T<sup>−1</sup></span>. Which quantity is unchanged?', 'The eigenvalues (and therefore the trace and determinant)',
        ['The individual entries of A', 'The eigenvectors written in the original coordinates', 'The B and C matrices without changing them'], {
          concept: 'Similarity invariance', type: 'Analysis', rot: k + 1,
          hint: 'Eigenvalues are roots of det(sI − A), and the determinant is invariant under a similarity transform.',
          explain: 'det(sI − TAT⁻¹) = det(T(sI − A)T⁻¹) = det(sI − A), so the characteristic polynomial and eigenvalues are identical. The state coordinates change, but the input–output behaviour does not.',
          steps: ['Factor T out of sI − Ã.', 'Use det(T T⁻¹) = 1.', 'The characteristic polynomial is unchanged.']
        });
      }
      if (form === 2) {
        var p1 = (1 + (k % 9)) / 10, p2 = (1 + (Math.floor(k / 9) % 9)) / 10;
        return mc('A discrete-time system has eigenvalues <span class="mono">' + p1 + '</span> and <span class="mono">' + p2 + '</span>. Is it stable?', 'Yes: both magnitudes are below 1',
        ['No: positive eigenvalues are unstable', 'Only if the eigenvalues are complex', 'Marginally stable because the eigenvalues are real'], {
          concept: 'Discrete-time stability', type: 'Analysis', rot: k + 2,
          hint: 'In discrete time the stability boundary is the unit circle, not the imaginary axis.',
          explain: 'Both |' + p1 + '| and |' + p2 + '| are less than 1, so every mode decays as n grows. A continuous-time system with the same positive eigenvalues would be unstable — the mapping is z = e<sup>sT</sup>.',
          steps: ['Compare each eigenvalue with the unit circle.', 'Both are inside.', 'Discrete stability requires |λ| < 1, so the system is stable.']
        });
      }
      var a3 = 1 + (k % 6), u = 1 + (Math.floor(k / 6) % 8);
      return mc('A stable system has <span class="mono">x′ = −' + a3 + 'x + u</span> with a constant input <span class="mono">u = ' + u + '</span>. What is the steady-state state value?', D(u / a3, 3),
        ['0', String(u), D(a3 / u, 3)], {
          concept: 'Steady state of a state equation', type: 'Calculation', rot: k + 3,
          hint: 'At steady state x′ = 0, so −ax + u = 0.',
          explain: 'Setting the derivative to zero gives x = u/a = ' + u + '/' + a3 + ' = ' + D(u / a3, 3) + '. The time constant is 1/' + a3 + ' s, and the state approaches this value exponentially.',
          steps: ['Set x′ = 0.', 'Solve −' + a3 + 'x + ' + u + ' = 0.', 'x_ss = ' + D(u / a3, 3) + '.']
        });
    } }
  };

  B.addFamilies({ 7: M7, 8: M8, 9: M9 });
})();
