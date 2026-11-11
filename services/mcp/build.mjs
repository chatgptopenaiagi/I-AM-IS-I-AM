import {build} from 'esbuild';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const result = await build({entryPoints:[fileURLToPath(new URL('./ui/app.js',import.meta.url))],bundle:true,format:'esm',platform:'browser',write:false,minify:true});
const script=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const template=await readFile(new URL('./ui/app.html',import.meta.url),'utf8');
await mkdir(new URL('./dist/',import.meta.url),{recursive:true});
await writeFile(new URL('./dist/mcp-app.html',import.meta.url),template.replace('<!-- APP_SCRIPT -->',()=>`<script type="module">${script}</script>`));
console.log('Built self-contained MCP App HTML.');
