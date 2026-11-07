// Copy the browser game into mobile/www for the native WebView.
// Screenshots, tests, docs and concept art stay out of the app bundle.
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const www = path.join(here, 'www');

const files = ['index.html'];
const dirs = ['css', 'js', 'vendor'];

fs.rmSync(www, {recursive: true, force: true});
fs.mkdirSync(www, {recursive: true});
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(www, f));
for (const d of dirs) fs.cpSync(path.join(root, d), path.join(www, d), {recursive: true});

const required = [
  'index.html',
  'css/ui.css',
  'js/shell.js',
  'js/input.js',
  'js/settings.js',
  'js/endless.js',
  'vendor/three.module.js',
  'vendor/addons/postprocessing/EffectComposer.js',
  'vendor/addons/postprocessing/RenderPass.js',
  'vendor/addons/postprocessing/UnrealBloomPass.js',
  'vendor/addons/postprocessing/OutputPass.js',
  'vendor/addons/postprocessing/ShaderPass.js',
];
const missing = required.filter(r => !fs.existsSync(path.join(www, r)));
if (missing.length) {
  console.error('www is missing required game files:\n' + missing.join('\n'));
  process.exit(1);
}
const bytes = walk(www).reduce((n, f) => n + fs.statSync(f).size, 0);
console.log(`synced ${www} (${walk(www).length} files, ${(bytes / 1e6).toFixed(2)} MB)`);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
