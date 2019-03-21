// @flow strict

import React from 'react'
import './component.css'
import { type ComponentState } from './componentState'
import { type DispatchType } from '../../epics'
import { componentMouseDown } from './componentACAC';

export const ComponentView = ({ state, dispatch }: {| state: ComponentState, dispatch: DispatchType |}) => (
    <div 
        className={`Component${state.selected ? ' ComponentSeletedBorder' : ''}`}
        style={{ ...state.position, ...state.dimensions }}
        onMouseDown={() => dispatch(componentMouseDown.ac())}
    />
)