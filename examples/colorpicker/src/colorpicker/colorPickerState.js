// @flow

import { type RgbType } from '../types'
import { setPath2, setProp } from '../../../../src/utils'

opaque type ColorPickerStateType: { rgbValue: * } = {|
    rgbValue: RgbType,
|}

const colorpickerInitialState: ColorPickerStateType = {
	rgbValue: { r: 0, g: 0, b: 0 },
}

const setRgbValue = setProp<ColorPickerStateType, *>('rgbValue')
const makeSetRgbValue = k => setPath2<ColorPickerStateType, *, *>('rgbValue', k)
const setRedChannel = makeSetRgbValue('r')
const setGreenChannel = makeSetRgbValue('g')
const setBlueChannel = makeSetRgbValue('b')


const makeTakeChannelValue = i => s => parseInt(s.substr(i,2),16)
const takeRChannelValue = makeTakeChannelValue(0)
const takeGChannelValue = makeTakeChannelValue(2)
const takeBChannelValue = makeTakeChannelValue(3)

const setAllChannelsFromRGB = (rgb: number) => {
	const rgbstr = rgb.toString(16).padStart(6, '0')

	const rgbVal = {
		r: takeRChannelValue(rgbstr),
		g: takeGChannelValue(rgbstr),
		b: takeBChannelValue(rgbstr),
	}

	return setRgbValue(rgbVal)
}

// eslint-disable-next-line import/group-exports
export type {
	ColorPickerStateType,
}

// eslint-disable-next-line import/group-exports
export {
	colorpickerInitialState,
	setRedChannel,
	setGreenChannel,
	setBlueChannel,
	setAllChannelsFromRGB,
}
