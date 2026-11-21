// Bind reviews to the entire application source, including manually maintained
// strings, templates, language metadata and RTL styling. Sort for stable hashes.
import {readdir, readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export async function applicationSourceHash() {
  const root = fileURLToPath(new URL('../app/', import.meta.url));
  const files = [];
  async function walk(dir) {
    for (const item of await readdir(dir, {withFileTypes:true})) {
      const absolute = path.join(dir, item.name);
      if (item.isDirectory()) await walk(absolute);
      else if (item.isFile() && /\.(?:ts|tsx|css|json)$/i.test(item.name)) files.push(absolute);
    }
  }
  await walk(root);
  const hash = createHash('sha256');
  for (const file of files.sort()) {
    hash.update(path.relative(root, file).split(path.sep).join('/') + '\0');
    hash.update(await readFile(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}
