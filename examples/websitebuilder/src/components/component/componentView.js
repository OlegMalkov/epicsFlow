// @flow strict

import React from 'react'
import './component.css'
import { type DispatchType } from '../../../../../src/epics'
import { componentInitialState } from './componentState'

export const ComponentView = ({ state }: {| dispatch: DispatchType, state: typeof componentInitialState |}) => (
	<div
		className={`Component${state.selected ? ' ComponentSeletedBorder' : ''}`}
		style={{ ...state.position, ...state.dimensions }}
	/>
)
