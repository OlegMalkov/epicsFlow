// @flow strict
import { type LTPositionType } from '../../websitebuilder/src/types'
import { setProp } from '../../../src/utils'
import { matchCondition } from './utils'
import { windowMousePositionCondition } from '../../websitebuilder/src/globalACAC'
import { type AnyActionType } from '../../../src/epics'

opaque type ScopeType: {| mousePosition: * |} = {|
	mousePosition: LTPositionType,
|}

const initialScope: ScopeType = {
	mousePosition: { left: 0, top: 0 },
}

const setMousePosition = setProp<ScopeType, *>('mousePosition')
const matchMousePosition = matchCondition(windowMousePositionCondition)
const updateMousePositionOnMatch = matchMousePosition((position) => setMousePosition(position))

const scopeReducer = (state: ScopeType = initialScope, action: AnyActionType): ScopeType => {
	return updateMousePositionOnMatch(action)(state)
}


// eslint-disable-next-line import/group-exports
export type {
	ScopeType,
}

// eslint-disable-next-line import/group-exports
export {
	scopeReducer,
}
