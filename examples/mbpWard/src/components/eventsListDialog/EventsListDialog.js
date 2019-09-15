// @flow

import React from 'react'
import { type EventsListDialogEpicStateType } from './eventsListDialogEpic'
import './EventsListDialog.css'
import { type DispatchType } from '../../../../../src/epics'
import { EventListDialogEventRowPressedEvent, EventsListDialogCloseBtnPressedEvent } from './eventsListDialogMsgs'
import { OpenEventDetailsDialogCmd } from '../eventDetailsDialog/eventDetailsDialogMsgs'

type PropsType = {|
    state: EventsListDialogEpicStateType,
    dispatch: DispatchType,
|}

export const EventsListDialog = ({ state, dispatch }: PropsType) => {
	return (
		<div className="EventsListDialog" style={{ display: state.visible ? 'block' : 'none' }} >
			<div className="EventsListDialogTitle">Events list</div>
			<button className="EventsListDialogCloseBtn" onClick={() => dispatch(EventsListDialogCloseBtnPressedEvent.create())}>X</button>
			{
				state.events.map((event, index) => {
					return <div
						key={index}
						className="EventsListDialogEventRow"
					>
						<span className="EventsListDialogEventRowText" style={{ width: 100 }}>{event.date}</span>
						<span className="EventsListDialogEventRowText" style={{ width: 150 }}>{event.eventKind}</span>
						<span className="EventsListDialogEventRowText" style={{ width: 60 }}>{event.place}</span>
						<span className="EventsListDialogEventRowText" style={{ width: 20 }}>{event.participantsCount}</span>
						<button onClick={() => dispatch(EventListDialogEventRowPressedEvent.create({ index }))}>Open</button>
						<button onClick={() => dispatch(OpenEventDetailsDialogCmd.create({ eventFileName: event.fileName }))}>Details</button>
					</div>
				})
			}
		</div>
	)
}
