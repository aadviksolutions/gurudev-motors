import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function load(file) {
  const exports = {};
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText;
  vm.runInNewContext(compiled, { exports, module: { exports }, process: { env: {} } });
  return exports;
}
const { getRoadSlides, initialRoadState, roadReducer, ROAD_HOLD_MS, ROAD_ENTER_MS, ROAD_EXIT_MS } = load('../src/lib/road-hero.ts');
const { SAMPLE_VEHICLES } = load('../src/lib/showroom.ts');
const advance = (state, count = 5) => roadReducer(state, { type: 'advance', count });

test('road cycle holds for two seconds, fully exits, then changes vehicle for entry', () => {
  assert.equal(ROAD_HOLD_MS, 2000);
  assert.equal(ROAD_ENTER_MS, 650);
  assert.equal(ROAD_EXIT_MS, 600);
  const exiting = advance(initialRoadState);
  assert.equal(exiting.index, 0);
  assert.equal(exiting.phase, 'exit');
  const entering = advance(exiting);
  assert.equal(entering.index, 1);
  assert.equal(entering.phase, 'enter');
  const holding = advance(entering);
  assert.equal(holding.index, 1);
  assert.equal(holding.phase, 'hold');
  assert.equal(advance({ ...initialRoadState, index: 4, phase: 'exit' }).index, 0);
});
test('manual selection wraps in both directions, centres the vehicle and pauses', () => {
  const previous = roadReducer(initialRoadState, { type: 'select', index: -1, count: 5 });
  assert.equal(previous.index, 4);
  assert.equal(previous.phase, 'hold');
  assert.equal(previous.paused, true);
  assert.equal(advance(previous), previous);
  assert.equal(roadReducer(previous, { type: 'select', index: 5, count: 5 }).index, 0);
});
test('pause and reduced motion settle an in-flight vehicle; play begins a fresh hold', () => {
  const moving = { ...initialRoadState, phase: 'enter' };
  assert.equal(roadReducer(moving, { type: 'settle' }).phase, 'hold');
  const paused = roadReducer(moving, { type: 'pause' });
  assert.equal(paused.paused, true);
  assert.equal(paused.phase, 'hold');
  const resumed = roadReducer(paused, { type: 'play' });
  assert.equal(resumed.paused, false);
  assert.equal(resumed.phase, 'hold');
});
test('empty and single-vehicle inventories do not advance or create invalid indexes', () => {
  assert.equal(getRoadSlides([]).length, 0);
  assert.equal(advance(initialRoadState, 0), initialRoadState);
  assert.equal(advance(initialRoadState, 1), initialRoadState);
  assert.equal(roadReducer(initialRoadState, { type: 'select', index: -1, count: 0 }).index, 0);
});
test('five sample-only right-facing assets exist, with catalog records preserved', () => {
  const before = JSON.stringify(SAMPLE_VEHICLES);
  const slides = getRoadSlides(SAMPLE_VEHICLES);
  assert.equal(slides.map((slide) => slide.brand).join(','), 'TVS,Honda,Suzuki,Hero,Bajaj');
  for (const slide of slides) {
    assert.ok(slide.imageUrl.endsWith('-right.webp'));
    assert.ok(existsSync(new URL('../public' + slide.imageUrl, import.meta.url)));
  }
  assert.equal(JSON.stringify(SAMPLE_VEHICLES), before);
  const confirmed = [{ ...SAMPLE_VEHICLES[0], id: 'confirmed-123', imageUrl: '/confirmed-bike.webp' }];
  assert.equal(getRoadSlides(confirmed)[0].imageUrl, '/confirmed-bike.webp');
});
test('both background variants and source records exist', () => {
  const sources = JSON.parse(readFileSync(new URL('../public/images/hero/sources.json', import.meta.url), 'utf8'));
  assert.equal(sources.assets.length, 7);
  for (const asset of sources.assets) assert.ok(existsSync(new URL('../public/images/hero/' + asset.file, import.meta.url)));
});
