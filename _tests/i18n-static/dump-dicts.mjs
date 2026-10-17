// Dumps the approved dictionaries each page registers (same files, same order as the page loads them) to JSON.
// Used by build.py; never edits a dictionary.
import fs from 'fs'; import vm from 'vm'; import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const [,, page] = process.argv;                      // e.g. "campaigns/share-your-story/index.html"
const html = fs.readFileSync(path.join(root, page), 'utf8');
const dir = path.dirname('/' + page);
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const dicts = [];
const ctx = { window: {}, document: { documentElement: {}, addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, readyState: 'loading' }, console };
ctx.window.TulusI18n = { register: d => dicts.push(d) }; ctx.TulusI18n = ctx.window.TulusI18n;
vm.createContext(ctx);
for (const s of srcs) {
  const p = s.startsWith('/') ? s : path.posix.join(dir, s);
  const base = path.basename(p);
  if (!/(^|\/)(i18n[^/]*|site|home|domestic-workers|migrant-workers|employers|community|faq)\.js$/.test(p) || /i18n-core/.test(p)) continue;
  vm.runInContext(fs.readFileSync(path.join(root, p), 'utf8'), ctx, { filename: p });
}
process.stdout.write(JSON.stringify(dicts));
