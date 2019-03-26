// @flow strict
import { type AnyActionType } from '../../epics'
import { componentInitialScope, type ComponentScopeType } from '../../../../websitebuilder/src/components/component/componentScope'
import {
	componentInitialState, type ComponentStateType,
} from '../../../../websitebuilder/src/components/component/componentState'

type ReduxComponentStateType = {|
    state: ComponentStateType,
    scope: ComponentScopeType,
|}

const componentIntialState: ReduxComponentStateType = {
	state: componentInitialState,
	scope: componentInitialScope,
}

const componentReducer = (state: ReduxComponentStateType = componentIntialState, action: AnyActionType): ReduxComponentStateType => {
	return state
}

// eslint-disable-next-line import/group-exports
export type {
	ReduxComponentStateType,
}

// eslint-disable-next-line import/group-exports
export {
	componentReducer,
}
