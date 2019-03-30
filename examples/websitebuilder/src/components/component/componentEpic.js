// @flow strict

import { type ComponentStateType, componentInitialState, componentUpdateBBox, componentSetSelected, componentSetIsMovingFalse, componentSetIsMovingTrue, setComponentIsResizingFalse, setComponentIsResizingTrue } from './componentState'
import { componentVat, componentMouseDown } from './componentACnC'
import { windowMousePositionCondition, windowMouseUp, keyboardEscDownCondition } from '../../globalACAC'
import { componentInitialScope, type ComponentScopeType, componentInitMoveDnd, componentResetMoveDnd, componentResetResizeDnd, componentInitResizeDnd } from './componentScope'
import { dndTypeIdle, dndTypeProgress } from '../shared/dnd'
import { T, F } from '../../../../../src/utils'
import { createEpicWithScope, type BuiltInEffectType, createUpdater } from '../../../../../src/epics'
import { templateWidthCondition, templateAreaMouseDown } from '../template/templateACnC'
import { resizeDecorationsNMouseDown } from '../resizeDecorations/resizeDecorationsACnC'

const
	componentEpic = createEpicWithScope<ComponentStateType, ComponentScopeType, BuiltInEffectType, empty>({
		vat: componentVat,
		initialState: componentInitialState,
		initialScope: componentInitialScope,
		updaters: {
			dndMoveAndSelection: createUpdater({
				given: {
					templateWidth: templateWidthCondition,
				},
				when: {
					mouseDown: componentMouseDown.condition,
					mousePosition: windowMousePositionCondition,
					cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
					mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
				},
				then: ({
					state: { position },
					scope,
					values: { mousePosition },
					changedActiveConditionsKeysMap: { cancel, mouseUp },
					R,
				}) => {
					if (cancel) {
						if (scope.movingDnd.type === dndTypeProgress) {
							const { componentStartPos } = scope.movingDnd

							return R
								.mapState(componentUpdateBBox({ bboxUpdate: { ...componentStartPos } }))
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
						}))
				},
			}),
			moveLeftOnTemplateShrinks: createUpdater({
				given: {},
				when: { templateWidth: templateWidthCondition },
				then: ({ values: { templateWidth }, R, state: { dimensions, position } }) => {
					if (dimensions.width + position.left > templateWidth) {
						return R.mapState(componentUpdateBBox({ bboxUpdate: { left: templateWidth - dimensions.width } }))
					}

					return R.doNothing
				},
			}),
			dndResize: createUpdater({
				given: { resizeDecorationsNMouseDown: resizeDecorationsNMouseDown.condition	},
				when: {
					mousePosition: windowMousePositionCondition,
					cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeDecorationsNMouseDown']),
					mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeDecorationsNMouseDown']),
				},
				then: ({
					state,
					scope,
					values: { mousePosition },
					changedActiveConditionsKeysMap: { cancel, mouseUp },
					R,
				}) => {

					if (cancel) {
						if (scope.resizeDnd.type === dndTypeProgress) {
							const { componentStartPosition, componentStartDimensions } = scope.resizeDnd

							return R
								.mapState(componentUpdateBBox({ bboxUpdate: { ...componentStartPosition, ...componentStartDimensions } }))
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

					const { componentStartPosition, componentStartDimensions, mouseStartPosition } = scope.resizeDnd
					const diffTop = mouseStartPosition.top - mousePosition.top

					return R
						.mapState(componentUpdateBBox({ bboxUpdate: { top: componentStartPosition.top - diffTop, height: componentStartDimensions.height + diffTop } }))
						.mapState(setComponentIsResizingTrue)
				},
			}),
			deselection: createUpdater({
				given: {},
				when: {
					templateAreaMouseDown: templateAreaMouseDown.condition.toOptional(),
					escPressed: keyboardEscDownCondition.toOptional(),
				},
				then: ({ R }) => R.mapState(componentSetSelected(F)),
			}),
		},
	})

export {
	componentEpic,
}
