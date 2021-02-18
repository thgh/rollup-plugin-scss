import { existsSync, mkdirSync, writeFile } from 'fs'
import { dirname } from 'path'
import { createFilter } from 'rollup-pluginutils'

export default function css (options = {}) {
  const filter = createFilter(options.include || ['/**/*.css', '/**/*.scss', '/**/*.sass'], options.exclude)
  let dest = options.output

  const styles = {}
  const prefix = options.prefix ? options.prefix + '\n' : ''
  let includePaths = options.includePaths || ['node_modules/']
  includePaths.push(process.cwd())

  const compileSass = function (scss) {
    // Compile SASS to CSS
    if (scss.length) {
      includePaths = includePaths.filter((v, i, a) => a.indexOf(v) === i)
      try {
        const sass = options.sass || require('node-sass')

        const render = sass.renderSync(Object.assign({
          data: prefix + scss,
          outFile: dest,
          includePaths
        }, options))

        const css = render.css.toString()
        const map = render.map ? render.map.toString() : null

        // Possibly process CSS (e.g. by PostCSS)
        if (typeof options.processor === 'function') {
          const processor = options.processor(css, map, styles)

          // PostCSS support
          if (typeof processor.process === 'function') {
            return Promise.resolve(processor.process(css, {
              from: undefined,
              to: dest,
              map: map ? { prev: map, inline: false } : null
            }))
          }

          return Promise.resolve(processor).then(result => {
            if (typeof result === 'string') return { css: result }
            else return result
          })
        }
        return { css, map }
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

      // When output is disabled, the stylesheet is exported as a string
      if (options.output === false) {
        return Promise.resolve(compileSass(code)).then(compiled => ({
          code: 'export default ' + JSON.stringify(compiled.css),
          map: { mappings: '' }
        }))
      }

      // Map of every stylesheet
      styles[id] = code

      return ''
    },
    generateBundle (opts) {
      // No stylesheet needed
      if (options.output === false) {
        return
      }

      // Combine all stylesheets
      let scss = ''
      for (const id in styles) {
        scss += styles[id] || ''
      }

      if (typeof dest !== 'string') {
        // Guess destination filename
        dest = opts.dest || opts.file || 'bundle.js'
        if (dest.endsWith('.js')) {
          dest = dest.slice(0, -3)
        }
        dest = dest + '.css'
      }

      const compiled = compileSass(scss)

      // Resolve if processor returned a Promise
      Promise.resolve(compiled).then(compiled => {
        if (typeof compiled !== 'object' || typeof compiled.css !== 'string') {
          return
        }

        // Emit styles through callback
        if (typeof options.output === 'function') {
          options.output(compiled.css, styles)
          return
        }

        // Don't create unwanted empty stylesheets
        if (!compiled.css.length) {
          return
        }

        // Ensure that dest parent folders exist (create the missing ones)
        ensureParentDirsSync(dirname(dest))

        // Emit styles to file
        writeFile(dest, compiled.css, (err) => {
          if (opts.verbose !== false) {
            if (err) {
              console.error(red(err))
            } else if (compiled.css) {
              console.log(green(dest), getSize(compiled.css.length))
            }
          }
        })

        if (options.sourceMap && compiled.map) {
          let sourcemap = compiled.map
          if (typeof compiled.map.toString === 'function') {
            sourcemap = compiled.map.toString()
          }

          writeFile(dest + '.map', sourcemap, (err) => {
            if (opts.verbose !== false && err) {
              console.error(red(err))
            }
          })
        }
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
