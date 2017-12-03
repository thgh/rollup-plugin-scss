import buble from 'rollup-plugin-buble'

export default {
  input: 'index.es.js',
  output: {
    file: 'index.cjs.js',
    format: 'cjs',
  },
  plugins: [
    buble()
  ]
}
