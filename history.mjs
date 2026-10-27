import fs from 'node:fs';
import path from 'node:path';
import './public/model.js';
const M=globalThis.ObservatoryModel;
export function readHistory(file){
  if(!fs.existsSync(file))return null;
  if(fs.statSync(file).size>2*1024*1024)throw Error('History exceeds the 2 MB limit. Archive it before continuing.');
  return M.validate(JSON.parse(fs.readFileSync(file,'utf8')));
}
export function recordFile(inputFile,historyFile){
  if(fs.statSync(inputFile).size>2*1024*1024)throw Error('Input exceeds 2 MB.');
  const input=M.validate(JSON.parse(fs.readFileSync(inputFile,'utf8'))),previous=readHistory(historyFile),last=previous?.samples.at(-1).at;
  if(previous&&previous.source!==input.source)throw Error('Source changed. Archive or rename data/history.json before switching sources.');
  const newer=input.samples.filter(s=>!last||Date.parse(s.at)>Date.parse(last));
  if(!newer.length)return 0;
  const next=M.validate({schemaVersion:1,source:input.source,samples:[...(previous?.samples||[]),...newer].slice(-5000)});
  fs.mkdirSync(path.dirname(historyFile),{recursive:true,mode:0o700});
  const temporary=historyFile+'.tmp';fs.writeFileSync(temporary,JSON.stringify(next),{mode:0o600});fs.renameSync(temporary,historyFile);return newer.length;
}
