// @flow
import { type IDispatchTarget } from './IStore'
import { windowMouseMove, windowMouseUp, windowMouseDown } from '../../globalACAC'
import { type LTPositionType } from '../../types'

const dlClick = ({ dispatch }: IDispatchTarget, position: LTPositionType) => {
	dispatch(windowMouseMove.actionCreator({ position }))
	dispatch(windowMouseDown.actionCreator())
	dispatch(windowMouseUp.actionCreator())
}

export {
	dlClick,
}
