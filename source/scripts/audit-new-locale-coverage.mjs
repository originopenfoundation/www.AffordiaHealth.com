// Inventory only: never changes or approves translations or the site.
// Static analysis finds candidate strings, not proof of complete coverage.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const source=JSON.parse(fs.readFileSync('app/i18n/source.json','utf8'));
const locales=JSON.parse(fs.readFileSync('app/i18n/approved-locales.json','utf8')).filter(x=>!x.active);
const normalize=s=>s.replace(/\s+/gu,' ').trim();
const sourceTexts=new Set(source.map(x=>normalize(x.text)));
const target=path.resolve('../translation-work');
fs.mkdirSync(target,{recursive:true});
const reports=locales.map(({code})=>{
  const file=path.join(target,'drafts',`${code}.json`);
  const catalog=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
  const missing=source.filter(x=>typeof catalog[x.id]!=='string'||!catalog[x.id].trim());
  return {locale:code,total:source.length,present:source.length-missing.length,missing:missing.map(({id,origins})=>({id,origins}))};
});

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk('app').filter(f=>/\.(?:tsx?|json)$/i.test(f));
const manual=[];
for(const file of files){
  // The PDF-generated library is itself an input to source.json, while other
  // JSON files must be considered separately by a reviewer.
  if(file.endsWith('pdf-library.generated.json'))continue;
  if(!/\.tsx?$/i.test(file))continue;
  const raw=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,raw,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const found=new Map();
  function visit(node){
    let value;
    if(ts.isJsxText(node))value=node.text;
    else if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){
      const p=node.parent;
      if(ts.isImportDeclaration(p)||ts.isExportDeclaration(p)||ts.isImportTypeNode(p)||ts.isLiteralTypeNode(p))return;
      if((ts.isPropertyAssignment(p)||ts.isPropertyDeclaration(p)||ts.isMethodDeclaration(p))&&p.name===node)return;
      if(ts.isJsxAttribute(p)&&/^(?:className|id|href|src|width|height|viewBox|d|fill|stroke|role|type|name|rel|target|aria-hidden)$/i.test(p.name.getText(ast)))return;
      value=node.text;
    }
    if(value){
      const text=normalize(value).replace(/&apos;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
      // Suppress paths, identifiers, CSS, literal source code and most syntax.
      if(text.length>=3 && /[A-Za-z]{3}/.test(text) && (/[\s.!?,:;()]/.test(text)||/^[A-Z][a-z]{3,}$/.test(text)) && !/^https?:|^mailto:|^data:|^[.#<>{}\[\]\/]/i.test(text) && !sourceTexts.has(text)){
        const line=ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1;
        if(!found.has(text))found.set(text,line);
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  if(found.size)manual.push({file,candidates:[...found].map(([text,line])=>({line,text}))});
}
const documents=JSON.parse(fs.readFileSync('app/pdf-library.generated.json','utf8'));
const missingDocumentStrings=[];
for(const doc of documents){for(const [field,value] of [...['title','category','summary'].map(key=>[key,doc[key]]),...doc.blocks.map((block,index)=>[`block:${index}`,block.text])])if(typeof value==='string'&&value.trim()&&!sourceTexts.has(normalize(value)))missingDocumentStrings.push({slug:doc.slug,field,text:value});}
const result={generatedAt:new Date().toISOString(),sourceEntries:source.length,locales:reports,manualCandidates:manual,missingDocumentStrings,limitations:'Unreviewed heuristic inventory; includes code and already translated strings, and may miss composed, dynamic or external text. Inspect metadata, accessible names, fallback, form, structured data, navigation, PDF documents, CSS-generated text and all rendered routes manually.'};
fs.writeFileSync(path.join(target,'new-locale-coverage.json'),JSON.stringify(result,null,2)+'\n');
let md='# New locale translation coverage — working inventory\n\nThis is a static candidate inventory, not proof of completeness, accuracy, review, readiness or deployment. Drafts are unreviewed machine outputs. The scanner can miss dynamic/composed text and can include non-user-facing code or text already translated elsewhere. Verify every route and component manually.\n\n| Locale | Draft entries present | Missing source entries |\n| --- | ---: | ---: |\n';
for(const r of reports)md+=`| ${r.locale} | ${r.present}/${r.total} | ${r.missing.length} |\n`;
md+='\nAll ten languages still need manual component translations, medical/legal/privacy review and end-to-end route/accessibility checks. Details and missing IDs are in `new-locale-coverage.json`.\n\n## Candidate strings outside source.json\n\n';
md+=`The 24 generated PDF documents contain ${missingDocumentStrings.length} exact normalized text fields not matched by the source catalog; inspect those entries in the JSON report. Differences in entity decoding can produce false positives.\n\n`;
for(const item of manual){md+=`### ${item.file.replace(/\\/g,'/')} (${item.candidates.length})\n\n`;for(const c of item.candidates)md+=`- L${c.line}: ${c.text.replace(/\|/g,'\\|').replace(/\n/g,' ').slice(0,350)}\n`;md+='\n';}
md+='## Coverage limitations\n\nInspect page titles/descriptions, Open Graph and schema data, alternative text, ARIA names, forms and validation/errors, email fallback, navigation, legal and medical documents, search/index metadata, strings composed at runtime, and right-to-left rendering. Candidate counts are not translation-quality measures. Source text held inside `pdf-library.generated.json` is handled by the source catalog extractor and is not scanned a second time.\n';
fs.writeFileSync(path.join(target,'new-locale-coverage.md'),md);
console.log(JSON.stringify({locales:reports.map(({locale,total,present})=>({locale,total,present,missing:total-present})),filesWithCandidates:manual.length,candidateCount:manual.reduce((n,x)=>n+x.candidates.length,0),report:path.join(target,'new-locale-coverage.md')}));
