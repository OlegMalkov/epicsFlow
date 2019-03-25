// @flow strict

import { createStore } from './epics';
import { componentEpic } from './components/component/componentEpic'
import { templateEpic } from './components/template/templateEpic'
import { componentResizeDecorationsEpic } from './components/componentResizeDecorations/componentResizeDecorationsEpic'
import { componentMainActionsEpic } from './components/componentMainActions/componentMainActionsEpic'
import { propertiesPanelEpic } from './components/propertiesPanel/propertiesPanelEpic'
import { leftPanelEpic } from './components/leftPanel/leftPanelEpic'
import { workspaceViewportEpic } from './components/workspace/workspaceViewportEpic'

const wsbStore = createStore<*>({
	epics: {
		component: componentEpic,
		componentMainActions: componentMainActionsEpic,
		resizeDecorations: componentResizeDecorationsEpic,
		propertiesPanel: propertiesPanelEpic,
		template: templateEpic,
		leftPanel: leftPanelEpic,

		_workspaceViewport: workspaceViewportEpic,
	},
	debug: true,
})

//$FlowFixMe
window.$R = {}
window.$R.store = wsbStore

export {
    wsbStore,
}