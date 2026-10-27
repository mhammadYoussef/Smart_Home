import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../public/i18n.js';
const read=f=>fs.readFileSync(new URL('../public/'+f,import.meta.url),'utf8');
const html=read('index.html'),css=read('style.css'),app=read('app.js'),I=globalThis.SmartHomeI18n;

test('sidebar side comes from the document direction: English left, Arabic right',()=>{
 I.setLanguage('en');assert.equal(I.dir,'ltr');I.setLanguage('ar');assert.equal(I.dir,'rtl');I.setLanguage('en');
 assert.match(css,/aside\{[^}]*inset-inline-start:0;border-inline-end:/,'aside is anchored to the reading-start side');
 assert.match(css,/main\{margin-inline-start:var\(--nav-space\)/,'content margin follows the reading-start side');
 assert.match(css,/:root\[dir=rtl\]\{--nav-hide-x:100%\}/,'hidden sidebar slides off the right edge in Arabic');
 assert.doesNotMatch(css,/data-nav-side|aside\{[^}]*\bleft:0/,'no physical or manual side rules remain');
});

test('manual position control and its saved preference are gone; collapse and hide remain',()=>{
 assert.doesNotMatch(html,/id="nav-side"/);
 for(const id of ['nav-collapse','nav-hide','nav-open'])assert.match(html,new RegExp('id="'+id+'"'),id);
 assert.doesNotMatch(app,/setItem\('smart-home-nav-side'|save\('smart-home-nav-side'/);
 assert.match(app,/localStorage\.removeItem\('smart-home-nav-side'\)/,'old preference is cleaned up');
 assert.match(app,/save\('smart-home-nav-state',state\)/,'sidebar state is still saved');
 for(const lang of ['en','ar'])assert.ok(!('nav.moveLeft' in I.dictionaries[lang])&&!('nav.moveRight' in I.dictionaries[lang]));
});
