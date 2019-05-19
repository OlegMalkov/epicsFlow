// @flow strict

opaque type RgbaColorType = string

const rgbaColorRed: RgbaColorType = 'rgba(255,0,0,1)'
const rgbaColorGreen: RgbaColorType = 'rgba(0,255,0,1)'
const rgbaColorBlue: RgbaColorType = 'rgba(0,0,255,1)'

const createRgbaColor = (input: string): RgbaColorType | null => {
	const [r,g,b,a] = input.replace('rgba(', '').replace(')', '').split(',').map(parseFloat)
	const colorParts = [r,g,b]

	if (
		colorParts.some(cp => isNaN(cp) || cp < 0 || cp > 255)
        || isNaN(a) || a < 0 || a > 1
	) return null

	return (`rgba(${r},${g},${b},${a})`: RgbaColorType)
}

// eslint-disable-next-line import/group-exports
export type {
	RgbaColorType,
}

// eslint-disable-next-line import/group-exports
export {
	rgbaColorRed,
	rgbaColorGreen,
	rgbaColorBlue,
	createRgbaColor,
}
