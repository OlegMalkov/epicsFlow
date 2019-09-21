// @flow

import { createEvent, createSimpleEvent } from '../../../../../src/epics'

const EventListDialogEventRowPressedEvent = createEvent<{| index: number |}>('EVENTS_LIST_DIALOG_EVENT_ROW_CLICKED')
const EventListDialogFileNamesFetchedEvent = createEvent<{| fileNames: Array<string> |}>('EVENTS_LIST_DIALOG_FILENAMES_FETCHED')
const EventsListDialogCloseBtnPressedEvent = createSimpleEvent('EVENTS_LIST_DIALOG_CLOSE_BTN_PRESSED')


export {
	EventListDialogEventRowPressedEvent,
	EventListDialogFileNamesFetchedEvent,
	EventsListDialogCloseBtnPressedEvent,
}
