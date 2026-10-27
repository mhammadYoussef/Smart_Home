import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../public/model.js';
import '../public/i18n.js';
const M=globalThis.ObservatoryModel,I=globalThis.SmartHomeI18n,{en,ar}=I.dictionaries;
const html=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const arabic=/[؀-ۿ]/;

test('English and Arabic dictionaries have the same non-empty keys',()=>{
 assert.deepEqual(Object.keys(ar).sort(),Object.keys(en).sort());
 for(const [key,s] of Object.entries({...en,...ar}))assert.ok(s.trim(),key);
 for(const key of Object.keys(en))if(!/^(app\.name|lang\.toggle)$/.test(key)&&!/^SMART HOME/.test(ar[key]))assert.match(ar[key],arabic,'untranslated: '+key);
});

test('every key used by the page and app exists, including metrics and view titles',()=>{
 const used=[...html.matchAll(/data-i18n(?:-label|-alt)?="([^"]+)"/g),...app.matchAll(/\bt\('([\w.]+)'/g),...app.matchAll(/keyed\('([\w.]+)'\)/g),...app.matchAll(/'((?:badge|card|footer|scene)\.\w+)'/g)].map(m=>m[1]).filter(key=>!key.endsWith('.'));
 for(const key of [...used,...Object.keys(M.metrics).map(k=>'metric.'+k),...['overview','thermal','history'].map(v=>'title.'+v)])assert.ok(key in en,'missing key: '+key);
});

test('t() interpolates, falls back to English, and setLanguage rejects unknown languages',()=>{
 I.setLanguage('en');assert.equal(I.t('msg.imported',{n:3}),'Imported 3 samples. They stay in this tab; export to keep a copy.');assert.equal(I.dir,'ltr');
 assert.equal(I.setLanguage('ar'),'ar');assert.equal(I.dir,'rtl');assert.match(I.t('history.coverage',{n:2,total:5}),/^2 من أصل 5/);
 assert.equal(I.setLanguage('fr'),'en');
});

test('model validation errors are translated into Arabic and unchanged in English',()=>{
 const bad=[{},{schemaVersion:1,samples:[{at:'nope',values:{}}]},{schemaVersion:1,samples:[{at:'2026-01-01T00:00:00Z',values:{}}]},{schemaVersion:1,samples:[{at:'2026-01-01T00:00:00Z',values:{electricity:1}}]},{schemaVersion:1,samples:[{at:'2026-01-01T00:00:00Z',values:{solar:'1'}}]},{schemaVersion:1,samples:[{at:'2026-01-01T00:00:00Z',values:{solar:-1}}]},{schemaVersion:1,samples:[{at:'2026-01-01T00:00:00Z',values:{solar:1}},{at:'2026-01-01T00:00:00Z',values:{solar:1}}]}];
 for(const input of bad){let message;try{M.validate(input)}catch(e){message=e.message}assert.ok(message);
  I.setLanguage('en');assert.equal(I.translateError(message),message);
  I.setLanguage('ar');const translated=I.translateError(message);assert.notEqual(translated,message);assert.match(translated,arabic);}
 for(const [pattern,key] of I.errors)assert.match(en[key].replace('{1}','7'),pattern,key);
 I.setLanguage('en');
});
