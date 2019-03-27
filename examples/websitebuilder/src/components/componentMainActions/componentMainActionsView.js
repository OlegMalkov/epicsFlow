// @flow strict

import React from 'react'
import { type ComponentMainActionsState } from './componentMainActionsState'
import './componentMainActions.css'
import { componentMainActionsEditButtonPress } from './componentMainActionsACAC'
import { type DispatchType } from '../../../../../src/epics'

export const ComponentMainActionsView = ({ state, dispatch }: {| dispatch: DispatchType, state: ComponentMainActionsState |}) => (
	<div
		className={`ComponentMainActions${state.visible ? ' visible' : ''}`}
		style={{ ...state.position, ...state.dimensions }}
	>
		<button onClick={() => dispatch(componentMainActionsEditButtonPress.actionCreator())}>Edit</button>
	</div>
)
