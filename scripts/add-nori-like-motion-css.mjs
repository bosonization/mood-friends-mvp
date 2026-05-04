import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src', 'app', 'globals.css');
const marker = '/* eMoodition Nori Like motion */';
const block = `
${marker}
@keyframes noriHeartPop {
  0% { transform: scale(0.72) rotate(-8deg); opacity: 0.6; }
  55% { transform: scale(1.28) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes noriLikeToast {
  0% { transform: translate(-50%, 16px) scale(0.94); opacity: 0; filter: blur(6px); }
  14% { transform: translate(-50%, 0) scale(1); opacity: 1; filter: blur(0); }
  78% { transform: translate(-50%, 0) scale(1); opacity: 1; filter: blur(0); }
  100% { transform: translate(-50%, -8px) scale(0.98); opacity: 0; filter: blur(4px); }
}

@keyframes noriParticle {
  0% { transform: rotate(var(--particle-rotate, 0deg)) translateY(0) scale(0.45); opacity: 0; }
  22% { opacity: 1; }
  100% { transform: rotate(var(--particle-rotate, 0deg)) translateY(-34px) scale(1.1); opacity: 0; }
}
`;

if (!fs.existsSync(file)) {
  throw new Error(`Missing ${file}`);
}

const current = fs.readFileSync(file, 'utf8');
if (current.includes(marker)) {
  console.log('Nori Like motion CSS already exists.');
  process.exit(0);
}

fs.writeFileSync(file, `${current.trimEnd()}\n${block}\n`, 'utf8');
console.log('Added Nori Like motion CSS.');
