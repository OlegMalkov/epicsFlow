// @flow
import { makeActionCreatorAndCondition } from '../../../../../src/epics'

const workspaceScroll = makeActionCreatorAndCondition<{| top: number |}>('WORKSPACE_SCROLL')

export {
	workspaceScroll,
}
