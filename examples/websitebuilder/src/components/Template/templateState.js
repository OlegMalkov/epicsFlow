// @flow strict

import { makeSetterOnAnyChangeDeepCompare } from '../../utils';

export opaque type TemplateState: {| width: * |} = {| width: number |}

export const 
    templateInitialState: TemplateState = { width: 940 },
    setTemplateWidth = makeSetterOnAnyChangeDeepCompare<TemplateState, *>('width')
