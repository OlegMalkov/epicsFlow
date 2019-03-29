// @flow strict
import { type DispatchType } from '../../../src/epics'
import { windowMouseMove, windowMouseUp, windowMouseDown, keyDown } from './globalACAC'
import { browserDimensions } from './components/env/envACnC'

function getBrowserDimensions() {
	// $FlowFixMe
	const	{ clientWidth, clientHeight } = document.documentElement
	const { innerWidth, innerHeight } = window

	return {
		width: Math.max(clientWidth, innerWidth || 0),
		height:  Math.max(clientHeight, innerHeight || 0),
	}
}

const initSubscripitons = (dispatch: DispatchType) => {
	window.addEventListener(
		'mousemove',
		(e: MouseEvent) => dispatch(
			windowMouseMove.actionCreator({ position: { left: e.clientX, top: e.clientY } })
		)
	)
	window.addEventListener('mouseup', () => dispatch(windowMouseUp.actionCreator()))
	window.addEventListener('mouseup', () => dispatch(windowMouseDown.actionCreator()))
	window.addEventListener('keydown', (e: KeyboardEvent) => dispatch(keyDown.actionCreator({ keyCode: e.keyCode })))

	dispatch(browserDimensions.actionCreator(getBrowserDimensions()))
	window.addEventListener('resize', () => dispatch(browserDimensions.actionCreator(getBrowserDimensions())))
}

export {
	initSubscripitons,
}
