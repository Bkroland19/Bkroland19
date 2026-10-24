// Builds the static animated SVGs for the Bkroland19 profile README.
// Usage: npm i opentype.js@1.3.4 subset-font@2.3.0 && node scripts/build-assets.mjs .
// Fonts (Inter, JetBrains Mono NL; both OFL) are read from $FONTS_DIR, default ~/.local/share/fonts.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import opentype from 'opentype.js';
import subsetFont from 'subset-font';

const OUT = path.resolve(process.argv[2] ?? '.');
const FONTS = process.env.FONTS_DIR ?? path.join(os.homedir(), '.local/share/fonts');
const F = {
  interBold: path.join(FONTS, 'Inter/Inter-Bold.ttf'),
  interSemi: path.join(FONTS, 'Inter/Inter-SemiBold.ttf'),
  interMed: path.join(FONTS, 'Inter/Inter-Medium.ttf'),
  mono: path.join(FONTS, 'JetBrainsMono/JetBrainsMonoNL-Regular.ttf'),
  monoBold: path.join(FONTS, 'JetBrainsMono/JetBrainsMonoNL-Bold.ttf'),
};

const C = {
  bg: '#0A081E', bar: '#1E163A', panel: '#120F2E', mint: '#00FFC8', violet: '#8B7CFF',
  blue: '#4C8DFF', pink: '#FF6AC1', amber: '#FFC857', text: '#EDEEFF', muted: '#B4B1DD', dim: '#6F6B9E',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (n) => Math.round(n * 100) / 100;

async function fontFace(family, file, text, weight = 400) {
  const chars = [...new Set(text)].join('');
  const buf = await subsetFont(fs.readFileSync(file), chars, { targetFormat: 'woff2' });
  return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}`;
}

function textWidth(file, text, size) {
  const f = opentype.loadSync(file);
  return f.getAdvanceWidth(text, size);
}

// Seeded PRNG so rebuilds are stable.
function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/* ───────────────────────── HERO ───────────────────────── */
async function hero() {
  const W = 1200, H = 420;
  const name = 'Bukenya Kizza Roland';
  const role = 'Senior DevOps & Full-Stack Engineer';
  const tag = [
    'I build public-health and SaaS platforms that keep',
    'working through outbreaks, 2G networks and offline clinics.',
  ];
  const status = 'online · kampala, uganda · utc+3 · 6+ yrs in production';
  const prompt = '$ now shipping: ';
  const phrases = [
    'national outbreak alert pipelines',
    'USSD data capture that works on 2G',
    'multi-agent AI over MCP + RAG',
    'Terraform-managed AWS environments',
    'offline-first clinical guidance apps',
    'CI/CD with zero config drift',
  ];
  const nodes = ['USSD', 'WEB', 'MOBILE', 'DHIS2', 'POSTGRES', 'AGENTS', 'API', 'go · nest', 'signals in  →  verified alerts out'];

  // Name as glyph paths so it renders identically everywhere and can be "drawn".
  const fb = opentype.loadSync(F.interBold);
  let nameSize = 58;
  while (fb.getAdvanceWidth(name, nameSize) > 640) nameSize -= 1;
  const nx = 64, ny = 172;
  const glyphs = fb.getPaths(name, nx, ny, nameSize).map((p) => p.toPathData(2)).filter((d) => d.length > 0);
  const nameW = fb.getAdvanceWidth(name, nameSize);

  const monoCSS = await fontFace('BKMono', F.mono, status + prompt + phrases.join('') + nodes.join(''));
  const semiCSS = await fontFace('BKSans', F.interSemi, role, 600);
  const medCSS = await fontFace('BKSans', F.interMed, tag.join(''), 500);

  const rand = rng(20261024);
  const stars = Array.from({ length: 26 }, () => {
    const x = r2(rand() * W), y = r2(rand() * H * 0.9), r = r2(0.6 + rand() * 1.3);
    const d = r2(2.5 + rand() * 4), b = r2(rand() * 4);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".15"><animate attributeName="opacity" values=".1;.85;.1" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`;
  }).join('');

  const glyphEls = glyphs.map((d, i) => {
    const b = r2(0.15 + i * 0.06);
    return `<path d="${d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="url(#nameFill)" fill-opacity="0" stroke="${C.mint}" stroke-width="1.2">` +
      `<animate attributeName="stroke-dashoffset" from="1" to="0" begin="${b}s" dur="0.9s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>` +
      `<animate attributeName="fill-opacity" from="0" to="1" begin="${r2(b + 0.7)}s" dur="0.6s" fill="freeze"/>` +
      `<animate attributeName="stroke-opacity" from="1" to="0" begin="${r2(b + 1.1)}s" dur="0.6s" fill="freeze"/></path>`;
  }).join('');
  const nameDone = r2(0.15 + glyphs.length * 0.06 + 1.2);

  // Rotating typewriter line.
  const fontSize = 17, cw = fontSize * 0.6;
  const px = 64, py = 352;
  const promptW = prompt.length * cw;
  const typeT = 0.055, holdT = 1.9, delT = 0.022, gapT = 0.35;
  const spans = phrases.map((p) => p.length * typeT + holdT + p.length * delT + gapT);
  const cycle = spans.reduce((a, b) => a + b, 0);
  let t0 = 0;
  const cursorKeys = [];
  const phraseEls = phrases.map((p, i) => {
    const keys = [[0, 0]];
    for (let c = 1; c <= p.length; c++) keys.push([t0 + c * typeT, c * cw]);
    const tHold = t0 + p.length * typeT + holdT;
    for (let c = p.length - 1; c >= 0; c--) keys.push([tHold + (p.length - c) * delT, c * cw]);
    keys.forEach(([t, w]) => { if (t > 0 || i === 0) cursorKeys.push([t, w]); });
    t0 += spans[i];
    const kt = keys.map(([t]) => (t / cycle).toFixed(5)).join(';');
    const kv = keys.map(([, w]) => r2(w)).join(';');
    return `<clipPath id="ph${i}"><rect x="${px + promptW}" y="${py - 16}" width="0" height="24"><animate attributeName="width" values="${kv}" keyTimes="${kt}" dur="${r2(cycle)}s" begin="${nameDone}s" calcMode="discrete" repeatCount="indefinite"/></rect></clipPath>` +
      `<text x="${px + promptW}" y="${py}" clip-path="url(#ph${i})" class="mono" font-size="${fontSize}" fill="${C.mint}">${esc(p)}</text>`;
  }).join('');
  cursorKeys.sort((a, b) => a[0] - b[0]);
  const dedup = cursorKeys.filter((k, i) => i === 0 || k[0] !== cursorKeys[i - 1][0]);
  const cursorAnim = `<animate attributeName="x" values="${dedup.map(([, w]) => r2(px + promptW + w + 2)).join(';')}" keyTimes="${dedup.map(([t]) => (t / cycle).toFixed(5)).join(';')}" dur="${r2(cycle)}s" begin="${nameDone}s" calcMode="discrete" repeatCount="indefinite"/>`;

  // Topology graphic on the right.
  const inX = 812, coreX = 968, outX = 1118, coreY = 214, rows = [124, 214, 304];
  const nodeBox = (cx, cy, label, color) =>
    `<g><rect x="${cx - 48}" y="${cy - 15}" width="96" height="30" rx="8" fill="${C.panel}" stroke="${color}" stroke-opacity=".55"/>` +
    `<text x="${cx}" y="${cy + 4.5}" text-anchor="middle" class="mono" font-size="12" letter-spacing="1" fill="${C.text}">${label}</text></g>`;
  const edgesIn = rows.map((y) => `M${inX + 48} ${y} C ${inX + 95} ${y}, ${coreX - 85} ${coreY}, ${coreX - 36} ${coreY}`);
  const edgesOut = rows.map((y) => `M${coreX + 36} ${coreY} C ${coreX + 85} ${coreY}, ${outX - 95} ${y}, ${outX - 48} ${y}`);
  const edgeEls = [...edgesIn, ...edgesOut].map((d) =>
    `<path d="${d}" fill="none" stroke="#3B3670" stroke-width="1.4" stroke-dasharray="4 6"><animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite"/></path>`).join('');
  const packet = (d, color, begin, dur) =>
    `<circle r="3.2" fill="${color}" filter="url(#glow)" opacity="0"><animateMotion path="${d}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .55 1"/>` +
    `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
  const packets = [
    ...edgesIn.map((d, i) => packet(d, C.mint, r2(0.6 + i * 0.7), 2.1)),
    ...edgesOut.map((d, i) => packet(d, C.violet, r2(1.6 + i * 0.7), 2.1)),
  ].join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
<title id="t">${esc(name)} — ${esc(role)}</title>
<desc id="d">${esc(tag.join(' '))}</desc>
<style>${monoCSS}${semiCSS}${medCSS}
.mono{font-family:BKMono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.sans{font-family:BKSans,Inter,'Segoe UI',Ubuntu,Helvetica,Arial,sans-serif}
</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
  <filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nameFill" y1="0" y2="0" gradientUnits="userSpaceOnUse" x1="${nx}" x2="${r2(nx + nameW)}">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#E4E2FF"/><stop offset="1" stop-color="#B9F7EA"/>
  </linearGradient>
  <linearGradient id="roleFill" x1="0" x2="1">
    <stop offset="0" stop-color="${C.mint}"/><stop offset="1" stop-color="${C.blue}"/>
  </linearGradient>
  <linearGradient id="sheen" x1="0" x2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="fade" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#fff" fill-opacity=".09"/></pattern>
  <mask id="nameMask">${glyphs.map((d) => `<path d="${d}" fill="#fff"/>`).join('')}</mask>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <g filter="url(#blur)">
    <ellipse cx="300" cy="-30" rx="430" ry="150" fill="${C.violet}" opacity=".55"><animateTransform attributeName="transform" type="translate" values="0 0;140 30;0 0" dur="18s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="930" cy="40" rx="360" ry="120" fill="${C.mint}" opacity=".38"><animateTransform attributeName="transform" type="translate" values="0 0;-160 50;0 0" dur="15s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="1080" cy="430" rx="320" ry="120" fill="${C.blue}" opacity=".40"><animateTransform attributeName="transform" type="translate" values="0 0;-120 -30;0 0" dur="20s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="160" cy="460" rx="300" ry="110" fill="${C.pink}" opacity=".18"><animateTransform attributeName="transform" type="translate" values="0 0;120 -20;0 0" dur="22s" repeatCount="indefinite"/></ellipse>
  </g>
  <rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#gridMask)"/>
  ${stars}

  <g>
    <circle cx="${px + 6}" cy="88" r="5" fill="${C.mint}"/>
    <circle cx="${px + 6}" cy="88" r="5" fill="none" stroke="${C.mint}"><animate attributeName="r" values="5;13" dur="1.8s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".8;0" dur="1.8s" repeatCount="indefinite"/></circle>
    <text x="${px + 22}" y="93" class="mono" font-size="14" letter-spacing=".4" fill="${C.muted}">${esc(status)}</text>
  </g>

  <g>${glyphEls}</g>
  <rect x="${nx - 200}" y="${ny - nameSize}" width="160" height="${nameSize + 20}" fill="url(#sheen)" mask="url(#nameMask)" opacity=".0">
    <animate attributeName="opacity" to=".9" begin="${nameDone}s" dur=".01s" fill="freeze"/>
    <animate attributeName="x" values="${nx - 200};${r2(nx + nameW + 40)}" begin="${nameDone}s;sheenLoop.end+5s" dur="1.6s" id="sheenLoop" fill="freeze"/>
  </rect>

  <text x="${px}" y="220" class="sans" font-weight="600" font-size="26" fill="url(#roleFill)" opacity="0">${esc(role)}
    <animate attributeName="opacity" from="0" to="1" begin="${r2(nameDone - 0.9)}s" dur=".8s" fill="freeze"/>
  </text>
  <g class="sans" font-weight="500" font-size="18" fill="${C.muted}" opacity="0">
    <text x="${px}" y="266">${esc(tag[0])}</text>
    <text x="${px}" y="292">${esc(tag[1])}</text>
    <animate attributeName="opacity" from="0" to="1" begin="${r2(nameDone - 0.5)}s" dur=".8s" fill="freeze"/>
  </g>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" begin="${r2(nameDone - 0.2)}s" dur=".5s" fill="freeze"/>
    <text x="${px}" y="${py}" class="mono" font-size="${fontSize}" fill="${C.dim}">${esc(prompt)}</text>
    ${phraseEls}
    <rect x="${px + promptW + 2}" y="${py - 14}" width="${r2(cw * 0.9)}" height="18" fill="${C.mint}">${cursorAnim}<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" repeatCount="indefinite"/></rect>
  </g>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" begin=".4s" dur="1.2s" fill="freeze"/>
    ${edgeEls}
    ${packets}
    ${rows.map((y, i) => nodeBox(inX, y, ['USSD', 'WEB', 'MOBILE'][i], C.mint)).join('')}
    ${rows.map((y, i) => nodeBox(outX, y, ['DHIS2', 'POSTGRES', 'AGENTS'][i], C.violet)).join('')}
    <circle cx="${coreX}" cy="${coreY}" r="36" fill="none" stroke="${C.mint}"><animate attributeName="r" values="36;58" dur="2.4s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".6;0" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="${coreX}" cy="${coreY}" r="36" fill="${C.panel}" stroke="${C.mint}" stroke-width="1.6"/>
    <text x="${coreX}" y="${coreY + 2}" text-anchor="middle" class="mono" font-size="15" letter-spacing="2" fill="${C.mint}">API</text>
    <text x="${coreX}" y="${coreY + 17}" text-anchor="middle" class="mono" font-size="9.5" fill="${C.dim}">go · nest</text>
    <text x="${coreX}" y="368" text-anchor="middle" class="mono" font-size="12" letter-spacing=".5" fill="${C.dim}">signals in  →  verified alerts out</text>
  </g>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="#fff" stroke-opacity=".08"/>
</svg>`;
  return svg;
}

/* ───────────────────────── TERMINAL ───────────────────────── */
async function terminal() {
  const W = 1200, pad = 34, fs_ = 16, cw = fs_ * 0.6, lh = 27, top = 70;
  const cols = { name: 19, status: 27 };
  const rows = [
    ['ebola-alerts', 'Up · outbreak response', 'national EBS signals → triage → verified alerts'],
    ['ussd-capture', 'Up · works on 2G', 'structured health reports, no smartphone needed'],
    ['dhis2-bridge', 'Up · syncing', 'DHIS2 + JMS feeds → real-time ops dashboards'],
    ['mediguide', 'Up · offline-first', 'clinical guidelines: Go API, RAG worker, Flutter'],
    ['agent-runtime', 'Up · MCP + tool calls', 'multi-agent RAG pipelines in multi-tenant SaaS'],
    ['infra', 'Up · terraform apply', 'AWS dev/prod · Docker · GitHub Actions CI/CD'],
  ];
  const pad_ = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));
  // Each line: kind 'cmd' gets typed, 'out' appears instantly.
  const L = [
    { k: 'cmd', t: 'whoami' },
    { k: 'out', parts: [['bukenya kizza roland', C.text], ['  ·  senior devops & full-stack engineer  ·  kampala, uganda', C.muted]] },
    { k: 'cmd', t: 'docker ps --filter "owner=bk" --format "table {{.Names}}\\t{{.Status}}\\t{{.Mission}}"' },
    { k: 'out', parts: [[pad_('NAMES', cols.name) + pad_('STATUS', cols.status) + 'MISSION', C.dim]] },
    ...rows.map(([n, s, m]) => ({ k: 'out', parts: [[pad_(n, cols.name), C.violet], ['Up', C.mint], [pad_(s.slice(2), cols.status - 2), C.muted], [m, C.text]] })),
    { k: 'cmd', t: 'uptime' },
    { k: 'out', parts: [[' shipping to production since Aug 2020 · 6+ years · load average: ', C.muted], ['coffee, coffee, coffee', C.amber]] },
  ];
  const H = top + (L.length + 1) * lh + 26;
  const allText = L.map((l) => l.t ?? l.parts.map((p) => p[0]).join('')).join('') + 'bk@kampala~$:—zsh ';
  const mono = await fontFace('BKMono', F.mono, allText);
  const monoB = await fontFace('BKMono', F.monoBold, allText, 700);

  let t = 0.6; // seconds
  const typeT = 0.035;
  const els = [];
  const promptTxt = (y) => `<tspan fill="${C.mint}" font-weight="700">bk@kampala</tspan><tspan fill="${C.dim}">:</tspan><tspan fill="${C.blue}" font-weight="700">~</tspan><tspan fill="${C.dim}">$ </tspan>`;
  const promptLen = 'bk@kampala:~$ '.length;
  let y = top;
  for (const line of L) {
    if (line.k === 'cmd') {
      const x0 = pad + promptLen * cw;
      const n = line.t.length;
      const kv = Array.from({ length: n + 1 }, (_, i) => r2(i * cw)).join(';');
      const kt = Array.from({ length: n + 1 }, (_, i) => (i / n).toFixed(4)).join(';');
      els.push(`<g opacity="0"><set attributeName="opacity" to="1" begin="${r2(t)}s" fill="freeze"/>` +
        `<text x="${pad}" y="${y}" class="mono" font-size="${fs_}">${promptTxt()}</text>` +
        `<clipPath id="c${els.length}"><rect x="${x0}" y="${y - 18}" height="26" width="0"><animate attributeName="width" values="${kv}" keyTimes="${kt}" calcMode="discrete" begin="${r2(t + 0.25)}s" dur="${r2(n * typeT)}s" fill="freeze"/></rect></clipPath>` +
        `<text x="${x0}" y="${y}" class="mono" font-size="${fs_}" fill="${C.text}" clip-path="url(#c${els.length})">${esc(line.t)}</text></g>`);
      t += 0.25 + n * typeT + 0.35;
    } else {
      const spans = line.parts.map(([s, c]) => `<tspan fill="${c}">${esc(s)}</tspan>`).join('');
      els.push(`<g opacity="0"><set attributeName="opacity" to="1" begin="${r2(t)}s" fill="freeze"/><text x="${pad}" y="${y}" class="mono" font-size="${fs_}" xml:space="preserve">${spans}</text></g>`);
      t += 0.12;
    }
    y += lh;
  }
  // Final prompt with blinking cursor.
  els.push(`<g opacity="0"><set attributeName="opacity" to="1" begin="${r2(t)}s" fill="freeze"/><text x="${pad}" y="${y}" class="mono" font-size="${fs_}">${promptTxt()}</text>` +
    `<rect x="${pad + promptLen * cw + 1}" y="${y - 14}" width="${r2(cw * 0.95)}" height="19" fill="${C.mint}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1.05s" repeatCount="indefinite"/></rect></g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">Terminal: whoami, docker ps of the systems I run, uptime</title>
<style>${mono}${monoB}.mono{font-family:BKMono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre}</style>
<defs><linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="${C.mint}" stop-opacity=".5"/><stop offset=".5" stop-color="${C.violet}" stop-opacity=".35"/><stop offset="1" stop-color="${C.blue}" stop-opacity=".5"/></linearGradient>
<clipPath id="win"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs>
<g clip-path="url(#win)">
  <rect width="${W}" height="${H}" fill="#0D0B24"/>
  <rect width="${W}" height="40" fill="${C.bar}"/>
  <circle cx="26" cy="20" r="6.5" fill="#FF5F57"/><circle cx="48" cy="20" r="6.5" fill="#FEBC2E"/><circle cx="70" cy="20" r="6.5" fill="#28C840"/>
  <text x="${W / 2}" y="25" text-anchor="middle" class="mono" font-size="13" fill="${C.dim}">bk@kampala: ~ — zsh</text>
  ${els.join('\n  ')}
</g>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="16" fill="none" stroke="url(#edge)" stroke-width="1.5"/>
</svg>`;
}

/* ───────────────────────── FOOTER ───────────────────────── */
function footer() {
  const W = 1200, H = 120;
  const wave = (amp, len, phase, yb) => {
    let d = `M0 ${yb}`;
    for (let x = 0; x <= W * 2; x += 20) d += ` L${x} ${r2(yb + amp * Math.sin((x / len) * Math.PI * 2 + phase))}`;
    return d + ` L${W * 2} ${H} L0 ${H} Z`;
  };
  const layer = (amp, len, phase, yb, fill, op, dur) =>
    `<path d="${wave(amp, len, phase, yb)}" fill="${fill}" fill-opacity="${op}"><animateTransform attributeName="transform" type="translate" values="0 0;-${len * Math.ceil(W / len)} 0" dur="${dur}s" repeatCount="indefinite"/></path>`;
  // Translucent only, so it sits well on both GitHub's light and dark themes.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Aurora wave">
<defs>
  <linearGradient id="a" x1="0" x2="${W * 2}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.mint}"/><stop offset=".25" stop-color="${C.violet}"/><stop offset=".5" stop-color="${C.blue}"/><stop offset=".75" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.mint}"/></linearGradient>
  <linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity="1"/></linearGradient>
  <linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="m"><rect width="${W}" height="${H}" fill="url(#f)"/></mask>
  <mask id="m2"><rect width="${W}" height="${H}" fill="url(#s)"/></mask>
</defs>
<g mask="url(#m2)"><g mask="url(#m)">
${layer(10, 400, 0, 58, 'url(#a)', 0.22, 14)}
${layer(14, 600, 1.4, 70, 'url(#a)', 0.32, 20)}
${layer(8, 300, 2.6, 84, 'url(#a)', 0.5, 11)}
</g></g>
</svg>`;
}

const outDir = path.join(OUT, 'assets');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'hero.svg'), await hero());
fs.writeFileSync(path.join(outDir, 'terminal.svg'), await terminal());
fs.writeFileSync(path.join(outDir, 'footer.svg'), footer());

// Font subset for the Python vitals generator (runs in CI, stdlib only).
const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '·→—';
const vf = await subsetFont(fs.readFileSync(F.mono), ascii, { targetFormat: 'woff2' });
const vfb = await subsetFont(fs.readFileSync(F.monoBold), ascii, { targetFormat: 'woff2' });
fs.mkdirSync(path.join(outDir, 'fonts'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'fonts/mono.woff2'), vf);
fs.writeFileSync(path.join(outDir, 'fonts/mono-bold.woff2'), vfb);
for (const f of ['hero.svg', 'terminal.svg', 'footer.svg', 'fonts/mono.woff2', 'fonts/mono-bold.woff2'])
  console.log(f.padEnd(22), (fs.statSync(path.join(outDir, f)).size / 1024).toFixed(1), 'KB');
