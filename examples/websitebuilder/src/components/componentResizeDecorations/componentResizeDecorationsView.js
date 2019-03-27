// @flow strict

import React from 'react'
import { type ComponentResizeDecorationsStateType } from './componentResizeDecorationsEpic'
import { componentResizeNMouseDown } from '../component/componentACAC'
import './componentResizeDecorations.css'
import { type DispatchType } from '../../../../../src/epics'

export const ResizeDecorationsView = ({ state, dispatch }: {| dispatch: DispatchType, state: ComponentResizeDecorationsStateType |}) => (
	<div
		className={`ComponentResizeN${state.activeHandleKey === 'n' ? ' active' : ''}${state.visible ? ' visible' : ''}`}
		style={{ ...state.handles.n.position, ...state.handles.n.dimensions }}
		onMouseDown={() => dispatch(componentResizeNMouseDown.ac())}
	/>
)
