// @flow
import { createACAC } from '../../epics'

const workspaceScroll = createACAC<{| top: number |}>('WORKSPACE_SCROLL')

export {
	workspaceScroll,
}
