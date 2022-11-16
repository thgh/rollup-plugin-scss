import scss from '../../index.es.js'

export default {
  input: '../input.js',
  output: {
    file: 'nested/output.js',
    format: 'esm',
    assetFileNames: '[name][extname]'
  },
  plugins: [scss()]
}
