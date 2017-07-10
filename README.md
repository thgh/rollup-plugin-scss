# Rollup multiple .scss, .sass and .css imports

### Integrates nicely with rollup-plugin-vue2

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
npm install --save-dev rollup-plugin-scss
```

## Usage
```js
// rollup.config.js
import scss from 'rollup-plugin-scss'

export default {
  entry: 'entry.js',
  dest: 'bundle.js',
  plugins: [
    scss() // will output compiled styles to bundle.css
  ]
}
```

```js
// entry.js
import './reset.css'
```

### Options

Options are passed to [node-sass].
By default the plugin will base the filename for the css on the bundle destination.

```js
scss({
  //Choose *one* of these possible "output:..." options
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

  // Should ignore empty css source, without this option node-sass will throw an error of:
  // "No input specified: provide a file name or a source string to process"
  // default is false
  ignoreEmpty: true
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
