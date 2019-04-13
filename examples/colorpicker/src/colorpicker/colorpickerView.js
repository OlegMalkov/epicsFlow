// @flow strict

import React from 'react'
import { type ColorPickerStateType } from './colorPickerState'
import { type DispatchType } from '../../../../src/epics'
import {
	redChannelChangedEvent,
	greenChannelChangedEvent,
	blueChannelChangedEvent,
	rgbValueChangedEvent,
} from './colorpickerEvents'

const ChanelValuePicker = ({ value, onChange }) => <div>
	<input type="range" min="0" max={255} value={value} onChange={e => onChange(parseInt(e.target.value, 10))} />
	<span>{value.toString(16).padStart(2,'0')}</span>
</div>

const RgbValuePicker = ({ value, onChange }) => {
	const hex = `#${value.toString(16).padStart(6,'0')}`

	return <div>
		<input type="range" min="0" max={256 * 256 * 256 - 1} value={value} onChange={e => onChange(parseInt(e.target.value, 10))} />
		<span style={{ color: hex }}>{hex}</span>
	</div>
}

const maxRgbValue = 256 * 256 * 256 - 1
const toRGBNumber = rgb => (rgb.r * 256 * 256) + rgb.g * 256 + rgb.b

export const ColorPickerView = ({ state, dispatch }: {| state: ColorPickerStateType, dispatch: DispatchType |}) => (
	<div className="App">
		Red: <ChanelValuePicker value={state.rgbValue.r} onChange={value => dispatch(redChannelChangedEvent.create({ value }))} />
		Green: <ChanelValuePicker value={state.rgbValue.g} onChange={value => dispatch(greenChannelChangedEvent.create({ value }))} />
		Blue: <ChanelValuePicker value={state.rgbValue.b} onChange={value => dispatch(blueChannelChangedEvent.create({ value }))} />
		RGB: <RgbValuePicker max={maxRgbValue} value={toRGBNumber(state.rgbValue)} onChange={value => dispatch(rgbValueChangedEvent.create({ value }))} />
	</div>
)
