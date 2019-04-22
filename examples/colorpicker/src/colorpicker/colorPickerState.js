// @flow

import { setPath2, setProp, I } from '../../../../src/utils'
import { createChannelValue, rgbBlack, type RgbType, createRgb } from './rgbType'

opaque type ColorPickerStateType: { rgbValue: *, rgbValuePickerValue: * } = {|
	rgbValue: RgbType,
	rgbValuePickerValue: number,
|}

const colorpickerInitialState: ColorPickerStateType = {
	rgbValue: rgbBlack,
	rgbValuePickerValue: 0,
}

const setRgbValue = setProp<ColorPickerStateType, *>('rgbValue')
const setRgbValuePickerValue = setProp<ColorPickerStateType, *>('rgbValuePickerValue')
const makeTrySetRgbValue = k => {
	return (input: number) => {
		const channelValue = createChannelValue(input)

		if (channelValue === null) return I
		return setPath2<ColorPickerStateType, *, *>('rgbValue', k)(channelValue)
	}
}
const trySetRedChannel = makeTrySetRgbValue('r')
const trySetGreenChannel = makeTrySetRgbValue('g')
const trySetBlueChannel = makeTrySetRgbValue('b')

const makeTakeChannelValue = i => s => createChannelValue(parseInt(s.substr(i,2),16))
const takeRChannelValue = makeTakeChannelValue(0)
const takeGChannelValue = makeTakeChannelValue(2)
const takeBChannelValue = makeTakeChannelValue(3)

const trySetAllChannelsFromRGB = (rgb: number) => {
	const rgbstr = rgb.toString(16).padStart(6, '0')

	const r = takeRChannelValue(rgbstr)
	const g = takeGChannelValue(rgbstr)
	const b = takeBChannelValue(rgbstr)

	if (r === null || g === null || b === null) {
		return I
	}

	return setRgbValue(createRgb({ r, g, b }))
}

// eslint-disable-next-line import/group-exports
export type {
	ColorPickerStateType,
}

// eslint-disable-next-line import/group-exports
export {
	colorpickerInitialState,
	trySetRedChannel,
	trySetGreenChannel,
	trySetBlueChannel,
	trySetAllChannelsFromRGB,
	setRgbValuePickerValue,
}
