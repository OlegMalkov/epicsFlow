// @flow strict

import { componentsInitialState, componentsSetSelectedComponentsIds, componentsSetIsMovingFalse, componentsSetIsMovingTrue, componentsSetIsResizingFalse, componentsSetIsResizingTrue, componentSetByIdMap } from './componentsState'
import { componentsVat } from './componentsACnC'
import { windowMousePositionCondition, windowMouseUp, keyboardEscDownCondition, windowMouseDown } from '../../globalACAC'
import { componentsInitialScope, componentsInitDnd, componentsResetDnd } from './componentsScope'
import { dndTypeIdle, dndTypeProgress } from '../shared/dnd'
import { T, F } from '../../../../../src/utils'
import { createEpicWithScope, createUpdater } from '../../../../../src/epics'
import { resizeDecorationsNMouseDown } from '../resizeDecorations/resizeDecorationsACnC'

const componentsEpic = createEpicWithScope<typeof componentsInitialState, typeof componentsInitialScope, empty, empty>({
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
				state: { byId: componentsById },
				scope,
				values: { mousePosition },
				changedActiveConditionsKeysMap: { cancel, mouseUp },
				R,
			}) => {
				if (cancel) {
					if (scope.dnd.type === dndTypeProgress) {
						const { initialComponentsById } = scope.dnd

						return R
							.mapState(componentSetByIdMap(initialComponentsById))
							.mapState(componentsSetIsMovingFalse)
							.mapScope(componentsResetDnd)
					}
					return R.doNothing
				}

				if (mouseUp) {
					return R
						.mapState(componentsSetIsMovingFalse)
						.mapState(componentsSetSelectedComponentsIds([])) // TODO it depends on what operations is going on
						.mapScope(componentsResetDnd)
				}

				if (scope.dnd.type === dndTypeIdle) {
					return R.mapScope(componentsInitDnd({ kind: 'move', initialComponentsById: componentsById, mouseStartPosition: mousePosition }))
				}

				const { initialComponentsById, mouseStartPosition } = scope.dnd
				const diffLeft = mouseStartPosition.left - mousePosition.left
				const diffTop = mouseStartPosition.top - mousePosition.top

				return R
					.mapState(componentsSetIsMovingTrue)
				// TODO move
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
				state: { byId: componentsById },
				scope,
				values: { mousePosition },
				changedActiveConditionsKeysMap: { cancel, mouseUp },
				R,
			}) => {

				if (cancel) {
					if (scope.dnd.type === dndTypeProgress) {
						const { initialComponentsById } = scope.dnd

						return R
							.mapState(componentSetByIdMap(initialComponentsById))
							.mapState(componentsSetIsResizingFalse)
							.mapScope(componentsResetDnd)
					}
					return R.doNothing
				}

				if (mouseUp) {
					return R
						.mapState(componentsSetIsResizingFalse)
						.mapScope(componentsResetDnd)
				}

				if (scope.dnd.type === dndTypeIdle) {
					return R.mapScope(componentsInitDnd({ kind: 'resizeN', initialComponentsById: componentsById, mouseStartPosition: mousePosition }))
				}

				const { initialComponentsById, mouseStartPosition } = scope.dnd
				const diffTop = mouseStartPosition.top - mousePosition.top

				// TODO resize
				return R.mapState(componentsSetIsResizingTrue)
			},
		}),
		deselection: createUpdater({
			given: {},
			when: {
				windowMouseDown: windowMouseDown.condition.toOptional(),
				escPressed: keyboardEscDownCondition.toOptional(),
			},
			then: ({ R }) => R.mapState(componentsSetSelectedComponentsIds([])),
		}),
	},
})

export {
	componentsEpic,
}
