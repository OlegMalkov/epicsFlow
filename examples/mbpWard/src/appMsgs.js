// @flow strict

import { createSimpleEvent } from '../../../src/epics'

const FloatingActionBtnPressedEvent = createSimpleEvent('FLOATING_ACTION_BTN_PRESSED')
const OpenAllParticipantsBtnPressedEvent = createSimpleEvent('OPEN_ALL_PARTICIPANTS_BTN_PRESSED')

export {
	FloatingActionBtnPressedEvent,
	OpenAllParticipantsBtnPressedEvent,
}
