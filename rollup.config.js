import buble from 'rollup-plugin-buble'

export default {
  entry: 'index.es.js',
  dest: 'index.common.js',
  plugins: [
    buble()
  ],
  // Cleaner console
  onwarn (msg) {
    if (msg && msg.startsWith('Treating')) {
      return
    }
  }
}
