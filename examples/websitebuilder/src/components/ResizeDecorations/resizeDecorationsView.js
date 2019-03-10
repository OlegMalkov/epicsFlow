// @flow strict

import React from 'react'
import { type ResizeDecorationsState } from './resizeDecorationsEpic'
import { type Dispatch } from '../../epics'
import { componentResizeNMouseDown } from '../Component/componentACAC'
import './resizeDecorations.css'

export const ResizeDecorationsView = ({ state, dispatch }: {| state: ResizeDecorationsState, dispatch: Dispatch |}) => (
    <div 
        className={`ComponentResizeN${state.activeHandleKey === 'n' ? ' active' : ''}${state.visible ? ' visible' : ''}`}
        style={{ ...state.handles.n.position, ...state.handles.n.dimensions }}
        onMouseDown={() => dispatch(componentResizeNMouseDown.ac())}
    />
)