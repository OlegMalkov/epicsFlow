// @flow strict

import React from 'react'
import { type ResizeDecorationsStateType } from './resizeDecorationsState'
import './resizeDecorations.css'
import { type DispatchType } from '../../../../../src/epics'
import { resizeDecorationsNMouseDown } from './resizeDecorationsACnC'

export const ResizeDecorationsView = ({ state, dispatch }: {| dispatch: DispatchType, state: ResizeDecorationsStateType |}) => (
	<div
		className={`ResizeN${state.activeHandleKey === 'n' ? ' active' : ''}${state.visible ? ' visible' : ''}`}
		style={{ ...state.handles.n.position, ...state.handles.n.dimensions }}
		onMouseDown={() => dispatch(resizeDecorationsNMouseDown.ac())}
	/>
)
