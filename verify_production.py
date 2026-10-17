#!/usr/bin/env python3
"""Verify the 120,000,000-character ETE225 production exactly.

Counted production set (Unicode code points, UTF-8 read):
  index.html (core app)                       10,000,000
  production/theory/*.json  (derivations)     20,000,000
  production/practice/*.json (mega drills)    90,000,000
  TOTAL                                      120,000,000
Manifest and docs are not counted. Run: python3 verify_production.py
"""
import json, pathlib, sys

def count(p): return len(pathlib.Path(p).read_text(encoding="utf-8"))

core = count("index.html")
theory_files = sorted(pathlib.Path("production/theory").glob("*.json"))
practice_files = sorted(pathlib.Path("production/practice").glob("*.json"))
theory = sum(count(p) for p in theory_files)
practice = sum(count(p) for p in practice_files)
total = core + theory + practice
th_entries = sum(len(json.loads(p.read_text(encoding="utf-8"))) for p in theory_files)
pr_entries = sum(len(json.loads(p.read_text(encoding="utf-8"))) for p in practice_files)
print(f"core index.html      : {core:>12,}  (target 10,000,000)")
print(f"theory pack          : {theory:>12,}  in {len(theory_files)} shards, {th_entries:,} derivation entries (target 20,000,000)")
print(f"practice mega-pack   : {practice:>12,}  in {len(practice_files)} shards, {pr_entries:,} drills (target 90,000,000)")
print(f"TOTAL PRODUCTION     : {total:>12,}  (target 120,000,000)")
ok = core == 10_000_000 and theory == 20_000_000 and practice == 90_000_000 and total == 120_000_000
print("VERDICT:", "PASS — exact" if ok else "FAIL")
sys.exit(0 if ok else 1)
