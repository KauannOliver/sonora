const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(environment = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../lib/server/keys.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, process: { env: environment } });
  return exports;
}

test('no credentials exist when runtime defaults are absent', () => {
  const keys = load();
  assert.equal(keys.getDefaultElevenLabsKey(), null);
  assert.equal(keys.getDefaultGroqKeys().length, 0);
});

test('configured values are normalized and placeholders rejected', () => {
  const keys = load({ ELEVENLABS_API_KEY: '  configured-demo-value  ', GROQ_API_KEYS: 'replace_this_value, configured-alpha-value, configured-beta-value' });
  assert.equal(keys.getDefaultElevenLabsKey(), 'configured-demo-value');
  assert.equal(keys.getDefaultGroqKeys().length, 2);
  assert.equal(keys.getDefaultGroqKeys()[0].key, 'configured-alpha-value');
});

test('a singular Groq runtime key is supported without embedded fallback', () => {
  const keys = load({ GROQ_API_KEY: 'configured-singular-value' });
  assert.equal(keys.getDefaultGroqKeys()[0].key, 'configured-singular-value');
  assert.equal(keys.getDefaultElevenLabsKey(), null);
});
