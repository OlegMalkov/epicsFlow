// @flow strict

import React from 'react'
import './mainActionsPanel.css'
import { mainActionsPanelEditButtonPress } from './mainActionsPanelACnC'
import { type DispatchType } from '../../../../../src/epics'
import { mainActionsPanelInitialState } from './mainActionsPanelState'

export const MainActionsPanelView = ({ state, dispatch }: {| dispatch: DispatchType, state: typeof mainActionsPanelInitialState |}) => (
	<div
		className={`MainActionsPanel${state.visible ? ' visible' : ''}`}
		style={{ ...state.position, ...state.dimensions }}
	>
		<button onClick={() => dispatch(mainActionsPanelEditButtonPress.actionCreator())}>Edit</button>
	</div>
)
