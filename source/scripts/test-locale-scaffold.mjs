import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const parent=await mkdtemp(path.join(tmpdir(),'affordia-route-fixture-'));
const run=locale=>spawnSync(process.execPath,['scripts/preview-locale-scaffold.mjs',locale,parent],{encoding:'utf8'});
for(const locale of ['ar','fr']){
  const result=run(locale);assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);assert.equal(report.pages,40);
  const home=await readFile(path.join(parent,locale,'index.html'),'utf8');
  assert(home.includes('UNTRANSLATED TECHNICAL PREVIEW'));
  assert(home.includes('<meta name="robots" content="noindex,nofollow">'));
  assert(home.includes(`lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}"`));
  assert(home.includes(`href="/${locale}/library/"`));
  assert((await readFile(path.join(parent,locale,'robots.txt'),'utf8')).includes('Disallow: /'));
  assert.notEqual(run(locale).status,0,'Must not overwrite an existing preview');
}
assert.notEqual(run('en').status,0);assert.notEqual(run('../outside').status,0);
console.log('PASS: isolated 40-route fixtures are visibly untranslated, noindex, preserve existing files, and respect Arabic RTL.');
