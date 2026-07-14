import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from '@jest/globals';
import { buildContextReaderAssets } from './context-reader-assets.js';

let tempDir;

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('buildContextReaderAssets', () => {
  it('emits browser-loadable JavaScript from Context Reader TypeScript modules', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'context-reader-assets-'));
    const sourceDir = join(tempDir, 'src');
    const outputDir = join(tempDir, 'dist');

    mkdirSync(sourceDir);
    writeFileSync(join(sourceDir, 'dependency.ts'), 'export const value = 1;');
    writeFileSync(
      join(sourceDir, 'context-reader.ts'),
      "import { value } from './dependency.js';\nexport const result: number = value;"
    );

    buildContextReaderAssets({ sourceDir, outputDir });

    const compiled = readFileSync(join(outputDir, 'context-reader.js'), 'utf8');
    expect(compiled).toContain("import { value } from './dependency.js';");
    expect(compiled).toContain('export const result = value;');
    expect(readFileSync(join(outputDir, 'dependency.js'), 'utf8')).toContain(
      'export const value = 1;'
    );
  });
});
