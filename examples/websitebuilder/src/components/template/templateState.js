// @flow strict

import { setPropDeepCompare } from '../../utils';

export opaque type TemplateState: {| width: * |} = {| width: number |}

export const 
    templateInitialState: TemplateState = { width: 940 },
    setTemplateWidth = setPropDeepCompare<TemplateState, *>('width')
