import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  path.join(root, 'src', 'app', 'profile', 'page.tsx'),
  path.join(root, 'src', 'app', 'onboarding', 'page.tsx'),
  path.join(root, 'src', 'components', 'MoodSelectionForm.tsx'),
  path.join(root, 'src', 'app', 'mood', 'page.tsx'),
  path.join(root, 'src', 'lib', 'moods.ts'),
];

const replacements = [
  // Old incorrect under-20 wording
  ['２０歳未満には、お酒に関する表示はカフェとして安全に表示されます', '20歳未満の場合、「飲み」は選べません'],
  ['20歳未満には、お酒に関する表示はカフェとして安全に表示されます', '20歳未満の場合、「飲み」は選べません'],
  ['２０歳未満には、お酒に関する表示はカフェとして安全に表示されます。', '20歳未満の場合、「飲み」は選べません。'],
  ['20歳未満には、お酒に関する表示はカフェとして安全に表示されます。', '20歳未満の場合、「飲み」は選べません。'],
  ['20歳未満には、お酒に関する表示はカフェとして安全に表示されます', '20歳未満の場合、「飲み」は選べません'],
  ['20歳未満には、お酒に関する表示はカフェとして安全に表示されます。', '20歳未満の場合、「飲み」は選べません。'],
  ['お酒に関する表示はカフェとして安全に表示されます', '「飲み」は選べません'],
  ['お酒に関する表示はカフェとして安全に表示されます。', '「飲み」は選べません。'],
  ['カフェとして安全に表示されます', '「飲み」は選べません'],
  ['カフェとして安全に表示されます。', '「飲み」は選べません。'],

  // Adult wording alignment
  ['お酒表示が使えます', '「飲み」が選べます'],
  ['お酒表示が使えます。', '「飲み」が選べます。'],
  ['20歳以上はお酒表示が使えます', '20歳以上は「飲み」が選べます'],
  ['２０歳以上はお酒表示が使えます', '20歳以上は「飲み」が選べます'],
  ['20歳以上の場合はお酒表示が使えます', '20歳以上の場合は「飲み」が選べます'],
  ['２０歳以上の場合はお酒表示が使えます', '20歳以上の場合は「飲み」が選べます'],
];

let changedFiles = 0;
let totalReplacements = 0;

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  for (const [from, to] of replacements) {
    const before = content;
    content = content.split(from).join(to);
    if (content !== before) {
      totalReplacements += before.split(from).length - 1;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles += 1;
    console.log(`Updated: ${path.relative(root, file)}`);
  }
}

// Remove obsolete PowerShell scripts if they exist. They were only temporary one-off tools.
for (const obsolete of [
  path.join(root, 'scripts', 'fix-age-comment.ps1'),
  path.join(root, 'scripts', 'fix-age-comment-safe.ps1'),
]) {
  if (fs.existsSync(obsolete)) {
    fs.rmSync(obsolete);
    console.log(`Removed obsolete script: ${path.relative(root, obsolete)}`);
  }
}

console.log(`Done. Updated ${changedFiles} file(s), ${totalReplacements} replacement(s).`);
if (changedFiles === 0) {
  console.log('No matching text was found. Search the project for 「カフェとして安全」 and 「お酒表示」 to confirm there are no remaining old phrases.');
}
