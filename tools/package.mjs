// Dependency-free ZIP (stored entries) with explicit distribution allowlist.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version;
const directories=['public','docs','examples','test','tools'];
const singles=['README.md','LICENSE','THIRD-PARTY-NOTICES.md','CHANGELOG.md','package.json','server.mjs','history.mjs','collector.mjs','Dockerfile','.dockerignore','.gitignore','start.command','start-windows.cmd'];
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(d=>{if(d.isSymbolicLink())throw Error('No symlinks in distribution');return d.isDirectory()?walk(dir+'/'+d.name):[dir+'/'+d.name]})}
const files=[...singles,...directories.flatMap(walk)].sort();
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
function crc32(b){let crc=0xffffffff;for(const c of b)crc=crcTable[(crc^c)&255]^(crc>>>8);return (crc^0xffffffff)>>>0}
const chunks=[],central=[];let offset=0;
for(const relative of files){const file=path.join(root,relative),content=fs.readFileSync(file),name=Buffer.from('prmgr-observatory-starter-v'+version+'/'+relative),crc=crc32(content);if(content.length>2*1024*1024)throw Error('Unexpected large source file: '+relative);const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(content.length,18);local.writeUInt32LE(content.length,22);local.writeUInt16LE(name.length,26);chunks.push(local,name,content);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(0x314,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(content.length,20);c.writeUInt32LE(content.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(((relative==='start.command'?0o100755:0o100644)*65536)>>>0,38);c.writeUInt32LE(offset,42);central.push(c,name);offset+=local.length+name.length+content.length;}
const centralSize=central.reduce((n,b)=>n+b.length,0),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(centralSize,12);end.writeUInt32LE(offset,16);const archive=Buffer.concat([...chunks,...central,end]),filename='prmgr-observatory-starter-v'+version+'.zip';fs.mkdirSync(path.join(root,'release'),{recursive:true});fs.writeFileSync(path.join(root,'release',filename),archive);const sha=crypto.createHash('sha256').update(archive).digest('hex');fs.writeFileSync(path.join(root,'release',filename+'.sha256'),sha+'  '+filename+'\n');fs.writeFileSync(path.join(root,'release','file-manifest.json'),JSON.stringify({version,files,sha256:sha,bytes:archive.length},null,2));console.log(JSON.stringify({filename,files:files.length,bytes:archive.length,sha256:sha},null,2));
