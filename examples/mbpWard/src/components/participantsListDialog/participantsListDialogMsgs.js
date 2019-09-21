// @flow

import { createSimpleEvent, createEvent } from '../../../../../src/epics'

const EventDetailsDialogCloseBtnPressedEvent = createSimpleEvent('EVENT_DETAILS_DIALOG_CLOSE_BTN_PRESSED')
const OpenEventDetailsDialogCmd = createEvent<{| eventFileName: string |}>('OPEN_EVENT_DETAILS_DIALOG')
const EventDetailsDialogDeleteParticipantBtnPressedEvent = createEvent<{| index: number |}>('EVENT_DETAILS_DELETE_PARTICIPANT_BUTTON_PRESSED')
const EditParticipantNationalityBtnClickedEvent = createEvent<{| participantId: string |}>('EDIT_PARTICIPANT_NATIONALITY_BUTTON_CLICKED_EVENT')
const SetNationalityBtnClickedEvent = createSimpleEvent('SET_COUNTRY_BTN_CLICKED')
const CancelSetNationalityBtnClickedEvent = createSimpleEvent('CANCEL_SET_COUNTRY_BTN_CLICKED')
const NationalitySelectElemChangedEvent = createEvent<{| country: string |}>('NATIONALITY_SELECT_ELEM_CHAGED')
const ParticipantListDialogFileNamePressedEvent = createEvent<{| participantId: string, fileName: string |}>('EVENT_LIST_DIALOG_FILENAME_PRESSED')

export {
	EventDetailsDialogCloseBtnPressedEvent,
	OpenEventDetailsDialogCmd,
	EventDetailsDialogDeleteParticipantBtnPressedEvent,
	EditParticipantNationalityBtnClickedEvent,
	SetNationalityBtnClickedEvent,
	NationalitySelectElemChangedEvent,
	CancelSetNationalityBtnClickedEvent,
	ParticipantListDialogFileNamePressedEvent,
}
