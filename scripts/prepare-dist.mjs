import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(), source=path.join(root,'out'), dest=path.join(root,'dist');
await fs.rm(dest,{recursive:true,force:true});
await fs.cp(source,dest,{recursive:true});
await fs.writeFile(path.join(dest,'.nojekyll'),'');
console.log(`\n✓ GitHub-ready static site created: ${dest}\n`);
