// @flow
import { createEvent } from '../../../../../src/epics'

const workspaceScroll = createEvent<{| top: number |}>('WORKSPACE_SCROLL')

export {
	workspaceScroll,
}
