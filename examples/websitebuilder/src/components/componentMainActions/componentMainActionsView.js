// @flow strict

import React from 'react'
import { type ComponentMainActionsState } from './componentMainActionsState.js'
import { type DispatchType } from '../../epics.js'
import './componentMainActions.css'
import { componentMainActionsEditButtonPress } from './componentMainActionsACAC.js';

export const ComponentMainActionsView = ({ state, dispatch }: {| state: ComponentMainActionsState, dispatch: DispatchType |}) => (
    <div 
        className={`ComponentMainActions${state.visible ? ' visible' : ''}`}
        style={{ ...state.position, ...state.dimensions }}
    >
        <button onClick={() => dispatch(componentMainActionsEditButtonPress.actionCreator())}>Edit</button>
    </div>
)