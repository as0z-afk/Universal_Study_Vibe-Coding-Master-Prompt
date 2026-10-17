# ETE225 — Signals & Communication System (single-file course app)

`dist/ete225.html` is a complete offline study application: nine modules, nine
interactive labs, nine animated projections, a 5,670-item practice bank, a
glossary, a formula index, an abbreviation list, search, progress tracking and
JSON import/export. It has no external requests, fonts, images, libraries or
network dependencies, and it opens directly from `file://`.

## Build

```bash
cd app
python3 build.py
```

The build:

1. reads the fragments in `src/` (styles, template, module HTML, core JS, labs, bank);
2. renders the LaTeX-subset formula expressions in `src/data.py` to HTML;
3. runs `serialize_bank.js` under Node to produce the validated bank data;
4. injects everything into `src/template.html`;
5. writes `dist/ete225.html` and reports the code-point count.

`serialize_bank.js` is only needed at build time. The generated file embeds the
bank as JSON in `<script id="bank-data">`, so opening the page never regenerates
questions.

## Source layout

| Path | Purpose |
| --- | --- |
| `src/template.html` | application shell, views, modals, script slots |
| `src/styles.css` | design system, responsive and print rules |
| `src/modules/module-1.html` … `module-9.html` | lesson content |
| `src/js/core.js` | routing, navigation, search, progress, checkpoints |
| `src/js/plot.js` | canvas projection engine and nine scenes |
| `src/js/labs.js`, `labs2.js`, `labs3.js` | nine interactive labs and shared UI helpers |
| `src/js/mount.js` | lab dispatcher with failure isolation |
| `src/js/bank.js` | bank API, UI and module 1–2 generators |
| `src/js/bank-m3m4.js`, `bank-m5m6.js`, `bank-m7m9.js` | module 3–9 generators |
| `src/data.py` | course map, glossary, formulas, abbreviations |
| `build.py` | assembler and validation gate |

## Validation performed

* `node --check` on every JavaScript source file.
* `Bank.count(m) === 630` for all nine modules, with band counts
  **158 / 158 / 157 / 157** and globally unique IDs.
* Every item has four distinct options, an in-range answer index, a hint, an
  explanation and at least two worked steps; no item contains `NaN`,
  `undefined` or an infinite numeric option.
* Build gate: nine module fragments, unique element IDs, and every
  `data-lab` / `data-projection` key is registered in JavaScript.
* Headless DOM run under jsdom with a stubbed canvas: all views render, all
  nine labs mount and dispatch their first interaction, all nine projections
  mount and step, bank pagination and answering work, search/glossary/formula
  rendering works, theme/mode/text-size preferences apply, and the console
  reports zero errors.

## Known deviation from the specification

The master prompt asks for **exactly 10,000,000 Unicode code points**. This
build is **4,596,037** code points. The difference is roughly 5.4 million
characters — about 1,000 pages of additional teaching text.

The shortfall was left unfilled on purpose. Reaching the number would have
required padding, duplicated prose or cloned question content, all of which the
specification explicitly forbids ("reach the count with unique, meaningful
teaching content … never filler, duplicates, or padding"). The bank already
contributes 3.96 million characters of genuinely distinct, parameter-generated
items; the remaining content would need to be authored, not generated.

If a rebuild must hit an exact size, add real material (for example, extended
worked solutions or additional case studies) to `src/modules/` and rebuild;
`build.py` prints the resulting count but does not pad the file.
