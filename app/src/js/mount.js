/* ============================================================
   ETE225 — lab dispatcher
   Maps a [data-lab] key to the registered interactive lab and
   keeps a single failure from taking down the lesson page.
   ============================================================ */
(function () {
  'use strict';
  var root = window.ETE = window.ETE || {};
  var L = root.Labs = root.Labs || {};
  L.types = L.types || {};

  L.mountLab = function (host, key, moduleId, onAction) {
    if (!host) return null;
    var make = L.types[key];
    if (typeof make !== 'function') {
      host.innerHTML = '<div class="live-note">This lab is not bundled with the current build. The explanation and worked formulas above remain complete, and the practice bank still covers this module.</div>';
      if (window.console && console.warn) console.warn('ETE: unknown lab type "' + key + '"');
      return null;
    }
    var done = function () {
      if (typeof onAction !== 'function') return;
      try { onAction(); } catch (e) { if (window.console) console.warn('ETE: lab callback failed', e); }
    };
    try {
      var inst = make(host, moduleId, done);
      host.setAttribute('data-lab-ready', 'true');
      return inst || true;
    } catch (e) {
      if (window.console && console.error) console.error('ETE: lab "' + key + '" failed to mount', e);
      host.innerHTML = '<div class="live-note">The interactive lab could not start in this browser. The lesson text, formulas and worked examples above remain complete, and the checkpoint below still works.</div>';
      return null;
    }
  };
})();
