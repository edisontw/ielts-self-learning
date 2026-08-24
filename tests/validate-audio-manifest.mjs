import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MINI_TEST_AUDIO } from '../listening-media-v1.js';
import { LAB_DEPTH_AUDIO } from '../question-type-lab-depth-runtime-v1.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'media/audio/manifest-v1.json'), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const fileSha256 = filePath => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

assert(manifest.version === 1, 'Audio manifest version must remain 1.');
assert(Array.isArray(manifest.assets) && manifest.assets.length >= 14, 'Audio manifest must register ML01, ML02 and all 12 QL depth assets.');

const expected = {
  ML01: {
    path: MINI_TEST_AUDIO.ML01.replace(/^\.\//, ''),
    duration: [112, 124],
    sha256: '2272cb93ac72db0375badf1d85f8c20d15c2b9b92c512eec5d52ee9112ad15be',
    sizeBytes: 2829417,
    statuses: ['production-live']
  },
  ML02: {
    path: MINI_TEST_AUDIO.ML02.replace(/^\.\//, ''),
    duration: [138, 153],
    sha256: 'd16bb0a630524c4029edc3016150d8a56cce81431c8404b43dd73396ea6db2ec',
    sizeBytes: 3371719,
    statuses: ['production-live']
  },
  'QL01-B': {
    path: LAB_DEPTH_AUDIO['QL01-B'].replace(/^\.\//, ''),
    duration: [21.8, 32],
    sha256: '03fc298d3ee13ef0371a18aa7f9852f1056212d9ee8ef71d0853919fd4962696',
    sizeBytes: 525417,
    statuses: ['production-ready', 'production-live']
  },
  'QL01-C': {
    path: LAB_DEPTH_AUDIO['QL01-C'].replace(/^\.\//, ''),
    duration: [22, 32],
    sha256: '1a17926edb3b6a1b6c72a7a4d773475b79c6f57254ce4b37182ccf7e3c1270ab',
    sizeBytes: 542972,
    statuses: ['production-ready', 'production-live']
  },
  'QL02-B': {
    path: LAB_DEPTH_AUDIO['QL02-B'].replace(/^\.\//, ''),
    duration: [19.4, 28],
    sha256: 'ea19df7085e7c91ce3e23c879d5306b21f4e748382f4b1654b55b6f7a8c8ea35',
    sizeBytes: 469620,
    statuses: ['production-ready', 'production-live']
  },
  'QL02-C': {
    path: LAB_DEPTH_AUDIO['QL02-C'].replace(/^\.\//, ''),
    duration: [17, 27],
    sha256: 'be5c134b3444fdfb178d1ee773f6d3e8a4a0dd46ff0e1f4dd80dfbaf93c10993',
    sizeBytes: 409434,
    statuses: ['production-ready', 'production-live']
  },
  'QL03-B': {
    path: LAB_DEPTH_AUDIO['QL03-B'].replace(/^\.\//, ''),
    duration: [19.8, 30],
    sha256: '7364156e262ead2ac33fd411f21ad821f66e23099b26c0c488ac725adef41f6a',
    sizeBytes: 479651,
    statuses: ['production-ready', 'production-live']
  },
  'QL03-C': {
    path: LAB_DEPTH_AUDIO['QL03-C'].replace(/^\.\//, ''),
    duration: [20, 30],
    sha256: '99a22996247fc29385034cfc037eda6233c11e4f2580d66ee811f907d2572625',
    sizeBytes: 522283,
    statuses: ['production-ready', 'production-live']
  },
  'QL04-B': {
    path: LAB_DEPTH_AUDIO['QL04-B'].replace(/^\.\//, ''),
    duration: [28, 40],
    sha256: '3ef5ec1fa865b5f67f95614b64bc8925c1998eac394d5e776c130b5f0b7d59a8',
    sizeBytes: 681525,
    statuses: ['production-ready', 'production-live']
  },
  'QL04-C': {
    path: LAB_DEPTH_AUDIO['QL04-C'].replace(/^\.\//, ''),
    duration: [22, 34],
    sha256: '3658ef1b515fbba7f04fb2858823f254cff202ea524d3e18577e6046badb38e8',
    sizeBytes: 536075,
    statuses: ['production-ready', 'production-live']
  },
  'QL05-B': {
    path: LAB_DEPTH_AUDIO['QL05-B'].replace(/^\.\//, ''),
    duration: [16.6, 28],
    sha256: '48475e50b3bdc37e08743c40091e952cbbab91f29ae2e7250b08996d7f471710',
    sizeBytes: 401910,
    statuses: ['production-ready', 'production-live']
  },
  'QL05-C': {
    path: LAB_DEPTH_AUDIO['QL05-C'].replace(/^\.\//, ''),
    duration: [16, 24],
    sha256: '515ca560dddbec109cb3ea9313e9cb6165327312ac623db98acf339b3ce4024c',
    sizeBytes: 440781,
    statuses: ['production-ready', 'production-live']
  },
  'QL06-B': {
    path: LAB_DEPTH_AUDIO['QL06-B'].replace(/^\.\//, ''),
    duration: [14, 26],
    sha256: '76726cca91e60cf37a44f7521f526b1ad42ceeb647b8044f7ad28b0a5236bcfc',
    sizeBytes: 339216,
    statuses: ['production-ready', 'production-live']
  },
  'QL06-C': {
    path: LAB_DEPTH_AUDIO['QL06-C'].replace(/^\.\//, ''),
    duration: [17, 26],
    sha256: '84ae544affe03a812dd48577adfb6adefa9aea013cf59b5bc021c28ec635abce',
    sizeBytes: 465858,
    statuses: ['production-ready', 'production-live']
  }
};

for (const [id, contract] of Object.entries(expected)) {
  const asset = manifest.assets.find(item => item.id === id);
  assert(asset, `${id} must be registered in the audio manifest.`);
  assert(asset.path === contract.path, `${id} manifest path must match the runtime path.`);
  assert(contract.statuses.includes(asset.status), `${id} has an invalid production status: ${asset.status}.`);

  const absolutePath = path.join(root, asset.path);
  assert(fs.existsSync(absolutePath), `${id} production MP3 must exist at the runtime path.`);
  assert(fs.statSync(absolutePath).size === contract.sizeBytes, `${id} file size must match the QA-approved asset.`);
  assert(fileSha256(absolutePath) === contract.sha256, `${id} file checksum must match the QA-approved asset.`);
  assert(asset.sizeBytes === contract.sizeBytes, `${id} manifest size must match the production file.`);
  assert(asset.sha256 === contract.sha256, `${id} manifest checksum must match the production file.`);
  assert(asset.durationSeconds >= contract.duration[0] && asset.durationSeconds <= contract.duration[1], `${id} duration must satisfy the production specification or documented QA exception.`);
  assert(asset.sampleRateHz === 44100, `${id} must record a 44.1 kHz production rate.`);
  assert(asset.channels === 1, `${id} must record mono output.`);
  assert(asset.bitrateKbps === 192, `${id} must record its 192 kbps bitrate.`);
  assert(asset.provenance?.syntheticVoice === true, `${id} provenance must disclose synthetic voice use.`);
  assert(asset.qa?.transcriptAlignment?.includes('canonical repository script'), `${id} must preserve the repository transcript as source of truth.`);

  if (asset.status === 'production-live') {
    assert(asset.qa?.technicalPlayback?.includes('passed'), `${id} production-live status requires passed deployed playback QA.`);
  } else {
    assert(asset.qa?.technicalPlayback?.includes('pending deployed verification'), `${id} production-ready status must retain pending deployed verification.`);
  }
}

assert(manifest.assets.find(item => item.id === 'QL02-B')?.qa?.pauseAdjustment?.includes('wording'), 'QL02-B must record its pause adjustment QA.');
assert(manifest.assets.find(item => item.id === 'QL02-C')?.qa?.tempoCorrection?.includes('141 wpm'), 'QL02-C must record its tempo correction QA.');
assert(manifest.assets.find(item => item.id === 'QL04-C')?.qa?.tempoCorrection?.includes('151 wpm'), 'QL04-C must record its tempo correction QA.');
assert(manifest.assets.find(item => item.id === 'QL06-C')?.qa?.tempoCorrection?.includes('142 wpm'), 'QL06-C must record its tempo correction QA.');
assert(manifest.assets.find(item => item.id === 'QL06-B')?.qa?.durationContract?.includes('documented QA exception'), 'QL06-B must retain its documented duration exception.');
assert(new Set(manifest.assets.map(asset => asset.id)).size === manifest.assets.length, 'Audio manifest asset IDs must be unique.');
assert(new Set(manifest.assets.map(asset => asset.path)).size === manifest.assets.length, 'Audio manifest paths must be unique.');

console.log('✓ ML01, ML02 and all 12 QL production MP3 files exist at their runtime paths');
console.log('✓ Audio file sizes and SHA-256 checksums match the QA-approved assets');
console.log('✓ Tempo, pause and duration-exception processing records are documented and validated');
console.log('✓ Production-ready and production-live status rules are enforced');
console.log('✓ Audio provenance, format metadata and canonical transcript policy remain valid');
