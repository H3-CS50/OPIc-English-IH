// node scripts/run-tests.mjs <node_modules-có-esbuild>  (mặc định: ./node_modules)
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url));
const nm = process.argv[2] || join(here, '..', 'node_modules');
const esbuild = createRequire(join(nm, 'noop.js'))('esbuild');
const out = join(here, '..', 'node_modules', '.cache', 'test-bundle.cjs');
await esbuild.build({
  entryPoints: [join(here, 'test-entry.js')],
  bundle: true, platform: 'node', format: 'cjs', outfile: out, logLevel: 'warning',
  loader: { '.txt': 'text' }, nodePaths: [nm],
  alias: {
    '@capacitor/core': join(here, 'dev-stubs', 'capacitor-core.js'),
    '@capacitor-community/speech-recognition': join(here, 'dev-stubs', 'speech-recognition.js'),
    '@capacitor-community/text-to-speech': join(here, 'dev-stubs', 'text-to-speech.js'),
  },
});
execFileSync(process.execPath, [out], { stdio: 'inherit' });
