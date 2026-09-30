import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(), source=path.join(root,'out'), dest=path.join(root,'dist');

async function listFiles(directory, prefix = '') {
  const entries = await fs.readdir(directory, {withFileTypes: true});
  const groups = await Promise.all(entries.map(async (entry) => {
    const relative = path.posix.join(prefix, entry.name);
    return entry.isDirectory() ? listFiles(path.join(directory, entry.name), relative) : [relative];
  }));
  return groups.flat();
}

const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const outputFiles = await listFiles(source);
const precache = outputFiles.flatMap((file) => {
  if (file === 'sw.js' || file === '_headers' || file === '_routes.json') return [];
  if (file === 'index.html') return ['/'];
  if (file.endsWith('/index.html')) return [`/${file.slice(0, -'index.html'.length)}`];
  return [`/${file}`];
});
const serviceWorker = `const CACHE_NAME=${JSON.stringify(`novastream-shell-v${packageJson.version}`)};
const PRECACHE=${JSON.stringify(precache)};
self.addEventListener('install',(event)=>event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',(event)=>event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE_NAME).map((key)=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',(event)=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/media/'))return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then((response)=>{const copy=response.clone();caches.open(CACHE_NAME).then((cache)=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then((response)=>response||caches.match('/downloads/'))));return}event.respondWith(caches.match(event.request).then((cached)=>cached||fetch(event.request).then((response)=>{if(response.ok)caches.open(CACHE_NAME).then((cache)=>cache.put(event.request,response.clone()));return response})))})`;
await fs.writeFile(path.join(source, 'sw.js'), serviceWorker);
await fs.rm(dest,{recursive:true,force:true});
await fs.cp(source,dest,{recursive:true});
await fs.writeFile(path.join(dest,'.nojekyll'),'');
console.log(`\n✓ GitHub-ready static site created: ${dest}\n`);
