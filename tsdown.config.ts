// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - tsconfig without node types (avoid another tsconfig)
import { writeFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';

export default defineConfig([{
  format: 'esm',
  unbundle: true,
  entry: './src/index.ts',
  outDir: './dist/esm',
  tsconfig: './tsconfig.json',
  fixedExtension: false,
  outputOptions: {
    comments: {
      jsdoc: false,
    },
  },
}, {
  format: 'cjs',
  unbundle: true,
  entry: 'src/index.ts',
  outDir: './dist/cjs',
  tsconfig: './tsconfig-cjs.json',
  outExtensions() {
    return { js: '.js' };
  },
  outputOptions: {
    comments: {
      jsdoc: false,
    },
  },
  hooks: {
    'build:done'() {
      writeFileSync('./dist/cjs/package.json', '{ "type": "commonjs" }', 'utf8');
    },
  },
}, {
  format: 'umd',
  platform: 'neutral',
  target: 'es2016',
  outDir: './dist/umd',
  entry: './src/index.ts',
  globalName: 'twofloat',
  minify: true,
  sourcemap: true,
  outputOptions: {
    entryFileNames: 'twofloat.min.js',
  },
}]);
