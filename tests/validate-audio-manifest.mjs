import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MINI_TEST_AUDIO } from '../listening-media-v1.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'media/audio/manifest-v1.json'), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(manifest.version === 1, 'Audio manifest version must remain 1.');
assert(Array.isArray(manifest.assets) && manifest.assets.length >= 2, 'Audio manifest must register ML01 and ML02.');

const expected = {
  ML01: {
    path: MINI_TEST_AUDIO.ML01.replace(/^\.\//, ''),
    duration: [112, 124],
    sha256: '2272cb93ac72db0375badf1d85f8c20d15c2b9b92c512eec5d52ee9112ad15be'
  },
  ML02: {
    path: MINI_TEST_AUDIO.ML02.replace(/^\.\//, ''),
    duration: [138, 153],
    sha256: 'd16bb0a630524c4029edc3016150d8a56cce81431c8404b43dd73396ea6db2ec'
  }
};

for (const [id, contract] of Object.entries(expected)) {
  const asset = manifest.assets.find(item => item.id === id);
  assert(asset, `${id} must be registered in the audio manifest.`);
  assert(asset.path === contract.path, `${id} manifest path must match the runtime path.`);
  assert(asset.status === 'production-candidate', `${id} must remain a production candidate until deployed playback QA passes.`);
  assert(asset.durationSeconds >= contract.duration[0] && asset.durationSeconds <= contract.duration[1], `${id} duration must satisfy the production specification.`);
  assert(asset.sampleRateHz === 44100, `${id} must record its 44.1 kHz source rate.`);
  assert(asset.channels === 1, `${id} must record mono output.`);
  assert(asset.bitrateKbps === 192, `${id} must record its 192 kbps bitrate.`);
  assert(asset.sha256 === contract.sha256, `${id} checksum must match the owner-provided replacement file.`);
  assert(asset.provenance?.syntheticVoice === true, `${id} provenance must disclose synthetic voice use.`);
  assert(asset.qa?.transcriptAlignment?.includes('canonical repository script'), `${id} must preserve the repository transcript as source of truth.`);
}

console.log('✓ ML01 and ML02 replacement candidates match runtime paths and duration contracts');
console.log('✓ Audio provenance, checksums, format metadata and transcript-source policy recorded');
