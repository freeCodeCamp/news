import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import ts from 'typescript';

export function getContextReaderModulePath(sitePath = '/') {
  const normalizedSitePath = sitePath.endsWith('/') ? sitePath : `${sitePath}/`;
  return `${normalizedSitePath}assets/js/context-reader/context-reader.js`;
}

export function buildContextReaderAssets({
  sourceDir = './src/_includes/assets/js/context-reader',
  outputDir = './dist/assets/js/context-reader'
} = {}) {
  mkdirSync(outputDir, { recursive: true });

  const sourceFiles = readdirSync(sourceDir)
    .filter(filename => filename.endsWith('.ts'))
    .filter(filename => !filename.endsWith('.test.ts'));

  sourceFiles.forEach(filename => {
    const sourcePath = join(sourceDir, filename);
    const outputPath = join(outputDir, basename(filename, '.ts') + '.js');
    const sourceText = readFileSync(sourcePath, 'utf8');
    const transpiled = ts.transpileModule(sourceText, {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
        sourceMap: false
      },
      fileName: filename
    });

    writeFileSync(outputPath, transpiled.outputText);
  });
}
