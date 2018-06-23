const { ConcatSource } = require('webpack-sources')

const toBookmarklet = ({ assets }) => filename => {
  const source = assets[filename].source()
  const bookmarklet = filename.replace(/\..*$/, '') + '.bookmarklet'

  assets[bookmarklet] = new ConcatSource(
    'javascript:(function(){',
    encodeURIComponent(source),
    '})();'
  )
}

module.exports = class BookmarkletPlugin {
  constructor ({ test }) {
    this.test = RegExp.prototype.test.bind(test)
  }

  apply (compiler) {
    compiler.plugin('emit', (compilation, done) => {
      compilation.chunks.forEach(chunk => {
        chunk.files
          .filter(this.test)
          .forEach(toBookmarklet(compilation))
      })

      done()
    })
  }
}
