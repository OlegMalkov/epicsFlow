// @flow strict

import { type ComponentStateType, componentInitialState, componentUpdateBBox, componentSetSelected, componentSetIsMovingFalse, componentSetIsMovingTrue, setComponentIsResizingFalse, setComponentIsResizingTrue } from './componentState'
import { componentVcet, componentMouseDownEvent } from './componentEvents'
import { windowMousePositionCondition, windowMouseUpEvent, keyboardEscDownCondition } from '../../globalEvents'
import { componentInitialScope, type ComponentScopeType, componentInitMoveDnd, componentResetMoveDnd, componentResetResizeDnd, componentInitResizeDnd } from './componentScope'
import { dndTypeIdle, dndTypeProgress } from '../shared/dnd'
import { T, F } from '../../../../../src/utils'
import { createEpicWithScope, type BuiltInEffectType, createUpdater } from '../../../../../src/epics'
import { templateWidthCondition, templateAreaMouseDownEvent } from '../template/templateEvents'
import { resizeDecorationsNMouseDown } from '../resizeDecorations/resizeDecorationsEvents'

const
	componentEpic = createEpicWithScope<ComponentStateType, ComponentScopeType, BuiltInEffectType, empty>({
		vcet: componentVcet,
		initialState: componentInitialState,
		initialScope: componentInitialScope,
		updaters: {
			dndMoveAndSelection: createUpdater({
				given: {
					templateWidth: templateWidthCondition,
				},
				when: {
					mouseDown: componentMouseDownEvent.condition,
					mousePosition: windowMousePositionCondition,
					cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
					mouseUp: windowMouseUpEvent.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
				},
				then: ({
					state: { position },
					scope,
					values: { mousePosition, templateWidth },
					changedActiveConditionsKeysMap: { cancel, mouseUp },
					R,
				}) => {
					if (cancel) {
						if (scope.movingDnd.type === dndTypeProgress) {
							const { componentStartPos } = scope.movingDnd

							return R
								.mapState(componentUpdateBBox({ bboxUpdate: { ...componentStartPos }, templateWidth }))
								.mapState(componentSetIsMovingFalse)
								.mapScope(componentResetMoveDnd)
						}
						return R.doNothing
					}

					if (mouseUp) {
						return R
							.mapState(componentSetIsMovingFalse)
							.mapState(componentSetSelected(T))
							.mapScope(componentResetMoveDnd)
					}

					if (scope.movingDnd.type === dndTypeIdle) {
						return R.mapScope(componentInitMoveDnd({ componentStartPos: position, mouseStartPosition: mousePosition }))
					}

					const { componentStartPos, mouseStartPosition } = scope.movingDnd
					const diffLeft = mouseStartPosition.left - mousePosition.left
					const diffTop = mouseStartPosition.top - mousePosition.top

					return R
						.mapState(componentSetIsMovingTrue)
						.mapState(componentUpdateBBox({
							bboxUpdate: { left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop },
							templateWidth,
						}))
				},
			}),
			dndResize: createUpdater({
				given: {
					templateWidth: templateWidthCondition,
					resizeDecorationsNMouseDown: resizeDecorationsNMouseDown.condition,
				},
				when: {
					mousePosition: windowMousePositionCondition,
					cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeDecorationsNMouseDown']),
					mouseUp: windowMouseUpEvent.condition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeDecorationsNMouseDown']),
				},
				then: ({
					state,
					scope,
					values: { mousePosition, templateWidth },
					changedActiveConditionsKeysMap: { cancel, mouseUp },
					R,
				}) => {

					if (cancel) {
						if (scope.resizeDnd.type === dndTypeProgress) {
							const { componentStartPosition, componentStartDimensions } = scope.resizeDnd

							return R
								.mapState(componentUpdateBBox({ bboxUpdate: { ...componentStartPosition, ...componentStartDimensions }, templateWidth }))
								.mapState(setComponentIsResizingFalse)
								.mapScope(componentResetResizeDnd)
						}
						return R.doNothing
					}

					if (mouseUp) {
						return R
							.mapState(setComponentIsResizingFalse)
							.mapScope(componentResetResizeDnd)
					}

					if (scope.resizeDnd.type === dndTypeIdle) {
						return R.mapScope(componentInitResizeDnd({ componentStartDimensions: state.dimensions, componentStartPosition: state.position, mouseStartPosition: mousePosition }))
					}

					const
						{ componentStartPosition, componentStartDimensions, mouseStartPosition } = scope.resizeDnd


					const diffTop = mouseStartPosition.top - mousePosition.top

					return R
						.mapState(componentUpdateBBox({ bboxUpdate: { top: componentStartPosition.top - diffTop, height: componentStartDimensions.height + diffTop }, templateWidth }))
						.mapState(setComponentIsResizingTrue)
				},
			}),
			deselection: createUpdater({
				given: {},
				when: {
					templateAreaMouseDownEvent: templateAreaMouseDownEvent.condition.toOptional(),
					escPressed: keyboardEscDownCondition.toOptional(),
				},
				then: ({ R }) => R.mapState(componentSetSelected(F)),
			}),
		},
	})

export {
	componentEpic,
}
