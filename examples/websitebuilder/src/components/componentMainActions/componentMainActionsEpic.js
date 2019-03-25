// @flow strict

import { componentPositionCondition, componentRightCondition } from '../component/componentACAC'
import { componentResizeHandleNTopCondition, componentResizeDecorationsVisibleCondition } from '../componentResizeDecorations/componentResizeDecorationsEpic'
import { componentMainActionsInitialState, type ComponentMainActionsState, componentMainActionsSetVisible, componentMainActionsSetPosition } from './componentMainActionsState'
import { componentMainActionsEpicVat, componentsMainActionsIsVisibleCondition } from './componentMainActionsACAC'
import {
	propertiesPanelEpic,
	type PropertiesPanelStateType,
	makeComputePropertiesPanelBBoxWithRespectToTemplateArea,
} from '../propertiesPanel/propertiesPanelEpic'
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic'
import { templateWidthCondition } from '../template/templateACAC'
import { areBBoxIntersect, computeBBoxFromPositionAndDimensions } from '../../utils'
import { workspaceScroll } from '../workspace/workspaceACAC'
import { makeUpdater, makeEpic } from '../../epics'

const computeLeftAlignedPosition = ({ componentLeft, componentResizeHandleNTop, componentMainActionsHeight }) =>
	({ left: componentLeft, top: componentResizeHandleNTop - 10 - componentMainActionsHeight })
const computeRightAlignedPosition = ({ componentRight, componentResizeHandleNTop, componentMainActionsDimensions }) =>
	({ left: componentRight - componentMainActionsDimensions.width, top: componentResizeHandleNTop - 10 - componentMainActionsDimensions.height })
const componentMainActionsEpic = makeEpic<ComponentMainActionsState, *, *>({
	vat: componentMainActionsEpicVat,
	initialState: componentMainActionsInitialState,
	updaters: {
		showHide: makeUpdater({
			dependsOn: {},
			reactsTo: { resizeDecorationsVisible: componentResizeDecorationsVisibleCondition },
			exec: ({ values: { resizeDecorationsVisible }, R }) => R.updateState(componentMainActionsSetVisible(resizeDecorationsVisible)),
		}),
		computePosition: makeUpdater({
			dependsOn: {
				componentPosition: componentPositionCondition,
				componentResizeHandleNTop: componentResizeHandleNTopCondition,
			},
			reactsTo: {
				componentMainActionsIsVisible: componentsMainActionsIsVisibleCondition,
			},
			exec: ({ values: { componentMainActionsIsVisible, componentPosition, componentResizeHandleNTop }, R, state }) => {
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
		adjustPositionIfOverlapWithPropertiesPanel: makeUpdater({
			dependsOn: {
				componentRight: componentRightCondition,
				componentResizeHandleNTop: componentResizeHandleNTopCondition,
			},
			reactsTo: {
				templateWidth: templateWidthCondition,
				workspaceWidth: workspaceViewportEpic.condition.wsk('dimensions').wsk('width'),
				propertiesPanelRTPositionAndHeight: propertiesPanelEpic.condition.wg<PropertiesPanelStateType>(pp => pp.visible).ws(pp => ({ rtPosition: pp.positonRT, height: pp.height })),
				workspaceScroll: workspaceScroll.condition,
				resetPropertiesPanelRTPositionAndHeightWhenPropPanelIsNotVisible: propertiesPanelEpic.condition.wg<PropertiesPanelStateType>(pp => !pp.visible).resetConditionsByKey(['propertiesPanelRTPositionAndHeight']).toOptional(),
			},
			exec: ({ values: { workspaceScroll, componentRight, componentResizeHandleNTop, propertiesPanelRTPositionAndHeight, workspaceWidth, templateWidth }, R, state }) => {
				const propertiesPanelBBoxWithRespectToTemplateArea = makeComputePropertiesPanelBBoxWithRespectToTemplateArea({
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
