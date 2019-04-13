// @flow strict
import { colorpickerInitialState, type ColorPickerStateType, setRedChannel, setGreenChannel, setBlueChannel, setAllChannelsFromRGB } from '../colorPickerState'
import {
	redChannelChangedEvent,
	blueChannelChangedEvent,
	greenChannelChangedEvent,
	rgbValueChangedEvent,
} from '../colorpickerEvents'
import { type AnyMsgType } from '../../../../../src/epics'

const colorPickerReducer = (state: ColorPickerStateType = colorpickerInitialState, msg: AnyMsgType): ColorPickerStateType => {
	const red = redChannelChangedEvent.match(msg)

	if (red) {
		return setRedChannel(red.value)(state)
	}
	const green = greenChannelChangedEvent.match(msg)

	if (green) {
		return setGreenChannel(green.value)(state)
	}

	const blue = blueChannelChangedEvent.match(msg)

	if (blue) {
		return setBlueChannel(blue.value)(state)
	}

	const rgb = rgbValueChangedEvent.match(msg)

	if (rgb) {
		return setAllChannelsFromRGB(rgb.value)(state)
	}

	return state
}

export {
	colorPickerReducer,
}
