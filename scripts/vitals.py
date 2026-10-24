#!/usr/bin/env python3
"""Render the last 52 weeks of GitHub contributions as a patient-monitor ECG.

Each week is one heartbeat; the R-peak height follows that week's contribution
count, so quiet weeks flatline and busy weeks spike. Stdlib only, so it runs on
a bare GitHub Actions runner.

    python3 scripts/vitals.py --login Bkroland19 --out dist/vitals.svg
"""
import argparse
import base64
import datetime as dt
import json
import math
import os
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

BG, GRID, MINT, VIOLET, BLUE, AMBER, PINK = "#070614", "#00FFC8", "#00FFC8", "#8B7CFF", "#4C8DFF", "#FFC857", "#FF6AC1"
TEXT, DIM = "#EDEEFF", "#6F6B9E"


def fetch_graphql(login, token):
    query = """query($login:String!){user(login:$login){contributionsCollection{
      contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}"""
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": query, "variables": {"login": login}}).encode(),
        headers={"Authorization": f"bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    weeks = data["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"]
    return {d["date"]: d["contributionCount"] for w in weeks for d in w["contributionDays"]}


def fetch_html(login):
    req = urllib.request.Request(
        f"https://github.com/users/{login}/contributions", headers={"User-Agent": "vitals-card"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        html = r.read().decode()
    ids = dict((m[1], m[0]) for m in re.findall(r'data-date="([^"]+)" id="([^"]+)"', html))
    days = {}
    for cell, label in re.findall(r'for="([^"]+)"[^>]*>([^<]*)</tool-tip>', html):
        if cell in ids:
            m = re.match(r"([\d,]+)", label)
            days[ids[cell]] = int(m[1].replace(",", "")) if m else 0
    if not days:
        raise RuntimeError("could not parse contribution calendar")
    return days


def stats(days):
    dates = sorted(days)
    counts = [days[d] for d in dates]
    longest = run = 0
    for c in counts:
        run = run + 1 if c else 0
        longest = max(longest, run)
    weeks = [sum(counts[k : k + 7]) for k in range(max(0, len(counts) - 364), len(counts), 7)]
    return {
        "total": sum(counts),
        "active": sum(1 for c in counts if c),
        "longest": longest,
        "weeks": weeks[-52:],
        "first": dt.date.fromisoformat(dates[max(0, len(dates) - 364)]),
    }


def ecg_path(weeks, x0, x1, base, amp):
    peak = max(max(weeks), 1)
    seg = (x1 - x0) / len(weeks)
    pts = [(x0, base)]
    for i, c in enumerate(weeks):
        s = x0 + i * seg
        if c == 0:
            pts += [(s + seg * 0.5, base - 1.5), (s + seg, base)]
            continue
        h = amp * (0.18 + 0.82 * math.sqrt(c / peak))
        pts += [
            (s + seg * 0.14, base), (s + seg * 0.22, base - h * 0.08), (s + seg * 0.30, base),  # P wave
            (s + seg * 0.38, base), (s + seg * 0.43, base + h * 0.12),                        # Q
            (s + seg * 0.50, base - h),                                                       # R
            (s + seg * 0.57, base + h * 0.22), (s + seg * 0.63, base),                        # S
            (s + seg * 0.74, base - h * 0.14), (s + seg * 0.86, base), (s + seg, base),       # T wave
        ]
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)


def font_face(name, weight):
    b64 = base64.b64encode((ROOT / "assets" / "fonts" / name).read_bytes()).decode()
    return f"@font-face{{font-family:'VMono';font-weight:{weight};src:url(data:font/woff2;base64,{b64}) format('woff2');}}"


def render(s, login):
    W, H = 1200, 300
    x0, x1, base, amp = 40, 820, 200, 112
    path = ecg_path(s["weeks"], x0, x1, base, amp)
    today = dt.datetime.now(dt.timezone.utc).date()

    months, seg = [], (x1 - x0) / max(len(s["weeks"]), 1)
    for i in range(len(s["weeks"])):
        d = s["first"] + dt.timedelta(days=7 * i)
        if d.day <= 7:
            months.append(f'<text x="{x0 + i * seg:.1f}" y="{H - 22}" class="m" font-size="11" fill="{DIM}">{d.strftime("%b").upper()}</text>')

    def readout(x, y, label, value, unit, color):
        return (
            f'<text x="{x}" y="{y}" class="m" font-size="11" letter-spacing="1.5" fill="{DIM}">{label}</text>'
            f'<text x="{x}" y="{y + 44}" class="m" font-weight="700" font-size="40" fill="{color}">{value}</text>'
            f'<text x="{x}" y="{y + 64}" class="m" font-size="11" fill="{DIM}">{unit}</text>'
        )

    heart = (
        f'<g transform="translate(1160 35)"><path d="M-10-3C-10-9-2-11 0-5 2-11 10-9 10-3 10 3 0 9 0 11 0 9-10 3-10-3Z" fill="{PINK}">'
        f'<animateTransform attributeName="transform" type="scale" values="1;1.25;1;1.15;1" keyTimes="0;.12;.3;.42;1" dur="1.1s" repeatCount="indefinite"/></path></g>'
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t d">
<title id="t">Vital signs — GitHub activity for {login}</title>
<desc id="d">{s['total']} contributions in the last year, {s['active']} active days, busiest week {max(s['weeks'], default=0)} contributions, longest streak {s['longest']} days.</desc>
<style>{font_face('mono.woff2', 400)}{font_face('mono-bold.woff2', 700)}.m{{font-family:VMono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}}</style>
<defs>
  <pattern id="minor" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="{GRID}" stroke-opacity=".05"/></pattern>
  <pattern id="major" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#minor)"/><path d="M100 0H0V100" fill="none" stroke="{GRID}" stroke-opacity=".09"/></pattern>
  <filter id="glow" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="frame"><rect width="{W}" height="{H}" rx="18"/></clipPath>
</defs>
<g clip-path="url(#frame)">
  <rect width="{W}" height="{H}" fill="{BG}"/>
  <rect x="20" y="64" width="820" height="200" fill="url(#major)"/>
  <text x="40" y="40" class="m" font-weight="700" font-size="15" letter-spacing="3" fill="{MINT}">VITAL SIGNS</text>
  <text x="196" y="40" class="m" font-size="12" fill="{DIM}">github.com/{login} · weekly activity as heartbeats · updated {today.isoformat()}</text>
  <path d="{path}" fill="none" stroke="{MINT}" stroke-opacity=".18" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="{path}" fill="none" stroke="{MINT}" stroke-width="2" stroke-linejoin="round" filter="url(#glow)" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1">
    <animate attributeName="stroke-dashoffset" values="1;0;0" keyTimes="0;.86;1" dur="7s" repeatCount="indefinite"/>
  </path>
  <circle r="4" fill="#fff" filter="url(#glow)"><animateMotion path="{path}" keyPoints="0;1;1" keyTimes="0;.86;1" calcMode="linear" dur="7s" repeatCount="indefinite"/></circle>
  {''.join(months)}
  <line x1="860" y1="64" x2="860" y2="264" stroke="#fff" stroke-opacity=".07"/>
  {readout(890, 84, "CONTRIB · 12M", f"{s['total']:,}", "contributions", MINT)}
  {readout(1045, 84, "ACTIVE", s['active'], "days in 52 wks", BLUE)}
  {readout(890, 190, "PEAK WEEK", max(s['weeks'], default=0), "contributions", AMBER)}
  {readout(1045, 190, "LONGEST", s['longest'], "days in a row", VIOLET)}
  {heart}
</g>
<rect x=".75" y=".75" width="{W - 1.5}" height="{H - 1.5}" rx="18" fill="none" stroke="{MINT}" stroke-opacity=".22" stroke-width="1.5"/>
</svg>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--login", required=True)
    ap.add_argument("--out", default="dist/vitals.svg")
    a = ap.parse_args()
    token = os.environ.get("GITHUB_TOKEN")
    try:
        days = fetch_graphql(a.login, token) if token else fetch_html(a.login)
    except Exception as e:  # GraphQL hiccup: fall back to the public calendar
        print(f"graphql failed ({e}); falling back to public calendar")
        days = fetch_html(a.login)
    s = stats(days)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(s, a.login))
    print(f"wrote {out}: {s['total']} contributions, {s['active']} active days, longest streak {s['longest']}")


if __name__ == "__main__":
    main()
