// @flow strict

import { workspaceEpic } from './components/workspace/workspaceEpic'
import { userEpic } from './components/user/userEpic'

export const mbpStoreConfig = {
	epics: {
		workspace: workspaceEpic,
		user: userEpic,
	},
	debug: Boolean(process.env.NODE_ENV !== 'test' || process.env.TRACE),
}
