var b = require('substance-bundler')
let path = require('path')

b.task('clean', function() {
  b.rm('./dist')
})

// copy assets
b.task('assets', function() {
  b.copy('./node_modules/font-awesome', './dist/font-awesome')
  b.copy('app/index.html', './dist/index.html')
})

b.task('build-client', ['assets'], function() {
  b.css('./app/app.css', 'dist/app.css', { variables: true })
  b.js('app/app.js', {
    target: {
      dest: './dist/app.js',
      format: 'umd',
      moduleName: 'app'
    },
    alias: {
      'substance': path.join(__dirname, 'node_modules/substance/index.es.js')
    }
  })
})

b.task('build-server', function() {
  b.js('server.js', {
    external: ['express', 'ws', 'path', 'http'],
    target: {
      dest: './server.cjs.js',
      format: 'cjs',
      moduleName: 'collab-writer'
    }
  })
})

b.task('build', ['clean', 'build-client', 'build-server'])

// build all
b.task('default', ['build'])

// starts a server when CLI argument '-s' is set
b.setServerPort(5555)
b.serve({
  static: true, route: '/', folder: 'dist'
})
