// @flow strict
import { makeEvent } from '../../../../src/epics'

const makeChannelChangedEvent = (chanelName: string) =>
	makeEvent<{| value: number |}>(`COLOR_PICKER_${chanelName}_CHANNEL_CHANGED`)

const redChannelChangedEvent = makeChannelChangedEvent('COLOR_PICKER_RED_CHANGED')
const greenChannelChangedEvent = makeChannelChangedEvent('COLOR_PICKER_GREEN_CHANGED')
const blueChannelChangedEvent = makeChannelChangedEvent('COLOR_PICKER_BLUE_CHANGED')
const rgbValueChangedEvent = makeEvent<{| value: number |}>('COLOR_PICKER_RGB_CHANGED')

export {
	redChannelChangedEvent,
	greenChannelChangedEvent,
	blueChannelChangedEvent,
	rgbValueChangedEvent,
}
