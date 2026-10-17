# Shareable domain — signals-communication

## ✅ New public shareable address (works from anywhere, no account)

```text
https://cdn.jsdelivr.net/gh/as0z-afk/Universal_Study_Vibe-Coding-Master-Prompt@arena/f07b3e48-universal-study-vibe-coding-ma/index.html
```

This is served by the jsDelivr CDN directly from this public GitHub repo
(branch `arena/f07b3e48-universal-study-vibe-coding-ma`), so anyone in the
world can open it in a browser — no Arena workspace, login, or server of
yours needed. It always serves the latest pushed build of `index.html`
(jsDelivr caches briefly; add `?v=2`, `?v=3`, … to a shared link to force a
fresh copy right after an update). The app header shows this same address
with a **Copy address** button.

Backup renderers of the same file (in case one CDN is slow in your region):

```text
https://raw.githack.com/as0z-afk/Universal_Study_Vibe-Coding-Master-Prompt/arena/f07b3e48-universal-study-vibe-coding-ma/index.html
https://htmlpreview.github.io/?https://github.com/as0z-afk/Universal_Study_Vibe-Coding-Master-Prompt/blob/arena/f07b3e48-universal-study-vibe-coding-ma/index.html
```

## Production size (120,000,000 characters, sharded)

The full production is exactly **120,000,000 Unicode code points**, split so
no single file breaks GitHub (100 MB/file) or CDN (~20 MB/file) limits:
core app `index.html` 10,000,000 + theory/derivations pack
`production/theory/` 20,000,000 (3,731 entries) + practice mega-pack
`production/practice/` 90,000,000 (195,322 drills), all lazily loaded by
the app (Theory & Derivations view) and served identically from this CDN,
e.g. `.../production/theory/theory-01.json`. Verify with
`python3 verify_production.py`. New in this build: a CAD-style 3D lab
(orbitable resonance/wave/pole surfaces) and a modern aligned UI (v3).

## Optional: a `github.io` domain of your own (one click by you)

A workflow (`.github/workflows/pages.yml`) is ready to deploy this site to:

```text
https://as0z-afk.github.io/Universal_Study_Vibe-Coding-Master-Prompt/
```

GitHub blocked automated Pages activation for this workspace's token
("Resource not accessible by integration") — only the repo owner can flip
this switch, which takes ~20 seconds:

1. Open https://github.com/as0z-afk/Universal_Study_Vibe-Coding-Master-Prompt/settings/pages
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Then open the **Actions** tab → *Deploy ETE225 Study Hub to GitHub Pages*
   → **Run workflow**. Future pushes of `index.html` can be published the
   same way (or ask in this session to re-enable push-triggering).

## Arena preview (development address, this workspace only)

```text
https://8000-<sandbox-id>.e2b.app/signals-communication/
```

The `8000-<sandbox-id>.e2b.app` part is assigned by Arena and cannot be
renamed; `signals-communication` is the preview label + clean path. This
address works only while the workspace preview is running — use the
jsDelivr address above for sharing.

## Local-only alias (your own computer, optional)

```text
127.0.0.1  signals-communication.local
```
in your hosts file + `python3 -m http.server 8000`, then open
`http://signals-communication.local:8000/signals-communication/`.
A `.local` name never works for other people — it is a private shortcut.
