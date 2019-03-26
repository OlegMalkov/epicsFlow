// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { type DndIdleType, dndTypeProgress, dndInitialState } from '../shared/dnd'
import { setProp } from '../../../../../src/utils'

opaque type ComponentScopeType: { movingDnd: *, resizeDnd: * } = {|
    movingDnd: DndIdleType | {| componentStartPos: LTPositionType, mouseStartPosition: LTPositionType, type: typeof dndTypeProgress |},
    resizeDnd: DndIdleType | {| componentStartDimensions: DimensionsType, componentStartPosition: LTPositionType, mouseStartPosition: LTPositionType, type: typeof dndTypeProgress |},
|}

const setMoveDnd = setProp<ComponentScopeType, *>('movingDnd')
const setResizeDnd = setProp<ComponentScopeType, *>('resizeDnd')
const componentInitialScope: ComponentScopeType = {
	movingDnd: dndInitialState,
	resizeDnd: dndInitialState,
}
const resetComponentMoveDnd = (s: ComponentScopeType): ComponentScopeType => setMoveDnd(dndInitialState)(s)
const resetComponentResizeDnd = (s: ComponentScopeType): ComponentScopeType => setResizeDnd(dndInitialState)(s)
const initComponentMoveDnd = ({ componentStartPos, mouseStartPosition }: {| componentStartPos: LTPositionType, mouseStartPosition: LTPositionType |}) =>
	(s: ComponentScopeType): ComponentScopeType => setMoveDnd({ type: dndTypeProgress, componentStartPos, mouseStartPosition })(s)
const initComponentResizeDnd = ({ componentStartDimensions, componentStartPosition, mouseStartPosition }: {| componentStartDimensions: DimensionsType, componentStartPosition: LTPositionType, mouseStartPosition: LTPositionType |}) =>
	(s: ComponentScopeType): ComponentScopeType => setResizeDnd({ type: dndTypeProgress, componentStartDimensions, componentStartPosition, mouseStartPosition })(s)

export { // eslint-disable-line import/group-exports
	componentInitialScope,
	resetComponentMoveDnd,
	resetComponentResizeDnd,
	initComponentMoveDnd,
	initComponentResizeDnd,
}

export type { // eslint-disable-line import/group-exports
	ComponentScopeType,
}
