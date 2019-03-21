// @flow strict

import React from 'react'
import { type ComponentResizeDecorationsState } from './componentResizeDecorationsEpic'
import { type DispatchType } from '../../epics'
import { componentResizeNMouseDown } from '../component/componentACAC'
import './componentResizeDecorations.css'

export const ResizeDecorationsView = ({ state, dispatch }: {| state: ComponentResizeDecorationsState, dispatch: DispatchType |}) => (
    <div 
        className={`ComponentResizeN${state.activeHandleKey === 'n' ? ' active' : ''}${state.visible ? ' visible' : ''}`}
        style={{ ...state.handles.n.position, ...state.handles.n.dimensions }}
        onMouseDown={() => dispatch(componentResizeNMouseDown.ac())}
    />
)