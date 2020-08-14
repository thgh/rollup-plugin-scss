# Rollup multiple .scss, .sass and .css imports

<a href="LICENSE">
  <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="Software License" />
</a>
<a href="https://github.com/thgh/rollup-plugin-scss/issues">
  <img src="https://img.shields.io/github/issues/thgh/rollup-plugin-scss.svg" alt="Issues" />
</a>
<a href="http://standardjs.com/">
  <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="JavaScript Style Guide" />
</a>
<a href="https://npmjs.org/package/rollup-plugin-scss">
  <img src="https://img.shields.io/npm/v/rollup-plugin-scss.svg?style=flat-squar" alt="NPM" />
</a>
<a href="https://github.com/thgh/rollup-plugin-scss/releases">
  <img src="https://img.shields.io/github/release/thgh/rollup-plugin-scss.svg" alt="Latest Version" />
</a>

## Installation
```
# Rollup v0.60+ and v1+
npm install --save-dev rollup-plugin-scss

# Rollup v0.59 and below
npm install --save-dev rollup-plugin-scss@0
```

## Usage
```js
// rollup.config.js
import scss from 'rollup-plugin-scss'

export default {
  input: 'input.js',
  output: {
    file: 'output.js',
    format: 'esm'
  },
  plugins: [
    scss() // will output compiled styles to output.css
  ]
}
```

```js
// entry.js
import './reset.scss'
```

### Options

Options are passed to the sass compiler ([node-sass] by defaut).
By default the plugin will base the filename for the css on the bundle destination.

```js
scss({
  // Choose *one* of these possible "output:..." options
  // Default behaviour is to write all styles to the bundle destination where .js is replaced by .css
  output: true,

  // Filename to write all styles to
  output: 'bundle.css',

  // Callback that will be called ongenerate with two arguments:
  // - styles: the contents of all style tags combined: 'body { color: green }'
  // - styleNodes: an array of style objects: { filename: 'body { ... }' }
  output: function (styles, styleNodes) {
    writeFileSync('bundle.css', styles)
  },

  // Disable any style output or callbacks, import as string
  output: false,

  // Determine if node process should be terminated on error (default: false)
  failOnError: true,

  // Prefix global scss. Useful for variables and mixins.
  prefix: `@import "./fonts.scss";`,

  // Use a node-sass compatible compiler (default: node-sass)
  sass: require('sass'),

  // Run postcss processor before output
  processor: css => postcss([autoprefixer({ overrideBrowserslist: "Edge 18" })])

  // Process resulting CSS
  processor: css => css.replace('/*date*/', '/* ' + new Date().toJSON() + ' */')

  // Add file/folder to be monitored in watch mode so that changes to these files will trigger rebuilds.
  // Do not choose a directory where rollup output or dest is pointed to as this will cause an infinite loop
  watch: 'src/styles/components',
  watch: ['src/styles/components', 'src/multiple/folders'],
})
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Contributions and feedback are very welcome.

To get it running:
  1. Clone the project.
  2. `npm install`

## Credits

- [Thomas Ghysels](https://github.com/thgh)
- [All Contributors][link-contributors]

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

[link-author]: https://github.com/thgh
[link-contributors]: ../../contributors
[rollup-plugin-vue]: https://www.npmjs.com/package/rollup-plugin-vue
[rollup-plugin-buble]: https://www.npmjs.com/package/rollup-plugin-buble
[rollup-plugin-babel]: https://www.npmjs.com/package/rollup-plugin-babel
[node-sass]: https://www.npmjs.com/package/node-sass
[sass]: https://www.npmjs.com/package/sass
