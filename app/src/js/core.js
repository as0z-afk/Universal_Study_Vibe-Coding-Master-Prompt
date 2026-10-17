/* ============================================================
   ETE225 — core application
   Routing, preferences, navigation, search, progress, checkpoints.
   No external dependencies, no eval, no network.
   ============================================================ */
(function () {
  'use strict';

  var DATA = JSON.parse(document.getElementById('course-data').textContent);
  var COURSE = DATA.course;
  var MODULES = COURSE.modules;
  var GLOSSARY = DATA.glossary;
  var FORMULAS = DATA.formulas;
  var ABBREVIATIONS = DATA.abbreviations;

  var STORAGE_KEY = 'ete225.progress.v1';
  var APP_ID = 'ETE225';
  var VERSION = 1;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var escapeHTML = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var escapeRegExp = function (s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  var stripTags = function (s) { var d = document.createElement('div'); d.innerHTML = s; return d.textContent || ''; };
  var fmt = function (n, d) {
    if (!isFinite(n)) return String(n);
    return Number(n).toFixed(d === undefined ? 2 : d).replace(/\.?0+$/, function (m) { return m.indexOf('.') === 0 ? '' : m; });
  };
  var debounce = function (fn, ms) {
    var t = 0;
    return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  };

  /* ---------------- storage ---------------- */
  var storageOK = (function () {
    try {
      var k = '__ete_test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();
  var memoryStore = {};

  function rawGet(key) {
    if (storageOK) { try { return localStorage.getItem(key); } catch (e) { return memoryStore[key] || null; } }
    return memoryStore[key] || null;
  }
  function rawSet(key, val) {
    if (storageOK) { try { localStorage.setItem(key, val); return true; } catch (e) { /* fall through */ } }
    memoryStore[key] = val;
    return false;
  }

  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') {
      return '{' + Object.keys(value).sort().map(function (k) {
        return JSON.stringify(k) + ':' + canonical(value[k]);
      }).join(',') + '}';
    }
    return JSON.stringify(value);
  }
  function checksum(obj) {
    var s = canonical(obj);
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  var DEFAULT_PREFS = { theme: 'system', mode: 'standard', text: 100, motion: 'full', pin: false };
  function defaultState() {
    return {
      app: APP_ID,
      version: VERSION,
      updated: null,
      prefs: Object.assign({}, DEFAULT_PREFS),
      modules: {},
      bank: { attempted: {} },
      labs: {},
      lastModule: null,
      checksum: ''
    };
  }

  function sanitizeState(src) {
    var base = defaultState();
    if (!src || typeof src !== 'object') return base;
    var prefs = src.prefs && typeof src.prefs === 'object' ? src.prefs : {};
    if (['system', 'dark', 'light'].indexOf(prefs.theme) >= 0) base.prefs.theme = prefs.theme;
    if (['standard', 'beginner', 'deep', 'simple', 'revision'].indexOf(prefs.mode) >= 0) base.prefs.mode = prefs.mode;
    if (typeof prefs.text === 'number' && isFinite(prefs.text)) base.prefs.text = clamp(Math.round(prefs.text), 85, 150);
    if (['full', 'reduce'].indexOf(prefs.motion) >= 0) base.prefs.motion = prefs.motion;
    base.prefs.pin = !!prefs.pin;
    if (typeof src.lastModule === 'number' && src.lastModule >= 1 && src.lastModule <= MODULES.length) base.lastModule = src.lastModule;
    if (src.modules && typeof src.modules === 'object') {
      Object.keys(src.modules).forEach(function (k) {
        if (!/^[1-9]$/.test(k)) return;
        var m = src.modules[k];
        if (!m || typeof m !== 'object') return;
        var rec = { visited: !!m.visited, lab: !!m.lab };
        if (m.checkpoint && typeof m.checkpoint === 'object') {
          var score = Number(m.checkpoint.score);
          rec.checkpoint = {
            done: !!m.checkpoint.done,
            score: isFinite(score) ? clamp(Math.round(score), 0, 5) : 0,
            answered: isFinite(Number(m.checkpoint.answered)) ? clamp(Math.round(Number(m.checkpoint.answered)), 0, 5) : 0
          };
        }
        if (m.sections && typeof m.sections === 'object') {
          rec.sections = {};
          Object.keys(m.sections).slice(0, 40).forEach(function (sid) {
            if (/^[a-z0-9-]{1,40}$/i.test(sid)) rec.sections[sid] = true;
          });
        }
        base.modules[k] = rec;
      });
    }
    if (src.bank && src.bank.attempted && typeof src.bank.attempted === 'object') {
      var ids = Object.keys(src.bank.attempted).slice(0, 8000);
      ids.forEach(function (id) {
        if (!/^m[1-9]-[ISHT]-\d{3,4}$/.test(id)) return;
        var a = src.bank.attempted[id];
        if (a && typeof a === 'object') {
          base.bank.attempted[id] = { correct: !!a.correct, t: isFinite(Number(a.t)) ? Number(a.t) : null };
        }
      });
    }
    if (src.labs && typeof src.labs === 'object') {
      Object.keys(src.labs).slice(0, 9).forEach(function (k) {
        if (/^[1-9]$/.test(k) && isFinite(Number(src.labs[k]))) base.labs[k] = clamp(Math.round(Number(src.labs[k])), 0, 9999);
      });
    }
    return base;
  }

  var state;
  (function loadState() {
    var raw = rawGet(STORAGE_KEY);
    if (!raw) { state = defaultState(); return; }
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.app !== APP_ID || parsed.version !== VERSION) { state = defaultState(); return; }
      var sum = parsed.checksum;
      var copy = Object.assign({}, parsed);
      delete copy.checksum;
      if (sum && checksum(copy) !== sum) { state = sanitizeState(copy); return; }
      state = sanitizeState(parsed);
    } catch (e) { state = defaultState(); }
  })();

  var save = debounce(function () {
    state.updated = new Date().toISOString();
    var copy = Object.assign({}, state);
    delete copy.checksum;
    copy.checksum = checksum(copy);
    var ok = rawSet(STORAGE_KEY, JSON.stringify(copy));
    if (!ok && !storageOK) { /* memory fallback; noted in the progress view */ }
  }, 120);

  function getModuleState(id) {
    var k = String(id);
    if (!state.modules[k]) state.modules[k] = { visited: false, lab: false, checkpoint: { done: false, score: 0, answered: 0 } };
    if (!state.modules[k].checkpoint) state.modules[k].checkpoint = { done: false, score: 0, answered: 0 };
    return state.modules[k];
  }
  function modulePct(id) {
    var m = state.modules[String(id)];
    if (!m) return 0;
    var p = 0;
    if (m.visited) p += 25;
    if (m.lab) p += 25;
    var cp = m.checkpoint || {};
    if (cp.done) p += 50; else p += clamp((cp.answered || 0) * 10, 0, 50);
    return Math.min(100, p);
  }
  function coursePct() {
    var total = 0;
    MODULES.forEach(function (m) { total += modulePct(m.id); });
    return Math.round(total / MODULES.length);
  }

  /* ---------------- preferences ---------------- */
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function motionReduced() {
    return state.prefs.motion === 'reduce' || (motionQuery && motionQuery.matches && state.prefs.motion !== 'full');
  }
  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function resolvedTheme() {
    return state.prefs.theme === 'system' ? systemTheme() : state.prefs.theme;
  }
  function applyTheme() {
    var t = resolvedTheme();
    document.documentElement.setAttribute('data-theme', t);
    var themeBtn = $('#themeBtn');
    var wantLight = t === 'dark';
    $('.ic-moon', themeBtn).hidden = !wantLight;
    $('.ic-sun', themeBtn).hidden = wantLight;
    themeBtn.setAttribute('aria-label', wantLight ? 'Switch to light theme' : 'Switch to dark theme');
    $$('[data-theme-set]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme-set') === state.prefs.theme ? 'true' : 'false');
    });
  }
  function applyText() {
    document.documentElement.style.setProperty('--text-scale', (state.prefs.text / 100).toFixed(2));
    var out = $('#textOut');
    if (out) out.textContent = state.prefs.text + '%';
    var range = $('#textRange');
    if (range) range.value = state.prefs.text;
  }
  function applyMotion() {
    document.documentElement.setAttribute('data-motion', motionReduced() ? 'reduce' : 'full');
    var on = $('#motionOn'), off = $('#motionOff');
    if (on && off) {
      on.setAttribute('aria-pressed', motionReduced() ? 'false' : 'true');
      off.setAttribute('aria-pressed', motionReduced() ? 'true' : 'false');
    }
  }
  var MODE_INFO = {
    standard: { label: 'Standard', desc: 'Full explanations, examples and derivations.' },
    beginner: { label: 'Beginner', desc: 'Adds foundation checks and plainer context before the mathematics.' },
    deep: { label: 'Deep', desc: 'Adds advanced connections and derivation notes for deeper study.' },
    simple: { label: 'Simple', desc: 'Short summaries; hides lengthy derivations and deep dives.' },
    revision: { label: 'Revision', desc: 'Recap cards and formulas; prose and lab steps collapse away.' }
  };
  function applyMode() {
    document.body.setAttribute('data-mode', state.prefs.mode);
    $$('#modeChoices [data-mode-set]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode-set') === state.prefs.mode ? 'true' : 'false');
      var d = $('.mode-desc', b);
      if (d) d.textContent = MODE_INFO[b.getAttribute('data-mode-set')].desc;
    });
    var hint = $('#modeHint');
    if (hint) hint.textContent = MODE_INFO[state.prefs.mode].desc;
  }

  /* ---------------- toast / announcements ---------------- */
  var toastTimer = 0;
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }
  var announcer;
  function announce(msg) {
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.className = 'sr-only';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    setTimeout(function () { announcer.textContent = msg; }, 40);
  }

  /* ---------------- modal management ---------------- */
  var openModal = null, lastFocus = null;
  function showModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    openModal = modal;
    var app = $('.app'), top = $('.topbar');
    if (app) app.setAttribute('inert', '');
    if (top) top.setAttribute('inert', '');
    var focusable = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal);
    if (focusable.length) focusable[0].focus();
    document.addEventListener('keydown', modalKey);
  }
  function hideModal(modal) {
    modal = modal || openModal;
    if (!modal) return;
    modal.hidden = true;
    openModal = null;
    var app = $('.app'), top = $('.topbar');
    if (app) app.removeAttribute('inert');
    if (top) top.removeAttribute('inert');
    document.removeEventListener('keydown', modalKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function modalKey(e) {
    if (!openModal) return;
    if (e.key === 'Escape') { e.preventDefault(); hideModal(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', openModal).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------- navigation ---------------- */
  var wideQuery = window.matchMedia ? window.matchMedia('(min-width: 901px)') : null;
  var sidebar = $('#sidebar');
  var navToggle = $('#navToggle');
  var pinBtn = $('#pinBtn');
  var sidebarCollapsed = false;

  function isWide() { return wideQuery ? wideQuery.matches : window.innerWidth > 900; }
  function setDrawer(open) {
    document.body.classList.toggle('drawer-open', !!open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    var scrim = $('#scrim');
    if (scrim) scrim.hidden = !open;
    if (open) {
      var first = $('.nav-link', sidebar);
      if (first) setTimeout(function () { first.focus(); }, 60);
    }
  }
  function setSidebarCollapsed(hidden) {
    sidebarCollapsed = hidden;
    document.body.classList.toggle('nav-hidden', hidden && isWide());
    navToggle.setAttribute('aria-expanded', hidden ? 'false' : 'true');
  }
  function toggleNav() {
    if (isWide()) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setDrawer(!document.body.classList.contains('drawer-open'));
    }
  }
  function closeDrawer() {
    setDrawer(false);
    if (navToggle) navToggle.focus();
  }
  function applyPin() {
    var pinned = !!state.prefs.pin;
    pinBtn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    $('#pinLabel').textContent = pinned ? 'Pinned' : 'Pin';
    pinBtn.title = pinned ? 'Unpin the course map (allow auto-hide)' : 'Keep the course map open';
    if (pinned) setSidebarCollapsed(false);
  }
  function afterNavigate() {
    if (!isWide()) {
      setDrawer(false);
    } else if (!state.prefs.pin) {
      setSidebarCollapsed(true);
    }
    var main = $('#main');
    if (main) main.focus({ preventScroll: true });
  }

  function initNav() {
    var list = $('#moduleNav');
    list.innerHTML = MODULES.map(function (m) {
      return '<li><a class="nav-link" href="#module-' + m.id + '" data-nav="module-' + m.id + '">' +
        '<span class="nav-num">' + pad2(m.id) + '</span>' +
        '<span class="nav-text">' + escapeHTML(m.short) + '<small>' + escapeHTML(m.title) + '</small></span>' +
        '<span class="done-dot" aria-hidden="true"></span></a></li>';
    }).join('');

    navToggle.addEventListener('click', toggleNav);
    pinBtn.addEventListener('click', function () {
      state.prefs.pin = !state.prefs.pin;
      applyPin();
      save();
      toast(state.prefs.pin ? 'Course map pinned open' : 'Course map will hide after you choose a destination');
    });
    var scrim = $('#scrim');
    scrim.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer();
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('.nav-link');
      if (!a) return;
      if (!isWide()) setDrawer(false);
      else if (!state.prefs.pin) setSidebarCollapsed(true);
    });
    if (wideQuery && wideQuery.addEventListener) {
      wideQuery.addEventListener('change', function () {
        setDrawer(false);
        document.body.classList.remove('nav-hidden');
        sidebarCollapsed = false;
      });
    }
    window.addEventListener('resize', debounce(function () {
      if (!isWide() && document.body.classList.contains('nav-hidden')) {
        document.body.classList.remove('nav-hidden');
      }
    }, 160));
  }

  function markNav(view, moduleId) {
    $$('.nav-link').forEach(function (a) {
      var nav = a.getAttribute('data-nav');
      var current = (view === 'module' && nav === 'module-' + moduleId) || nav === view;
      if (current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function refreshNavProgress() {
    MODULES.forEach(function (m) {
      var a = $('[data-nav="module-' + m.id + '"]');
      if (a) a.classList.toggle('is-done', modulePct(m.id) >= 100);
    });
    var pct = coursePct();
    $('#sidePct').textContent = pct + '%';
    $('#sideBar').style.width = pct + '%';
    var started = Object.keys(state.modules).filter(function (k) { return state.modules[k].visited; }).length;
    $('#sideProgressText').textContent = started ? started + ' of ' + MODULES.length + ' modules opened' : 'No modules started yet.';
  }

  /* ---------------- routing ---------------- */
  var VIEWS = ['home', 'module', 'bank', 'glossary', 'formulas', 'abbreviations', 'search', 'progress'];
  var currentView = 'home';
  var moduleInited = {};

  function parseHash() {
    var raw = (location.hash || '#home').slice(1);
    var parts = raw.split('/').filter(function (s) { return s.length; }).map(function (s) {
      try { return decodeURIComponent(s); } catch (e) { return s; }
    });
    if (!parts.length) return { view: 'home', parts: [] };
    var v = parts[0];
    if (v.indexOf('module-') === 0) return { view: 'module', parts: [v].concat(parts.slice(1)) };
    if (VIEWS.indexOf(v) >= 0) return { view: v, parts: parts };
    return { view: 'home', parts: [] };
  }

  function showView(name) {
    VIEWS.forEach(function (v) {
      var node = document.getElementById('view-' + v);
      if (node) node.classList.toggle('is-active', v === name);
    });
    currentView = name;
  }

  function route(opts) {
    opts = opts || {};
    var h = parseHash();
    var view = h.view, parts = h.parts;
    if (view === 'module') {
      var m = parseInt(String(parts[0]).replace('module-', ''), 10);
      if (!m || m < 1 || m > MODULES.length) { location.hash = 'home'; return; }
      showView('module');
      MARK.activateModule(m);
      if (parts[1]) {
        var target = document.getElementById(parts[1]);
        if (target) setTimeout(function () { target.scrollIntoView({ behavior: motionReduced() ? 'auto' : 'smooth', block: 'start' }); }, 80);
      } else if (!opts.keepScroll) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      markNav('module', m);
      var mod = MODULES[m - 1];
      announce('Module ' + m + ': ' + mod.title);
    } else {
      showView(view);
      markNav(view);
      if (view === 'bank' && window.ETE && window.ETE.BankUI) {
        window.ETE.BankUI.route(parts.slice(1));
      }
      if (view === 'search') {
        var q = parts[1] || '';
        var input = $('#searchInput');
        if (q && input && input.value !== q) input.value = q;
        renderSearch(q);
      }
      if (view === 'glossary') renderGlossary();
      if (view === 'formulas') renderFormulas();
      if (view === 'abbreviations') renderAbbreviations();
      if (view === 'progress') renderProgress();
      if (view === 'home') renderHome();
      if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
      announce(view.charAt(0).toUpperCase() + view.slice(1));
    }
    document.dispatchEvent(new CustomEvent('ete:view', { detail: { view: view, parts: parts } }));
  }

  /* ---------------- modules ---------------- */
  var moduleArticles = $$('.module-page');
  var MARK = {
    current: 0,
    activateModule: function (id) {
      moduleArticles.forEach(function (a) {
        var on = Number(a.getAttribute('data-module')) === id;
        a.hidden = !on;
        if (on) a.classList.add('is-active'); else a.classList.remove('is-active');
      });
      if (this.current) {
        var old = document.getElementById('module-' + this.current);
        if (old) old.hidden = true;
      }
      var art = document.getElementById('module-' + id);
      if (!art) return;
      art.hidden = false;
      this.current = id;
      state.lastModule = id;
      getModuleState(id).visited = true;
      save();
      refreshNavProgress();
      renderHome();
      if (!moduleInited[id]) {
        moduleInited[id] = true;
        initModule(art, id);
      }
      updateToc(art);
    }
  };

  function initModule(art, id) {
    // Table of contents and previous/next controls are generated from the lesson itself.
    var lesson = $('.lesson', art);
    if (!lesson) return;
    var toc = $('.lesson-toc', art);
    if (toc) {
      var sections = $$('.lesson-section', lesson);
      var html = '<h2>In this module</h2><ol>';
      sections.forEach(function (s, i) {
        var h = $('h2', s);
        if (!h) return;
        if (!s.id) s.id = 'm' + id + '-s' + (i + 1);
        html += '<li><a href="#module-' + id + '/' + s.id + '" data-section="' + s.id + '">' + escapeHTML(h.textContent) + '</a></li>';
      });
      html += '</ol><div class="side-progress" style="margin-top:14px"><span id="tocBar-' + id + '"></span></div>';
      html += '<p class="faint small" style="margin:8px 0 0" id="tocPct-' + id + '">0% of module viewed</p>';
      toc.innerHTML = html;
    }
    var foot = document.createElement('nav');
    foot.className = 'spread hide-print';
    foot.style.margin = '30px 0 0';
    foot.setAttribute('aria-label', 'Module navigation');
    var prev = MODULES[id - 2], next = MODULES[id];
    foot.innerHTML =
      (prev ? '<a class="btn btn-ghost btn-sm" href="#module-' + prev.id + '">← Module ' + prev.id + ': ' + escapeHTML(prev.short) + '</a>' : '<a class="btn btn-ghost btn-sm" href="#home">← Course home</a>') +
      '<a class="btn btn-primary btn-sm" href="#bank">Practice this module</a>' +
      (next ? '<a class="btn btn-ghost btn-sm" href="#module-' + next.id + '">Module ' + next.id + ': ' + escapeHTML(next.short) + ' →</a>' : '<a class="btn btn-ghost btn-sm" href="#progress">See your progress →</a>');
    lesson.appendChild(foot);

    // Projection and lab mount points.
    var proj = $('[data-projection]', art);
    if (proj && window.ETE && window.ETE.Labs) {
      try { window.ETE.Labs.mountProjection(proj, proj.getAttribute('data-projection'), id); }
      catch (e) { console.warn('Projection unavailable', e); proj.innerHTML = '<div class="live-note">The animated projection could not start in this browser. The static explanation above remains complete.</div>'; }
    }
    var lab = $('[data-lab]', art);
    if (lab && window.ETE && window.ETE.Labs) {
      try {
        window.ETE.Labs.mountLab(lab, lab.getAttribute('data-lab'), id, function () {
          state.labs[String(id)] = (state.labs[String(id)] || 0) + 1;
          if (getModuleState(id).lab !== true) { getModuleState(id).lab = true; }
          save(); refreshNavProgress(); renderHome();
        });
      } catch (e) { console.warn('Lab unavailable', e); lab.innerHTML = '<div class="live-note">The interactive lab could not start in this browser. The lesson and formulas above remain complete.</div>'; }
    }
    var cp = $('[data-checkpoint]', art);
    if (cp) initCheckpoint(cp, id);
    measureReading(art, id);
  }

  function updateToc(art) {
    var toc = $('.lesson-toc', art);
    if (!toc) return;
    var links = $$('a[data-section]', toc);
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('data-section');
        var target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: motionReduced() ? 'auto' : 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', '#module-' + art.getAttribute('data-module') + '/' + id);
        }
      });
    });
    if (toc._tocBound) return;
    toc._tocBound = true;
    if (!toc._observer && 'IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var id = en.target.id;
            $$('a[data-section]', toc).forEach(function (a) {
              a.classList.toggle('is-current', a.getAttribute('data-section') === id);
            });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      $$('.lesson-section', art).forEach(function (s) { obs.observe(s); });
      toc._observer = obs;
    }
  }

  function measureReading(art, id) {
    var sections = $$('.lesson-section', art);
    var seen = {};
    var m = getModuleState(id);
    if (m.sections) seen = m.sections;
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var ms = getModuleState(id);
          ms.sections = ms.sections || {};
          ms.sections[en.target.id] = true;
          save();
          var total = sections.length || 1;
          var done = Object.keys(ms.sections).length;
          var pct = Math.round(100 * Math.min(done, total) / total);
          var bar = document.getElementById('tocBar-' + id), lbl = document.getElementById('tocPct-' + id);
          if (bar) bar.style.width = pct + '%';
          if (lbl) lbl.textContent = pct + '% of module viewed';
        }
      });
    }, { threshold: 0, rootMargin: '-12% 0px -58% 0px' });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    var grid = $('#moduleGrid');
    if (!grid) return;
    var html = MODULES.map(function (m) {
      var pct = modulePct(m.id);
      return '<a class="module-card" href="#module-' + m.id + '">' +
        '<div class="mc-top"><span class="mc-num">MODULE ' + pad2(m.id) + '</span>' +
        (pct >= 100 ? '<span class="pill lime">Complete</span>' : pct > 0 ? '<span class="pill teal">In progress</span>' : '<span class="pill">Start</span>') +
        '</div>' +
        '<h3>' + escapeHTML(m.title) + '</h3>' +
        '<p>' + escapeHTML(m.promise) + '</p>' +
        '<div class="bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="mc-foot"><span>' + escapeHTML(m.themes.slice(0, 2).join(' · ')) + '</span><span>' + pct + '%</span></div>' +
        '</a>';
    }).join('');
    grid.innerHTML = html;

    var resume = $('#resumeCard');
    if (resume) {
      var last = state.lastModule;
      if (last) {
        var mm = MODULES[last - 1];
        var p = modulePct(last);
        resume.innerHTML = '<div class="card" style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between">' +
          '<div><span class="eyebrow">Pick up where you left off</span><h3 style="margin-top:8px;margin-bottom:2px">Module ' + last + ' — ' + escapeHTML(mm.title) + '</h3>' +
          '<p class="small muted mb-0">' + p + '% complete · ' + (p >= 100 ? 'review or practise' : 'continue the lesson') + '</p></div>' +
          '<a class="btn btn-primary" href="#module-' + last + '">Resume module</a></div>';
      } else {
        resume.innerHTML = '';
      }
    }
    refreshNavProgress();
  }

  /* ---------------- glossary ---------------- */
  function renderGlossary() {
    var host = $('#glossList');
    if (!host) return;
    var q = ($('#glossFilter').value || '').trim().toLowerCase();
    var items = GLOSSARY.filter(function (g) {
      return !q || (g[0] + ' ' + g[1] + ' ' + g[2]).toLowerCase().indexOf(q) >= 0;
    });
    if (!items.length) {
      host.innerHTML = '<div class="empty"><b>No terms match that filter.</b>Try a shorter word, or clear the filter to see all ' + GLOSSARY.length + ' entries.</div>';
      return;
    }
    var groups = {};
    items.forEach(function (g) {
      var L = g[0].charAt(0).toUpperCase();
      (groups[L] = groups[L] || []).push(g);
    });
    var html = '';
    Object.keys(groups).sort().forEach(function (L) {
      html += '<section class="glossary-group" id="gl-' + L + '"><h2>' + L + '</h2><dl class="term-list">';
      groups[L].forEach(function (g) {
        html += '<div class="term"><dt>' + escapeHTML(g[0]) + '<span class="term-tag">Module ' + g[3] + '</span></dt>' +
          '<dd>' + escapeHTML(g[1]) + '</dd>' +
          '<dd><span class="lbl">Distinction:</span> ' + escapeHTML(g[2]) + ' <a href="#module-' + g[3] + '">Read the lesson</a></dd></div>';
      });
      html += '</dl></section>';
    });
    host.innerHTML = html;
    var jump = $('#alphaJump');
    jump.innerHTML = Object.keys(groups).sort().map(function (L) {
      return '<a href="#gl-' + L + '" data-scroll="gl-' + L + '">' + L + '</a>';
    }).join('');
  }

  /* ---------------- formulas ---------------- */
  function renderFormulas() {
    var host = $('#formulaList');
    if (!host) return;
    var q = ($('#formulaFilter').value || '').trim().toLowerCase();
    var items = FORMULAS.filter(function (f) {
      var hay = (f.name + ' ' + f.note + ' ' + f.symbols.map(function (s) { return s[0] + ' ' + s[1]; }).join(' ')).toLowerCase();
      return !q || hay.indexOf(q) >= 0;
    });
    if (!items.length) {
      host.innerHTML = '<div class="empty"><b>No formulas match that filter.</b>Try a symbol such as “SNR”, or clear the filter.</div>';
      return;
    }
    var byMod = {};
    items.forEach(function (f) { (byMod[f.module] = byMod[f.module] || []).push(f); });
    var html = '';
    Object.keys(byMod).sort(function (a, b) { return a - b; }).forEach(function (m) {
      var mm = MODULES[m - 1];
      html += '<section class="formula-index-group"><h2>Module ' + m + ' · ' + escapeHTML(mm.title) + '</h2><div class="formula-grid">';
      byMod[m].forEach(function (f) {
        html += '<div class="formula" id="fx-' + escapeHTML(f.id) + '"><div class="fx-name"><span>' + escapeHTML(f.name) + '</span><span class="tag">M' + m + '</span></div>' +
          '<div class="math">' + f.html + '</div>' +
          '<ul class="fx-symbols">' + f.symbols.map(function (s) { return '<li><b>' + escapeHTML(s[0]) + '</b> ' + escapeHTML(s[1]) + '</li>'; }).join('') + '</ul>' +
          '<p class="fx-note">' + escapeHTML(f.note) + '</p></div>';
      });
      html += '</div></section>';
    });
    host.innerHTML = html;
  }

  /* ---------------- abbreviations ---------------- */
  function renderAbbreviations() {
    var host = $('#abbrList');
    if (!host) return;
    var q = ($('#abbrFilter').value || '').trim().toLowerCase();
    var items = ABBREVIATIONS.filter(function (a) {
      return !q || (a[0] + ' ' + a[1] + ' ' + a[2]).toLowerCase().indexOf(q) >= 0;
    });
    if (!items.length) {
      host.innerHTML = '<div class="empty"><b>No abbreviations match.</b>Try a different letter or clear the filter.</div>';
      return;
    }
    host.innerHTML = '<div class="table-wrap"><table class="abbr-table"><caption>' + items.length + ' of ' + ABBREVIATIONS.length + ' abbreviations</caption><thead><tr><th scope="col">Abbreviation</th><th scope="col">Full form</th><th scope="col">Context in this course</th></tr></thead><tbody>' +
      items.map(function (a) {
        return '<tr><td>' + escapeHTML(a[0]) + '</td><td>' + escapeHTML(a[1]) + '</td><td>' + escapeHTML(a[2]) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------------- search ---------------- */
  var searchIndex = null;
  function buildSearchIndex() {
    if (searchIndex) return searchIndex;
    var idx = { lessons: [], glossary: [], formulas: [], abbr: [], questions: null };
    moduleArticles.forEach(function (art) {
      var mid = Number(art.getAttribute('data-module'));
      $$('.lesson-section', art).forEach(function (s) {
        var h = $('h2', s);
        if (!h) return;
        idx.lessons.push({
          module: mid,
          section: s.id,
          title: h.textContent.trim(),
          text: (s.textContent || '').replace(/\s+/g, ' ').slice(0, 4000)
        });
      });
    });
    GLOSSARY.forEach(function (g) {
      idx.glossary.push({ term: g[0], text: g[1] + ' ' + g[2], module: g[3] });
    });
    FORMULAS.forEach(function (f) {
      idx.formulas.push({ name: f.name, text: f.note + ' ' + f.symbols.map(function (s) { return s.join(' '); }).join(' '), module: f.module, id: f.id });
    });
    ABBREVIATIONS.forEach(function (a) {
      idx.abbr.push({ abbr: a[0], text: a[1] + ' ' + a[2] });
    });
    searchIndex = idx;
    return idx;
  }
  function questionIndex() {
    if (!window.ETE || !window.ETE.Bank) return [];
    if (searchIndex && searchIndex.questions) return searchIndex.questions;
    var idx = buildSearchIndex();
    try {
      var all = window.ETE.Bank.all();
      idx.questions = all.map(function (q) {
        return { id: q.id, module: q.module, cat: q.cat, text: stripTags(q.stem) + ' ' + q.concept, concept: q.concept };
      }).filter(function (q) { return q.text.length < 900; });
    } catch (e) { idx.questions = []; }
    return idx.questions;
  }
  function highlight(text, q) {
    var safe = escapeHTML(text);
    if (!q) return safe;
    try {
      return safe.replace(new RegExp('(' + escapeRegExp(escapeHTML(q)) + ')', 'ig'), '<mark>$1</mark>');
    } catch (e) { return safe; }
  }
  function snippet(text, q) {
    var i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
    var start = i > 70 ? i - 60 : 0;
    var s = text.slice(start, start + 190);
    if (start > 0) s = '…' + s;
    if (start + 190 < text.length) s += '…';
    return s;
  }
  function renderSearch(query) {
    var host = $('#searchResults');
    if (!host) return;
    var q = (query || '').trim();
    var chips = $('#searchChips');
    var defaults = ['impulse response', 'aliasing', 'Nyquist', 'pole', 'Shannon', 'modulation index', 'convolution', 'z-transform'];
    chips.innerHTML = defaults.map(function (d) {
      return '<button class="pill" type="button" data-search-chip="' + escapeHTML(d) + '">' + escapeHTML(d) + '</button>';
    }).join('');
    if (q.length < 2) {
      host.innerHTML = '<div class="card card-flat"><h3>Search across the whole course</h3><p class="small muted mb-0">Type at least two characters. The index covers lesson sections, glossary entries, formula cards, abbreviations and all 5,670 practice items. Results link to the exact section or question.</p></div>';
      return;
    }
    var idx = buildSearchIndex();
    var needle = q.toLowerCase();
    var out = { lessons: [], glossary: [], formulas: [], abbr: [], questions: [] };
    idx.lessons.forEach(function (r) { if ((r.title + ' ' + r.text).toLowerCase().indexOf(needle) >= 0) out.lessons.push(r); });
    idx.glossary.forEach(function (r) { if ((r.term + ' ' + r.text).toLowerCase().indexOf(needle) >= 0) out.glossary.push(r); });
    idx.formulas.forEach(function (r) { if ((r.name + ' ' + r.text).toLowerCase().indexOf(needle) >= 0) out.formulas.push(r); });
    idx.abbr.forEach(function (r) { if ((r.abbr + ' ' + r.text).toLowerCase().indexOf(needle) >= 0) out.abbr.push(r); });
    var qq = questionIndex();
    qq.forEach(function (r) { if (r.text.toLowerCase().indexOf(needle) >= 0) out.questions.push(r); });

    var total = out.lessons.length + out.glossary.length + out.formulas.length + out.abbr.length + out.questions.length;
    if (!total) {
      host.innerHTML = '<div class="empty"><b>No results for “' + escapeHTML(q) + '”.</b>Check the spelling, try a shorter term, or browse the glossary and formula index. The search is literal: “SNR” finds signal-to-noise ratio, but “signal to noise” does not match the abbreviation itself.</div>';
      return;
    }
    var html = '<p class="small muted">' + total + ' result' + (total === 1 ? '' : 's') + ' for <b>“' + escapeHTML(q) + '”</b>.</p>';
    if (out.lessons.length) {
      html += '<section class="search-group"><h2>Lessons <span class="pill">' + out.lessons.length + '</span></h2>';
      out.lessons.slice(0, 10).forEach(function (r) {
        var mm = MODULES[r.module - 1];
        html += '<a class="result" href="#module-' + r.module + '/' + r.section + '"><span class="r-title">' + highlight(r.title, q) + '</span>' +
          '<span class="r-meta">Module ' + r.module + ' · ' + escapeHTML(mm.title) + '</span>' +
          '<span class="r-snip">' + highlight(snippet(r.text, q), q) + '</span></a>';
      });
      html += '</section>';
    }
    if (out.glossary.length) {
      html += '<section class="search-group"><h2>Glossary <span class="pill">' + out.glossary.length + '</span></h2>';
      out.glossary.slice(0, 8).forEach(function (r) {
        html += '<a class="result" href="#glossary" data-gloss-term="' + escapeHTML(r.term) + '"><span class="r-title">' + highlight(r.term, q) + '</span>' +
          '<span class="r-meta">Module ' + r.module + '</span><span class="r-snip">' + highlight(snippet(r.text, q), q) + '</span></a>';
      });
      html += '</section>';
    }
    if (out.formulas.length) {
      html += '<section class="search-group"><h2>Formulas <span class="pill">' + out.formulas.length + '</span></h2>';
      out.formulas.slice(0, 8).forEach(function (r) {
        html += '<a class="result" href="#formulas" data-formula-term="' + escapeHTML(r.name) + '"><span class="r-title">' + highlight(r.name, q) + '</span>' +
          '<span class="r-meta">Module ' + r.module + '</span><span class="r-snip">' + highlight(snippet(r.text, q), q) + '</span></a>';
      });
      html += '</section>';
    }
    if (out.abbr.length) {
      html += '<section class="search-group"><h2>Abbreviations <span class="pill">' + out.abbr.length + '</span></h2>';
      out.abbr.slice(0, 8).forEach(function (r) {
        html += '<a class="result" href="#abbreviations" data-abbr-term="' + escapeHTML(r.abbr) + '"><span class="r-title">' + highlight(r.abbr, q) + '</span>' +
          '<span class="r-snip">' + highlight(snippet(r.text, q), q) + '</span></a>';
      });
      html += '</section>';
    }
    if (out.questions.length) {
      html += '<section class="search-group"><h2>Practice items <span class="pill">' + out.questions.length + '</span></h2>';
      out.questions.slice(0, 12).forEach(function (r) {
        html += '<a class="result" href="#bank/m' + r.module + '/' + encodeURIComponent(r.cat) + '/' + r.id + '"><span class="r-title">' + highlight(r.concept, q) + '</span>' +
          '<span class="r-meta">' + r.id + ' · Module ' + r.module + ' · ' + r.cat + '</span><span class="r-snip">' + highlight(snippet(r.text, q), q) + '</span></a>';
      });
      if (out.questions.length > 12) html += '<p class="small faint">Showing the first 12 of ' + out.questions.length + ' matching practice items. Narrow the query to see fewer.</p>';
      html += '</section>';
    }
    host.innerHTML = html;
  }

  /* ---------------- progress ---------------- */
  function renderProgress() {
    var stats = $('#progressStats');
    var attempted = Object.keys(state.bank.attempted);
    var correct = attempted.filter(function (id) { return state.bank.attempted[id].correct; }).length;
    var started = MODULES.filter(function (m) { return modulePct(m.id) > 0; }).length;
    var done = MODULES.filter(function (m) { return modulePct(m.id) >= 100; }).length;
    var labs = Object.keys(state.labs).reduce(function (s, k) { return s + state.labs[k]; }, 0);
    stats.innerHTML =
      '<div class="stat"><b>' + started + ' / ' + MODULES.length + '</b><span>Modules started</span></div>' +
      '<div class="stat"><b>' + done + ' / ' + MODULES.length + '</b><span>Modules complete</span></div>' +
      '<div class="stat"><b>' + attempted.length.toLocaleString() + '</b><span>Practice items attempted</span></div>' +
      '<div class="stat"><b>' + (attempted.length ? Math.round(100 * correct / attempted.length) + '%' : '—') + '</b><span>Correct on attempted</span></div>';

    var rows = MODULES.map(function (m) {
      var ms = state.modules[String(m.id)] || {};
      var pct = modulePct(m.id);
      var cp = ms.checkpoint || {};
      var attempts = Object.keys(state.bank.attempted).filter(function (id) { return id.indexOf('m' + m.id + '-') === 0; }).length;
      return '<tr><td><b>Module ' + m.id + '</b><br><span class="small muted">' + escapeHTML(m.title) + '</span></td>' +
        '<td>' + (pct >= 100 ? '<span class="pill lime">Complete</span>' : pct > 0 ? '<span class="pill teal">In progress</span>' : '<span class="pill">Not started</span>') + '</td>' +
        '<td><div class="bar"><span style="width:' + pct + '%"></span></div><span class="small faint">' + pct + '%</span></td>' +
        '<td class="num">' + (cp.done ? cp.score + '/5' : (cp.answered || 0) + '/5') + '</td>' +
        '<td class="num">' + attempts + '</td>' +
        '<td><a class="btn btn-ghost btn-sm" href="#module-' + m.id + '">' + (pct > 0 ? 'Continue' : 'Start') + '</a></td></tr>';
    }).join('');
    $('#progressModules').innerHTML = '<div class="table-wrap"><table class="progress-table"><caption>Completion is 25% for opening, 25% for running the lab and 50% for finishing the checkpoint. Practice counts are attempts, not mastery.</caption>' +
      '<thead><tr><th scope="col">Module</th><th scope="col">Status</th><th scope="col">Completion</th><th scope="col" class="num">Checkpoint</th><th scope="col" class="num">Practice</th><th scope="col"><span class="sr-only">Open</span></th></tr></thead><tbody>' + rows + '</tbody></table></div>';

    var next = MODULES.find(function (m) { return modulePct(m.id) < 100; });
    var nextHtml = '';
    if (next) {
      nextHtml += '<p class="small muted">The next unfinished module is <b>Module ' + next.id + ' — ' + escapeHTML(next.title) + '</b> at ' + modulePct(next.id) + '%.</p>' +
        '<div class="row"><a class="btn btn-primary btn-sm" href="#module-' + next.id + '">Continue module ' + next.id + '</a>' +
        '<a class="btn btn-sm" href="#bank/m' + next.id + '">Practise module ' + next.id + '</a></div>';
    } else {
      nextHtml += '<p class="small muted">All nine modules are complete. A sensible next step is spaced practice across the weakest concepts, or a full pass through the formula index before an examination.</p>' +
        '<div class="row"><a class="btn btn-primary btn-sm" href="#bank">Open the question bank</a><a class="btn btn-sm" href="#formulas">Review formulas</a></div>';
    }
    $('#nextSteps').innerHTML = nextHtml;

    var note = $('#storageNote');
    if (!storageOK) {
      note.hidden = false;
      note.innerHTML = '<span class="db-label">Session-only storage</span><p>This browser is blocking local storage, so progress will last for this session only. The application keeps working; export before you close the file if you need a record.</p>';
    } else {
      note.hidden = true;
    }
  }

  function exportRecord() {
    var copy = Object.assign({}, state);
    delete copy.checksum;
    copy.updated = new Date().toISOString();
    copy.checksum = checksum(copy);
    return JSON.stringify(copy, null, 2);
  }
  function downloadProgress() {
    var text = exportRecord();
    try {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'ete225-progress.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
      $('#progressMsg').textContent = 'Progress exported.';
    } catch (e) {
      copyProgress(text);
    }
  }
  function copyProgress(text) {
    var done = function () { toast('Progress copied to the clipboard'); $('#progressMsg').textContent = 'Progress copied. Paste it into a text file to keep it.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    if (ok) done();
    else {
      $('#importText').value = text;
      showModal('importModal');
      $('#importMsg').textContent = 'Copying is blocked. The text is in the box above; select it and copy manually.';
    }
  }
  function importRecord(text) {
    var msg = $('#importMsg');
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) { msg.textContent = 'That is not valid JSON.'; return false; }
    if (!parsed || parsed.app !== APP_ID) { msg.textContent = 'This record does not belong to ETE225.'; return false; }
    if (parsed.version !== VERSION) { msg.textContent = 'Unsupported record version. This build reads version 1.'; return false; }
    var sum = parsed.checksum;
    var copy = Object.assign({}, parsed);
    delete copy.checksum;
    if (sum && checksum(copy) !== sum) { msg.textContent = 'The checksum does not match. The file may be incomplete or edited.'; return false; }
    var clean = sanitizeState(copy);
    state = clean;
    save();
    applyTheme(); applyText(); applyMotion(); applyMode(); applyPin();
    refreshNavProgress(); renderHome(); renderProgress();
    msg.textContent = 'Progress imported. ' + Object.keys(state.bank.attempted).length + ' practice attempts restored.';
    toast('Progress imported');
    setTimeout(function () { hideModal(); }, 900);
    return true;
  }

  /* ---------------- checkpoints ---------------- */
  function initCheckpoint(host, moduleId) {
    if (!window.ETE || !window.ETE.Bank) return;
    var items;
    try { items = window.ETE.Bank.pick(moduleId, 'Intermediate', 5, 7919 + moduleId * 131); }
    catch (e) { host.innerHTML = '<div class="empty">The checkpoint could not load. The practice bank remains available from the sidebar.</div>'; return; }
    var ms = getModuleState(moduleId);
    var answered = {};
    if (ms.checkpoint) answered = {};
    host.innerHTML = '<p class="small muted" id="cpScore-' + moduleId + '">0 of ' + items.length + ' answered.</p>' + items.map(function (q, qi) {
      return '<div class="q" data-qid="' + q.id + '">' +
        '<div class="q-meta"><span class="pill teal">' + escapeHTML(q.type) + '</span><span class="pill">' + escapeHTML(q.concept) + '</span><span class="pill">' + q.id + '</span></div>' +
        '<div class="q-stem">' + q.stem + '</div>' +
        '<div class="options" role="group" aria-label="Answer choices">' + q.options.map(function (o, oi) {
          return '<button class="option" type="button" data-opt="' + oi + '"><span class="letter">' + String.fromCharCode(65 + oi) + '</span><span>' + o + '</span></button>';
        }).join('') + '</div>' +
        '<div class="q-actions"><button class="btn btn-ghost btn-sm" type="button" data-hint>Hint</button><button class="btn btn-ghost btn-sm" type="button" data-solution hidden>Full solution</button></div>' +
        '<div class="feedback" hidden></div>' +
        '<div class="solution" hidden></div>' +
        '</div>';
    }).join('');
    var score = 0;
    $$('.q', host).forEach(function (node, qi) {
      var q = items[qi];
      var picked = false;
      var fb = $('.feedback', node);
      var sol = $('.solution', node);
      var solBtn = $('[data-solution]', node);
      $('[data-hint]', node).addEventListener('click', function () {
        fb.hidden = false;
        fb.className = 'feedback';
        fb.innerHTML = '<b>Hint.</b> ' + q.hint;
      });
      $$('.option', node).forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (picked) return;
          picked = true;
          var choice = Number(btn.getAttribute('data-opt'));
          var ok = choice === q.answer;
          $$('.option', node).forEach(function (b, bi) {
            b.disabled = true;
            if (bi === q.answer) b.classList.add('is-correct');
            if (bi === choice && !ok) b.classList.add('is-wrong');
          });
          if (ok) score++;
          fb.hidden = false;
          fb.className = 'feedback ' + (ok ? 'ok' : 'no');
          fb.innerHTML = (ok ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + q.explain;
          sol.hidden = false;
          solBtn.hidden = false;
          sol.innerHTML = '<b>Worked solution.</b><ol>' + q.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>';
          ms.checkpoint.answered = Math.min(5, (ms.checkpoint.answered || 0) + 1);
          if (ms.checkpoint.answered >= 5) { ms.checkpoint.done = true; ms.checkpoint.score = score; }
          state.bank.attempted[q.id] = { correct: ok, t: Date.now() };
          $('#cpScore-' + moduleId, host).textContent = ms.checkpoint.answered + ' of ' + items.length + ' answered' + (ms.checkpoint.done ? ' — checkpoint complete (' + score + '/5).' : '.');
          save(); refreshNavProgress(); renderHome();
        });
      });
      solBtn.addEventListener('click', function () { sol.hidden = !sol.hidden; });
    });
    if (ms.checkpoint && ms.checkpoint.answered) {
      $('#cpScore-' + moduleId, host).textContent = ms.checkpoint.answered + ' of 5 answered' + (ms.checkpoint.done ? ' — checkpoint complete (' + ms.checkpoint.score + '/5).' : '.');
    }
  }

  /* ---------------- display modal ---------------- */
  function initDisplay() {
    var choices = $('#modeChoices');
    choices.innerHTML = Object.keys(MODE_INFO).map(function (k) {
      return '<button class="option" type="button" data-mode-set="' + k + '" aria-pressed="false">' +
        '<span class="letter" style="width:24px;height:24px">' + (k === state.prefs.mode ? '✓' : '') + '</span>' +
        '<span><b>' + MODE_INFO[k].label + '</b><br><span class="mode-desc small muted">' + MODE_INFO[k].desc + '</span></span></button>';
    }).join('');
    choices.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode-set]');
      if (!b) return;
      state.prefs.mode = b.getAttribute('data-mode-set');
      applyMode(); save();
      $$('#modeChoices .letter').forEach(function (l, i) {
        var key = Object.keys(MODE_INFO)[i];
        l.textContent = key === state.prefs.mode ? '✓' : '';
      });
    });
    $('#displayBtn').addEventListener('click', function () { showModal('displayModal'); });
    $$('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { hideModal(document.getElementById(b.getAttribute('data-close'))); });
    });
    $$('.modal').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target === m) hideModal(m); });
    });
    $('#textRange').addEventListener('input', function (e) {
      state.prefs.text = clamp(Number(e.target.value), 85, 150);
      applyText(); save();
    });
    $$('[data-text]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-text');
        if (act === 'up') state.prefs.text = clamp(state.prefs.text + 5, 85, 150);
        else if (act === 'down') state.prefs.text = clamp(state.prefs.text - 5, 85, 150);
        else state.prefs.text = 100;
        applyText(); save();
        announce('Text size ' + state.prefs.text + '%');
      });
    });
    $$('[data-theme-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.prefs.theme = b.getAttribute('data-theme-set');
        applyTheme(); save();
      });
    });
    $('#themeBtn').addEventListener('click', function () {
      var now = resolvedTheme();
      state.prefs.theme = now === 'dark' ? 'light' : 'dark';
      applyTheme(); save();
      toast(state.prefs.theme === 'light' ? 'Light theme' : 'Dark theme');
    });
    $('#motionOn').addEventListener('click', function () { state.prefs.motion = 'full'; applyMotion(); save(); });
    $('#motionOff').addEventListener('click', function () { state.prefs.motion = 'reduce'; applyMotion(); save(); });
    $('#resetPrefs').addEventListener('click', function () {
      state.prefs = Object.assign({}, DEFAULT_PREFS, { pin: state.prefs.pin });
      applyTheme(); applyText(); applyMode(); applyMotion(); save();
      toast('Display preferences reset');
    });
    if (motionQuery && motionQuery.addEventListener) {
      motionQuery.addEventListener('change', function () { if (state.prefs.motion === 'full') applyMotion(); });
      if (window.matchMedia('(prefers-color-scheme: light)')) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
          if (state.prefs.theme === 'system') applyTheme();
        });
      }
    }
  }

  /* ---------------- import / export UI ---------------- */
  function initProgressUI() {
    $('#exportBtn').addEventListener('click', downloadProgress);
    $('#copyBtn').addEventListener('click', function () { copyProgress(exportRecord()); });
    $('#importBtn').addEventListener('click', function () {
      $('#importMsg').textContent = '';
      showModal('importModal');
    });
    $('#importFileBtn').addEventListener('click', function () { $('#importFile').click(); });
    $('#importFile').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () { $('#importText').value = String(reader.result || ''); $('#importMsg').textContent = 'File loaded. Choose Validate and import.'; };
      reader.onerror = function () { $('#importMsg').textContent = 'The file could not be read.'; };
      reader.readAsText(f);
    });
    $('#doImport').addEventListener('click', function () { importRecord($('#importText').value); });
    $('#resetBtn').addEventListener('click', function () {
      if (!window.confirm('Reset all local progress for ETE225? This cannot be undone.')) return;
      state = defaultState();
      save();
      applyTheme(); applyText(); applyMode(); applyMotion(); applyPin();
      refreshNavProgress(); renderHome(); renderProgress();
      toast('Local progress reset');
    });
    $('#printBtn').addEventListener('click', function () { window.print(); });
  }

  /* ---------------- global listeners ---------------- */
  function initGlobal() {
    window.addEventListener('hashchange', function () { route(); });
    document.addEventListener('click', function (e) {
      var s = e.target.closest('[data-scroll]');
      if (s) {
        e.preventDefault();
        var el = document.getElementById(s.getAttribute('data-scroll'));
        if (el) el.scrollIntoView({ behavior: motionReduced() ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      var chip = e.target.closest('[data-search-chip]');
      if (chip) {
        $('#searchInput').value = chip.getAttribute('data-search-chip');
        renderSearch($('#searchInput').value);
        if (history.replaceState) history.replaceState(null, '', '#search/' + encodeURIComponent($('#searchInput').value));
        return;
      }
      var gt = e.target.closest('[data-gloss-term]');
      if (gt) {
        e.preventDefault();
        $('#glossFilter').value = gt.getAttribute('data-gloss-term');
        renderGlossary();
        history.replaceState(null, '', '#glossary');
        showView('glossary'); markNav('glossary');
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }
      var ft = e.target.closest('[data-formula-term]');
      if (ft) {
        e.preventDefault();
        $('#formulaFilter').value = ft.getAttribute('data-formula-term');
        renderFormulas();
        history.replaceState(null, '', '#formulas');
        showView('formulas'); markNav('formulas');
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }
      var at = e.target.closest('[data-abbr-term]');
      if (at) {
        e.preventDefault();
        $('#abbrFilter').value = at.getAttribute('data-abbr-term');
        renderAbbreviations();
        history.replaceState(null, '', '#abbreviations');
        showView('abbreviations'); markNav('abbreviations');
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }
      var nav = e.target.closest('.nav-link');
      if (nav && isWide() && $('.topbar') && !state.prefs.pin) afterNavigate();
      if (nav && !isWide()) setDrawer(false);
    });
    $('#searchBtn').addEventListener('click', function () {
      location.hash = 'search';
      setTimeout(function () { var i = $('#searchInput'); if (i) { i.focus(); i.select(); } }, 80);
    });
    $('#searchInput').addEventListener('input', debounce(function (e) {
      var q = e.target.value;
      renderSearch(q);
      if (q.trim().length >= 2 && history.replaceState) history.replaceState(null, '', '#search/' + encodeURIComponent(q.trim()));
    }, 170));
    $('#searchInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); renderSearch(e.target.value); }
    });
    $('#glossFilter').addEventListener('input', debounce(renderGlossary, 120));
    $('#formulaFilter').addEventListener('input', debounce(renderFormulas, 120));
    $('#abbrFilter').addEventListener('input', debounce(renderAbbreviations, 120));
    $('.brand').addEventListener('click', function () { if (isWide() && !state.prefs.pin) setSidebarCollapsed(false); });
  }

  /* ---------------- boot ---------------- */
  function init() {
    applyTheme(); applyText(); applyMode(); applyMotion(); applyPin();
    initNav(); initDisplay(); initProgressUI(); initGlobal();
    renderHome(); renderGlossary(); renderFormulas(); renderAbbreviations();
    route();
    if (!storageOK) {
      setTimeout(function () { toast('Local storage is blocked; progress will last for this session only.'); }, 1200);
    }
    // Initial sidebar state: open on wide screens unless the user pinned it hidden (pin always opens).
    if (isWide() && state.prefs.pin) setSidebarCollapsed(false);
  }

  window.ETE = {
    data: DATA,
    state: function () { return state; },
    save: save,
    toast: toast,
    showModal: showModal,
    hideModal: hideModal,
    motionReduced: motionReduced,
    modulePct: modulePct,
    refresh: function () { refreshNavProgress(); renderHome(); renderProgress(); },
    renderSearch: renderSearch,
    formatNumber: fmt,
    escapeHTML: escapeHTML
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
