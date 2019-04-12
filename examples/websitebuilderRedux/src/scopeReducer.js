// @flow strict
import { type LTPositionType } from '../../websitebuilder/src/types'
import { setProp } from '../../../src/utils'
import { windowMousePositionCondition } from '../../websitebuilder/src/globalEvents'
import { type AnyMsgType } from '../../../src/epics'

opaque type ScopeType: {| mousePosition: * |} = {|
	mousePosition: LTPositionType,
|}

const initialScope: ScopeType = {
	mousePosition: { left: 0, top: 0 },
}

const setMousePosition = setProp<ScopeType, *>('mousePosition')

const scopeReducer = (state: ScopeType = initialScope, event: AnyMsgType): ScopeType => {
	const mousePosition = windowMousePositionCondition.match(event)

	if (mousePosition) {
		return setMousePosition(mousePosition)(state)
	}

	return state
}


// eslint-disable-next-line import/group-exports
export type {
	ScopeType,
}

// eslint-disable-next-line import/group-exports
export {
	scopeReducer,
}
