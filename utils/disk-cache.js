import fs from 'fs';
import path from 'path';

export function readCache(filePath, ttlMs) {
  if (process.env.BUST_CACHE === 'true') {
    console.log(`[cache] bust: ${filePath}`);
    return null;
  }

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    console.log(`[cache] miss: ${filePath}`);
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.log(`[cache] corrupt: ${filePath}`);
    return null;
  }

  if (typeof parsed.cachedAt !== 'number') {
    console.log(`[cache] corrupt (missing cachedAt): ${filePath}`);
    return null;
  }

  const age = Date.now() - parsed.cachedAt;
  if (age > ttlMs) {
    console.log(`[cache] miss (expired): ${filePath}`);
    return null;
  }

  console.log(`[cache] hit: ${filePath}`);
  return parsed.data;
}

export function writeCache(filePath, data) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({ cachedAt: Date.now(), data }));
}
