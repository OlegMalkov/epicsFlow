// @flow strict
import {
	componentInitialState,
	componentSetIsMovingTrue,
	componentUpdateBBox,
	componentSetIsMovingFalse,
	componentSetSelected,
} from '../../../../websitebuilder/src/components/component/componentState'
import {
	componentInitialScope,
	componentInitMoveDnd,
	componentResetMoveDnd,
} from '../../../../websitebuilder/src/components/component/componentScope'
import { type AnyActionType } from '../../../../../src/epics'
import { type LTPositionType } from '../../../../websitebuilder/src/types'
import { matchCondition } from '../../utils'
import { dndTypeProgress } from '../../../../websitebuilder/src/components/shared/dnd'
import { windowMouseUp, windowMouseMove, windowMouseDown } from '../../../../websitebuilder/src/globalACAC'
import { T, F } from '../../../../../src/utils'

opaque type ReduxComponentStateType: {| state: *, scope: * |} = {|
    state: typeof componentInitialState,
    scope: typeof componentInitialScope,
|}

const componentIntialState: ReduxComponentStateType = {
	state: componentInitialState,
	scope: componentInitialScope,
}

const matchWindowMouseDown = matchCondition(windowMouseDown.condition)
const matchWindowMouseMove = matchCondition(windowMouseMove.condition)
const matchWindowMouseUp = matchCondition(windowMouseUp.condition)

type DepsType = {| mousePosition: LTPositionType|}

const componentReducer = (
	componentState: ReduxComponentStateType = componentIntialState,
	action: AnyActionType,
	{ mousePosition }: DepsType
): ReduxComponentStateType => {
	if (matchWindowMouseDown(action)) {
		const componentIsUnderMouse = true // TODO fix this statement

		if (componentIsUnderMouse) {
			return {
				state: componentState.state,
				scope: componentInitMoveDnd({
					componentStartPos: componentState.state.position,
					mouseStartPosition: mousePosition,
				})(componentState.scope),
			}
		} else {
			const { state, scope } = componentState

			if (state.selected) {
				return {
					state: componentSetSelected(F)(state),
					scope,
				}
			}
			return componentState
		}
	}

	const windowMouseMoveAction = matchWindowMouseMove(action)

	if (windowMouseMoveAction) {
		const { movingDnd } = componentState.scope

		if (movingDnd.type === dndTypeProgress) {
			const { componentStartPos, mouseStartPosition } = movingDnd

			let nextState = componentSetIsMovingTrue(componentState.state)

			const diffLeft = mouseStartPosition.left - mousePosition.left
			const diffTop = mouseStartPosition.top - mousePosition.top

			nextState = componentUpdateBBox({
				bboxUpdate: { left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop },
			})(nextState)

			return {
				state: nextState,
				scope: componentState.scope,
			}
		}
		return componentState
	}

	if (matchWindowMouseUp(action)) {
		let { state, scope } = componentState

		if (scope.movingDnd.type === dndTypeProgress) {
			state = componentSetIsMovingFalse(state)
			state = componentSetSelected(T)(state)
			scope = componentResetMoveDnd(scope)
			return { state, scope }
		}
		return componentState
	}

	return componentState
}

// eslint-disable-next-line import/group-exports
export type {
	ReduxComponentStateType,
}

// eslint-disable-next-line import/group-exports
export {
	componentReducer,
}
