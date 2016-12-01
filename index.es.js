import { existsSync, mkdirSync, writeFile } from 'fs'
import { dirname, basename, extname } from 'path'
import { createFilter } from 'rollup-pluginutils'
import { renderSync } from 'node-sass'

export default function css (options = {}) {
  const filter = createFilter(options.include || ['**/*.css', '**/*.scss', '**/*.sass'], options.exclude)
  let dest = options.output

  const styles = {}
  let includePaths = options.includePaths || []
  includePaths.push(process.cwd())

  return {
    name: 'css',
    transform (code, id) {
      if (!filter(id)) {
        return
      }

      // When output is disabled, the stylesheet is exported as a string
      if (options.output === false) {
        return {
          code: 'export default ' + JSON.stringify(code),
          map: { mappings: '' }
        }
      }

      // Map of every stylesheet
      styles[id] = code
      includePaths.push(dirname(id))

      return ''
    },
    ongenerate (opts, rendered) {
      // No stylesheet needed
      if (options.output === false) {
        return
      }

      // Combine all stylesheets
      let css = ''
      for (const id in styles) {
        css += styles[id] || ''
      }

      // Compile SASS to CSS
      includePaths = includePaths.filter((v, i, a) => a.indexOf(v) === i)
      css = renderSync(Object.assign({
        data: css,
        includePaths
      }, options)).css.toString()

      // Emit styles through callback
      if (typeof options.output === 'function') {
        options.output(css, styles)
        return
      }

      if (typeof dest !== 'string') {
        // Don't create unwanted empty stylesheets
        if (!css.length) {
          return
        }

        // Guess destination filename
        dest = opts.dest || 'bundle.js'
        if (dest.endsWith('.js')) {
          dest = dest.slice(0, -3)
        }
        dest = dest + '.css'
      }

      const resolveId = opts.bundle.modules[opts.bundle.modules.length - 1].id
      const destPath = dest.replace(/\[name]/, basename(resolveId, extname(resolveId)))

      // Ensure that dest parent folders exist (create the missing ones)
      ensureParentDirsSync(dirname(destPath))

      // Emit styles to file
      writeFile(destPath, css, (err) => {
        if (err) {
          throw err
        }
        console.log(green(destPath), getSize(css.length))
      })
    }
  }
}

function green (text) {
  return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m'
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
