// Optional synthetic input generator for learning the recorder workflow.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../public/model.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),file=path.join(root,'examples/current-reading.json');
function tick(){const data=globalThis.ObservatoryModel.demo();data.source='Synthetic recorder example';data.samples=[data.samples.at(-1)];data.samples[0].at=new Date().toISOString();fs.writeFileSync(file,JSON.stringify(data,null,2));console.log('Updated SYNTHETIC input at '+data.samples[0].at);}
tick();if(!process.argv.includes('--once'))setInterval(tick,30000);
