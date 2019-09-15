// @flow

import { createSimpleEvent, createEvent } from '../../../../../src/epics'

const EventDetailsDialogCloseBtnPressedEvent = createSimpleEvent('EVENT_DETAILS_DIALOG_CLOSE_BTN_PRESSED')
const OpenEventDetailsDialogCmd = createEvent<{| eventFileName: string |}>('OPEN_EVENT_DETAILS_DIALOG')
const EventDetailsDialogDeleteParticipantBtnPressedEvent = createEvent<{| index: number |}>('EVENT_DETAILS_DELETE_PARTICIPANT_BUTTON_PRESSED')

export {
	EventDetailsDialogCloseBtnPressedEvent,
	OpenEventDetailsDialogCmd,
	EventDetailsDialogDeleteParticipantBtnPressedEvent,
}
