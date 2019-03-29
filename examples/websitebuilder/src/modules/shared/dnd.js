// @flow strict

type DndIdleType = {| type: typeof dndTypeIdle |} // eslint-disable-line

const dndTypeIdle: 'idle' = 'idle'
const dndTypeProgress: 'progress' = 'progress'
const dndInitialState: DndIdleType = { type: dndTypeIdle }

export {
	dndTypeIdle,
	dndTypeProgress,
	dndInitialState,
}
