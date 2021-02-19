import buble from 'rollup-plugin-buble'

export default {
  input: 'index.es.js',
  output: {
    exports: 'default',
    file: 'index.cjs.js',
    format: 'cjs'
  },
  plugins: [buble()],
  external: ['fs', 'path', 'rollup-pluginutils']
}
