// @flow strict

import React from 'react'
import { type ComponentMainActionsState } from './componentMainActionsEpic.js'
import { type Dispatch } from '../../epics.js'
import './componentMainActions.css'
import { componentMainActionsEditButtonPress } from './componentMainActionsACAC';

export const ComponentMainActionsView = ({ state, dispatch }: {| state: ComponentMainActionsState, dispatch: Dispatch |}) => (
    <div 
        className={`ComponentMainActions${state.visible ? ' visible' : ''}`}
        style={{ ...state.position, ...state.dimensions }}
    >
        <button onClick={() => dispatch(componentMainActionsEditButtonPress.actionCreator())}>Edit</button>
    </div>
)