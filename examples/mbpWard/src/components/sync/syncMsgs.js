// @flow

import { createSimpleEvent } from '../../../../../src/epics'

const SyncBtnPressedEvent = createSimpleEvent('SYNC_BTN_PRESSED')
const SyncCompleteEvent = createSimpleEvent('SYNC_COMPLETE')

export {
	SyncBtnPressedEvent,
	SyncCompleteEvent,
}
