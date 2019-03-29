// @flow strict
import { type AnyActionType } from '../../../../../src/epics'
import {
	resizeDecorationsInitialState,
} from '../../../../websitebuilder/src/components/resizeDecorations/resizeDecorationsState'

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
