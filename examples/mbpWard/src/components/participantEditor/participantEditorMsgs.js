// @flow

import { createCommand, createEvent, createSimpleEvent } from '../../../../../src/epics'
import { type BoxType } from '../types'

const ParticipantEditorNameInputOnChangeEvent = createEvent<{| value: string |}>('PARTICIPANT_EDITOR_NAME_INPUT_ON_CHANGE')
const ParticipantEditorPhoneInputOnChangeEvent = createEvent<{| value: string |}>('PARTICIPANT_EDITOR_PHONE_INPUT_ON_CHANGE')
const ParticipantEditorEmailInputOnChangeEvent = createEvent<{| value: string |}>('PARTICIPANT_EDITOR_EMAIL_INPUT_ON_CHANGE')
const ParticipantEditorNationalityInputOnChangeEvent = createEvent<{| value: string |}>('PARTICIPANT_EDITOR_NATIONALITY_INPUT_ON_CHANGE')

const ParticipantEditorSetNameAndBoxCmd = createCommand<{| value: string, box: BoxType |}>('PARTICIPANT_EDITOR_SET_NAME_AND_BOX')
const ParticipantEditorSetPhoneAndBoxCmd = createCommand<{| value: string, box: BoxType |}>('PARTICIPANT_EDITOR_SET_PHONE_AND_BOX')
const ParticipantEditorSetEmailAndBoxCmd = createCommand<{| value: string, box: BoxType |}>('PARTICIPANT_EDITOR_SET_EMAIL_AND_BOX')
const ParticipantEditorSetNationalityAndBoxCmd = createCommand<{| value: string, box: BoxType |}>('PARTICIPANT_EDITOR_SET_NATIONALITY_AND_BOX')

const ParticipantEditorSearchExistingButtonPressedEvent = createSimpleEvent('PARTICIPANT_EDITOR_SEARCH_EXISTING_BUTTON_PRESSED')
const ParticipantEditorAddNewButtonPressedEvent = createSimpleEvent('PARTICIPANT_EDITOR_ADD_NEW_BUTTON_PRESSED')
const ParticipantEditorAddEventToExistingParticipantPressedEvent = createSimpleEvent('PARTICIPANT_EDITOR_ADD_EVENT_TO_EXISTING_PARTICIPANT_BUTTON_PRESSED')

const ParticipantEditorUseExistingParticipant = createEvent<{| index: number |}>('PARTICIPANT_EDITOR_USE_EXISTING_PARTICIPANT')
const ParticipantEditorAddBtnPressed = createSimpleEvent('PARTICIPANT_EDITOR_ADD_NEW_BTN_PRESSED')

export {
	ParticipantEditorNameInputOnChangeEvent,
	ParticipantEditorPhoneInputOnChangeEvent,
	ParticipantEditorEmailInputOnChangeEvent,
	ParticipantEditorNationalityInputOnChangeEvent,

	ParticipantEditorSetNameAndBoxCmd,
	ParticipantEditorSetPhoneAndBoxCmd,
	ParticipantEditorSetEmailAndBoxCmd,
	ParticipantEditorSetNationalityAndBoxCmd,

	ParticipantEditorSearchExistingButtonPressedEvent,
	ParticipantEditorAddNewButtonPressedEvent,
	ParticipantEditorAddEventToExistingParticipantPressedEvent,

	ParticipantEditorUseExistingParticipant,
	ParticipantEditorAddBtnPressed,
}
