// @flow strict

import { componentsEpic } from './modules/components/componentsEpic'
import { templateEpic } from './modules/template/templateEpic'
import { resizeDecorationsEpic } from './modules/resizeDecorations/resizeDecorationsEpic'
import { mainActionsPanelEpic } from './modules/mainActionsPanel/mainActionsPanelEpic'
import { propertiesPanelEpic } from './modules/propertiesPanel/propertiesPanelEpic'
import { workspaceViewportEpic } from './modules/workspace/workspaceViewportEpic'
import { addComponentPanelEpic } from './modules/addComponentPanel/addComponentPanelEpic'

export const wsbStoreConfig = {
	epics: {
		components: componentsEpic,
		mainActionsPanel: mainActionsPanelEpic,
		resizeDecorations: resizeDecorationsEpic,
		propertiesPanel: propertiesPanelEpic,
		template: templateEpic,
		addComponentPanel: addComponentPanelEpic,

		_workspaceViewport: workspaceViewportEpic,
	},
	debug: Boolean(process.env.NODE_ENV !== 'test' || process.env.TRACE),
}
