'use strict';
const M=ObservatoryModel,I=SmartHomeI18n,t=I.t,C=window.OBSERVATORY_CONFIG||{},$=id=>document.getElementById(id);
let data=M.demo(),mode='demo',view='overview',note=null,lastWidth=0;
const text=(id,value)=>$(id).textContent=value;
const load=(key,allowed)=>{try{const v=localStorage.getItem(key);return allowed.includes(v)?v:null}catch{return null}};
const save=(key,v)=>{try{localStorage.setItem(key,v)}catch{}};
// Sidebar side is independent of language; until the user picks one it follows the reading direction.
const mobile=matchMedia('(max-width:700px)');let navSide=load('smart-home-nav-side',['left','right']),navState=load('smart-home-nav-state',['expanded','collapsed','hidden'])||'expanded';
// Arabic dates keep Latin digits so they render in the same font as the readings.
const locale=()=>I.lang==='ar'?'ar-u-nu-latn':undefined;
const formatTime=at=>new Date(at).toLocaleString(locale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const value=(n,unit='W')=>Number.isFinite(n)?(unit==='W'?(n/1000).toFixed(2):unit==='%'?Math.round(n):n.toFixed(1)):'—';
const unitLabel=unit=>unit==='W'?'kW':unit;
const metricLabel=key=>t('metric.'+key);
const isolate=s=>'⁦'+s+'⁩';
// Messages are kept as functions so they re-translate when the language changes.
function message(fn){note=fn;text('message',fn?fn():'');}
const keyed=key=>Object.assign(Error(key),{key});
const describe=e=>e.key?t(e.key):e instanceof SyntaxError?t('msg.badJson'):I.translateError(e.message);
function show(next){view=['overview','thermal','history'].includes(next)?next:'overview';document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==view);document.querySelectorAll('[data-view]').forEach(b=>{if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});text('page-title',view==='overview'&&C.title||t('title.'+view));render();}
function card(label,n,unit,note,kind='') {const el=document.createElement('article');el.className='card energy-card '+kind;const l=document.createElement('div');l.className='label';l.textContent=label;const r=document.createElement('div');r.className='reading';r.textContent=value(n,unit);const u=document.createElement('small');u.textContent=unitLabel(unit);r.append(u);const p=document.createElement('p');p.textContent=note;el.append(l,r,p);return el;}
function subset(hours=24){const to=Date.parse(data.samples.at(-1).at);return data.samples.filter(s=>Date.parse(s.at)>=to-hours*3600000);}
function chart(id,keys,samples){const el=$(id);el.replaceChildren();const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('role','img');svg.setAttribute('aria-label',t('chart.label',{metrics:keys.map(metricLabel).join(t('chart.and'))}));
 // Draw in the container's own pixel size so axis text stays legible on narrow screens.
 const W=Math.max(260,Math.round(el.clientWidth)||800),H=Math.max(120,Math.round(el.clientHeight)||230),right=W-20,plot=H-56;svg.setAttribute('viewBox','0 0 '+W+' '+H);
 const finite=samples.flatMap(s=>keys.map(k=>s.values[k])).filter(Number.isFinite);if(!finite.length){const empty=document.createElement('div');empty.className='empty';empty.textContent=t('chart.empty');el.append(empty);return}
 let min=Math.min(...finite),max=Math.max(...finite);if(min===max){min-=1;max+=1}const pad=(max-min)*.12;min-=pad;max+=pad;const first=Date.parse(samples[0].at),end=Date.parse(samples.at(-1).at);
 function element(type,attributes,content){const e=document.createElementNS(ns,type);Object.entries(attributes).forEach(([k,v])=>e.setAttribute(k,v));if(content!==undefined)e.textContent=content;svg.append(e);return e;}
 for(let i=0;i<=3;i++){const y=20+i*plot/3;element('line',{x1:48,x2:right,y1:y,y2:y,stroke:'#35432f'});element('text',{x:1,y:y+4},((max-i*(max-min)/3)/(M.metrics[keys[0]].unit==='W'?1000:1)).toFixed(1));}
 keys.forEach(key=>{let points=[],prev=null;function flush(){if(!points.length)return;element('polyline',{points:points.map(p=>p.slice(0,2).join(',')).join(' '),fill:'none',stroke:M.metrics[key].color,'stroke-width':2,'stroke-linejoin':'round'});for(const p of points){const single=points.length===1;const dot=element('circle',{cx:p[0],cy:p[1],r:3,fill:M.metrics[key].color,opacity:single?'1':'0','tabindex':single?'0':'-1'});const tip=document.createElementNS(ns,'title');tip.textContent=metricLabel(key)+': '+isolate(value(p[2].values[key],M.metrics[key].unit)+' '+unitLabel(M.metrics[key].unit))+' · '+formatTime(p[2].at);dot.append(tip);dot.onpointerenter=()=>dot.setAttribute('opacity','1');dot.onpointerleave=()=>dot.setAttribute('opacity',single?'1':'0');}points=[];}
 for(const s of samples){const n=s.values[key],at=Date.parse(s.at);if(!Number.isFinite(n)){flush();prev=null;continue}if(prev!==null&&at-prev>600000)flush();points.push([48+(at-first)/Math.max(1,end-first)*(right-48),20+(max-n)/(max-min)*plot,s]);prev=at;}flush();});
 element('text',{x:48,y:H-10},new Date(first).toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'}));element('text',{x:right,y:H-10,'text-anchor':'end'},new Date(end).toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'}));el.append(svg);
}
function render(){const latest=M.latest(data),v=latest.values,stale=M.age(data)>90000;let badge=mode==='demo'?'badge.demo':mode==='recorder'?(data.source.toLowerCase().includes('synthetic')?'badge.recorderSynthetic':stale?'badge.recorderStale':'badge.recorderRecent'):'badge.imported';text('mode-badge',t(badge));text('dataset-label',mode==='demo'?t('source.demo'):data.source);text('clock',new Date().toLocaleString(locale(),{weekday:'short',hour:'2-digit',minute:'2-digit'}));text('data-time',t(mode==='demo'?'footer.demo':'footer.recorded')+' · '+formatTime(latest.at));text('scene-source',t(mode==='demo'?'scene.sample':'scene.imported'));text('subtitle',C.subtitle||t('subtitle'));
 $('energy-cards').replaceChildren(card(t('card.solar'),v.solar,'W',t('card.solarNote'),'solar'),card(t('card.load'),v.siteLoad,'W',t('card.loadNote'),'load'),card(t(Number.isFinite(v.gridNet)&&v.gridNet<0?'card.gridExport':'card.gridImport'),Number.isFinite(v.gridNet)?Math.abs(v.gridNet):null,'W',t('card.gridNote'),'grid'),card(t('card.battery'),v.batterySOC,'%',t('card.batteryNote'),'battery'));
 $('split').replaceChildren();for(const [label,n] of [[t('split.total'),v.siteLoad],[C.garageLabel||t('split.garage'),v.garage],[C.houseLabel||t('split.house'),M.houseLoad(v)]]){const row=document.createElement('div');row.className='split-row';const name=document.createElement('span');name.textContent=label;const val=document.createElement('b');val.textContent=value(n)+' kW';row.append(name,val);$('split').append(row)}
 $('thermal-cards').replaceChildren(card(t('card.hotWater'),v.hotWater,'°C',t('card.tempNote'),'load'),card(t('card.outdoor'),v.outdoor,'°C',t('card.tempNote'),'battery'),card(t('card.compressor'),v.compressor,'Hz',t('card.compressorNote'),'solar'));
 if(view==='overview')chart('energy-chart',['solar','siteLoad'],subset(Number($('overview-range').value)));
 if(view==='thermal'){chart('thermal-chart',['hotWater'],subset());chart('compressor-chart',['compressor'],subset());}
 if(view==='history'){const key=$('metric').value;chart('explore-chart',[key],data.samples);const n=data.samples.filter(s=>Number.isFinite(s.values[key])).length;text('coverage',t('history.coverage',{n,total:data.samples.length}));text('table-metric',metricLabel(key)+' / '+unitLabel(M.metrics[key].unit));$('samples-table').replaceChildren();data.samples.slice(-12).reverse().forEach(s=>{const row=document.createElement('tr');[formatTime(s.at),Number.isFinite(s.values[key])?value(s.values[key],M.metrics[key].unit):t('history.unavailable')].forEach(c=>{const td=document.createElement('td');td.textContent=c;row.append(td)});$('samples-table').append(row)});}
}
function applyNav(){const b=document.body,side=navSide||(I.lang==='ar'?'right':'left'),drawer=mobile.matches&&b.dataset.drawer==='open',collapsed=navState==='collapsed'&&!mobile.matches;b.dataset.navSide=side;b.dataset.navState=navState;
 const label=(id,key)=>{$(id).setAttribute('aria-label',t(key));$(id).title=t(key)};
 $('nav-collapse').textContent=(side==='left')!==collapsed?'«':'»';$('nav-collapse').setAttribute('aria-expanded',String(!collapsed));label('nav-collapse',collapsed?'nav.expand':'nav.collapse');label('nav-side',side==='left'?'nav.moveRight':'nav.moveLeft');label('nav-hide',mobile.matches?'nav.close':'nav.hide');label('nav-open','nav.open');
 $('nav-open').setAttribute('aria-expanded',String(mobile.matches?drawer:navState!=='hidden'));$('nav-backdrop').hidden=!drawer;$('main').inert=drawer;
 document.querySelectorAll('[data-view]').forEach(btn=>{if(collapsed){btn.title=btn.querySelector('.nav-label').textContent}else btn.removeAttribute('title')});}
function setNav(state){navState=state;save('smart-home-nav-state',state);applyNav();}
function setDrawer(open){document.body.dataset.drawer=open?'open':'';applyNav();(open?document.querySelector('[data-view]'):$('nav-open')).focus();}
function applyLanguage(next){const lang=I.setLanguage(next),root=document.documentElement;root.lang=lang;root.dir=I.dir;save('smart-home-lang',lang);
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-i18n-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nLabel)));document.querySelectorAll('[data-i18n-alt]').forEach(el=>el.alt=t(el.dataset.i18nAlt));
 const toggle=$('lang');toggle.textContent=t('lang.toggle');toggle.lang=lang==='ar'?'en':'ar';toggle.setAttribute('aria-label',t('lang.toggleLabel'));
 const selected=$('metric').value;$('metric').replaceChildren(...Object.keys(M.metrics).map(key=>{const o=document.createElement('option');o.value=key;o.textContent=metricLabel(key);return o}));if(selected)$('metric').value=selected;
 applyNav();if(note)message(note);show(view);}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.view;if(mobile.matches&&document.body.dataset.drawer==='open')setDrawer(false)});window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
// Redraw charts once the content width settles (window resize or sidebar change).
let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const w=$('main').clientWidth;if(w!==lastWidth){lastWidth=w;render()}},120)}).observe($('main'));
$('nav-collapse').onclick=()=>setNav(navState==='collapsed'?'expanded':'collapsed');
$('nav-side').onclick=()=>{navSide=document.body.dataset.navSide==='left'?'right':'left';save('smart-home-nav-side',navSide);applyNav()};
$('nav-hide').onclick=()=>{if(mobile.matches)setDrawer(false);else{setNav('hidden');$('nav-open').focus()}};
$('nav-open').onclick=()=>{if(mobile.matches)setDrawer(true);else{setNav('expanded');document.querySelector('[data-view]').focus()}};
$('nav-backdrop').onclick=()=>setDrawer(false);
addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile.matches&&document.body.dataset.drawer==='open')setDrawer(false)});
mobile.addEventListener('change',()=>{document.body.dataset.drawer='';applyNav()});
$('lang').onclick=()=>applyLanguage(I.lang==='ar'?'en':'ar');
$('metric').onchange=render;$('overview-range').onchange=render;
$('demo').onclick=()=>{data=M.demo();mode='demo';message(()=>t('msg.demo'));render()};
$('import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>2*1024*1024)throw keyed('msg.tooLarge');const next=M.validate(JSON.parse(await f.text()));data=next;mode='import';const n=data.samples.length;message(()=>t('msg.imported',{n}));render()}catch(error){message(()=>t('msg.importFailed',{error:describe(error)}))}finally{e.target.value=''}};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=mode==='demo'?'observatory-synthetic-demo.json':'observatory-readings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message(()=>t('msg.exported'));};
$('recorder').onclick=async()=>{try{if(location.protocol==='file:')throw keyed('msg.needServer');const response=await fetch('./api/history',{cache:'no-store'});if(!response.ok)throw keyed('msg.noRecorder');const next=M.validate(await response.json());data=next;mode='recorder';message(()=>t('msg.recorder'));render()}catch(e){message(()=>describe(e))}};
if(C.illustration && !/^(?:https?:|\/\/|data:|javascript:)/i.test(C.illustration))$('house-art').src=C.illustration;
$('house-art').onerror=()=>{$('house-art').onerror=null;$('house-art').src='./assets/starter-house.svg';message(()=>t('msg.artwork'))};
view=location.hash.slice(1);let saved=null;try{saved=localStorage.getItem('smart-home-lang')}catch{}applyLanguage(saved||'en');requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('nav-ready')));setInterval(()=>{if(!document.hidden)render()},60000);
