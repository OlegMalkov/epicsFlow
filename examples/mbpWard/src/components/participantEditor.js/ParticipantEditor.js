// @flow

import React from 'react'
import { type DispatchType } from '../../../../../src/epics'
import { type ParticipantEditorStateType } from './participantEditorEpic'
import { ParticipantEditorNameInputOnChangeEvent } from './participantEditorMsgs'
import './ParticipantEditor.css'

type PropsType = {|
    state: ParticipantEditorStateType,
    dispatch: DispatchType,
|}

export const ParticipantEditor = ({ state, dispatch }: PropsType) => {
	return (
		<div className="ParticipantEditor" style={{ display: state.visible ? 'block' : 'none' }}>
			<div>Name: <input value={state.name} onChange={e => dispatch(ParticipantEditorNameInputOnChangeEvent.create({ value: e.target.value }))} /></div>
			<div>Email: <input value={state.name} onChange={e => dispatch(ParticipantEditorNameInputOnChangeEvent.create({ value: e.target.value }))} /></div>
			<div>Phone: <input value={state.name} onChange={e => dispatch(ParticipantEditorNameInputOnChangeEvent.create({ value: e.target.value }))} /></div>
		</div>
	)
}
