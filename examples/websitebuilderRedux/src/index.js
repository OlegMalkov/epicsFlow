// @flow strict
import React from 'react'
import ReactDOM from 'react-dom'
import '../../websitebuilder/src/index.css'
import { reduxWsbStore } from './reduxWsbStore'
import { createApp, type AppStateForRenderType } from '../../websitebuilder/src/app'
import {
	addComponentPanelInitialState,
} from '../../websitebuilder/src/modules/addComponentPanel/addComponentPanelState'
import { templateInitialState } from '../../websitebuilder/src/modules/template/templateState'

const initialAppState = reduxWsbStore.getState()

// REDUX_ISSUE LACK_OF_PRIVATE_STATE there is no concept of private state in redux, whole app state is available in the view
// avoiding unnecessary render calls by using this app level selector
function computeRenderState(appState: typeof initialAppState): AppStateForRenderType {
	return {
		addComponentPanel: addComponentPanelInitialState,
		components: appState.components.state,
		mainActionsPanel: appState.mainActionsPanel,
		propertiesPanel: appState.propertiesPanel.state,
		resizeDecorations: appState.resizeDecorations,
		template: templateInitialState,
	}
}

const initialRenderState = computeRenderState(initialAppState)
const App = createApp({
	dispatch: reduxWsbStore.dispatch,
	subscribe: (sub => {
		let lastGivenState: typeof initialRenderState = initialRenderState

		reduxWsbStore.subscribe(appState => {
			const nextRenderState = computeRenderState(appState)

			if (Object.keys(nextRenderState).some(k => nextRenderState[k] !== lastGivenState[k])) {
				lastGivenState = nextRenderState
				sub(nextRenderState)
			}
		})
	}),
	initialState: initialRenderState,
})
const elem = document.getElementById('root')

if (elem) {
	ReactDOM.render(<App />, elem)
}
