var b = require('substance-bundler')
let path = require('path')

/*
  Sub-tasks
*/
b.task('clean', function() {
  b.rm('./dist')
})

b.task('assets', function() {
  b.copy('./node_modules/font-awesome', './dist/font-awesome')
  b.copy('app/index.html', './dist/index.html')
})

/*
  Core tasks
*/
b.task('client', ['assets'], function() {
  _client(false)
})

b.task('dev:client', ['assets'], function() {
  _client(true)
})

b.task('server', function() {
  _server(false)
})

b.task('dev:server', function() {
  _server(true)
})

/*
  Full build tasks
*/
b.task('build', ['clean', 'client', 'server'])
b.task('dev:build', ['clean', 'dev:client', 'dev:server'])
b.task('default', ['build'])

// starts a server when CLI argument '-s' is set
b.setServerPort(5555)
b.serve({
  static: true, route: '/', folder: 'dist'
})

/*
  In dev mode no ES5 transforms are made
*/
function _client(devMode) {
  console.info('Building client.... Devmode: ', devMode)
  console.info('######################################')
  b.css('./app/app.css', 'dist/app.css', { variables: true })
  b.js('app/app.js', {
    target: {
      dest: './dist/app.js',
      format: 'umd',
      moduleName: 'app'
    },
    buble: !devMode
  })
}

/*
  In dev mode no ES5 transforms are made
*/
function _server(devMode) {
  console.info('Building server... Devmode: ', devMode)
  console.info('######################################')
  b.js('server.js', {
    external: ['express', 'ws', 'path', 'http'],
    target: {
      dest: './server.cjs.js',
      format: 'cjs',
      moduleName: 'collab-writer'
    },
    buble: !devMode
  })
}
