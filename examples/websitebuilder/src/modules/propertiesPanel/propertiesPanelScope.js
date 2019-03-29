// @flow
import { dndTypeProgress, dndInitialState } from '../shared/dnd'
import { type RTPositionType, type LTPositionType } from '../../types'
import { setPropDeepCompare } from '../../../../../src/utils'

opaque type PropertiesPanelScopeType: {| moveDnd: * |} = {|
    moveDnd: typeof dndInitialState | {| mouseStartPosition: LTPositionType, propertiesPanelStartPosition: RTPositionType, type: typeof dndTypeProgress |},
|}

type PropertiesPanelInitMoveDndPropsType = {| propertiesPanelStartPosition: RTPositionType, mouseStartPosition: LTPositionType |}

const propertiesPanelInitialScope: PropertiesPanelScopeType = { moveDnd: dndInitialState }

const propertiesPanelSetMoveDnd = setPropDeepCompare<PropertiesPanelScopeType, *>('moveDnd')
const propertiesPanelInitMoveDnd = ({ propertiesPanelStartPosition, mouseStartPosition }: PropertiesPanelInitMoveDndPropsType) =>
	propertiesPanelSetMoveDnd({ type: dndTypeProgress, propertiesPanelStartPosition, mouseStartPosition })
const propertiesPanelResetMoveDnd = propertiesPanelSetMoveDnd(dndInitialState)

export {
	propertiesPanelInitialScope,
	propertiesPanelSetMoveDnd,
	propertiesPanelInitMoveDnd,
	propertiesPanelResetMoveDnd,
}
