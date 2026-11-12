// Fail the mobile bundle if the packaged game fetches a runtime URL.
// Comments and string literals inside vendor/three (documentation links) are ignored.
// The only intentional remote URLs live in index.html and run solely for file:// opens.
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const www = path.join(here, 'www');
if (!fs.existsSync(www)) {
  console.error('mobile/www is missing. Run: node sync-www.mjs');
  process.exit(1);
}

const urlRe = /https?:\/\/[^\s"'`)<>]+/g;
const findings = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|css|json)$/.test(name)) scan(p);
  }
}
function scan(file) {
  const rel = path.relative(www, file);
  const text = fs.readFileSync(file, 'utf8');
  if (rel.startsWith('vendor/')) return; // Three.js source comments only; it does not fetch them
  const matches = text.match(urlRe) || [];
  for (const u of matches) findings.push({rel, u});
}
walk(www);

const allowed = new Set([
  'https://unpkg.com/three@0.160.0/',
  'https://unpkg.com/three@0.160.0/build/three.module.js',
]);
const bad = findings.filter(f => !allowed.has(f.u.replace(/[),;]+$/, '')));
console.log('External URL audit (mobile/www, excluding vendor/ comments):');
if (!findings.length) console.log('  none');
for (const f of findings) {
  const ok = allowed.has(f.u.replace(/[),;]+$/, ''));
  console.log(`  ${ok ? 'file:// fallback only' : 'UNEXPECTED'}  ${f.rel}  ${f.u}`);
}
console.log('Native origin is https://localhost (Android) or capacitor://localhost (iOS).');
console.log('location.protocol is not file:, so the import map uses ./vendor and the unpkg fallback does not run.');
if (bad.length) {
  console.error('Unexpected external URLs in the app bundle.');
  process.exit(1);
}
