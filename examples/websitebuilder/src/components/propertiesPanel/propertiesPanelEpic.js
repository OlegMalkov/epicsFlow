// @flow strict

import { type DndIdleType, dndTypeProgress, dndInitialState, dndTypeIdle } from '../shared/dnd'
import { type RTPositionType, type LTPositionType, type DimensionsType } from '../../types'
import { windowMousePositionCondition, keyboardEscDownCondition, windowMouseUp } from '../../globalACAC'
import {
	setPropDeepCompare,
	areBBoxIntersect,
	computeBBoxFromPositionAndDimensions,
} from '../../utils'
import { componentsMainActionsIsVisibleCondition, componentsMainActionsPositionWhenVisibleCondition, componentsMainActionsDimensionsWhenVisibleCondition } from '../componentMainActions/componentMainActionsACAC'
import { componentPositionCondition, componentDimensionsCondition, componentSelectedCondition } from '../component/componentACAC'
import { templateWidthCondition } from '../template/templateACAC'
import { propertiesPanelNextPageButtonPress, propertiesPanelDragMouseDown } from './propertiesPanelACAC'
import { workspaceViewportEpic } from '../workspace/workspaceViewportEpic'
import { workspaceScroll } from '../workspace/workspaceACAC'
import { makeEpicCondition, makeEpicWithScope, makeUpdater } from '../../epics'

type PropertiesPanelStateType = {|
    height: number,
    positonRT: RTPositionType,
    visible: bool,
|}

type PropertiesPanelScopeType = {|
    moveDnd: DndIdleType | {| mouseStartPosition: LTPositionType, propertiesPanelStartPosition: RTPositionType, type: typeof dndTypeProgress |},
|}

type GetPositionPropsType = {| propertiesPanelHeight: number, workspaceViewportDimensions: DimensionsType |}

const MarginFromWorspaceViewportPx = 20
const setVisible = setPropDeepCompare<PropertiesPanelStateType, *>('visible')
const _setPosition = setPropDeepCompare<PropertiesPanelStateType, *>('positonRT')
const setPosition = ({ workspaceViewportDimensions, propertiesPanelPositionRT, propertiesPanelHeight }) => {
	let { right, top } = propertiesPanelPositionRT

	const maxRight = workspaceViewportDimensions.width - PropertiesPanelWidth / 2

	if (right > maxRight) {
		right = maxRight
	}
	const minRight = -(PropertiesPanelWidth / 2)

	if (right < minRight) {
		right = minRight
	}
	const maxTop = workspaceViewportDimensions.height - propertiesPanelHeight / 2

	if (top > maxTop) {
		top = maxTop
	}
	const minTop = 0

	if (top < minTop) {
		top = minTop
	}

	return _setPosition({ top, right })
}
const setHeight = setPropDeepCompare<PropertiesPanelStateType, *>('height')
const setMoveDnd = setPropDeepCompare<PropertiesPanelScopeType, *>('moveDnd')
const initMoveDnd = ({ propertiesPanelStartPosition, mouseStartPosition }) => setMoveDnd({ type: dndTypeProgress, propertiesPanelStartPosition, mouseStartPosition })
const resetMoveDnd = setMoveDnd(dndInitialState)
const PropertiesPanelWidth = 300
const propertiesPanelEpicVat = 'PROPERTIES_PANEL_VAT'
const propertiesPanelCondition = makeEpicCondition<PropertiesPanelStateType>(propertiesPanelEpicVat)
const propertiesPanelVisibleCondition = propertiesPanelCondition.withSelectorKey('visible')
const initialState = { positonRT: { right: 0, top: -99999 }, height: 300, visible: false }
const computeRightTopPositionRT = (props: GetPositionPropsType): RTPositionType => ({// eslint-disable-line no-unused-vars
	right: MarginFromWorspaceViewportPx,
	top: MarginFromWorspaceViewportPx,
})
const computeRightBottomPositionRT = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionPropsType): RTPositionType => ({
	right: MarginFromWorspaceViewportPx,
	top: workspaceViewportDimensions.height - propertiesPanelHeight - MarginFromWorspaceViewportPx,
})
const computeRightForLeftCase = (workspaceWidth) => workspaceWidth - PropertiesPanelWidth - MarginFromWorspaceViewportPx
const computeLeftBottomPositionRT = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionPropsType): RTPositionType => ({
	right: computeRightForLeftCase(workspaceViewportDimensions.width),
	top: workspaceViewportDimensions.height - propertiesPanelHeight - MarginFromWorspaceViewportPx,
})
const computeLeftTopPositionRT = ({ workspaceViewportDimensions }: GetPositionPropsType): RTPositionType => ({
	right: computeRightForLeftCase(workspaceViewportDimensions.width),
	top: MarginFromWorspaceViewportPx,
})
const possiblePositionsRTComputers = [
	computeRightTopPositionRT,
	computeRightBottomPositionRT,
	computeLeftBottomPositionRT,
	computeLeftTopPositionRT,
]
const makeComputePropertiesPanelBBoxWithRespectToTemplateArea = ({
	workspaceWidth,
	templateWidth,
	propertiesPanelHeight,
	workspaceScroll,
}: {|
        propertiesPanelHeight: number,
        templateWidth: number,
        workspaceScroll: { top: number },
        workspaceWidth: number,
    |}) => (propertiesPanelPositionRT: RTPositionType) => {
	// |  | template |  |
	// |   workspace    |
	// properties panel is inside workspace
	// template is centered within workspace

	const templateOffset = (workspaceWidth - templateWidth) / 2
	const right = Math.floor((workspaceWidth - propertiesPanelPositionRT.right) - templateOffset)
	const top = propertiesPanelPositionRT.top + workspaceScroll.top
	const result = {
		left: right - PropertiesPanelWidth,
		top,
		right,
		bottom: top + propertiesPanelHeight,
	}

	return result
}

const propertiesPanelEpic = makeEpicWithScope<PropertiesPanelStateType, PropertiesPanelScopeType, *, *>({
	vat: propertiesPanelEpicVat,
	initialState,
	initialScope: { moveDnd: dndInitialState },
	updaters: {
		showHide: makeUpdater({
			dependsOn: {},
			reactsTo: { componentMainActionsVisible: componentsMainActionsIsVisibleCondition },
			exec: ({ values: { componentMainActionsVisible }, R }) => R.updateState(setVisible(componentMainActionsVisible)),
		}),
		computePosition: makeUpdater({
			dependsOn: {
				componentPosition: componentPositionCondition,
				componentDimensions: componentDimensionsCondition,
				componentsMainActionsPosition: componentsMainActionsPositionWhenVisibleCondition,
				componentsMainActionsDimensions: componentsMainActionsDimensionsWhenVisibleCondition,
				templateWidth: templateWidthCondition,
				workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions'),
			},
			reactsTo: {
				propertiesPanelIsVisible: propertiesPanelVisibleCondition.withGuard<bool>(visible => visible === true),
			},
			exec: ({
				values: {
					propertiesPanelIsVisible,
					workspaceViewportDimensions,
					templateWidth,
					componentPosition,
					componentDimensions,
					componentsMainActionsPosition,
					componentsMainActionsDimensions,
				},
				R,
				state,
			}) => {
				if (propertiesPanelIsVisible) {
					const computePositionProps = { workspaceViewportDimensions, propertiesPanelHeight: state.height }
					const computePropertiesPanelBBoxWithRespectToTemplateArea = makeComputePropertiesPanelBBoxWithRespectToTemplateArea({
						workspaceWidth: workspaceViewportDimensions.width,
						templateWidth,
						propertiesPanelHeight: state.height,
						workspaceScroll: { top: 0 },
					})
					const componentBBox = computeBBoxFromPositionAndDimensions(componentPosition, componentDimensions)
					const componentMainActionsBBox = computeBBoxFromPositionAndDimensions(componentsMainActionsPosition, componentsMainActionsDimensions)
					const intersectsWithComponent = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentBBox)
					const intersectsWithComponentsMainActions = (propertiesPanelBBox) => areBBoxIntersect(propertiesPanelBBox, componentMainActionsBBox)
					const propertiesPanelPositionRT = possiblePositionsRTComputers.reduce((positonRT, positionRTComputer) => {
						if (positonRT) return positonRT
						const possiblePositionRT = positionRTComputer(computePositionProps)
						const possibleBBoxWithRespectToTemplateArea = computePropertiesPanelBBoxWithRespectToTemplateArea(possiblePositionRT)

						if (
							intersectsWithComponent(possibleBBoxWithRespectToTemplateArea)
                                || intersectsWithComponentsMainActions(possibleBBoxWithRespectToTemplateArea)
						) return null

						return possiblePositionRT
					}, null) || computeRightTopPositionRT(computePositionProps)

					return R.updateState(setPosition({ workspaceViewportDimensions, propertiesPanelPositionRT, propertiesPanelHeight: state.height }))
				}
				return R.doNothing
			},
		}),
		moveDnd: makeUpdater({
			dependsOn: {
				workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions'),
				propertiesPanelDragMouseDown: propertiesPanelDragMouseDown.condition,
			},
			reactsTo: {
				mousePosition: windowMousePositionCondition,
				cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['propertiesPanelDragMouseDown']),
				mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['propertiesPanelDragMouseDown']),
			},
			exec: ({
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
							.updateState(_setPosition(propertiesPanelStartPosition))
							.updateScope(resetMoveDnd)
					}
					return R.doNothing
				}

				if (mouseUp) {
					return R.updateScope(resetMoveDnd)
				}

				if (scope.moveDnd.type === dndTypeIdle) {
					return R.updateScope(initMoveDnd({ propertiesPanelStartPosition: state.positonRT, mouseStartPosition: mousePosition }))
				}

				const { propertiesPanelStartPosition, mouseStartPosition } = scope.moveDnd
				const leftDiff = mouseStartPosition.left - mousePosition.left
				const topDiff = mouseStartPosition.top - mousePosition.top

				return R.updateState(setPosition({
					workspaceViewportDimensions,
					propertiesPanelPositionRT: { right: propertiesPanelStartPosition.right + leftDiff, top: propertiesPanelStartPosition.top - topDiff },
					propertiesPanelHeight: state.height,
				}))
			},
		}),
		validateAndFixPosition: makeUpdater({
			dependsOn: {},
			reactsTo: {
				workspaceViewportDimensions: workspaceViewportEpic.condition.wsk('dimensions'),
			},
			exec: ({ values: { workspaceViewportDimensions }, R, state }) =>
				R.updateState(
					setPosition({
						workspaceViewportDimensions,
						propertiesPanelPositionRT: state.positonRT,
						propertiesPanelHeight: state.height,
					})
				),
		}),
		resetStateOnComponentDeselection: makeUpdater({
			dependsOn: {},
			reactsTo: { componentDeselected: componentSelectedCondition.withGuard<bool>(selected => selected === false) },
			exec: ({ R }) => R.updateState(() => initialState),
		}),
		setHeightForNextPage: makeUpdater({
			dependsOn: {},
			reactsTo: { propertiesPanelNextPagePressed: propertiesPanelNextPageButtonPress.condition },
			exec: ({ R }) => R.updateState(setHeight(h => h + 50)),
		}),
	},
})

// eslint-disable-next-line import/group-exports
export type {
	PropertiesPanelStateType,
}

// eslint-disable-next-line import/group-exports
export {
	makeComputePropertiesPanelBBoxWithRespectToTemplateArea,
	propertiesPanelEpic,
	PropertiesPanelWidth,
}
