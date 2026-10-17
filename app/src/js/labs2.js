/* ============================================================
   Interactive labs 4–6: modulation, Fourier synthesis/filtering,
   Laplace pole–zero behaviour.
   ============================================================ */
(function () {
  'use strict';
  var root = window.ETE;
  var V = root.Viz;
  var L = root.Labs;
  var U = L._ui;
  var control = U.control, select = U.select, readout = U.readout, shell = U.shell;
  var val = U.val, sel = U.sel, ro = U.ro, warn = U.warn, bind = U.bind, preset = U.preset, nf = U.nf, canvasPlot = U.canvasPlot, outAll = U.outAll;

  function bitsOf(s) {
    var b = String(s || '').replace(/[^01]/g, '');
    return b.length ? b : '10110011';
  }
  function padBits(b, m) {
    while (b.length % m) b += '0';
    return b;
  }

  /* ================= LAB 4 — Modulation Studio ================= */
  L.types.modulation = function (host, id, onRun) {
    var prefix = 'lab' + id + '-mod';
    var ui = shell(host, {
      type: 'modulation', id: id,
      title: 'Modulation Studio',
      blurb: 'Switch between analog and digital schemes. The upper panel is the transmitted waveform; the lower panel changes to the spectrum, instantaneous frequency or constellation that belongs to the selected scheme.',
      aria: 'Interactive modulation studio showing AM, FM, ASK, FSK, BPSK, QPSK and 16-QAM waveforms and their spectra or constellations.',
      controls:
        select(prefix, 'scheme', 'Scheme', [['AM', 'AM — amplitude modulation'], ['FM', 'FM — frequency modulation'], ['ASK', 'ASK / OOK'], ['FSK', 'FSK'], ['BPSK', 'BPSK'], ['QPSK', 'QPSK'], ['QAM16', '16-QAM']], 'AM') +
        control(prefix, 'fm', 'Message frequency f_m', 0.2, 2.5, 0.05, 0.8, '') +
        control(prefix, 'fc', 'Carrier frequency f_c', 4, 12, 0.1, 8, '') +
        control(prefix, 'm', 'AM index m', 0, 1.2, 0.02, 0.7, '') +
        control(prefix, 'beta', 'FM index β', 0.2, 5, 0.05, 1.5, '') +
        '<div class="control"><label for="' + prefix + '-bits">Bit pattern <output data-for="bits">8 bits</output></label>' +
        '<input type="text" id="' + prefix + '-bits" data-bits="bits" value="10110011" inputmode="numeric" autocomplete="off" spellcheck="false" aria-describedby="' + prefix + '-bits-hint">' +
        '<span class="hint" id="' + prefix + '-bits-hint">Only 0 and 1 are used. Bits are grouped by the selected scheme.</span></div>',
      readouts: readout('scheme', 'Scheme') + readout('bps', 'Bits / symbol') + readout('baud', 'Symbol rate') + readout('bitrate', 'Bit rate') + readout('bw', 'Bandwidth') + readout('detail', 'Detail'),
      model: 'AM: s(t) = [1 + m cos(2πf<sub>m</sub>t)]cos(2πf<sub>c</sub>t), bandwidth 2f<sub>m</sub>. FM: s(t) = cos(2πf<sub>c</sub>t + β sin(2πf<sub>m</sub>t)), Carson bandwidth ≈ 2f<sub>m</sub>(β+1). M-ary digital schemes carry log₂M bits per symbol. Bandwidth figures are nominal first-null or Carson approximations, not a full spectral mask.',
      presets: [{ label: 'AM radio' }, { label: 'FM' }, { label: 'QPSK' }, { label: '16-QAM' }]
    });
    if (!ui) return;
    host.querySelector('[data-bits]').addEventListener('input', function () { update(); });
    function scheme() { return sel(host, 'scheme'); }
    function analogWave(schemeName, t) {
      var fm = val(host, 'fm'), fc = val(host, 'fc'), m = val(host, 'm'), beta = val(host, 'beta');
      if (schemeName === 'AM') return (1 + m * Math.cos(2 * Math.PI * fm * t)) * Math.cos(2 * Math.PI * fc * t);
      return Math.cos(2 * Math.PI * fc * t + beta * Math.sin(2 * Math.PI * fm * t));
    }
    function digitalMeta() {
      var s = scheme();
      var bits = bitsOf(host.querySelector('[data-bits]').value);
      var bps = s === 'QPSK' ? 2 : s === 'QAM16' ? 4 : 1;
      bits = padBits(bits, bps);
      return { bits: bits, bps: bps, symbols: Math.floor(bits.length / bps) };
    }
    function symbolPoint(bits, idx, bps) {
      if (bps === 1) return bits.charAt(idx) === '0' ? [0.34, 0] : [1, 0];
      if (bps === 2) {
        var pair = bits.substr(idx * 2, 2);
        var ph = { '00': Math.PI / 4, '01': 3 * Math.PI / 4, '11': 5 * Math.PI / 4, '10': 7 * Math.PI / 4 }[pair] || 0;
        return [Math.cos(ph) * 0.9, Math.sin(ph) * 0.9];
      }
      var quad = bits.substr(idx * 4, 4);
      function lvl(pair) { return pair === '00' ? -3 : pair === '01' ? -1 : pair === '11' ? 1 : 3; }
      return [lvl(quad.substr(0, 2)) / 3, lvl(quad.substr(2, 2)) / 3];
    }
    function update() {
      outAll(host, [['fm', 2], ['fc', 1], ['m', 2], ['beta', 2]]);
      var s = scheme();
      var fm = val(host, 'fm'), fc = val(host, 'fc'), m = val(host, 'm'), beta = val(host, 'beta');
      var bitsBox = host.querySelector('[data-bits]');
      var rawBits = String(bitsBox.value || '').replace(/[^01]/g, '');
      if (rawBits !== bitsBox.value) bitsBox.value = rawBits;
      var meta = digitalMeta();
      host.querySelector('output[data-for="bits"]').textContent = meta.bits.length + ' bits';
      var digits = ['AM', 'FM'].indexOf(s) >= 0;
      var bps = digits ? '—' : meta.bps;
      var Tb = 0.15, baud = digits ? '—' : nf(1 / Tb, 2) + ' sym/s';
      var bitrate = digits ? '—' : nf(meta.bps / Tb, 2) + ' bit/s';
      var bw = digits ? (s === 'AM' ? nf(2 * fm, 2) : nf(2 * fm * (beta + 1), 2)) + ' (normalised)' : s === 'FSK' ? nf(2 * 2 + 2 / Tb, 2) + ' Hz (nominal)' : nf(2 / Tb, 2) + ' Hz (nominal)';
      var detail = s === 'AM' ? ('sidebands at f_c ± ' + nf(fm, 2) + '; power efficiency ' + nf(100 * m * m / (2 + m * m), 1) + '%')
        : s === 'FM' ? ('Δf = ' + nf(beta * fm, 2) + '; Carson bandwidth ' + nf(2 * fm * (beta + 1), 2))
          : ('M = ' + Math.pow(2, meta.bps) + ' states; ' + meta.symbols + ' symbols in this pattern');
      ro(host, 'scheme', s);
      ro(host, 'bps', String(bps));
      ro(host, 'baud', baud);
      ro(host, 'bitrate', bitrate);
      ro(host, 'bw', bw);
      ro(host, 'detail', detail);
      if (!digits && meta.bits.length < 4) warn(host, 'Use at least four bits so the symbol grouping is visible.'); else warn(host, '');
      draw();
    }
    function draw() {
      var s = scheme();
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var b1 = V.box(w, h, { mt: 26, mb: 24, ml: 44, mr: 12 }); b1.h = Math.round(h * 0.50);
      var b2 = { x: b1.x, y: b1.y + b1.h + 42, w: b1.w, h: Math.max(60, h - (b1.y + b1.h + 42) - 30) };
      var T = 1.25;
      var xs = [], ys = [], i;
      if (s === 'AM' || s === 'FM') {
        for (i = 0; i <= 900; i++) { var t = T * i / 900; xs.push(t); ys.push(analogWave(s, t)); }
        V.axes(ctx, b1, 0, T, -1.6, 1.6, { xlabel: '', ylabel: 's(t)', xTicks: 5, yTicks: 4 });
        V.curve(ctx, b1, xs, ys, 0, T, -1.6, 1.6, P.lime, 1.5);
        V.title(ctx, s + ' waveform · f_c = ' + nf(val(host, 'fc'), 1) + ' · f_m = ' + nf(val(host, 'fm'), 2), b1.x, 6, P.ink);
        V.axes(ctx, b2, 0, 2 * val(host, 'fc'), 0, 1.15, { xlabel: 'frequency (normalised)', ylabel: s === 'AM' ? '|S|' : 'f_i', xTicks: 6, yTicks: 2 });
        if (s === 'AM') {
          var fc = val(host, 'fc'), fm = val(host, 'fm'), m = val(host, 'm');
          [[fc, 1, P.teal], [fc - fm, m / 2, P.lime], [fc + fm, m / 2, P.amber]].forEach(function (L) {
            var x = V.mapX(b2, 0, 2 * fc, L[0]);
            V.line(ctx, x, V.mapY(b2, 0, 1.15, 0), x, V.mapY(b2, 0, 1.15, L[1]), L[2], 3);
          });
          V.tag(ctx, b2.x + 6, b2.y + 10, 'carrier', P.teal);
          V.tag(ctx, b2.x + 76, b2.y + 10, 'sidebands', P.lime);
        } else {
          var fcv = val(host, 'fc'), betav = val(host, 'beta'), fmv = val(host, 'fm');
          var fi = [];
          for (i = 0; i <= 500; i++) { var tt = T * i / 500; fi.push(fcv + betav * fmv * Math.cos(2 * Math.PI * fmv * tt)); }
          V.curve(ctx, b2, xs.slice(0, 501), fi, 0, T, fcv - betav * fmv - 1, fcv + betav * fmv + 1, P.teal, 2);
          V.line(ctx, b2.x, V.mapY(b2, fcv - betav * fmv - 1, fcv + betav * fmv + 1, fcv), b2.x + b2.w, V.mapY(b2, fcv - betav * fmv - 1, fcv + betav * fmv + 1, fcv), P.faint, 1, [3, 3]);
          V.tag(ctx, b2.x + 6, b2.y + 10, 'instantaneous frequency', P.teal);
        }
      } else {
        var meta = digitalMeta();
        var Tb = 0.15, total = meta.symbols * Tb;
        var sym = 0;
        for (i = 0; i <= 1200; i++) {
          var td = total * i / 1200;
          sym = Math.min(meta.symbols - 1, Math.floor(td / Tb));
          var bit0 = meta.bits.charAt(sym);
          var phase = 0, amp = 1;
          if (s === 'ASK') amp = bit0 === '1' ? 1 : 0.08;
          else if (s === 'FSK') {
            var f0 = val(host, 'fc') - 2, f1 = val(host, 'fc') + 2;
            phase = 2 * Math.PI * (bit0 === '1' ? f1 : f0) * td;
            var base = 2 * Math.PI * val(host, 'fc') * td;
            // continuous phase is approximated by the selected tone; the visual is a teaching guide
            ys.push(Math.cos(phase));
            xs.push(td);
            continue;
          } else if (s === 'BPSK') phase = bit0 === '1' ? Math.PI : 0;
          else {
            var pt = symbolPoint(meta.bits, sym, meta.bps);
            var I = pt[0], Q = pt[1];
            ys.push(I * Math.cos(2 * Math.PI * val(host, 'fc') * td) - Q * Math.sin(2 * Math.PI * val(host, 'fc') * td));
            xs.push(td);
            continue;
          }
          ys.push(amp * Math.cos(2 * Math.PI * val(host, 'fc') * td + phase));
          xs.push(td);
        }
        var ymax2 = 1.7;
        V.axes(ctx, b1, 0, total, -ymax2, ymax2, { xlabel: '', ylabel: 's(t)', xTicks: 6, yTicks: 2 });
        V.curve(ctx, b1, xs, ys, 0, total, -ymax2, ymax2, P.lime, 1.5);
        // bit boundaries and labels
        for (var k = 0; k < meta.symbols; k++) {
          var x = V.mapX(b1, 0, total, k * Tb);
          V.line(ctx, x, b1.y, x, b1.y + b1.h, P.line, 1, [2, 3]);
          ctx.fillStyle = P.muted; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(meta.bits.substr(k * meta.bps, meta.bps), x + 3, b1.y + 3);
        }
        V.title(ctx, s + ' waveform · ' + meta.symbols + ' symbols · ' + nf(total, 2) + ' s shown', b1.x, 6, P.ink);
        V.axes(ctx, b2, -1.25, 1.25, -1.25, 1.25, { xlabel: 'in-phase I', ylabel: 'quadrature Q', xTicks: 4, yTicks: 4 });
        V.line(ctx, b2.x, V.mapY(b2, -1.25, 1.25, 0), b2.x + b2.w, V.mapY(b2, -1.25, 1.25, 0), P.grid, 1);
        V.line(ctx, V.mapX(b2, -1.25, 1.25, 0), b2.y, V.mapX(b2, -1.25, 1.25, 0), b2.y + b2.h, P.grid, 1);
        if (s === 'FSK') {
          var fc2 = val(host, 'fc');
          V.tag(ctx, b2.x + 8, b2.y + b2.h / 2, 'tone 0 at ' + nf(fc2 - 2, 1) + ' · tone 1 at ' + nf(fc2 + 2, 1), P.teal);
          V.dot(ctx, V.mapX(b2, -1.25, 1.25, -0.55), V.mapY(b2, -1.25, 1.25, 0), P.violet, 5);
          V.dot(ctx, V.mapX(b2, -1.25, 1.25, 0.55), V.mapY(b2, -1.25, 1.25, 0), P.amber, 5);
        } else if (meta.bps === 1) {
          [[0.34, 0], [1, 0]].forEach(function (pt, idx) { V.dot(ctx, V.mapX(b2, -1.25, 1.25, pt[0]), V.mapY(b2, -1.25, 1.25, pt[1]), idx ? P.lime : P.faint, 5); });
          V.tag(ctx, b2.x + 8, b2.y + 12, 'OOK: one point per bit', P.teal);
        } else if (meta.bps === 2) {
          ['00', '01', '11', '10'].forEach(function (p, idx) {
            var ph = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4][idx];
            var x = V.mapX(b2, -1.25, 1.25, Math.cos(ph) * 0.9), y = V.mapY(b2, -1.25, 1.25, Math.sin(ph) * 0.9);
            V.dot(ctx, x, y, P.teal, 5);
            ctx.fillStyle = P.muted; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            ctx.fillText(p, x, y - 8);
          });
        } else {
          for (var ib = 0; ib < 4; ib++) for (var qb = 0; qb < 4; qb++) {
            var iv = [-3, -1, 1, 3][ib] / 3, qv = [-3, -1, 1, 3][qb] / 3;
            var x2 = V.mapX(b2, -1.25, 1.25, iv), y2 = V.mapY(b2, -1.25, 1.25, qv);
            V.dot(ctx, x2, y2, P.teal, 3.4);
          }
          V.tag(ctx, b2.x + 8, b2.y + 10, '16-QAM · 4 bits per point', P.teal);
        }
      }
    }
    var bnd = bind(host, update, onRun);
    preset(host, [
      { label: 'AM radio', values: { scheme: 'AM', fm: 0.8, fc: 8, m: 0.7, beta: 1.5 } },
      { label: 'FM', values: { scheme: 'FM', fm: 0.8, fc: 8, m: 0.7, beta: 2.5 } },
      { label: 'QPSK', values: { scheme: 'QPSK', fm: 0.8, fc: 8, m: 0.7, beta: 1.5 } },
      { label: '16-QAM', values: { scheme: 'QAM16', fm: 0.8, fc: 8, m: 0.7, beta: 1.5 } }
    ], update);
    update();
  };

  /* ================= LAB 5 — Fourier and filter ================= */
  L.types.fourier = function (host, id, onRun) {
    var prefix = 'lab' + id + '-fourier';
    var ui = shell(host, {
      type: 'fourier', id: id,
      title: 'Harmonic Builder and RC Filter',
      blurb: 'Add harmonics to a periodic waveform and watch the spectrum. Then lower the filter cutoff and see which harmonics survive.',
      aria: 'Interactive Fourier synthesis of square, sawtooth and triangle waves with harmonic count and RC filter cutoff, showing waveform and spectrum.',
      controls:
        select(prefix, 'wave', 'Waveform', [['square', 'Square'], ['saw', 'Sawtooth'], ['triangle', 'Triangle']], 'square') +
        control(prefix, 'N', 'Harmonics N', 1, 31, 2, 9, '', 'Odd harmonics only are used for square and triangle waves.') +
        control(prefix, 'A', 'Amplitude', 0.2, 2, 0.05, 1, '') +
        select(prefix, 'filter', 'Filter', [['off', 'Off (ideal sum)'], ['on', 'RC low-pass on']], 'off') +
        control(prefix, 'fc', 'Filter cutoff', 0.2, 20, 0.1, 4, ' × f₀'),
      readouts: readout('rms', 'RMS error') + readout('high', 'Highest harmonic') + readout('att', 'Filter attenuation') + readout('over', 'Overshoot') + readout('bw', 'Bandwidth kept'),
      model: 'For a square wave, c<sub>n</sub> = 4A/(πn) for odd n. The RC filter multiplies harmonic n by 1/√(1+(nf₀/f<sub>c</sub>)²) and shifts it by −arctan(nf₀/f<sub>c</sub>). RMS error is computed against the ideal waveform over one period, not over an infinite record.',
      presets: [{ label: 'Square 1' }, { label: 'Square 15' }, { label: 'Filtered' }, { label: 'Triangle' }]
    });
    if (!ui) return;
    function coeff(wave, n, A) {
      if (wave === 'square') return n % 2 ? 4 * A / (Math.PI * n) : 0;
      if (wave === 'saw') return 2 * A / (Math.PI * n) * (n % 2 ? 1 : -1);
      return n % 2 ? 8 * A / (Math.PI * Math.PI * n * n) * ((n % 4 === 1) ? 1 : -1) : 0;
    }
    function ideal(wave, t, A) {
      if (wave === 'square') return A * (Math.sin(2 * Math.PI * t) >= 0 ? 1 : -1);
      if (wave === 'saw') { var u = t - Math.floor(t); return 2 * A * (u - 0.5); }
      return (2 * A / Math.PI) * Math.asin(Math.sin(2 * Math.PI * t));
    }
    function update() {
      var wave = sel(host, 'wave'), N = Math.round(val(host, 'N')), A = val(host, 'A'), fc = val(host, 'fc');
      if (N % 2 === 0) N += 1;
      outAll(host, [['N', 0], ['A', 2], ['fc', 1, ' × f₀']]);
      var filtOn = sel(host, 'filter') === 'on';
      var xs = [], id = [], syn = [], fil = [], spec = [];
      var t0 = -1.5, t1 = 1.5, M = 720;
      var maxErr = 0, maxSyn = 0;
      for (var i = 0; i <= M; i++) {
        var t = t0 + (t1 - t0) * i / M;
        var sv = 0, fv = 0;
        for (var n = 1; n <= N; n += 1) {
          var c = coeff(wave, n, A);
          if (!c) continue;
          var H = filtOn ? 1 / Math.sqrt(1 + Math.pow(n / fc, 2)) : 1;
          var ph = filtOn ? -Math.atan(n / fc) : 0;
          sv += c * Math.sin(2 * Math.PI * n * t);
          fv += c * H * Math.sin(2 * Math.PI * n * t + ph);
        }
        xs.push(t); id.push(ideal(wave, t, A)); syn.push(sv); fil.push(fv);
        maxErr = Math.max(maxErr, Math.abs(sv - ideal(wave, t, A)));
        maxSyn = Math.max(maxSyn, Math.abs(sv));
      }
      var rms = 0;
      for (i = 0; i < syn.length; i++) rms += (syn[i] - id[i]) * (syn[i] - id[i]);
      rms = Math.sqrt(rms / syn.length);
      var highest = 1;
      for (n = N; n >= 1; n--) { if (coeff(wave, n, A) !== 0) { highest = n; break; } }
      var att = filtOn ? 20 * Math.log10(1 / Math.sqrt(1 + Math.pow(highest / fc, 2))) : 0;
      ro(host, 'rms', nf(rms, 3) + ' A');
      ro(host, 'high', 'n = ' + highest);
      ro(host, 'att', filtOn ? nf(att, 1) + ' dB' : 'filter off');
      ro(host, 'over', nf(100 * (maxSyn / A - 1), 1) + '%');
      ro(host, 'bw', '≈ ' + nf(highest, 0) + ' f₀');
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var b1 = V.box(w, h, { mt: 24, mb: 24, ml: 42, mr: 12 }); b1.h = Math.round(h * 0.58);
      var b2 = { x: b1.x, y: b1.y + b1.h + 42, w: b1.w, h: Math.max(55, h - (b1.y + b1.h + 42) - 28) };
      V.axes(ctx, b1, t0, t1, -A * 1.5, A * 1.5, { xlabel: '', ylabel: 'x(t)', xTicks: 6, yTicks: 3 });
      V.curve(ctx, b1, xs, id, t0, t1, -A * 1.5, A * 1.5, P.faint, 1.2, [4, 4]);
      V.curve(ctx, b1, xs, syn, t0, t1, -A * 1.5, A * 1.5, P.lime, 1.6);
      if (filtOn) V.curve(ctx, b1, xs, fil, t0, t1, -A * 1.5, A * 1.5, P.rose, 2);
      V.tag(ctx, b1.x + 6, b1.y + 10, 'ideal', P.faint);
      V.tag(ctx, b1.x + 54, b1.y + 10, 'sum N=' + N, P.lime);
      if (filtOn) V.tag(ctx, b1.x + 140, b1.y + 10, 'filtered', P.rose);
      V.title(ctx, wave + ' · N = ' + N + ' · ' + (filtOn ? 'RC f_c = ' + nf(fc, 1) + ' f₀' : 'unfiltered'), b1.x, 5, P.ink);
      V.axes(ctx, b2, 0, 31, 0, 1.25, { xlabel: 'harmonic number n', ylabel: 'relative', xTicks: 6, yTicks: 2 });
      for (n = 1; n <= 31; n++) {
        var cc = Math.abs(coeff(wave, n, A));
        if (cc <= 0) continue;
        var ampRel = Math.min(1.2, cc / (4 * A / Math.PI));
        var x2 = V.mapX(b2, 0, 31, n);
        var y0 = V.mapY(b2, 0, 1.25, 0), y2 = V.mapY(b2, 0, 1.25, ampRel);
        ctx.strokeStyle = n <= N ? P.teal : P.grid; ctx.lineWidth = n <= N ? 2.5 : 1;
        ctx.beginPath(); ctx.moveTo(x2, y0); ctx.lineTo(x2, y2); ctx.stroke();
      }
      if (filtOn) {
        var fcxs = [], fcy = [];
        for (n = 0; n <= 31; n++) { fcxs.push(n); fcy.push(1 / Math.sqrt(1 + Math.pow(n / fc, 2))); }
        V.curve(ctx, b2, fcxs, fcy, 0, 31, 0, 1.25, P.rose, 1.6);
        V.tag(ctx, b2.x + 6, b2.y + 10, '|H|', P.rose);
      }
    }
    bind(host, update, onRun);
    preset(host, [{ label: 'Square 1', values: { wave: 'square', N: 1, A: 1, filter: 'off', fc: 4 } }, { label: 'Square 15', values: { wave: 'square', N: 15, A: 1, filter: 'off', fc: 4 } }, { label: 'Filtered', values: { wave: 'square', N: 31, A: 1, filter: 'on', fc: 3 } }, { label: 'Triangle', values: { wave: 'triangle', N: 15, A: 1, filter: 'off', fc: 4 } }], update);
    update();
  };

  /* ================= LAB 6 — Pole–zero / second-order ================= */
  L.types.laplace = function (host, id, onRun) {
    var prefix = 'lab' + id + '-laplace';
    var ui = shell(host, {
      type: 'laplace', id: id,
      title: 'Pole–Zero Lab',
      blurb: 'Move the damping ratio and natural frequency. The poles move in the s-plane, and the impulse and step responses are computed from those poles.',
      aria: 'Interactive s-plane pole-zero plot with impulse and step responses of a second-order system as damping and natural frequency change.',
      controls:
        control(prefix, 'z', 'Damping ratio ζ', 0, 2, 0.01, 0.3, '', 'ζ = 0 is undamped; ζ < 1 underdamped; ζ = 1 critical; ζ > 1 overdamped.') +
        control(prefix, 'wn', 'Natural frequency ωₙ', 0.3, 6, 0.05, 2, ' rad/s') +
        control(prefix, 'g', 'Gain', 0.2, 2, 0.05, 1, ''),
      readouts: readout('poles', 'Poles') + readout('damp', 'Damping') + readout('ov', 'Overshoot') + readout('ts', 'Settling (4%)') + readout('tp', 'Peak time') + readout('dc', 'DC gain'),
      model: 'H(s) = Kωₙ²/(s² + 2ζωₙs + ωₙ²). Poles are −ζωₙ ± jωₙ√(1−ζ²) for ζ < 1. Overshoot M<sub>p</sub> = e<sup>−πζ/√(1−ζ²)</sup>, peak time π/ω<sub>d</sub>, and the 4% settling estimate is 4/(ζωₙ). These are standard second-order estimates, not exact for every higher-order system.',
      presets: [{ label: 'Underdamped' }, { label: 'Critically damped' }, { label: 'Overdamped' }, { label: 'Undamped' }]
    });
    if (!ui) return;
    function poles(z, wn) {
      if (z < 1) { var wd = wn * Math.sqrt(1 - z * z); return { re: -z * wn, im: wd, type: 'underdamped', p1: [-z * wn, wd], p2: [-z * wn, -wd] }; }
      if (Math.abs(z - 1) < 1e-9) return { re: -wn, im: 0, type: 'critically damped', p1: [-wn, 0], p2: [-wn, 0] };
      var s = wn * Math.sqrt(z * z - 1);
      return { re: -z * wn, im: 0, type: 'overdamped', p1: [-z * wn + s, 0], p2: [-z * wn - s, 0] };
    }
    function impulse(z, wn, t) {
      if (z < 1) { var wd = wn * Math.sqrt(1 - z * z); return (wn * wn / wd) * Math.exp(-z * wn * t) * Math.sin(wd * t); }
      if (Math.abs(z - 1) < 1e-9) return wn * wn * t * Math.exp(-wn * t);
      var s = wn * Math.sqrt(z * z - 1), p1 = -z * wn + s, p2 = -z * wn - s;
      return wn * wn / (p1 - p2) * (Math.exp(p1 * t) - Math.exp(p2 * t));
    }
    function stepResp(z, wn, t) {
      if (z < 1) { var wd = wn * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * wn * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t)); }
      if (Math.abs(z - 1) < 1e-9) return 1 - Math.exp(-wn * t) * (1 + wn * t);
      var s = wn * Math.sqrt(z * z - 1), p1 = -z * wn + s, p2 = -z * wn - s;
      var A = p2 / (p1 - p2), B = -p1 / (p1 - p2);
      return 1 + A * Math.exp(p1 * t) + B * Math.exp(p2 * t);
    }
    function update() {
      var z = val(host, 'z'), wn = val(host, 'wn'), g = val(host, 'g');
      outAll(host, [['z', 2], ['wn', 2, ' rad/s'], ['g', 2]]);
      var po = poles(z, wn);
      ro(host, 'poles', z < 1 ? nf(po.re, 2) + ' ± j' + nf(po.im, 2) : nf(po.p1[0], 2) + ', ' + nf(po.p2[0], 2));
      ro(host, 'damp', po.type);
      var mp = z < 1 ? Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)) * 100 : 0;
      ro(host, 'ov', z < 1 ? nf(mp, 1) + '%' : '0% (no overshoot)');
      ro(host, 'ts', z > 0 ? nf(4 / (z * wn), 2) + ' s' : '∞ (no decay)');
      ro(host, 'tp', z < 1 ? nf(Math.PI / (wn * Math.sqrt(1 - z * z)), 2) + ' s' : '—');
      ro(host, 'dc', nf(g, 2));
      var c = canvasPlot(host); if (!c) return;
      var ctx = c.ctx, w = c.w, h = c.h, P = V.palette();
      var lw = Math.round(w * 0.40) - 12;
      var b1 = { x: 32, y: 22, w: Math.max(70, lw - 32), h: h - 60 };
      var b2 = { x: lw + 46, y: 22, w: Math.max(80, w - lw - 58), h: Math.round((h - 60) * 0.46) };
      var b3 = { x: b2.x, y: b2.y + b2.h + 38, w: b2.w, h: Math.max(45, h - (b2.y + b2.h + 38) - 28) };
      var xr = Math.max(1, Math.abs(po.re) + 2), yr = Math.max(1, po.im + 2);
      V.axes(ctx, b1, -xr, xr * 0.4, -yr, yr, { xlabel: 'σ', ylabel: 'jω', xTicks: 4, yTicks: 4 });
      V.line(ctx, V.mapX(b1, -xr, xr * 0.4, 0), b1.y, V.mapX(b1, -xr, xr * 0.4, 0), b1.y + b1.h, P.line, 1.2, [4, 4]);
      V.line(ctx, b1.x, V.mapY(b1, -yr, yr, 0), b1.x + b1.w, V.mapY(b1, -yr, yr, 0), P.line, 1.2, [4, 4]);
      ctx.save(); ctx.fillStyle = 'rgba(53,214,191,.06)';
      ctx.fillRect(b1.x, b1.y, V.mapX(b1, -xr, xr * 0.4, 0) - b1.x, b1.h); ctx.restore();
      [[po.p1], [po.p2]].forEach(function (p) {
        V.dot(ctx, V.mapX(b1, -xr, xr * 0.4, p[0][0]), V.mapY(b1, -yr, yr, p[0][1]), P.rose, 5);
      });
      V.tag(ctx, b1.x + 4, b1.y + 9, z < 1 ? 'conjugate pair' : 'real poles', P.rose);
      V.title(ctx, po.type + ' · ζ = ' + nf(z, 2) + ' · ωₙ = ' + nf(wn, 2), b1.x, 3, P.ink);
      var ts = [], hi = [], hs = [], maxh = 0;
      for (var i = 0; i <= 500; i++) {
        var t = 10 * i / 500;
        var hv = g * impulse(z, wn, t);
        ts.push(t); hi.push(hv); hs.push(g * stepResp(z, wn, t));
        maxh = Math.max(maxh, Math.abs(hv), Math.abs(hs[i]));
      }
      var lim = Math.max(1.2, maxh * 1.12);
      V.axes(ctx, b2, 0, 10, -lim * 0.35, lim, { xlabel: '', ylabel: 'h(t)', xTicks: 5, yTicks: 3 });
      V.curve(ctx, b2, ts, hi, 0, 10, -lim * 0.35, lim, P.lime, 2);
      V.tag(ctx, b2.x + 5, b2.y + 9, 'impulse', P.lime);
      V.axes(ctx, b3, 0, 10, -0.15, 1.5, { xlabel: 'time (s)', ylabel: 'step', xTicks: 5, yTicks: 2 });
      V.curve(ctx, b3, ts, hs, 0, 10, -0.15, 1.5, P.teal, 2);
      V.tag(ctx, b3.x + 5, b3.y + 9, 'step response', P.teal);
    }
    bind(host, update, onRun);
    preset(host, [{ label: 'Underdamped', values: { z: 0.3, wn: 2, g: 1 } }, { label: 'Critically damped', values: { z: 1, wn: 2, g: 1 } }, { label: 'Overdamped', values: { z: 1.8, wn: 2, g: 1 } }, { label: 'Undamped', values: { z: 0, wn: 2, g: 1 } }], update);
    update();
  };
})();
