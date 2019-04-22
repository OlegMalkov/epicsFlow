// @flow strict

opaque type ChannelValue = number
opaque type RgbType: {| r: * , g: *, b: *|} = {| r: ChannelValue, g: ChannelValue, b: ChannelValue |}

const rgbBlack: RgbType = { r: 0, g: 0, b: 0 }
const createChannelValue = (input: number): ChannelValue | null => {
	if (input >= 0 && input <= 255) {
		const validatedInput: ChannelValue = input

		return validatedInput
	}

	return null
}
const createRgb = ({ r, g, b }: {| r: ChannelValue, g: ChannelValue, b: ChannelValue |}): RgbType => ({ r, g, b })
const channelToHex = (channelValue: ChannelValue) => channelValue.toString(16).padStart(2,'0')
const rgbToHex = ({ r, g, b }: RgbType) => `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`


// eslint-disable-next-line import/group-exports
export type {
	ChannelValue,
	RgbType,
}

// eslint-disable-next-line import/group-exports
export {
	createChannelValue,
	rgbBlack,
	createRgb,
	rgbToHex,
	channelToHex,
}
