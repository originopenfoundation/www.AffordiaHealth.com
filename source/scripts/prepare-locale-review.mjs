// Prepare offline review packs only. This script never changes live catalogs.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root=path.resolve('../translation-work');
const sourcePath=path.resolve('app/i18n/source.json');
const sourceBytes=fs.readFileSync(sourcePath);
const source=JSON.parse(sourceBytes);
const approved=JSON.parse(fs.readFileSync('app/i18n/approved-locales.json','utf8'));
const targets=process.argv.slice(2).length ? process.argv.slice(2) : approved.filter(x=>!x.active).map(x=>x.code);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// A leading apostrophe prevents spreadsheet applications executing imported
// formula-like text. Preserve all content, including multilingual newlines.
const cell=value=>{
  let text=String(value ?? '');
  if (/^[\t\r\n ]*[=+@-]/u.test(text)) text="'"+text;
  return `"${text.replaceAll('"','""')}"`;
};
const originRequiresSpecialist=/medical|liability|privacy|protection|terms|refund|cancellation|responsibility|outcome|insurance|coverage|pricing|payment|aftercare/i;
const output=path.join(root,'review-packs');
fs.mkdirSync(output,{recursive:true});
for(const locale of targets){
  if(!approved.some(x=>x.code===locale && !x.active)) throw new Error(`Not an approved inactive locale: ${locale}`);
  const file=path.join(root,'drafts',`${locale}.json`);
  if(!fs.existsSync(file)){console.log(`${locale}: draft unavailable; skipped`);continue;}
  const draftBytes=fs.readFileSync(file);
  const draft=JSON.parse(draftBytes);
  const rows=[['source_id','source_origins','sensitive_topic_flag','english_source','unreviewed_machine_draft','reviewed_translation','reviewer_notes']];
  for(const item of source){
    const origins=(item.origins ?? []).join(' | ');
    rows.push([item.id,origins,originRequiresSpecialist.test(origins)?'REVIEW':'',item.text,draft[item.id] ?? '', '', '']);
  }
  const csv=rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
  fs.writeFileSync(path.join(output,`${locale}.csv`),'\ufeff'+csv,'utf8');
  const manifest={locale,sourceSha256:sha(sourceBytes),draftSha256:sha(draftBytes),entries:source.length,draftEntries:source.filter(x=>typeof draft[x.id]==='string' && draft[x.id].trim()).length,warning:'Unreviewed machine draft. Origin-based flag is heuristic and does not identify every sensitive statement. Review every entry and all content outside this catalog. This is not an approval or deployable catalog.'};
  fs.writeFileSync(path.join(output,`${locale}.manifest.json`),JSON.stringify(manifest,null,2)+'\n');
  console.log(`${locale}: ${manifest.draftEntries}/${manifest.entries} entries prepared for review`);
}
