// @flow

import React from 'react'
import { type EventDetailsDialogEpicStateType } from './eventDetailsDialogEpic'
import './EventDetailsDialog.css'
import { type DispatchType } from '../../../../../src/epics'
import { EventDetailsDialogCloseBtnPressedEvent, EventDetailsDialogDeleteParticipantBtnPressedEvent } from './eventDetailsDialogMsgs'

type PropsType = {|
    state: EventDetailsDialogEpicStateType,
    dispatch: DispatchType,
|}

export const EventDetailsDialog = ({ state, dispatch }: PropsType) => {
	return (
		<div className="EventDetailsDialog" style={{ display: state.visible ? 'block' : 'none' }} >
			<button className="EventDetailsDialogCloseBtn" onClick={() => dispatch(EventDetailsDialogCloseBtnPressedEvent.create())}>X</button>
			<table>
				<thead>
					<tr>
						<th>N</th>
						<th>Name</th>
						<th>Phone</th>
						<th>Email</th>
						<th>Nationality</th>
						<th>Events</th>
						<th>Delete participant</th>
					</tr>
				</thead>
				<tbody>
					{
						state.participants.map((participant, index) => {
							return (
								<tr key={index}>
									<td>{index + 1}</td>
									<td>{participant.name}</td>
									<td>{participant.phone}</td>
									<td>{participant.email}</td>
									<td>{participant.nationality}</td>
									<td>{participant.events.map(e => e.fileName.split('.')[1]).join(',')}</td>
									<td><button onClick={() => dispatch(EventDetailsDialogDeleteParticipantBtnPressedEvent.create({ index }))}>Delete participant</button></td>
								</tr>
							)
						})
					}
				</tbody>
			</table>
		</div>
	)
}
