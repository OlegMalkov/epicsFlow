// @flow
import { type DndIdleType, dndTypeProgress, dndInitialState } from '../shared/dnd'
import { type RTPositionType, type LTPositionType } from '../../types'
import { setPropDeepCompare } from '../../../../../src/utils'

opaque type PropertiesPanelScopeType: {| moveDnd: * |} = {|
    moveDnd: DndIdleType | {| mouseStartPosition: LTPositionType, propertiesPanelStartPosition: RTPositionType, type: typeof dndTypeProgress |},
|}

type PropertiesPanelInitMoveDndPropsType = {| propertiesPanelStartPosition: RTPositionType, mouseStartPosition: LTPositionType |}

const propertiesPanelInitialScope: PropertiesPanelScopeType = { moveDnd: dndInitialState }

const propertiesPanelSetMoveDnd = setPropDeepCompare<PropertiesPanelScopeType, *>('moveDnd')
const propertiesPanelInitMoveDnd = ({ propertiesPanelStartPosition, mouseStartPosition }: PropertiesPanelInitMoveDndPropsType) =>
	propertiesPanelSetMoveDnd({ type: dndTypeProgress, propertiesPanelStartPosition, mouseStartPosition })
const propertiesPanelResetMoveDnd = propertiesPanelSetMoveDnd(dndInitialState)

// eslint-disable-next-line import/group-exports
export type {
	PropertiesPanelScopeType,
}

// eslint-disable-next-line import/group-exports
export {
	propertiesPanelInitialScope,
	propertiesPanelSetMoveDnd,
	propertiesPanelInitMoveDnd,
	propertiesPanelResetMoveDnd,
}
