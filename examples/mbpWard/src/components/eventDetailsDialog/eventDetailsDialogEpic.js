// @flow

import {
	createEpic,
	type BuiltInEffectType,
	createSimpleUpdater,
	createUpdater,
} from '../../../../../src/epics'
import { setProp } from '../../../../../src/utils'
import { DbParticipantsUpdatedEvent } from '../firebase/firebaseEvents'
import { type ParticipantType } from '../types'
import { OpenEventDetailsDialogCmd, EventDetailsDialogCloseBtnPressedEvent, EventDetailsDialogDeleteParticipantBtnPressedEvent } from './eventDetailsDialogMsgs'
import { db } from '../firebase/firebase'

type EventDetailsDialogEpicStateType = {|
	visible: bool,
	participants: Array<ParticipantType>,
|}

const initialState: EventDetailsDialogEpicStateType = {
	visible: false,
	participants: [],
}

const setVisibility = setProp<EventDetailsDialogEpicStateType, *>('visible')
const setParticipants = setProp<EventDetailsDialogEpicStateType, *>('participants')
const getNameBoxTop = (participant, eventFileName) => {
	const event = participant.events.find(e => e.fileName === eventFileName)

	if (!event) return 0

	return event.nameBox.top
}

const eventDetailsDialogEpic = createEpic<EventDetailsDialogEpicStateType, BuiltInEffectType, empty>({
	vcet: 'EVENT_DETAILS_DIALOG',
	initialState,
	updaters: {
		open: createUpdater(
			{
				given: {
				},
				when: {
					allParicipants: DbParticipantsUpdatedEvent.condition.wsk('participants'),
					openAction: OpenEventDetailsDialogCmd.condition,
				},
				then: ({ R, values: { openAction: { eventFileName }, allParicipants }, changedActiveConditionsKeysMap }) => {
					const participants = allParicipants.filter(p => p.events && p.events.some(e => e.fileName === eventFileName))

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
	},
})

// eslint-disable-next-line import/group-exports
export {
	eventDetailsDialogEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	EventDetailsDialogEpicStateType,
}
