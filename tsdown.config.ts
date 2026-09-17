import { defineConfig } from 'tsdown';

export default defineConfig([{
  format: 'esm',
  unbundle: true,
  entry: './src/index.ts',
  outDir: './dist/esm',
  tsconfig: './tsconfig.json',
  fixedExtension: false,
}, {
  format: 'cjs',
  unbundle: true,
  entry: 'src/index.ts',
  outDir: './dist/cjs',
  tsconfig: './tsconfig-cjs.json',
}]);
