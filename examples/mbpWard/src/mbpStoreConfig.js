// @flow strict

import { workspaceEpic } from './components/workspace/workspaceEpic'
import { userEpic } from './components/user/userEpic'
import { selectionFrameEpic } from './components/selectionFrame/selectionFrameEpic'
import { participantEditorEpic } from './components/participantEditor/participantEditorEpic'
import { eventsListDialogEpic } from './components/eventsListDialog/eventsListDialogEpic'
import { eventDetailsDialogEpic } from './components/participantsListDialog/participantsListDialogEpic'
import { syncEpic } from './components/sync/syncEpic'

export const mbpStoreConfig = {
	epics: {
		workspace: workspaceEpic,
		selectionFrame: selectionFrameEpic,
		user: userEpic,
		participantEditor: participantEditorEpic,
		eventsListDialog: eventsListDialogEpic,
		participantsListDialog: eventDetailsDialogEpic,
		sync: syncEpic,
	},
	debug: Boolean(process.env.NODE_ENV !== 'test' || process.env.TRACE),
}
