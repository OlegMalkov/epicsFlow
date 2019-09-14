// @flow

import React from 'react'
import { type DispatchType } from '../../../../../src/epics'
import { type ParticipantEditorStateType } from './participantEditorEpic'
import {
	ParticipantEditorNameInputOnChangeEvent,
	ParticipantEditorEmailInputOnChangeEvent,
	ParticipantEditorPhoneInputOnChangeEvent,
	ParticipantEditorNationalityInputOnChangeEvent,
	ParticipantEditorAddBtnPressed,
	ParticipantEditorUseExistingParticipant,
} from './participantEditorMsgs'
import './ParticipantEditor.css'

type PropsType = {|
    state: ParticipantEditorStateType,
    dispatch: DispatchType,
|}

export const ParticipantEditor = ({ state, dispatch }: PropsType) => {
	return (
		<div className="ParticipantEditor" style={{ display: state.visible ? 'block' : 'none' }}>
			<div className="inputRow">Name <input value={state.name} onChange={e => dispatch(ParticipantEditorNameInputOnChangeEvent.create({ value: e.target.value }))} /></div>
			<div className="inputRow">Phone <input value={state.phone} onChange={e => dispatch(ParticipantEditorPhoneInputOnChangeEvent.create({ value: e.target.value }))} /></div>
			<div className="inputRow">Email <input value={state.email} onChange={e => dispatch(ParticipantEditorEmailInputOnChangeEvent.create({ value: e.target.value }))} /></div>
			<div className="inputRow">Nationality <input value={state.nationality} onChange={e => dispatch(ParticipantEditorNationalityInputOnChangeEvent.create({ value: e.target.value }))} /></div>

			<div className="bestMatchParticipants">
				{
					state.bestMatchParticipants.map(
						({ participant, rating, source }, index) =>
							<div className="matchedParticipant" key={index}>
								<div style={{ flex: 1, padding: 7 }}>
									[{source}]{parseInt(rating * 100, 10)}% - {participant.name}, {participant.phone}, {participant.email}, {participant.nationality}
								</div>
								<button onClick={() => dispatch(ParticipantEditorUseExistingParticipant.create({ index }))}>Use</button>
							</div>
					)
				}
			</div>
			<div>{ state.existingParticipant ? `ID: ${state.existingParticipant.id}` : 'New participant will be created'}</div>
			<button onClick={() => dispatch(ParticipantEditorAddBtnPressed.create())}>{ state.existingParticipant ? 'Add event to existing participant' : 'Add new participant'}</button>
		</div>
	)
}
