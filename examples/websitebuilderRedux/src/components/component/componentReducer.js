// @flow strict
import {
	componentInitialScope,
	type ComponentScopeType,
	componentInitMoveDnd,
} from '../../../../websitebuilder/src/components/component/componentScope'
import {
	componentInitialState, type ComponentStateType,
} from '../../../../websitebuilder/src/components/component/componentState'
import { type AnyActionType } from '../../../../../src/epics'
import {
	componentMouseDown,
} from '../../../../websitebuilder/src/components/component/componentACnC'
import { type LTPositionType } from '../../../../websitebuilder/src/types'
import { matchCondition } from '../../utils'
import { windowMousePositionCondition } from '../../../../websitebuilder/src/globalACAC'
import { dndTypeProgress } from '../../../../websitebuilder/src/components/shared/dnd'

opaque type ReduxComponentStateType: {| state: *, scope: * |} = {|
    state: ComponentStateType,
    scope: ComponentScopeType,
|}

const componentIntialState: ReduxComponentStateType = {
	state: componentInitialState,
	scope: componentInitialScope,
}

const matchComponentMouseDown = matchCondition<ReduxComponentStateType, *>(componentMouseDown.condition)
const matchMousePositionChanged = matchCondition<ReduxComponentStateType, *>(windowMousePositionCondition)

type DepsType = {| mousePosition: LTPositionType |}

const componentReducer = (
	componentState: ReduxComponentStateType = componentIntialState,
	action: AnyActionType,
	{ mousePosition }: DepsType
): ReduxComponentStateType => {
	const initMoveDndOnComponentMouseDownUpdater = matchComponentMouseDown(() => componentState => {
		return {
			state: componentState.state,
			scope: componentInitMoveDnd({
				componentStartPos: componentState.state.position,
				mouseStartPosition: mousePosition,
			})(componentState.scope),
		}
	})(action)
	const mousePositionChangedUpdater = matchMousePositionChanged(mousePosition => componentState => {
		if (componentState.scope.movingDnd.type === dndTypeProgress) {
			
		}

		return componentState
	})(action)

	return initMoveDndOnComponentMouseDownUpdater(componentState)
}

// eslint-disable-next-line import/group-exports
export type {
	ReduxComponentStateType,
}

// eslint-disable-next-line import/group-exports
export {
	componentReducer,
}
