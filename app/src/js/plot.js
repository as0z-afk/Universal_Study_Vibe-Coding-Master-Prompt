/* ============================================================
   Canvas plotting utilities and the nine animated projections.
   Every projection is driven by the course mathematics, has a
   complete static first frame, and exposes Play / Pause / Step /
   Replay / Reset / Speed controls.
   ============================================================ */
(function () {
  'use strict';
  var root = window.ETE = window.ETE || {};

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function palette() {
    return {
      ink: css('--ink') || '#e9f6f2',
      muted: css('--muted') || '#93b3ad',
      faint: css('--faint') || '#6f918c',
      line: css('--line-strong') || 'rgba(150,226,210,.3)',
      grid: css('--line') || 'rgba(150,226,210,.16)',
      teal: css('--teal') || '#35d6bf',
      lime: css('--lime') || '#b6e94e',
      amber: css('--amber') || '#f4c15d',
      rose: css('--rose') || '#f28b9c',
      violet: css('--violet') || '#b9a6f5',
      surface: css('--bg-2') || '#071d1f',
      bg: css('--bg') || '#051517'
    };
  }

  function prep(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var w = Math.max(280, Math.round(canvas.clientWidth || canvas.parentNode.clientWidth || 600));
    var h = Math.max(180, Math.round(canvas.clientHeight || w * 0.5625));
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function box(w, h, opts) {
    opts = opts || {};
    var ml = opts.ml === undefined ? 46 : opts.ml;
    var mr = opts.mr === undefined ? 14 : opts.mr;
    var mt = opts.mt === undefined ? 24 : opts.mt;
    var mb = opts.mb === undefined ? 36 : opts.mb;
    return { x: ml, y: mt, w: Math.max(10, w - ml - mr), h: Math.max(10, h - mt - mb), ml: ml, mr: mr, mt: mt, mb: mb };
  }

  function ticks(min, max, count) {
    var span = max - min;
    if (!isFinite(span) || span === 0) return [min];
    var step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var out = [], v = Math.ceil(min / step) * step;
    for (; v <= max + step * 1e-6 && out.length < 30; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    return out;
  }
  function labelNum(v) {
    if (v === 0) return '0';
    var a = Math.abs(v);
    if (a >= 1000 || a < 0.01) return v.toExponential(1).replace('e+', 'e').replace('e-0', 'e-');
    return String(Number(v.toPrecision(4)));
  }

  function axes(ctx, b, xmin, xmax, ymin, ymax, opts) {
    opts = opts || {};
    var p = palette();
    ctx.save();
    ctx.strokeStyle = p.grid;
    ctx.fillStyle = p.faint;
    ctx.lineWidth = 1;
    ctx.font = '11px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var xt = ticks(xmin, xmax, opts.xTicks || 6);
    xt.forEach(function (v) {
      var x = b.x + (v - xmin) / (xmax - xmin) * b.w;
      ctx.beginPath(); ctx.moveTo(x, b.y); ctx.lineTo(x, b.y + b.h); ctx.stroke();
      ctx.fillText(labelNum(v), x, b.y + b.h + 6);
    });
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var yt = ticks(ymin, ymax, opts.yTicks || 4);
    yt.forEach(function (v) {
      var y = b.y + (ymax - v) / (ymax - ymin) * b.h;
      ctx.beginPath(); ctx.moveTo(b.x, y); ctx.lineTo(b.x + b.w, y); ctx.stroke();
      ctx.fillText(labelNum(v), b.x - 7, y);
    });
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + b.h); ctx.lineTo(b.x + b.w, b.y + b.h); ctx.stroke();
    if (opts.xlabel) {
      ctx.fillStyle = p.muted;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(opts.xlabel, b.x + b.w, b.y + b.h + 31);
    }
    if (opts.ylabel) {
      ctx.save();
      ctx.translate(12, b.y + b.h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = p.muted;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(opts.ylabel, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  function mapX(b, xmin, xmax, x) { return b.x + (x - xmin) / (xmax - xmin) * b.w; }
  function mapY(b, ymin, ymax, y) { return b.y + (ymax - y) / (ymax - ymin) * b.h; }

  function curve(ctx, b, xs, ys, xmin, xmax, ymin, ymax, color, width, dash) {
    if (!xs.length) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.x, b.y, b.w, b.h);
    ctx.clip();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2;
    if (dash) ctx.setLineDash(dash);
    ctx.lineJoin = 'round';
    for (var i = 0; i < xs.length; i++) {
      var x = mapX(b, xmin, xmax, xs[i]);
      var y = mapY(b, ymin, ymax, ys[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function line(ctx, x1, y1, x2, y2, color, width, dash) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1.2;
    if (dash) ctx.setLineDash(dash);
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function dot(ctx, x, y, color, r) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r || 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function tag(ctx, x, y, text, color, bg) {
    ctx.save();
    ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
    var w = ctx.measureText(text).width + 12;
    ctx.fillStyle = bg || 'rgba(5,21,23,.82)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y - 9, w, 20, 5); ctx.fill(); ctx.stroke(); }
    else { ctx.fillRect(x, y - 9, w, 20); ctx.strokeRect(x, y - 9, w, 20); }
    ctx.fillStyle = color;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 6, y + 1);
    ctx.restore();
  }

  function title(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = color || palette().muted;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function waveform(n, f) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(f(i));
    return out;
  }

  /* ---------------- projection controller ---------------- */
  var active = null;
  function pauseAll() { if (active && active.playing) active.pause(); }

  function mountProjection(host, type, moduleId) {
    var cfg = PROJECTIONS[type];
    if (!cfg) return;
    host.innerHTML = '<div class="projection-head"><div><span class="pj-label">Animated projection</span><h3>' + cfg.title + '</h3></div><span class="pill teal">Module ' + moduleId + '</span></div>' +
      '<div class="projection-stage"><canvas role="img" aria-label="' + cfg.aria + '"></canvas></div>' +
      '<div class="controls">' +
      '<button class="btn btn-primary btn-sm" type="button" data-pj="play">Play <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:14px;height:14px"><path d="M8 5v14l11-7z"/></svg></button>' +
      '<button class="btn btn-sm" type="button" data-pj="step">Step</button>' +
      '<button class="btn btn-sm" type="button" data-pj="replay">Replay</button>' +
      '<button class="btn btn-sm" type="button" data-pj="reset">Reset</button>' +
      '<label class="sr-only" for="pjSpeed-' + moduleId + '">Playback speed</label>' +
      '<select id="pjSpeed-' + moduleId + '" data-pj="speed" style="width:auto;min-width:84px"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>' +
      '<span class="status" data-pj="status" aria-live="polite">Ready</span>' +
      '</div>' +
      '<p class="live-note" data-pj="note">' + cfg.blurb + '</p>';
    var canvas = host.querySelector('canvas');
    var note = host.querySelector('[data-pj="note"]');
    var status = host.querySelector('[data-pj="status"]');
    var playBtn = host.querySelector('[data-pj="play"]');
    if (!canvas.getContext || !canvas.getContext('2d')) {
      host.querySelector('.projection-stage').innerHTML = '<div class="live-note">This browser cannot draw the projection. The surrounding explanation and every formula remain available.</div>';
      return;
    }
    var scene = cfg.create(canvas, {
      setStatus: function (s) { status.textContent = s; },
      setNote: function (s) { note.innerHTML = s; }
    });
    var state = { t: 0, playing: false, last: 0, speed: 1, raf: 0, duration: cfg.duration || 9000 };
    var runner = {
      playing: false,
      pause: function () {
        state.playing = false; runner.playing = false;
        cancelAnimationFrame(state.raf);
        playBtn.innerHTML = 'Play <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:14px;height:14px"><path d="M8 5v14l11-7z"/></svg>';
      },
      play: function () {
        if (root.motionReduced && root.motionReduced()) {
          host.querySelector('[data-pj="step"]').click();
          status.textContent = 'Reduced motion: stepped frame';
          return;
        }
        pauseAll();
        active = runner;
        if (state.t >= 0.999) state.t = 0;
        state.playing = true; runner.playing = true;
        state.last = 0;
        playBtn.innerHTML = 'Pause <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:14px;height:14px"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
        state.raf = requestAnimationFrame(frame);
      }
    };
    function draw() {
      try { scene.draw(state.t); }
      catch (e) {
        status.textContent = 'Projection could not draw';
        cancelAnimationFrame(state.raf);
        state.playing = false;
      }
    }
    function frame(ts) {
      if (!state.playing) return;
      if (!state.last) state.last = ts;
      var dt = Math.min(60, ts - state.last);
      state.last = ts;
      state.t += dt * state.speed / state.duration;
      if (state.t > 1) state.t = 1;
      draw();
      if (state.t >= 1) { runner.pause(); status.textContent = 'Complete · ' + strip(scene.statusText(1)); return; }
      state.raf = requestAnimationFrame(frame);
    }
    function strip(s) { return String(s || '').replace(/<[^>]*>/g, ''); }
    function step() {
      runner.pause();
      var steps = cfg.steps || 8;
      var n = Math.min(steps, Math.floor(state.t * steps + 0.0001) + 1);
      state.t = Math.min(1, n / steps);
      draw();
      status.textContent = 'Step ' + n + '/' + steps + ' · ' + strip(scene.statusText(state.t));
    }
    host.querySelector('[data-pj="play"]').addEventListener('click', function () {
      if (state.playing) runner.pause(); else runner.play();
    });
    host.querySelector('[data-pj="step"]').addEventListener('click', step);
    host.querySelector('[data-pj="replay"]').addEventListener('click', function () { state.t = 0; draw(); runner.play(); });
    host.querySelector('[data-pj="reset"]').addEventListener('click', function () { runner.pause(); state.t = 0; draw(); status.textContent = 'Ready · ' + strip(scene.statusText(0)); });
    host.querySelector('[data-pj="speed"]').addEventListener('change', function (e) { state.speed = Number(e.target.value) || 1; });

    function redraw() { if (!state.playing) draw(); }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { redraw(); });
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', debounce(redraw, 150));
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) runner.pause(); });
    var themeObs = new MutationObserver(redraw);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    draw();
    status.textContent = 'Ready · ' + strip(scene.statusText(0));
    scene.statusText(0);
    return runner;
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /* ---------------- projections ---------------- */
  var PROJECTIONS = {};

  PROJECTIONS.signals = {
    title: 'Even and odd decomposition',
    blurb: 'The same waveform is reflected, added and subtracted. Play builds the two parts; Step isolates each stage.',
    aria: 'Animated plot of a waveform, its time-reversed copy, its even part and its odd part being combined.',
    duration: 10000,
    steps: 5,
    create: function (canvas) {
      var N = 321, xmin = -4, xmax = 4, ymin = -1.6, ymax = 1.6;
      var xs = [], x = [], even = [], odd = [];
      for (var i = 0; i < N; i++) {
        var t = xmin + (xmax - xmin) * i / (N - 1);
        xs.push(t);
        var u = t >= 0 ? 1 : 0;
        x.push(0.9 * Math.exp(-0.7 * t) * u + 0.55 * Math.sin(1.9 * t));
      }
      for (i = 0; i < N; i++) {
        var rev = x[N - 1 - i];
        even.push((x[i] + rev) / 2);
        odd.push((x[i] - rev) / 2);
      }
      var stages = [
        { title: 'Original signal x(t)', note: 'A waveform with no particular symmetry: a decaying exponential on the right and a sinusoid throughout.' },
        { title: 'Reflect in time: x(−t)', note: 'Reversing the time axis is the mirror image. Every feature at +t moves to −t.' },
        { title: 'Even part: ½[x(t) + x(−t)]', note: 'Adding the signal to its reflection leaves only the symmetric content.' },
        { title: 'Odd part: ½[x(t) − x(−t)]', note: 'Subtracting the reflection leaves only the antisymmetric content.' },
        { title: 'Reconstruct: x = x_even + x_odd', note: 'The two parts add back to the original exactly. The decomposition is unique.' }
      ];
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, b = box(w, h, { mt: 30, mb: 42 });
          var P = palette();
          axes(ctx, b, xmin, xmax, ymin, ymax, { xlabel: 'time t', ylabel: 'amplitude', xTicks: 8, yTicks: 4 });
          var stage = Math.min(4, Math.floor(p * 5 + 0.00001));
          var local = Math.min(1, Math.max(0, p * 5 - stage));
          if (stage === 0) {
            curve(ctx, b, xs, x, xmin, xmax, ymin, ymax, P.teal, 2.4);
          } else if (stage === 1) {
            curve(ctx, b, xs, x, xmin, xmax, ymin, ymax, P.teal, 2.4);
            curve(ctx, b, xs, x.slice().reverse(), xmin, xmax, ymin, ymax, P.violet, 2, [6, 4]);
          } else if (stage === 2) {
            curve(ctx, b, xs, x, xmin, xmax, ymin, ymax, P.faint, 1.3, [4, 4]);
            curve(ctx, b, xs, even, xmin, xmax, ymin, ymax, P.lime, 2.6);
          } else if (stage === 3) {
            curve(ctx, b, xs, even, xmin, xmax, ymin, ymax, P.lime, 2);
            curve(ctx, b, xs, odd, xmin, xmax, ymin, ymax, P.amber, 2.2);
          } else {
            curve(ctx, b, xs, even, xmin, xmax, ymin, ymax, P.lime, 1.6);
            curve(ctx, b, xs, odd, xmin, xmax, ymin, ymax, P.amber, 1.6);
            curve(ctx, b, xs, x, xmin, xmax, ymin, ymax, P.teal, 2.6);
          }
          var markerX = xmin + (xmax - xmin) * local;
          var mx = mapX(b, xmin, xmax, markerX);
          line(ctx, mx, b.y, mx, b.y + b.h, P.line, 1, [3, 4]);
          // legend
          var lx = b.x + 8, ly = b.y + 12;
          if (stage === 0 || stage === 1) tag(ctx, lx, ly, 'x(t)', P.teal);
          else if (stage === 1) tag(ctx, lx, ly, 'x(t)', P.teal);
          if (stage === 1) tag(ctx, lx + 64, ly, 'x(−t)', P.violet);
          if (stage === 2) { tag(ctx, lx, ly, 'x(t) faded', P.faint); tag(ctx, lx + 94, ly, 'even', P.lime); }
          if (stage === 3) { tag(ctx, lx, ly, 'even', P.lime); tag(ctx, lx + 62, ly, 'odd', P.amber); }
          if (stage === 4) { tag(ctx, lx, ly, 'even + odd = x(t)', P.teal); }
          title(ctx, stages[stage].title, b.x, 8, P.ink);
          if (stage === 2 || stage === 3 || stage === 4) {
            var shift = stage === 4 ? 0 : (stage === 2 ? 200 : 200);
            // show the formula as text in the corner; the canvas is a visual aid only
            ctx.fillStyle = P.muted;
            ctx.font = '11px ui-monospace, monospace';
            ctx.textAlign = 'right'; ctx.textBaseline = 'top';
            ctx.fillText(stage === 3 ? 'xₑ = ½(x+x₋)' : 'xₒ = ½(x−x₋)', b.x + b.w, b.y + 8);
          }
        },
        statusText: function (p) {
          var s = Math.min(4, Math.floor(p * 5 + 0.00001));
          return stages[s].title + ' — ' + stages[s].note;
        }
      };
    }
  };

  PROJECTIONS.convolution = {
    title: 'Flip, shift, multiply, integrate',
    blurb: 'The impulse response is reflected and slid across the input. The shaded overlap is the integrand; the lower curve is the accumulating output.',
    aria: 'Animated convolution of two rectangular pulses with a sliding overlap and a growing output triangle.',
    duration: 12000,
    steps: 10,
    create: function (canvas) {
      var xmin = -1, xmax = 4.5;
      var h = function (t) { return t > 0 && t < 1.5 ? 1 : 0; };
      var x = function (t) { return t > 0 && t < 2 ? 1 : 0; };
      var y = function (t) {
        if (t <= 0) return 0;
        if (t < 1.5) return t;
        if (t <= 2) return 1.5;
        if (t < 3.5) return 3.5 - t;
        return 0;
      };
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, hh = c.h, P = palette();
          var b1 = box(w, hh, { mt: 26, mb: 26, ml: 44, mr: 12 });
          b1.h = Math.round(hh * 0.48);
          var b2 = { x: b1.x, y: b1.y + b1.h + 46, w: b1.w, h: Math.max(60, hh - (b1.y + b1.h + 46) - 30) };
          axes(ctx, b1, xmin, xmax, 0, 1.35, { xlabel: '', ylabel: 'signals', xTicks: 6, yTicks: 2 });
          axes(ctx, b2, xmin, xmax, 0, 1.8, { xlabel: 'time t', ylabel: 'y(t)', xTicks: 6, yTicks: 2 });
          var tcur = xmin + (xmax - xmin) * p;
          var x0 = mapX(b1, xmin, xmax, 0), x2 = mapX(b1, xmin, xmax, 2);
          ctx.save(); ctx.globalAlpha = 0.20; ctx.fillStyle = P.teal;
          ctx.fillRect(x0, mapY(b1, 0, 1.35, 1), x2 - x0, mapY(b1, 0, 1.35, 0) - mapY(b1, 0, 1.35, 1)); ctx.restore();
          curve(ctx, b1, [0, 0, 2, 2], [0, 1, 1, 0], xmin, xmax, 0, 1.35, P.teal, 2.4);
          // reflected h: support [tcur-1.5, tcur]
          var hx1 = mapX(b1, xmin, xmax, tcur - 1.5), hx2 = mapX(b1, xmin, xmax, tcur);
          ctx.save();
          ctx.fillStyle = 'rgba(185,166,245,.18)'; ctx.strokeStyle = P.violet; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(hx1, mapY(b1, 0, 1.35, 0)); ctx.lineTo(hx1, mapY(b1, 0, 1.35, 1)); ctx.lineTo(hx2, mapY(b1, 0, 1.35, 1)); ctx.lineTo(hx2, mapY(b1, 0, 1.35, 0)); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.restore();
          // overlap
          var ov1 = Math.max(0, tcur - 1.5), ov2 = Math.min(2, tcur);
          if (ov2 > ov1) {
            var ox1 = mapX(b1, xmin, xmax, ov1), ox2 = mapX(b1, xmin, xmax, ov2);
            ctx.save(); ctx.fillStyle = 'rgba(182,233,78,.30)';
            ctx.fillRect(ox1, mapY(b1, 0, 1.35, 1), ox2 - ox1, mapY(b1, 0, 1.35, 0) - mapY(b1, 0, 1.35, 1)); ctx.restore();
          }
          line(ctx, mapX(b1, xmin, xmax, tcur), b1.y, mapX(b1, xmin, xmax, tcur), b1.y + b1.h, P.rose, 1.4, [4, 3]);
          tag(ctx, b1.x + 8, b1.y + 12, 'x(τ)', P.teal);
          tag(ctx, b1.x + 66, b1.y + 12, 'h(t−τ)', P.violet);
          title(ctx, 't = ' + tcur.toFixed(2) + ' s  ·  overlap = ' + Math.max(0, (ov2 - ov1)).toFixed(2), b1.x, 7, P.ink);
          // output trace up to tcur
          var xsArr = [], ysArr = [];
          for (var i = 0; i <= 180; i++) { var t = xmin + (tcur - xmin) * i / 180; xsArr.push(t); ysArr.push(y(t)); }
          curve(ctx, b2, xsArr, ysArr, xmin, xmax, 0, 1.8, P.lime, 2.4);
          dot(ctx, mapX(b2, xmin, xmax, tcur), mapY(b2, 0, 1.8, y(tcur)), P.lime, 4);
          tag(ctx, b2.x + 8, b2.y + 12, 'y(t) = ∫ x(τ)h(t−τ)dτ', P.lime);
        },
        statusText: function (p) {
          var t = xmin + (xmax - xmin) * p;
          var ov1 = Math.max(0, t - 1.5), ov2 = Math.min(2, t);
          return 't = ' + t.toFixed(2) + ' s, overlap width ' + Math.max(0, ov2 - ov1).toFixed(2) + ' s, y = ' + y(t).toFixed(2) + '.';
        }
      };
    }
  };

  PROJECTIONS.wave = {
    title: 'A wave carrying energy through a lossy medium',
    blurb: 'The wavefront advances while the envelope decays with distance. The lower trace is the same signal received at the far end, with noise added.',
    aria: 'Animated travelling wave decaying with distance, with a received noisy trace and a level readout.',
    duration: 11000,
    steps: 12,
    create: function (canvas) {
      var D = 10, lambda = 1, alpha = 0.6;
      var amp = function (d) { return Math.pow(10, -alpha * d / 20); };
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, P = palette();
          var b = box(w, h, { mt: 28, mb: 44, ml: 48, mr: 16 });
          axes(ctx, b, 0, D, -1.25, 1.25, { xlabel: 'distance along the medium (km)', ylabel: 'field amplitude', xTicks: 6, yTicks: 4 });
          var xs = [], ys = [], env1 = [], env2 = [];
          for (var i = 0; i <= 500; i++) {
            var d = D * i / 500;
            var a = amp(d);
            var phase = 2 * Math.PI * (d / lambda) - 2 * Math.PI * 1.2 * p * 3;
            xs.push(d); ys.push(a * Math.cos(phase) + 0.028 * Math.sin(97 * d + p * 50) * (1 + d));
            env1.push(a); env2.push(-a);
          }
          curve(ctx, b, xs, env1, 0, D, -1.25, 1.25, P.teal, 1.2, [3, 4]);
          curve(ctx, b, xs, env2, 0, D, -1.25, 1.25, P.teal, 1.2, [3, 4]);
          curve(ctx, b, xs, ys, 0, D, -1.25, 1.25, P.lime, 2);
          var front = D * p;
          var fx = mapX(b, 0, D, front);
          line(ctx, fx, b.y, fx, b.y + b.h, P.rose, 1.4, [4, 3]);
          dot(ctx, fx, mapY(b, -1.25, 1.25, 0), P.rose, 4);
          tag(ctx, b.x + 8, b.y + 12, 'transmitted', P.teal);
          tag(ctx, b.x + 100, b.y + 12, 'received', P.lime);
          title(ctx, 'wavefront at ' + front.toFixed(1) + ' km  ·  loss ' + (alpha * front).toFixed(1) + ' dB', b.x, 7, P.ink);
          // small received-level bar
          var barX = b.x + b.w - 18, barY = b.y + 10, barH = b.h - 20;
          ctx.save(); ctx.strokeStyle = P.line; ctx.strokeRect(barX, barY, 8, barH);
          var lvl = Math.max(0, Math.min(1, amp(D)));
          ctx.fillStyle = P.lime; ctx.fillRect(barX + 1, barY + barH * (1 - lvl), 6, barH * lvl); ctx.restore();
          ctx.fillStyle = P.faint; ctx.font = '10px ui-sans-serif, system-ui, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('rx', barX + 4, barY + barH + 12);
        },
        statusText: function (p) {
          var d = D * p;
          return 'Wavefront at ' + d.toFixed(1) + ' km; attenuation ' + (alpha * d).toFixed(2) + ' dB; received amplitude ' + (amp(d) * 100).toFixed(0) + '% of transmitted.';
        }
      };
    }
  };

  PROJECTIONS.modulation = {
    title: 'Amplitude modulation in time and frequency',
    blurb: 'The message rides on the carrier envelope. In the spectrum, the carrier stays at f_c while the message creates two sidebands at f_c ± f_m.',
    aria: 'Animated amplitude-modulated waveform with envelope, carrier and a two-sided line spectrum.',
    duration: 10000,
    steps: 10,
    create: function (canvas) {
      var fm = 0.8, fc = 8, m = 0.7, Tmax = 1.25;
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, P = palette();
          var b1 = box(w, h, { mt: 26, mb: 24, ml: 46, mr: 14 });
          b1.h = Math.round(h * 0.50);
          var b2 = { x: b1.x, y: b1.y + b1.h + 42, w: b1.w, h: Math.max(55, h - (b1.y + b1.h + 42) - 30) };
          axes(ctx, b1, 0, Tmax, -1.65, 1.65, { xlabel: '', ylabel: 'amplitude', xTicks: 5, yTicks: 4 });
          axes(ctx, b2, 0, 2 * fc, 0, 1.1, { xlabel: 'frequency (arbitrary units)', ylabel: '|S(f)|', xTicks: 8, yTicks: 2 });
          var tEnd = Tmax * p;
          var xs = [], ys = [], env = [], env2 = [];
          for (var i = 0; i <= 900; i++) {
            var t = Tmax * i / 900;
            if (t > tEnd) break;
            var mt = m * Math.cos(2 * Math.PI * fm * t);
            xs.push(t); ys.push((1 + mt) * Math.cos(2 * Math.PI * fc * t));
            env.push(1 + mt); env2.push(-(1 + mt));
          }
          curve(ctx, b1, xs, env, 0, Tmax, -1.65, 1.65, P.teal, 1.2, [4, 4]);
          curve(ctx, b1, xs, env2, 0, Tmax, -1.65, 1.65, P.teal, 1.2, [4, 4]);
          curve(ctx, b1, xs, ys, 0, Tmax, -1.65, 1.65, P.lime, 1.8);
          // message trace, scaled to fit
          var mx = [], my = [];
          for (i = 0; i <= 400; i++) { var tt = Tmax * i / 400; if (tt > tEnd) break; mx.push(tt); my.push(1.25 * m * Math.cos(2 * Math.PI * fm * tt)); }
          curve(ctx, b1, mx, my, 0, Tmax, -1.65, 1.65, P.violet, 1, [2, 3]);
          tag(ctx, b1.x + 8, b1.y + 12, 's(t)', P.lime);
          tag(ctx, b1.x + 50, b1.y + 12, 'envelope', P.teal);
          tag(ctx, b1.x + 126, b1.y + 12, 'm(t) scaled', P.violet);
          title(ctx, 'AM · m = ' + m + ' · f_m = ' + fm + ' · f_c = ' + fc, b1.x, 7, P.ink);
          // spectrum: carrier + sidebands, revealed
          var cw = mapX(b2, 0, 2 * fc, fc), sb1 = mapX(b2, 0, 2 * fc, fc - fm), sb2 = mapX(b2, 0, 2 * fc, fc + fm);
          var carH = 1.0, sbH = m / 2;
          var reveal = Math.min(1, p * 3);
          if (reveal > 0.05) {
            ctx.save(); ctx.strokeStyle = P.teal; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cw, mapY(b2, 0, 1.1, 0)); ctx.lineTo(cw, mapY(b2, 0, 1.1, carH * reveal)); ctx.stroke();
            ctx.strokeStyle = P.lime;
            ctx.beginPath(); ctx.moveTo(sb1, mapY(b2, 0, 1.1, 0)); ctx.lineTo(sb1, mapY(b2, 0, 1.1, sbH * reveal)); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sb2, mapY(b2, 0, 1.1, 0)); ctx.lineTo(sb2, mapY(b2, 0, 1.1, sbH * reveal)); ctx.stroke();
            ctx.restore();
          }
          tag(ctx, b2.x + 8, b2.y + 10, 'carrier', P.teal);
          tag(ctx, b2.x + 72, b2.y + 10, 'lower sideband', P.lime);
          tag(ctx, b2.x + 190, b2.y + 10, 'upper sideband', P.amber);
        },
        statusText: function (p) {
          return 'AM with m = 0.7: carrier at f_c, sidebands at f_c ± f_m; total bandwidth 2f_m = ' + (2 * fm).toFixed(2) + '.';
        }
      };
    }
  };

  PROJECTIONS.fourier = {
    title: 'Building a square wave from harmonics',
    blurb: 'Odd harmonics are added one at a time. The waveform sharpens, the line spectrum grows, and the Gibbs overshoot stays near 9%.',
    aria: 'Animated Fourier synthesis of a square wave with an increasing number of odd harmonics and a line spectrum.',
    duration: 12000,
    steps: 15,
    create: function (canvas) {
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, P = palette();
          var b1 = box(w, h, { mt: 26, mb: 24, ml: 44, mr: 14 });
          b1.h = Math.round(h * 0.54);
          var b2 = { x: b1.x, y: b1.y + b1.h + 40, w: b1.w, h: Math.max(55, h - (b1.y + b1.h + 40) - 30) };
          var N = 1 + 2 * Math.floor(p * 7.999);
          axes(ctx, b1, -1.5, 1.5, -1.5, 1.5, { ylabel: 'x(t)', xlabel: '', xTicks: 6, yTicks: 2 });
          axes(ctx, b2, 0, 15, 0, 1.4, { xlabel: 'harmonic number n (odd)', ylabel: '|c_n|', xTicks: 8, yTicks: 2 });
          var ideal = [], sum = [];
          for (var i = 0; i <= 600; i++) {
            var t = -1.5 + 3 * i / 600;
            ideal.push(Math.sin(2 * Math.PI * t) >= 0 ? 1 : -1);
            var s = 0;
            for (var n = 1; n <= N; n += 2) s += (4 / (Math.PI * n)) * Math.sin(2 * Math.PI * n * t);
            sum.push(s);
          }
          var ts = ideal.map(function (_, i) { return -1.5 + 3 * i / 600; });
          curve(ctx, b1, ts, ideal, -1.5, 1.5, -1.5, 1.5, P.faint, 1.2, [5, 4]);
          curve(ctx, b1, ts, sum, -1.5, 1.5, -1.5, 1.5, P.lime, 2.2);
          // spectrum bars
          for (n = 1; n <= 15; n += 2) {
            var amp = 4 / (Math.PI * n) * (n <= N ? 1 : 0.18);
            var x = mapX(b2, 0, 15, n);
            var y0 = mapY(b2, 0, 1.4, 0), y1 = mapY(b2, 0, 1.4, amp);
            ctx.save(); ctx.strokeStyle = n <= N ? P.teal : P.faint; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.restore();
          }
          tag(ctx, b1.x + 8, b1.y + 12, 'ideal square', P.faint);
          tag(ctx, b1.x + 96, b1.y + 12, 'N = ' + N + ' harmonics', P.lime);
          title(ctx, 'Fourier series · odd harmonics only · 4/(πn) amplitudes', b1.x, 7, P.ink);
        },
        statusText: function (p) {
          var N = 1 + 2 * Math.floor(p * 7.999);
          return 'N = ' + N + ' odd harmonics; the highest included harmonic is number ' + N + '. Gibbs overshoot remains about 9% of the jump.';
        }
      };
    }
  };

  PROJECTIONS.laplace = {
    title: 'Poles moving across the jω axis',
    blurb: 'A conjugate pole pair moves from the right half-plane to the left. The impulse response grows, oscillates without decay, then decays.',
    aria: 'Animated s-plane pole pair moving left while the corresponding time response changes from growing to decaying oscillation.',
    duration: 12000,
    steps: 12,
    create: function (canvas) {
      var wd = 3;
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, P = palette();
          var leftW = Math.round(w * 0.44) - 12;
          var b1 = { x: 34, y: 24, w: leftW - 34, h: h - 62 };
          var b2 = { x: leftW + 44, y: 24, w: Math.max(80, w - leftW - 60), h: h - 62 };
          axes(ctx, b1, -3.2, 1.2, -4.4, 4.4, { xlabel: 'σ (real part)', ylabel: 'jω', xTicks: 5, yTicks: 5 });
          axes(ctx, b2, 0, 4, -5.5, 5.5, { xlabel: 'time t (s)', ylabel: 'h(t)', xTicks: 4, yTicks: 4 });
          // stable half-plane shading
          ctx.save(); ctx.fillStyle = 'rgba(53,214,191,.06)';
          ctx.fillRect(b1.x, b1.y, mapX(b1, -3.2, 1.2, 0) - b1.x, b1.h); ctx.restore();
          line(ctx, mapX(b1, -3.2, 1.2, 0), b1.y, mapX(b1, -3.2, 1.2, 0), b1.y + b1.h, P.line, 1.3, [4, 4]);
          line(ctx, b1.x, mapY(b1, -4.4, 4.4, 0), b1.x + b1.w, mapY(b1, -4.4, 4.4, 0), P.line, 1.3, [4, 4]);
          var sigma = 0.35 - 2.35 * p;
          var px = mapX(b1, -3.2, 1.2, sigma), py1 = mapY(b1, -4.4, 4.4, wd), py2 = mapY(b1, -4.4, 4.4, -wd);
          ctx.save(); ctx.strokeStyle = P.rose; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px, py1); ctx.lineTo(px, py2); ctx.stroke(); ctx.restore();
          dot(ctx, px, py1, P.rose, 5); dot(ctx, px, py2, P.rose, 5);
          var status = sigma > 0.01 ? 'unstable' : Math.abs(sigma) < 0.01 ? 'marginally stable' : 'stable';
          tag(ctx, b1.x + 6, b1.y + 10, 'poles at σ ± j' + wd, P.rose);
          title(ctx, 'σ = ' + sigma.toFixed(2) + ' · ' + status, b1.x, 4, P.ink);
          // time response
          var xs = [], ys = [];
          for (var i = 0; i <= 500; i++) {
            var t = 4 * i / 500;
            xs.push(t); ys.push(Math.exp(sigma * t) * Math.cos(wd * t));
          }
          curve(ctx, b2, xs, ys, 0, 4, -5.5, 5.5, P.lime, 2.2);
          tag(ctx, b2.x + 6, b2.y + 10, 'h(t) = e^{σt} cos(3t)', P.lime);
        },
        statusText: function (p) {
          var sigma = 0.35 - 2.35 * p;
          var status = sigma > 0.01 ? 'unstable: response grows' : Math.abs(sigma) < 0.01 ? 'marginally stable: constant oscillation' : 'stable: response decays';
          return 'Pole real part ' + sigma.toFixed(2) + '; ' + status + '.';
        }
      };
    }
  };

  PROJECTIONS.ztransform = {
    title: 'One pole, one geometric sequence',
    blurb: 'The pole radius controls h[n] = rⁿ. Inside the unit circle the sequence decays; on the circle it neither grows nor decays; outside it explodes.',
    aria: 'Animated z-plane pole moving through the unit circle with the corresponding geometric sequence changing from growing to decaying.',
    duration: 10000,
    steps: 10,
    create: function (canvas) {
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, P = palette();
          var leftW = Math.round(w * 0.42) - 10;
          var b1 = { x: 24, y: 22, w: leftW - 24, h: h - 58 };
          var b2 = { x: leftW + 44, y: 22, w: Math.max(80, w - leftW - 58), h: h - 58 };
          axes(ctx, b1, -1.6, 1.6, -1.6, 1.6, { xlabel: 'Re z', ylabel: 'Im z', xTicks: 4, yTicks: 4 });
          axes(ctx, b2, 0, 24, 0, 1, { xlabel: 'n', ylabel: 'h[n]', xTicks: 6, yTicks: 2 });
          var cx = mapX(b1, -1.6, 1.6, 0), cy = mapY(b1, -1.6, 1.6, 0), rad = (b1.w / 3.2);
          ctx.save(); ctx.strokeStyle = P.teal; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          var r = 1.18 - 0.78 * p;
          var px = mapX(b1, -1.6, 1.6, r), py = cy;
          dot(ctx, px, py, P.rose, 5);
          line(ctx, cx, cy, px, py, P.line, 1, [3, 3]);
          tag(ctx, b1.x + 4, b1.y + 10, 'unit circle', P.teal);
          title(ctx, 'r = ' + r.toFixed(2) + ' · ' + (r < 1 ? 'stable' : r > 1 ? 'unstable' : 'marginal'), b1.x, 2, P.ink);
          // normalize y axis for the growing case; note scaling
          var maxv = Math.max(1.2, Math.pow(r, 24) * 1.12);
          var xs = [], ys = [];
          for (var n = 0; n <= 24; n++) { xs.push(n); ys.push(Math.pow(r, n)); }
          curve(ctx, b2, xs, ys, 0, 24, 0, maxv, P.lime, 1.4);
          for (n = 0; n <= 24; n++) {
            var x = mapX(b2, 0, 24, n), y0 = mapY(b2, 0, maxv, 0), y1 = mapY(b2, 0, maxv, ys[n]);
            ctx.save(); ctx.strokeStyle = P.lime; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.restore();
            dot(ctx, x, y1, P.lime, 2.1);
          }
          tag(ctx, b2.x + 4, b2.y + 10, 'h[n] = rⁿ u[n]', P.lime);
        },
        statusText: function (p) {
          var r = 1.18 - 0.78 * p;
          return 'Pole radius ' + r.toFixed(2) + ': ' + (r < 1 ? 'inside the unit circle, sequence decays' : r > 1 ? 'outside the unit circle, sequence grows' : 'on the unit circle, constant magnitude') + '.';
        }
      };
    }
  };

  PROJECTIONS.sampling = {
    title: 'Sampling, reconstruction and aliasing',
    blurb: 'Samples follow the continuous wave until the rate drops below twice the frequency. Then the reconstructed wave turns into a slower alias.',
    aria: 'Animated sampling of a sine wave with the sampling rate falling below Nyquist, showing samples and the resulting alias waveform.',
    duration: 12000,
    steps: 12,
    create: function (canvas) {
      var f = 7;
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, P = palette();
          var b = box(w, h, { mt: 28, mb: 46, ml: 46, mr: 18 });
          axes(ctx, b, 0, 1, -1.25, 1.25, { xlabel: 'time (s)', ylabel: 'x(t)', xTicks: 6, yTicks: 4 });
          var fs = 22 - 17 * p;
          var alias = Math.abs(f - Math.round(f / fs) * fs);
          var aliased = fs < 2 * f;
          var xs = [], orig = [], rec = [];
          for (var i = 0; i <= 700; i++) {
            var t = i / 700;
            xs.push(t);
            orig.push(Math.cos(2 * Math.PI * f * t));
            rec.push(Math.cos(2 * Math.PI * (aliased ? alias : f) * t));
          }
          curve(ctx, b, xs, orig, 0, 1, -1.25, 1.25, P.faint, 1.3, [5, 4]);
          curve(ctx, b, xs, rec, 0, 1, -1.25, 1.25, aliased ? P.rose : P.lime, 2.2);
          var nMax = Math.floor(fs);
          for (var n = 0; n <= nMax; n++) {
            var tn = n / fs;
            var y = Math.cos(2 * Math.PI * f * tn);
            var px = mapX(b, 0, 1, tn), py = mapY(b, -1.25, 1.25, y);
            line(ctx, px, mapY(b, -1.25, 1.25, 0), px, py, P.teal, 1.4);
            dot(ctx, px, py, P.teal, 3.4);
          }
          tag(ctx, b.x + 8, b.y + 12, 'original', P.faint);
          tag(ctx, b.x + 76, b.y + 12, aliased ? 'alias' : 'reconstructed', aliased ? P.rose : P.lime);
          tag(ctx, b.x + 200, b.y + 12, 'samples', P.teal);
          title(ctx, 'f = ' + f + ' Hz · f_s = ' + fs.toFixed(1) + ' Hz · Nyquist = ' + (2 * f) + ' Hz', b.x, 6, P.ink);
          if (aliased) {
            tag(ctx, b.x + 8, b.y + b.h - 16, 'ALIASING: f_s < 2f', P.rose);
          }
        },
        statusText: function (p) {
          var fs = 22 - 17 * p;
          var alias = Math.abs(7 - Math.round(7 / fs) * fs);
          return 'Sampling at ' + fs.toFixed(1) + ' Hz ' + (fs >= 14 ? 'is above' : 'is below') + ' the 14 Hz Nyquist rate' + (fs < 14 ? '; the 7 Hz tone appears at ' + alias.toFixed(1) + ' Hz.' : '.');
        }
      };
    }
  };

  PROJECTIONS.state = {
    title: 'A trajectory in the state plane',
    blurb: 'The state vector spirals toward the origin while the two state variables oscillate and decay. Eigenvalues set the shape of the path.',
    aria: 'Animated phase portrait of a stable focus with the state trajectory and the two state variables versus time.',
    duration: 10000,
    steps: 10,
    create: function (canvas) {
      var A11 = -0.6, A12 = 2, A21 = -2, A22 = -0.6;
      var traj = [], x1s = [], x2s = [], ts = [];
      var x1 = 2.2, x2 = 0, dt = 0.01;
      for (var i = 0; i <= 700; i++) {
        var t = i * dt;
        if (i % 5 === 0) { traj.push([x1, x2]); ts.push(t); x1s.push(x1); x2s.push(x2); }
        var d1 = A11 * x1 + A12 * x2, d2 = A21 * x1 + A22 * x2;
        x1 += d1 * dt; x2 += d2 * dt;
      }
      return {
        draw: function (p) {
          var c = prep(canvas); if (!c) return;
          var ctx = c.ctx, w = c.w, h = c.h, P = palette();
          var bw = Math.round(w * 0.46) - 10;
          var b1 = { x: 30, y: 24, w: bw - 30, h: h - 60 };
          var b2 = { x: bw + 48, y: 24, w: Math.max(80, w - bw - 62), h: h - 60 };
          axes(ctx, b1, -2.6, 2.6, -2.6, 2.6, { xlabel: 'x₁', ylabel: 'x₂', xTicks: 5, yTicks: 5 });
          axes(ctx, b2, 0, 7, -2.6, 2.6, { xlabel: 'time t', ylabel: 'states', xTicks: 4, yTicks: 4 });
          var n = Math.max(2, Math.floor(p * (traj.length - 1)));
          ctx.save(); ctx.beginPath(); ctx.strokeStyle = P.lime; ctx.lineWidth = 2;
          for (i = 0; i < n; i++) {
            var px = mapX(b1, -2.6, 2.6, traj[i][0]), py = mapY(b1, -2.6, 2.6, traj[i][1]);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke(); ctx.restore();
          var end = traj[Math.min(n, traj.length - 1)];
          dot(ctx, mapX(b1, -2.6, 2.6, end[0]), mapY(b1, -2.6, 2.6, end[1]), P.rose, 4.4);
          dot(ctx, mapX(b1, -2.6, 2.6, traj[0][0]), mapY(b1, -2.6, 2.6, traj[0][1]), P.teal, 4);
          tag(ctx, b1.x + 6, b1.y + 10, 'state trajectory', P.lime);
          var xs1 = [], xs2 = [], tt = [];
          for (i = 0; i < n; i++) { tt.push(ts[i]); xs1.push(x1s[i]); xs2.push(x2s[i]); }
          curve(ctx, b2, tt, xs1, 0, 7, -2.6, 2.6, P.teal, 2);
          curve(ctx, b2, tt, xs2, 0, 7, -2.6, 2.6, P.amber, 2);
          tag(ctx, b2.x + 6, b2.y + 10, 'x₁(t)', P.teal);
          tag(ctx, b2.x + 60, b2.y + 10, 'x₂(t)', P.amber);
          title(ctx, 'A = [[−0.6, 2], [−2, −0.6]] · eigenvalues −0.6 ± j2', b1.x, 5, P.ink);
        },
        statusText: function (p) {
          return 'Stable focus: eigenvalues −0.6 ± j2 have negative real part, so every trajectory spirals into the origin.';
        }
      };
    }
  };

  root.Viz = {
    palette: palette, prep: prep, box: box, axes: axes, curve: curve, line: line, dot: dot,
    tag: tag, title: title, mapX: mapX, mapY: mapY, ticks: ticks, labelNum: labelNum,
    mountProjection: mountProjection
  };
  root.Labs = root.Labs || {};
  root.Labs.mountProjection = mountProjection;
})();
