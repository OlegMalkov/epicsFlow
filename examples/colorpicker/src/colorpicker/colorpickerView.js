// @flow strict

import React from 'react'
import { type ColorPickerStateType } from './colorPickerState'
import { type ChannelValue } from './rgbType'
import { type DispatchType } from '../../../../src/epics'
import {
	redChannelChangedEvent,
	greenChannelChangedEvent,
	blueChannelChangedEvent,
	rgbValueChangedEvent,
} from './colorpickerEvents'
import { channelToHex, rgbToHex } from './rgbType'

const ChanelValuePicker = ({ value, onChange }: {| value: ChannelValue, onChange: number => void |}) => <div>
	<input
		type="range"
		min="0"
		max="255"
		value={value}
		onChange={(e: SyntheticInputEvent<*>) => onChange(parseInt(e.target.value, 10))}
		style={{ width: 300 }}
	/>
	<span>{channelToHex(value)}</span>
</div>

const RgbValuePicker = ({ value, hex, onChange }: {| value: number, hex: string, onChange: number => void |}) => {
	return <div>
		<input
			type="range"
			min="0"
			max={256 * 3}
			value={value}
			onChange={(e: SyntheticInputEvent<*>) => onChange(parseInt(e.target.value, 10))}
			style={{ width: 900 }}
		/>
		<span style={{ color: hex }}>{hex}</span>
	</div>
}

export const ColorPickerView = ({ state, dispatch }: {| state: ColorPickerStateType, dispatch: DispatchType |}) => (
	<div className="App">
		Red: <ChanelValuePicker value={state.rgbValue.r} onChange={value => dispatch(redChannelChangedEvent.create({ value }))} />
		Green: <ChanelValuePicker value={state.rgbValue.g} onChange={value => dispatch(greenChannelChangedEvent.create({ value }))} />
		Blue: <ChanelValuePicker value={state.rgbValue.b} onChange={value => dispatch(blueChannelChangedEvent.create({ value }))} />
		RGB: <RgbValuePicker
			value={state.rgbValuePickerValue}
			hex={rgbToHex(state.rgbValue)}
			onChange={value => dispatch(rgbValueChangedEvent.create({ value }))}
		/>
	</div>
)
