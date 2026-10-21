// Bundle để thử giao diện trên trình duyệt khi máy không có node_modules đầy đủ.
// Dùng: node scripts/dev-bundle.mjs <đường-dẫn-node_modules-có-esbuild-và-marked>
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const nm = process.argv[2];
const require = createRequire(join(nm, 'noop.js'));
const esbuild = require('esbuild');
await esbuild.build({
  entryPoints: [join(here, '..', 'src', 'main.js')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  outfile: join(here, '..', 'www', 'app.js'),
  loader: { '.txt': 'text' },
  nodePaths: [nm],
  alias: {
    '@capacitor/core': join(here, 'dev-stubs', 'capacitor-core.js'),
    '@capacitor-community/speech-recognition': join(here, 'dev-stubs', 'speech-recognition.js'),
    '@capacitor-community/text-to-speech': join(here, 'dev-stubs', 'text-to-speech.js'),
  },
  logLevel: 'info',
});
