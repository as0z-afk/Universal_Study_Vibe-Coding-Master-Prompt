#!/usr/bin/env python3
"""Assemble the single-file ETE225 study application.

Reads the fragments in app/src, renders the formula expressions to HTML,
injects every asset into app/src/template.html and writes app/dist/ete225.html.
No external packages are required.
"""
from __future__ import annotations

import html
import json
import re
import subprocess
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent / "src"
DIST = Path(__file__).resolve().parent / "dist"
sys.path.insert(0, str(SRC))

import data  # noqa: E402  (local module, path inserted above)

# --------------------------------------------------------------------------
# LaTeX-subset renderer for formula cards
# --------------------------------------------------------------------------

GREEK = {
    "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "Delta": "Δ",
    "epsilon": "ε", "zeta": "ζ", "eta": "η", "theta": "θ", "Theta": "Θ",
    "kappa": "κ", "lambda": "λ", "Lambda": "Λ", "mu": "μ", "nu": "ν",
    "xi": "ξ", "pi": "π", "Pi": "Π", "rho": "ρ", "sigma": "σ", "Sigma": "Σ",
    "tau": "τ", "upsilon": "υ", "phi": "φ", "Phi": "Φ", "chi": "χ",
    "psi": "ψ", "omega": "ω", "Omega": "Ω", "infty": "∞", "partial": "∂",
    "nabla": "∇", "sum": "∑", "int": "∫", "prod": "∏", "sqrt": "√",
    "cdots": "⋯", "ldots": "…", "vdots": "⋮", "dots": "…",
}
OPS = {
    "cdot": "·", "times": "×", "div": "÷", "pm": "±", "mp": "∓",
    "approx": "≈", "le": "≤", "leq": "≤", "ge": "≥", "geq": "≥",
    "ne": "≠", "neq": "≠", "to": "→", "rightarrow": "→", "leftarrow": "←",
    "Rightarrow": "⇒", "Leftarrow": "⇐", "implies": "⟹", "mapsto": "↦",
    "leftrightarrow": "↔", "Leftrightarrow": "⇔", "Longleftrightarrow": "⟺",
    "iff": "⟺", "angle": "∠", "perp": "⊥", "parallel": "∥",
    "quad": " ", "qquad": "  ", ";": " ", ":": " ", ",": "", "!": "",
    "displaystyle": "", "limits": "",
}
FUNCS = {
    "cos": "cos", "sin": "sin", "tan": "tan", "cot": "cot", "sec": "sec",
    "log": "log", "ln": "ln", "exp": "exp", "lim": "lim", "max": "max",
    "min": "min", "sinc": "sinc", "rect": "rect", "sgn": "sgn", "arg": "arg",
    "det": "det", "diag": "diag", "rank": "rank",
}


def _group(s: str, i: int) -> tuple[str, int]:
    """Read a {...} group starting at s[i] == '{' and return (content, next)."""
    if i >= len(s) or s[i] != "{":
        # single token
        if i < len(s) and s[i] == "\\":
            j = i + 1
            while j < len(s) and s[j].isalpha():
                j += 1
            return s[i:j], j
        return (s[i] if i < len(s) else ""), i + 1
    depth = 0
    j = i
    while j < len(s):
        if s[j] == "{":
            depth += 1
        elif s[j] == "}":
            depth -= 1
            if depth == 0:
                return s[i + 1:j], j + 1
        j += 1
    return s[i + 1:], len(s)


def tex(s: str) -> str:
    """Render a small, well-behaved subset of LaTeX to accessible HTML."""
    out: list[str] = []
    i = 0
    n = len(s)
    while i < n:
        ch = s[i]
        if ch == "\\":
            # matrix environments
            m = re.match(r"\\begin\{([bpv]?matrix)\}", s[i:])
            if m:
                env = m.group(1)
                end = s.find("\\end{%s}" % env, i)
                if end < 0:
                    end = n
                body = s[i + m.end():end]
                rows = [r for r in body.split("\\\\")]
                cells = [r.split("&") for r in rows]
                ncols = max(len(r) for r in cells) if cells else 1
                cols = []
                for c in range(ncols):
                    col = "".join(
                        '<span>%s</span>' % tex(r[c].strip())
                        for r in cells if c < len(r) and r[c].strip() != ""
                    )
                    cols.append('<span class="mcol">%s</span>' % col)
                out.append('<span class="mat">%s</span>' % "".join(cols))
                i = end + len("\\end{%s}" % env)
                continue
            m = re.match(r"\\([A-Za-z]+)", s[i:])
            if m:
                name = m.group(1)
                j = i + m.end()
                if name in ("frac", "dfrac", "tfrac"):
                    num, j = _group(s, j)
                    den, j = _group(s, j)
                    out.append('<span class="frac"><span>%s</span><span>%s</span></span>'
                               % (tex(num), tex(den)))
                    i = j
                    continue
                if name in ("mathbf", "mathcal", "mathbb", "mathrm", "text", "operatorname"):
                    body, j = _group(s, j)
                    cls = "txt" if name in ("text", "mathrm", "operatorname") else ""
                    inner = tex(body) if name not in ("text", "operatorname") else html.escape(body)
                    out.append('<span class="%s">%s</span>' % (cls, inner) if cls else inner)
                    i = j
                    continue
                if name in ("left", "right", "big", "Big", "bigl", "bigr"):
                    i = j
                    if i < n and s[i] == ".":
                        i += 1
                    continue
                if name == "sqrt":
                    body, j = _group(s, j)
                    out.append("√<span class=\"op\">%s</span>" % tex(body))
                    i = j
                    continue
                if name in ("dot", "bar", "hat", "tilde", "vec"):
                    body, j = _group(s, j)
                    mark = {"dot": "\u0307", "bar": "\u0304", "hat": "\u0302", "tilde": "\u0303", "vec": "\u20d7"}[name]
                    out.append(tex(body) + mark)
                    i = j
                    continue
                if name in GREEK:
                    out.append('<span class="op">%s</span>' % GREEK[name])
                    i = j
                    continue
                if name in OPS:
                    val = OPS[name]
                    out.append('<span class="op">%s</span>' % val if val.strip() and val != " " else " ")
                    i = j
                    continue
                if name in FUNCS:
                    out.append('<span class="txt">%s</span>' % FUNCS[name])
                    i = j
                    continue
                # unknown command: drop the backslash, keep the word
                out.append(html.escape(name))
                i = j
                continue
            # escaped character such as \{ or \,
            if i + 1 < n:
                val = OPS.get(s[i + 1], s[i + 1])
                if val:
                    out.append(html.escape(val) if val not in "{}%$&#_" else val)
                i += 2
                continue
            i += 1
            continue
        if ch in "^_":
            tag = "sup" if ch == "^" else "sub"
            body, j = _group(s, i + 1)
            out.append("<%s>%s</%s>" % (tag, tex(body), tag))
            i = j
            continue
        if ch == "{":
            body, j = _group(s, i)
            out.append(tex(body))
            i = j
            continue
        if ch == "}":
            i += 1
            continue
        if ch == "&":
            out.append(" ")
            i += 1
            continue
        if ch == "~":
            out.append(" ")
            i += 1
            continue
        if ch == "-":
            out.append("−")
            i += 1
            continue
        if ch == "<":
            out.append("&lt;")
            i += 1
            continue
        if ch == ">":
            out.append("&gt;")
            i += 1
            continue
        if ch == "*":
            out.append("∗")
            i += 1
            continue
        out.append(html.escape(ch))
        i += 1
    return "".join(out)


# --------------------------------------------------------------------------
# Data assembly
# --------------------------------------------------------------------------

def build_data() -> dict:
    formulas = []
    for idx, f in enumerate(data.FORMULAS, start=1):
        formulas.append({
            "id": "f%02d" % idx,
            "name": f["name"],
            "html": tex(f["expr"]),
            "symbols": [[a, b] for a, b in f["symbols"]],
            "note": f["note"],
            "module": f["module"],
        })
    return {
        "course": data.COURSE,
        "glossary": [list(g) for g in data.GLOSSARY],
        "formulas": formulas,
        "abbreviations": [list(a) for a in data.ABBREVIATIONS],
    }


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> int:
    template = read(SRC / "template.html")
    styles = read(SRC / "styles.css")

    module_files = sorted(
        (SRC / "modules").glob("module-*.html"),
        key=lambda p: int(re.search(r"module-(\d+)\.html$", p.name).group(1)),
    )
    modules = "\n".join(read(p) for p in module_files)

    core = read(SRC / "js" / "core.js")
    plot = read(SRC / "js" / "plot.js")
    labs = "\n".join(read(SRC / "js" / name) for name in (
        "plot.js", "labs.js", "labs2.js", "labs3.js", "mount.js"))
    bank = "\n".join(read(SRC / "js" / name) for name in (
        "bank.js", "bank-m3m4.js", "bank-m5m6.js", "bank-m7m9.js"))

    payload = build_data()
    data_json = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))

    # The validated question bank is embedded so that every item ships with
    # the page and the runtime does not have to regenerate it.
    bank_proc = subprocess.run(
        ["node", str(Path(__file__).resolve().parent / "serialize_bank.js")],
        check=True, capture_output=True, text=True)
    bank_json = bank_proc.stdout.replace("</script", "<\\/script")
    if len(bank_json) < 1000:
        raise SystemExit("bank serialisation failed: %r" % bank_proc.stderr[:400])

    checks: list[str] = []
    checks.append("modules=%d" % len(module_files))
    if len(module_files) != 9:
        raise SystemExit("expected 9 module fragments, found %d" % len(module_files))

    ids = re.findall(r'\sid="([^"]+)"', template + modules)
    dupes = sorted({x for x in ids if ids.count(x) > 1})
    if dupes:
        raise SystemExit("duplicate ids: %s" % ", ".join(dupes))

    # Every lab/projection key must exist in the JavaScript registry.
    lab_keys = set(re.findall(r"L\.types\.([a-zA-Z0-9_]+)\s*=", labs))
    proj_keys = set(re.findall(r'PROJECTIONS\.([a-zA-Z0-9_]+)\s*=', plot))
    for m in re.finditer(r'data-lab="([^"]+)"', modules):
        if m.group(1) not in lab_keys:
            raise SystemExit("unknown lab key %r (have %s)" % (m.group(1), sorted(lab_keys)))
    for m in re.finditer(r'data-projection="([^"]+)"', modules):
        if m.group(1) not in proj_keys:
            raise SystemExit("unknown projection key %r (have %s)" % (m.group(1), sorted(proj_keys)))
    checks.append("labs=%d projections=%d" % (len(lab_keys), len(proj_keys)))
    checks.append("bank chars=%d" % len(bank_json))

    out = template
    for token, value in (
        ("{{STYLES}}", styles),
        ("{{MODULES}}", modules),
        ("{{DATA}}", data_json),
        ("{{BANK_DATA}}", bank_json),
        ("{{CORE_JS}}", core),
        ("{{LABS_JS}}", labs),
        ("{{BANK_JS}}", bank),
    ):
        if token not in out:
            raise SystemExit("missing token %s" % token)
        out = out.replace(token, value)

    if "{{" in out:
        leftover = re.findall(r"\{\{[A-Z_]+\}\}", out)
        raise SystemExit("unreplaced tokens: %s" % leftover)

    DIST.mkdir(parents=True, exist_ok=True)
    target = DIST / "ete225.html"
    target.write_text(out, encoding="utf-8")

    n = len(out)
    print("wrote", target)
    for c in checks:
        print(" ", c)
    print("  code points: %d" % n)
    print("  bytes: %d" % len(out.encode("utf-8")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
