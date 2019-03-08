// @flow strict

import { makeSetter } from "../../utils";

export opaque type TemplateState: {| width: number |} = {| width: number |}

export const 
    templateInitialState: TemplateState = { width: 940 },
    setTemplateWidth = makeSetter<TemplateState, *>('width')
