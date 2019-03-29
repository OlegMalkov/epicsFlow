// @flow strict

import { type LTPositionType, type DimensionsType } from '../../types'
import { dndTypeProgress, dndInitialState } from '../shared/dnd'
import { setProp } from '../../../../../src/utils'

opaque type ComponentsScopeType: {| movingDnd: *, resizeDnd: * |} = {|
    movingDnd: typeof dndInitialState | {| componentsStartPos: LTPositionType, mouseStartPosition: LTPositionType, type: typeof dndTypeProgress |},
    resizeDnd: typeof dndInitialState | {| componentsStartDimensions: DimensionsType, componentsStartPosition: LTPositionType, mouseStartPosition: LTPositionType, type: typeof dndTypeProgress |},
|}

const setMoveDnd = setProp<ComponentsScopeType, *>('movingDnd')
const setResizeDnd = setProp<ComponentsScopeType, *>('resizeDnd')
const componentsInitialScope: ComponentsScopeType = {
	movingDnd: dndInitialState,
	resizeDnd: dndInitialState,
}
const componentsResetMoveDnd = (s: ComponentsScopeType): ComponentsScopeType => setMoveDnd(dndInitialState)(s)
const componentsResetResizeDnd = (s: ComponentsScopeType): ComponentsScopeType => setResizeDnd(dndInitialState)(s)
const componentsInitMoveDnd = ({ componentsStartPos, mouseStartPosition }: {| componentsStartPos: LTPositionType, mouseStartPosition: LTPositionType |}) =>
	(s: ComponentsScopeType): ComponentsScopeType => setMoveDnd({ type: dndTypeProgress, componentsStartPos, mouseStartPosition })(s)
const componentsInitResizeDnd = ({ componentsStartDimensions, componentsStartPosition, mouseStartPosition }: {| componentsStartDimensions: DimensionsType, componentsStartPosition: LTPositionType, mouseStartPosition: LTPositionType |}) =>
	(s: ComponentsScopeType): ComponentsScopeType => setResizeDnd({ type: dndTypeProgress, componentsStartDimensions, componentsStartPosition, mouseStartPosition })(s)

export {
	componentsInitialScope,
	componentsResetMoveDnd,
	componentsResetResizeDnd,
	componentsInitMoveDnd,
	componentsInitResizeDnd,
}
