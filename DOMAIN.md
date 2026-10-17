# Virtual domain — signals-communication

Assigned: **signals-communication** on the Arena preview domain (no domain
purchase or DNS account needed).

## Public virtual address (shareable)

```text
https://8000-<sandbox-id>.e2b.app/signals-communication/
```

- `8000` = the port the hub is served on; `<sandbox-id>` is assigned by Arena
  for this workspace and is shown in the LIVE PREVIEW address bar. It cannot be
  renamed — Arena generates that part.
- `signals-communication` = your chosen virtual-domain name. It is both the
  preview label and the clean path above, and the app header shows the full
  live address with a **Copy address** button.
- Opening `/signals-communication/` redirects into the hub (`index.html`).
  The root address `https://8000-<sandbox-id>.e2b.app/` opens it directly too.
- Anyone opening the link must have the preview running (started from this
  workspace); once opened, the hub itself works fully offline.

## Optional local-only alias (your own computer)

For a `.local` name that works only on your machine/network, add one line to
your hosts file, then run the server locally:

```text
127.0.0.1  signals-communication.local
```

```bash
python3 -m http.server 8000   # then open http://signals-communication.local:8000/signals-communication/
```

- Windows hosts file: `C:\Windows\System32\drivers\etc\hosts` (edit as Administrator)
- macOS/Linux hosts file: `/etc/hosts` (edit with `sudo`)

A `.local` alias does **not** work for other people on the internet — use the
Arena preview address above to share.

## If you later want a permanent public domain

Free options that serve this same `index.html` unchanged: GitHub Pages
(`<user>.github.io/...`), Cloudflare Pages, or Netlify Drop. A custom owned
domain can then be attached with a `CNAME` record pointing at that host.
Note: the served `index.html` is the full 10,000,000-code-point production
build; both the root address and `/signals-communication/` serve it.
Ask in this session and the deploy config for your chosen host will be added.
