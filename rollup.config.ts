import type { RollupOptions } from 'rollup'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'

import { readFileSync } from 'node:fs'

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), {
    encoding: 'utf-8',
  })
)

const name = pkg.name.replace(/^@.*\//, '')
const input = 'src/index.ts'
const author = pkg.author
const banner = `
  /**
   * @license
   * author: ${author}
   * ${name}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const config: RollupOptions = {
  input,

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en/#external
  external: ['ethers'],

  plugins: [
    // Allows node_modules resolution
    resolve({ extensions }),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),

    // Compile TypeScript/JavaScript files
    typescript({
      tsconfig: './tsconfig.build.json',
    }),

    babel({
      extensions,
      babelHelpers: 'bundled',
    }),

    terser(),
  ],

  output: [
    {
      file: pkg.main,
      format: 'cjs',
      name,
      banner,
    },
    {
      file: pkg.module,
      format: 'esm',
      name,
      banner,
    },
  ],
}

export default config
