// @flow strict
import { type AnyActionType } from '../../../../../src/epics'
import {
	resizeDecorationsInitialState,
} from '../../../../websitebuilder/src/modules/resizeDecorations/resizeDecorationsState'

type ReduxResizeDecorationsStateType = typeof resizeDecorationsInitialState

const resizeDecorationsReducer = (
	state: ReduxResizeDecorationsStateType = resizeDecorationsInitialState,
	action: AnyActionType
): ReduxResizeDecorationsStateType => {
	return state
}

// eslint-disable-next-line import/group-exports
export type {
	ReduxResizeDecorationsStateType,
}

// eslint-disable-next-line import/group-exports
export {
	resizeDecorationsReducer,
}
