import fs from 'fs';

const files = fs.readdirSync('src/screens').filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const code = fs.readFileSync('src/screens/' + f, 'utf8');
  const headerMatch = code.match(/<(?:header|div)[^>]*className=["']([^"']*(?:top-bar|header|topbar)[^"']*)["'][^>]*>([\s\S]*?)<\/(?:header|div)>/i);
  if (headerMatch) {
    console.log(f, '=>', headerMatch[1]);
  }
});
