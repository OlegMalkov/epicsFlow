// @flow strict

import React from 'react'
import { type PropertiesPanelStateType } from './propertiesPanelEpic'
import { propertiesPanelNextPageButtonPress, propertiesPanelDragMouseDown } from './propertiesPanelACAC'
import './propertiesPanel.css'
import { PropertiesPanelWidth } from './propertiesPanelEpic'
import { type DispatchType } from '../../../../../src/epics'

export const PropertiesPanelView = ({ state, dispatch }: {| dispatch: DispatchType, state: PropertiesPanelStateType |}) => (
	<div
		className={`PropertiesPanel${state.visible ? ' visible' : ''}`}
		style={{ ...state.positonRT, height: state.height, width: PropertiesPanelWidth }}
	>
		<button onClick={() => dispatch(propertiesPanelNextPageButtonPress.actionCreator())}>next page</button>
		<div className="PropertiesPanelDragHandle" onMouseDown={() => dispatch(propertiesPanelDragMouseDown.actionCreator())} />
	</div>
)
