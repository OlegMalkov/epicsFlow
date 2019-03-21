// @flow strict

type DndIdleType = {| type: typeof dndTypeIdle |}

const dndTypeIdle: 'idle' = 'idle'
const dndTypeProgress: 'progress' = 'progress'
const dndInitialState = { type: dndTypeIdle }

// eslint-disable-next-line import/group-exports
export type {
	DndIdleType,
}

// eslint-disable-next-line import/group-exports
export {
	dndTypeIdle,
	dndTypeProgress,
	dndInitialState,
}
