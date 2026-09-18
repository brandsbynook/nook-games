import fs from 'fs';
const files = fs.readdirSync('src/screens').filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const code = fs.readFileSync('src/screens/' + f, 'utf8');
  const m = code.match(/<(?:header|div)[^>]*className=["']([^"']*(?:top-bar|header|topbar)[^"']*)["'][^>]*>([\s\S]*?)<\/(?:header|div)>/i);
  if (m) {
    const lines = m[2].trim().split('\n').map(l => l.trim()).filter(Boolean);
    const tags = lines.filter(l => l.startsWith('<'));
    console.log(f, ':', m[1], '-->', tags.slice(0, 3).join(' | '));
  }
});
