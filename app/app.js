import {
  Configurator, CollabClient, WebSocketConnection,
  JSONConverter, DocumentClient, CollabSession
} from 'substance'

import { SimpleWriter, SimpleWriterPackage } from 'substance-simple-writer/index.es.js'
import { ImagePackage, PersistencePackage } from 'substance'

/*
  Configuration
*/
const EXAMPLE_DOCUMENT_ID = 'example-doc'
const DOCUMENT_SERVER_URL = '/api/documents/'
const WEBSOCKET_URL = 'ws://localhost:7777'

/*
  Used to convert a document snapshot (JSON) into a real document instance
*/
let jsonConverter = new JSONConverter()

/*
  Collab engine endpoint
*/
let websocketConnection = new WebSocketConnection({
  wsUrl: WEBSOCKET_URL
})

/*
  CollabClient abstraction using a websocketConnection
*/
let collabClient = new CollabClient({
  connection: websocketConnection
})

/*
  Used to load a snapshot (e.g. latest version) from the server
*/
let documentClient = new DocumentClient({
  httpUrl: DOCUMENT_SERVER_URL
})

class SaveHandlerStub {
  /*
    Saving a document involves two steps.
    - syncing files (e.g. images) with a backend
    - storing a snapshot of the document's content (e.g. a XML serialization)
  */
  saveDocument(params) {
    console.info('Simulating save ...', params)

    return params.fileManager.sync()
    .then(() => {
      // Here you would run a converter (HTML/XML) usually
      // and send the result to a REST endpoint.
      console.info('Creating document snapshot...')
    })
  }
}

/*
  SimpleWriter configuration
*/
let cfg = new Configurator()
cfg.import(SimpleWriterPackage)
cfg.import(ImagePackage)
// Enable save button
cfg.import(PersistencePackage)
cfg.setSaveHandlerClass(SaveHandlerStub)

window.onload = function() {
  documentClient.getDocument(EXAMPLE_DOCUMENT_ID, function(err, docRecord) {
    if (err) throw new Error(err)

    let doc = cfg.createArticle()
    jsonConverter.importDocument(doc, docRecord.data)
    let collabSession = new CollabSession(doc, {
      configurator: cfg,
      documentId: EXAMPLE_DOCUMENT_ID,
      version: docRecord.version,
      collabClient: collabClient
    })

    // Mount SimpleWriter to the DOM and run it.
    SimpleWriter.mount({
      editorSession: collabSession
    }, document.body)
  })
}
