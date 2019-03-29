// @flow strict

import { componentEpic } from './components/component/componentEpic'
import { templateEpic } from './components/template/templateEpic'
import { resizeDecorationsEpic } from './components/resizeDecorations/resizeDecorationsEpic'
import { mainActionsPanelEpic } from './components/mainActionsPanel/mainActionsPanelEpic'
import { propertiesPanelEpic } from './components/propertiesPanel/propertiesPanelEpic'
import { workspaceViewportEpic } from './components/workspace/workspaceViewportEpic'
import { addComponentPanelEpic } from './components/addComponentPanel/addComponentPanelEpic'

export const wsbStoreConfig = {
	epics: {
		component: componentEpic,
		mainActionsPanel: mainActionsPanelEpic,
		resizeDecorations: resizeDecorationsEpic,
		propertiesPanel: propertiesPanelEpic,
		template: templateEpic,
		addComponentPanel: addComponentPanelEpic,

		_workspaceViewport: workspaceViewportEpic,
	},
	debug: Boolean(process.env.NODE_ENV !== 'test' || process.env.TRACE),
}
