import type { RollupOptions } from 'rollup'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'

import { readFileSync } from 'node:fs'
import path from 'node:path'

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), {
    encoding: 'utf-8',
  })
)

const moduleName = pkg.name.replace(/^@.*\//, '')
const inputFileName = 'src/index.ts'
const author = pkg.author
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const config: RollupOptions = {
  input: './src/index.ts',

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en/#external
  // external: ['ethers'],

  plugins: [
    // Allows node_modules resolution
    resolve({ extensions }),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),

    typescript({ tsconfig: './tsconfig.build.json' }),

    // Compile TypeScript/JavaScript files
    babel({
      extensions,
      babelHelpers: 'bundled',
      include: ['src/**/*'],
    }),
  ],

  output: [
    {
      file: pkg.main,
      format: 'cjs',
      banner,
      name: 'a',
    },
    {
      file: pkg.module,
      format: 'es',
      banner,
      name: 'b',
    },
    {
      file: pkg.browser,
      format: 'iife',
      // https://rollupjs.org/guide/en/#outputglobals
      globals: {},
      banner,
      name: 'c',
    },
  ],
}

export default config
