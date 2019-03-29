// @flow strict

import React from 'react'
import './resizeDecorations.css'
import { type DispatchType } from '../../../../../src/epics'
import { resizeDecorationsNMouseDown } from './resizeDecorationsACnC'
import { resizeDecorationsInitialState } from './resizeDecorationsState'

export const ResizeDecorationsView = ({ state, dispatch }: {| dispatch: DispatchType, state: typeof resizeDecorationsInitialState |}) => (
	<div
		className={`ResizeN${state.activeHandleKey === 'n' ? ' active' : ''}${state.visible ? ' visible' : ''}`}
		style={{ ...state.handles.n.position, ...state.handles.n.dimensions }}
		onMouseDown={() => dispatch(resizeDecorationsNMouseDown.actionCreator())}
	/>
)
