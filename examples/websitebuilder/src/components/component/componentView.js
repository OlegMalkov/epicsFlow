// @flow strict

import React from 'react'
import './component.css'
import { type ComponentStateType } from './componentState'
import { componentMouseDown } from './componentACAC'
import { type DispatchType } from '../../epics'

export const ComponentView = ({ state, dispatch }: {| dispatch: DispatchType, state: ComponentStateType |}) => (
	<div
		className={`Component${state.selected ? ' ComponentSeletedBorder' : ''}`}
		style={{ ...state.position, ...state.dimensions }}
		onMouseDown={() => dispatch(componentMouseDown.ac())}
	/>
)
