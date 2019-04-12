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
import { type AnyMsgType } from '../../../../../src/epics'
import {
	componentMouseDownEvent,
} from '../../../../websitebuilder/src/components/component/componentEvents'
import { type LTPositionType } from '../../../../websitebuilder/src/types'
import { dndTypeProgress } from '../../../../websitebuilder/src/components/shared/dnd'
import { windowMouseUpEvent, windowMouseMoveEvent } from '../../../../websitebuilder/src/globalEvents'
import { T, F } from '../../../../../src/utils'
import {
	templateAreaMouseDownEvent,
} from '../../../../websitebuilder/src/components/template/templateEvents'

opaque type ReduxComponentStateType: {| state: *, scope: * |} = {|
    state: ComponentStateType,
    scope: ComponentScopeType,
|}

const componentIntialState: ReduxComponentStateType = {
	state: componentInitialState,
	scope: componentInitialScope,
}

type DepsType = {| mousePosition: LTPositionType, templateWidth: number |}

const componentReducer = (
	componentState: ReduxComponentStateType = componentIntialState,
	event: AnyMsgType,
	{ mousePosition, templateWidth }: DepsType
): ReduxComponentStateType => {
	if (componentMouseDownEvent.match(event)) {
		// TODO when there are multiple components, it also should perform deselection
		return {
			state: componentState.state,
			scope: componentInitMoveDnd({
				componentStartPos: componentState.state.position,
				mouseStartPosition: mousePosition,
			})(componentState.scope),
		}
	}

	const windowMouseMove = windowMouseMoveEvent.match(event)

	if (windowMouseMove) {
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

	if (windowMouseUpEvent.match(event)) {
		let { state, scope } = componentState

		if (scope.movingDnd.type === dndTypeProgress) {
			state = componentSetIsMovingFalse(state)
			state = componentSetSelected(T)(state)
			scope = componentResetMoveDnd(scope)
			return { state, scope }
		}
		return componentState
	}

	if (templateAreaMouseDownEvent.match(event)) {
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
