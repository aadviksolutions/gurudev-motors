import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(
  new URL('../src/lib/showroom.ts', import.meta.url),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2021,
  },
}).outputText;
function showroom(env, fetch) {
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    module: { exports },
    process: { env },
    fetch,
  });
  return exports;
}
const previewEnv = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_DESIGN_PREVIEW: 'true',
};
test('showroom gallery uses four distinct local photos with accessible captions', () => {
  const source = readFileSync(new URL('../src/lib/showroom-photos.ts', import.meta.url), 'utf8');
  const compiledPhotos = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
  }).outputText;
  const photoExports = {};
  vm.runInNewContext(compiledPhotos, { exports: photoExports, module: { exports: photoExports } });
  const { SHOWROOM_PHOTOS, SHOWROOM_INSTAGRAM_URL } = photoExports;
  assert.equal(SHOWROOM_PHOTOS.length, 4);
  assert.equal(new Set(SHOWROOM_PHOTOS.map((photo) => photo.id)).size, 4);
  const hashes = SHOWROOM_PHOTOS.map((photo) => {
    assert.ok(photo.title && photo.alt, photo.id);
    assert.ok(['SHOWROOM', 'VEHICLES', 'WORKSHOP'].includes(photo.category), photo.id);
    assert.ok(photo.imageUrl.startsWith('/images/'), photo.id);
    return createHash('sha256').update(readFileSync(new URL('../public' + photo.imageUrl, import.meta.url))).digest('hex');
  });
  assert.equal(new Set(hashes).size, 4, 'Do not repeat photos under different filenames');
  assert.equal(SHOWROOM_INSTAGRAM_URL, 'https://www.instagram.com/gurudevmotorsraipur/reels/');
});
test('five new-brand samples have local images and recorded sources', () => {
  const api = showroom(previewEnv, () => {});
  const sources = JSON.parse(readFileSync(new URL('../public/images/vehicles/sources.json', import.meta.url), 'utf8'));
  for (const brand of ['TVS', 'Honda', 'Suzuki', 'Hero', 'Bajaj']) {
    const vehicle = api.SAMPLE_VEHICLES.find((item) => item.brand === brand && item.category === 'NEW');
    assert.ok(vehicle?.imageUrl?.startsWith('/images/vehicles/'), brand);
    assert.ok(existsSync(new URL('../public' + vehicle.imageUrl, import.meta.url)), brand);
    assert.ok(sources.assets.some((asset) => vehicle.imageUrl.endsWith('/' + asset.file)), brand);
  }
  assert.equal(api.SAMPLE_VEHICLES.find((item) => item.id === 'draft-swift').imageUrl, undefined);
});
test('preview inventory and submissions never call a backend', async () => {
  const api = showroom(previewEnv, () => {
    throw new Error('Unexpected backend call');
  });
  assert.equal((await api.getPublicInventory()).length, 8);
  assert.equal(
    (await api.getPublicVehicle('draft-raider')).vehicle.brand,
    'TVS',
  );
  assert.equal(await api.getPublicVehicle('missing'), null);
  assert.equal(
    (await api.submitPublicRequest('/api/leads', { customerName: 'Test' }))
      .preview,
    true,
  );
});
test('production ignores the preview flag and uses confirmed API records only', async () => {
  let requested;
  const api = showroom(
    { NODE_ENV: 'production', NEXT_PUBLIC_DESIGN_PREVIEW: 'true' },
    async (url) => {
      requested = url;
      return {
        ok: true,
        json: async () => ({ success: true, vehicles: [{ id: 'confirmed' }] }),
      };
    },
  );
  assert.equal(api.IS_DESIGN_PREVIEW, false);
  assert.equal((await api.getPublicInventory())[0].id, 'confirmed');
  assert.equal(requested, '/api/vehicles');
});

test('Vercel Preview requires opt-in and never calls a backend in sample mode', async () => {
  const deploymentEnv = {
    NODE_ENV: 'production',
    NEXT_PUBLIC_VERCEL_ENV: 'preview',
  };
  assert.equal(showroom(deploymentEnv, () => {}).IS_DESIGN_PREVIEW, false);
  const api = showroom(
    { ...deploymentEnv, NEXT_PUBLIC_DESIGN_PREVIEW: 'true' },
    () => { throw new Error('Preview must not call a backend'); },
  );
  assert.equal(api.IS_DESIGN_PREVIEW, true);
  assert.equal((await api.getPublicInventory()).length, 8);
  assert.equal((await api.getPublicVehicle('draft-raider')).vehicle.brand, 'TVS');
  assert.equal((await api.submitPublicRequest('/api/leads', { customerName: 'Test' })).preview, true);
});

test('Vercel Production and other deployment environments reject sample mode', () => {
  for (const environment of ['production', 'development', 'staging', '']) {
    assert.equal(showroom({
      NODE_ENV: 'production',
      NEXT_PUBLIC_VERCEL_ENV: environment,
      NEXT_PUBLIC_DESIGN_PREVIEW: 'true',
    }, () => {}).IS_DESIGN_PREVIEW, false, environment);
  }
});

test('the public deployment environment comes from Vercel at build time', async () => {
  const original = process.env.VERCEL_ENV;
  try {
    for (const environment of ['preview', 'production', '']) {
      process.env.VERCEL_ENV = environment;
      const { default: config } = await import(`../next.config.mjs?environment=${environment}`);
      assert.equal(config.env.NEXT_PUBLIC_VERCEL_ENV, environment);
    }
  } finally {
    if (original === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = original;
  }
});
test('development does not silently use sample inventory without the flag', () => {
  assert.equal(
    showroom({ NODE_ENV: 'development' }, () => {}).IS_DESIGN_PREVIEW,
    false,
  );
});
test('empty inventory is valid but HTTP and malformed inventory fail', async () => {
  const empty = showroom({}, async () => ({
    ok: true,
    json: async () => ({ success: true, vehicles: [] }),
  }));
  assert.equal((await empty.getPublicInventory()).length, 0);
  const failed = showroom({}, async () => ({ ok: false }));
  await assert.rejects(failed.getPublicInventory(), /could not load/);
  const malformed = showroom({}, async () => ({
    ok: true,
    json: async () => ({ success: true }),
  }));
  await assert.rejects(malformed.getPublicInventory(), /could not load/);
});
test('category matching separates used cars, scooters and electric inventory', () => {
  const api = showroom(previewEnv, () => {});
  const car = api.SAMPLE_VEHICLES.find((v) => v.id === 'draft-swift');
  const ev = api.SAMPLE_VEHICLES.find((v) => v.id === 'draft-iqube');
  assert.equal(api.matchesCategory(car, 'USED_CAR'), true);
  assert.equal(api.matchesCategory(car, 'PRE_OWNED'), false);
  assert.equal(api.matchesCategory(ev, 'ELECTRIC'), true);
  assert.equal(api.matchesCategory(ev, 'NEW'), false);
  assert.equal(
    api.SAMPLE_VEHICLES.filter((v) => api.matchesCategory(v, 'SCOOTER')).length,
    3,
  );
});
test('real submission preserves payload and does not report success on HTTP failure', async () => {
  let request;
  const api = showroom({}, async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      json: async () => ({ success: true, leadNumber: 'TEST' }),
    };
  });
  assert.equal(
    (
      await api.submitPublicRequest('/api/leads', {
        customerName: 'Test',
        mobile: '9000000000',
      })
    ).leadNumber,
    'TEST',
  );
  assert.equal(request.url, '/api/leads');
  assert.equal(JSON.parse(request.options.body).customerName, 'Test');
  const failed = showroom({}, async () => ({
    ok: false,
    json: async () => ({ success: false }),
  }));
  await assert.rejects(
    failed.submitPublicRequest('/api/leads', {}),
    /could not be sent/,
  );
  const malformed = showroom({}, async () => ({
    ok: true,
    json: async () => {
      throw new Error('Invalid JSON');
    },
  }));
  await assert.rejects(
    malformed.submitPublicRequest('/api/leads', {}),
    /could not be sent/,
  );
});
test('missing details differ from a failed detail request', async () => {
  const missing = showroom({}, async () => ({ status: 404, ok: false }));
  assert.equal(await missing.getPublicVehicle('missing'), null);
  const failed = showroom({}, async () => ({ status: 500, ok: false }));
  await assert.rejects(failed.getPublicVehicle('vehicle'), /could not load/);
});
