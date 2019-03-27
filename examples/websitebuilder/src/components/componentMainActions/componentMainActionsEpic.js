// @flow strict

import { componentPositionCondition, componentRightCondition } from '../component/componentACAC'
import { componentResizeHandleNTopCondition, componentResizeDecorationsVisibleCondition } from '../componentResizeDecorations/componentResizeDecorationsEpic'
import { componentMainActionsInitialState, type ComponentMainActionsState, componentMainActionsSetVisible, componentMainActionsSetPosition } from './componentMainActionsState'
import { componentMainActionsEpicVat, componentsMainActionsIsVisibleCondition } from './componentMainActionsACAC'
import {
	propertiesPanelEpic,
	type PropertiesPanelStateType,
	createComputePropertiesPanelBBoxWithRespectToTemplateArea,
} from '../propertiesPanel/propertiesPanelEpic'
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic'
import { templateWidthCondition } from '../template/templateACAC'
import { areBBoxIntersect, computeBBoxFromPositionAndDimensions } from '../../utils'
import { workspaceScroll } from '../workspace/workspaceACAC'
import { createEpic, createUpdater } from '../../../../../src/epics'

const computeLeftAlignedPosition = ({ componentLeft, componentResizeHandleNTop, componentMainActionsHeight }) =>
	({ left: componentLeft, top: componentResizeHandleNTop - 10 - componentMainActionsHeight })
const computeRightAlignedPosition = ({ componentRight, componentResizeHandleNTop, componentMainActionsDimensions }) =>
	({ left: componentRight - componentMainActionsDimensions.width, top: componentResizeHandleNTop - 10 - componentMainActionsDimensions.height })
const componentMainActionsEpic = createEpic<ComponentMainActionsState, *, *>({
	vat: componentMainActionsEpicVat,
	initialState: componentMainActionsInitialState,
	updaters: {
		showHide: createUpdater({
			given: {},
			when: { resizeDecorationsVisible: componentResizeDecorationsVisibleCondition },
			then: ({ values: { resizeDecorationsVisible }, R }) => R.updateState(componentMainActionsSetVisible(resizeDecorationsVisible)),
		}),
		computePosition: createUpdater({
			given: {
				componentPosition: componentPositionCondition,
				componentResizeHandleNTop: componentResizeHandleNTopCondition,
			},
			when: {
				componentMainActionsIsVisible: componentsMainActionsIsVisibleCondition,
			},
			then: ({ values: { componentMainActionsIsVisible, componentPosition, componentResizeHandleNTop }, R, state }) => {
				if (componentMainActionsIsVisible) {
					const position = computeLeftAlignedPosition({
						componentLeft: componentPosition.left,
						componentResizeHandleNTop,
						componentMainActionsHeight: state.dimensions.height,
					})

					return R.updateState(componentMainActionsSetPosition(position))
				}
				return R.doNothing
			},
		}),
		adjustPositionIfOverlapWithPropertiesPanel: createUpdater({
			given: {
				componentRight: componentRightCondition,
				componentResizeHandleNTop: componentResizeHandleNTopCondition,
			},
			when: {
				templateWidth: templateWidthCondition,
				workspaceWidth: workspaceViewportEpic.condition.wsk('dimensions').wsk('width'),
				propertiesPanelRTPositionAndHeight: propertiesPanelEpic.condition.wg<PropertiesPanelStateType>(pp => pp.visible).ws(pp => ({ rtPosition: pp.positonRT, height: pp.height })),
				workspaceScroll: workspaceScroll.condition,
				resetPropertiesPanelRTPositionAndHeightWhenPropPanelIsNotVisible: propertiesPanelEpic.condition.wg<PropertiesPanelStateType>(pp => !pp.visible).resetConditionsByKey(['propertiesPanelRTPositionAndHeight']).toOptional(),
			},
			then: ({ values: { workspaceScroll, componentRight, componentResizeHandleNTop, propertiesPanelRTPositionAndHeight, workspaceWidth, templateWidth }, R, state }) => {
				const propertiesPanelBBoxWithRespectToTemplateArea = createComputePropertiesPanelBBoxWithRespectToTemplateArea({
					workspaceWidth,
					templateWidth,
					propertiesPanelHeight: propertiesPanelRTPositionAndHeight.height,
					workspaceScroll,
				})(propertiesPanelRTPositionAndHeight.rtPosition)

				const componentMainActionsBBox = computeBBoxFromPositionAndDimensions(state.position, state.dimensions)

				if (areBBoxIntersect(propertiesPanelBBoxWithRespectToTemplateArea, componentMainActionsBBox)) {
					const position = computeRightAlignedPosition({
						componentRight,
						componentResizeHandleNTop,
						componentMainActionsDimensions: state.dimensions,
					})

					return R.updateState(componentMainActionsSetPosition(position))
				}

				return R.doNothing
			},
		}),
	},
})

export {
	componentMainActionsEpic,
}
