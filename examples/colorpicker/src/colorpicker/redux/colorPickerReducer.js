// @flow strict
import { colorpickerInitialState, type ColorPickerStateType, trySetRedChannel, trySetGreenChannel, trySetBlueChannel, trySetAllChannelsFromRGB, setRgbValuePickerValue } from '../colorPickerState'
import {
	redChannelChangedEvent,
	blueChannelChangedEvent,
	greenChannelChangedEvent,
	rgbValueChangedEvent,
} from '../colorpickerEvents'
import { type AnyMsgType } from '../../../../../src/epics'
import { SingleTypeContainer } from '../../../../../src/utils'

const colorPickerReducer = (state: ColorPickerStateType = colorpickerInitialState, msg: AnyMsgType): ColorPickerStateType => {
	const red = redChannelChangedEvent.match(msg)

	if (red) {
		return trySetRedChannel(red.value)(state)
	}
	const green = greenChannelChangedEvent.match(msg)

	if (green) {
		return trySetGreenChannel(green.value)(state)
	}

	const blue = blueChannelChangedEvent.match(msg)

	if (blue) {
		return trySetBlueChannel(blue.value)(state)
	}

	const rgb = rgbValueChangedEvent.match(msg)

	if (rgb) {
		return SingleTypeContainer(state)
			.pipe(trySetAllChannelsFromRGB(rgb.value))
			.pipe(setRgbValuePickerValue(rgb.value))
			.value()
	}

	return state
}

export {
	colorPickerReducer,
}
