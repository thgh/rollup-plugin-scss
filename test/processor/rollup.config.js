import scss from '../../index.es.js'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'

export default {
  input: '../input.js',
  output: {
    file: 'output.js',
    format: 'esm'
  },
  plugins: [
    scss({
      processor: css => {
        return Promise
          .resolve(
            postcss([autoprefixer({ overrideBrowserslist: 'Edge 18' })])
              .process(css, { from: undefined })
          )
      }
    })
  ]
}
