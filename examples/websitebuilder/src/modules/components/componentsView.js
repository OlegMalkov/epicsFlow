// @flow strict

import React from 'react'
import './components.css'
import { type DispatchType } from '../../../../../src/epics'
import { componentsInitialState } from './componentsState'

export const ComponentsView = ({ state }: {| dispatch: DispatchType, state: typeof componentsInitialState |}) => (
	<div
		className={`Components${state.selected ? ' ComponentsSeletedBorder' : ''}`}
		style={{ ...state.position, ...state.dimensions }}
	/>
)
