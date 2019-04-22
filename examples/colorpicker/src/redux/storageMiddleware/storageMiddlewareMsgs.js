// @flow
import { makeEvent, makeCommand, makeSimpleEvent } from '../../../../../src/epics'

const StorageContentFetchedEvent = makeEvent<{| storageData: Object |}>('STORAGE_CONTENT_FETCHED')

const SaveStorageContentCmd = makeCommand<{| storageData: Object, key: string |}>('SAVE_STORAGE_CONTENT')
const SaveStorageContentSuccessEvent = makeSimpleEvent('STORAGE_CONTENT_SAVE_SUCCSESS')
const SaveStorageContentFailureEvent = makeSimpleEvent('STORAGE_CONTENT_SAVE_FAILURE')

export {
	StorageContentFetchedEvent,
	SaveStorageContentCmd,
	SaveStorageContentSuccessEvent,
	SaveStorageContentFailureEvent,
}
