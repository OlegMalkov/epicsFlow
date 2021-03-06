// @flow strict

import { componentPositionCondition, componentRightCondition } from '../component/componentEvents'
import { mainActionsPanelInitialState, type MainActionsPanelStateType, mainActionsPanelSetVisible, mainActionsPanelSetPosition } from './mainActionsPanelState'
import {
	propertiesPanelEpic,
} from '../propertiesPanel/propertiesPanelEpic'
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic'
import { areBBoxIntersect, computeBBoxFromPositionAndDimensions } from '../../utils'
import { createEpic, createUpdater } from '../../../../../src/epics'
import { mainActionsPanelEpicVcet, mainActionsIsVisibleCondition } from './mainActionsPanelEvents'
import { resizeDecorationsVisibleCondition, resizeHandleNTopCondition } from '../resizeDecorations/resizeDecorationsEpic'
import { templateWidthCondition } from '../template/templateEvents'
import { workspaceScroll } from '../workspace/workspaceEvents'
import { propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea, type PropertiesPanelStateType } from '../propertiesPanel/propertiesPanelState'

const computeLeftAlignedPosition = ({ componentLeft, resizeHandleNTop, mainActionsPanelHeight }) =>
	({ left: componentLeft, top: resizeHandleNTop - 10 - mainActionsPanelHeight })
const computeRightAlignedPosition = ({ componentRight, resizeHandleNTop, mainActionsPanelDimensions }) =>
	({ left: componentRight - mainActionsPanelDimensions.width, top: resizeHandleNTop - 10 - mainActionsPanelDimensions.height })
const mainActionsPanelEpic = createEpic<MainActionsPanelStateType, *, *>({
	vcet: mainActionsPanelEpicVcet,
	initialState: mainActionsPanelInitialState,
	updaters: {
		showHide: createUpdater({
			given: {},
			when: { resizeDecorationsVisible: resizeDecorationsVisibleCondition },
			then: ({ values: { resizeDecorationsVisible }, R }) => R.mapState(mainActionsPanelSetVisible(resizeDecorationsVisible)),
		}),
		computePosition: createUpdater({
			given: {
				componentPosition: componentPositionCondition,
				resizeHandleNTop: resizeHandleNTopCondition,
			},
			when: {
				mainActionsPanelIsVisible: mainActionsIsVisibleCondition,
			},
			then: ({ values: { mainActionsPanelIsVisible, componentPosition, resizeHandleNTop }, R, state }) => {
				if (mainActionsPanelIsVisible) {
					const position = computeLeftAlignedPosition({
						componentLeft: componentPosition.left,
						resizeHandleNTop,
						mainActionsPanelHeight: state.dimensions.height,
					})

					return R.mapState(mainActionsPanelSetPosition(position))
				}
				return R.doNothing
			},
		}),
		adjustPositionIfOverlapWithPropertiesPanel: createUpdater({
			given: {
				componentRight: componentRightCondition,
				resizeHandleNTop: resizeHandleNTopCondition,
			},
			when: {
				templateWidth: templateWidthCondition,
				workspaceWidth: workspaceViewportEpic.condition.wsk('dimensions').wsk('width'),
				propertiesPanelRTPositionAndHeight: propertiesPanelEpic.condition.wg<PropertiesPanelStateType>(pp => pp.visible).ws(pp => ({ rtPosition: pp.positonRT, height: pp.height })),
				workspaceScroll: workspaceScroll.condition,
				resetPropertiesPanelRTPositionAndHeightWhenPropPanelIsNotVisible: propertiesPanelEpic.condition.wg<PropertiesPanelStateType>(pp => !pp.visible).resetConditionsByKey(['propertiesPanelRTPositionAndHeight']).toOptional(),
			},
			then: ({ values: { workspaceScroll, componentRight, resizeHandleNTop, propertiesPanelRTPositionAndHeight, workspaceWidth, templateWidth }, R, state }) => {
				const propertiesPanelBBoxWithRespectToTemplateArea = propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea({
					workspaceWidth,
					templateWidth,
					propertiesPanelHeight: propertiesPanelRTPositionAndHeight.height,
					workspaceScroll,
				})(propertiesPanelRTPositionAndHeight.rtPosition)

				const mainActionsPanelBBox = computeBBoxFromPositionAndDimensions(state.position, state.dimensions)

				if (areBBoxIntersect(propertiesPanelBBoxWithRespectToTemplateArea, mainActionsPanelBBox)) {
					const position = computeRightAlignedPosition({
						componentRight,
						resizeHandleNTop,
						mainActionsPanelDimensions: state.dimensions,
					})

					return R.mapState(mainActionsPanelSetPosition(position))
				}

				return R.doNothing
			},
		}),
	},
})

export {
	mainActionsPanelEpic,
}
