// @flow strict

import { type Dimensions } from '../../types'
import { wsbE } from "../../wsbE";

const { makeACAC } = wsbE

export const
    browserDimensions = makeACAC<Dimensions>('BROWSER_DIMENSIONS')