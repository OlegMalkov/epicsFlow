// @flow strict

import { workspaceEpic } from './components/workspace/workspaceEpic'
import { userEpic } from './components/user/userEpic'
import { selectionFrameEpic } from './components/selectionFrame/selectionFrameEpic'

export const mbpStoreConfig = {
	epics: {
		workspace: workspaceEpic,
		selectionFrame: selectionFrameEpic,
		user: userEpic,
	},
	debug: Boolean(process.env.NODE_ENV !== 'test' || process.env.TRACE),
}
