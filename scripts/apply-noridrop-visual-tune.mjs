import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  path.join(root, 'src'),
  path.join(root, 'README.md'),
];

const replacements = [
  ['from-emerald-800 via-emerald-600 to-[#ff6b5f]', 'from-[#063f2e] via-[#0b6b47] to-[#12915f]'],
  ['from-emerald-700 to-[#ff6b5f]', 'from-[#063f2e] to-[#12915f]'],
  ['from-orange-500 via-pink-500 to-violet-600', 'from-[#063f2e] via-[#0b6b47] to-[#12915f]'],
  ['from-orange-400 via-pink-500 to-violet-600', 'from-[#063f2e] via-[#0b6b47] to-[#12915f]'],
  ['shadow-pink-100', 'shadow-emerald-100'],
  ['shadow-pink-200', 'shadow-emerald-200'],
];

const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.md', '.json']);

function walk(entry) {
  if (!fs.existsSync(entry)) return [];
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry];
  const files = [];
  for (const child of fs.readdirSync(entry)) {
    const childPath = path.join(entry, child);
    if (child === 'node_modules' || child === '.next' || child === '.git') continue;
    files.push(...walk(childPath));
  }
  return files;
}

let changed = 0;
for (const target of targets.flatMap(walk)) {
  if (!textExtensions.has(path.extname(target))) continue;
  const original = fs.readFileSync(target, 'utf8');
  let next = original;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== original) {
    fs.writeFileSync(target, next, 'utf8');
    console.log(`Updated visual tone: ${path.relative(root, target)}`);
    changed += 1;
  }
}
console.log(`Done. Changed ${changed} file(s).`);
