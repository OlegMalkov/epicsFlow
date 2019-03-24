// @flow strict

import { makeACAC, makeEffectManager } from '../epics'

type StateType = {| requestsByEpicVat: { [vat: string]: Request } |}
type ScopeType = {| resolvePromiseByEpicVat: { [vat: string]: () => void } |}
type RequestAnimationFrameEffectType = {| cmd: 'REQUEST' | 'CANCEL', type: typeof requestType |}

const animationFrame = makeACAC<{| dateNow: number |}>('ANIMATION_FRAME')
const requestType: 'request_animation_frame_effect' = 'request_animation_frame_effect'
const requestAnimationFrameEC = (): RequestAnimationFrameEffectType => ({ type: requestType, cmd: 'REQUEST' })
const cancelAnimationFrameEC = (): RequestAnimationFrameEffectType => ({	type: requestType, cmd: 'CANCEL' })

const requestAnimationFrameEM = makeEffectManager<RequestAnimationFrameEffectType, StateType, ScopeType>({
	requestType,
	initialState: { requestsByEpicVat: {} },
	initialScope: { resolvePromiseByEpicVat: {} },
	onEffectRequest: ({ effect, requesterEpicVat, state, scope, dispatch, R }) => {
		if (effect.cmd === 'REQUEST') {
			let rafId
			const promise = new Promise((resolve) => {
				const resolvePromise = () => {
					delete scope.resolvePromiseByEpicVat[requesterEpicVat]
					resolve()
				}

				rafId = window.requestAnimationFrame(() => {
					dispatch(animationFrame.ac({ dateNow: Date.now() }), { targetEpicVats: [requesterEpicVat] })
					resolvePromise()
				})
				scope.resolvePromiseByEpicVat[requesterEpicVat] = resolvePromise
			})

			return R
				.withEffectPromise(promise)
				.updateState(() => ({
					...state,
					requestsByEpicVat: {
						...state.requestsByEpicVat,
						[requesterEpicVat]: rafId,
					},
				}))
		} else if (effect.cmd === 'CANCEL') {
			window.cancelAnimationFrame(state.requestsByEpicVat[requesterEpicVat])
			scope.resolvePromiseByEpicVat[requesterEpicVat]()

			return R.updateState(() => ({
				...state,
				requestsByEpicVat: {
					...state.requestsByEpicVat,
					[requesterEpicVat]: null,
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
