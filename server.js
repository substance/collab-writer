import {
  DocumentServer, CollabServer, CollabServerPackage, CollabServerConfigurator,
  DocumentChange, series
} from 'substance'
import { SimpleWriterPackage } from 'substance-simple-writer'
import express from 'express'
import path from 'path'
import http from 'http'
import { Server as WebSocketServer } from 'ws'
import seed from './seed'

/*
  CollabServerPackage provides an in-memory backend for testing purposes.
  For real applications, please provide a custom package here, which configures
  a database backend.
*/
let cfg = new CollabServerConfigurator()
cfg.import(SimpleWriterPackage)

// Sets up in-memory stores for changes and snapshots
cfg.import(CollabServerPackage)

function snapshotBuilder(rawSnapshot, changes) {
  let doc
  if (rawSnapshot) {
    let htmlImporter = cfg.createImporter('html')
    doc = htmlImporter.importDocument(rawSnapshot)
  } else {
    doc = cfg.createArticle()
  }
  changes.forEach((change) => {
    change = DocumentChange.fromJSON(change)
    doc._apply(change)
  })
  let htmlExporter = cfg.createExporter('html')
  // Given that exportDocument returns an HTML string
  return htmlExporter.exportDocument(doc)
}

cfg.setSnapshotBuilder(snapshotBuilder)
cfg.setHost(process.env.HOST || 'localhost')
cfg.setPort(process.env.PORT || 7777)

/*
  Setup Express, HTTP and Websocket Server
*/
let app = express()
let httpServer = http.createServer();
let wss = new WebSocketServer({ server: httpServer })

/*
  DocumentServer provides an HTTP API to access snapshots
*/
var documentServer = new DocumentServer({
  configurator: cfg
})
documentServer.bind(app)

/*
  CollabServer implements the server part of the collab protocol
*/
var collabServer = new CollabServer({
  configurator: cfg
})

collabServer.bind(wss)

/*
  Serve static files (e.g. the SimpleWriter client)
*/
app.use('/', express.static(path.join(__dirname, '/dist')))

/*
  Error handling

  We send JSON to the client so they can display messages in the UI.
*/
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if (err.inspect) {
    // This is a SubstanceError where we have detailed info
    console.error(err.inspect())
  } else {
    // For all other errors, let's just print the stack trace
    console.error(err.stack)
  }
  res.status(500).json({
    errorName: err.name,
    errorMessage: err.message || err.name
  })
})

// Delegate http requests to express app
httpServer.on('request', app)

/*
  Seeding. This is only necessary with our in-memory stores.
*/
function _runSeed(cb) {
  console.info('Seeding database ...')
  seed(cfg, cb)
}

function _startServer(cb) {
  httpServer.listen(cfg.getPort(), cfg.getHost(), cb)
}

function _whenRunning() {
  console.info('Listening on http://' + cfg.getHost() + ':' + httpServer.address().port)
}

series([_runSeed, _startServer], _whenRunning)
