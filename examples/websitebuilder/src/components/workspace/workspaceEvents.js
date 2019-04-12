// @flow
import { makeEvent } from '../../../../../src/epics'

const workspaceScroll = makeEvent<{| top: number |}>('WORKSPACE_SCROLL')

export {
	workspaceScroll,
}
