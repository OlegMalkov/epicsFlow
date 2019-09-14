// @flow strict

import { workspaceEpic } from './components/workspace/workspaceEpic'
import { userEpic } from './components/user/userEpic'
import { selectionFrameEpic } from './components/selectionFrame/selectionFrameEpic'
import { participantEditorEpic } from './components/participantEditor/participantEditorEpic'

export const mbpStoreConfig = {
	epics: {
		workspace: workspaceEpic,
		selectionFrame: selectionFrameEpic,
		user: userEpic,
		participantEditor: participantEditorEpic,
	},
	debug: Boolean(process.env.NODE_ENV !== 'test' || process.env.TRACE),
}
