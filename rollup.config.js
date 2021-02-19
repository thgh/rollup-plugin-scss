import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'index.ts',
  output: [
    {
      exports: 'default',
      file: 'index.es.js',
      format: 'es'
    },
    {
      exports: 'default',
      file: 'index.cjs.js',
      format: 'cjs'
    }
  ],
  plugins: [typescript()],
  external: ['fs', 'path', 'rollup-pluginutils']
}
