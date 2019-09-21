// @flow

import {
	createEpic,
	type BuiltInEffectType,
	createSimpleUpdater,
	createUpdater,
	dispatchMsgEffectCreator,
} from '../../../../../src/epics'
import { setProp, setPath2 } from '../../../../../src/utils'
import { DbParticipantsUpdatedEvent } from '../firebase/firebaseEvents'
import { type ParticipantType, type BoxType } from '../types'
import {
	OpenEventDetailsDialogCmd,
	EventDetailsDialogCloseBtnPressedEvent,
	EventDetailsDialogDeleteParticipantBtnPressedEvent,
	NationalitySelectElemChangedEvent,
	SetNationalityBtnClickedEvent,
	EditParticipantNationalityBtnClickedEvent,
	CancelSetNationalityBtnClickedEvent,
} from './participantsListDialogMsgs'
import { db } from '../firebase/firebase'
import { OpenAllParticipantsBtnPressedEvent } from '../../appMsgs'
import { countries } from '../countries'
import { compareTwoStrings } from 'string-similarity'
import { emptyBox } from '../constants'

type ParticipantsListDialogEpicStateType = {|
	visible: bool,
	participants: Array<ParticipantType>,
	selectNationality: { visible: bool, participantId: string, value: string, values: Array<string> },
	previewEvent: {|
		box: BoxType,
		url: string,
	|},
|}

const initialState: ParticipantsListDialogEpicStateType = {
	visible: false,
	participants: [],
	selectNationality: { visible: false, participantId: '', value: '', values: [] },
	previewEvent: {
		box: emptyBox,
		url: '',
	},
}

const setVisibility = setProp<ParticipantsListDialogEpicStateType, *>('visible')
const setParticipants = setProp<ParticipantsListDialogEpicStateType, *>('participants')
const getNameBoxTop = (participant, eventFileName) => {
	const event = participant.events.find(e => e.fileName === eventFileName)

	if (!event) return 9999999999

	return event.nameBox.top || event.phoneBox.top || event.emailBox.top
}
const setSelectNationalityVisible = setPath2<ParticipantsListDialogEpicStateType, *, *>('selectNationality', 'visible')
const setSelectNationalityValue = setPath2<ParticipantsListDialogEpicStateType, *, *>('selectNationality', 'value')
const setSelectNationalityParticipantId = setPath2<ParticipantsListDialogEpicStateType, *, *>('selectNationality', 'participantId')
const setSelectNationalityValues = setPath2<ParticipantsListDialogEpicStateType, *, *>('selectNationality', 'values')

const eventDetailsDialogEpic = createEpic<ParticipantsListDialogEpicStateType, BuiltInEffectType, empty>({
	vcet: 'PARTICIPANTS_LIST_DIALOG',
	initialState,
	updaters: {
		openAll: createSimpleUpdater(
			OpenAllParticipantsBtnPressedEvent.condition,
			({ R }) => R.sideEffect(dispatchMsgEffectCreator(OpenEventDetailsDialogCmd.create({ eventFileName: '' })))
		),
		open: createUpdater(
			{
				given: {
				},
				when: {
					allParicipants: DbParticipantsUpdatedEvent.condition.wsk('participants'),
					openAction: OpenEventDetailsDialogCmd.condition,
				},
				then: ({ R, values: { openAction: { eventFileName }, allParicipants }, changedActiveConditionsKeysMap }) => {
					const participants = allParicipants.filter(p => p.events && (!eventFileName || p.events.some(e => e.fileName === eventFileName)))

					participants.sort((p1, p2) => getNameBoxTop(p1, eventFileName) - getNameBoxTop(p2, eventFileName))

					let result = R.mapState(setParticipants(participants))

					if (changedActiveConditionsKeysMap.openAction) {
						result = result.mapState(setVisibility(true))
					}

					return result
				},
			}
		),
		close: createSimpleUpdater(
			EventDetailsDialogCloseBtnPressedEvent.condition,
			({ R }) =>	R.mapState(setVisibility(false))
		),
		deleteParticipant: createSimpleUpdater(
			EventDetailsDialogDeleteParticipantBtnPressedEvent.condition.wsk('index'),
			({ R, value: participantIndexToDelete, state }) => {
				const participant = state.participants[participantIndexToDelete]
				const reply = confirm(`WARNING!!! This operation will remove participant that has records for ${participant.events.length} events!`) // eslint-disable-line

				if (reply) {
					db.collection('participants').doc(participant.id).delete()
				}

				return R
			}
		),

		showEditParticipantNationality: createUpdater({
			given: {
				allParicipants: DbParticipantsUpdatedEvent.condition.wsk('participants'),
			},
			when: {
				editParticipantNationalityBtnClickedEvent: EditParticipantNationalityBtnClickedEvent.condition,
			},
			then: ({ R, values: { editParticipantNationalityBtnClickedEvent: { participantId }, allParicipants } }) => {
				const participant = allParicipants.find(p => p.id === participantId)

				if (!participant) return R

				const participantNationality = participant.nationality
				const values = [...countries].sort((c1, c2) => compareTwoStrings(c2.toLocaleLowerCase(), participantNationality.toLocaleLowerCase()) - compareTwoStrings(c1.toLocaleLowerCase(), participantNationality.toLocaleLowerCase()))

				return R
					.mapState(setSelectNationalityVisible(true))
					.mapState(setSelectNationalityParticipantId(participantId))
					.mapState(setSelectNationalityValues(values))
					.mapState(setSelectNationalityValue(values[0]))
			},
		}),

		setNationality: createUpdater({
			given: {
				allParicipants: DbParticipantsUpdatedEvent.condition.wsk('participants'),
				participantId: EditParticipantNationalityBtnClickedEvent.condition.wsk('participantId'),
			},
			when: {
				_: SetNationalityBtnClickedEvent.condition,
			},
			then: ({ R, values: { participantId, allParicipants }, state }) => {
				const participant = allParicipants.find(p => p.id === participantId)

				db.collection('participants').doc(participantId).set({
					...participant,
					nationality: state.selectNationality.value,
				})

				return R
					.mapState(setSelectNationalityVisible(false))
			},
		}),

		setSelectNationalityValue: createSimpleUpdater(
			NationalitySelectElemChangedEvent.condition,
			({ R, value: { country } }) =>	R
				.mapState(setSelectNationalityValue(country))
		),

		cancelSelectNationalityValue: createSimpleUpdater(
			CancelSetNationalityBtnClickedEvent.condition,
			({ R }) =>	R.mapState(setSelectNationalityVisible(false))
		),
	},
})

// eslint-disable-next-line import/group-exports
export {
	eventDetailsDialogEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	ParticipantsListDialogEpicStateType,
}
