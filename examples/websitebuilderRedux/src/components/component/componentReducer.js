// @flow strict
import {
	componentInitialScope,
	type ComponentScopeType,
	componentInitMoveDnd,
	componentResetMoveDnd,
} from '../../../../websitebuilder/src/components/component/componentScope'
import {
	componentInitialState,
	type ComponentStateType,
	componentSetIsMovingTrue,
	componentUpdateBBox,
	componentSetIsMovingFalse,
	componentSetSelected,
} from '../../../../websitebuilder/src/components/component/componentState'
import { type AnyActionType } from '../../../../../src/epics'
import {
	componentMouseDown,
} from '../../../../websitebuilder/src/components/component/componentACnC'
import { type LTPositionType } from '../../../../websitebuilder/src/types'
import { matchCondition } from '../../utils'
import { dndTypeProgress } from '../../../../websitebuilder/src/components/shared/dnd'
import { windowMouseMove } from '../../globalACAC'
import { windowMouseUp } from '../../../../websitebuilder/src/globalACAC'
import { T, F } from '../../../../../src/utils'
import {
	templateAreaMouseDown,
} from '../../../../websitebuilder/src/components/template/templateACnC'

opaque type ReduxComponentStateType: {| state: *, scope: * |} = {|
    state: ComponentStateType,
    scope: ComponentScopeType,
|}

const componentIntialState: ReduxComponentStateType = {
	state: componentInitialState,
	scope: componentInitialScope,
}

const matchComponentMouseDown = matchCondition(componentMouseDown.condition)
const matchWindowMouseMove = matchCondition(windowMouseMove.condition)
const matchWindowMouseUp = matchCondition(windowMouseUp.condition)
const matchTemplateAreaMouseDown = matchCondition(templateAreaMouseDown.condition)

type DepsType = {| mousePosition: LTPositionType, templateWidth: number |}

const componentReducer = (
	componentState: ReduxComponentStateType = componentIntialState,
	action: AnyActionType,
	{ mousePosition, templateWidth }: DepsType
): ReduxComponentStateType => {
	if (matchComponentMouseDown(action)) {
		// TODO when there are multiple components, it also should perform deselection
		return {
			state: componentState.state,
			scope: componentInitMoveDnd({
				componentStartPos: componentState.state.position,
				mouseStartPosition: mousePosition,
			})(componentState.scope),
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
				templateWidth,
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

	if (matchTemplateAreaMouseDown(action)) {
		const { state, scope } = componentState

		if (state.selected) {
			return {
				state: componentSetSelected(F)(state),
				scope,
			}
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
