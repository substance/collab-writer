import { Configurator, JSONConverter, documentHelpers, series } from 'substance'
import { SimpleWriterPackage } from 'simple-writer'
import htmlFixture from './app/fixture'

/*
  Setup configurator
*/
let configurator = new Configurator()
configurator.import(SimpleWriterPackage)

let htmlImporter = configurator.createImporter('html')
let doc = htmlImporter.importDocument(htmlFixture)
let initialChange = documentHelpers.getChangeFromDocument(doc)

let jsonConverter = new JSONConverter()
let v1Snapshot = jsonConverter.exportDocument(doc)

export default function seed(changeStore, snapshotStore, cb) {
  series([
    (cb) => {
      changeStore.addChange('example-doc', initialChange, cb)
    },
    (cb) => {
      snapshotStore.saveSnapshot('example-doc', 1, v1Snapshot, cb)
    }
  ], cb)
}
