import { existsSync, mkdirSync } from 'fs'
import { dirname, basename } from 'path'
import { createFilter } from 'rollup-pluginutils'

/*
 * Create a style tag and append to head tag
 *
 * @param {String} css style
 * @return {String} css style
 */
function insertStyleFn(css) {
  if (!css) {
    return
  }
  if (typeof window === "undefined") {
    return
  }

  const style = document.createElement("style")

  style.setAttribute("type", "text/css")
  style.innerHTML = css
  document.head.appendChild(style)
  return css
}

export default function css (options = {}) {
  const filter = createFilter(options.include || ['/**/*.css', '/**/*.scss', '/**/*.sass'], options.exclude)
  let dest = options.output
  const insertStyleFnName = "___$insertStylesToHeader"

  const styles = {}
  const prefix = options.prefix ? options.prefix + '\n' : ''
  let includePaths = options.includePaths || ['node_modules/']
  includePaths.push(process.cwd())

  const compileToCSS = function (scss) {
    // Compile SASS to CSS
    if (scss.length) {
      includePaths = includePaths.filter((v, i, a) => a.indexOf(v) === i)
      try {
        const sass = options.sass || require('node-sass')
        const css = sass.renderSync(Object.assign({
          data: prefix + scss,
          includePaths
        }, options)).css.toString()
        // Possibly process CSS (e.g. by PostCSS)
        if (typeof options.processor === 'function') {
          const processor = options.processor(css, styles)

          // PostCSS support
          if (typeof processor.process === 'function') {
            return Promise.resolve(processor.process(css, { from: undefined }))
              .then(result => result.css)
          }

          return processor
        }
        return css
      } catch (e) {
        if (options.failOnError) {
          throw e
        }
        console.log()
        console.log(red('Error:\n\t' + e.message))
        if (e.message.includes('Invalid CSS')) {
          console.log(green('Solution:\n\t' + 'fix your Sass code'))
          console.log('Line:   ' + e.line)
          console.log('Column: ' + e.column)
        }
        if (e.message.includes('node-sass') && e.message.includes('find module')) {
          console.log(green('Solution:\n\t' + 'npm install --save node-sass'))
        }
        if (e.message.includes('node-sass') && e.message.includes('bindings')) {
          console.log(green('Solution:\n\t' + 'npm rebuild node-sass --force'))
        }
        console.log()
      }
    }
  }

  return {
    name: 'scss',
    intro() {
      if (options.insert === true) {
        return insertStyleFn.toString().replace(/insertStyleFn/, insertStyleFnName)
      }
    },
    transform (code, id) {
      if (!filter(id)) {
        return
      }

      // Add the include path before doing any processing
      includePaths.push(dirname(id))

      // Rebuild all scss files if anything happens to this folder
      // TODO: check if it's possible to get a list of all dependent scss files
      //       and only watch those
      if ('watch' in options) {
        const files = Array.isArray(options.watch) ? options.watch : [options.watch]
        files.forEach(file => this.addWatchFile(file))
      }

      if (options.insert === true) {
        // When the 'insert' is enabled, the stylesheet will be inserted into <head/> tag.
        return Promise.resolve(compileToCSS(code)).then((css) => ({
          code:
            "export default " + insertStyleFnName + "(" + JSON.stringify(css) + ")",
          map: { mappings: "" },
        }))
      } else if (options.output === false) {
        // When output is disabled, the stylesheet is exported as a string
        return Promise.resolve(compileToCSS(code)).then(css => ({
          code: 'export default ' + JSON.stringify(css),
          map: { mappings: '' }
        }))
      }

      // Map of every stylesheet
      styles[id] = code

      return ''
    },
    generateBundle (opts) {
      // No stylesheet needed
      if (options.output === false || options.insert === true) {
        return
      }

      // Combine all stylesheets
      let scss = ''
      for (const id in styles) {
        scss += styles[id] || ''
      }

      const css = compileToCSS(scss)

      // Resolve if processor returned a Promise
      Promise.resolve(css).then(css => {
        // Emit styles through callback
        if (typeof options.output === 'function') {
          options.output(css, styles)
          return
        }

        if (typeof css !== 'string') {
          return
        }

        if (typeof dest !== 'string') {
          // Don't create unwanted empty stylesheets
          if (!css.length) {
            return
          }

          // Guess destination filename
          dest = opts.dest || opts.file || 'bundle.js'
          if (dest.endsWith('.js')) {
            dest = dest.slice(0, -3)
          }
          dest = dest + '.css'
        }

        // Ensure that dest parent folders exist (create the missing ones)
        ensureParentDirsSync(dirname(dest))

        // Emit styles to file
        this.emitFile({
          type: 'asset',
          source: css,
          name: basename(dest),
          fileName: dest.replace(dirname(opts.dest || opts.file), '').replace(/^\\|\//, '')
        })
      })
    }
  }
}

function red (text) {
  return '\x1b[1m\x1b[31m' + text + '\x1b[0m'
}

function green (text) {
  return '\x1b[1m\x1b[32m' + text + '\x1b[0m'
}

function getSize (bytes) {
  return bytes < 10000
    ? bytes.toFixed(0) + ' B'
    : bytes < 1024000
      ? (bytes / 1024).toPrecision(3) + ' kB'
      : (bytes / 1024 / 1024).toPrecision(4) + ' MB'
}

function ensureParentDirsSync (dir) {
  if (existsSync(dir)) {
    return
  }

  try {
    mkdirSync(dir)
  } catch (err) {
    if (err.code === 'ENOENT') {
      ensureParentDirsSync(dirname(dir))
      ensureParentDirsSync(dir)
    }
  }
}
