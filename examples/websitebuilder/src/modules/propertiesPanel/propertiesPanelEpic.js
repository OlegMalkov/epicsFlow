// @flow strict

import { dndTypeProgress, dndTypeIdle } from '../shared/dnd'
import { windowMousePositionCondition, keyboardEscDownCondition, windowMouseUp } from '../../globalACAC'
import {
	areBBoxIntersect,
	computeBBoxFromPositionAndDimensions,
} from '../../utils'
import { mainActionsIsVisibleCondition, mainActionsPositionWhenVisibleCondition, mainActionsDimensionsWhenVisibleCondition } from '../mainActionsPanel/mainActionsPanelACnC'
import { componentsPositionCondition, componentsDimensionsCondition, componentsSelectedCondition } from '../components/componentsACnC'
import { templateWidthCondition } from '../template/templateACnC'
import { propertiesPanelNextPageButtonPress, propertiesPanelDragMouseDown } from './propertiesPanelACnC'
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic'
import { createEpicWithScope, createUpdater, createEpicCondition } from '../../../../../src/epics'
import { propertiesPanelInitialState, propertiesPanelSetVisible, propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea, possiblePositionsRTPositionComputers, propertiesPanelComputeRightTopPositionRT, propertiesPanelSetPosition, propertiesPanelSetPositionNoChecks, propertiesPanelSetHeight } from './propertiesPanelState'
import { propertiesPanelInitialScope, propertiesPanelResetMoveDnd, propertiesPanelInitMoveDnd } from './propertiesPanelScope'

const propertiesPanelEpicVat = 'PROPERTIES_PANEL_VAT'
const propertiesPanelCondition = createEpicCondition<typeof propertiesPanelInitialState>(propertiesPanelEpicVat)
const propertiesPanelVisibleCondition = propertiesPanelCondition.withSelectorKey('visible')


const propertiesPanelEpic = createEpicWithScope<typeof propertiesPanelInitialState, typeof propertiesPanelInitialScope, *, *>({
	vat: propertiesPanelEpicVat,
	initialState: propertiesPanelInitialState,
	initialScope: propertiesPanelInitialScope,
	updaters: {
		showHide: createUpdater({
			given: {},
			when: { mainActionsPanelVisible: mainActionsIsVisibleCondition },
			then: ({ values: { mainActionsPanelVisible }, R }) => R.mapState(propertiesPanelSetVisible(mainActionsPanelVisible)),
		}),
		computePosition: createUpdater({
			given: {
				componentsPosition: componentsPositionCondition,
				componentsDimensions: componentsDimensionsCondition,
				mainActionsPosition: mainActionsPositionWhenVisibleCondition,
				mainActionsDimensions: mainActionsDimensionsWhenVisibleCondition,
				templateWidth: templateWidthCondition,
				workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions'),
			},
			when: {
				propertiesPanelIsVisible: propertiesPanelVisibleCondition.withGuard<bool>(visible => visible === true),
			},
			then: ({
				values: {
					propertiesPanelIsVisible,
					workspaceViewportDimensions,
					templateWidth,
					componentsPosition,
					componentsDimensions,
					mainActionsPosition,
					mainActionsDimensions,
				},
				R,
				state,
			}) => {
				if (propertiesPanelIsVisible) {
					const computePositionProps = { workspaceViewportDimensions, propertiesPanelHeight: state.height }
					const computePropertiesPanelBBoxWithRespectToTemplateArea = propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea({
						workspaceWidth: workspaceViewportDimensions.width,
						templateWidth,
						propertiesPanelHeight: state.height,
						workspaceScroll: { top: 0 },
					})
					const componentsBBox = computeBBoxFromPositionAndDimensions(componentsPosition, componentsDimensions)
					const mainActionsPanelBBox = computeBBoxFromPositionAndDimensions(mainActionsPosition, mainActionsDimensions)
					const intersectsWithComponents = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentsBBox)
					const intersectsWithComponentsMainActions = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, mainActionsPanelBBox)
					const propertiesPanelPositionRT = possiblePositionsRTPositionComputers.reduce((positonRT, positionRTComputer) => {
						if (positonRT) return positonRT
						const possiblePositionRT = positionRTComputer(computePositionProps)
						const possibleBBoxWithRespectToTemplateArea = computePropertiesPanelBBoxWithRespectToTemplateArea(possiblePositionRT)

						if (
							intersectsWithComponents(possibleBBoxWithRespectToTemplateArea)
                                || intersectsWithComponentsMainActions(possibleBBoxWithRespectToTemplateArea)
						) return null

						return possiblePositionRT
					}, null) || propertiesPanelComputeRightTopPositionRT(computePositionProps)

					return R.mapState(propertiesPanelSetPosition({ workspaceViewportDimensions, propertiesPanelPositionRT, propertiesPanelHeight: state.height }))
				}
				return R.doNothing
			},
		}),
		moveDnd: createUpdater({
			given: {
				workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions'),
				propertiesPanelDragMouseDown: propertiesPanelDragMouseDown.condition,
			},
			when: {
				mousePosition: windowMousePositionCondition,
				cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['propertiesPanelDragMouseDown']),
				mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['propertiesPanelDragMouseDown']),
			},
			then: ({
				state,
				scope,
				values: { mousePosition, workspaceViewportDimensions },
				changedActiveConditionsKeysMap: { cancel, mouseUp },
				R,
			}) => {
				if (cancel) {
					if (scope.moveDnd.type === dndTypeProgress) {
						const { propertiesPanelStartPosition } = scope.moveDnd

						return R
							.mapState(propertiesPanelSetPositionNoChecks(propertiesPanelStartPosition))
							.mapScope(propertiesPanelResetMoveDnd)
					}
					return R.doNothing
				}

				if (mouseUp) {
					return R.mapScope(propertiesPanelResetMoveDnd)
				}

				if (scope.moveDnd.type === dndTypeIdle) {
					return R.mapScope(propertiesPanelInitMoveDnd({ propertiesPanelStartPosition: state.positonRT, mouseStartPosition: mousePosition }))
				}

				const { propertiesPanelStartPosition, mouseStartPosition } = scope.moveDnd
				const leftDiff = mouseStartPosition.left - mousePosition.left
				const topDiff = mouseStartPosition.top - mousePosition.top

				return R.mapState(propertiesPanelSetPosition({
					workspaceViewportDimensions,
					propertiesPanelPositionRT: { right: propertiesPanelStartPosition.right + leftDiff, top: propertiesPanelStartPosition.top - topDiff },
					propertiesPanelHeight: state.height,
				}))
			},
		}),
		validateAndFixPosition: createUpdater({
			given: {},
			when: {
				workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions'),
			},
			then: ({ values: { workspaceViewportDimensions }, R, state }) =>
				R.mapState(
					propertiesPanelSetPosition({
						workspaceViewportDimensions,
						propertiesPanelPositionRT: state.positonRT,
						propertiesPanelHeight: state.height,
					})
				),
		}),
		resetStateOnComponentsDeselection: createUpdater({
			given: {},
			when: { componentsDeselected: componentsSelectedCondition.withGuard<bool>(selected => selected === false) },
			then: ({ R }) => R.mapState(() => propertiesPanelInitialState),
		}),
		setHeightForNextPage: createUpdater({
			given: {},
			when: { propertiesPanelNextPagePressed: propertiesPanelNextPageButtonPress.condition },
			then: ({ R }) => R.mapState(propertiesPanelSetHeight(h => h + 50)),
		}),
	},
})

// eslint-disable-next-line import/group-exports
export {
	propertiesPanelEpic,
}