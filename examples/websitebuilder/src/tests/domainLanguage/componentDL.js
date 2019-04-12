// @flow
import { type IDispatchTarget } from './IStore'
import { windowMouseMoveEvent, windowMouseUpEvent } from '../../globalEvents'
import { componentMouseDownEvent } from '../../components/component/componentEvents'

const dlSelectComponentByClick = ({ dispatch }: IDispatchTarget) => {
	dispatch(windowMouseMoveEvent.create({ position: { left: 100, top: 100 }}))
	dispatch(componentMouseDownEvent.create())
	dispatch(windowMouseUpEvent.create())
}

export {
	dlSelectComponentByClick,
}
