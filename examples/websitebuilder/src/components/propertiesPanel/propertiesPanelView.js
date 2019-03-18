// @flow strict

import React from 'react'
import { type PropertiesPanelState } from './propertiesPanelEpic.js'
import { type Dispatch } from '../../epics.js'
import { propertiesPanelNextPageButtonPress } from './propertiesPanelACAC';
import './propertiesPanel.css'
import { PropertiesPanelWidth } from './propertiesPanelEpic';

export const PropertiesPanelView = ({ state, dispatch }: {| state: PropertiesPanelState, dispatch: Dispatch |}) => (
    <div 
        className={`PropertiesPanel${state.visible ? ' visible' : ''}`}
        style={{ ...state.position, height: state.height, width: PropertiesPanelWidth }}
    >
        <button onClick={() => dispatch(propertiesPanelNextPageButtonPress.actionCreator())}>next page</button>
    </div>
)