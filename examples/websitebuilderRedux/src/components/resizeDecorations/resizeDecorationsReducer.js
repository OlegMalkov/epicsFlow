// @flow strict
import { type AnyMsgType } from '../../../../../src/epics'
import {
	resizeDecorationsInitialState,
	type ResizeDecorationsStateType,
} from '../../../../websitebuilder/src/components/resizeDecorations/resizeDecorationsState'

type ReduxResizeDecorationsStateType = ResizeDecorationsStateType

const resizeDecorationsReducer = (
	state: ReduxResizeDecorationsStateType = resizeDecorationsInitialState,
	event: AnyMsgType
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
