// @flow strict

import React from 'react'
import './components.css'
import { type DispatchType } from '../../../../../src/epics'
import { componentsInitialState } from './componentsState'

export const ComponentsView = ({ state }: {| dispatch: DispatchType, state: typeof componentsInitialState |}) => (
	<React.Fragment>
		{
			Object.keys(state.byId).map(id => {
				const component = state.byId[id]

				return <div
					key={id}
					className={`Components${state.selectedComponentsIds.includes(id) ? ' ComponentsSeletedBorder' : ''}`}
					style={{ ...component.position, ...component.dimensions }}
				/>
			})
		}
	</React.Fragment>
)
