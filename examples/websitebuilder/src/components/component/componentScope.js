// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { type DndIdleType, dndTypeProgress, dndInitialState } from '../shared/dnd'
import { setProp } from '../../../../../src/utils'

opaque type ComponentScope: { movingDnd: *, resizeDnd: * } = {|
    movingDnd: DndIdleType | {| componentStartPos: LTPositionType, mouseStartPosition: LTPositionType, type: typeof dndTypeProgress |},
    resizeDnd: DndIdleType | {| componentStartDimensions: DimensionsType, componentStartPosition: LTPositionType, mouseStartPosition: LTPositionType, type: typeof dndTypeProgress |},
|}

const setMoveDnd = setProp<ComponentScope, *>('movingDnd')
const setResizeDnd = setProp<ComponentScope, *>('resizeDnd')
const componentInitialScope: ComponentScope = {
	movingDnd: dndInitialState,
	resizeDnd: dndInitialState,
}
const resetComponentMoveDnd = (s: ComponentScope): ComponentScope => setMoveDnd(dndInitialState)(s)
const resetComponentResizeDnd = (s: ComponentScope): ComponentScope => setResizeDnd(dndInitialState)(s)
const initComponentMoveDnd = ({ componentStartPos, mouseStartPosition }: {| componentStartPos: LTPositionType, mouseStartPosition: LTPositionType |}) =>
	(s: ComponentScope): ComponentScope => setMoveDnd({ type: dndTypeProgress, componentStartPos, mouseStartPosition })(s)
const initComponentResizeDnd = ({ componentStartDimensions, componentStartPosition, mouseStartPosition }: {| componentStartDimensions: DimensionsType, componentStartPosition: LTPositionType, mouseStartPosition: LTPositionType |}) =>
	(s: ComponentScope): ComponentScope => setResizeDnd({ type: dndTypeProgress, componentStartDimensions, componentStartPosition, mouseStartPosition })(s)

export { // eslint-disable-line import/group-exports
	componentInitialScope,
	resetComponentMoveDnd,
	resetComponentResizeDnd,
	initComponentMoveDnd,
	initComponentResizeDnd,
}

export type { // eslint-disable-line import/group-exports
	ComponentScope,
}
