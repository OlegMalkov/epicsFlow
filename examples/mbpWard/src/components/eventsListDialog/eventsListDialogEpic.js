// @flow

import {
	createEpic,
	type BuiltInEffectType,
	createSimpleUpdater,
	createUpdater,
	dispatchMsgEffectCreator,
} from '../../../../../src/epics'
import { setProp } from '../../../../../src/utils'
import { FloatingActionBtnPressedEvent } from '../../appMsgs'
import {
	EventListDialogEventRowPressedEvent,
	EventListDialogFileNamesFetchedEvent,
} from './eventsListDialogMsgs'
import { WorkspaceOpenFileCmd } from '../workspace/workspaceMsgs'
import { storageRef } from '../firebase/firebase'
import { DbParticipantsUpdatedEvent } from '../firebase/firebaseEvents'
import { EventsListDialogCloseBtnPressedEvent } from './eventsListDialogMsgs'
import { EventKindToString } from '../constants'

type EventsListDialogEpicStateType = {|
	visible: bool,
	events: Array<{| date: string, place: string, eventKind: string, fileName: string, participantsCount: number |}>,
|}

const initialState: EventsListDialogEpicStateType = {
	visible: false,
	events: [],
}

const setVisibility = setProp<EventsListDialogEpicStateType, *>('visible')
const setEvents = setProp<EventsListDialogEpicStateType, *>('events')
const getEventTimestamp = (event) => {
	// eslint-disable-next-line no-unused-vars
	const [address, kind, date] = event.fileName.split('.')

	return new Date(date).getTime()
}

const eventsListDialogEpic = createEpic<EventsListDialogEpicStateType, BuiltInEffectType, empty>({
	vcet: 'EVENTS_LIST_DIALOG',
	initialState,
	updaters: {
		show: createSimpleUpdater(
			FloatingActionBtnPressedEvent.condition,
			({ R, dispatch }) => {
				storageRef.child('raw').listAll().then(function(res) {
					const fileNames = res.items.map(function(itemRef) {
						return itemRef.name
					})

					dispatch(EventListDialogFileNamesFetchedEvent.create({ fileNames }))
				})
				return R.mapState(setVisibility(true))
			}
		),
		fileNamesFetched: createUpdater(
			{
				given: {
					allParicipants: DbParticipantsUpdatedEvent.condition.wsk('participants'),
				},
				when: {
					fileNames: EventListDialogFileNamesFetchedEvent.condition.wsk('fileNames'),
				},
				then: ({ R, values: { fileNames, allParicipants } }) => {
					const events = fileNames.map(fileName => {
						const [place, eventKind, date] = fileName.split('.')

						let dateStr = new Date(date).toDateString()

						if (dateStr === 'Invalid Date') dateStr = date
						return ({
							date,
							eventKind: EventKindToString[eventKind],
							place: place.replace('uae-dubai-', '').toUpperCase(),
							fileName,
							participantsCount: allParicipants.filter(p => p.events && p.events.some(e => e.fileName === fileName)).length,
						})
					})

					events.sort((e1, e2) => getEventTimestamp(e1) - getEventTimestamp(e2))

					return R.mapState(setEvents(events))
				},
			}
		),
		onEventPressed: createSimpleUpdater(
			EventListDialogEventRowPressedEvent.condition,
			({ R, value: { index }, state }) =>	R
				.sideEffect(dispatchMsgEffectCreator(WorkspaceOpenFileCmd.create({ fileName: state.events[index].fileName })))
				.mapState(setVisibility(false))
		),
		close: createSimpleUpdater(
			EventsListDialogCloseBtnPressedEvent.condition,
			({ R }) =>	R.mapState(setVisibility(false))
		),
	},
})

// eslint-disable-next-line import/group-exports
export {
	eventsListDialogEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	EventsListDialogEpicStateType,
}
