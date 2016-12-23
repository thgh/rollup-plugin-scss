import { existsSync, mkdirSync, writeFile } from 'fs'
import { dirname } from 'path'
import { createFilter } from 'rollup-pluginutils'
import { renderSync } from 'node-sass'

export default function css(options = {}) {
  const filter = createFilter(options.include || ['**/*.css', '**/*.scss', '**/*.sass'], options.exclude);
  let dest = options.output

  const styles = {}
  let includePaths = options.includePaths || []
  includePaths.push(process.cwd())

  return {
    name: 'css',
    transform(code, id) {
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
    ongenerate (opts) {
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
      if(options.stepByStep){
        let dcss = ''
        for(let id in styles){
          dcss += styles[id]
          try{
            css = renderSync(Object.assign({
              data: dcss,
              includePaths
            }, options)).css.toString();
          }catch(e){
            e.message += ' in file ' + id
            throw e
          }
        }
      }
      else{
        css = renderSync(Object.assign({
          data: css,
          includePaths
        }, options)).css.toString();
      }

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

      // Ensure that dest parent folders exist (create the missing ones)
      ensureParentDirsSync(dirname(dest))

      // Emit styles to file
      return new Promise(function (resolve, reject) {
        writeFile(dest, css, (err) => {
          if (err) {
            reject(err)
          } else {
            if (opts.verbose !== false) {
              console.log(green(dest), getSize(css.length))
            }
            resolve()
          }
        })
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
