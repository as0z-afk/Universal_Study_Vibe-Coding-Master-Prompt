/* ============================================================
   Interactive labs 7–9: z-plane difference equations, sampling,
   and state-space trajectories.
   ============================================================ */
(function () {
  'use strict';
  var root = window.ETE;
  var V = root.Viz;
  var L = root.Labs;
  var U = L._ui;
  var control = U.control, select = U.select, readout = U.readout, shell = U.shell;
  var val = U.val, sel = U.sel, ro = U.ro, warn = U.warn, bind = U.bind, preset = U.preset, nf = U.nf, canvasPlot = U.canvasPlot, outAll = U.outAll;

  /* ================= LAB 7 — Difference Equation Studio ================= */
  L.types.z = function (host, id, onRun) {
    var prefix = 'lab' + id + '-z';
    var ui = shell(host, {
      type: 'z', id: id,
      title: 'Difference Equation Studio',
      blurb: 'Change the feedback and feedforward coefficients. The poles move in the z-plane and the impulse response is simulated from the difference equation itself.',
      aria: 'Interactive z-plane pole plot and simulated impulse and frequency responses of a second-order difference equation.',
      controls:
        control(prefix, 'a1', 'Feedback a₁', -1.9, 1.9, 0.05, 0.9, '') +
        control(prefix, 'a2', 'Feedback a₂', -1.2, 1.2, 0.05, -0.4, '') +
        control(prefix, 'b0', 'Feedforward b₀', -2, 2, 0.05, 1, '') +
        control(prefix, 'b1', 'Feedforward b₁', -1, 1, 0.05, 0.4, ''),
      readouts: readout('poles', 'Poles') + readout('stability', 'Stability') + readout('dc', 'DC gain') + readout('peak', 'Peak |H|') + readout('len', 'Response'),
      model: 'y[n] = b₀x[n] + b₁x[n−1] + a₁y[n−1] + a₂y[n−2]. The denominator z² − a₁z − a₂ gives the poles. A causal system is stable only if both poles lie strictly inside the unit circle. The simulation runs 40 samples; the frequency response is evaluated on the unit circle.',
      presets: [{ label: 'Stable ring' }, { label: 'Fast decay' }, { label: 'Marginal' }, { label: 'Unstable' }]
    });
    if (!ui) return;
    function poles(a1, a2) {
      var disc = a1 * a1 + 4 * a2;
      if (disc >= 0) { var r = Math.sqrt(disc); return [[(a1 + r) / 2, 0], [(a1 - r) / 2, 0]]; }
      var im = Math.sqrt(-disc) / 2;
      return [[a1 / 2, im], [a1 / 2, -im]];
    }
    function update() {
      var a1 = val(host, 'a1'), a2 = val(host, 'a2'), b0 = val(host, 'b0'), b1 = val(host, 'b1');
      outAll(host, [['a1', 2], ['a2', 2], ['b0', 2], ['b1', 2]]);
      var ps = poles(a1, a2);
      var stable = ps.every(function (p) { return Math.sqrt(p[0] * p[0] + p[1] * p[1]) < 1 - 1e-9; });
      var maxr = Math.max.apply(null, ps.map(function (p) { return Math.sqrt(p[0] * p[0] + p[1] * p[1]); }));
      var denom = 1 - a1 - a2;
      var dc = Math.abs(denom) < 1e-9 ? Infinity : (b0 + b1) / denom;
      // impulse response
      var h = [], N = 40;
      for (var n = 0; n < N; n++) {
        var x0 = n === 0 ? 1 : 0, x1 = n === 1 ? 1 : 0;
        var y = b0 * x0 + b1 * x1;
        if (n >= 1) y += a1 * h[n - 1];
        if (n >= 2) y += a2 * h[n - 2];
        if (!isFinite(y)) y = 0;
        h.push(y);
      }
      var peakH = 0;
      for (n = 0; n <= 200; n++) {
        var w = Math.PI * n / 200;
        var numRe = b0 + b1 * Math.cos(w), numIm = -b1 * Math.sin(w);
        var denRe = 1 - a1 * Math.cos(w) - a2 * Math.cos(2 * w);
        var denIm = a1 * Math.sin(w) + a2 * Math.sin(2 * w);
        var num = Math.sqrt(numRe * numRe + numIm * numIm);
        var den = Math.sqrt(denRe * denRe + denIm * denIm);
        peakH = Math.max(peakH, den < 1e-9 ? Infinity : num / den);
      }
      ro(host, 'poles', ps.map(function (p) { return p[1] ? nf(p[0], 2) + ' ± j' + nf(Math.abs(p[1]), 2) : nf(p[0], 2); }).join(' , '));
      ro(host, 'stability', stable ? 'stable (|p| < 1)' : maxr > 1 + 1e-9 ? 'unstable (|p| > 1)' : 'marginal');
      ro(host, 'dc', isFinite(dc) ? nf(dc, 3) : 'pole at z = 1');
      ro(host, 'peak', isFinite(peakH) ? nf(peakH, 3) : '∞');
      ro(host, 'len', stable ? 'decays inside 40 samples' : 'does not settle');
      if (!stable) warn(host, 'This choice places a pole on or outside the unit circle. The simulated response is plotted only over 40 samples; a real causal system would not settle.', maxr > 1 ? 'lab-warning' : 'lab-warning');
      else warn(host, '', 'lab-ok');
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, hgt = c.h, P = V.palette();
      var lw = Math.round(w * 0.40) - 12;
      var b1p = { x: 30, y: 22, w: Math.max(70, lw - 30), h: hgt - 60 };
      var b2p = { x: lw + 46, y: 22, w: Math.max(80, w - lw - 58), h: Math.round((hgt - 60) * 0.52) };
      var b3p = { x: b2p.x, y: b2p.y + b2p.h + 38, w: b2p.w, h: Math.max(45, hgt - (b2p.y + b2p.h + 38) - 28) };
      var R = Math.max(1.6, maxr + 0.5);
      V.axes(ctx, b1p, -R, R, -R, R, { xlabel: 'Re z', ylabel: 'Im z', xTicks: 4, yTicks: 4 });
      var cx = V.mapX(b1p, -R, R, 0), cy = V.mapY(b1p, -R, R, 0);
      var rr = (b1p.w / (2 * R));
      ctx.save(); ctx.strokeStyle = P.teal; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      V.line(ctx, b1p.x, cy, b1p.x + b1p.w, cy, P.grid, 1);
      V.line(ctx, cx, b1p.y, cx, b1p.y + b1p.h, P.grid, 1);
      ps.forEach(function (p) { V.dot(ctx, V.mapX(b1p, -R, R, p[0]), V.mapY(b1p, -R, R, p[1]), stable ? P.lime : P.rose, 5); });
      V.tag(ctx, b1p.x + 4, b1p.y + 9, 'unit circle', P.teal);
      V.title(ctx, stable ? 'stable' : 'not stable', b1p.x, 3, P.ink);
      // h[n] stems
      var ymax = Math.max(0.2, Math.max.apply(null, h.map(Math.abs)) * 1.15);
      V.axes(ctx, b2p, 0, N - 1, -ymax, ymax, { xlabel: '', ylabel: 'h[n]', xTicks: 5, yTicks: 3 });
      for (n = 0; n < N; n++) {
        var x = V.mapX(b2p, 0, N - 1, n), y0 = V.mapY(b2p, -ymax, ymax, 0), y1 = V.mapY(b2p, -ymax, ymax, h[n]);
        ctx.strokeStyle = P.lime; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
        V.dot(ctx, x, y1, P.lime, 2);
      }
      V.tag(ctx, b2p.x + 4, b2p.y + 9, 'impulse response', P.lime);
      // magnitude response
      V.axes(ctx, b3p, 0, 1, 0, Math.max(1, Math.min(6, peakH * 1.1)), { xlabel: 'normalised frequency ω/π', ylabel: '|H|', xTicks: 4, yTicks: 2 });
      var wx = [], wy = [];
      for (n = 0; n <= 300; n++) {
        var ww = Math.PI * n / 300;
        var nr = b0 + b1 * Math.cos(ww), ni = -b1 * Math.sin(ww);
        var dr = 1 - a1 * Math.cos(ww) - a2 * Math.cos(2 * ww), di = a1 * Math.sin(ww) + a2 * Math.sin(2 * ww);
        wx.push(n / 300); wy.push(Math.min(6, Math.sqrt(nr * nr + ni * ni) / Math.max(1e-6, Math.sqrt(dr * dr + di * di))));
      }
      V.curve(ctx, b3p, wx, wy, 0, 1, 0, Math.max(1, Math.min(6, peakH * 1.1)), P.teal, 1.8);
      V.tag(ctx, b3p.x + 4, b3p.y + 9, '|H(e^{jω})|', P.teal);
    }
    bind(host, update, onRun);
    preset(host, [{ label: 'Stable ring', values: { a1: 0.9, a2: -0.4, b0: 1, b1: 0.4 } }, { label: 'Fast decay', values: { a1: 0.3, a2: 0.05, b0: 1, b1: 0 } }, { label: 'Marginal', values: { a1: 1, a2: 0, b0: 1, b1: 0 } }, { label: 'Unstable', values: { a1: 1.4, a2: 0.1, b0: 1, b1: 0 } }], update);
    update();
  };

  /* ================= LAB 8 — Sampling and capacity ================= */
  L.types.sampling = function (host, id, onRun) {
    var prefix = 'lab' + id + '-sampling';
    var ui = shell(host, {
      type: 'sampling', id: id,
      title: 'Sampling and Capacity Lab',
      blurb: 'Lower the sampling rate below twice the signal frequency and watch the alias appear. Separately, the channel controls compute the Nyquist and Shannon limits from the same numbers.',
      aria: 'Interactive sampling plot showing a sine wave, its samples, and the alias that appears below the Nyquist rate, with capacity readouts.',
      controls:
        control(prefix, 'f', 'Signal frequency f', 1, 20, 0.5, 7, ' Hz') +
        control(prefix, 'fs', 'Sampling rate f_s', 5, 50, 1, 20, ' Hz') +
        select(prefix, 'L', 'Signal levels', [['2', '2 (1 bit)'], ['4', '4 (2 bits)'], ['8', '8 (3 bits)'], ['16', '16 (4 bits)'], ['32', '32 (5 bits)'], ['64', '64 (6 bits)']], '8') +
        control(prefix, 'B', 'Channel bandwidth B', 0.5, 10, 0.5, 3, ' kHz') +
        control(prefix, 'snr', 'SNR', 0, 60, 1, 30, ' dB'),
      readouts: readout('nyq', 'Nyquist rate') + readout('alias', 'Alias frequency') + readout('bits', 'Bits / level') + readout('pcm', 'PCM bit rate') + readout('shannon', 'Shannon capacity') + readout('nq', 'Nyquist capacity'),
      model: 'Sampling theorem: f_s ≥ 2f_m. When f_s < 2f_m the alias appears at |f − kf_s| with k = round(f/f_s). PCM bit rate = f_s × log₂L bits/s. Nyquist capacity for a noiseless B-band channel is 2B log₂L; Shannon capacity is B log₂(1+SNR). The two capacities are separate limits and are not added.',
      presets: [{ label: 'Clean audio' }, { label: 'Aliased' }, { label: 'Narrow channel' }, { label: 'Noisy channel' }]
    });
    if (!ui) return;
    function update() {
      var f = val(host, 'f'), fs = val(host, 'fs'), Lv = Number(sel(host, 'L')), B = val(host, 'B'), snr = val(host, 'snr');
      outAll(host, [['f', 1, ' Hz'], ['fs', 0, ' Hz'], ['B', 1, ' kHz'], ['snr', 0, ' dB']]);
      var nyq = 2 * f;
      var aliased = fs < nyq;
      var alias = Math.abs(f - Math.round(f / fs) * fs);
      var bits = Math.log2(Lv);
      var pcm = fs * bits;
      var nq = 2 * B * 1000 * bits / 1000; // kbps
      var sh = B * Math.log2(1 + Math.pow(10, snr / 10)) / 1; // kbps, B in kHz
      var qsnr = 6.02 * bits + 1.76;
      ro(host, 'nyq', nf(nyq, 1) + ' Hz');
      ro(host, 'alias', aliased ? nf(alias, 1) + ' Hz (folded)' : 'none — above Nyquist');
      ro(host, 'bits', nf(bits, 0) + ' bit' + (bits === 1 ? '' : 's') + ' (' + nf(qsnr, 1) + ' dB qSNR)');
      ro(host, 'pcm', nf(pcm, 0) + ' bit/s');
      ro(host, 'shannon', nf(sh, 1) + ' kbit/s');
      ro(host, 'nq', nf(nq, 1) + ' kbit/s');
      if (aliased) warn(host, '<b>Aliasing:</b> f_s = ' + nf(fs, 1) + ' Hz is below the Nyquist rate ' + nf(nyq, 1) + ' Hz. The ' + nf(f, 1) + ' Hz tone is reconstructed at ' + nf(alias, 1) + ' Hz. Once folded, no reconstruction filter can recover the original frequency.', 'lab-warning');
      else warn(host, 'Sampling is above the Nyquist rate, so an ideal reconstruction filter can recover the original tone.', 'lab-ok');
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var b = V.box(w, h, { mt: 26, mb: 44, ml: 44, mr: 14 });
      V.axes(ctx, b, 0, 1, -1.25, 1.25, { xlabel: 'time (s)', ylabel: 'x(t)', xTicks: 6, yTicks: 4 });
      var xs = [], orig = [], rec = [];
      for (var i = 0; i <= 800; i++) {
        var t = i / 800;
        xs.push(t);
        orig.push(Math.cos(2 * Math.PI * f * t));
        rec.push(Math.cos(2 * Math.PI * (aliased ? alias : f) * t));
      }
      V.curve(ctx, b, xs, orig, 0, 1, -1.25, 1.25, P.faint, 1.4, [5, 4]);
      V.curve(ctx, b, xs, rec, 0, 1, -1.25, 1.25, aliased ? P.rose : P.lime, 2.2);
      var nMax = Math.floor(fs);
      for (var n = 0; n <= nMax; n++) {
        var tn = n / fs;
        var yv = Math.cos(2 * Math.PI * f * tn);
        var px = V.mapX(b, 0, 1, tn), py = V.mapY(b, -1.25, 1.25, yv);
        V.line(ctx, px, V.mapY(b, -1.25, 1.25, 0), px, py, P.teal, 1.3);
        V.dot(ctx, px, py, P.teal, 3.2);
      }
      V.tag(ctx, b.x + 6, b.y + 10, 'original', P.faint);
      V.tag(ctx, b.x + 72, b.y + 10, aliased ? 'alias' : 'reconstruction', aliased ? P.rose : P.lime);
      V.tag(ctx, b.x + 190, b.y + 10, 'samples', P.teal);
      V.title(ctx, 'f = ' + nf(f, 1) + ' Hz · f_s = ' + nf(fs, 0) + ' Hz · Nyquist ' + nf(nyq, 1) + ' Hz', b.x, 6, P.ink);
    }
    bind(host, update, onRun);
    preset(host, [{ label: 'Clean audio', values: { f: 7, fs: 24, L: 8, B: 4, snr: 40 } }, { label: 'Aliased', values: { f: 12, fs: 16, L: 8, B: 3, snr: 30 } }, { label: 'Narrow channel', values: { f: 5, fs: 16, L: 16, B: 1, snr: 30 } }, { label: 'Noisy channel', values: { f: 6, fs: 20, L: 4, B: 3, snr: 8 } }], update);
    update();
  };

  /* ================= LAB 9 — State-Space Lab ================= */
  L.types.state = function (host, id, onRun) {
    var prefix = 'lab' + id + '-state';
    var cells = [['a11', 'a₁₁', -2], ['a12', 'a₁₂', 2], ['a21', 'a₂₁', -2], ['a22', 'a₂₂', -1], ['b1', 'b₁', 0], ['b2', 'b₂', 1], ['c1', 'c₁', 1], ['c2', 'c₂', 0]];
    var matrix = '<div class="control"><label>System matrices</label><div class="matrix-grid">' + cells.map(function (c) {
      return '<label class="mcell"><span>' + c[1] + '</span><input type="number" data-num="' + c[0] + '" min="-5" max="5" step="0.1" value="' + c[2] + '" aria-label="' + c[1] + '"></label>';
    }).join('') + '</div><span class="hint">A is 2×2, B is 2×1, C is 1×2, D = 0. Entries are dimensionless in this teaching model.</span></div>';
    var ui = shell(host, {
      type: 'state', id: id,
      title: 'State-Space Lab',
      blurb: 'Edit the entries of A, B and C. The eigenvalues, transfer function, step response and phase portrait are all recomputed from those numbers — not from a stored answer.',
      aria: 'Interactive state-space simulation with editable 2×2 A matrix, phase portrait and step response.',
      controls: matrix,
      readouts: readout('eig', 'Eigenvalues') + readout('stab', 'Stability') + readout('tf', 'H(s)') + readout('final', 'Final y') + readout('trdet', 'trace, det'),
      model: 'ẋ = Ax + Bu, y = Cx. Eigenvalues of A are the natural modes; H(s) = C(sI − A)<sup>−1</sup>B. The step response is integrated with fourth-order Runge–Kutta at dt = 0.01 s. Stability here means every eigenvalue has a strictly negative real part.',
      presets: [{ label: 'Stable focus' }, { label: 'Stable node' }, { label: 'Saddle' }, { label: 'Oscillator' }]
    });
    if (!ui) return;
    function update() {
      // update numeric labels for inputs (no range outputs)
      cells.forEach(function (c) {
        var n = host.querySelector('[data-num="' + c[0] + '"]');
        if (n) {
          var out = host.querySelector('output[data-for="' + c[0] + '"]');
          if (out) out.textContent = nf(Number(n.value), 1);
        }
      });
      var a11 = val(host, 'a11'), a12 = val(host, 'a12'), a21 = val(host, 'a21'), a22 = val(host, 'a22');
      var b1 = val(host, 'b1'), b2 = val(host, 'b2'), c1 = val(host, 'c1'), c2 = val(host, 'c2');
      var tr = a11 + a22, det = a11 * a22 - a12 * a21, disc = tr * tr - 4 * det;
      var l1, l2, complex = disc < 0;
      if (complex) { l1 = [tr / 2, Math.sqrt(-disc) / 2]; l2 = [tr / 2, -Math.sqrt(-disc) / 2]; }
      else { l1 = [(tr + Math.sqrt(disc)) / 2, 0]; l2 = [(tr - Math.sqrt(disc)) / 2, 0]; }
      var stable = l1[0] < -1e-9 && l2[0] < -1e-9;
      var num1 = c1 * b1 + c2 * b2;
      var num0 = c1 * (-a22 * b1 + a12 * b2) + c2 * (a21 * b1 - a11 * b2);
      var den0 = det, den1 = -tr;
      function poly(n1, n0) {
        var parts = [];
        if (Math.abs(n1) > 1e-9) parts.push((Math.abs(n1 - 1) < 1e-9 ? '' : nf(n1, 2)) + 's');
        if (Math.abs(n0) > 1e-9 || !parts.length) parts.push(nf(n0, 2));
        return parts.join(' + ').replace(/\+ -/g, '− ');
      }
      ro(host, 'eig', complex ? nf(l1[0], 2) + ' ± j' + nf(l1[1], 2) : nf(l1[0], 2) + ', ' + nf(l2[0], 2));
      ro(host, 'stab', stable ? 'asymptotically stable' : (l1[0] > 1e-9 || l2[0] > 1e-9) ? 'unstable' : 'marginally stable');
      ro(host, 'tf', '(' + poly(num1, num0) + ') / (' + poly(1, den1).replace(/^1s/, 's') + (Math.abs(den0) > 1e-9 ? ' + ' + nf(den0, 2) : '') + ')');
      ro(host, 'trdet', nf(tr, 2) + ', ' + nf(det, 2));
      // RK4 step response
      var x1 = 0, x2 = 0, dt = 0.01, steps = 800, tarr = [], x1a = [], x2a = [], ya = [];
      function f(state) {
        return [a11 * state[0] + a12 * state[1] + b1, a21 * state[0] + a22 * state[1] + b2];
      }
      for (var i = 0; i <= steps; i++) {
        var t = i * dt;
        if (i % 5 === 0) { tarr.push(t); x1a.push(x1); x2a.push(x2); ya.push(c1 * x1 + c2 * x2); }
        var k1 = f([x1, x2]), k2 = f([x1 + dt * k1[0] / 2, x2 + dt * k1[1] / 2]);
        var k3 = f([x1 + dt * k2[0] / 2, x2 + dt * k2[1] / 2]), k4 = f([x1 + dt * k3[0], x2 + dt * k3[1]]);
        x1 += dt * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
        x2 += dt * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
        if (!isFinite(x1) || Math.abs(x1) > 1e10) { x1 = 0; x2 = 0; }
      }
      ro(host, 'final', nf(c1 * x1 + c2 * x2, 3));
      if (!stable) warn(host, 'At least one eigenvalue has a non-negative real part. The simulation window is fixed at 8 s, so an unstable trajectory is shown only over that window.', 'lab-warning');
      else warn(host, '', 'lab-ok');
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var lw = Math.round(w * 0.44) - 12;
      var bp = { x: 30, y: 22, w: Math.max(70, lw - 30), h: h - 60 };
      var bt = { x: lw + 48, y: 22, w: Math.max(80, w - lw - 60), h: h - 60 };
      var span = Math.max(1, Math.max.apply(null, x1a.concat(x2a).map(Math.abs)) * 1.15);
      V.axes(ctx, bp, -span, span, -span, span, { xlabel: 'x₁', ylabel: 'x₂', xTicks: 4, yTicks: 4 });
      V.line(ctx, bp.x, V.mapY(bp, -span, span, 0), bp.x + bp.w, V.mapY(bp, -span, span, 0), P.grid, 1);
      V.line(ctx, V.mapX(bp, -span, span, 0), bp.y, V.mapX(bp, -span, span, 0), bp.y + bp.h, P.grid, 1);
      ctx.save(); ctx.beginPath(); ctx.strokeStyle = P.lime; ctx.lineWidth = 2;
      for (i = 0; i < x1a.length; i++) {
        var px = V.mapX(bp, -span, span, x1a[i]), py = V.mapY(bp, -span, span, x2a[i]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
      V.dot(ctx, V.mapX(bp, -span, span, 0), V.mapY(bp, -span, span, 0), P.teal, 4);
      V.tag(ctx, bp.x + 4, bp.y + 9, 'phase portrait', P.lime);
      V.axes(ctx, bt, 0, 8, -span, span, { xlabel: 'time (s)', ylabel: 'x, y', xTicks: 5, yTicks: 4 });
      V.curve(ctx, bt, tarr, x1a, 0, 8, -span, span, P.teal, 1.8);
      V.curve(ctx, bt, tarr, x2a, 0, 8, -span, span, P.amber, 1.8);
      V.curve(ctx, bt, tarr, ya, 0, 8, -span, span, P.violet, 1.4, [4, 3]);
      V.tag(ctx, bt.x + 4, bt.y + 9, 'x₁', P.teal);
      V.tag(ctx, bt.x + 48, bt.y + 9, 'x₂', P.amber);
      V.tag(ctx, bt.x + 92, bt.y + 9, 'y', P.violet);
      V.title(ctx, stable ? 'stable' : 'not stable', bp.x, 3, P.ink);
    }
    bind(host, update, onRun);
    preset(host, [
      { label: 'Stable focus', values: { a11: -0.6, a12: 2, a21: -2, a22: -0.6, b1: 0, b2: 1, c1: 1, c2: 0 } },
      { label: 'Stable node', values: { a11: -2, a12: 0, a21: 0, a22: -1, b1: 0, b2: 1, c1: 1, c2: 0 } },
      { label: 'Saddle', values: { a11: 1, a12: 0, a21: 0, a22: -1, b1: 0, b2: 1, c1: 1, c2: 0 } },
      { label: 'Oscillator', values: { a11: 0, a12: 1, a21: -1, a22: 0, b1: 0, b2: 1, c1: 1, c2: 0 } }
    ], update);
    update();
  };
})();
