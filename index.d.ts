import { Processor } from 'postcss'
import { Plugin } from 'rollup'

/**
 * Callback that will be called ongenerate with two arguments.
 *
 * ---
 * **styles**
 *
 * The contents of all style tags combined.
 *
 * > _eg:_ `body { color: green }`
 *
 * ---
 *
 * **styleNodes**
 *
 * An array of style objects.
 *
 * >  _eg:_ `{ filename: 'body { ... }' }`
 */
declare type IOutput = (
  styles?: string,
  styleNodes?: {
    [filename: string]: string
  }
) => void

export interface SCSSPluginOptions {
  /**
   * Accepts either a boolean, string or function.
   * Choose *one* of these possible `output:...` options.
   * Default behaviour is to write all styles to the bundle destination
   * where `.js` is replaced by `.css.`
   *
   * ---
   *
   * Passing in boolean (default: true):
   *
   * ```js
   *
   * // Default behaviour will write to bundle destination.
   * { output: true }
   *
   * // Disable any style output or callbacks, import as string.
   * { output: false }
   * ```
   *
   * ---
   *
   * Passing in string (file path)
   *
   * ```js
   * {
   *   // Filename to write all styles to
   *   output: 'bundle.css'
   * }
   * ```
   *
   * ---
   *
   * Passing a function callback
   *
   * ```js
   * {
   *    // Callback that will be called ongenerate with two arguments
   *    output: function (styles, styleNodes) {
   *      writeFileSync('bundle.css', styles)
   *    }
   * }
   * ```
   * ---
   *
   * @default true
   */
  output?: boolean | string | IOutput,
  /**
   * Choose files to include in processing. Defaults to to all
   * .scss, .sass and .css files.
   */
  include?: string[],
  /**
   * Choose files to exclude from processing,
   *
   * @default undefined
   */
  exclude?: string[],
  /**
   * Determine if node process should be terminated on error.
   *
   * @default  false
   */
  failOnError?: boolean;
  /**
   * Prefix global scss. Useful for variables and mixins.
   *
   * @example `@import "./fonts.scss";`
   * @default ''
   */
  prefix?: string;
  /**
   * Use a `node-sass` compatible compiler.
   *
   * - [node-sass](https://www.npmjs.com/package/node-sass)
   * - [sass](https://www.npmjs.com/package/sass)
   *
   * ---
   *
   * @default require('node-sass')
   */
  sass?: any;

  /**
   * Process resulting CSS or run a `postcss` processor before output.
   *
   * @example
   *
   * // Running PostCSS Processor
   * {  processor: css => postcss([autoprefixer()]) }
   *
   * // Processing some resulting CSS
   * { processor: css => '.some-class { color: red;}' + css }
   */
  processor: (css?: string) => Processor

  /**
   * Add file/folder to be monitored in watch mode so
   * that changes to these files will trigger rebuilds.
   *
   * **IMPORTANT**
   * Do not choose a directory where rollup output or
   * dest is pointed to as this will cause an infinite loop.
   *
   * @example
   * { watch: 'src/styles/components' }
   *
   * // Array of folders
   * { watch: ['src/styles/components', 'src/multiple/folders'] }
   */
  watch?: string | string[],


  /**
   * Included paths, which are passed to node-sass.
   * In most cases, you can leave this option to execute its default,
   * which includes node_modules.
   *
   * @default  ['node_modules']
   */
  includePaths?: string[];

}

/**
 * Rollup multiple .scss, .sass and .css imports.
 */
export default function scss(options: SCSSPluginOptions): Plugin;
