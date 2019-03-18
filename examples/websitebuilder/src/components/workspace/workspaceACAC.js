// @flow

import { wsbE } from "../../wsbE";

const { makeACAC } = wsbE

export const
    workspaceScroll = makeACAC<{| top: number |}>('WORKSPACE_SCROLL')