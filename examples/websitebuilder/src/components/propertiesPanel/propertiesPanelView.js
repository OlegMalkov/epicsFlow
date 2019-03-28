// @flow strict

import React from 'react'
import { propertiesPanelNextPageButtonPress, propertiesPanelDragMouseDown } from './propertiesPanelACnC'
import './propertiesPanel.css'
import { type DispatchType } from '../../../../../src/epics'
import { propertiesPanelWidth, type PropertiesPanelStateType } from './propertiesPanelState'

export const PropertiesPanelView = ({ state, dispatch }: {| dispatch: DispatchType, state: PropertiesPanelStateType |}) => (
	<div
		className={`PropertiesPanel${state.visible ? ' visible' : ''}`}
		style={{ ...state.positonRT, height: state.height, width: propertiesPanelWidth }}
	>
		<button onClick={() => dispatch(propertiesPanelNextPageButtonPress.actionCreator())}>next page</button>
		<div className="PropertiesPanelDragHandle" onMouseDown={() => dispatch(propertiesPanelDragMouseDown.actionCreator())} />
	</div>
)
