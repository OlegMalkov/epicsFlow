// @flow
import { type IDispatchTarget } from './IStore'
import { windowMouseMove } from '../../globalACAC'
import { componentMouseDown } from '../../components/component/componentACnC'
import { windowMouseUp } from '../../../../websitebuilderRedux/src/globalACAC'

const dlSelectComponentByClick = ({ dispatch }: IDispatchTarget) => {
	dispatch(windowMouseMove.ac({ position: { left: 100, top: 100 }}))
	dispatch(componentMouseDown.ac())
	dispatch(windowMouseUp.ac())
}

export {
	dlSelectComponentByClick,
}
