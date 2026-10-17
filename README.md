# Universal Study Platform Prompts

Two subject-neutral prompts for creating an accessible, responsive study platform from materials for any course. They adapt to the supplied course and actual project without prescribing a subject area or fixed curriculum. This repository contains prompts, not a generated learning application.

## Choose a prompt

- **Short prompt** — [`prompts/Universal_Study_Platform_Vibe_Coding_Prompt_9400.txt`](prompts/Universal_Study_Platform_Vibe_Coding_Prompt_9400.txt): exactly 9,400 Unicode characters, including spaces and line breaks. Use with systems that impose a prompt-length limit.
- **Full master prompt** — [`prompts/Universal_Study_Platform_Master_Prompt_40000.md`](prompts/Universal_Study_Platform_Master_Prompt_40000.md): exactly 40,000 Unicode characters, including Markdown syntax, spaces, and line breaks. Use for the complete specification.

## Shareable domain — signals-communication

**Public address (works from anywhere, no account):**
`https://cdn.jsdelivr.net/gh/as0z-afk/Universal_Study_Vibe-Coding-Master-Prompt@arena/f07b3e48-universal-study-vibe-coding-ma/index.html`
— served by the jsDelivr CDN from this public repo. The Arena preview
address (`https://8000-<sandbox-id>.e2b.app/signals-communication/`) remains
for development, and an optional one-click `github.io` deployment is
prepared. Full details and backup addresses: see [`DOMAIN.md`](DOMAIN.md).

## Generated study app — ETE225

`index.html` is a self-contained, offline study hub built from the supplied ETE225
lecture compilation and Schaum's *Signals and Systems* (Hsu, Ch.1–7, App.A–D):
**Signals and Communication System — ETE225**. It has 11 modules, 88 authored lesson quizzes plus an Extended Practice
Library of 21,880 unique code-computed drills (21,968 questions total;
Intermediate / Semi-hard / Hard / Tricky), animated labs,
step-by-step calculators (Shannon+Nyquist, dB, sampling/aliasing), glossary,
formula index, offline search, study modes, and local progress backup.
No build, account, or network is needed:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
# or simply open index.html in a browser
```

Full-production build: `index.html` is exactly 10,000,000 Unicode code
points, verified after generation. The bulk is meaningful content only —
21,880 Extended Practice drills whose numbers, answers and worked solutions
are computed from enumerated parameter combinations by `build_full.py`
(zero repeated parameter combinations, zero duplicated stems), plus a
computed numeric reference appendix and pi to a calibrated precision
(Machin formula) filling the final characters exactly. Rebuild any time
with `python3 build_full.py`, then re-check with
`python3 -c "print(len(open('index.html',encoding='utf-8').read()))"`.
The Extended bank is parsed lazily (JSON) only when that view is opened,
so normal study use stays fast.

## Use

Provide one prompt to your coding agent together with the course materials relevant to the current task. Have it inspect the target project's actual files and runtime before making changes. The prompt is designed to adapt to that project rather than assume a particular framework, package, or architecture.

## Publish to GitHub

Create an empty GitHub repository, then run these commands from this folder. Replace `OWNER` and `REPOSITORY` with your GitHub account and repository name.

```bash
git init
git add README.md .gitignore prompts/
git commit -m "Add universal study platform prompts"
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

