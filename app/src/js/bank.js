/* ============================================================
   ETE225 — practice bank
   630 items per module, generated deterministically from the course
   mathematics with stable IDs. Bands: 158 Intermediate, 158 Semi-hard,
   157 Hard, 157 Tricky. Every item carries a hint, explanation and
   worked steps; numeric items are computed, never hard-coded.
   ============================================================ */
(function () {
  'use strict';
  var root = window.ETE;
  var B = root.Bank = {};

  var BANDS = [
    { key: 'Intermediate', code: 'I', count: 158 },
    { key: 'Semi-hard', code: 'S', count: 158 },
    { key: 'Hard', code: 'H', count: 157 },
    { key: 'Tricky', code: 'T', count: 157 }
  ];
  function n(x, d) {
    if (!isFinite(x)) return '∞';
    if (x === 0) return '0';
    var s = Number(x).toFixed(d === undefined ? 2 : d);
    s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return s;
  }
  function sgn(x) { return x < 0 ? '−' : ''; }
  function pad3(x) { return String(x).padStart(3, '0'); }
  function rotFor(v) { return (v * 7 + 3) % 4; }
  function mc(stem, correct, wrongs, meta) {
    var opts = [correct];
    wrongs.forEach(function (w) {
      if (w !== undefined && w !== null && String(w) !== String(correct) && opts.every(function (o) { return String(o) !== String(w); })) opts.push(w);
    });
    var fillers = ['None of these', 'Cannot be determined from the given data', 'The statement is true only for t = 0', 'Only if the signal is periodic'];
    var fi = 0;
    while (opts.length < 4 && fi < fillers.length) { if (opts.indexOf(fillers[fi]) < 0) opts.push(fillers[fi]); fi++; }
    opts = opts.slice(0, 4);
    var target = meta && meta.rot !== undefined ? meta.rot % 4 : rotFor(stem.length);
    var ci = 0;
    var tmp = opts[0]; opts[0] = opts[target]; opts[target] = tmp;
    return {
      stem: stem, options: opts, answer: target,
      concept: (meta && meta.concept) || 'Core concept',
      objective: (meta && meta.objective) || 'Apply the module relationships accurately.',
      type: (meta && meta.type) || 'Calculation',
      hint: (meta && meta.hint) || 'Write the governing relationship first, then substitute.',
      explain: (meta && meta.explain) || 'The correct choice follows from the stated relationship and the given values.',
      steps: (meta && meta.steps) || ['Identify the governing relationship.', 'Substitute the given values with units.', 'Check the result for reasonableness.']
    };
  }
  function withUnit(x, unit, d) { return n(x, d) + (unit ? ' ' + unit : ''); }

  /* -------------------------------------------------------------
     M1 — Signals and Systems
     ------------------------------------------------------------- */
  var M1 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      var A = 1 + (k % 5), f = 1 + (Math.floor(k / 5) % 6), B = (Math.floor(k / 30) % 2) * 2;
      if (form === 0) {
        var expr = (B ? B + ' + ' : '') + A + ' cos(2π·' + f + 't)';
        return mc('Consider <span class="mono">x(t) = ' + expr + '</span>. Which symmetry does the signal have?', 'Even: x(−t) = x(t)',
          ['Odd: x(−t) = −x(t)', 'Neither even nor odd', 'Both even and odd'], {
            concept: 'Signal symmetry', type: 'Classification', rot: k,
            hint: 'Replace t by −t. cos is even, and a constant is even; a sum of even terms stays even.',
            explain: 'A constant and a cosine are both unchanged by time reversal, so the sum is even. Only the zero signal is both even and odd.',
            steps: ['x(−t) = ' + (B ? B + ' + ' : '') + A + ' cos(−2π·' + f + 't).', 'cos(−θ) = cos θ, so x(−t) = x(t).', 'Therefore the signal is even.']
          });
      }
      if (form === 1) {
        var f1 = 1 + (k % 10), f2 = f1 + 1 + (Math.floor(k / 10) % 4);
        var g = (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(f1, f2);
        var T = 1 / g;
        return mc('The signal <span class="mono">x(t) = cos(2π·' + f1 + 't) + cos(2π·' + f2 + 't)</span> is periodic. What is its fundamental period?', withUnit(T, 's', 3),
          [withUnit(1 / f1, 's', 3), withUnit(1 / f2, 's', 3), withUnit((1 / f1 + 1 / f2), 's', 3)], {
            concept: 'Periodicity of sums', type: 'Calculation', rot: k + 1,
            hint: 'For a sum of sinusoids with integer frequencies, the fundamental frequency is the greatest common divisor of the component frequencies.',
            explain: 'The two frequencies share the common factor ' + g + ' Hz, so the sum repeats at ' + g + ' Hz. Its period is 1/' + g + ' = ' + n(T, 3) + ' s.',
            steps: ['Component periods: ' + n(1 / f1, 3) + ' s and ' + n(1 / f2, 3) + ' s.', 'The fundamental frequency is gcd(' + f1 + ', ' + f2 + ') = ' + g + ' Hz.', 'T₀ = 1/' + g + ' = ' + n(T, 3) + ' s.']
          });
      }
      if (form === 2) {
        var a1 = 1 + (k % 5), a2 = 1 + (Math.floor(k / 5) % 4);
        return mc('A signal has the form <span class="mono">x(t) = ' + a1 + 'e<sup>−' + a2 + 't</sup>u(t)</span>. How is it classified by energy and power?', 'Energy signal, with finite energy and zero average power',
          ['Power signal, with finite nonzero average power', 'Neither an energy nor a power signal', 'Power signal only if ' + a1 + ' > ' + a2], {
            concept: 'Energy and power signals', type: 'Classification', rot: k + 2,
            hint: 'Integrate |x|² over all time. A one-sided decaying exponential has a finite area.',
            explain: 'E = ∫₀^∞ ' + (a1 * a1) + 'e<sup>−' + (2 * a2) + 't</sup>dt = ' + n(a1 * a1 / (2 * a2), 3) + ' J. Because E is finite, the average power over infinite time is zero.',
            steps: ['E = ' + a1 + '² ∫₀^∞ e<sup>−' + (2 * a2) + 't</sup>dt.', 'The integral is 1/(2·' + a2 + ') = ' + n(1 / (2 * a2), 3) + ' s.', 'E = ' + n(a1 * a1 / (2 * a2), 3) + ' J, finite; P = 0.']
          });
      }
      var fs = 2 + k * 0.25;
      return mc('A continuous-time signal is sampled at <span class="mono">f<sub>s</sub> = ' + fs + ' Hz</span>. The sample at index <span class="mono">n = 3</span> is taken at what time?', withUnit(3 / fs, 's', 3),
        [withUnit(3 * fs, 's', 2), withUnit(fs / 3, 's', 3), withUnit(3, 's', 0)], {
          concept: 'Continuous and discrete time', type: 'Interpretation', rot: k + 3,
          hint: 'For uniform sampling, sample n occurs at t = nT_s = n/f_s.',
          explain: 'T_s = 1/f_s = ' + n(1 / fs, 4) + ' s. At n = 3 the time is 3/f_s = ' + n(3 / fs, 3) + ' s.',
          steps: ['T_s = 1/f_s = ' + n(1 / fs, 4) + ' s.', 't₃ = 3T_s.', 't₃ = ' + n(3 / fs, 3) + ' s.']
        });
    } },
    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      var A = 1 + (k % 8), a = 1 + (Math.floor(k / 8) % 5), t0 = 1 + (Math.floor(k / 20) % 2);
      if (form === 0) {
        var ev = A * Math.exp(-a * t0) / 2;
        return mc('For <span class="mono">x(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span>, what is the even part at <span class="mono">t = ' + t0 + '</span>?', withUnit(ev, '', 4),
          [withUnit(2 * ev, '', 4), '0', withUnit(-ev, '', 4)], {
            concept: 'Even and odd decomposition', type: 'Calculation', rot: k,
            hint: 'For t > 0, x(−t) = 0, so x_e(t) = ½x(t).',
            explain: 'At t = ' + t0 + ' > 0, x(t) = ' + n(A * Math.exp(-a * t0), 4) + ' and x(−t) = 0. The even part is half the sum: ' + n(ev, 4) + '.',
            steps: ['x(' + t0 + ') = ' + A + 'e<sup>−' + n(a * t0, 2) + '</sup> = ' + n(A * Math.exp(-a * t0), 4) + '.', 'x(−' + t0 + ') = 0 because u(−t) = 0.', 'x_e = ½[x(t) + x(−t)] = ' + n(ev, 4) + '.']
          });
      }
      if (form === 1) {
        var odd = A * Math.exp(-a * t0) / 2;
        return mc('For the same one-sided exponential <span class="mono">x(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span>, what is the odd part at <span class="mono">t = ' + t0 + '</span>?', withUnit(odd, '', 4),
          [withUnit(-odd, '', 4), withUnit(2 * odd, '', 4), '0'], {
            concept: 'Even and odd decomposition', type: 'Calculation', rot: k + 1,
            hint: 'x_o(t) = ½[x(t) − x(−t)] and x(−t) = 0 for t > 0.',
            explain: 'The odd part equals the even part at positive time for this one-sided signal: ' + n(odd, 4) + '.',
            steps: ['x(t) = ' + n(A * Math.exp(-a * t0), 4) + ', x(−t) = 0.', 'x_o = ½[x(t) − 0].', 'x_o = ' + n(odd, 4) + '.']
          });
      }
      if (form === 2) {
        var E = A * A / (2 * a);
        return mc('What is the total energy of <span class="mono">x(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span>?', withUnit(E, 'J', 4),
          [withUnit(A * A / a, 'J', 4), withUnit(A / a, 'J', 4), withUnit(A * A * a, 'J', 4)], {
            concept: 'Signal energy', type: 'Calculation', rot: k + 2,
            hint: 'E = ∫₀^∞ A²e<sup>−2at</sup>dt = A²/(2a).',
            explain: 'Substituting A = ' + A + ' and a = ' + a + ' gives E = ' + A + '²/(2·' + a + ') = ' + n(E, 4) + ' J.',
            steps: ['E = A² ∫₀^∞ e<sup>−2at</sup>dt.', '∫₀^∞ e<sup>−2at</sup>dt = 1/(2a).', 'E = ' + A + '²/(2·' + a + ') = ' + n(E, 4) + ' J.']
          });
      }
      var f = 1 + (k % 5), P = A * A / 2;
      return mc('What is the average power of <span class="mono">x(t) = ' + A + 'cos(2π·' + f + 't + 0.4)</span>?', withUnit(P, 'W', 3),
        [withUnit(A * A, 'W', 3), withUnit(A / 2, 'W', 3), withUnit(A * A / 4, 'W', 3)], {
          concept: 'Power of a sinusoid', type: 'Calculation', rot: k + 3,
          hint: 'The average of cos² over a period is ½, so P = A²/2 independent of frequency and phase.',
          explain: 'P = A²/2 = ' + A + '²/2 = ' + n(P, 3) + ' W. Frequency and phase do not change the average power.',
          steps: ['P = (1/T)∫A²cos²(ωt+φ)dt.', 'The mean of cos² is ½.', 'P = A²/2 = ' + n(P, 3) + ' W.']
        });
    } },
    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var A = 1 + (k % 5), f = 1 + (Math.floor(k / 5) % 8);
        var P = A * A / 2;
        return mc('A periodic current <span class="mono">i(t) = ' + A + 'sin(2π·' + f + 't)</span> flows through a 1 Ω resistor. What average power is dissipated?', withUnit(P, 'W', 3),
          [withUnit(A * A, 'W', 3), withUnit(A, 'W', 3), withUnit(0, 'W', 1)], {
            concept: 'Power and energy', type: 'Application', rot: k,
            hint: 'For a sinusoid, RMS current is A/√2, and P = I_rms²R with R = 1 Ω.',
            explain: 'I_rms = ' + A + '/√2 = ' + n(A / Math.SQRT2, 3) + ' A. P = I_rms² = ' + n(P, 3) + ' W.',
            steps: ['I_rms = A/√2 = ' + n(A / Math.SQRT2, 3) + ' A.', 'P = I_rms²R.', 'P = ' + n(P, 3) + ' W.']
          });
      }
      if (form === 1) {
        var A1 = 1 + (k % 8), A2 = 1 + (Math.floor(k / 8) % 5);
        var Psum = A1 * A1 / 2 + A2 * A2 / 2;
        return mc('Two sinusoids <span class="mono">x₁ = ' + A1 + 'cos(2π·3t)</span> and <span class="mono">x₂ = ' + A2 + 'cos(2π·5t)</span> are added. What is the average power of the sum?', withUnit(Psum, 'W', 3),
          [withUnit((A1 + A2) * (A1 + A2) / 2, 'W', 3), withUnit(A1 * A1 / 2, 'W', 3), withUnit((A1 + A2) / 2, 'W', 3)], {
            concept: 'Power of summed sinusoids', type: 'Calculation', rot: k + 1,
            hint: 'Different-frequency sinusoids are orthogonal over a common period, so their powers add; cross terms average to zero.',
            explain: 'P = A₁²/2 + A₂²/2 = ' + n(A1 * A1 / 2, 3) + ' + ' + n(A2 * A2 / 2, 3) + ' = ' + n(Psum, 3) + ' W.',
            steps: ['P₁ = A₁²/2, P₂ = A₂²/2.', 'The cross term averages to zero over the common period.', 'P = ' + n(Psum, 3) + ' W.']
          });
      }
      if (form === 2) {
        var W = 1 + (k % 5), H = 1 + (Math.floor(k / 5) % 4), A = 1 + (Math.floor(k / 20) % 2);
        var E = A * A * W * H;
        return mc('A pulse <span class="mono">x(t) = ' + A + '</span> for <span class="mono">0 &lt; t &lt; ' + W + ' s</span> and zero elsewhere. What is its energy?', withUnit(E, 'J', 3),
          [withUnit(A * W, 'J', 3), withUnit(A * A * W, 'J', 3), withUnit(A * A * W * H / 2, 'J', 3)], {
            concept: 'Energy of a pulse', type: 'Calculation', rot: k + 2,
            hint: 'For a rectangular pulse of height A and width W, E = A²W.',
            explain: 'E = ∫₀^W A²dt = A²W = ' + A + '²·' + W + ' = ' + n(E, 3) + ' J. H is a distractor; the height is ' + A + ', not H.',
            steps: ['x² = ' + A * A + ' on the pulse.', 'Integrate over the pulse width: ' + A * A + ' × ' + W + '.', 'E = ' + n(E, 3) + ' J.']
          });
      }
      var N = 2 + (k % 9), M = 2 + (Math.floor(k / 9) % 8);
      var g = (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(N, M);
      var T = 2 * M / g;
      return mc('What is the fundamental period in samples of <span class="mono">x[n] = cos(' + N + 'πn/' + M + ')</span>?', T + ' samples',
        [(2 * N / g) + ' samples', M + ' samples', (2 * M) + ' samples'], {
          concept: 'Discrete-time periodicity', type: 'Calculation', rot: k + 3,
          hint: 'Reduce Ω₀/(2π) and take the denominator: here Ω₀/(2π) = N/(2M).',
          explain: 'Ω₀/(2π) = ' + N + '/(' + 2 * M + '). Reducing by ' + g + ' gives ' + (N / g) + '/' + (2 * M / g) + ', so the fundamental period is ' + T + ' samples.',
          steps: ['Identify Ω₀ = ' + N + 'π/' + M + '.', 'Form Ω₀/(2π) = ' + N + '/' + (2 * M) + '.', 'Reduce and take the denominator: N = ' + T + '.']
        });
    } },
    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var A = 1 + (k % 6), B = 1 + (Math.floor(k / 6) % 4), C = 1 + (Math.floor(k / 24) % 2), al = 1 + (Math.floor(k / 12) % 3), be = 1 + (Math.floor(k / 3) % 7);
        var t0 = be / al, val = (A * t0 * t0 + B * t0 + C) / al;
        return mc('Evaluate <span class="mono">I = ∫ ( ' + A + 't² + ' + B + 't + ' + C + ' ) δ(' + al + 't − ' + be + ') dt</span> over all t.', n(val, 3),
          [n(A * t0 * t0 + B * t0 + C, 3), n(val * al, 3), '0'], {
            concept: 'Impulse sifting and scaling', type: 'Calculation', rot: k,
            hint: 'Use δ(at−b) = δ(t−b/a)/|a|. The integral equals f(b/a)/|a|.',
            explain: 'The impulse is at t₀ = ' + be + '/' + al + ' = ' + n(t0, 3) + '. The polynomial evaluates to ' + n(A * t0 * t0 + B * t0 + C, 3) + ', and the scaling factor 1/|a| = 1/' + al + '. The integral is ' + n(val, 3) + '.',
            steps: ['Set the impulse argument to zero: t₀ = ' + n(t0, 3) + '.', 'Evaluate f(t₀) = ' + n(A * t0 * t0 + B * t0 + C, 3) + '.', 'Divide by |a| = ' + al + ': I = ' + n(val, 3) + '.']
          });
      }
      if (form === 1) {
        var fs = 2 + (k % 11), f = 1 + (Math.floor(k / 11) % 9);
        var alias = Math.abs(f - Math.round(f / fs) * fs);
        var nyq = 2 * f;
        return mc('A <span class="mono">' + f + ' Hz</span> tone is sampled at <span class="mono">' + fs + ' Hz</span>. What is the observed alias frequency?', withUnit(alias, 'Hz', 2),
          [withUnit(f, 'Hz', 2), withUnit(Math.abs(f - fs), 'Hz', 2), withUnit(nyq, 'Hz', 2)], {
            concept: 'Aliasing preview', type: 'Analysis', rot: k + 1,
            hint: 'Fold the frequency into the range [0, f_s/2] by subtracting the nearest multiple of f_s.',
            explain: 'The nearest multiple of f_s is ' + Math.round(f / fs) + '·' + fs + ' = ' + (Math.round(f / fs) * fs) + ' Hz. The magnitude difference is ' + n(alias, 2) + ' Hz. The Nyquist rate would be ' + nyq + ' Hz, so aliasing is present.',
            steps: ['k = round(' + f + '/' + fs + ') = ' + Math.round(f / fs) + '.', 'f_alias = |f − k f_s| = ' + n(alias, 2) + ' Hz.', 'Since ' + fs + ' Hz < ' + nyq + ' Hz, the tone folds.']
          });
      }
      if (form === 2) {
        var forms = [
          { s: 'y(t) = ' + (1 + k % 3) + 'x(t − 1)', lin: true, ti: true, cau: true, stab: true },
          { s: 'y(t) = x(1 − t)', lin: true, ti: false, cau: false, stab: true },
          { s: 'y(t) = t x(t)', lin: true, ti: false, cau: true, stab: false },
          { s: 'y(t) = x²(t)', lin: false, ti: true, cau: true, stab: true },
          { s: 'y(t) = cos(x(t))', lin: false, ti: true, cau: true, stab: true },
          { s: 'y(t) = ∫<sub>−∞</sub><sup>t</sup>x(τ)dτ', lin: true, ti: true, cau: true, stab: false },
          { s: 'y(t) = x(t+2)', lin: true, ti: true, cau: false, stab: true },
          { s: 'y[n] = x[n] − x[n−1]', lin: true, ti: true, cau: true, stab: true },
          { s: 'y[n] = Σ<sub>k=0</sub><sup>n</sup>x[k]', lin: true, ti: true, cau: true, stab: false },
          { s: 'y(t) = |x(t)|', lin: false, ti: true, cau: true, stab: true },
          { s: 'y(t) = x(t)cos(2π·5t)', lin: true, ti: false, cau: true, stab: true },
          { s: 'y(t) = 3x(t) + 1', lin: false, ti: true, cau: true, stab: true }
        ];
        var sys = forms[k % forms.length];
        var ask = Math.floor(k / 12) % 4;
        var correct, wrongs, q;
        if (ask === 0) { q = 'linear?'; correct = sys.lin ? 'Linear' : 'Not linear'; wrongs = [sys.lin ? 'Not linear' : 'Linear', 'Linear only for periodic inputs', 'Cannot be decided without the impulse response']; }
        else if (ask === 1) { q = 'time-invariant?'; correct = sys.ti ? 'Time-invariant' : 'Time-varying'; wrongs = [sys.ti ? 'Time-varying' : 'Time-invariant', 'Time-invariant only for causal inputs', 'The property is undefined for this system']; }
        else if (ask === 2) { q = 'causal?'; correct = sys.cau ? 'Causal' : 'Noncausal'; wrongs = [sys.cau ? 'Noncausal' : 'Causal', 'Causal only if x(t) = 0 for t < 0', 'All LTI systems are causal']; }
        else { q = 'BIBO stable?'; correct = sys.stab ? 'BIBO stable' : 'Not BIBO stable'; wrongs = [sys.stab ? 'Not BIBO stable' : 'BIBO stable', 'Stable only if the input is sinusoidal', 'Every causal system is stable']; }
        return mc('For the system <span class="mono">' + sys.s + '</span>, is it ' + q, correct, wrongs, {
          concept: 'System classification', type: 'Analysis', rot: k + 2,
          hint: ask === 0 ? 'Test superposition with two arbitrary inputs.' : ask === 1 ? 'Compare T{x(t−t₀)} with y(t−t₀).' : ask === 2 ? 'Check whether the output uses any future input value.' : 'Check whether every bounded input gives a bounded output.',
          explain: 'The system is ' + (sys.lin ? 'linear' : 'not linear') + ', ' + (sys.ti ? 'time-invariant' : 'time-varying') + ', ' + (sys.cau ? 'causal' : 'noncausal') + ' and ' + (sys.stab ? 'BIBO stable' : 'not BIBO stable') + '. The sign or time dependence inside the argument is what decides the property.',
          steps: ['Write the input-output rule.', 'Apply the definition of the requested property.', 'Test with a shift, a future value, or a superposition; do not rely on the appearance of the formula.']
        });
      }
      var W = 1 + (k % 4), A = 1 + (Math.floor(k / 4) % 4), tau = 1 + (Math.floor(k / 16) % 3);
      var val = A * W * Math.exp(-tau);
      return mc('A first-order system with impulse response <span class="mono">h(t) = ' + A + 'e<sup>−t</sup>u(t)</span> is driven by a rectangular pulse of height ' + W + ' starting at t = 0. What is the output at <span class="mono">t = ' + tau + '</span>?', n(val, 3),
        [n(A * W, 3), n(A * W * (1 - Math.exp(-tau)), 3), n(A * W * Math.exp(-tau) / tau, 3)], {
          concept: 'Convolution preview', type: 'Application', rot: k + 3,
          hint: 'For a pulse of height W and h = Ae^{−t}u(t), y(t) = A W (1 − e^{−t}) for t within the pulse.',
          explain: 'y(t) = ∫₀^t ' + W + '·' + A + 'e<sup>−(t−τ)</sup>dτ = ' + A * W + '(1 − e<sup>−t</sup>). At t = ' + tau + ' this is ' + n(val, 3) + '.',
          steps: ['Convolution of a constant input with an exponential impulse response.', 'y(t) = A W(1 − e<sup>−t</sup>) for 0 ≤ t ≤ pulse width.', 'At t = ' + tau + ': ' + n(val, 3) + '.']
        });
    } }
  };

  /* -------------------------------------------------------------
     M2 — LTI Systems and Convolution
     ------------------------------------------------------------- */
  var M2 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      var A = 1 + (k % 8), Tx = 1 + (Math.floor(k / 8) % 5), Th = 1 + (Math.floor(k / 40) % 2);
      if (form === 0) {
        var peak = A * Math.min(Tx, Th);
        return mc('Two rectangular pulses <span class="mono">x(t) = ' + A + ' rect(t/' + Tx + ')</span> and <span class="mono">h(t) = rect(t/' + Th + ')</span>, both starting at t = 0, are convolved. What is the peak of y(t)?', n(peak, 3),
          [n(A * Math.max(Tx, Th), 3), n(A * Tx * Th, 3), n(A, 3)], {
            concept: 'Convolution of pulses', type: 'Calculation', rot: k,
            hint: 'The peak overlap area is the smaller width multiplied by the amplitude.',
            explain: 'The overlap width first grows to min(Tx, Th) = ' + Math.min(Tx, Th) + ' s while the amplitude is ' + A + ', so the peak is ' + n(peak, 3) + '.',
            steps: ['Sketch the two pulses in the τ domain.', 'As h(t−τ) slides, the overlap grows until it reaches the narrower width.', 'Peak = A × min(Tx, Th) = ' + n(peak, 3) + '.']
          });
      }
      if (form === 1) {
        var area = A * Tx * Th;
        return mc('For the same two pulses, what is the area under the convolution?', n(area, 3),
          [n(A * (Tx + Th), 3), n(A * Math.min(Tx, Th), 3), n(Tx * Th, 3)], {
            concept: 'Convolution area property', type: 'Concept', rot: k + 1,
            hint: 'The area of x*h is the product of the areas of x and h.',
            explain: 'Area{x} = ' + A + '×' + Tx + ' = ' + n(A * Tx, 3) + '; area{h} = ' + Th + '. Their product is ' + n(area, 3) + '.',
            steps: ['Area of a pulse = height × width.', 'Area{x} = ' + n(A * Tx, 3) + ', area{h} = ' + Th + '.', 'Area of convolution = product = ' + n(area, 3) + '.']
          });
      }
      if (form === 2) {
        var support = Tx + Th;
        return mc('Again for <span class="mono">x(t) = ' + A + 'rect(t/' + Tx + ')</span> and <span class="mono">h(t) = rect(t/' + Th + ')</span>, how long is the nonzero support of y(t)?', withUnit(support, 's', 2),
          [withUnit(Math.max(Tx, Th), 's', 2), withUnit(Math.abs(Tx - Th), 's', 2), 'Infinite'], {
            concept: 'Convolution support', type: 'Concept', rot: k + 2,
            hint: 'For two causal pulses, the output runs from 0 to the sum of their widths.',
            explain: 'The output begins when the leading edges meet and ends when the trailing edges separate, so its support is Tx + Th = ' + support + ' s.',
            steps: ['x is nonzero on [0, ' + Tx + '], h on [0, ' + Th + '].', 'The convolution is nonzero while the shifted pulses overlap.', 'Support length = ' + Tx + ' + ' + Th + ' = ' + support + ' s.']
          });
      }
      var dc = A * Tx * Th;
      return mc('What is the DC gain of the system with impulse response <span class="mono">h(t) = ' + A + 'rect(t/' + Tx + ')</span>?', n(dc, 3),
        [n(A, 3), n(A * Tx, 3), n(Tx, 3)], {
          concept: 'DC gain from the impulse response', type: 'Application', rot: k + 3,
          hint: 'For an LTI system, DC gain is the integral of h(t).',
          explain: 'H(0) = ∫h(t)dt = height × width = ' + A + '×' + Tx + ' = ' + n(dc, 3) + '.',
          steps: ['H(jω) = ∫h(t)e<sup>−jωt</sup>dt.', 'At ω = 0 the exponential is 1, so H(0) is the area of h.', 'H(0) = ' + n(dc, 3) + '.']
        });
    } },
    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      var A = 1 + (k % 8), a = 1 + (Math.floor(k / 8) % 5), t0 = 1 + (Math.floor(k / 20) % 2);
      if (form === 0) {
        var s = A / a * (1 - Math.exp(-a * t0));
        return mc('The impulse response is <span class="mono">h(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span>. What is the step response at <span class="mono">t = ' + t0 + '</span>?', n(s, 4),
          [n(A * t0, 4), n(A / a, 4), n(A * Math.exp(-a * t0), 4)], {
            concept: 'Step response', type: 'Calculation', rot: k,
            hint: 's(t) = ∫₀^t h(τ)dτ = (A/a)(1 − e^{−at}).',
            explain: 's(t) = ∫₀^t ' + A + 'e<sup>−' + a + 'τ</sup>dτ = (' + A + '/' + a + ')(1 − e<sup>−' + a + 't</sup>). At t = ' + t0 + ', s = ' + n(s, 4) + '.',
            steps: ['Integrate h from 0 to t.', 'The integral is (A/a)(1 − e<sup>−at</sup>).', 'Evaluate at ' + t0 + ': ' + n(s, 4) + '.']
          });
      }
      if (form === 1) {
        var finalv = A / a;
        return mc('What is the final value of the step response for <span class="mono">h(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span>?', n(finalv, 4),
          [n(A, 4), n(A * a, 4), '0'], {
            concept: 'Final value of a step response', type: 'Concept', rot: k + 1,
            hint: 'Let t → ∞ in s(t) = (A/a)(1 − e^{−at}).',
            explain: 'As t → ∞ the exponential vanishes, leaving A/a = ' + n(finalv, 4) + '. This is also H(0).',
            steps: ['s(t) = (A/a)(1 − e<sup>−at</sup>).', 'e<sup>−at</sup> → 0 for a > 0.', 's(∞) = A/a = ' + n(finalv, 4) + '.']
          });
      }
      if (form === 2) {
        var E = A * A / (2 * a);
        return mc('Is the system with <span class="mono">h(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span> BIBO stable, and what is ∫|h|dt?', 'Stable; the integral is ' + n(A / a, 3),
          ['Unstable; the integral diverges', 'Stable; the integral is ' + n(E, 3), 'Marginal; the integral is infinite'], {
            concept: 'BIBO stability', type: 'Analysis', rot: k + 2,
            hint: 'For an LTI system, BIBO stability is equivalent to absolute integrability of h.',
            explain: '∫₀^∞ |' + A + 'e<sup>−' + a + 't</sup>|dt = ' + A + '/' + a + ' = ' + n(A / a, 3) + ', finite, so the system is BIBO stable. The energy is finite too, but stability uses the absolute integral, not energy.',
            steps: ['Test ∫|h(t)|dt.', 'The exponential is positive, so the integral is A/a = ' + n(A / a, 3) + '.', 'Finite ⇒ BIBO stable.']
          });
      }
      var v1 = 1 + (k % 4), v2 = 1 + (Math.floor(k / 4) % 4), v3 = 1 + (Math.floor(k / 16) % 3), w1 = 1 + (Math.floor(k / 3) % 3), w2 = 1 + (Math.floor(k / 9) % 2);
      var x = [v1, v2, v3, 0], harr = [w1, w2];
      var yv = x[0] * harr[1] + x[1] * harr[0];
      return mc('A discrete LTI system has <span class="mono">x[n] = {' + v1 + ', ' + v2 + ', ' + v3 + ', 0}</span> and <span class="mono">h[n] = {' + w1 + ', ' + w2 + '}</span>, both starting at n = 0. What is y[1]?', String(yv),
        [String(v1 * w1), String(v2 * w2), String(v1 + w1 + v2 + w2)], {
          concept: 'Convolution sum', type: 'Calculation', rot: k + 3,
          hint: 'y[1] = x[0]h[1] + x[1]h[0].',
          explain: 'y[1] = 1·2 + 1·1 = 3. Do not include x[2]h[−1]; h is zero for negative index.',
          steps: ['Write y[1] = Σ x[k]h[1−k].', 'Only k = 0 and k = 1 contribute.', 'y[1] = 1·2 + 1·1 = 3.']
        });
    } },
    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      var a = 1 + (k % 4), b = 1 + (Math.floor(k / 4) % 4), A = 1 + (Math.floor(k / 16) % 2);
      if (form === 0) {
        var t = 0.5 + (k % 4) * 0.25;
        var y = a === b ? A * t * Math.exp(-a * t) : A / (b - a) * (Math.exp(-a * t) - Math.exp(-b * t));
        return mc('Convolve <span class="mono">x(t) = ' + a + 'e<sup>−' + a + 't</sup>u(t)</span> with <span class="mono">h(t) = ' + b + 'e<sup>−' + b + 't</sup>u(t)</span>. What is y(' + t + ')?', n(y, 4),
          [n(A * Math.exp(-a * t), 4), n(A * (1 - Math.exp(-a * t)), 4), n(A * t, 4)], {
            concept: 'Convolution of exponentials', type: 'Calculation', rot: k,
            hint: 'If a ≠ b, y(t) = [A/(b−a)](e^{−at} − e^{−bt}) for t ≥ 0. If a = b, use the repeated-pole form A t e^{−at}.',
            explain: 'With a = ' + a + ' and b = ' + b + ', the convolution at t = ' + t + ' evaluates to ' + n(y, 4) + '.',
            steps: ['y(t) = ∫₀^t ' + a + 'e<sup>−aτ</sup>·' + b + 'e<sup>−b(t−τ)</sup>dτ.', 'Factor e<sup>−bt</sup> and integrate e<sup>−(a−b)τ</sup>.', 'Substitute t = ' + t + ': ' + n(y, 4) + '.']
          });
      }
      if (form === 1) {
        var G = 1 + (Math.floor(k / 3) % 4), tt = 0.5 + (k % 3) * 0.5;
        var yv = G * A / a * (1 - Math.exp(-a * tt));
        return mc('A system with <span class="mono">h(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t)</span> is driven by the step <span class="mono">x(t) = ' + G + 'u(t)</span>. What is the output at <span class="mono">t = ' + tt + ' s</span>?', n(yv, 4),
          [n(G * A * tt, 4), n(G * A / a, 4), n(G * A / a * Math.exp(-a * tt), 4)], {
            concept: 'Step response with a scaled input', type: 'Calculation', rot: k + 1,
            hint: 'Linearity scales the unit-step response: y(t) = (G·A/a)(1 − e^{−at}).',
            explain: 'The unit-step response is (A/a)(1 − e<sup>−at</sup>). Multiplying the input by G scales it: y(' + tt + ') = ' + n(yv, 4) + '.',
            steps: ['s(t) = (A/a)(1 − e<sup>−at</sup>).', 'Scale by G = ' + G + '.', 'Substitute t = ' + tt + ': ' + n(yv, 4) + '.']
          });
      }
      if (form === 2) {
        var W = 1 + (k % 4), c = 1 + (Math.floor(k / 4) % 3);
        var val = A * (1 - Math.exp(-c * W)) / c;
        return mc('A pulse of height ' + A + ' and width ' + W + ' passes through an LTI system with impulse response <span class="mono">h(t) = e<sup>−' + c + 't</sup>u(t)</span>. What is the output at the instant the pulse ends?', n(val, 4),
          [n(A * W, 4), n(A / c, 4), n(A * Math.exp(-c * W), 4)], {
            concept: 'Convolution with a pulse', type: 'Application', rot: k + 2,
            hint: 'While the pulse is on, the output is A/c(1 − e^{−ct}).',
            explain: 'y(W) = ∫₀^W ' + A + 'e<sup>−' + c + '(W−τ)</sup>dτ = (' + A + '/' + c + ')(1 − e<sup>−' + c * W + '</sup>) = ' + n(val, 4) + '.',
            steps: ['Set up the convolution for 0 ≤ W.', 'Pull out the constant A and integrate the exponential.', 'Evaluate at t = W = ' + W + ': ' + n(val, 4) + '.']
          });
      }
      var T = 1 + (Math.floor(k / 32) % 3);
      var A3 = 1 + (Math.floor(k / 96) % 2);
      A = A3;
      return mc('The impulse response of a system is <span class="mono">h(t) = ' + A + 'δ(t − ' + T + ') + ' + (a + 1) + 'e<sup>−' + (b + 1) + 't</sup>u(t)</span>. Is it BIBO stable?', 'Stable: the absolute integral is finite',
        ['Unstable: the impulse term has infinite area', 'Unstable because a delayed impulse is noncausal', 'Stable only if the impulse is at t = 0'], {
          concept: 'BIBO stability with impulses', type: 'Analysis', rot: k + 3,
          hint: 'An impulse contributes its magnitude, not an infinite area. A decaying exponential contributes a finite integral.',
          explain: '∫|h|dt = ' + A + ' + ' + (a + 1) + '/' + (b + 1) + ' = ' + n(A + (a + 1) / (b + 1), 3) + ', finite. The delay ' + T + ' s does not affect stability.',
          steps: ['Absolute area of Aδ(t−T) is A.', 'Absolute area of the exponential is coefficient/decay.', 'Sum is finite ⇒ stable.']
        });
    } },
    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var A = 1 + (k % 3), T1 = 1 + (Math.floor(k / 3) % 3), B = 1 + (Math.floor(k / 9) % 3), T2 = 1 + (Math.floor(k / 27) % 2);
        var val = A * B;
        return mc('Two systems with <span class="mono">h₁(t) = ' + A + 'δ(t − ' + T1 + ')</span> and <span class="mono">h₂(t) = ' + B + 'δ(t − ' + T2 + ')</span> are connected in cascade. What is the equivalent impulse response at <span class="mono">t = ' + (T1 + T2) + '</span>?', String(val),
          [String(A + B), String(A * B * (T1 + T2)), '0'], {
            concept: 'Cascade of LTI systems', type: 'Calculation', rot: k,
            hint: 'Convolution of two shifted impulses gives one impulse at the sum of the delays with the product of the areas.',
            explain: 'Aδ(t−T₁) * Bδ(t−T₂) = AB δ(t−(T₁+T₂)). With A = ' + A + ' and B = ' + B + ', the coefficient at t = ' + (T1 + T2) + ' is ' + val + '.',
            steps: ['Use δ(t−T₁)*δ(t−T₂) = δ(t−T₁−T₂).', 'Multiply the areas: ' + A + '·' + B + ' = ' + val + '.', 'The equivalent impulse is ' + val + 'δ(t−' + (T1 + T2) + ').']
          });
      }
      if (form === 1) {
        var a = 1 + (k % 3), sh = 1 + (Math.floor(k / 3) % 3), A = 1 + (Math.floor(k / 9) % 5);
        var val = A / a;
        return mc('What is <span class="mono">x(t) * δ(' + a + 't − ' + sh + ')</span> if <span class="mono">x(t) = ' + A + 'rect(t)</span>?', 'The pulse scaled by ' + n(A / a, 3) + ' and shifted to t = ' + n(sh / a, 3),
          ['The pulse scaled by ' + A + ' and shifted to t = ' + sh, 'The pulse scaled by ' + A * a + ' and shifted to t = ' + sh / a, 'The pulse unchanged'], {
            concept: 'Convolution with a scaled impulse', type: 'Concept', rot: k + 1,
            hint: 'Use δ(at−b) = δ(t−b/a)/|a|. Convolution with δ(t−t₀) shifts the signal to t₀.',
            explain: 'The scaled impulse equals (1/|a|)δ(t−b/a) = (1/' + a + ')δ(t−' + n(sh / a, 3) + '). Convolution scales by 1/a and shifts by b/a.',
            steps: ['Rewrite δ(at−b) = δ(t−b/a)/|a|.', 'Convolution with δ(t−t₀) shifts x to t₀.', 'Result: (' + A + '/' + a + ')rect(t−' + n(sh / a, 3) + ').']
          });
      }
      if (form === 2) {
        var W = 1 + (k % 8), A = 1 + (Math.floor(k / 8) % 5);
        var area = A * W;
        return mc('A system has impulse response <span class="mono">h(t) = ' + A + 'rect(t/' + W + ')</span>. What input produces the output <span class="mono">y(t) = h(t)</span>?', 'The unit impulse δ(t)',
          ['The unit step u(t)', 'A pulse of width ' + W + ' and height ' + A, 'The derivative of h(t)'], {
            concept: 'Identity and invertibility', type: 'Concept', rot: k + 2,
            hint: 'Convolution with δ(t) leaves any signal unchanged: x*δ = x.',
            explain: 'Since h*δ = h, the input that produces h as output is δ(t). Any other choice would require a different deconvolution.',
            steps: ['Set y = h.', 'Use the identity x*δ = x.', 'Therefore x = δ(t).']
          });
      }
      var A = 1 + (k % 4), a = 1 + (Math.floor(k / 4) % 4), T = 1 + (Math.floor(k / 16) % 3);
      var peak = A / a * Math.exp(-a * 0);
      return mc('The impulse response <span class="mono">h(t) = ' + A + 'e<sup>−' + a + 't</sup>u(t − ' + T + ')</span> is delayed by ' + T + ' s. What is the system output at t = ' + T + ' for a unit impulse input?', n(A, 3),
        [n(A * Math.exp(-a * T), 3), '0', n(A / a, 3)], {
          concept: 'Time-invariance and delay', type: 'Analysis', rot: k + 3,
          hint: 'h(t) is the response to δ(t). If h is shifted, its value at the shift instant is the coefficient.',
          explain: 'At t = ' + T + ', u(t−' + T + ') becomes 1 and e<sup>−a·0</sup> = 1, so h(' + T + ') = ' + A + '. The exponential decay starts at the delay, not at zero.',
          steps: ['Evaluate h at t = T.', 'u(T−T) = u(0) = 1 by convention.', 'h(T) = ' + A + 'e⁰ = ' + A + '.']
        });
    } }
  };

  /* placeholders for modules 3–9 */
  var FAMILIES = { 1: M1, 2: M2 };
  B.addFamilies = function (obj) {
    Object.keys(obj).forEach(function (k) { FAMILIES[k] = obj[k]; });
    CACHE = {};
  };

  var CACHE = {};
  // The build step embeds the validated bank as JSON so that every item is
  // stored with the page. The generators remain as a fallback for the
  // development build and for modules added after publication.
  var EMBEDDED = null;
  try {
    var dataEl = document.getElementById('bank-data');
    if (dataEl && dataEl.textContent && dataEl.textContent.replace(/\s/g, '').length > 2) {
      var parsedBank = JSON.parse(dataEl.textContent);
      if (parsedBank && typeof parsedBank === 'object') EMBEDDED = parsedBank;
    }
  } catch (e) { EMBEDDED = null; }
  function embeddedFor(m) {
    if (!EMBEDDED) return null;
    return EMBEDDED[String(m)] || EMBEDDED[m] || null;
  }
  function build(m) {
    if (CACHE[m]) return CACHE[m];
    var stored = embeddedFor(m);
    if (stored && stored.items && stored.items.length) {
      CACHE[m] = { module: m, items: stored.items, counts: stored.counts || {
        Intermediate: 158, 'Semi-hard': 158, Hard: 157, Tricky: 157
      } };
      return CACHE[m];
    }
    var fam = FAMILIES[m];
    if (!fam) return { module: m, items: [], counts: {} };
    var items = [], seen = {}, offset = 0;
    BANDS.forEach(function (band) {
      var target = band.count;
      var f = fam[band.key];
      var got = 0, v = 0, guard = 0;
      while (got < target && guard < 12000) {
        guard++;
        var raw;
        try { raw = f.make(v++); } catch (e) { raw = null; }
        if (!raw || !raw.stem || !raw.options || raw.options.length < 2) continue;
        var key = raw.stem;
        if (seen[key]) continue;
        seen[key] = 1;
        var idx = got + 1;
        items.push({
          id: 'm' + m + '-' + band.code + '-' + pad3(idx),
          module: m, cat: band.key, concept: raw.concept, objective: raw.objective,
          type: raw.type, stem: raw.stem, options: raw.options, answer: raw.answer,
          hint: raw.hint, explain: raw.explain, steps: raw.steps, bandIndex: offset + got
        });
        got++;
      }
      if (got < target) throw new Error('Bank shortfall in module ' + m + ' band ' + band.key + ': ' + got + '/' + target);
      offset += got;
    });
    CACHE[m] = { module: m, items: items, counts: { Intermediate: 158, 'Semi-hard': 158, Hard: 157, Tricky: 157 } };
    return CACHE[m];
  }
  B.get = function (m) { return build(Number(m)); };
  B.all = function () {
    var out = [];
    for (var m = 1; m <= 9; m++) out = out.concat(build(m).items);
    return out;
  };
  B.pick = function (m, band, count, seed) {
    var items = build(Number(m)).items.filter(function (q) { return q.cat === band; });
    var out = [], used = {};
    var s = seed || 1;
    for (var i = 0; i < count && items.length; i++) {
      s = (s * 1664525 + 1013904223) >>> 0;
      var idx = s % items.length;
      var guard = 0;
      while (used[idx] && guard < items.length) { idx = (idx + 1) % items.length; guard++; }
      used[idx] = 1;
      out.push(items[idx]);
    }
    return out;
  };
  B.BANDS = BANDS;
  B.h = { n: n, mc: mc, withUnit: withUnit };
  B.count = function (m) { return build(Number(m)).items.length; };

  root.Bank = B;

  /* -------------------------------------------------------------
     Bank UI
     ------------------------------------------------------------- */
  var UI = root.BankUI = {};
  var stateUI = { module: 1, band: 'Intermediate', page: 0, concept: '', per: 10, highlight: '' };
  var inited = false;
  function strip(t) { var d = document.createElement('div'); d.innerHTML = t; return d.textContent || ''; }
  function escape(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function init() {
    if (inited) return;
    inited = true;
    var modSel = document.getElementById('bankModule');
    if (!modSel) return;
    root.data.course.modules.forEach(function (mm) {
      var o = document.createElement('option');
      o.value = mm.id; o.textContent = 'Module ' + mm.id + ' — ' + mm.title;
      modSel.appendChild(o);
    });
    modSel.value = String(stateUI.module);
    modSel.addEventListener('change', function () { stateUI.module = Number(modSel.value); stateUI.page = 0; stateUI.concept = ''; render(); updateHash(); });
    document.getElementById('bankTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-band]');
      if (!b) return;
      stateUI.band = b.getAttribute('data-band'); stateUI.page = 0; render(); updateHash();
    });
    document.getElementById('bankConcept').addEventListener('change', function (e) { stateUI.concept = e.target.value; stateUI.page = 0; render(); });
    document.getElementById('bankPager').addEventListener('click', function (e) {
      var b = e.target.closest('[data-page]');
      if (!b) return;
      stateUI.page = Number(b.getAttribute('data-page')); render(); window.scrollTo({ top: document.getElementById('bankList').offsetTop - 80, behavior: root.motionReduced() ? 'auto' : 'smooth' });
    });
    document.getElementById('bankList').addEventListener('click', function (e) {
      var b = e.target.closest('[data-sol]');
      if (!b) return;
      var sol = b.closest('.bank-item').querySelector('.solution');
      if (sol) sol.hidden = !sol.hidden;
    });
    render();
  }

  function filtered() {
    var bank = root.Bank.get(stateUI.module);
    return bank.items.filter(function (q) { return q.cat === stateUI.band && (!stateUI.concept || q.concept === stateUI.concept); });
  }
  function render() {
    if (!inited) { init(); return; }
    var bank = root.Bank.get(stateUI.module);
    var counts = { Intermediate: 0, 'Semi-hard': 0, Hard: 0, Tricky: 0 };
    bank.items.forEach(function (q) { counts[q.cat]++; });
    var tabs = document.getElementById('bankTabs');
    tabs.innerHTML = BANDS.map(function (b) {
      return '<button type="button" role="tab" data-band="' + b.key + '" aria-selected="' + (stateUI.band === b.key ? 'true' : 'false') + '">' + b.key + ' <span class="count">' + counts[b.key] + '</span></button>';
    }).join('');
    var attempted = root.state().bank.attempted;
    var attemptedN = bank.items.filter(function (q) { return attempted[q.id]; }).length;
    var correctN = bank.items.filter(function (q) { return attempted[q.id] && attempted[q.id].correct; }).length;
    document.getElementById('bankSummary').innerHTML =
      '<div class="stat"><b>' + bank.items.length + '</b><span>Items in this module</span></div>' +
      '<div class="stat"><b>' + counts[stateUI.band] + '</b><span>In ' + stateUI.band + '</span></div>' +
      '<div class="stat"><b>' + attemptedN + '</b><span>Attempted here</span></div>' +
      '<div class="stat"><b>' + (attemptedN ? Math.round(100 * correctN / attemptedN) + '%' : '—') + '</b><span>Correct</span></div>';
    var concepts = {};
    bank.items.forEach(function (q) { if (q.cat === stateUI.band) concepts[q.concept] = 1; });
    var cSel = document.getElementById('bankConcept');
    var cur = stateUI.concept;
    cSel.innerHTML = '<option value="">All concepts</option>' + Object.keys(concepts).sort().map(function (c) { return '<option value="' + escape(c) + '">' + escape(c) + '</option>'; }).join('');
    cSel.value = cur;
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / stateUI.per));
    if (stateUI.page >= pages) stateUI.page = pages - 1;
    var start = stateUI.page * stateUI.per;
    var pageItems = list.slice(start, start + stateUI.per);
    var notice = document.getElementById('bankNotice');
    if (!list.length) {
      notice.innerHTML = '<div class="empty"><b>No items match this filter.</b>Clear the concept filter or choose another band.</div>';
    } else {
      notice.innerHTML = '<p class="small faint" style="margin:0 0 10px">Showing items ' + (start + 1) + '–' + Math.min(start + stateUI.per, list.length) + ' of ' + list.length + '. Selected band: ' + stateUI.band + '.</p>';
    }
    document.getElementById('bankList').innerHTML = pageItems.map(function (q) {
      var prev = attempted[q.id];
      var chosen = prev ? prev.choice : -1;
      return '<article class="bank-item" id="' + q.id + '"><div class="bi-head"><span class="pill teal">' + escape(q.type) + '</span><span class="pill">' + escape(q.concept) + '</span><span class="pill">' + escape(q.cat) + '</span><span class="qid">' + q.id + '</span></div>' +
        '<div class="q-stem">' + q.stem + '</div>' +
        '<div class="options" role="group" aria-label="Answer choices">' + q.options.map(function (o, i) {
          var cls = 'option' + (prev && i === q.answer ? ' is-correct' : '') + (prev && i === chosen && chosen !== q.answer ? ' is-wrong' : '');
          return '<button class="' + cls + '" type="button" data-choose="' + i + '"' + (prev ? ' disabled' : '') + ' aria-pressed="' + (prev && i === chosen ? 'true' : 'false') + '"><span class="letter">' + String.fromCharCode(65 + i) + '</span><span>' + o + '</span></button>';
        }).join('') + '</div>' +
        '<div class="q-actions"><button class="btn btn-ghost btn-sm" type="button" data-hint-btn="' + q.id + '">Hint</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-sol="' + q.id + '"' + (prev ? '' : ' hidden') + '>Solution</button>' +
        (prev ? '<span class="pill ' + (prev.correct ? 'lime' : 'rose') + '">' + (prev.correct ? 'Correct' : 'Review this one') + '</span>' : '') +
        '</div><div class="feedback" data-fb="' + q.id + '"' + (prev ? '' : ' hidden') + '></div><div class="solution" hidden data-solbox="' + q.id + '"></div></article>';
    }).join('');
    // restore feedback for answered items
    pageItems.forEach(function (q) {
      var prev = attempted[q.id];
      if (!prev) return;
      var fb = document.querySelector('[data-fb="' + q.id + '"]');
      if (fb) { fb.className = 'feedback ' + (prev.correct ? 'ok' : 'no'); fb.innerHTML = (prev.correct ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + q.explain; }
      var sol = document.querySelector('[data-solbox="' + q.id + '"]');
      if (sol) sol.innerHTML = '<b>Worked solution.</b><ol>' + q.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>';
    });
    // hint buttons
    pageItems.forEach(function (q) {
      var hb = document.querySelector('[data-hint-btn="' + q.id + '"]');
      if (hb) hb.addEventListener('click', function () {
        var fb = document.querySelector('[data-fb="' + q.id + '"]');
        fb.hidden = false; fb.className = 'feedback'; fb.innerHTML = '<b>Hint.</b> ' + q.hint;
      });
    });
    // pager
    var pager = document.getElementById('bankPager');
    var nums = '';
    var lo = Math.max(0, stateUI.page - 2), hi = Math.min(pages - 1, stateUI.page + 2);
    if (lo > 0) nums += '<button class="page-btn" type="button" data-page="0">1</button>';
    if (lo > 1) nums += '<span class="faint">…</span>';
    for (var p = lo; p <= hi; p++) nums += '<button class="page-btn" type="button" data-page="' + p + '"' + (p === stateUI.page ? ' aria-current="page"' : '') + '>' + (p + 1) + '</button>';
    if (hi < pages - 2) nums += '<span class="faint">…</span>';
    if (hi < pages - 1) nums += '<button class="page-btn" type="button" data-page="' + (pages - 1) + '">' + pages + '</button>';
    pager.innerHTML = '<span class="small faint">Page ' + (stateUI.page + 1) + ' of ' + pages + '</span><span class="pages">' +
      '<button class="page-btn" type="button" data-page="' + Math.max(0, stateUI.page - 1) + '" aria-label="Previous page">←</button>' + nums +
      '<button class="page-btn" type="button" data-page="' + Math.min(pages - 1, stateUI.page + 1) + '" aria-label="Next page">→</button></span>';
    if (stateUI.highlight) {
      var h = document.getElementById(stateUI.highlight);
      if (h) setTimeout(function () { h.scrollIntoView({ block: 'center' }); h.style.outline = '2px solid var(--lime)'; setTimeout(function () { h.style.outline = ''; }, 1800); }, 80);
      stateUI.highlight = '';
    }
  }
  function answer(card) {
    var id = card.id;
    var q = root.Bank.get(stateUI.module).items.find(function (x) { return x.id === id; });
    if (!q) return;
    var st = root.state();
    if (st.bank.attempted[id]) return;
    var chosen = null;
    card.querySelectorAll('[data-choose]').forEach(function (b) {
      if (b.getAttribute('aria-pressed') === 'true') chosen = Number(b.getAttribute('data-choose'));
    });
    if (chosen === null) return;
    var ok = chosen === q.answer;
    st.bank.attempted[id] = { correct: ok, t: Date.now(), choice: chosen };
    root.save();
    card.querySelectorAll('[data-choose]').forEach(function (b, i) {
      b.disabled = true;
      if (i === q.answer) b.classList.add('is-correct');
      if (i === chosen && !ok) b.classList.add('is-wrong');
    });
    var fb = card.querySelector('[data-fb]');
    fb.hidden = false; fb.className = 'feedback ' + (ok ? 'ok' : 'no');
    fb.innerHTML = (ok ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + q.explain;
    var sol = card.querySelector('[data-solbox]');
    sol.innerHTML = '<b>Worked solution.</b><ol>' + q.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>';
    var solBtn = card.querySelector('[data-sol]');
    if (solBtn) solBtn.hidden = false;
    root.refresh();
  }
  function updateHash() {
    if (history.replaceState) history.replaceState(null, '', '#bank/m' + stateUI.module + '/' + encodeURIComponent(stateUI.band));
  }
  // choose option handler: set aria-pressed on click only; answering requires Check? We answer immediately on choose.
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#bankList [data-choose]');
    if (!b || b.disabled) return;
    var card = b.closest('.bank-item');
    card.querySelectorAll('[data-choose]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', 'true');
    answer(card);
  });
  UI.route = function (parts) {
    init();
    if (parts && parts.length) {
      var m = String(parts[0]).replace('m', '');
      if (/^[1-9]$/.test(m)) { stateUI.module = Number(m); }
      if (parts[1] && BANDS.some(function (b) { return b.key === parts[1]; })) stateUI.band = parts[1];
      if (parts[2]) stateUI.highlight = parts[2];
    }
    document.getElementById('bankModule').value = String(stateUI.module);
    if (stateUI.highlight) {
      var idx = filtered().findIndex(function (q) { return q.id === stateUI.highlight; });
      if (idx >= 0) stateUI.page = Math.floor(idx / stateUI.per);
    }
    render();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
