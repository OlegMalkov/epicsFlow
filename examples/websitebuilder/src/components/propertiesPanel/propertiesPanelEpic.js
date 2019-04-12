// @flow strict

import { dndTypeProgress, dndTypeIdle } from '../shared/dnd'
import { windowMousePositionCondition, keyboardEscDownCondition, windowMouseUpEvent } from '../../globalEvents'
import {
	areBBoxIntersect,
	computeBBoxFromPositionAndDimensions,
} from '../../utils'
import { mainActionsIsVisibleCondition, mainActionsPositionWhenVisibleCondition, mainActionsDimensionsWhenVisibleCondition } from '../mainActionsPanel/mainActionsPanelEvents'
import { componentPositionCondition, componentDimensionsCondition, componentSelectedCondition } from '../component/componentEvents'
import { templateWidthCondition } from '../template/templateEvents'
import { propertiesPanelNextPageButtonPress, propertiesPanelDragMouseDown } from './propertiesPanelEvents'
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic'
import { createEpicWithScope, createUpdater, createEpicCondition } from '../../../../../src/epics'
import { propertiesPanelInitialState, type PropertiesPanelStateType, propertiesPanelSetVisible, propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea, possiblePositionsRTPositionComputers, propertiesPanelComputeRightTopPositionRT, propertiesPanelSetPosition, propertiesPanelSetPositionNoChecks, propertiesPanelSetHeight } from './propertiesPanelState'
import { propertiesPanelInitialScope, type PropertiesPanelScopeType, propertiesPanelResetMoveDnd, propertiesPanelInitMoveDnd } from './propertiesPanelScope'

const propertiesPanelEpicVcet = 'PROPERTIES_PANEL_VCET'
const propertiesPanelCondition = createEpicCondition<PropertiesPanelStateType>(propertiesPanelEpicVcet)
const propertiesPanelVisibleCondition = propertiesPanelCondition.withSelectorKey('visible')


const propertiesPanelEpic = createEpicWithScope<PropertiesPanelStateType, PropertiesPanelScopeType, *, *>({
	vcet: propertiesPanelEpicVcet,
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
				componentPosition: componentPositionCondition,
				componentDimensions: componentDimensionsCondition,
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
					componentPosition,
					componentDimensions,
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
					const componentBBox = computeBBoxFromPositionAndDimensions(componentPosition, componentDimensions)
					const mainActionsPanelBBox = computeBBoxFromPositionAndDimensions(mainActionsPosition, mainActionsDimensions)
					const intersectsWithComponent = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentBBox)
					const intersectsWithComponentsMainActions = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, mainActionsPanelBBox)
					const propertiesPanelPositionRT = possiblePositionsRTPositionComputers.reduce((positonRT, positionRTComputer) => {
						if (positonRT) return positonRT
						const possiblePositionRT = positionRTComputer(computePositionProps)
						const possibleBBoxWithRespectToTemplateArea = computePropertiesPanelBBoxWithRespectToTemplateArea(possiblePositionRT)

						if (
							intersectsWithComponent(possibleBBoxWithRespectToTemplateArea)
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
				mouseUp: windowMouseUpEvent.condition.toOptional().resetConditionsByKeyAfterReducerCall(['propertiesPanelDragMouseDown']),
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
		resetStateOnComponentDeselection: createUpdater({
			given: {},
			when: { componentDeselected: componentSelectedCondition.withGuard<bool>(selected => selected === false) },
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
