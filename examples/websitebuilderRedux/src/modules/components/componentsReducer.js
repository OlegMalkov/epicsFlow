// @flow strict
import {
	componentsInitialState,
	componentsSetIsMovingTrue,
	componentsUpdateBBox,
	componentsSetIsMovingFalse,
	componentsSetSelected,
} from '../../../../websitebuilder/src/modules/components/componentsState'
import {
	componentsInitialScope,
	componentsInitMoveDnd,
	componentsResetMoveDnd,
} from '../../../../websitebuilder/src/modules/components/componentsScope'
import { type AnyActionType } from '../../../../../src/epics'
import { type LTPositionType } from '../../../../websitebuilder/src/types'
import { matchCondition } from '../../utils'
import { dndTypeProgress } from '../../../../websitebuilder/src/modules/shared/dnd'
import { windowMouseUp, windowMouseMove, windowMouseDown } from '../../../../websitebuilder/src/globalACAC'
import { T, F } from '../../../../../src/utils'

opaque type ReduxComponentsStateType: {| state: *, scope: * |} = {|
    state: typeof componentsInitialState,
    scope: typeof componentsInitialScope,
|}

const componentsIntialState: ReduxComponentsStateType = {
	state: componentsInitialState,
	scope: componentsInitialScope,
}

const matchWindowMouseDown = matchCondition(windowMouseDown.condition)
const matchWindowMouseMove = matchCondition(windowMouseMove.condition)
const matchWindowMouseUp = matchCondition(windowMouseUp.condition)

type DepsType = {| mousePosition: LTPositionType|}

const componentsReducer = (
	componentsState: ReduxComponentsStateType = componentsIntialState,
	action: AnyActionType,
	{ mousePosition }: DepsType
): ReduxComponentsStateType => {
	if (matchWindowMouseDown(action)) {
		const componentsIsUnderMouse = true // TODO fix this statement

		if (componentsIsUnderMouse) {
			return {
				state: componentsState.state,
				scope: componentsInitMoveDnd({
					componentsStartPos: componentsState.state.position,
					mouseStartPosition: mousePosition,
				})(componentsState.scope),
			}
		} else {
			const { state, scope } = componentsState

			if (state.selected) {
				return {
					state: componentsSetSelected(F)(state),
					scope,
				}
			}
			return componentsState
		}
	}

	const windowMouseMoveAction = matchWindowMouseMove(action)

	if (windowMouseMoveAction) {
		const { movingDnd } = componentsState.scope

		if (movingDnd.type === dndTypeProgress) {
			const { componentsStartPos, mouseStartPosition } = movingDnd

			let nextState = componentsSetIsMovingTrue(componentsState.state)

			const diffLeft = mouseStartPosition.left - mousePosition.left
			const diffTop = mouseStartPosition.top - mousePosition.top

			nextState = componentsUpdateBBox({
				bboxUpdate: { left: componentsStartPos.left - diffLeft, top: componentsStartPos.top - diffTop },
			})(nextState)

			return {
				state: nextState,
				scope: componentsState.scope,
			}
		}
		return componentsState
	}

	if (matchWindowMouseUp(action)) {
		let { state, scope } = componentsState

		if (scope.movingDnd.type === dndTypeProgress) {
			state = componentsSetIsMovingFalse(state)
			state = componentsSetSelected(T)(state)
			scope = componentsResetMoveDnd(scope)
			return { state, scope }
		}
		return componentsState
	}

	return componentsState
}

// eslint-disable-next-line import/group-exports
export type {
	ReduxComponentsStateType,
}

// eslint-disable-next-line import/group-exports
export {
	componentsReducer,
}
