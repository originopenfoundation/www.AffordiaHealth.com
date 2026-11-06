import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'out');
const email = 'affordiahealth@gmail.com';
let filesChanged = 0;
let linksChanged = 0;

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.isFile() && entry.name.endsWith('.html')) patchFile(file);
  }
}

function patchFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  let count = 0;
  const updated = original.replace(/<a\b[^>]*>/g, tag => {
    const match = tag.match(/href="mailto:affordiahealth@gmail\.com(?:\?subject=([^"]*))?"/i);
    if (!match) return tag;
    const compose = new URL('https://mail.google.com/mail/');
    compose.searchParams.set('view', 'cm');
    compose.searchParams.set('fs', '1');
    compose.searchParams.set('to', email);
    if (match[1]) compose.searchParams.set('su', decodeURIComponent(match[1]));
    let next = tag.replace(match[0], `href="${compose.toString().replaceAll('&', '&amp;')}"`);
    if (!/\btarget="/i.test(next)) next = next.replace(/>$/, ' target="_blank">');
    if (!/\brel="/i.test(next)) next = next.replace(/>$/, ' rel="noopener noreferrer">');
    count++;
    return next;
  });
  if (count) {
    fs.writeFileSync(file, updated);
    filesChanged++;
    linksChanged += count;
  }
}

visit(root);
console.log(JSON.stringify({ root, filesChanged, linksChanged }));
