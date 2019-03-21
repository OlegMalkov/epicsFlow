// @flow
import { makeACAC } from '../../epics'

const workspaceScroll = makeACAC<{| top: number |}>('WORKSPACE_SCROLL')

export {
	workspaceScroll,
}
