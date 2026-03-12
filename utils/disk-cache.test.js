import fs from 'fs';
import path from 'path';
import os from 'os';
import { readCache, writeCache } from './disk-cache.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'disk-cache-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.BUST_CACHE;
});

describe('readCache', () => {
  test('returns data when cache is fresh', () => {
    const filePath = path.join(tmpDir, 'fresh.json');
    const data = [{ id: 1, title: 'test' }];
    fs.writeFileSync(filePath, JSON.stringify({ cachedAt: Date.now(), data }));

    const result = readCache(filePath, 60_000);
    expect(result).toEqual(data);
  });

  test('returns null when cache is expired', () => {
    const filePath = path.join(tmpDir, 'expired.json');
    const data = [{ id: 1 }];
    fs.writeFileSync(
      filePath,
      JSON.stringify({ cachedAt: Date.now() - 120_000, data })
    );

    const result = readCache(filePath, 60_000);
    expect(result).toBeNull();
  });

  test('returns null when file does not exist', () => {
    const filePath = path.join(tmpDir, 'nonexistent.json');

    const result = readCache(filePath, 60_000);
    expect(result).toBeNull();
  });

  test('returns null when BUST_CACHE=true even if fresh', () => {
    const filePath = path.join(tmpDir, 'bust.json');
    const data = [{ id: 1 }];
    fs.writeFileSync(filePath, JSON.stringify({ cachedAt: Date.now(), data }));

    process.env.BUST_CACHE = 'true';
    const result = readCache(filePath, 60_000);
    expect(result).toBeNull();
  });

  test('returns null when cachedAt is missing from JSON', () => {
    const filePath = path.join(tmpDir, 'no-timestamp.json');
    fs.writeFileSync(filePath, JSON.stringify({ data: [{ id: 1 }] }));

    const result = readCache(filePath, 60_000);
    expect(result).toBeNull();
  });

  test('returns null on corrupt/invalid JSON', () => {
    const filePath = path.join(tmpDir, 'corrupt.json');
    fs.writeFileSync(filePath, '{not valid json!!!');

    const result = readCache(filePath, 60_000);
    expect(result).toBeNull();
  });
});

describe('writeCache', () => {
  test('creates parent directory if missing', () => {
    const filePath = path.join(tmpDir, '.cache', 'nested', 'data.json');

    writeCache(filePath, [{ id: 1 }]);

    expect(fs.existsSync(filePath)).toBe(true);
    const written = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(written).toHaveProperty('cachedAt');
    expect(written.data).toEqual([{ id: 1 }]);
  });

  test('overwrites existing cache file', () => {
    const filePath = path.join(tmpDir, 'overwrite.json');
    fs.writeFileSync(
      filePath,
      JSON.stringify({ cachedAt: 1000, data: [{ old: true }] })
    );

    const newData = [{ new: true }];
    writeCache(filePath, newData);

    const written = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(written.data).toEqual(newData);
    expect(written.cachedAt).toBeGreaterThan(1000);
  });
});
