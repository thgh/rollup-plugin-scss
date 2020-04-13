import scss from '../../index.es.js'
import sass from 'sass'

export default {
  input: '../input.js',
  output: {
    file: 'output.js',
    format: 'esm'
  },
  plugins: [
    scss({ sass })
  ]
}
