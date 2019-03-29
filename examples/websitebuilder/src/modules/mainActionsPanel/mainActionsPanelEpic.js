// @flow strict

import { componentsPositionCondition, componentsRightCondition } from '../components/componentsACnC'
import { mainActionsPanelInitialState, mainActionsPanelSetVisible, mainActionsPanelSetPosition } from './mainActionsPanelState'
import {
	propertiesPanelEpic,
} from '../propertiesPanel/propertiesPanelEpic'
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic'
import { areBBoxIntersect, computeBBoxFromPositionAndDimensions } from '../../utils'
import { createEpic, createUpdater } from '../../../../../src/epics'
import { mainActionsPanelEpicVat, mainActionsIsVisibleCondition } from './mainActionsPanelACnC'
import { resizeDecorationsVisibleCondition, resizeHandleNTopCondition } from '../resizeDecorations/resizeDecorationsEpic'
import { templateWidthCondition } from '../template/templateACnC'
import { workspaceScroll } from '../workspace/workspaceACnC'
import { propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea, propertiesPanelInitialState } from '../propertiesPanel/propertiesPanelState'

const computeLeftAlignedPosition = ({ componentsLeft, resizeHandleNTop, mainActionsPanelHeight }) =>
	({ left: componentsLeft, top: resizeHandleNTop - 10 - mainActionsPanelHeight })
const computeRightAlignedPosition = ({ componentsRight, resizeHandleNTop, mainActionsPanelDimensions }) =>
	({ left: componentsRight - mainActionsPanelDimensions.width, top: resizeHandleNTop - 10 - mainActionsPanelDimensions.height })
const mainActionsPanelEpic = createEpic<typeof mainActionsPanelInitialState, *, *>({
	vat: mainActionsPanelEpicVat,
	initialState: mainActionsPanelInitialState,
	updaters: {
		showHide: createUpdater({
			given: {},
			when: { resizeDecorationsVisible: resizeDecorationsVisibleCondition },
			then: ({ values: { resizeDecorationsVisible }, R }) => R.mapState(mainActionsPanelSetVisible(resizeDecorationsVisible)),
		}),
		computePosition: createUpdater({
			given: {
				componentsPosition: componentsPositionCondition,
				resizeHandleNTop: resizeHandleNTopCondition,
			},
			when: {
				mainActionsPanelIsVisible: mainActionsIsVisibleCondition,
			},
			then: ({ values: { mainActionsPanelIsVisible, componentsPosition, resizeHandleNTop }, R, state }) => {
				if (mainActionsPanelIsVisible) {
					const position = computeLeftAlignedPosition({
						componentsLeft: componentsPosition.left,
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
				componentsRight: componentsRightCondition,
				resizeHandleNTop: resizeHandleNTopCondition,
			},
			when: {
				templateWidth: templateWidthCondition,
				workspaceWidth: workspaceViewportEpic.condition.wsk('dimensions').wsk('width'),
				propertiesPanelRTPositionAndHeight: propertiesPanelEpic.condition.wg<typeof propertiesPanelInitialState>(pp => pp.visible).ws(pp => ({ rtPosition: pp.positonRT, height: pp.height })),
				workspaceScroll: workspaceScroll.condition,
				resetPropertiesPanelRTPositionAndHeightWhenPropPanelIsNotVisible: propertiesPanelEpic.condition.wg<typeof propertiesPanelInitialState>(pp => !pp.visible).resetConditionsByKey(['propertiesPanelRTPositionAndHeight']).toOptional(),
			},
			then: ({ values: { workspaceScroll, componentsRight, resizeHandleNTop, propertiesPanelRTPositionAndHeight, workspaceWidth, templateWidth }, R, state }) => {
				const propertiesPanelBBoxWithRespectToTemplateArea = propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea({
					workspaceWidth,
					templateWidth,
					propertiesPanelHeight: propertiesPanelRTPositionAndHeight.height,
					workspaceScroll,
				})(propertiesPanelRTPositionAndHeight.rtPosition)

				const mainActionsPanelBBox = computeBBoxFromPositionAndDimensions(state.position, state.dimensions)

				if (areBBoxIntersect(propertiesPanelBBoxWithRespectToTemplateArea, mainActionsPanelBBox)) {
					const position = computeRightAlignedPosition({
						componentsRight,
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
