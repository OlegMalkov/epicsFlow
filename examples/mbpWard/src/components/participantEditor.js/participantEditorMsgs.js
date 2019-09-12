// @flow

import { createEvent, createSimpleEvent } from '../../../../../src/epics'
import { type EventKindType } from '../types'

const ParticipantEditorEventKindOnChangeEvent = createEvent<{| value: EventKindType |}>('PARTICIPANT_EDITOR_EVENT_KIND_ON_CHANGE')

const ParticipantEditorNameInputOnChangeEvent = createEvent<{| value: string |}>('PARTICIPANT_EDITOR_NAME_INPUT_ON_CHANGE')
const ParticipantEditorPhoneInputOnChangeEvent = createEvent<{| value: string |}>('PARTICIPANT_EDITOR_PHONE_INPUT_ON_CHANGE')
const ParticipantEditorEmailInputOnChangeEvent = createEvent<{| value: string |}>('PARTICIPANT_EDITOR_EMAIL_INPUT_ON_CHANGE')

const ParticipantEditorSearchExistingButtonPressedEvent = createSimpleEvent('PARTICIPANT_EDITOR_SEARCH_EXISTING_BUTTON_PRESSED')
const ParticipantEditorAddNewButtonPressedEvent = createSimpleEvent('PARTICIPANT_EDITOR_ADD_NEW_BUTTON_PRESSED')
const ParticipantEditorAddEventToExistingParticipantPressedEvent = createSimpleEvent('PARTICIPANT_EDITOR_ADD_EVENT_TO_EXISTING_PARTICIPANT_BUTTON_PRESSED')

export {
	ParticipantEditorNameInputOnChangeEvent,
	ParticipantEditorPhoneInputOnChangeEvent,
	ParticipantEditorEmailInputOnChangeEvent,
	ParticipantEditorEventKindOnChangeEvent,
	ParticipantEditorSearchExistingButtonPressedEvent,
	ParticipantEditorAddNewButtonPressedEvent,
	ParticipantEditorAddEventToExistingParticipantPressedEvent,
}
