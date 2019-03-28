// @flow strict
import { type AnyActionType } from '../../../../../src/epics'
import {
	resizeDecorationsInitialState,
	type ResizeDecorationsStateType,
} from '../../../../websitebuilder/src/components/resizeDecorations/resizeDecorationsState'

type ReduxResizeDecorationsStateType = ResizeDecorationsStateType

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
