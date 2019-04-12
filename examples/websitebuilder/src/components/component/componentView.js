// @flow strict

import React from 'react'
import './component.css'
import { type ComponentStateType } from './componentState'
import { componentMouseDownEvent } from './componentEvents'
import { type DispatchType } from '../../../../../src/epics'

export const ComponentView = ({ state, dispatch }: {| dispatch: DispatchType, state: ComponentStateType |}) => (
	<div
		className={`Component${state.selected ? ' ComponentSeletedBorder' : ''}`}
		style={{ ...state.position, ...state.dimensions }}
		onMouseDown={() => dispatch(componentMouseDownEvent.create())}
	/>
)
