import { documentHelpers, series } from 'substance'
import htmlFixture from './app/fixture'

export default function seed(configurator, cb) {
  let changeStore = configurator.getChangeStore()
  let snapshotStore = configurator.getSnapshotStore()
  let htmlImporter = configurator.createImporter('html')
  let doc = htmlImporter.importDocument(htmlFixture)
  let initialChange = documentHelpers.getChangeFromDocument(doc).toJSON()

  series([
    (cb) => {
      changeStore.addChange('example-doc', initialChange, cb)
    },
    (cb) => {
      snapshotStore.saveSnapshot('example-doc', 1, htmlFixture, cb)
    }
  ], cb)
}
