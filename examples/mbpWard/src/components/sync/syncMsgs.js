// @flow

import { createSimpleEvent, createEvent } from '../../../../../src/epics'
import { type ParticipantType } from '../types'

const SyncBtnPressedEvent = createSimpleEvent('SYNC_BTN_PRESSED')
const SyncProgressEvent = createEvent<{| index: number, participant: ParticipantType |}>('SYNC_PROGRESS')
const SyncCompleteEvent = createSimpleEvent('SYNC_COMPLETE')

export {
	SyncBtnPressedEvent,
	SyncProgressEvent,
	SyncCompleteEvent,
}
