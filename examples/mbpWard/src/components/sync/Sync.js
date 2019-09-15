// @flow

import React from 'react'
import { type DispatchType } from '../../../../../src/epics'
import { type SyncStateType } from './syncEpic'
import './Sync.css'
import { SyncBtnPressedEvent } from './syncMsgs'

type PropsType = {|
	state: SyncStateType,
	dispatch: DispatchType,
|}

export const Sync = ({ state, dispatch }: PropsType) => {
	if (state.progress.active) {
		if (state.progress.awaitingSeekersJorneyData) {
			return <div className="SyncProgress"><h2>Loading seekers jorney stylesheet</h2></div>
		}
		return <div className="SyncProgress">
			<div>
				<h2>Do not touch computer.</h2>
				<div>Processing: <b>{state.progress.participant.name} [{state.progress.index + 1} of {state.progress.count}]</b></div>
			</div>
		</div>
	}

	return (
		<div className="SyncBtn" onClick={() => dispatch(SyncBtnPressedEvent.create())}>Sync</div>
	)
}
