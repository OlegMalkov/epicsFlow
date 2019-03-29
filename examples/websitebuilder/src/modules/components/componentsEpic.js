// @flow strict

import { componentsInitialState, componentsUpdateBBox, componentsSetSelected, componentsSetIsMovingFalse, componentsSetIsMovingTrue, setComponentsIsResizingFalse, setComponentsIsResizingTrue } from './componentsState'
import { componentsVat } from './componentsACnC'
import { windowMousePositionCondition, windowMouseUp, keyboardEscDownCondition, windowMouseDown } from '../../globalACAC'
import { componentsInitialScope, componentsInitMoveDnd, componentsResetMoveDnd, componentsResetResizeDnd, componentsInitResizeDnd } from './componentsScope'
import { dndTypeIdle, dndTypeProgress } from '../shared/dnd'
import { T, F } from '../../../../../src/utils'
import { createEpicWithScope, createUpdater } from '../../../../../src/epics'
import { resizeDecorationsNMouseDown } from '../resizeDecorations/resizeDecorationsACnC'

const
	componentsEpic = createEpicWithScope<typeof componentsInitialState, typeof componentsInitialScope, empty, empty>({
		vat: componentsVat,
		initialState: componentsInitialState,
		initialScope: componentsInitialScope,
		updaters: {
			dndMoveAndSelection: createUpdater({
				given: {},
				when: {
					windowMouseDown: windowMouseDown.condition,
					mousePosition: windowMousePositionCondition,
					cancel: keyboardEscDownCondition.toOptional().resetConditionsByKeyAfterReducerCall(['windowMouseDown']),
					mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['windowMouseDown']),
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
							const { componentsStartPos } = scope.movingDnd

							return R
								.mapState(componentsUpdateBBox({ bboxUpdate: { ...componentsStartPos } }))
								.mapState(componentsSetIsMovingFalse)
								.mapScope(componentsResetMoveDnd)
						}
						return R.doNothing
					}

					if (mouseUp) {
						return R
							.mapState(componentsSetIsMovingFalse)
							.mapState(componentsSetSelected(T))
							.mapScope(componentsResetMoveDnd)
					}

					if (scope.movingDnd.type === dndTypeIdle) {
						return R.mapScope(componentsInitMoveDnd({ componentsStartPos: position, mouseStartPosition: mousePosition }))
					}

					const { componentsStartPos, mouseStartPosition } = scope.movingDnd
					const diffLeft = mouseStartPosition.left - mousePosition.left
					const diffTop = mouseStartPosition.top - mousePosition.top

					return R
						.mapState(componentsSetIsMovingTrue)
						.mapState(componentsUpdateBBox({
							bboxUpdate: { left: componentsStartPos.left - diffLeft, top: componentsStartPos.top - diffTop },
						}))
				},
			}),
			dndResize: createUpdater({
				given: {
					resizeDecorationsNMouseDown: resizeDecorationsNMouseDown.condition,
				},
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
							const { componentsStartPosition, componentsStartDimensions } = scope.resizeDnd

							return R
								.mapState(componentsUpdateBBox({ bboxUpdate: { ...componentsStartPosition, ...componentsStartDimensions } }))
								.mapState(setComponentsIsResizingFalse)
								.mapScope(componentsResetResizeDnd)
						}
						return R.doNothing
					}

					if (mouseUp) {
						return R
							.mapState(setComponentsIsResizingFalse)
							.mapScope(componentsResetResizeDnd)
					}

					if (scope.resizeDnd.type === dndTypeIdle) {
						return R.mapScope(componentsInitResizeDnd({ componentsStartDimensions: state.dimensions, componentsStartPosition: state.position, mouseStartPosition: mousePosition }))
					}

					const { componentsStartPosition, componentsStartDimensions, mouseStartPosition } = scope.resizeDnd
					const diffTop = mouseStartPosition.top - mousePosition.top

					return R
						.mapState(componentsUpdateBBox({ bboxUpdate: { top: componentsStartPosition.top - diffTop, height: componentsStartDimensions.height + diffTop } }))
						.mapState(setComponentsIsResizingTrue)
				},
			}),
			deselection: createUpdater({
				given: {},
				when: {
					windowMouseDown: windowMouseDown.condition.toOptional(),
					escPressed: keyboardEscDownCondition.toOptional(),
				},
				then: ({ R }) => R.mapState(componentsSetSelected(F)),
			}),
		},
	})

export {
	componentsEpic,
}
