import { type UserConfig, defineConfig } from 'tsdown';
import { minifySync } from 'oxc-minify';

const selectiveMinify = {
  name: 'selective-minify',
  async generateBundle(opt, bundle) {
    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (!(chunk.type === 'chunk' && /pre\/.+\.(?:c|m)?js$/v.test(fileName))) {
        continue;
      }

      const result = minifySync(fileName, chunk.code, {
        compress: true,
        mangle: true,
        codegen: { removeWhitespace: true },
      });

      chunk.code = result.code;
    }
  },
} satisfies UserConfig['plugins'];

export default defineConfig([{
  format: 'esm',
  unbundle: true,
  entry: './src/index.ts',
  outDir: './dist/esm',
  tsconfig: './tsconfig.json',
  fixedExtension: false,
  plugins: [selectiveMinify],
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
  plugins: [selectiveMinify],
  outExtensions() {
    return { js: '.js' };
  },
  outputOptions: {
    comments: {
      jsdoc: false,
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
