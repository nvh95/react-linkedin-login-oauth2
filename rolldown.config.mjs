import { createRequire } from 'node:module';
import { defineConfig } from 'rolldown';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');
const minify = process.env.BUILD_MODE !== 'dev';

export default defineConfig({
  input: 'src/index.ts',
  external: [/^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/],
  platform: 'neutral',
  tsconfig: './tsconfig.json',
  transform: {
    target: 'es2015',
  },
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      minify,
      comments: false,
      exports: 'named',
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      minify,
      comments: false,
    },
  ],
});
