import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exts = new Set(['.tsx', '.ts', '.md', '.sql', '.json', '.mjs', '.css']);
const skipDirs = new Set(['node_modules', '.next', '.git']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (exts.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

const replacements = [
  ['NoriDrop', 'NoriDrop'],
  ['noridrop', 'noridrop'],
  ['友達の「今どんなノリ？」がわかるアプリ', '友達の「今どんなノリ？」がわかるアプリ'],
  ['友達だけに「今なら乗れそうなこと」をそっとDropできるアプリ', '友達だけに「今なら乗れそうなこと」をそっとDropできるアプリ'],
  ['今のノリをDrop', '今のノリをDrop'],
  ['ノリをDrop', 'ノリをDrop'],
  ['Drop中...', 'Drop中...'],
  ['Dropしておこう', 'Dropしておこう'],
  ['Dropしておけます', 'Dropしておけます'],
  ['bg-gradient-to-r from-emerald-800 via-emerald-600 to-[#ff6b5f]', 'bg-gradient-to-r from-emerald-800 via-emerald-600 to-[#ff6b5f]'],
  ['bg-gradient-to-br from-emerald-800 via-emerald-600 to-[#ff6b5f]', 'bg-gradient-to-br from-emerald-800 via-emerald-600 to-[#ff6b5f]'],
  ['from-emerald-800 via-emerald-600 to-[#ff6b5f]', 'from-emerald-800 via-emerald-600 to-[#ff6b5f]'],
  ['text-emerald-800', 'text-emerald-800'],
  ['text-emerald-800', 'text-emerald-800'],
  ['text-emerald-900', 'text-emerald-900'],
  ['text-emerald-900', 'text-emerald-900'],
  ['border-emerald-200', 'border-emerald-200'],
  ['border-emerald-100', 'border-emerald-100'],
  ['bg-emerald-50', 'bg-emerald-50'],
  ['bg-emerald-50', 'bg-emerald-50'],
  ['shadow-emerald-100', 'shadow-emerald-100'],
  ['shadow-emerald-100', 'shadow-emerald-100'],
  ['hover:bg-emerald-50', 'hover:bg-emerald-50'],
  ['focus:border-emerald-500', 'focus:border-emerald-500'],
];

let changed = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    changed += 1;
    console.log(`Updated text: ${path.relative(root, file)}`);
  }
}

const globals = path.join(root, 'src', 'app', 'globals.css');
if (fs.existsSync(globals)) {
  let css = fs.readFileSync(globals, 'utf8');
  css = css.replace('--background: #fbf7f0;', '--background: #f5faf6;');
  css = css.replace('--foreground: #1d1510;', '--foreground: #121a17;');
  css = css.replace(/radial-gradient\(circle at 12% 8%, rgba\(255, 138, 101, 0\.22\), transparent 24rem\),\s*radial-gradient\(circle at 92% 12%, rgba\(168, 85, 247, 0\.18\), transparent 28rem\),\s*radial-gradient\(circle at 50% 100%, rgba\(20, 184, 166, 0\.13\), transparent 30rem\),/m,
    'radial-gradient(circle at 12% 8%, rgba(6, 95, 70, 0.18), transparent 24rem),\n    radial-gradient(circle at 92% 12%, rgba(255, 107, 95, 0.18), transparent 28rem),\n    radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.13), transparent 30rem),'
  );
  const marker = '/* NoriDrop brand helpers */';
  if (!css.includes(marker)) {
    css += `\n\n${marker}\n.noridrop-logo { height: 2rem; width: auto; object-fit: contain; }\n`;
  }
  fs.writeFileSync(globals, css, 'utf8');
  console.log('Updated brand theme: src/app/globals.css');
}

console.log(`Done. Changed ${changed} text file(s).`);
