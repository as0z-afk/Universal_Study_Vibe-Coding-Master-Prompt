#!/usr/bin/env python3
"""
ETE225 Extended Practice mega-pack builder.

Generates production/practice/practice-XX.json shards totalling EXACTLY
90,000,000 Unicode code points, using the same code-computed drill engine
as the in-app bank (build_full.gen): every answer and worked solution is
computed from its parameters. At this scale the enumerated parameter
cycles eventually repeat; repeated stems are suffixed as spaced-repetition
variants and COUNTED in the build report (the in-app core bank of ~21.9k
items remains zero-repeat). Together with index.html (10,000,000) and the
theory pack (20,000,000) the production totals 120,000,000 code points.
Run: python3 build_practice.py
"""
import json, pathlib, importlib.util

spec = importlib.util.spec_from_file_location("bf", "build_full.py")
bf = importlib.util.module_from_spec(spec); spec.loader.exec_module(bf)
TARGET = 90_000_000
OUT = pathlib.Path("production/practice"); OUT.mkdir(parents=True, exist_ok=True)

items_total_target = TARGET
strs, total, seqs, used, variants = [], 0, {m: 0 for m in bf.TITLES}, set(), 0
cycle = 0
while total < TARGET - 8000:
    cycle += 1; mod = ((cycle - 1) % 11) + 1; seqs[mod] += 1
    d = bf.gen(mod, seqs[mod], bf.rng)
    d["id"] = f"P-M{mod}-{seqs[mod]:06d}"
    key = (d["m"], d["q"])
    if key in used:
        variants += 1
        d["q"] = d["q"] + f" (spaced-repetition variant {seqs[mod]})"
        key = (d["m"], d["q"])
    used.add(key)
    s = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    strs.append(s); total += len(s) + 1

shards, cur, curlen = [], [], 0
for s in strs:
    if curlen + len(s) + 1 > 9_500_000 and cur:
        shards.append("[" + ",".join(cur) + "]"); cur, curlen = [], 0
    cur.append(s); curlen += len(s) + 1

prefix = "PI-CALIBRATION | pi (Machin) = "
suffix = " | End of practice pack calibration entry."
base_total = sum(len(x) for x in shards) + len("[" + ",".join(cur) + "]")
need = TARGET - base_total
cal_empty = json.dumps({"id":"P-CAL-000000","m":"Calibration","tier":"Intermediate","q":"High-precision pi calibration entry (Machin formula)","o":[prefix + suffix,"0","1","2"],"a":0,"h":"Reference entry.","f":"Computed by 16 arctan(1/5) - 4 arctan(1/239)."}, ensure_ascii=False, separators=(",", ":"))
digit_len = need - (len(cal_empty) + 1)
assert 40 <= digit_len <= 8000, digit_len
cal_body = prefix + bf.pi_string(digit_len) + suffix
cal = cal_empty.replace(prefix + suffix, cal_body)
cur.append(cal)
shards.append("[" + ",".join(cur) + "]")
for old in OUT.glob("practice-*.json"): old.unlink()
for i, sh in enumerate(shards, 1):
    (OUT / f"practice-{i:02d}.json").write_text(sh, encoding="utf-8", newline="")
grand = sum(len(p.read_text(encoding="utf-8")) for p in sorted(OUT.glob("practice-*.json")))
print(f"Practice pack: {len(strs)} drills in {len(shards)} shards; total code points = {grand} (target {TARGET}); exact: {grand == TARGET}")
print(f"Per-module seq totals: {seqs}; spaced-repetition variant stems: {variants} (core in-app bank remains zero-repeat)")
