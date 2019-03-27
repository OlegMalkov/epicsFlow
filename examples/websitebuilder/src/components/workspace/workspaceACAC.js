// @flow
import { createACAC } from '../../../../../src/epics'

const workspaceScroll = createACAC<{| top: number |}>('WORKSPACE_SCROLL')

export {
	workspaceScroll,
}
