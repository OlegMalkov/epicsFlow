// @flow strict

export const
    dndTypeIdle: 'idle' = 'idle',
    dndTypeProgress: 'progress' = 'progress',
    dndInitialState = { type: dndTypeIdle }

export type DndIdle = {| type: typeof dndTypeIdle |}