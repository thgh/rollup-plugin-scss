import scss from '../../index.es.js'

export default {
  input: '../input.js',
  output: {
    file: 'output.js',
    format: 'esm'
  },
  plugins: [
    scss({
      sourceMap: true
    })
  ]
}
