// @flow strict

import React from 'react'
import { type PropertiesPanelState } from './propertiesPanelEpic.js'
import { type DispatchType } from '../../epics.js'
import { propertiesPanelNextPageButtonPress, propertiesPanelDragMouseDown } from './propertiesPanelACAC';
import './propertiesPanel.css'
import { PropertiesPanelWidth } from './propertiesPanelEpic';

export const PropertiesPanelView = ({ state, dispatch }: {| state: PropertiesPanelState, dispatch: DispatchType |}) => (
    <div 
        className={`PropertiesPanel${state.visible ? ' visible' : ''}`}
        style={{ ...state.positonRT, height: state.height, width: PropertiesPanelWidth }}
    >
        <button onClick={() => dispatch(propertiesPanelNextPageButtonPress.actionCreator())}>next page</button>
        <div className="PropertiesPanelDragHandle" onMouseDown={() => dispatch(propertiesPanelDragMouseDown.actionCreator())} />
    </div>
)