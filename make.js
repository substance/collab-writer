var b = require('substance-bundler');
var resolve = require('rollup-plugin-node-resolve')

b.task('clean', function() {
  b.rm('./dist')
})

// copy assets
b.task('assets', function() {
  b.css('./app/app.css', 'dist/app.css', { variables: true })
  b.copy('node_modules/font-awesome', './dist/font-awesome')
})

b.task('simple-writer', function() {
  b.make('simple-writer')
})

// this optional task makes it easier to work on Substance core
// b.task('substance', function() {
//   b.make('substance')
// })

b.task('build-client', ['assets'], function() {
  // Copy Substance
  b.copy('node_modules/substance/dist', './dist/substance')
  b.copy('app/index.html', './dist/index.html')

  // NOTE: this creates an single-file bundle including the app
  // and the substance lib
  b.js('app/app.js', {
    dest: './dist/app.js',
    plugins: [
      resolve({
        // Needs to be enabled so substance-cheerio gets ignored
        browser: true,
        // – see https://github.com/rollup/rollup/wiki/jsnext:main
        module: true,
        jsnext: true
      })
    ],
    format: 'umd',
    moduleName: 'app'
  })
})

b.task('build-server', function() {
  // NOTE: We need to use the prebundled cjs version of substance
  // and can't create a single-file bundle like for the client.
  // The reason is that the server-version of Substance depends
  // on substance-cheerio which does not have a jsnext:main
  // entry point yet.
  b.js('server.js', {
    external: ['substance', 'express', 'ws', 'path', 'http'],
    plugins: [
      resolve({
        // – see https://github.com/rollup/rollup/wiki/jsnext:main
        module: true,
        jsnext: true
      })
    ],
    dest: './server.cjs.js',
    format: 'cjs',
    moduleName: 'collab-writer'
  })
})

b.task('build', ['clean', 'simple-writer', 'build-client', 'build-server'])

// build all
b.task('default', ['build'])

// starts a server when CLI argument '-s' is set
b.setServerPort(5555)
b.serve({
  static: true, route: '/', folder: 'dist'
})
