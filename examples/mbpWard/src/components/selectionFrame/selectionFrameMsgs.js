// @flow

import { createEvent } from '../../../../../src/epics'
import { type BoxType } from '../types'

const SelectionFrameSelectionCompleteEvent = createEvent<{| box: BoxType |}>('SELECTION_FRAME_SELECTION_COMPLETE')

export {
	SelectionFrameSelectionCompleteEvent,
}
