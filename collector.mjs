import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {recordFile} from './history.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2),flag=args.indexOf('--input');
if(flag<0||!args[flag+1]){console.error('Usage: node collector.mjs --input /path/to/your/readings.json [--once]');process.exit(1);}
const inputFile=path.resolve(args[flag+1]),historyFile=path.join(root,'data/history.json');
function tick(){try{const count=recordFile(inputFile,historyFile);console.log(new Date().toISOString()+' · '+(count?'Recorded '+count+' new samples':'No newer samples; original timestamps preserved'));}catch(e){console.error('Recorder: '+e.message);if(args.includes('--once'))process.exitCode=1;}}
tick();if(!args.includes('--once')){console.log('Reading the local input file every 30 seconds. Ctrl+C stops recording.');setInterval(tick,30000);}
