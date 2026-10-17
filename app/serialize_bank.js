/* Build-time helper: instantiate the deterministic bank and print the
   validated items grouped by module. Used by build.py. */
'use strict';
global.window = global;
global.document = {
  readyState: 'loading',
  addEventListener: function () {},
  getElementById: function () { return null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () { return { setAttribute: function () {}, appendChild: function () {} }; }
};
global.ETE = {};
var path = require('path');
var dir = path.join(__dirname, 'src', 'js');
['bank.js', 'bank-m3m4.js', 'bank-m5m6.js', 'bank-m7m9.js'].forEach(function (f) {
  require(path.join(dir, f));
});
var B = global.ETE.Bank;
var out = {};
for (var m = 1; m <= 9; m++) {
  var data = B.get(m);
  out[m] = { module: m, counts: data.counts, items: data.items };
}
process.stdout.write(JSON.stringify(out));
