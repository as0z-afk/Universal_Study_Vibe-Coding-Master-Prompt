/* ============================================================
   ETE225 — practice bank, modules 3 and 4
   Waves and analog transmission; digital modulation.
   Every item is generated from the governing relationship so
   the numeric key, the distractors and the worked steps agree.
   ============================================================ */
(function () {
  'use strict';
  var B = window.ETE.Bank;
  var h = B.h, n = h.n, mc = h.mc, U = h.withUnit;
  var D = function (x, d) { return n(x, d === undefined ? 3 : d); };

  /* ---------------- Module 3: waves and analog transmission ---------------- */
  var M3 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var f = 2 + (k % 48);
        return mc('A periodic waveform repeats <span class="mono">f = ' + f + ' Hz</span>. What is its period?', U(1 / f, 's', 4),
          [U(f, 's', 2), U(2 / f, 's', 4), U(1 / (2 * f), 's', 4)], {
            concept: 'Period and frequency', type: 'Calculation', rot: k,
            hint: 'Period and frequency are reciprocals: T = 1/f.',
            explain: 'T = 1/f = 1/' + f + ' = ' + D(1 / f, 4) + ' s. One cycle is completed in that time, so the waveform repeats every ' + D(1 / f, 4) + ' s.',
            steps: ['Write T = 1/f.', 'Substitute f = ' + f + ' Hz.', 'T = ' + D(1 / f, 4) + ' s.']
          });
      }
      if (form === 1) {
        var fmhz = 2 + (k % 48), lam = 300 / fmhz;
        return mc('A radio wave travels at <span class="mono">3 × 10⁸ m/s</span> and has a frequency of <span class="mono">' + fmhz + ' MHz</span>. What is its wavelength?', U(lam, 'm', 3),
          [U(fmhz / 300, 'm', 3), U(300 * fmhz, 'm', 3), U(3e8 / fmhz, 'm', 3)], {
            concept: 'Wavelength', type: 'Calculation', rot: k + 1,
            hint: 'λ = v/f. With f in MHz and v = 3×10⁸ m/s, λ = 300/f metres.',
            explain: 'f = ' + fmhz + '×10⁶ Hz. λ = (3×10⁸)/(' + fmhz + '×10⁶) = 300/' + fmhz + ' = ' + D(lam, 3) + ' m.',
            steps: ['Convert MHz to Hz: ' + fmhz + '×10⁶ Hz.', 'λ = v/f.', 'λ = ' + D(lam, 3) + ' m.']
          });
      }
      if (form === 2) {
        var flo = 10 + (k % 60), bw = 5 + (Math.floor(k / 60) % 40);
        var fhi = flo + bw;
        return mc('A channel occupies the band from <span class="mono">' + flo + ' kHz</span> to <span class="mono">' + fhi + ' kHz</span>. What is its bandwidth?', U(bw, 'kHz', 2),
          [U(fhi + flo, 'kHz', 2), U(flo, 'kHz', 2), U(fhi, 'kHz', 2)], {
            concept: 'Bandwidth of a channel', type: 'Calculation', rot: k + 2,
            hint: 'Bandwidth is the width of the occupied range: B = f_high − f_low.',
            explain: 'B = ' + fhi + ' − ' + flo + ' = ' + bw + ' kHz. Bandwidth measures the width of the band, not its absolute position.',
            steps: ['Identify the upper and lower band edges.', 'B = f_high − f_low.', 'B = ' + bw + ' kHz.']
          });
      }
      var d = 20 + (k % 80), v = 2 + (k % 5);
      return mc('A signal travels <span class="mono">' + d + ' km</span> through a medium in which it moves at <span class="mono">' + v + ' × 10⁸ m/s</span>. What is the propagation time?', U(d * 1000 / (v * 1e8), 's', 4),
        [U(d / (v * 1e8), 's', 6), U(v * 1e8 / (d * 1000), 's', 3), U(d * 1000 * v * 1e8, 's', 1)], {
          concept: 'Propagation delay', type: 'Calculation', rot: k + 3,
          hint: 'Convert kilometres to metres, then use t = distance/speed.',
          explain: 'Distance = ' + d + '×10³ m. t = ' + d + '×10³ / (' + v + '×10⁸) = ' + D(d * 1000 / (v * 1e8), 4) + ' s.',
          steps: ['Convert ' + d + ' km to ' + d * 1000 + ' m.', 't = d/v.', 't = ' + D(d * 1000 / (v * 1e8), 4) + ' s.']
        });
    } },

    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var r = 2 + (k % 19), db = 10 * Math.log10(r);
        return mc('An amplifier raises a signal power from <span class="mono">1 mW</span> to <span class="mono">' + r + ' mW</span>. What is the gain in decibels?', U(db, 'dB', 2),
          [U(20 * Math.log10(r), 'dB', 2), U(r, 'dB', 2), U(10 * r, 'dB', 2)], {
            concept: 'Decibel gain', type: 'Calculation', rot: k,
            hint: 'Power gain in dB is 10 log₁₀(P₂/P₁).',
            explain: 'P₂/P₁ = ' + r + ', so G = 10 log₁₀(' + r + ') = ' + D(db, 2) + ' dB. The 20 log form applies to voltage ratios, not power ratios.',
            steps: ['Form the power ratio P₂/P₁ = ' + r + '.', 'Take 10 log₁₀ of the ratio.', 'G = ' + D(db, 2) + ' dB.']
          });
      }
      if (form === 1) {
        var g1 = 3 + (k % 12), g2 = 4 + (Math.floor(k / 12) % 12), g3 = 1 + (Math.floor(k / 144) % 6);
        return mc('Three cascaded amplifiers provide <span class="mono">' + g1 + ' dB</span>, <span class="mono">' + g2 + ' dB</span> and <span class="mono">' + g3 + ' dB</span> of gain. What is the overall gain?', U(g1 + g2 + g3, 'dB', 2),
          [U(g1 * g2 * g3, 'dB', 2), U((g1 + g2 + g3) / 3, 'dB', 2), U(10 * Math.log10(g1 + g2 + g3), 'dB', 2)], {
            concept: 'Cascaded decibel gains', type: 'Calculation', rot: k + 1,
            hint: 'For cascaded blocks, multiply the linear gains, which adds the decibel values.',
            explain: 'The linear gains multiply, so their logarithms add: ' + g1 + ' + ' + g2 + ' + ' + g3 + ' = ' + (g1 + g2 + g3) + ' dB. Multiplying the dB numbers would be meaningless.',
            steps: ['Convert the rule: G_total = G₁G₂G₃ in linear units.', 'Take logarithms: dB values add.', 'G_total = ' + (g1 + g2 + g3) + ' dB.']
          });
      }
      if (form === 2) {
        var fm = 1 + (k % 15), bw = 10 * fm;
        return mc('The course rule for commercial FM gives a transmission bandwidth of <span class="mono">10 × f<sub>m</sub></span>. For a highest modulating frequency of <span class="mono">' + fm + ' kHz</span>, what bandwidth is required?', U(bw, 'kHz', 2),
          [U(2 * fm, 'kHz', 2), U(fm, 'kHz', 2), U(20 * fm, 'kHz', 2)], {
            concept: 'FM bandwidth rule', type: 'Application', rot: k + 2,
            hint: 'Use the rule stated in this course: BW_t = 10 × BW_m.',
            explain: 'BW_t = 10 × ' + fm + ' = ' + bw + ' kHz. The factor 10 is the course rule for FM; AM would need only 2f_m.',
            steps: ['Identify f_m = ' + fm + ' kHz.', 'Apply BW_t = 10f_m.', 'BW_t = ' + bw + ' kHz.']
          });
      }
      var fc = 88 + (k % 20), fm2 = 1 + (Math.floor(k / 20) % 12);
      return mc('An AM station transmits a <span class="mono">' + fc + ' MHz</span> carrier modulated by a <span class="mono">' + fm2 + ' kHz</span> tone. What is the transmission bandwidth?', U(2 * fm2, 'kHz', 2),
        [U(fm2, 'kHz', 2), U(fc + fm2, 'kHz', 2), U(10 * fm2, 'kHz', 2)], {
          concept: 'AM bandwidth', type: 'Application', rot: k + 3,
          hint: 'DSB-AM produces an upper and a lower sideband, each f_m away from the carrier.',
          explain: 'The sidebands lie at ' + fc + ' MHz ± ' + fm2 + ' kHz, so the occupied width is 2f_m = ' + (2 * fm2) + ' kHz.',
          steps: ['Upper sideband: f_c + f_m.', 'Lower sideband: f_c − f_m.', 'Bandwidth = (f_c + f_m) − (f_c − f_m) = 2f_m = ' + (2 * fm2) + ' kHz.']
        });
    } },

    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var emin = 2 + (k % 9), emax = emin + 2 + (Math.floor(k / 9) % 8), m = (emax - emin) / (emax + emin);
        return mc('An AM envelope reaches <span class="mono">E<sub>max</sub> = ' + emax + ' V</span> and <span class="mono">E<sub>min</sub> = ' + emin + ' V</span>. What is the modulation index?', D(m, 3),
          [D((emax - emin) / (emax + emin) * 0.5, 3), D((emax + emin) / (emax - emin), 3), D(emax / emin, 3)], {
            concept: 'AM modulation index', type: 'Calculation', rot: k,
            hint: 'm = (E_max − E_min)/(E_max + E_min).',
            explain: 'm = (' + emax + ' − ' + emin + ')/(' + emax + ' + ' + emin + ') = ' + (emax - emin) + '/' + (emax + emin) + ' = ' + D(m, 3) + '. Since 0 < m < 1 the envelope never crosses zero and the signal is not overmodulated.',
            steps: ['Read E_max and E_min from the envelope.', 'Form the difference and the sum.', 'm = ' + D(m, 3) + ', which is below 1.']
          });
      }
      if (form === 1) {
        var m2 = (2 + (k % 8)) / 10, pc = 10 + 5 * (k % 12), pt = pc * (1 + m2 * m2 / 2);
        return mc('An AM transmitter radiates <span class="mono">' + pc + ' kW</span> of carrier power with a modulation index of <span class="mono">' + m2 + '</span>. What is the total transmitted power?', U(pt, 'kW', 3),
          [U(pc * (1 + m2), 'kW', 3), U(pc * m2 * m2 / 2, 'kW', 3), U(pc, 'kW', 3)], {
            concept: 'AM power distribution', type: 'Calculation', rot: k + 1,
            hint: 'P_total = P_c(1 + m²/2). The two sidebands together carry P_c m²/2.',
            explain: 'm²/2 = ' + D(m2 * m2 / 2, 4) + ', so P_total = ' + pc + '(1 + ' + D(m2 * m2 / 2, 4) + ') = ' + D(pt, 3) + ' kW. At m = 1 the sidebands carry half the carrier power.',
            steps: ['Compute m²/2 = ' + D(m2 * m2 / 2, 4) + '.', 'Add 1 for the carrier.', 'Multiply by P_c = ' + pc + ' kW: ' + D(pt, 3) + ' kW.']
          });
      }
      if (form === 2) {
        var df = 4 + (k % 36), fm3 = 1 + (Math.floor(k / 36) % 9);
        var ratio = df / fm3;
        return mc('An FM signal has a peak deviation of <span class="mono">' + df + ' kHz</span> and a highest modulating frequency of <span class="mono">' + fm3 + ' kHz</span>. What is the deviation ratio?', D(ratio, 3),
          [D(fm3 / df, 3), D(2 * df / fm3, 3), D(df * fm3, 3)], {
            concept: 'FM deviation ratio', type: 'Calculation', rot: k + 2,
            hint: 'Deviation ratio D = Δf / f_m, where Δf is the peak frequency deviation.',
            explain: 'D = ' + df + '/' + fm3 + ' = ' + D(ratio, 3) + '. A large ratio means a wideband FM signal with better noise immunity but a larger bandwidth.',
            steps: ['Identify Δf = ' + df + ' kHz and f_m = ' + fm3 + ' kHz.', 'Divide: D = Δf/f_m.', 'D = ' + D(ratio, 3) + '.']
          });
      }
      var fc2 = 100 + (k % 80), fm4 = 1 + (Math.floor(k / 80) % 14);
      return mc('A carrier at <span class="mono">' + fc2 + ' kHz</span> is amplitude modulated by a <span class="mono">' + fm4 + ' kHz</span> tone. Which pair of frequencies appears as the sidebands?', (fc2 - fm4) + ' kHz and ' + (fc2 + fm4) + ' kHz',
        [(fc2) + ' kHz and ' + (fc2 + fm4) + ' kHz', (fc2 - fm4) + ' kHz and ' + (fc2) + ' kHz', (fc2 - 2 * fm4) + ' kHz and ' + (fc2 + 2 * fm4) + ' kHz'], {
          concept: 'AM sideband placement', type: 'Interpretation', rot: k + 3,
          hint: 'DSB-AM creates exactly two sidebands at f_c ± f_m.',
          explain: 'The upper sideband is f_c + f_m = ' + (fc2 + fm4) + ' kHz and the lower is f_c − f_m = ' + (fc2 - fm4) + ' kHz. The carrier itself remains at ' + fc2 + ' kHz.',
          steps: ['Add the modulating frequency to the carrier.', 'Subtract it for the lower sideband.', 'The pair is ' + (fc2 - fm4) + ' kHz and ' + (fc2 + fm4) + ' kHz.']
        });
    } },

    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var pc2 = 4 + (k % 30), m4 = (2 + (Math.floor(k / 30) % 8)) / 10;
        var psb = pc2 * m4 * m4 / 2, pct = 100 * psb / (pc2 + psb);
        return mc('For an AM signal with carrier power <span class="mono">' + pc2 + ' kW</span> and modulation index <span class="mono">' + m4 + '</span>, what percentage of the total power is carried by both sidebands together?', D(pct, 2) + '%',
          [D(100 * m4, 2) + '%', D(100 * m4 * m4 / 4, 2) + '%', D(100 / (1 + m4 * m4), 2) + '%'], {
            concept: 'AM power efficiency', type: 'Analysis', rot: k,
            hint: 'Sideband power is P_c m²/2 and total power is P_c(1 + m²/2).',
            explain: 'P_side = ' + D(psb, 3) + ' kW and P_total = ' + D(pc2 + psb, 3) + ' kW. The ratio is ' + D(pct, 2) + '%. Even at m = 1 the unmodulated carrier wastes two thirds of the power.',
            steps: ['P_side = P_c m²/2 = ' + D(psb, 3) + ' kW.', 'P_total = ' + D(pc2 + psb, 3) + ' kW.', 'Percentage = ' + D(pct, 2) + '%.']
          });
      }
      if (form === 1) {
        var pc3 = 8 + (k % 40), m5 = (2 + (Math.floor(k / 40) % 8)) / 10;
        var save = pc3 * (1 + m5 * m5 / 4);
        return mc('A DSB-AM transmitter with carrier power <span class="mono">' + pc3 + ' kW</span> and modulation index <span class="mono">' + m5 + '</span> is replaced by SSB that sends only the upper sideband. How much total power is saved?', U(save, 'kW', 3),
          [U(pc3 * m5 * m5 / 4, 'kW', 3), U(pc3 * m5 * m5 / 2, 'kW', 3), U(pc3, 'kW', 3)], {
            concept: 'SSB power saving', type: 'Analysis', rot: k + 1,
            hint: 'DSB total is P_c(1 + m²/2); SSB sends one sideband of power P_c m²/4.',
            explain: 'P_DSB = ' + D(pc3 * (1 + m5 * m5 / 2), 3) + ' kW and P_SSB = ' + D(pc3 * m5 * m5 / 4, 3) + ' kW. The difference is ' + D(save, 3) + ' kW, made up of the whole carrier plus one sideband.',
            steps: ['P_DSB = P_c(1 + m²/2).', 'P_SSB = P_c m²/4.', 'Saving = ' + D(save, 3) + ' kW.']
          });
      }
      if (form === 2) {
        var spacing = 100 + 50 * (k % 6), fmax = 5 + (Math.floor(k / 6) % 11);
        var need = 10 * fmax;
        return mc('An FM broadcast channel is allocated <span class="mono">' + spacing + ' kHz</span>. Using the course rule BW = 10 f_m, what is the largest modulating frequency that fits with no guard band?', U(spacing / 10, 'kHz', 2),
          [U(spacing / 2, 'kHz', 2), U(spacing, 'kHz', 2), U(spacing / 20, 'kHz', 2)], {
            concept: 'FM channel design', type: 'Design', rot: k + 2,
            hint: 'Invert the bandwidth rule: f_m = BW/10.',
            explain: 'f_m = ' + spacing + '/10 = ' + D(spacing / 10, 2) + ' kHz. A 15 kHz audio signal would need ' + (10 * 15) + ' kHz, so this channel is comfortable for it.',
            steps: ['Start from BW = 10f_m.', 'Rearrange: f_m = BW/10.', 'f_m = ' + D(spacing / 10, 2) + ' kHz.']
          });
      }
      var emin2 = 1 + (k % 6), emax2 = emin2 * (3 + (Math.floor(k / 6) % 6)) / 1;
      return mc('An AM envelope is measured with <span class="mono">E<sub>max</sub> = ' + (emin2 + emax2) + ' V</span> and <span class="mono">E<sub>min</sub> = ' + emin2 + ' V</span>. What is the modulation index and the envelope condition?', D((emax2) / (emax2 + 2 * emin2), 3) + ', undermodulated',
        [D((emax2) / (emax2 + 2 * emin2), 3) + ', overmodulated', D(emax2 / (emin2 + emax2), 3) + ', undermodulated', '1, critically modulated'], {
          concept: 'Modulation index limits', type: 'Analysis', rot: k + 3,
          hint: 'Use m = (E_max − E_min)/(E_max + E_min) with the actual envelope values.',
          explain: 'With E_max = ' + (emin2 + emax2) + ' and E_min = ' + emin2 + ', m = ' + emax2 + '/' + (emax2 + 2 * emin2) + ' = ' + D(emax2 / (emax2 + 2 * emin2), 3) + '. Because m < 1 the envelope never reaches zero and the signal is not overmodulated.',
          steps: ['E_max − E_min = ' + emax2 + '.', 'E_max + E_min = ' + (emax2 + 2 * emin2) + '.', 'm < 1, so the envelope is intact.']
        });
    } }
  };

  /* ---------------- Module 4: digital modulation ---------------- */
  var M4 = {
    Intermediate: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var m = Math.pow(2, 2 + (k % 5)), rs = 1 + (k % 30), rb = rs * (2 + (k % 5));
        return mc('A <span class="mono">' + m + '-ary</span> modem runs at <span class="mono">' + rs + ' kbaud</span>. If it carries <span class="mono">' + D(Math.log2(m), 0) + '</span> bits per symbol, what is the bit rate?', U(rs * Math.log2(m), 'kbps', 2),
          [U(rs, 'kbps', 2), U(rs * m, 'kbps', 2), U(rs / Math.log2(m), 'kbps', 2)], {
            concept: 'Bit rate from symbol rate', type: 'Calculation', rot: k,
            hint: 'R_b = R_s × bits per symbol = R_s log₂M.',
            explain: 'Each symbol carries log₂' + m + ' = ' + D(Math.log2(m), 0) + ' bits. At ' + rs + ' kbaud the bit rate is ' + rs + '×' + D(Math.log2(m), 0) + ' = ' + D(rs * Math.log2(m), 2) + ' kbps.',
            steps: ['Find bits per symbol: ' + D(Math.log2(m), 0) + '.', 'Multiply by the symbol rate.', 'R_b = ' + D(rs * Math.log2(m), 2) + ' kbps.']
          });
      }
      if (form === 1) {
        var m2 = Math.pow(2, 1 + (k % 6)), rb2 = 4 + (k % 60), bits2 = Math.log2(m2), rs2 = rb2 / bits2;
        return mc('A <span class="mono">' + m2 + '-ary</span> link must carry <span class="mono">' + rb2 + ' kbps</span>. What symbol rate is required?', U(rs2, 'kbaud', 3),
          [U(rb2, 'kbaud', 3), U(rb2 * bits2, 'kbaud', 3), U(rb2 / m2, 'kbaud', 3)], {
            concept: 'Symbol rate requirement', type: 'Application', rot: k + 1,
            hint: 'Divide the bit rate by the number of bits each symbol carries.',
            explain: 'M = ' + m2 + ' gives ' + bits2 + ' bits/symbol, so R_s = ' + rb2 + '/' + bits2 + ' = ' + D(rs2, 3) + ' kbaud. The symbol rate is always below the bit rate when M > 2.',
            steps: ['bits/symbol = log₂' + m2 + ' = ' + bits2 + '.', 'R_s = R_b/bits.', 'R_s = ' + D(rs2, 3) + ' kbaud.']
          });
      }
      if (form === 2) {
        var base = 10 + 5 * (k % 15), sym = ['00', '01', '10', '11'][k % 4];
        var idx = ['00', '01', '10', '11'].indexOf(sym);
        var ph = base + idx * 90;
        return mc('A QPSK mapper uses Gray-coded phases starting at <span class="mono">' + base + '°</span> for <span class="mono">00</span>, increasing by 90° for each successive symbol. Which phase represents <span class="mono">' + sym + '</span>?', ph + '°',
          [(base + ((idx + 1) % 4) * 90) + '°', (base + ((idx + 3) % 4) * 90) + '°', (base + 180) + '°'], {
            concept: 'QPSK constellation mapping', type: 'Interpretation', rot: k + 2,
            hint: 'Walk around the constellation in the stated order: 00, 01, 10, 11, adding 90° each step.',
            explain: 'Starting at ' + base + '°, the symbols 00, 01, 10, 11 sit at ' + base + '°, ' + (base + 90) + '°, ' + (base + 180) + '° and ' + (base + 270) + '°. The symbol ' + sym + ' is index ' + idx + ', so its phase is ' + ph + '°.',
            steps: ['List the four phases: ' + base + '°, ' + (base + 90) + '°, ' + (base + 180) + '°, ' + (base + 270) + '°.', 'Locate ' + sym + ' at position ' + idx + '.', 'Phase = ' + ph + '°.']
          });
      }
      var fc = 12 + 13 * (k % 17), df = 1 + (k % 8);
      return mc('A binary FSK transmitter uses <span class="mono">f<sub>1</sub> = ' + fc + ' kHz</span> for bit 0 and <span class="mono">f<sub>2</sub> = ' + (fc + df) + ' kHz</span> for bit 1. What is the frequency separation?', U(df, 'kHz', 2),
        [U(fc + df, 'kHz', 2), U(2 * df, 'kHz', 2), U(df / 2, 'kHz', 2)], {
          concept: 'FSK tone spacing', type: 'Calculation', rot: k + 3,
          hint: 'Subtract the two tone frequencies.',
          explain: 'Δf = ' + (fc + df) + ' − ' + fc + ' = ' + df + ' kHz. Orthogonal FSK needs at least 1/(2T_b) separation; wider spacing costs bandwidth.',
          steps: ['Identify f₁ and f₂.', 'Δf = |f₂ − f₁|.', 'Δf = ' + df + ' kHz.']
        });
    } },

    'Semi-hard': { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var m = 2 + (k % 14), bits = Math.log2(m), rs = 1 + (k % 30), rb = rs * bits;
        return mc('A symbol rate of <span class="mono">' + rs + ' kbaud</span> is used with <span class="mono">' + m + '</span> levels. What bit rate results?', U(rb, 'kbps', 2),
          [U(rs, 'kbps', 2), U(rs * m, 'kbps', 2), U(rs / bits, 'kbps', 2)], {
            concept: 'M-ary bit rate', type: 'Calculation', rot: k,
            hint: 'R_b = R_s log₂M.',
            explain: 'log₂' + m + ' = ' + D(bits, 3) + '. R_b = ' + rs + '×' + D(bits, 3) + ' = ' + D(rb, 2) + ' kbps. Non-power-of-two M is avoided in practice because it wastes constellation capacity.',
            steps: ['Compute log₂M = ' + D(bits, 3) + '.', 'Multiply by the symbol rate.', 'R_b = ' + D(rb, 2) + ' kbps.']
          });
      }
      if (form === 1) {
        var rb2 = 4 + (k % 60), bits2 = 1 + (k % 4), m2 = Math.pow(2, bits2), rs2 = rb2 / bits2;
        return mc('An <span class="mono">' + m2 + '-ary</span> link must carry <span class="mono">' + rb2 + ' kbps</span>. What symbol rate is required?', U(rs2, 'kbaud', 3),
          [U(rb2, 'kbaud', 3), U(rb2 * bits2, 'kbaud', 3), U(rb2 / m2, 'kbaud', 3)], {
            concept: 'Symbol rate requirement', type: 'Application', rot: k + 1,
            hint: 'Divide the bit rate by the number of bits carried per symbol.',
            explain: 'M = ' + m2 + ' gives ' + bits2 + ' bits/symbol, so R_s = ' + rb2 + '/' + bits2 + ' = ' + D(rs2, 3) + ' kbaud. If the channel is bandlimited, this symbol rate sets the minimum bandwidth.',
            steps: ['bits/symbol = ' + bits2 + '.', 'R_s = R_b/bits.', 'R_s = ' + D(rs2, 3) + ' kbaud.']
          });
      }
      if (form === 2) {
        var rb3 = 10 + (k % 50), bw = 2 * rb3;
        return mc('A binary ASK signal has a bit rate of <span class="mono">' + rb3 + ' kbps</span>. Using the double-sideband rule, what bandwidth is needed?', U(bw, 'kHz', 2),
          [U(rb3, 'kHz', 2), U(rb3 / 2, 'kHz', 2), U(4 * rb3, 'kHz', 2)], {
            concept: 'ASK bandwidth', type: 'Application', rot: k + 2,
            hint: 'Binary ASK with rectangular pulses occupies twice the bit rate: B = 2R_b.',
            explain: 'B = 2 × ' + rb3 + ' = ' + bw + ' kHz. The factor two appears because both sidebands of the carrier carry the same information.',
            steps: ['Identify R_b = ' + rb3 + ' kbps.', 'Apply B = 2R_b.', 'B = ' + bw + ' kHz.']
          });
      }
      var rb4 = 6 + (k % 40), m4 = Math.pow(2, 1 + (k % 5)), bits4 = Math.log2(m4), bw4 = rb4 / (2 * bits4);
      return mc('An M-ary system with <span class="mono">' + m4 + '</span> levels carries <span class="mono">' + rb4 + ' kbps</span>. What is the minimum Nyquist bandwidth for baseband transmission?', U(bw4, 'kHz', 3),
        [U(2 * rb4, 'kHz', 3), U(rb4, 'kHz', 3), U(bw4 * 2, 'kHz', 3)], {
          concept: 'Bandwidth efficiency', type: 'Analysis', rot: k + 3,
          hint: 'Baseband Nyquist bandwidth is half the symbol rate: B = R_s/2 = R_b/(2 log₂M).',
          explain: 'R_s = ' + D(rb4 / bits4, 3) + ' kbaud, and B_min = R_s/2 = ' + D(bw4, 3) + ' kHz. More levels reduce the bandwidth needed but require a larger SNR.',
          steps: ['Compute bits/symbol: ' + D(bits4, 3) + '.', 'Find R_s = R_b/log₂M.', 'Halve it for baseband Nyquist: ' + D(bw4, 3) + ' kHz.']
        });
    } },

    Hard: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var rb = 20 + 4 * (k % 20), bits = 1 + (k % 4), ts = bits / rb;
        return mc('A <span class="mono">' + Math.pow(2, bits) + '-ary</span> link runs at <span class="mono">' + rb + ' kbps</span>. What is the symbol duration?', U(ts * 1000, 'µs', 3),
          [U(bits / (rb * 1000), 's', 6), U(1 / (rb * 1000), 's', 6), U(bits * 1000 / rb, 'µs', 3)], {
            concept: 'Symbol duration', type: 'Calculation', rot: k,
            hint: 'T_s = 1/R_s and R_s = R_b/log₂M.',
            explain: 'R_s = ' + rb + '/' + bits + ' = ' + D(rb / bits, 3) + ' kbaud. T_s = 1/R_s = ' + D(ts * 1000, 3) + ' µs. Each symbol lasts ' + D(ts * 1000, 3) + ' µs regardless of how many bits it carries.',
            steps: ['R_s = R_b/log₂M = ' + D(rb / bits, 3) + ' kbaud.', 'T_s = 1/R_s = ' + D(ts * 1000, 3) + ' µs.', 'Check: ' + D(rb / bits, 3) + ' kbaud × ' + D(ts * 1000, 3) + ' µs = 1.']
          });
      }
      if (form === 1) {
        var rb2 = 8 + 2 * (k % 30), m2 = Math.pow(2, 1 + (k % 4)), bw2 = rb2 / Math.log2(m2);
        return mc('An <span class="mono">' + m2 + '-QAM</span> signal at <span class="mono">' + rb2 + ' Mbps</span> is shaped with a raised cosine of roll-off 1. What bandwidth is required?', U(bw2, 'MHz', 3),
          [U(2 * rb2, 'MHz', 3), U(bw2 / 2, 'MHz', 3), U(rb2, 'MHz', 3)], {
            concept: 'Modulated bandwidth with roll-off', type: 'Design', rot: k + 1,
            hint: 'For a raised-cosine pulse with roll-off α, B = (1 + α)R_s/2; with α = 1 this equals R_s.',
            explain: 'R_s = ' + D(rb2 / Math.log2(m2), 3) + ' Mbaud. With α = 1, B = (1 + 1)R_s/2 = R_s = ' + D(bw2, 3) + ' MHz.',
            steps: ['Compute R_s = R_b/log₂M.', 'Apply B = (1 + α)R_s/2 with α = 1.', 'B = ' + D(bw2, 3) + ' MHz.']
          });
      }
      if (form === 2) {
        var rb3 = 16 + (k % 40), m3 = Math.pow(2, 2 + (k % 3)), bw3 = rb3 / Math.log2(m3);
        return mc('A <span class="mono">' + m3 + '-ary</span> system carries <span class="mono">' + rb3 + ' kbps</span> through an ideal Nyquist channel with no excess bandwidth. What is the minimum passband bandwidth?', U(bw3, 'kHz', 3),
          [U(2 * bw3, 'kHz', 3), U(rb3, 'kHz', 3), U(bw3 / 2, 'kHz', 3)], {
            concept: 'Nyquist passband bandwidth', type: 'Analysis', rot: k + 2,
            hint: 'Passband Nyquist bandwidth equals the symbol rate; baseband Nyquist bandwidth is half of it.',
            explain: 'R_s = ' + D(rb3 / Math.log2(m3), 3) + ' kbaud. For passband transmission B_min = R_s = ' + D(bw3, 3) + ' kHz. The same signal in baseband would need only half.',
            steps: ['Divide the bit rate by bits/symbol.', 'For passband, B_min = R_s.', 'B_min = ' + D(bw3, 3) + ' kHz.']
          });
      }
      var m4 = Math.pow(2, 1 + (k % 4)), rb4 = 10 + (k % 50);
      return mc('A system uses <span class="mono">' + m4 + '</span> levels at a bit rate of <span class="mono">' + rb4 + ' kbps</span>. How many symbols are sent per second?', U(rb4 / Math.log2(m4), 'kbaud', 3),
        [U(rb4, 'kbaud', 3), U(rb4 * Math.log2(m4), 'kbaud', 3), U(rb4 / m4, 'kbaud', 3)], {
          concept: 'Symbols per second', type: 'Calculation', rot: k + 3,
          hint: 'Each symbol carries log₂M bits, so divide the bit rate by that number.',
          explain: 'log₂' + m4 + ' = ' + D(Math.log2(m4), 3) + ', so R_s = ' + rb4 + '/' + D(Math.log2(m4), 3) + ' = ' + D(rb4 / Math.log2(m4), 3) + ' kbaud. The symbol rate is lower than the bit rate whenever M > 2.',
          steps: ['bits/symbol = log₂' + m4 + ' = ' + D(Math.log2(m4), 3) + '.', 'R_s = R_b/bits.', 'R_s = ' + D(rb4 / Math.log2(m4), 3) + ' kbaud.']
        });
    } },

    Tricky: { make: function (v) {
      var form = v % 4, k = Math.floor(v / 4);
      if (form === 0) {
        var m1 = Math.pow(2, 1 + (k % 4)), m2 = Math.pow(2, 3 + (Math.floor(k / 4) % 4)), rs = 1 + (Math.floor(k / 16) % 20);
        var b1 = Math.log2(m1), b2 = Math.log2(m2), diff = rs * (b2 - b1);
        return mc('Two schemes share a symbol rate of <span class="mono">' + rs + ' kbaud</span>: <span class="mono">' + m1 + '-ary</span> and <span class="mono">' + m2 + '-ary</span>. How many more kilobits per second does the higher-order scheme deliver?', U(diff, 'kbps', 2),
          [U(rs * b2, 'kbps', 2), U(rs * (m2 - m1), 'kbps', 2), U(diff / 2, 'kbps', 2)], {
            concept: 'Comparing modulation orders', type: 'Analysis', rot: k,
            hint: 'At a fixed symbol rate, the extra bit rate is R_s(log₂M₂ − log₂M₁).',
            explain: 'The two schemes carry ' + b1 + ' and ' + b2 + ' bits per symbol, a difference of ' + (b2 - b1) + ' bits. At ' + rs + ' kbaud that is ' + diff + ' kbps extra.',
            steps: ['bits/symbol: ' + b1 + ' and ' + b2 + '.', 'Difference: ' + (b2 - b1) + ' bits per symbol.', 'Multiply by ' + rs + ' kbaud: ' + diff + ' kbps.']
          });
      }
      if (form === 1) {
        var m3 = Math.pow(2, 2 + (k % 4)), eav = 2 + (Math.floor(k / 4) % 20), dmin = Math.sqrt(6 * eav / (m3 - 1));
        return mc('A square <span class="mono">' + m3 + '-QAM</span> constellation has average symbol energy <span class="mono">' + eav + ' mJ</span>. What is the minimum Euclidean distance between adjacent constellation points?', U(dmin, '√mJ', 3),
          [U(Math.sqrt(2 * eav / (m3 - 1)), '√mJ', 3), U(Math.sqrt(6 * eav / m3), '√mJ', 3), U(dmin * 2, '√mJ', 3)], {
            concept: 'QAM constellation distance', type: 'Proof', rot: k + 1,
            hint: 'For square M-QAM, average energy E_avg = (M − 1)d²/6. Solve for d.',
            explain: 'd = √(6E_avg/(M−1)) = √(6×' + eav + '/' + (m3 - 1) + ') = ' + D(dmin, 3) + ' √mJ. Higher M shrinks d, so the receiver needs a larger SNR to keep the same error rate.',
            steps: ['Use E_avg = (M−1)d²/6.', 'Rearrange: d = √(6E_avg/(M−1)).', 'd = ' + D(dmin, 3) + ' √mJ.']
          });
      }
      if (form === 2) {
        var rb = 12 + (k % 52), m4 = Math.pow(2, 2 + (k % 2)), rs = rb / Math.log2(m4);
        return mc('A <span class="mono">' + m4 + '-QAM</span> link at <span class="mono">' + rb + ' kbps</span> is compared with binary PSK at the same bit rate. Both use ideal Nyquist filtering in passband. What is the bandwidth ratio B_QAM : B_BPSK?', '1 : ' + Math.log2(m4),
          ['1 : 1', Math.log2(m4) + ' : 1', '1 : ' + m4], {
            concept: 'Bandwidth efficiency comparison', type: 'Analysis', rot: k + 2,
            hint: 'Passband Nyquist bandwidth equals the symbol rate; QAM sends log₂M bits per symbol.',
            explain: 'QAM symbol rate is ' + D(rs, 3) + ' kbaud and BPSK symbol rate is ' + rb + ' kbaud. The ratio is ' + D(rs, 3) + ' : ' + rb + ' = 1 : ' + Math.log2(m4) + '.',
            steps: ['R_s(QAM) = R_b/log₂M = ' + D(rs, 3) + ' kbaud.', 'R_s(BPSK) = R_b = ' + rb + ' kbaud.', 'Bandwidth ratio = 1 : ' + Math.log2(m4) + '.']
          });
      }
      var eb = 1 + (k % 20), n0 = 1 + (Math.floor(k / 20) % 15), beta = 1 + (Math.floor(k / 300) % 4), snr = beta * eb / n0;
      return mc('A coherent BPSK link has <span class="mono">E<sub>b</sub>/N<sub>0</sub> = ' + D(eb / n0, 3) + '</span>. The receiver filter has bandwidth <span class="mono">B = R<sub>b</sub>/' + beta + '</span>. What is the resulting SNR?', D(snr, 3),
        [D(eb / n0, 3), D(snr / beta, 3), D(snr * beta, 3)], {
          concept: 'Eb/N0 versus SNR', type: 'Analysis', rot: k + 3,
          hint: 'SNR = (E_b/N₀)(R_b/B). A narrower filter reduces noise and raises SNR.',
          explain: 'SNR = (E_b/N₀) × (R_b/B). With B = R_b/' + beta + ', R_b/B = ' + beta + ', so SNR = ' + beta + ' × ' + D(eb / n0, 3) + ' = ' + D(snr, 3) + '.',
          steps: ['Signal power = E_bR_b.', 'Noise power = N₀B.', 'SNR = (E_b/N₀)(R_b/B) = ' + D(snr, 3) + '.']
        });
    } }
  };

  B.addFamilies({ 3: M3, 4: M4 });
})();
