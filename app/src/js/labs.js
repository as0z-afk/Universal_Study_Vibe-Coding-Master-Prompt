/* ============================================================
   Interactive labs — shared helpers and labs 1–3
   ============================================================ */
(function () {
  'use strict';
  var root = window.ETE;
  var V = root.Viz;
  var L = root.Labs = root.Labs || {};
  L.types = L.types || {};

  function nf(v, d) {
    if (!isFinite(v)) return '—';
    var s = Number(v).toFixed(d === undefined ? 2 : d);
    return s.replace(/\.?0+$/, '') || '0';
  }
  function control(prefix, key, label, min, max, step, value, unit, hint) {
    var id = prefix + '-' + key;
    return '<div class="control"><label for="' + id + '">' + label +
      '<output data-for="' + key + '">' + nf(value, step < 0.1 ? 2 : step < 1 ? 1 : 0) + (unit || '') + '</output></label>' +
      '<div class="range-row"><input type="range" id="' + id + '" data-range="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">' +
      '<input type="number" data-num="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" aria-label="' + label.replace(/<[^>]*>/g, '') + ' numeric value">' +
      '</div>' + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  }
  function select(prefix, key, label, options, value, hint) {
    var id = prefix + '-' + key;
    return '<div class="control"><label for="' + id + '">' + label + '</label>' +
      '<select id="' + id + '" data-select="' + key + '">' + options.map(function (o) {
        return '<option value="' + o[0] + '"' + (String(o[0]) === String(value) ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>' + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  }
  function readout(key, label, accent) {
    return '<div class="readout' + (accent ? ' accent' : '') + '"><span class="ro-label">' + label + '</span><span class="ro-value" data-ro="' + key + '">—</span></div>';
  }
  function shell(host, o) {
    var prefix = 'lab' + o.id + '-' + o.type;
    host._prefix = prefix;
    host.innerHTML = '<div class="lab-head"><span class="lab-label">Interactive lab</span><h3>' + o.title + '</h3><p>' + o.blurb + '</p></div>' +
      '<div class="lab-body"><div class="lab-controls">' +
      (o.presets && o.presets.length ? '<div class="lab-presets" aria-label="Presets">' + o.presets.map(function (p, i) { return '<button type="button" data-preset="' + i + '">' + p.label + '</button>'; }).join('') + '</div>' : '') +
      o.controls +
      '<div class="lab-sub"><button class="btn btn-ghost btn-sm" type="button" data-lab-reset>Reset this lab</button></div>' +
      '</div><div class="lab-view"><canvas role="img" aria-label="' + o.aria + '"></canvas><div class="lab-readouts">' + o.readouts + '</div><div data-lab-warning></div></div></div>' +
      '<div class="lab-model"><b>Model card.</b> ' + o.model + '</div>';
    var canvas = host.querySelector('canvas');
    if (!canvas.getContext || !canvas.getContext('2d')) {
      host.querySelector('.lab-view').innerHTML = '<div class="live-note">This browser cannot draw the lab canvas. The model card and every lesson explanation remain available.</div>';
      return null;
    }
    return { prefix: prefix, canvas: canvas };
  }
  function val(host, key) {
    var r = host.querySelector('[data-range="' + key + '"]') || host.querySelector('[data-num="' + key + '"]');
    return r ? Number(r.value) : 0;
  }
  function sel(host, key) {
    var s = host.querySelector('[data-select="' + key + '"]');
    return s ? s.value : '';
  }
  function setOut(host, key, text) {
    var out = host.querySelector('output[data-for="' + key + '"]');
    if (out) out.textContent = text;
  }
  function ro(host, key, text, cls) {
    var el = host.querySelector('[data-ro="' + key + '"]');
    if (!el) return;
    el.textContent = text;
    if (cls !== undefined) el.parentNode.className = 'readout' + (cls ? ' ' + cls : '');
  }
  function warn(host, message, kind) {
    var box = host.querySelector('[data-lab-warning]');
    if (!box) return;
    box.innerHTML = message ? '<div class="' + (kind || 'lab-warning') + '">' + message + '</div>' : '';
  }
  function bind(host, update, onRun) {
    var touched = false;
    function user() { if (!touched) { touched = true; if (onRun) onRun(); } update(); }
    host.querySelectorAll('[data-range]').forEach(function (r) {
      r.addEventListener('input', function () {
        var n = host.querySelector('[data-num="' + r.getAttribute('data-range') + '"]');
        if (n) n.value = r.value;
        user();
      });
    });
    host.querySelectorAll('[data-num]').forEach(function (n) {
      n.addEventListener('change', function () {
        var k = n.getAttribute('data-num');
        var r = host.querySelector('[data-range="' + k + '"]');
        var lo = Number(n.min), hi = Number(n.max);
        var v = Math.min(hi, Math.max(lo, Number(n.value) || lo));
        n.value = v;
        if (r) r.value = v;
        user();
      });
    });
    host.querySelectorAll('[data-select]').forEach(function (s) { s.addEventListener('change', user); });
    host.querySelectorAll('[data-lab-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        host.querySelectorAll('[data-range]').forEach(function (r) {
          r.value = r.defaultValue;
          var n = host.querySelector('[data-num="' + r.getAttribute('data-range') + '"]');
          if (n) n.value = r.defaultValue;
        });
        host.querySelectorAll('[data-num]').forEach(function (n) { if (!host.querySelector('[data-range="' + n.getAttribute('data-num') + '"]')) n.value = n.defaultValue; });
        host.querySelectorAll('[data-select]').forEach(function (s) { s.value = s.options[0].value; });
        user();
        root.toast('Lab reset to its baseline');
      });
    });
    return { user: user, setTouched: function () { touched = true; } };
  }
  function preset(host, list, apply) {
    host.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = list[Number(b.getAttribute('data-preset'))];
        if (!p || !p.values) return;
        Object.keys(p.values).forEach(function (k) {
          var v = p.values[k];
          var r = host.querySelector('[data-range="' + k + '"]');
          var n = host.querySelector('[data-num="' + k + '"]');
          var s = host.querySelector('[data-select="' + k + '"]');
          if (r) { r.value = v; if (n) n.value = v; }
          else if (n) n.value = v;
          else if (s) s.value = v;
        });
        var first = host.querySelector('[data-range]');
        if (first) first.dispatchEvent(new Event('input', { bubbles: true }));
        else apply();
        root.toast(p.label + ' preset loaded');
      });
    });
  }
  function outAll(host, defs) {
    defs.forEach(function (d) { setOut(host, d[0], nf(val(host, d[0]), d[1]) + (d[2] || '')); });
  }
  function canvasPlot(host) {
    return V.prep(host.querySelector('canvas'));
  }
  L._ui = { control: control, select: select, readout: readout, shell: shell, val: val, sel: sel, setOut: setOut, ro: ro, warn: warn, bind: bind, preset: preset, outAll: outAll, nf: nf, canvasPlot: canvasPlot };

  /* ================= LAB 1 — Signal Studio ================= */
  L.types.signal = function (host, id, onRun) {
    var prefix = 'lab' + id + '-signal';
    var ui = shell(host, {
      type: 'signal', id: id,
      title: 'Signal Studio',
      blurb: 'Choose a waveform and change its parameters. The plot shows the signal, its even part and its odd part, with measured values underneath.',
      aria: 'Interactive plot of a chosen signal and its even and odd components.',
      controls:
        select(prefix, 'wave', 'Waveform', [['sine', 'Sinusoid'], ['damped', 'Damped sinusoid'], ['step', 'Unit step'], ['pulse', 'Rectangular pulse']], 'sine') +
        control(prefix, 'A', 'Amplitude A', 0.2, 3, 0.05, 1, '', 'Peak value in the chosen units.') +
        control(prefix, 'f', 'Frequency f', 0.2, 4, 0.05, 1, ' Hz') +
        control(prefix, 'ph', 'Phase φ', -180, 180, 5, 0, '°') +
        control(prefix, 'a', 'Damping a', 0, 3, 0.05, 0.8, ' s⁻¹', 'Used by the damped sinusoid only.') +
        control(prefix, 'T', 'Window T', 1, 6, 0.5, 4, ' s'),
      readouts: readout('period', 'Period') + readout('rms', 'RMS') + readout('energy', 'Energy in window') + readout('sym', 'Symmetry'),
      model: 'x(t) = A sin(2πft + φ), A e<sup>−at</sup> sin(2πft + φ)u(t), A u(t) or a rectangular pulse, evaluated on a symmetric window. Energy is the numerical integral of x² over the displayed window only; it is not the total energy of a signal that continues beyond it.',
      presets: [{ label: 'Pure tone' }, { label: 'Damped ring' }, { label: 'Step' }]
    });
    if (!ui) return;
    function wave(x) {
      var A = val(host, 'A'), f = val(host, 'f'), ph = val(host, 'ph') * Math.PI / 180, a = val(host, 'a'), T = val(host, 'T');
      var type = sel(host, 'wave');
      if (type === 'sine') return A * Math.sin(2 * Math.PI * f * x + ph);
      if (type === 'damped') return x >= 0 ? A * Math.exp(-a * x) * Math.sin(2 * Math.PI * f * x + ph) : 0;
      if (type === 'step') return x >= 0 ? A : 0;
      return Math.abs(x) < T / 8 ? A : 0;
    }
    function update() {
      outAll(host, [['A', 2], ['f', 2, ' Hz'], ['ph', 0, '°'], ['a', 2, ' s⁻¹'], ['T', 1, ' s']]);
      var T = val(host, 'T'), f = val(host, 'f'), A = val(host, 'A');
      var N = 401, xs = [], x = [], even = [], odd = [], seen = { even: 0, odd: 0 };
      for (var i = 0; i < N; i++) {
        var t = -T / 2 + T * i / (N - 1);
        xs.push(t); x.push(wave(t));
      }
      for (i = 0; i < N; i++) {
        var rev = x[N - 1 - i];
        even.push((x[i] + rev) / 2); odd.push((x[i] - rev) / 2);
        seen.even = Math.max(seen.even, Math.abs(even[i])); seen.odd = Math.max(seen.odd, Math.abs(odd[i]));
      }
      var rms = 0, energy = 0;
      for (i = 0; i < N; i++) { rms += x[i] * x[i]; energy += x[i] * x[i]; }
      var dt = T / (N - 1); energy *= dt; rms = Math.sqrt(rms / N);
      var total = seen.even + seen.odd;
      var sym = total < 1e-9 ? 'zero signal' : (seen.odd < 1e-3 * total ? 'even' : seen.even < 1e-3 * total ? 'odd' : 'neither');
      ro(host, 'period', nf(1 / f, 3) + ' s');
      ro(host, 'rms', nf(rms, 3) + ' units');
      ro(host, 'energy', nf(energy, 3) + ' units²·s');
      ro(host, 'sym', sym);
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var b = V.box(w, h, { mt: 26, mb: 42, ml: 44, mr: 14 });
      var ymax = Math.max(0.4, A * 1.25, seen.even * 1.15, seen.odd * 1.15);
      V.axes(ctx, b, -T / 2, T / 2, -ymax, ymax, { xlabel: 'time t (s)', ylabel: 'amplitude', xTicks: 6, yTicks: 4 });
      V.curve(ctx, b, xs, x, -T / 2, T / 2, -ymax, ymax, P.faint, 1.3, [4, 4]);
      V.curve(ctx, b, xs, even, -T / 2, T / 2, -ymax, ymax, P.lime, 2);
      V.curve(ctx, b, xs, odd, -T / 2, T / 2, -ymax, ymax, P.amber, 2);
      V.tag(ctx, b.x + 6, b.y + 12, 'x(t)', P.faint);
      V.tag(ctx, b.x + 54, b.y + 12, 'even', P.lime);
      V.tag(ctx, b.x + 112, b.y + 12, 'odd', P.amber);
      V.title(ctx, 'T = ' + nf(T, 1) + ' s · f = ' + nf(f, 2) + ' Hz · ' + sym, b.x, 6, P.ink);
    }
    bind(host, update, onRun);
    preset(host, [{ label: 'Pure tone', values: { wave: 'sine', A: 1, f: 1, ph: 0, a: 0.8, T: 4 } }, { label: 'Damped ring', values: { wave: 'damped', A: 1.6, f: 1.4, ph: 0, a: 0.7, T: 4 } }, { label: 'Step', values: { wave: 'step', A: 1.2, f: 1, ph: 0, a: 0.8, T: 4 } }], update);
    update();
  };

  /* ================= LAB 2 — Convolution Bench ================= */
  L.types.convolution = function (host, id, onRun) {
    var prefix = 'lab' + id + '-conv';
    var ui = shell(host, {
      type: 'convolution', id: id,
      title: 'Convolution Bench',
      blurb: 'Choose the shapes of the input and the impulse response. The output is computed by numerical convolution over the same grid that is plotted.',
      aria: 'Interactive convolution of two chosen pulses or exponential signals with input, impulse response and output plots.',
      controls:
        select(prefix, 'xt', 'Input type', [['rect', 'Rectangular pulse'], ['exp', 'Decaying exponential']], 'rect') +
        control(prefix, 'xw', 'Input width / decay', 0.2, 3, 0.05, 2, '', 'Width in seconds for a pulse; decay rate for an exponential.') +
        select(prefix, 'ht', 'Impulse-response type', [['rect', 'Rectangular pulse'], ['exp', 'Decaying exponential']], 'rect') +
        control(prefix, 'hw', 'Impulse width / decay', 0.2, 3, 0.05, 1.5, '', 'Width in seconds for a pulse; decay rate for an exponential.') +
        control(prefix, 'A', 'Input amplitude', 0.2, 2, 0.05, 1, ''),
      readouts: readout('peak', 'Peak y(t)') + readout('area', 'Area (DC gain)') + readout('length', 'Support length') + readout('energy', 'Output energy'),
      model: 'y(t) = ∫ x(τ)h(t−τ)dτ, evaluated by the midpoint rule on a 0.01 s grid. Both signals are causal. For rectangular pulses the support length is the sum of the two widths; for exponentials it is infinite in principle and is shown over the plotted window.',
      presets: [{ label: 'Overlap' }, { label: 'Smooth' }, { label: 'Fast decay' }]
    });
    if (!ui) return;
    function xf(t) {
      var w = val(host, 'xw');
      if (sel(host, 'xt') === 'rect') return t >= 0 && t <= w ? val(host, 'A') : 0;
      return t >= 0 ? val(host, 'A') * Math.exp(-w * t) : 0;
    }
    function hf(t) {
      var w = val(host, 'hw');
      if (sel(host, 'ht') === 'rect') return t >= 0 && t <= w ? 1 : 0;
      return t >= 0 ? Math.exp(-w * t) : 0;
    }
    function update() {
      outAll(host, [['xw', 2], ['hw', 2], ['A', 2]]);
      var dt = 0.01, tmin = -0.5, tmax = 6.5, N = Math.round((tmax - tmin) / dt) + 1;
      var y = [], tarr = [], peak = 0, energy = 0;
      for (var k = 0; k < N; k++) {
        var t = tmin + k * dt, sum = 0;
        for (var j = 0; j <= k; j++) {
          var tau = tmin + j * dt;
          if (tau < -0.01) continue;
          sum += xf(tau) * hf(t - tau) * dt;
        }
        y.push(sum); tarr.push(t); peak = Math.max(peak, sum);
      }
      for (k = 0; k < N; k++) energy += y[k] * y[k] * dt;
      var areaX = 0, areaH = 0;
      for (var i = 0; i < 400; i++) { var tt = i * 0.01; areaX += xf(tt) * 0.01; areaH += hf(tt) * 0.01; }
      var w1 = val(host, 'xw'), w2 = val(host, 'hw');
      var length = (sel(host, 'xt') === 'rect' && sel(host, 'ht') === 'rect') ? (w1 + w2) : 'unbounded';
      ro(host, 'peak', nf(peak, 3));
      ro(host, 'area', nf(areaX * areaH, 3));
      ro(host, 'length', typeof length === 'number' ? nf(length, 2) + ' s' : 'unbounded (shown 7 s)');
      ro(host, 'energy', nf(energy, 3));
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var b1 = V.box(w, h, { mt: 24, mb: 22, ml: 42, mr: 12 }); b1.h = Math.round(h * 0.34);
      var b2 = { x: b1.x, y: b1.y + b1.h + 64, w: b1.w, h: Math.max(70, h - (b1.y + b1.h + 64) - 30) };
      var xmax = tmax;
      var xs = [], xv = [], hv = [];
      for (i = 0; i <= 700; i++) { var t2 = tmin + (tmax - tmin) * i / 700; xs.push(t2); xv.push(xf(t2)); hv.push(hf(t2)); }
      V.axes(ctx, b1, tmin, xmax, 0, 2.1, { xlabel: '', ylabel: 'x, h', xTicks: 6, yTicks: 2 });
      V.axes(ctx, b2, tmin, xmax, 0, Math.max(0.6, peak * 1.18), { xlabel: 'time t (s)', ylabel: 'y(t)', xTicks: 6, yTicks: 3 });
      V.curve(ctx, b1, xs, xv, tmin, xmax, 0, 2.1, P.teal, 2);
      V.curve(ctx, b1, xs, hv, tmin, xmax, 0, 2.1, P.violet, 2);
      V.tag(ctx, b1.x + 6, b1.y + 10, 'x(τ)', P.teal);
      V.tag(ctx, b1.x + 60, b1.y + 10, 'h(τ)', P.violet);
      V.curve(ctx, b2, tarr, y, tmin, xmax, 0, Math.max(0.6, peak * 1.18), P.lime, 2.2);
      V.tag(ctx, b2.x + 6, b2.y + 10, 'y(t) = x * h', P.lime);
      V.title(ctx, 'output peak ' + nf(peak, 2) + ' · area ' + nf(areaX * areaH, 2), b1.x, 5, P.ink);
    }
    bind(host, update, onRun);
    preset(host, [{ label: 'Overlap', values: { xt: 'rect', xw: 2, ht: 'rect', hw: 1.5, A: 1 } }, { label: 'Smooth', values: { xt: 'rect', xw: 1.5, ht: 'exp', hw: 0.8, A: 1 } }, { label: 'Fast decay', values: { xt: 'exp', xw: 2.5, ht: 'exp', hw: 0.5, A: 1 } }], update);
    update();
  };

  /* ================= LAB 3 — Wave Bench ================= */
  L.types.wave = function (host, id, onRun) {
    var prefix = 'lab' + id + '-wave';
    var ui = shell(host, {
      type: 'wave', id: id,
      title: 'Wave Bench',
      blurb: 'Change the frequency, distance, loss and noise. The plot separates the transmitted wave from the received wave so attenuation and noise are visible together.',
      aria: 'Interactive travelling wave with attenuation, distance, frequency and noise controls, showing transmitted and received waveforms.',
      controls:
        control(prefix, 'f', 'Frequency f', 0.1, 1.5, 0.05, 0.5, ' MHz') +
        control(prefix, 'A', 'Transmit amplitude', 0.2, 2, 0.05, 1, '') +
        control(prefix, 'd', 'Link distance d', 0.5, 6, 0.1, 3, ' km') +
        control(prefix, 'alpha', 'Loss α', 0, 2, 0.05, 0.6, ' dB/km') +
        control(prefix, 'noise', 'Noise amplitude', 0, 0.3, 0.01, 0.03, ''),
      readouts: readout('lambda', 'Wavelength') + readout('period', 'Period') + readout('loss', 'Total loss') + readout('rx', 'Received amplitude') + readout('snr', 'Approx. SNR'),
      model: 'λ = v/f with v = c = 3.00 × 10⁸ m/s. Voltage loss over distance d is 10<sup>−αd/20</sup>; the dB loss is αd. Noise is a deterministic teaching disturbance, not a statistical noise model, so the SNR readout is an approximate peak-amplitude ratio, not an information-theoretic capacity.',
      presets: [{ label: 'Short link' }, { label: 'Long noisy link' }, { label: 'Low frequency' }]
    });
    if (!ui) return;
    var phase = 0, raf = 0, playing = false;
    function fields() {
      var f = val(host, 'f') * 1e6, A = val(host, 'A'), d = val(host, 'd'), alpha = val(host, 'alpha');
      var lambda = 299792458 / f / 1000; // km
      var loss = alpha * d;
      var rx = A * Math.pow(10, -loss / 20);
      return { f: f, A: A, d: d, alpha: alpha, lambda: lambda, loss: loss, rx: rx, noise: val(host, 'noise') };
    }
    function draw() {
      var F = fields();
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var b = V.box(w, h, { mt: 26, mb: 44, ml: 44, mr: 14 });
      var dmax = 6;
      var ymax = Math.max(F.A * 1.2, 1);
      V.axes(ctx, b, 0, dmax, -ymax, ymax, { xlabel: 'distance (km)', ylabel: 'field', xTicks: 6, yTicks: 4 });
      var xs = [], tx = [], rx = [], env = [], env2 = [];
      for (var i = 0; i <= 700; i++) {
        var x = dmax * i / 700;
        var a = F.A * Math.pow(10, -F.alpha * x / 20);
        var ph = 2 * Math.PI * (x / F.lambda) - phase;
        xs.push(x);
        tx.push(F.A * Math.cos(ph));
        rx.push(a * Math.cos(ph) + F.noise * Math.sin(83 * x + phase * 3) * Math.exp(-Math.abs(x - F.d)));
        env.push(a); env2.push(-a);
      }
      V.curve(ctx, b, xs, tx, 0, dmax, -ymax, ymax, P.faint, 1, [3, 3]);
      V.curve(ctx, b, xs, env, 0, dmax, -ymax, ymax, P.teal, 1.1, [4, 4]);
      V.curve(ctx, b, xs, env2, 0, dmax, -ymax, ymax, P.teal, 1.1, [4, 4]);
      V.curve(ctx, b, xs, rx, 0, dmax, -ymax, ymax, P.lime, 1.8);
      var px = V.mapX(b, 0, dmax, F.d);
      V.line(ctx, px, b.y, px, b.y + b.h, P.rose, 1.4, [4, 3]);
      V.tag(ctx, b.x + 6, b.y + 10, 'transmitted', P.faint);
      V.tag(ctx, b.x + 100, b.y + 10, 'received', P.lime);
      V.title(ctx, 'd = ' + nf(F.d, 1) + ' km · loss ' + nf(F.loss, 1) + ' dB · λ = ' + nf(F.lambda, 2) + ' km', b.x, 5, P.ink);
    }
    function metrics() {
      var F = fields();
      outAll(host, [['f', 2, ' MHz'], ['A', 2], ['d', 1, ' km'], ['alpha', 2, ' dB/km'], ['noise', 2]]);
      ro(host, 'lambda', nf(F.lambda, 3) + ' km');
      ro(host, 'period', nf(1e6 / (val(host, 'f') * 1e6), 2) + ' µs');
      ro(host, 'loss', nf(F.loss, 2) + ' dB');
      ro(host, 'rx', nf(F.rx * 100, 1) + '% of transmit');
      ro(host, 'snr', F.noise <= 0.0001 ? '∞ (no noise)' : nf(20 * Math.log10(F.rx / F.noise), 1) + ' dB');
      if (F.loss > 12) warn(host, 'The received amplitude is below 25% of the transmitted amplitude. A real link would need an amplifier or a shorter path.', 'lab-warning');
      else warn(host, '');
    }
    function update() { metrics(); draw(); }
    var bnd = bind(host, update, onRun);
    preset(host, [{ label: 'Short link', values: { f: 0.5, A: 1, d: 1, alpha: 0.2, noise: 0.01 } }, { label: 'Long noisy link', values: { f: 0.5, A: 1, d: 6, alpha: 1.2, noise: 0.12 } }, { label: 'Low frequency', values: { f: 0.15, A: 1, d: 3, alpha: 0.6, noise: 0.03 } }], update);
    // local Play/Pause for the travelling wave
    var playBtn = document.createElement('button');
    playBtn.className = 'btn btn-ghost btn-sm';
    playBtn.type = 'button';
    playBtn.textContent = 'Animate wave';
    playBtn.style.marginTop = '10px';
    host.querySelector('.lab-controls').appendChild(playBtn);
    playBtn.addEventListener('click', function () {
      playing = !playing;
      playBtn.textContent = playing ? 'Pause wave' : 'Animate wave';
      bnd.setTouched(); if (onRun) onRun();
      if (playing) {
        if (root.motionReduced()) { phase += 0.6; draw(); playing = false; playBtn.textContent = 'Animate wave'; return; }
        var last = 0;
        function loop(ts) {
          if (!playing) return;
          if (!last) last = ts;
          phase += Math.min(60, ts - last) * 0.004;
          last = ts;
          draw();
          raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);
      } else cancelAnimationFrame(raf);
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { playing = false; playBtn.textContent = 'Animate wave'; } });
    update();
  };
})();
