// @flow strict

import React from 'react'
import { type MainActionsPanelStateType } from './mainActionsPanelState'
import './mainActionsPanel.css'
import { mainActionsPanelEditButtonPress } from './mainActionsPanelEvents'
import { type DispatchType } from '../../../../../src/epics'

export const MainActionsPanelView = ({ state, dispatch }: {| dispatch: DispatchType, state: MainActionsPanelStateType |}) => (
	<div
		className={`MainActionsPanel${state.visible ? ' visible' : ''}`}
		style={{ ...state.position, ...state.dimensions }}
	>
		<button onClick={() => dispatch(mainActionsPanelEditButtonPress.create())}>Edit</button>
	</div>
)
