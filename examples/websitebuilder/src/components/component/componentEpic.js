// @flow strict

import { type ComponentStateType, componentInitialState, updateComponentBBox, setComponentSelected, setComponentIsMovingFalse, setComponentIsMovingTrue, setComponentIsResizingFalse, setComponentIsResizingTrue } from './componentState'
import { componentVat, componentMouseDown, componentResizeNMouseDown } from './componentACAC'
import { windowMousePositionCondition, windowMouseUp, keyboardEscDownCondition } from '../../globalACAC'
import { templateWidthCondition, templateAreaMouseDown } from '../template/templateACAC'
import { componentInitialScope, type ComponentScope, initComponentMoveDnd, resetComponentMoveDnd, resetComponentResizeDnd, initComponentResizeDnd } from './componentScope'
import { dndTypeIdle, dndTypeProgress } from '../shared/dnd'
import { T, F } from '../../utils'
import { makeEpicWithScope, type BuiltInEffectType, makeUpdater } from '../../epics'

const
	componentEpic = makeEpicWithScope<ComponentStateType, ComponentScope, BuiltInEffectType, empty>({
		vat: componentVat,
		initialState: componentInitialState,
		initialScope: componentInitialScope,
		updaters: {
			dndMoveAndSelection: makeUpdater({
				dependsOn: {
					templateWidth: templateWidthCondition,
					mouseDown: componentMouseDown.condition,
				},
				reactsTo: {
					mousePosition: windowMousePositionCondition,
					cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
					mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
				},
				exec: ({
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
								.updateState(updateComponentBBox({ bboxUpdate: { ...componentStartPos }, templateWidth }))
								.updateState(setComponentIsMovingFalse)
								.updateScope(resetComponentMoveDnd)
						}
						return R.doNothing
					}

					if (mouseUp) {
						return R
							.updateState(setComponentIsMovingFalse)
							.updateState(setComponentSelected(T))
							.updateScope(resetComponentMoveDnd)
					}

					if (scope.movingDnd.type === dndTypeIdle) {
						return R.updateScope(initComponentMoveDnd({ componentStartPos: position, mouseStartPosition: mousePosition }))
					}

					const
						{ componentStartPos, mouseStartPosition } = scope.movingDnd


					const diffLeft = mouseStartPosition.left - mousePosition.left


					const diffTop = mouseStartPosition.top - mousePosition.top

					return R
						.updateState(setComponentIsMovingTrue)
						.updateState(updateComponentBBox({
							bboxUpdate: { left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop },
							templateWidth,
						}))
				},
			}),
			dndResize: makeUpdater({
				dependsOn: {
					templateWidth: templateWidthCondition,
					resizeNMouseDown: componentResizeNMouseDown.condition,
				},
				reactsTo: {
					mousePosition: windowMousePositionCondition,
					cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeNMouseDown']),
					mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['resizeNMouseDown']),
				},
				exec: ({
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
								.updateState(updateComponentBBox({ bboxUpdate: { ...componentStartPosition, ...componentStartDimensions }, templateWidth }))
								.updateState(setComponentIsResizingFalse)
								.updateScope(resetComponentResizeDnd)
						}
						return R.doNothing
					}

					if (mouseUp) {
						return R
							.updateState(setComponentIsResizingFalse)
							.updateScope(resetComponentResizeDnd)
					}

					if (scope.resizeDnd.type === dndTypeIdle) {
						return R.updateScope(initComponentResizeDnd({ componentStartDimensions: state.dimensions, componentStartPosition: state.position, mouseStartPosition: mousePosition }))
					}

					const
						{ componentStartPosition, componentStartDimensions, mouseStartPosition } = scope.resizeDnd


					const diffTop = mouseStartPosition.top - mousePosition.top

					return R
						.updateState(updateComponentBBox({ bboxUpdate: { top: componentStartPosition.top - diffTop, height: componentStartDimensions.height + diffTop }, templateWidth }))
						.updateState(setComponentIsResizingTrue)
				},
			}),
			deselection: makeUpdater({
				dependsOn: {},
				reactsTo: { 
					templateAreaMouseDown: templateAreaMouseDown.condition.toOptional(),
					escPressed: keyboardEscDownCondition.toOptional()
				},
				exec: ({ R }) => R.updateState(setComponentSelected(F)),
			}),
		},
	})

export {
	componentEpic,
}
