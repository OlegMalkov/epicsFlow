// @flow strict

import React from 'react'
import './selectedComponentsDecorations.css'
import { type DispatchType } from '../../../../../src/epics'
import { selectedComponentsDecorationsNMouseDown } from './selectedComponentsDecorationsACnC'
import { selectedComponentsDecorationsInitialState } from './selectedComponentsDecorationsState'

export const SelectedComponentsDecorationsView = ({ state, dispatch }: {| dispatch: DispatchType, state: typeof selectedComponentsDecorationsInitialState |}) => (
	<div
		className={`SelectedComponentsN${state.activeHandleKey === 'n' ? ' active' : ''}${state.visible ? ' visible' : ''}`}
		style={{ ...state.handles.n.position, ...state.handles.n.dimensions }}
		onMouseDown={() => dispatch(selectedComponentsDecorationsNMouseDown.actionCreator())}
	/>
)
