// @flow strict

import { type ResizeHandles } from '../Component/componentState'
import { wsbE } from "../../wsbE";
import { componentCondition } from '../Component/componentACAC';
import { makeSetter } from '../../utils';

const { makeUpdater, makeEpic } = wsbE

type ResizeDecorationsState = {|
    activeHandleKey: $Keys<ResizeHandles> | null,
    handles: ResizeHandles | null
|}

const setHandles = makeSetter<ResizeDecorationsState, *>('handles')

export const
    resizeDecorationsEpic = makeEpic<ResizeDecorationsState, *>({ 
        vat: 'RESIZE_DECORATIONS',
        initialState: { activeHandleKey: null, handles: null },
        updaters: {
            syncFromComponent: makeUpdater({
                conditions: { resizeHandles: componentCondition.withSelectorKey('handles').withSelectorKey('resize') },
                reducer: ({ values: { resizeHandles }, R }) => R.updateState(setHandles(resizeHandles))
            })
        }
    })