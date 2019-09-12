// @flow

import {
	createEpic,
	createEpicCondition,
	type BuiltInEffectType,
	createSimpleUpdater,
} from '../../../../../src/epics'
import { setProp } from '../../../../../src/utils'
import { type EventKindType, type BoxType } from '../types'
import { EventKind, emptyBox } from '../constants'
import { ParticipantEditorNameInputOnChangeEvent, ParticipantEditorPhoneInputOnChangeEvent, ParticipantEditorEmailInputOnChangeEvent, ParticipantEditorEventKindOnChangeEvent } from './participantEditorMsgs'

type ParticipantEditorStateType = {|
	id: number,
	visible: bool,
	name: string,
	phone: string,
	email: string,
	nameBox: BoxType,
	phoneBox: BoxType,
	emailBox: BoxType,
	eventKind: EventKindType,
|}

const initialState: ParticipantEditorStateType = {
	id: -1,
	visible: false,
	name: '',
	phone: '',
	email: '',
	nameBox: emptyBox,
	phoneBox: emptyBox,
	emailBox: emptyBox,
	eventKind: EventKind.PEACE_INVOKING_CEREMONY,
}

const vcet = 'SELECTION_FRAME_VCET'
const ParticipantEditorStateChanged = createEpicCondition<ParticipantEditorStateType>(vcet)

const setVisible = setProp<ParticipantEditorStateType, *>('visible')
const setName = setProp<ParticipantEditorStateType, *>('name')
const setPhone = setProp<ParticipantEditorStateType, *>('phone')
const setEmail = setProp<ParticipantEditorStateType, *>('email')
const setEventKind = setProp<ParticipantEditorStateType, *>('eventKind')

const ParticipantEditorEpic = createEpic<ParticipantEditorStateType, BuiltInEffectType, empty>({
	vcet,
	initialState,
	updaters: {
		nameInputOnChange: createSimpleUpdater(ParticipantEditorNameInputOnChangeEvent.condition.wsk('value'), ({ R, value }) => R.mapState(setName(value))),
		phoneInputOnChange: createSimpleUpdater(ParticipantEditorPhoneInputOnChangeEvent.condition.wsk('value'), ({ R, value }) => R.mapState(setPhone(value))),
		emailInputOnChange: createSimpleUpdater(ParticipantEditorEmailInputOnChangeEvent.condition.wsk('value'), ({ R, value }) => R.mapState(setEmail(value))),
		eventKindOnChange: createSimpleUpdater(ParticipantEditorEventKindOnChangeEvent.condition.wsk('value'), ({ R, value }) => R.mapState(setEventKind(value))),
	},
})

// eslint-disable-next-line import/group-exports
export {
	ParticipantEditorEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	ParticipantEditorStateType,
}
