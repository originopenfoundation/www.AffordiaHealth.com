import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';

const root = process.cwd();
const strings = new Map();
const normalize = text => text.replace(/\s+/g, ' ').trim();
const decode = text => text.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function add(text, origin) {
  text = normalize(decode(text));
  if (!text || !/[a-zA-Z\u4e00-\u9fff]/.test(text)) return;
  const id = 's' + crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
  const item = strings.get(text) ?? { id, text, origins: [] };
  if (!item.origins.includes(origin)) item.origins.push(origin);
  strings.set(text, item);
}
if (fs.existsSync('app/i18n/source.json')) {
  for (const item of JSON.parse(fs.readFileSync('app/i18n/source.json', 'utf8'))) {
    for (const origin of item.origins) add(item.text, origin);
  }
}
const docs = JSON.parse(fs.readFileSync('app/pdf-library.generated.json', 'utf8'));
for (const doc of docs) {
  for (const key of ['title', 'category', 'summary']) add(doc[key], doc.slug);
  for (const block of doc.blocks) add(block.text, doc.slug);
}
const files = ['app/home-page.tsx', 'app/site-components.tsx', 'app/consultation-form.tsx', 'app/site-data.ts', 'app/form-data.ts', 'app/routes.tsx'];
for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isJsxText(node)) add(node.text, 'interface');
    if (ts.isCallExpression(node) && node.expression.getText(source) === 't' && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) add(node.arguments[0].text, 'interface');
    if (ts.isJsxAttribute(node) && ['alt', 'aria-label', 'placeholder', 'title'].includes(node.name.getText(source)) && node.initializer && ts.isStringLiteral(node.initializer)) add(node.initializer.text, 'interface');
    if ((file.endsWith('site-data.ts') || file.endsWith('form-data.ts')) && ts.isStringLiteral(node)) {
      const text = node.text;
      if (!text.startsWith('/') && !/^[a-z-]+$/.test(text)) add(text, 'interface');
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
for (const text of ['Affordia Health Information', 'Explore Affordia Health services, healthcare information, partner opportunities and important policies.', 'Primary navigation', 'Language selection', 'Menu', 'Healthcare', 'Information', 'Affordia Health — home', 'Tell Us What You Need. Let’s Explore Your Options.', 'Page not found', 'The page you are looking for could not be found.', 'Back to home']) add(text, 'interface');
const result = [...strings.values()];
fs.mkdirSync('app/i18n', { recursive: true });
fs.writeFileSync('app/i18n/source.json', JSON.stringify(result, null, 2) + '\n');
const work = path.resolve(root, '../translation-work');
fs.mkdirSync(work, { recursive: true });
fs.writeFileSync(path.join(work, 'source.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ strings: result.length, words: result.reduce((n, item) => n + item.text.split(' ').length, 0), work }));
