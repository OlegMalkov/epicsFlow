// @flow strict

import { makeEvent, createEffectManager } from '../epics'

type StateType = {| requestsByEpicVcet: { [vcet: string]: Request } |}
type ScopeType = {| resolvePromiseByEpicVcet: { [vcet: string]: () => void } |}
type RequestAnimationFrameEffectType = {| cmd: 'REQUEST' | 'CANCEL', type: typeof requestType |}

const animationFrame = makeEvent<{| dateNow: number |}>('ANIMATION_FRAME')
const requestType: 'request_animation_frame_effect' = 'request_animation_frame_effect'
const requestAnimationFrameEC = (): RequestAnimationFrameEffectType => ({ type: requestType, cmd: 'REQUEST' })
const cancelAnimationFrameEC = (): RequestAnimationFrameEffectType => ({	type: requestType, cmd: 'CANCEL' })

const requestAnimationFrameEM = createEffectManager<RequestAnimationFrameEffectType, StateType, ScopeType>({
	requestType,
	initialState: { requestsByEpicVcet: {} },
	initialScope: { resolvePromiseByEpicVcet: {} },
	onEffectRequest: ({ effect, requesterEpicVcet, state, scope, dispatch, R }) => {
		if (effect.cmd === 'REQUEST') {
			let rafId
			const promise = new Promise((resolve) => {
				const resolvePromise = () => {
					delete scope.resolvePromiseByEpicVcet[requesterEpicVcet]
					resolve()
				}

				rafId = window.requestAnimationFrame(() => {
					dispatch(animationFrame.create({ dateNow: Date.now() }), { targetEpicVcet: [requesterEpicVcet] })
					resolvePromise()
				})
				scope.resolvePromiseByEpicVcet[requesterEpicVcet] = resolvePromise
			})

			return R
				.withEffectPromise(promise)
				.mapState(() => ({
					...state,
					requestsByEpicVcet: {
						...state.requestsByEpicVcet,
						[requesterEpicVcet]: rafId,
					},
				}))
		} else if (effect.cmd === 'CANCEL') {
			window.cancelAnimationFrame(state.requestsByEpicVcet[requesterEpicVcet])
			scope.resolvePromiseByEpicVcet[requesterEpicVcet]()

			return R.mapState(() => ({
				...state,
				requestsByEpicVcet: {
					...state.requestsByEpicVcet,
					[requesterEpicVcet]: null,
				},
			}))
		}
		return R.doNothing
	},
})


export type { // eslint-disable-line import/group-exports
	RequestAnimationFrameEffectType,
}

export { // eslint-disable-line import/group-exports
	requestAnimationFrameEC,
	cancelAnimationFrameEC,
	animationFrame,
	requestAnimationFrameEM,
}
