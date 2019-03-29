// @flow strict

import { type ComponentsStatesByIdType } from './componentsState'
import { type LTPositionType } from '../../types'
import { dndTypeProgress, dndInitialState } from '../shared/dnd'
import { setProp } from '../../../../../src/utils'

type DndMoveKindType = 'resizeN' | 'move'
type DndType =
	| typeof dndInitialState
	| {| kind: DndMoveKindType, initialComponentsById: ComponentsStatesByIdType, mouseStartPosition: LTPositionType, type: typeof dndTypeProgress |}

opaque type ComponentsScopeType: {| dnd: * |} = {|
    dnd: DndType,
|}

const setDnd = setProp<ComponentsScopeType, *>('dnd')
const componentsInitialScope: ComponentsScopeType = {
	dnd: dndInitialState,
}
const componentsResetDnd = (s: ComponentsScopeType): ComponentsScopeType => setDnd(dndInitialState)(s)
const componentsInitDnd = ({ kind, initialComponentsById, mouseStartPosition }: {| kind: DndMoveKindType, initialComponentsById: ComponentsStatesByIdType, mouseStartPosition: LTPositionType |}) =>
	(s: ComponentsScopeType): ComponentsScopeType => setDnd({ kind, type: dndTypeProgress, initialComponentsById, mouseStartPosition })(s)

export {
	componentsInitialScope,
	componentsResetDnd,
	componentsInitDnd,
}
