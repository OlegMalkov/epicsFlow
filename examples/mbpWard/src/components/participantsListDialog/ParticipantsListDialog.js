// @flow

import React from 'react'
import { type ParticipantsListDialogEpicStateType } from './participantsListDialogEpic'
import './ParticipantsListDialog.css'
import { type DispatchType } from '../../../../../src/epics'
import {
	EventDetailsDialogCloseBtnPressedEvent,
	EventDetailsDialogDeleteParticipantBtnPressedEvent,
	EditParticipantNationalityBtnClickedEvent,
	NationalitySelectElemChangedEvent,
	SetNationalityBtnClickedEvent,
	CancelSetNationalityBtnClickedEvent,
	ParticipantListDialogFileNamePressedEvent,
} from './participantsListDialogMsgs'
import { countries } from '../countries'

type PropsType = {|
    state: ParticipantsListDialogEpicStateType,
    dispatch: DispatchType,
|}

export const ParticipantsListDialog = ({ state, dispatch }: PropsType) => {
	return (
		<div className="ParticipantsListDialog" style={{ display: state.visible ? 'block' : 'none' }} >
			{ state.selectNationality.visible && <div className="nationalitySelector">
				<select
					value={state.selectNationality.value}
					onChange={e => dispatch(NationalitySelectElemChangedEvent.create({ country: e.target.value }))}
				>
					{state.selectNationality.values.map(c => <option key={c} value={c}>{c}</option>)}
				</select>
				<div>
					<button onClick={() => dispatch(SetNationalityBtnClickedEvent.create())}>Set country</button>
					<button onClick={() => dispatch(CancelSetNationalityBtnClickedEvent.create())}>Cancel</button>
				</div>
			</div>}
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
									<td>{participant.nationality}
										{
											participant.nationality && !countries.includes(participant.nationality) &&
												<button onClick={() => dispatch(EditParticipantNationalityBtnClickedEvent.create({ participantId: participant.id }))}>edit</button>
										}
									</td>
									<td>{participant.events.map(e => e.fileName.split('.')[1]).map(fileName => {
										return (
											<span key={fileName}>
												<a
													href="javascript:void(0)"
													onClick={() => dispatch(ParticipantListDialogFileNamePressedEvent.create({
														participantId: participant.id,
														fileName,
													}))}
												>
													{fileName}
												</a>
												<span> </span>
											</span>
										)
									})}</td>
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
